create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in (
    'athlete_login_success',
    'athlete_login_failed',
    'admin_login_success',
    'admin_login_failed',
    'admin_view'
  )),
  subject_id text,
  subject_name text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists access_logs_event_created_at_idx on public.access_logs(event_type, created_at desc);
create index if not exists access_logs_subject_created_at_idx on public.access_logs(subject_id, created_at desc);
create index if not exists access_logs_created_at_idx on public.access_logs(created_at desc);

alter table public.access_logs enable row level security;

revoke all on table public.access_logs from anon, authenticated;
grant all privileges on table public.access_logs to service_role;

notify pgrst, 'reload schema';
