import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_SOURCE = "clean_check_seed";

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

function parseArgs(argv) {
  const options = {
    batchSize: DEFAULT_BATCH_SIZE,
    dryRun: false,
    source: DEFAULT_SOURCE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--batch-size") {
      const value = Number(argv[index + 1]);
      options.batchSize = Number.isFinite(value) ? Math.min(Math.max(Math.floor(value), 1), 500) : DEFAULT_BATCH_SIZE;
      index += 1;
    } else if (arg === "--source") {
      options.source = argv[index + 1] ?? options.source;
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function registerTypeScriptRequire() {
  const require = createRequire(import.meta.url);
  const ts = require("typescript");

  require.extensions[".ts"] = function compileTypeScript(module, fileName) {
    const source = fs.readFileSync(fileName, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022
      },
      fileName
    });
    module._compile(output.outputText, fileName);
  };

  return require;
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
}

function toSupabaseRow(entry, source, databaseVersion) {
  const now = new Date().toISOString();
  return {
    source,
    source_item_name: entry.externalSourceId ?? entry.id,
    item_name: entry.productName,
    normalized_item_name: normalize(entry.productName),
    aliases: entry.aliases ?? [],
    ingredients: entry.ingredients ?? [],
    dosage: entry.dosage ?? null,
    form: entry.form ?? null,
    efficacy: entry.efficacy ?? null,
    interaction_warnings: entry.interactionWarnings ?? null,
    side_effects: entry.sideEffects ?? null,
    source_names: entry.sourceNames ?? ["Clean Check local seed"],
    raw: {
      local_id: entry.id,
      note: entry.note,
      database_version: databaseVersion
    },
    last_synced_at: entry.lastSyncedAt ?? now,
    updated_at: now
  };
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is required.");

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

async function main() {
  loadEnvFile(path.resolve(".env.local"));
  loadEnvFile(path.resolve(".env"));

  const options = parseArgs(process.argv.slice(2));
  const require = registerTypeScriptRequire();
  const {
    MEDICATION_DATABASE_VERSION,
    MEDICATION_PRODUCT_DATABASE
  } = require(path.resolve("lib/medicationDatabase.ts"));

  const rows = MEDICATION_PRODUCT_DATABASE.map((entry) =>
    toSupabaseRow(entry, options.source, MEDICATION_DATABASE_VERSION)
  );

  console.log(`Local medication seed rows: ${rows.length}`);
  console.log(`Source: ${options.source}`);

  if (options.dryRun) {
    rows.slice(0, 5).forEach((row) => console.log(`[dry-run] ${row.item_name}`));
    console.log("Dry run only. No rows were written.");
    return;
  }

  const supabase = createSupabaseAdminClient();
  let upsertedCount = 0;

  for (let index = 0; index < rows.length; index += options.batchSize) {
    const batch = rows.slice(index, index + options.batchSize);
    const { error } = await supabase
      .from("medication_products")
      .upsert(batch, { onConflict: "source,normalized_item_name" });

    if (error) throw new Error(`Supabase upsert failed at row ${index + 1}: ${error.message}`);

    upsertedCount += batch.length;
    console.log(`[upsert] ${upsertedCount}/${rows.length}`);
  }

  console.log(`Done. upserted=${upsertedCount}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
