-- ==============================================================================
-- Lockdown public.songs: Prevent anonymous scraping & direct database reads
-- Only service_role (used by scripts/export-static-library.mjs) and authenticated
-- admin users retain access.
-- ==============================================================================

-- 1. Ensure RLS is active on public.songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- 2. Drop broad public read policies
DROP POLICY IF EXISTS "Allow public reads" ON public.songs;
DROP POLICY IF EXISTS "Allow public read" ON public.songs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.songs;
DROP POLICY IF EXISTS "Public songs are viewable by everyone" ON public.songs;

-- 3. Revoke direct SELECT, INSERT, UPDATE, DELETE permissions from anon role
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.songs FROM anon;

-- 4. Grant full access to service_role (for export script) and authenticated (for admin)
GRANT ALL ON public.songs TO service_role;
GRANT SELECT ON public.songs TO authenticated;
