import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const TARGET_REPOSITORIES = [
  { owner: 'nazarethsamuel36-max', repo: 'Spiritual-HYMNS-setlist' },
  { owner: 'nazarethsamuel36-max', repo: 'LyricsDockBBF' },
];

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const githubPat = Deno.env.get('GITHUB_PAT');
    if (!githubPat) {
      console.error('Missing GITHUB_PAT secret');
      return new Response(JSON.stringify({ error: 'GITHUB_PAT secret not configured in Supabase' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let payload: any = {};
    if (req.method === 'POST') {
      try {
        payload = await req.json();
      } catch {
        payload = {};
      }
    }

    console.log(`Triggering GitHub dispatch for ${TARGET_REPOSITORIES.length} repositories...`);

    const results = await Promise.all(
      TARGET_REPOSITORIES.map(async ({ owner, repo }) => {
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github+json',
              'Authorization': `Bearer ${githubPat}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Supabase-Webhook',
            },
            body: JSON.stringify({
              event_type: 'supabase_song_update',
              client_payload: {
                table: payload.table ?? 'songs',
                type: payload.type ?? 'MANUAL_OR_WEBHOOK',
                timestamp: new Date().toISOString(),
              },
            }),
          });
          return { repo, ok: res.ok, status: res.status };
        } catch (err: any) {
          return { repo, ok: false, error: err.message };
        }
      })
    );

    console.log('Dispatch results:', JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Unhandled error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
