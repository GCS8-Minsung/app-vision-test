import { STORAGE_KEYS } from "./constants";
import type { MedicationProductLookup } from "./medicationProviders/types";

const TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface CacheEntry {
  query: string;
  createdAt: string;
  providerName: string;
  results: MedicationProductLookup[];
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function readCache(): Record<string, CacheEntry> {
  if (!hasStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.medicationLookupCache);
    return raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.medicationLookupCache, JSON.stringify(cache));
}

export const medicationLookupCache = {
  get(query: string): MedicationProductLookup[] | null {
    const key = normalize(query);
    const entry = readCache()[key];
    if (!entry) return null;
    const createdAt = new Date(entry.createdAt).getTime();
    if (Number.isNaN(createdAt) || Date.now() - createdAt > TTL_MS) return null;

    return entry.results.map((result) => ({
      ...result,
      lookupSource: {
        ...result.lookupSource,
        providerName: entry.providerName,
        checkedAt: entry.createdAt,
        status: "cache"
      }
    }));
  },

  set(query: string, results: MedicationProductLookup[]): void {
    const key = normalize(query);
    if (!key) return;
    const createdAt = new Date().toISOString();
    const providerName = results[0]?.lookupSource.providerName ?? "검색 캐시";
    writeCache({
      ...readCache(),
      [key]: { query, createdAt, providerName, results }
    });
  },

  clear(): void {
    if (!hasStorage()) return;
    window.localStorage.removeItem(STORAGE_KEYS.medicationLookupCache);
  }
};
