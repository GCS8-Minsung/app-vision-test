create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.athlete_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birth_date date not null,
  phone text,
  sport text not null,
  team_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_type text not null check (upload_type in ('medicine_package', 'prescription', 'ingredient_label')),
  image_storage_path text,
  image_hash text,
  file_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.extracted_items (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  ingredient_name text,
  dosage text,
  hospital_name text,
  condition_name text,
  medication_product_id text,
  efficacy text,
  interaction_warnings text,
  side_effects text,
  lookup_source_name text,
  lookup_checked_at timestamptz,
  user_confirmed boolean not null default false,
  ocr_confidence jsonb,
  user_verified_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.extracted_substances (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.extracted_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_name text not null,
  dosage text,
  source_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_checks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.extracted_items(id) on delete cascade,
  substance_id uuid references public.extracted_substances(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  risk_level text not null check (risk_level in ('confirmed_candidate', 'needs_check', 'high_risk_candidate', 'unknown')),
  risk_reason text not null,
  recommended_action text not null,
  database_match jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.intake_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.extracted_items(id) on delete cascade,
  intake_status text not null check (intake_status in ('not_taken', 'taken', 'planned')),
  is_competition_period boolean not null default false,
  intake_date date not null,
  intake_time time not null,
  dosage text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.medication_products (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'drb_easy_drug',
  source_item_name text,
  item_name text not null,
  normalized_item_name text not null,
  aliases text[] not null default '{}',
  ingredients jsonb not null default '[]'::jsonb,
  dosage text,
  form text,
  efficacy text,
  interaction_warnings text,
  side_effects text,
  source_names text[] not null default array['의약품안전나라 e약은요', '공공데이터포털']::text[],
  raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, normalized_item_name)
);

create index if not exists athlete_profiles_user_id_idx on public.athlete_profiles(user_id);
create index if not exists uploads_user_id_created_at_idx on public.uploads(user_id, created_at desc);
create index if not exists extracted_items_user_id_created_at_idx on public.extracted_items(user_id, created_at desc);
create index if not exists extracted_substances_item_id_idx on public.extracted_substances(item_id);
create index if not exists risk_checks_item_id_idx on public.risk_checks(item_id);
create index if not exists intake_logs_user_id_date_idx on public.intake_logs(user_id, intake_date desc, intake_time desc);
create index if not exists medication_products_normalized_item_name_idx on public.medication_products(normalized_item_name);
create index if not exists medication_products_raw_gin_idx on public.medication_products using gin(raw);

drop trigger if exists athlete_profiles_set_updated_at on public.athlete_profiles;
create trigger athlete_profiles_set_updated_at
before update on public.athlete_profiles
for each row execute function public.set_updated_at();

drop trigger if exists medication_products_set_updated_at on public.medication_products;
create trigger medication_products_set_updated_at
before update on public.medication_products
for each row execute function public.set_updated_at();

alter table public.athlete_profiles enable row level security;
alter table public.uploads enable row level security;
alter table public.extracted_items enable row level security;
alter table public.extracted_substances enable row level security;
alter table public.risk_checks enable row level security;
alter table public.intake_logs enable row level security;
alter table public.medication_products enable row level security;

drop policy if exists athlete_profiles_owner_all on public.athlete_profiles;
create policy athlete_profiles_owner_all on public.athlete_profiles
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists uploads_owner_all on public.uploads;
create policy uploads_owner_all on public.uploads
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists extracted_items_owner_all on public.extracted_items;
create policy extracted_items_owner_all on public.extracted_items
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists extracted_substances_owner_all on public.extracted_substances;
create policy extracted_substances_owner_all on public.extracted_substances
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists risk_checks_owner_all on public.risk_checks;
create policy risk_checks_owner_all on public.risk_checks
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists intake_logs_owner_all on public.intake_logs;
create policy intake_logs_owner_all on public.intake_logs
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists medication_products_public_read on public.medication_products;
create policy medication_products_public_read on public.medication_products
for select to anon, authenticated
using (true);
