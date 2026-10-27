-- 1. Ensure RLS is active on public.songs
alter table public.songs enable row level security;

-- 2. Drop any existing broad public read/write policies on public.songs
drop policy if exists "Allow public read" on public.songs;
drop policy if exists "Enable read access for all users" on public.songs;
drop policy if exists "Allow public reads" on public.songs;
drop policy if exists "Public songs are viewable by everyone" on public.songs;
drop policy if exists "Allow public insert" on public.songs;
drop policy if exists "Allow public update" on public.songs;
drop policy if exists "Allow public delete" on public.songs;

-- 3. Revoke direct SELECT and mutation permissions on public.songs from anon role
revoke select, insert, update, delete on public.songs from anon;

-- 4. Retain full access for service_role (used by export scripts and admin Edge Functions)
grant all on public.songs to service_role;
grant select on public.songs to authenticated;
