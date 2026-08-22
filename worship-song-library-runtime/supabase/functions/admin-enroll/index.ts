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

async function getSession(admin: ReturnType<typeof getAdminClient>, request: Request) {
  const authorization = request.headers.get('Authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;

  const { data } = await admin
    .from('admin_sessions')
    .select('device_id')
    .eq('token_hash', await sha256(token))
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  return data;
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
    const session = await getSession(admin, request);
    if (!session) return json({ error: 'Unauthorized' }, 401);

    const { action, token, request_id: requestId, device_id: deviceId, device_name: deviceName, public_key: publicKey } = await request.json();

    if (action === 'create') {
      const rawToken = crypto.randomUUID() + crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { data, error } = await admin
        .from('admin_enrollment_requests')
        .insert({ token_hash: await sha256(rawToken), created_by_device_id: session.device_id, expires_at: expiresAt })
        .select('id, expires_at')
        .single();
      if (error || !data) return json({ error: 'Unable to create enrollment link' }, 500);
      return json({ enrollment_token: rawToken, request_id: data.id, expires_at: data.expires_at });
    }

    if (action === 'accept') {
      if (typeof token !== 'string' || typeof deviceId !== 'string' || typeof deviceName !== 'string' || !publicKey) {
        return json({ error: 'Invalid request' }, 400);
      }
      const { data: enrollment } = await admin
        .from('admin_enrollment_requests')
        .select('id, expires_at, accepted_at, approved_at, rejected_at')
        .eq('token_hash', await sha256(token))
        .maybeSingle();
      if (!enrollment || enrollment.accepted_at || enrollment.approved_at || enrollment.rejected_at || new Date(enrollment.expires_at).getTime() <= Date.now()) {
        return json({ error: 'Enrollment link invalid or expired' }, 400);
      }
      const { error } = await admin
        .from('admin_enrollment_requests')
        .update({ new_device_id: deviceId, device_name: deviceName.trim(), public_key: JSON.stringify(publicKey), accepted_at: new Date().toISOString() })
        .eq('id', enrollment.id)
        .is('accepted_at', null);
      if (error) return json({ error: 'Unable to accept enrollment' }, 500);
      return json({ accepted: true, request_id: enrollment.id });
    }

    if (action === 'approve' || action === 'reject') {
      if (typeof requestId !== 'string') return json({ error: 'Invalid request' }, 400);
      const { data: enrollment } = await admin
        .from('admin_enrollment_requests')
        .select('id, created_by_device_id, new_device_id, device_name, public_key, expires_at, accepted_at, approved_at, rejected_at')
        .eq('id', requestId)
        .maybeSingle();
      if (!enrollment || enrollment.created_by_device_id !== session.device_id || !enrollment.accepted_at || enrollment.approved_at || enrollment.rejected_at || new Date(enrollment.expires_at).getTime() <= Date.now()) {
        return json({ error: 'Enrollment request invalid or expired' }, 400);
      }
      if (action === 'reject') {
        await admin.from('admin_enrollment_requests').update({ rejected_at: new Date().toISOString() }).eq('id', requestId);
        return json({ rejected: true });
      }
      const { error: insertError } = await admin.from('admin_devices').insert({
        id: enrollment.new_device_id,
        device_name: enrollment.device_name,
        public_key: enrollment.public_key
      });
      if (insertError) return json({ error: 'Unable to register device' }, 409);
      await admin.from('admin_enrollment_requests').update({ approved_at: new Date().toISOString() }).eq('id', requestId);
      return json({ approved: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
});
