import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CHALLENGE_TTL_SECONDS = 60;
const encoder = new TextEncoder();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }
  });
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }
  });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { device_id: deviceId } = await request.json();
    if (typeof deviceId !== 'string') return json({ error: 'Unauthenticated' }, 401);

    const admin = getAdminClient();
    const { data: device, error: deviceError } = await admin
      .from('admin_devices')
      .select('id')
      .eq('id', deviceId)
      .is('revoked_at', null)
      .maybeSingle();

    if (deviceError || !device) return json({ error: 'Unauthenticated' }, 401);

    const challenge = crypto.randomUUID() + crypto.randomUUID();
    const challengeHash = await sha256(challenge);
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString();
    const { data: stored, error: insertError } = await admin
      .from('admin_challenges')
      .insert({ device_id: device.id, challenge_hash: challengeHash, expires_at: expiresAt })
      .select('id, expires_at')
      .single();

    if (insertError || !stored) return json({ error: 'Unable to create challenge' }, 500);

    return json({ challenge_id: stored.id, challenge, expires_at: stored.expires_at });
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
});
