import type { MedicationIngredient, MedicationProductEntry } from "../medicationDatabase";

export interface MedicationLookupSource {
  providerName: string;
  sourceUrl: string;
  checkedAt: string;
  status: "custom" | "cache" | "database" | "external" | "seed" | "fallback";
}

export interface MedicationProductLookup extends MedicationProductEntry {
  matchedName: string;
  score: number;
  lookupSource: MedicationLookupSource;
}

export interface MedicationProductDetail extends MedicationProductLookup {
  raw?: unknown;
}

export interface MedicationProvider {
  providerName: string;
  sourceUrl: string;
  searchProducts(query: string, limit?: number): Promise<MedicationProductLookup[]>;
  getProductDetail(id: string): Promise<MedicationProductDetail | null>;
}

export interface CustomMedicationProduct extends MedicationProductEntry {
  createdAt: string;
  updatedAt: string;
}

export function toIngredientText(ingredients: MedicationIngredient[]): string {
  return ingredients
    .map((ingredient) => `${ingredient.name}${ingredient.dosage ? ` ${ingredient.dosage}` : ""}`)
    .join(" + ");
}
