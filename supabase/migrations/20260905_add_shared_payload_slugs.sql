alter table public.shared_payloads
  add column if not exists slug text;

create unique index if not exists idx_shared_payloads_slug
  on public.shared_payloads(slug)
  where slug is not null;