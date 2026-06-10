import type { MedicationProductLookup } from "./types";
import { LocalSeedMedicationProvider } from "./localSeedProvider";
import { MfdsMedicationProvider } from "./mfdsProvider";

function dedupeByProduct(results: MedicationProductLookup[]): MedicationProductLookup[] {
  const map = new Map<string, MedicationProductLookup>();

  results.forEach((result) => {
    const key = result.productName.toLowerCase().replace(/\s+/g, "");
    const previous = map.get(key);
    if (!previous || result.score > previous.score) {
      map.set(key, result);
    }
  });

  return [...map.values()].sort((first, second) => second.score - first.score);
}

export async function searchServerMedicationProviders(query: string, limit = 5): Promise<MedicationProductLookup[]> {
  const mfds = new MfdsMedicationProvider();
  const seed = new LocalSeedMedicationProvider();

  try {
    const external = await mfds.searchProducts(query, limit);
    if (external.length > 0) {
      const seedFallback = await seed.searchProducts(query, limit);
      return dedupeByProduct([...external, ...seedFallback]).slice(0, limit);
    }
  } catch (error) {
    console.warn("[MedicationProvider] MFDS lookup failed; using seed fallback.", error);
  }

  return seed.searchProducts(query, limit);
}
