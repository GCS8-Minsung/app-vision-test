import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface MedicationProductRow {
  id: string;
  source: string;
  item_name: string;
  normalized_item_name: string;
  aliases: string[] | null;
  ingredients: { name: string; dosage?: string }[] | null;
  dosage: string | null;
  form: string | null;
  efficacy: string | null;
  interaction_warnings: string | null;
  side_effects: string | null;
  source_names: string[] | null;
  last_synced_at: string | null;
}

function getSupabasePublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function getSupabaseSecretKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
}

export function hasSupabasePublicConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublicKey());
}

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseSecretKey());
}

export function createSupabasePublicServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();

  if (!url || !key) {
    throw new Error("Supabase public configuration is missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createSupabaseAdminServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseSecretKey();

  if (!url || !key) {
    throw new Error("Supabase admin configuration is missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
