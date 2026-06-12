import { resolveMedicationIngredients } from "../medicationIngredientResolver";
import { isSearchableMedicationMatch, normalizeMedicationName, scoreMedicationName } from "../medicationNameMatching";
import type { MedicationProductDetail, MedicationProductLookup, MedicationProvider } from "./types";

type EasyDrugRecord = Record<string, unknown>;

const SERVICE_URL = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList";

function valueOf(record: EasyDrugRecord, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

export function cleanEasyDrugText(value: string): string {
  return value
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

function normalizeItems(payload: unknown): EasyDrugRecord[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const body = (root.body ?? root.response) as Record<string, unknown> | undefined;
  const items = body?.items ?? root.items;

  if (Array.isArray(items)) return items.filter((item): item is EasyDrugRecord => typeof item === "object" && item !== null);
  if (items && typeof items === "object") {
    const item = (items as Record<string, unknown>).item;
    if (Array.isArray(item)) return item.filter((candidate): candidate is EasyDrugRecord => typeof candidate === "object" && candidate !== null);
    if (item && typeof item === "object") return [item as EasyDrugRecord];
  }

  return [];
}

function toLookup(record: EasyDrugRecord, query: string, checkedAt: string): MedicationProductLookup | null {
  const productName = cleanEasyDrugText(valueOf(record, "itemName"));
  if (!productName) return null;

  const normalizedProduct = normalizeMedicationName(productName);
  const score = scoreMedicationName(query, productName);
  const resolved = resolveMedicationIngredients({
    productName,
    useMethodText: cleanEasyDrugText(valueOf(record, "useMethodQesitm"))
  });

  return {
    id: `easy-drug-${normalizedProduct}`,
    productName,
    aliases: [],
    ingredients: resolved.ingredients,
    dosage: resolved.dosage,
    form: resolved.form,
    efficacy: cleanEasyDrugText(valueOf(record, "efcyQesitm")) || undefined,
    interactionWarnings: cleanEasyDrugText(valueOf(record, "intrcQesitm")) || undefined,
    sideEffects: cleanEasyDrugText(valueOf(record, "seQesitm")) || undefined,
    externalSourceId: normalizedProduct,
    lastSyncedAt: checkedAt,
    sourceNames: ["의약품안전나라 e약은요", "공공데이터포털"],
    note: "공공데이터 DrbEasyDrugInfoService 조회 후보",
    matchedName: productName,
    score,
    lookupSource: {
      providerName: "의약품안전나라 e약은요",
      sourceUrl: SERVICE_URL,
      checkedAt,
      status: "external"
    }
  };
}

export class EasyDrugMedicationProvider implements MedicationProvider {
  providerName = "의약품안전나라 e약은요";
  sourceUrl = SERVICE_URL;

  constructor(private readonly apiKey = process.env.DRB_EASY_DRUG_API_KEY ?? process.env.DATA_GO_KR_API_KEY ?? "") {}

  async searchProducts(query: string, limit = 3): Promise<MedicationProductLookup[]> {
    if (!this.apiKey || query.trim().length < 2) return [];

    const checkedAt = new Date().toISOString();
    const url = new URL(SERVICE_URL);
    url.searchParams.set("serviceKey", this.apiKey);
    url.searchParams.set("type", "json");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", String(Math.min(Math.max(limit, 1), 10)));
    url.searchParams.set("itemName", query.trim());

    const response = await fetch(url);
    if (!response.ok) return [];

    const payload = await response.json() as unknown;
    return normalizeItems(payload)
      .map((record) => toLookup(record, query, checkedAt))
      .filter((result): result is MedicationProductLookup => Boolean(result))
      .filter((result) => isSearchableMedicationMatch(result.score))
      .slice(0, limit);
  }

  async getProductDetail(id: string): Promise<MedicationProductDetail | null> {
    const [result] = await this.searchProducts(id, 1);
    return result ? { ...result } : null;
  }
}
