import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SESSION_TTL_SECONDS = 30 * 60;
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

function decodeBase64(value: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return bytes.buffer;
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
    const {
      device_id: deviceId,
      challenge_id: challengeId,
      challenge,
      signature
    } = await request.json();

    if (![deviceId, challengeId, challenge, signature].every((value) => typeof value === 'string')) {
      return json({ authenticated: false }, 401);
    }

    const admin = getAdminClient();
    const { data: device } = await admin
      .from('admin_devices')
      .select('id, public_key')
      .eq('id', deviceId)
      .is('revoked_at', null)
      .maybeSingle();

    const { data: challengeRecord } = await admin
      .from('admin_challenges')
      .select('id, device_id, challenge_hash, expires_at, used_at')
      .eq('id', challengeId)
      .eq('device_id', deviceId)
      .maybeSingle();

    if (!device || !challengeRecord || challengeRecord.used_at || new Date(challengeRecord.expires_at).getTime() <= Date.now()) {
      return json({ authenticated: false }, 401);
    }

    if (await sha256(challenge) !== challengeRecord.challenge_hash) {
      return json({ authenticated: false }, 401);
    }

    let publicKey: JsonWebKey;
    try {
      publicKey = typeof device.public_key === 'string' ? JSON.parse(device.public_key) : device.public_key;
    } catch {
      return json({ authenticated: false }, 401);
    }

    const verificationKey = await crypto.subtle.importKey(
      'jwk',
      publicKey,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      verificationKey,
      decodeBase64(signature),
      encoder.encode(challenge)
    );

    if (!valid) return json({ authenticated: false }, 401);

    const { data: consumedChallenge, error: consumeError } = await admin
      .rpc('consume_admin_challenge', { challenge_id: challengeId });

    if (consumeError || consumedChallenge !== true) return json({ authenticated: false }, 401);

    const token = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await sha256(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    const { error: sessionError } = await admin
      .from('admin_sessions')
      .insert({ device_id: deviceId, token_hash: tokenHash, expires_at: expiresAt });

    if (sessionError) return json({ authenticated: false }, 500);

    await admin
      .from('admin_devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', deviceId)
      .is('revoked_at', null);

    return json({ authenticated: true, session_token: token, expires_at: expiresAt });
  } catch {
    return json({ authenticated: false }, 401);
  }
});
