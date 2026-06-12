grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table
  public.athlete_profiles,
  public.uploads,
  public.extracted_items,
  public.extracted_substances,
  public.risk_checks,
  public.intake_logs
to authenticated;

grant select on table public.medication_products to anon, authenticated;

grant all privileges on table
  public.athlete_profiles,
  public.uploads,
  public.extracted_items,
  public.extracted_substances,
  public.risk_checks,
  public.intake_logs,
  public.medication_products
to service_role;

notify pgrst, 'reload schema';
