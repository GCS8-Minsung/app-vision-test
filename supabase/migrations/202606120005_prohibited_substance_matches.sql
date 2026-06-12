create table if not exists public.prohibited_substances (
  id text primary key,
  primary_name text not null,
  aliases text[] not null default '{}',
  korean_names text[] not null default '{}',
  wada_class text not null,
  scope text not null check (scope in ('all_times', 'in_competition', 'specific_sports', 'conditional', 'not_listed_or_monitoring')),
  risk_level text not null check (risk_level in ('confirmed_candidate', 'needs_check', 'high_risk_candidate', 'unknown')),
  reason_template text not null,
  action_template text not null,
  source_ids text[] not null default '{}',
  database_version text not null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medication_substance_matches (
  id uuid primary key default gen_random_uuid(),
  medication_product_id uuid not null references public.medication_products(id) on delete cascade,
  prohibited_substance_id text not null references public.prohibited_substances(id) on delete restrict,
  item_name_snapshot text not null,
  ingredient_name text not null,
  ingredient_dosage text,
  normalized_ingredient_name text not null,
  matched_term text not null,
  matched_by text not null check (matched_by in ('ingredient', 'product_alias', 'fallback_rule')),
  product_alias text,
  substance_name text not null,
  wada_class text not null,
  scope text not null,
  risk_level text not null check (risk_level in ('confirmed_candidate', 'needs_check', 'high_risk_candidate', 'unknown')),
  source_names text[] not null default '{}',
  database_version text not null,
  match_source text not null default 'clean_check_wada_kada_seed',
  raw jsonb not null default '{}'::jsonb,
  matched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (medication_product_id, normalized_ingredient_name, prohibited_substance_id, match_source)
);

create index if not exists prohibited_substances_primary_name_idx on public.prohibited_substances(primary_name);
create index if not exists prohibited_substances_risk_level_idx on public.prohibited_substances(risk_level);
create index if not exists prohibited_substances_aliases_gin_idx on public.prohibited_substances using gin(aliases);
create index if not exists prohibited_substances_korean_names_gin_idx on public.prohibited_substances using gin(korean_names);
create index if not exists medication_substance_matches_medication_idx on public.medication_substance_matches(medication_product_id);
create index if not exists medication_substance_matches_substance_idx on public.medication_substance_matches(prohibited_substance_id);
create index if not exists medication_substance_matches_risk_idx on public.medication_substance_matches(risk_level);
create index if not exists medication_substance_matches_database_version_idx on public.medication_substance_matches(database_version);

drop trigger if exists prohibited_substances_set_updated_at on public.prohibited_substances;
create trigger prohibited_substances_set_updated_at
before update on public.prohibited_substances
for each row execute function public.set_updated_at();

drop trigger if exists medication_substance_matches_set_updated_at on public.medication_substance_matches;
create trigger medication_substance_matches_set_updated_at
before update on public.medication_substance_matches
for each row execute function public.set_updated_at();

alter table public.prohibited_substances enable row level security;
alter table public.medication_substance_matches enable row level security;

drop policy if exists prohibited_substances_public_read on public.prohibited_substances;
create policy prohibited_substances_public_read on public.prohibited_substances
for select to anon, authenticated
using (true);

drop policy if exists medication_substance_matches_public_read on public.medication_substance_matches;
create policy medication_substance_matches_public_read on public.medication_substance_matches
for select to anon, authenticated
using (true);

grant select on table public.prohibited_substances to anon, authenticated;
grant select on table public.medication_substance_matches to anon, authenticated;
grant all on table public.prohibited_substances to service_role;
grant all on table public.medication_substance_matches to service_role;
