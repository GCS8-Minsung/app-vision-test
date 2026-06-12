import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_BATCH_SIZE = 100;

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
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--batch-size") {
      const value = Number(argv[index + 1]);
      options.batchSize = Number.isFinite(value) ? Math.min(Math.max(Math.floor(value), 1), 500) : DEFAULT_BATCH_SIZE;
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

function toSupabaseRow(entry, databaseVersion) {
  return {
    id: entry.id,
    primary_name: entry.primaryName,
    aliases: entry.aliases ?? [],
    korean_names: entry.koreanNames ?? [],
    wada_class: entry.wadaClass,
    scope: entry.scope,
    risk_level: entry.riskLevel,
    reason_template: entry.reasonTemplate,
    action_template: entry.actionTemplate,
    source_ids: entry.sourceIds ?? [],
    database_version: databaseVersion,
    raw: {
      source_ids: entry.sourceIds ?? [],
      seed_id: entry.id
    },
    updated_at: new Date().toISOString()
  };
}

async function main() {
  loadEnvFile(path.resolve(".env.local"));
  loadEnvFile(path.resolve(".env"));

  const options = parseArgs(process.argv.slice(2));
  const require = registerTypeScriptRequire();
  const {
    DATABASE_VERSION,
    PROHIBITED_SUBSTANCE_DATABASE
  } = require(path.resolve("lib/substanceDatabase.ts"));

  const rows = PROHIBITED_SUBSTANCE_DATABASE.map((entry) => toSupabaseRow(entry, DATABASE_VERSION));
  console.log(`Prohibited substance seed rows: ${rows.length}`);
  console.log(`Database version: ${DATABASE_VERSION}`);

  if (options.dryRun) {
    rows.slice(0, 10).forEach((row) => console.log(`[dry-run] ${row.id} ${row.primary_name} ${row.wada_class}`));
    console.log("Dry run only. No rows were written.");
    return;
  }

  const supabase = createSupabaseAdminClient();
  let upsertedCount = 0;

  for (let index = 0; index < rows.length; index += options.batchSize) {
    const batch = rows.slice(index, index + options.batchSize);
    const { error } = await supabase
      .from("prohibited_substances")
      .upsert(batch, { onConflict: "id" });

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
