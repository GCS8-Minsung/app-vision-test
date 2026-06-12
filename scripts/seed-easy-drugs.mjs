import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ENDPOINT = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";
const DEFAULT_QUERY_FILE = "scripts/medication-seed-queries.txt";
const DEFAULT_NUM_ROWS = 3;

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
    file: DEFAULT_QUERY_FILE,
    dryRun: false,
    numRows: DEFAULT_NUM_ROWS
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--file") {
      options.file = argv[index + 1] ?? options.file;
      index += 1;
    } else if (arg === "--num-rows") {
      const value = Number(argv[index + 1]);
      options.numRows = Number.isFinite(value) ? Math.min(Math.max(Math.floor(value), 1), 20) : DEFAULT_NUM_ROWS;
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

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return cleanText(value).toLowerCase().replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
}

function normalizeItems(payload) {
  if (!payload || typeof payload !== "object") return [];
  const body = payload.body ?? payload.response;
  const items = body?.items ?? payload.items;

  if (Array.isArray(items)) return items.filter((item) => item && typeof item === "object");
  if (items && typeof items === "object") {
    const item = items.item;
    if (Array.isArray(item)) return item.filter((candidate) => candidate && typeof candidate === "object");
    if (item && typeof item === "object") return [item];
  }

  return [];
}

function readQueries(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Query file was not found: ${filePath}`);
  }

  return Array.from(new Set(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*/, "").trim())
      .filter(Boolean)
  ));
}

async function fetchEasyDrugRows(query, apiKey, numRows, resolveMedicationIngredients) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("serviceKey", apiKey);
  url.searchParams.set("itemName", query);
  url.searchParams.set("type", "json");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", String(numRows));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`EasyDrug API ${response.status} for "${query}"`);
  }

  const payload = await response.json();
  const now = new Date().toISOString();

  return normalizeItems(payload)
    .map((record) => {
      const itemName = cleanText(record.itemName);
      if (!itemName) return null;
      const resolved = resolveMedicationIngredients({
        productName: itemName,
        useMethodText: cleanText(record.useMethodQesitm)
      });

      return {
        source: "drb_easy_drug",
        source_item_name: query,
        item_name: itemName,
        normalized_item_name: normalize(itemName),
        aliases: [],
        ingredients: resolved.ingredients,
        dosage: resolved.dosage ?? null,
        form: resolved.form ?? null,
        efficacy: cleanText(record.efcyQesitm),
        interaction_warnings: cleanText(record.intrcQesitm),
        side_effects: cleanText(record.seQesitm),
        source_names: ["의약품안전나라 e약은요", "공공데이터포털"],
        raw: record,
        last_synced_at: now,
        updated_at: now
      };
    })
    .filter(Boolean);
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is required for batch DB upserts.");

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

async function main() {
  loadEnvFile(path.resolve(".env.local"));

  const options = parseArgs(process.argv.slice(2));
  const require = registerTypeScriptRequire();
  const { resolveMedicationIngredients } = require(path.resolve("lib/medicationIngredientResolver.ts"));
  const apiKey = process.env.DRB_EASY_DRUG_API_KEY ?? process.env.DATA_GO_KR_API_KEY ?? process.env.MFDS_API_KEY;
  if (!apiKey) throw new Error("DRB_EASY_DRUG_API_KEY or DATA_GO_KR_API_KEY is missing.");

  const queries = readQueries(path.resolve(options.file));
  const supabase = options.dryRun ? null : createSupabaseAdminClient();
  let fetchedCount = 0;
  let upsertedCount = 0;

  for (const query of queries) {
    const rows = await fetchEasyDrugRows(query, apiKey, options.numRows, resolveMedicationIngredients);
    fetchedCount += rows.length;

    if (options.dryRun) {
      console.log(`[dry-run] ${query}: ${rows.map((row) => row.item_name).join(", ") || "no results"}`);
      continue;
    }

    if (rows.length === 0) {
      console.log(`[skip] ${query}: no results`);
      continue;
    }

    const { error } = await supabase
      .from("medication_products")
      .upsert(rows, { onConflict: "source,normalized_item_name" });

    if (error) throw new Error(`Supabase upsert failed for "${query}": ${error.message}`);

    upsertedCount += rows.length;
    console.log(`[upsert] ${query}: ${rows.length}`);
  }

  console.log(`Done. queries=${queries.length}, fetched=${fetchedCount}, upserted=${upsertedCount}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
