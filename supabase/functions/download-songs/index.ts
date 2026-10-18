import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function verifyTurnstile(token: string, secretKey: string, remoteIp?: string): Promise<boolean> {
  if (!token) return false;
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await res.json();
    return outcome.success === true;
  } catch (err) {
    console.error('[Turnstile Verify Error]:', err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { turnstile_token, range_start = 0, batch_size = 100 } = await req.json();

    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!turnstileSecret) {
      console.error('Missing TURNSTILE_SECRET_KEY in Edge Function secrets');
      return json({ error: 'Server configuration error' }, 500);
    }

    // 1. Verify Turnstile token
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || undefined;
    const isHuman = await verifyTurnstile(turnstile_token, turnstileSecret, clientIp);

    if (!isHuman) {
      console.warn(`[Blocked Bot] Invalid or missing Turnstile token from IP: ${clientIp}`);
      return json({ error: 'Turnstile verification failed. Bots not allowed.' }, 403);
    }

    // 2. Verified human: query songs using service_role safely
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Limit maximum batch size to prevent server memory bloat
    const safeBatchSize = Math.min(Math.max(1, batch_size), 200);
    const safeRangeStart = Math.max(0, range_start);

    // Get exact count first if this is the start
    let totalCount: number | null = null;
    if (safeRangeStart === 0) {
      const { count } = await adminClient
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      totalCount = count;
    }

    const { data: songs, error } = await adminClient
      .from('songs')
      .select('id, song_number, title, artist, composer, language, original_key, capo, bpm, time_signature, lyrics, chords, is_active, updated_at, genre')
      .eq('is_active', true)
      .range(safeRangeStart, safeRangeStart + safeBatchSize - 1)
      .order('id', { ascending: true });

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({
      songs: songs || [],
      totalCount,
      range_start: safeRangeStart,
      hasMore: (songs?.length || 0) === safeBatchSize,
    });
  } catch (err: any) {
    return json({ error: err.message || 'Internal server error' }, 500);
  }
});
