import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const encoder = new TextEncoder();
const ALLOWED_FIELDS = new Set(['title', 'language', 'original_key', 'chords', 'genre', 'is_active']);

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
    const authorization = request.headers.get('Authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    const { song_id: songId, updates } = await request.json();
    if (!token || !Number.isInteger(songId) || !updates || typeof updates !== 'object') {
      return json({ error: 'Unauthorized' }, 401);
    }

    const invalidField = Object.keys(updates).find((field) => !ALLOWED_FIELDS.has(field));
    if (invalidField) return json({ error: `Field not allowed: ${invalidField}` }, 400);

    const admin = getAdminClient();
    const tokenHash = await sha256(token);
    const { data: session } = await admin
      .from('admin_sessions')
      .select('device_id')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!session) return json({ error: 'Unauthorized' }, 401);

    const { error } = await admin
      .from('songs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', songId);
    if (error) return json({ error: 'Unable to update song' }, 500);

    await admin
      .from('admin_devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', session.device_id)
      .is('revoked_at', null);

    return json({ updated: true });
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
});
