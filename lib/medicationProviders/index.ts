import type { MedicationProductLookup } from "./types";
import { EasyDrugMedicationProvider } from "./easyDrugProvider";
import { LocalSeedMedicationProvider } from "./localSeedProvider";
import { MfdsMedicationProvider } from "./mfdsProvider";
import { SupabaseMedicationProvider } from "./supabaseMedicationProvider";
import { dedupeMedicationLookups } from "../medicationNameMatching";

async function searchRealtimeProviders(
  easyDrug: EasyDrugMedicationProvider,
  mfds: MfdsMedicationProvider,
  query: string,
  limit: number
): Promise<MedicationProductLookup[]> {
  if (process.env.ENABLE_REALTIME_MEDICATION_LOOKUP !== "true") return [];

  try {
    const [external, permitInfo] = await Promise.all([
      easyDrug.searchProducts(query, Math.min(limit, 3)),
      mfds.searchProducts(query, limit)
    ]);
    return dedupeMedicationLookups([...external, ...permitInfo]).slice(0, limit);
  } catch (error) {
    console.warn("[MedicationProvider] Realtime medication lookup failed.", error);
    return [];
  }
}

export async function searchServerMedicationProviders(query: string, limit = 5): Promise<MedicationProductLookup[]> {
  const supabase = new SupabaseMedicationProvider();
  const mfds = new MfdsMedicationProvider();
  const easyDrug = new EasyDrugMedicationProvider();
  const seed = new LocalSeedMedicationProvider();
  let database: MedicationProductLookup[] = [];

  try {
    database = await supabase.searchProducts(query, limit);
  } catch (error) {
    console.warn("[MedicationProvider] Supabase lookup failed; using seed fallback.", error);
  }

  const seedFallback = await seed.searchProducts(query, limit);
  const realtime = await searchRealtimeProviders(easyDrug, mfds, query, limit);
  const merged = dedupeMedicationLookups([...database, ...realtime, ...seedFallback]).slice(0, limit);

  return merged;
}
