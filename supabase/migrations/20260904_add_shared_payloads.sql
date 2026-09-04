create table if not exists public.shared_payloads (
  share_id text primary key,
  type text not null check (type in ('song', 'version', 'setlist')),
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz not null default (timezone('utc'::text, now()) + interval '180 days')
);

create index if not exists idx_shared_payloads_created_at
  on public.shared_payloads(created_at);

create index if not exists idx_shared_payloads_expires_at
  on public.shared_payloads(expires_at);

alter table public.shared_payloads enable row level security;

drop policy if exists "Allow public inserts" on public.shared_payloads;
drop policy if exists "Allow public reads" on public.shared_payloads;

create policy "Allow public inserts"
on public.shared_payloads
for insert
to anon, authenticated
with check (octet_length(payload::text) < 5242880);

create policy "Allow public reads"
on public.shared_payloads
for select
to anon, authenticated
using (expires_at > timezone('utc'::text, now()));

grant select, insert on public.shared_payloads to anon, authenticated;