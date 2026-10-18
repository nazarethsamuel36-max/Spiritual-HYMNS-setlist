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
    const { turnstile_token, type, slug, payload } = await req.json();

    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!turnstileSecret) {
      console.error('Missing TURNSTILE_SECRET_KEY in Edge Function secrets');
      return json({ error: 'Server configuration error' }, 500);
    }

    // 1. Verify Turnstile token
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || undefined;
    const isHuman = await verifyTurnstile(turnstile_token, turnstileSecret, clientIp);

    if (!isHuman) {
      console.warn(`[Blocked Bot] Invalid or missing Turnstile token for share link from IP: ${clientIp}`);
      return json({ error: 'Turnstile verification failed. Bots not allowed.' }, 403);
    }

    // 2. Verified human: execute create_shared_payload with service_role client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const result = await adminClient.rpc('create_shared_payload', {
      p_type: type,
      p_slug: slug,
      p_payload: payload,
    });

    if (result.error) {
      return json({ error: result.error.message }, 400);
    }

    const row = Array.isArray(result.data) ? result.data[0] : result.data;
    return json({
      share_id: row?.share_id,
      slug: row?.slug ?? slug,
    });
  } catch (err: any) {
    return json({ error: err.message || 'Internal server error' }, 500);
  }
});
