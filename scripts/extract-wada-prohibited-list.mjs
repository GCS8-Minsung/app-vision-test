import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import { PDFParse } from "pdf-parse";

const DEFAULT_WADA_2026_PDF_URL = "https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf";
const SECTION_MARKERS = [
  "S0",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "P1"
];

function parseArgs(argv) {
  const options = {
    pdf: path.resolve("logs/wada-2026-prohibited-list.pdf"),
    url: DEFAULT_WADA_2026_PDF_URL,
    download: false,
    checkSeed: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pdf") {
      options.pdf = path.resolve(argv[index + 1] ?? options.pdf);
      index += 1;
    } else if (arg === "--url") {
      options.url = argv[index + 1] ?? options.url;
      index += 1;
    } else if (arg === "--download") {
      options.download = true;
    } else if (arg === "--check-seed") {
      options.checkSeed = true;
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

async function downloadPdf(url, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download WADA PDF: ${response.status} ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function extractText(pdfPath) {
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

function summarizeSections(text) {
  const normalizedText = text.toUpperCase();
  return SECTION_MARKERS.map((marker) => {
    const matches = [...normalizedText.matchAll(new RegExp(`\\n${marker}(?:\\.|\\s)`, "g"))];
    return {
      marker,
      occurrences: matches.length,
      firstIndex: matches[0]?.index ?? -1
    };
  });
}

function checkSeedCoverage(text) {
  const require = registerTypeScriptRequire();
  const {
    DATABASE_VERSION,
    PROHIBITED_SUBSTANCE_DATABASE
  } = require(path.resolve("lib/substanceDatabase.ts"));
  const normalizedPdf = normalize(text);
  const missing = PROHIBITED_SUBSTANCE_DATABASE
    .filter((entry) => entry.scope !== "not_listed_or_monitoring")
    .filter((entry) => ![entry.primaryName, ...entry.aliases].some((term) => normalizedPdf.includes(normalize(term))))
    .map((entry) => ({
      id: entry.id,
      primaryName: entry.primaryName,
      wadaClass: entry.wadaClass
    }));

  return {
    databaseVersion: DATABASE_VERSION,
    seedEntries: PROHIBITED_SUBSTANCE_DATABASE.length,
    checkedEntries: PROHIBITED_SUBSTANCE_DATABASE.filter((entry) => entry.scope !== "not_listed_or_monitoring").length,
    missing
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.download || !fs.existsSync(options.pdf)) {
    await downloadPdf(options.url, options.pdf);
  }

  const text = await extractText(options.pdf);
  const summary = {
    pdf: options.pdf,
    characters: text.length,
    sections: summarizeSections(text)
  };

  if (options.checkSeed) {
    summary.seedCoverage = checkSeedCoverage(text);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
