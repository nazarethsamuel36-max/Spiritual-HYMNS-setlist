create table if not exists public.shared_payloads (
  share_id text primary key,
  slug text not null unique,
  type text not null check (type in ('song', 'version', 'setlist')),
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz not null default (timezone('utc'::text, now()) + interval '180 days')
);

create index if not exists idx_shared_payloads_created_at
  on public.shared_payloads(created_at);

create index if not exists idx_shared_payloads_expires_at
  on public.shared_payloads(expires_at);

create index if not exists idx_shared_payloads_slug
  on public.shared_payloads(slug);

alter table public.shared_payloads enable row level security;

drop policy if exists "Allow public inserts" on public.shared_payloads;
drop policy if exists "Allow public reads" on public.shared_payloads;
revoke all on public.shared_payloads from anon;
revoke all on public.shared_payloads from authenticated;

create or replace function public.get_shared_payload(lookup_slug text)
returns table (type text, payload jsonb)
language sql
security definer
set search_path = public
as $$
  select type, payload
  from public.shared_payloads
  where (slug = lookup_slug or share_id = lookup_slug)
    and (expires_at is null or expires_at > now())
  limit 1;
$$;

grant execute on function public.get_shared_payload(text) to anon;
grant execute on function public.get_shared_payload(text) to authenticated;

create or replace function public.create_shared_payload(
  p_type text,
  p_slug text,
  p_payload jsonb
)
returns table (share_id text, slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share_id text;
begin
  if p_type not in ('song', 'version', 'setlist') then
    raise exception 'invalid share type';
  end if;

  if pg_column_size(p_payload) > 200000 then
    raise exception 'payload too large';
  end if;

  v_share_id := replace(replace(replace(
    encode(gen_random_bytes(9), 'base64'), '/', '_'), '+', '-'), '=', '');

  insert into public.shared_payloads (share_id, slug, type, payload, created_at, expires_at)
  values (v_share_id, p_slug, p_type, p_payload, now(), now() + interval '180 days');

  return query
  select v_share_id, p_slug;
end;
$$;

grant execute on function public.create_shared_payload(text, text, jsonb) to anon;
grant execute on function public.create_shared_payload(text, text, jsonb) to authenticated;