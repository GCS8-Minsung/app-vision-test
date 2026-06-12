import { STORAGE_KEYS } from "./constants";
import {
  getBestMedicationNameMatch,
  isSearchableMedicationMatch,
  normalizeMedicationName
} from "./medicationNameMatching";
import type { MedicationProductEntry } from "./medicationDatabase";
import type { CustomMedicationProduct, MedicationProductLookup } from "./medicationProviders/types";

function hasStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readProducts(): CustomMedicationProduct[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.customMedicationProducts);
    return raw ? (JSON.parse(raw) as CustomMedicationProduct[]) : [];
  } catch {
    return [];
  }
}

function writeProducts(products: CustomMedicationProduct[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.customMedicationProducts, JSON.stringify(products));
}

export const customMedicationProducts = {
  getAll(): CustomMedicationProduct[] {
    return readProducts();
  },

  save(input: MedicationProductEntry): CustomMedicationProduct {
    const now = new Date().toISOString();
    const current = readProducts();
    const normalizedName = normalizeMedicationName(input.productName);
    const existing = current.find((product) => normalizeMedicationName(product.productName) === normalizedName);
    const next: CustomMedicationProduct = {
      ...input,
      id: input.id || `custom-${Date.now()}`,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    writeProducts(existing ? current.map((product) => (product.id === existing.id ? next : product)) : [next, ...current]);
    return next;
  },

  importJson(json: string): number {
    const parsed = JSON.parse(json) as MedicationProductEntry[];
    if (!Array.isArray(parsed)) throw new Error("배열 형식의 JSON이 필요합니다.");
    parsed.forEach((entry) => this.save(entry));
    return parsed.length;
  },

  exportJson(): string {
    return JSON.stringify(readProducts(), null, 2);
  },

  clear(): void {
    writeProducts([]);
  },

  search(query: string, limit = 5): MedicationProductLookup[] {
    const normalizedQuery = normalizeMedicationName(query);
    if (normalizedQuery.length < 2) return [];
    const checkedAt = new Date().toISOString();

    return readProducts()
      .map((entry) => {
        const names = [entry.productName, ...entry.aliases];
        const match = getBestMedicationNameMatch(query, names);
        return {
          ...entry,
          matchedName: match.name || entry.productName,
          score: match.score,
          lookupSource: {
            providerName: "사용자 보강 DB",
            sourceUrl: "localStorage",
            checkedAt,
            status: "custom" as const
          }
        };
      })
      .filter((result) => isSearchableMedicationMatch(result.score))
      .sort((first, second) => second.score - first.score)
      .slice(0, limit);
  }
};
