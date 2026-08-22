import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { bootstrap_secret: suppliedSecret, device_id: deviceId, device_name: deviceName, public_key: publicKey } = await request.json();
    const expectedSecret = Deno.env.get('ADMIN_BOOTSTRAP_SECRET');
    if (!expectedSecret || suppliedSecret !== expectedSecret) return json({ error: 'Unauthorized' }, 401);
    if (typeof deviceId !== 'string' || typeof deviceName !== 'string' || !publicKey) return json({ error: 'Invalid request' }, 400);

    const admin = getAdminClient();
    const { count, error: countError } = await admin
      .from('admin_devices')
      .select('id', { count: 'exact', head: true })
      .is('revoked_at', null);
    if (countError) return json({ error: 'Unable to check device capacity' }, 500);
    if ((count ?? 0) > 0) return json({ error: 'Bootstrap already completed' }, 409);

    const { data, error } = await admin
      .from('admin_devices')
      .insert({ id: deviceId, device_name: deviceName.trim(), public_key: JSON.stringify(publicKey) })
      .select('id, device_name, registered_at')
      .single();
    if (error) return json({ error: 'Unable to register device' }, 500);
    return json({ registered: true, device: data });
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
});
