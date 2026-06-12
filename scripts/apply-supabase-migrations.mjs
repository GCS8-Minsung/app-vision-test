import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_MIGRATIONS_DIR = "supabase/migrations";

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
    dbUrl: process.env.SUPABASE_DB_URL,
    migrationsDir: DEFAULT_MIGRATIONS_DIR,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--db-url") {
      options.dbUrl = argv[index + 1] ?? options.dbUrl;
      index += 1;
    } else if (arg === "--dir") {
      options.migrationsDir = argv[index + 1] ?? options.migrationsDir;
      index += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function listMigrationFiles(migrationsDir) {
  const resolvedDir = path.resolve(migrationsDir);
  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Migration directory was not found: ${migrationsDir}`);
  }

  return fs.readdirSync(resolvedDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort((first, second) => first.localeCompare(second))
    .map((fileName) => path.join(resolvedDir, fileName));
}

async function runMigration(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function main() {
  loadEnvFile(path.resolve(".env.local"));
  loadEnvFile(path.resolve(".env"));

  const options = parseArgs(process.argv.slice(2));
  const files = listMigrationFiles(options.migrationsDir);
  if (files.length === 0) throw new Error(`No migration files found in ${options.migrationsDir}.`);

  console.log(`Migrations: ${files.length} file(s)`);
  files.forEach((filePath) => console.log(`- ${path.relative(process.cwd(), filePath)}`));

  if (options.dryRun) {
    console.log("Dry run only. No SQL was executed.");
    return;
  }

  if (!options.dbUrl) {
    throw new Error("SUPABASE_DB_URL is required to apply SQL migrations.");
  }

  const client = new Client({
    connectionString: options.dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    for (const filePath of files) {
      await runMigration(client, filePath);
      console.log(`[applied] ${path.relative(process.cwd(), filePath)}`);
    }
  } finally {
    await client.end();
  }

  console.log("Supabase migrations applied.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
