import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const admin = getAdminClient();
    const authorization = request.headers.get('Authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) return json({ error: 'Unauthorized' }, 401);

    const { data: session } = await admin
      .from('admin_sessions')
      .select('device_id')
      .eq('token_hash', await sha256(token))
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!session) return json({ error: 'Unauthorized' }, 401);

    const { action, device_id: deviceId } = await request.json();
    if (action === 'list') {
      const { data, error } = await admin
        .from('admin_devices')
        .select('id, device_name, registered_at, last_seen, revoked_at')
        .order('registered_at', { ascending: true });
      if (error) return json({ error: 'Unable to list devices' }, 500);
      return json({ devices: data ?? [] });
    }

    if (action === 'revoke' && typeof deviceId === 'string' && deviceId !== session.device_id) {
      const { error } = await admin
        .from('admin_devices')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', deviceId)
        .is('revoked_at', null);
      if (error) return json({ error: 'Unable to revoke device' }, 500);
      await admin.from('admin_sessions').update({ revoked_at: new Date().toISOString() }).eq('device_id', deviceId).is('revoked_at', null);
      return json({ revoked: true });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
});
