-- Restore public read access on public.songs for the original live setup
alter table public.songs enable row level security;

drop policy if exists "Allow public reads" on public.songs;
create policy "Allow public reads" on public.songs for select using (true);

grant select on public.songs to anon, authenticated;
