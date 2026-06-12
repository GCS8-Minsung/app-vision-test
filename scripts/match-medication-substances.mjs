import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_MATCH_SOURCE = "clean_check_wada_kada_seed";
const MEDICATION_COLUMNS = "id,source,item_name,normalized_item_name,aliases,ingredients,dosage,form,source_names,raw";
const RISK_RANK = {
  unknown: 0,
  confirmed_candidate: 1,
  needs_check: 2,
  high_risk_candidate: 3
};

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
    matchSource: DEFAULT_MATCH_SOURCE,
    skipRawSummary: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--batch-size") {
      const value = Number(argv[index + 1]);
      options.batchSize = Number.isFinite(value) ? Math.min(Math.max(Math.floor(value), 1), 500) : DEFAULT_BATCH_SIZE;
      index += 1;
    } else if (arg === "--match-source") {
      options.matchSource = argv[index + 1] ?? options.matchSource;
      index += 1;
    } else if (arg === "--skip-raw-summary") {
      options.skipRawSummary = true;
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

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function summarizeRiskLevel(matches) {
  return matches
    .map((match) => match.risk_level)
    .sort((first, second) => (RISK_RANK[second] ?? 0) - (RISK_RANK[first] ?? 0))[0] ?? "unknown";
}

function createMatchRows({ medication, match, ingredient, databaseVersion, matchSource }) {
  const { entry } = match;
  return {
    medication_product_id: medication.id,
    prohibited_substance_id: entry.id,
    item_name_snapshot: medication.item_name,
    ingredient_name: ingredient.name,
    ingredient_dosage: ingredient.dosage ?? null,
    normalized_ingredient_name: normalize(ingredient.name),
    matched_term: match.matchedTerm,
    matched_by: match.matchedBy,
    product_alias: match.productAlias ?? null,
    substance_name: entry.primaryName,
    wada_class: entry.wadaClass,
    scope: entry.scope,
    risk_level: entry.riskLevel,
    source_names: entry.sourceIds ?? [],
    database_version: databaseVersion,
    match_source: matchSource,
    raw: {
      medication_source: medication.source,
      item_name: medication.item_name,
      ingredient,
      aliases: medication.aliases ?? []
    },
    matched_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function fetchAllMedications(supabase) {
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("medication_products")
      .select(MEDICATION_COLUMNS)
      .order("item_name", { ascending: true })
      .range(from, to);

    if (error) throw new Error(`Failed to fetch medication_products: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }

  return rows;
}

async function upsertInBatches(supabase, rows, batchSize) {
  let upserted = 0;
  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase
      .from("medication_substance_matches")
      .upsert(batch, {
        onConflict: "medication_product_id,normalized_ingredient_name,prohibited_substance_id,match_source"
      });

    if (error) throw new Error(`Match upsert failed at row ${index + 1}: ${error.message}`);
    upserted += batch.length;
    console.log(`[match-upsert] ${upserted}/${rows.length}`);
  }
}

async function updateMedicationSummaries(supabase, summaries, batchSize) {
  let updated = 0;

  for (let index = 0; index < summaries.length; index += batchSize) {
    const batch = summaries.slice(index, index + batchSize);
    await Promise.all(batch.map(async ({ medication, summary }) => {
      const raw = {
        ...asObject(medication.raw),
        clean_check_substance_match: summary
      };

      const { error } = await supabase
        .from("medication_products")
        .update({ raw, updated_at: new Date().toISOString() })
        .eq("id", medication.id);

      if (error) throw new Error(`Medication summary update failed for ${medication.item_name}: ${error.message}`);
    }));
    updated += batch.length;
    console.log(`[medication-summary] ${updated}/${summaries.length}`);
  }
}

async function main() {
  loadEnvFile(path.resolve(".env.local"));
  loadEnvFile(path.resolve(".env"));

  const options = parseArgs(process.argv.slice(2));
  const require = registerTypeScriptRequire();
  const {
    DATABASE_VERSION,
    findSubstanceMatch
  } = require(path.resolve("lib/substanceDatabase.ts"));

  const supabase = createSupabaseAdminClient();
  const medications = await fetchAllMedications(supabase);
  const matchRows = [];
  const summaries = [];
  let ingredientCount = 0;
  let unmatchedIngredientCount = 0;

  for (const medication of medications) {
    const ingredients = Array.isArray(medication.ingredients) ? medication.ingredients : [];
    const medicationMatches = [];
    const unmatchedIngredients = [];

    for (const ingredient of ingredients) {
      if (!ingredient?.name) continue;
      ingredientCount += 1;
      const match = findSubstanceMatch({
        itemName: medication.item_name ?? "",
        ingredientName: ingredient.name
      });

      if (match) {
        const row = createMatchRows({
          medication,
          match,
          ingredient,
          databaseVersion: DATABASE_VERSION,
          matchSource: options.matchSource
        });
        matchRows.push(row);
        medicationMatches.push({
          substanceId: match.entry.id,
          substanceName: match.entry.primaryName,
          ingredientName: ingredient.name,
          ingredientDosage: ingredient.dosage ?? null,
          wadaClass: match.entry.wadaClass,
          scope: match.entry.scope,
          riskLevel: match.entry.riskLevel,
          matchedTerm: match.matchedTerm,
          matchedBy: match.matchedBy
        });
      } else {
        unmatchedIngredientCount += 1;
        unmatchedIngredients.push(ingredient.name);
      }
    }

    summaries.push({
      medication,
      summary: {
        databaseVersion: DATABASE_VERSION,
        matchedAt: new Date().toISOString(),
        highestRiskLevel: summarizeRiskLevel(medicationMatches.map((match) => ({ risk_level: match.riskLevel }))),
        matchCount: medicationMatches.length,
        unmatchedIngredients,
        matches: medicationMatches
      }
    });
  }

  const riskCounts = matchRows.reduce((acc, row) => {
    acc[row.risk_level] = (acc[row.risk_level] ?? 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    databaseVersion: DATABASE_VERSION,
    medications: medications.length,
    ingredients: ingredientCount,
    matchedIngredients: matchRows.length,
    unmatchedIngredients: unmatchedIngredientCount,
    riskCounts
  }, null, 2));

  if (options.dryRun) {
    matchRows.slice(0, 20).forEach((row) =>
      console.log(`[dry-run] ${row.item_name_snapshot} / ${row.ingredient_name} -> ${row.substance_name} (${row.risk_level})`)
    );
    console.log("Dry run only. No rows were written.");
    return;
  }

  const { error: deleteError } = await supabase
    .from("medication_substance_matches")
    .delete()
    .eq("match_source", options.matchSource);

  if (deleteError) throw new Error(`Failed to clear previous matches: ${deleteError.message}`);

  if (matchRows.length > 0) {
    await upsertInBatches(supabase, matchRows, options.batchSize);
  }

  if (!options.skipRawSummary) {
    await updateMedicationSummaries(supabase, summaries, Math.min(options.batchSize, 50));
  }

  console.log(`Done. matched=${matchRows.length}, unmatched=${unmatchedIngredientCount}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
