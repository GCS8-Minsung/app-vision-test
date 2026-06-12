import { createSupabasePublicServerClient, hasSupabasePublicConfig, type MedicationProductRow } from "../supabaseServer";
import {
  getBestMedicationNameMatch,
  isSearchableMedicationMatch,
  normalizeMedicationName
} from "../medicationNameMatching";
import type { MedicationProductDetail, MedicationProductLookup, MedicationProvider } from "./types";

const SOURCE_URL = "https://nedrug.mfds.go.kr/";

function scoreProduct(row: MedicationProductRow, query: string): number {
  return getBestMedicationNameMatch(query, [row.item_name, ...(row.aliases ?? [])]).score;
}

function getMatchedName(row: MedicationProductRow, query: string): string {
  return getBestMedicationNameMatch(query, [row.item_name, ...(row.aliases ?? [])]).name || row.item_name;
}

function toLookup(row: MedicationProductRow, query: string): MedicationProductLookup {
  const checkedAt = row.last_synced_at ?? new Date().toISOString();

  return {
    id: row.id,
    productName: row.item_name,
    aliases: row.aliases ?? [],
    ingredients: row.ingredients ?? [],
    dosage: row.dosage ?? undefined,
    form: row.form ?? undefined,
    efficacy: row.efficacy ?? undefined,
    interactionWarnings: row.interaction_warnings ?? undefined,
    sideEffects: row.side_effects ?? undefined,
    externalSourceId: row.source,
    lastSyncedAt: checkedAt,
    sourceNames: row.source_names ?? ["의약품안전나라 e약은요"],
    note: "Supabase 의약품 캐시 DB 조회 후보",
    matchedName: getMatchedName(row, query),
    score: scoreProduct(row, query),
    lookupSource: {
      providerName: "Supabase 의약품 캐시 DB",
      sourceUrl: SOURCE_URL,
      checkedAt,
      status: "database"
    }
  };
}

export class SupabaseMedicationProvider implements MedicationProvider {
  providerName = "Supabase 의약품 캐시 DB";
  sourceUrl = SOURCE_URL;

  async searchProducts(query: string, limit = 5): Promise<MedicationProductLookup[]> {
    const trimmed = query.trim();
    if (!hasSupabasePublicConfig() || trimmed.length < 2) return [];

    const client = createSupabasePublicServerClient();
    const normalizedQuery = normalizeMedicationName(trimmed);
    const maxRows = Math.min(Math.max(limit * 3, 5), 30);
    const columns = "id,source,item_name,normalized_item_name,aliases,ingredients,dosage,form,efficacy,interaction_warnings,side_effects,source_names,last_synced_at";

    const nameQuery = client
      .from("medication_products")
      .select(columns)
      .or(`normalized_item_name.ilike.%${normalizedQuery}%,item_name.ilike.%${trimmed}%`)
      .limit(maxRows);

    const aliasQuery = client
      .from("medication_products")
      .select(columns)
      .contains("aliases", [trimmed])
      .limit(maxRows);

    const [nameResult, aliasResult] = await Promise.all([nameQuery, aliasQuery]);

    if (nameResult.error && aliasResult.error) return [];

    const rows = [
      ...(nameResult.data ?? []),
      ...(aliasResult.data ?? [])
    ] as MedicationProductRow[];
    const byId = new Map(rows.map((row) => [row.id, row]));

    return [...byId.values()]
      .map((row) => toLookup(row, trimmed))
      .filter((result) => isSearchableMedicationMatch(result.score))
      .sort((first, second) => second.score - first.score)
      .slice(0, limit);
  }

  async getProductDetail(id: string): Promise<MedicationProductDetail | null> {
    if (!hasSupabasePublicConfig()) return null;

    const client = createSupabasePublicServerClient();
    const { data, error } = await client
      .from("medication_products")
      .select("id,source,item_name,normalized_item_name,aliases,ingredients,dosage,form,efficacy,interaction_warnings,side_effects,source_names,last_synced_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return toLookup(data as MedicationProductRow, id);
  }
}
