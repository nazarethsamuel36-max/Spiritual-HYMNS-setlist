-- 1. Create a migration to harden public.create_shared_payload:
-- - Hard cap individual payload size to 50KB (down from 200KB)
-- - Hard cap total rows in shared_payloads to 10,000 (prevents storage quota exhaustion)
-- - Shorten default retention to 90 days (from 180 days)
-- - Safe search path locking

CREATE OR REPLACE FUNCTION public.create_shared_payload(
  p_type    text,
  p_slug    text,
  p_payload jsonb
)
RETURNS table (share_id text, slug text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_share_id text;
  v_count    int;
BEGIN
  -- 1. Guard against storage exhaustion: ceiling of 10,000 active share records
  SELECT count(*) INTO v_count FROM public.shared_payloads;
  IF v_count >= 10000 THEN
    RAISE EXCEPTION 'sharing storage limit reached';
  END IF;

  -- 2. Validate share type
  IF p_type NOT IN ('song', 'version', 'setlist') THEN
    RAISE EXCEPTION 'invalid share type';
  END IF;

  -- 3. Hard cap individual payload size: 50KB (plenty for any song/setlist package)
  IF pg_column_size(p_payload) > 50000 THEN
    RAISE EXCEPTION 'payload too large (max 50KB)';
  END IF;

  -- 4. Generate URL-safe random share_id
  v_share_id := replace(replace(replace(
    encode(extensions.gen_random_bytes(9), 'base64'), '/', '_'), '+', '-'), '=', '');

  -- 5. Insert with 90-day expiry
  INSERT INTO public.shared_payloads (share_id, slug, type, payload, created_at, expires_at)
  VALUES (v_share_id, p_slug, p_type, p_payload, now(), now() + interval '90 days');

  RETURN QUERY
  SELECT v_share_id, p_slug;
END;
$$;

-- Ensure execution grants
REVOKE EXECUTE ON FUNCTION public.create_shared_payload(text, text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_shared_payload(text, text, jsonb) TO anon, authenticated, service_role;
