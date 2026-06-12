create table if not exists public.app_records (
  record_type text not null,
  record_id text not null,
  user_id text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (record_type, record_id),
  check (record_type in (
    'profile',
    'upload',
    'extracted_item',
    'extracted_substance',
    'risk_check',
    'intake_log',
    'registered_athlete'
  ))
);

create index if not exists app_records_user_type_idx on public.app_records(user_id, record_type);
create index if not exists app_records_updated_at_idx on public.app_records(updated_at desc);

drop trigger if exists app_records_set_updated_at on public.app_records;
create trigger app_records_set_updated_at
before update on public.app_records
for each row execute function public.set_updated_at();

alter table public.app_records enable row level security;

revoke all on table public.app_records from anon, authenticated;
grant all privileges on table public.app_records to service_role;

notify pgrst, 'reload schema';
