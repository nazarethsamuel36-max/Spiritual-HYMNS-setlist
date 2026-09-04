create extension if not exists pgcrypto;

create table if not exists public.admin_devices (
  id uuid primary key,
  device_name text not null,
  public_key text not null unique,
  registered_at timestamptz not null default now(),
  last_seen timestamptz,
  revoked_at timestamptz
);

alter table public.admin_devices enable row level security;
revoke all on public.admin_devices from anon, authenticated;

create index if not exists admin_devices_active_idx
  on public.admin_devices (revoked_at)
  where revoked_at is null;

create or replace function public.enforce_admin_device_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.revoked_at is null then
    perform pg_advisory_xact_lock(hashtext('admin_devices_active_limit'));
    if (select count(*) from public.admin_devices where revoked_at is null and id <> new.id) >= 4 then
      raise exception 'Maximum of 4 active admin devices reached';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists admin_devices_limit_trigger on public.admin_devices;
create trigger admin_devices_limit_trigger
before insert or update of revoked_at on public.admin_devices
for each row execute function public.enforce_admin_device_limit();

revoke execute on function public.enforce_admin_device_limit() from public, anon, authenticated;
grant execute on function public.enforce_admin_device_limit() to service_role;

create table if not exists public.admin_challenges (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.admin_devices(id) on delete cascade,
  challenge_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_challenges_device_idx
  on public.admin_challenges (device_id, expires_at);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.admin_devices(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_active_idx
  on public.admin_sessions (token_hash, expires_at)
  where revoked_at is null;

alter table public.admin_challenges enable row level security;
alter table public.admin_sessions enable row level security;

revoke all on public.admin_challenges from anon, authenticated;
revoke all on public.admin_sessions from anon, authenticated;

create table if not exists public.admin_enrollment_requests (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_by_device_id uuid not null references public.admin_devices(id) on delete cascade,
  new_device_id uuid,
  device_name text,
  public_key text,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_enrollment_requests enable row level security;
revoke all on public.admin_enrollment_requests from anon, authenticated;

create or replace function public.purge_expired_admin_auth_data()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_challenges
  where expires_at < now() - interval '1 hour';

  delete from public.admin_sessions
  where expires_at < now() - interval '1 day'
     or revoked_at < now() - interval '1 day';
$$;

revoke execute on function public.purge_expired_admin_auth_data() from public, anon, authenticated;
grant execute on function public.purge_expired_admin_auth_data() to service_role;

create or replace function public.consume_admin_challenge(challenge_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.admin_challenges
  set used_at = now()
  where id = challenge_id
    and used_at is null
    and expires_at > now()
  returning true;
$$;

revoke execute on function public.consume_admin_challenge(uuid) from public, anon, authenticated;
grant execute on function public.consume_admin_challenge(uuid) to service_role;
