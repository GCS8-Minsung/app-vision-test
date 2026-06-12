import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function getPublicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function getSecretKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
}

function describeKey(value) {
  if (!value) return "missing";
  if (value.startsWith("sb_publishable_")) return "supabase publishable key";
  if (value.startsWith("sb_secret_")) return "supabase secret key";
  if (!value.startsWith("eyJ")) return "set";

  try {
    const payload = JSON.parse(Buffer.from(value.split(".")[1] ?? "", "base64url").toString("utf8"));
    return `jwt role=${payload.role ?? "unknown"}`;
  } catch {
    return "jwt";
  }
}

function printConfigStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKeyName = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      : null;
  const secretKeyName = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "SUPABASE_SERVICE_ROLE_KEY"
    : process.env.SUPABASE_SECRET_KEY
      ? "SUPABASE_SECRET_KEY"
      : null;

  console.log(`Supabase URL: ${url ? "set" : "missing"}`);
  console.log(`Supabase public key: ${publicKeyName ?? "missing"} (${describeKey(getPublicKey())})`);
  console.log(`Supabase secret key: ${secretKeyName ?? "missing"} (${describeKey(getSecretKey())})`);
}

async function main() {
  loadEnvFile(path.resolve(".env.local"));
  loadEnvFile(path.resolve(".env"));
  const writeTest = process.argv.includes("--write-test");

  printConfigStatus();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getPublicKey();
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and public Supabase key.");
  }

  const publicClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  for (const table of ["medication_products", "prohibited_substances", "medication_substance_matches"]) {
    const { count, error } = await publicClient
      .from(table)
      .select("id", { count: "exact" })
      .limit(1);

    if (error) {
      if (error.code === "42P01") {
        throw new Error(`${table} table is missing. Apply Supabase migrations first.`);
      }
      throw new Error(`Supabase ${table} check failed: ${error.message}`);
    }

    console.log(`${table} table with public key: reachable (${count ?? 0} rows)`);
  }

  const secretKey = getSecretKey();
  if (!secretKey) return;

  const adminClient = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  for (const table of ["medication_products", "prohibited_substances", "medication_substance_matches"]) {
    const { count: adminCount, error: adminError } = await adminClient
      .from(table)
      .select("id", { count: "exact" })
      .limit(1);

    if (adminError) {
      throw new Error(`Supabase ${table} admin check failed: ${adminError.message}`);
    }

    console.log(`${table} table with service role: reachable (${adminCount ?? 0} rows)`);
  }

  if (!writeTest) return;

  const normalizedName = `setupcheck${Date.now()}`;
  const { data: inserted, error: insertError } = await adminClient
    .from("medication_products")
    .insert({
      source: "setup_check",
      item_name: "setup-check",
      normalized_item_name: normalizedName,
      aliases: [],
      ingredients: [],
      source_names: ["setup-check"],
      raw: {}
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Supabase medication_products write check failed: ${insertError.message}`);
  }

  const { error: deleteError } = await adminClient
    .from("medication_products")
    .delete()
    .eq("id", inserted.id);

  if (deleteError) {
    throw new Error(`Supabase medication_products cleanup failed for ${inserted.id}: ${deleteError.message}`);
  }

  console.log("medication_products write test: inserted and cleaned up");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
