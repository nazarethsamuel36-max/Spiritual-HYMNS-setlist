-- Allow authenticated Supabase Auth users (admin) to read, insert, and update songs
GRANT SELECT, INSERT, UPDATE ON public.songs TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can insert songs" ON public.songs;
CREATE POLICY "Authenticated users can insert songs"
  ON public.songs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update songs" ON public.songs;
CREATE POLICY "Authenticated users can update songs"
  ON public.songs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
