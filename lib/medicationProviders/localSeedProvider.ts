import {
  MEDICATION_PRODUCT_DATABASE,
  searchMedicationProducts
} from "../medicationDatabase";
import type { MedicationProductDetail, MedicationProductLookup, MedicationProvider } from "./types";

export class LocalSeedMedicationProvider implements MedicationProvider {
  providerName = "로컬 seed DB";
  sourceUrl = "https://www.health.kr/";

  async searchProducts(query: string, limit = 5): Promise<MedicationProductLookup[]> {
    const checkedAt = new Date().toISOString();

    return searchMedicationProducts(query, limit).map((result) => ({
      ...result.entry,
      matchedName: result.matchedName,
      score: result.score,
      lookupSource: {
        providerName: this.providerName,
        sourceUrl: this.sourceUrl,
        checkedAt,
        status: "seed"
      }
    }));
  }

  async getProductDetail(id: string): Promise<MedicationProductDetail | null> {
    const entry = MEDICATION_PRODUCT_DATABASE.find((candidate) => candidate.id === id);
    if (!entry) return null;

    return {
      ...entry,
      matchedName: entry.productName,
      score: 100,
      lookupSource: {
        providerName: this.providerName,
        sourceUrl: this.sourceUrl,
        checkedAt: new Date().toISOString(),
        status: "seed"
      }
    };
  }
}
