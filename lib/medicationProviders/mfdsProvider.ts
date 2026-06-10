import type { MedicationIngredient } from "../medicationDatabase";
import type { MedicationProductDetail, MedicationProductLookup, MedicationProvider } from "./types";

type MfdsRecord = Record<string, unknown>;

const SERVICE_URL = "https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnInq07";

function valueOf(record: MfdsRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeItems(payload: unknown): MfdsRecord[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const body = (root.body ?? root.response) as Record<string, unknown> | undefined;
  const items = body?.items ?? body?.body ?? root.items;

  if (Array.isArray(items)) return items.filter((item): item is MfdsRecord => typeof item === "object" && item !== null);
  if (items && typeof items === "object") {
    const item = (items as Record<string, unknown>).item;
    if (Array.isArray(item)) return item.filter((candidate): candidate is MfdsRecord => typeof candidate === "object" && candidate !== null);
    if (item && typeof item === "object") return [item as MfdsRecord];
  }
  return [];
}

function parseIngredients(record: MfdsRecord): MedicationIngredient[] {
  const raw = stripTags(
    valueOf(record, [
      "MATERIAL_NAME",
      "MAIN_ITEM_INGR",
      "INGR_NAME",
      "PRDUCT_INGR",
      "ITEM_INGR_NAME",
      "VALID_TERM"
    ])
  );

  if (!raw) return [];

  return raw
    .split(/\s*(?:\+|,|，|;|；|ㆍ|·|\n)\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const dose = part.match(/(\d+(?:\.\d+)?\s?(?:mg|㎎|mcg|μg|g|ml|iu|정|캡슐))/i)?.[1]?.replace(/\s+/g, "");
      return {
        name: part.replace(/(\d+(?:\.\d+)?\s?(?:mg|㎎|mcg|μg|g|ml|iu|정|캡슐))/i, "").trim(),
        dosage: dose
      };
    })
    .filter((ingredient) => ingredient.name);
}

function toLookup(record: MfdsRecord, query: string, checkedAt: string): MedicationProductLookup | null {
  const productName = valueOf(record, ["ITEM_NAME", "itemName", "PRDLST_NM", "productName"]);
  if (!productName) return null;

  const itemSeq = valueOf(record, ["ITEM_SEQ", "itemSeq", "ITEM_PERMIT_SEQ"]) || productName;
  const ingredients = parseIngredients(record);
  const dosage = stripTags(valueOf(record, ["CHART", "UD_DOC_DATA", "DOSE", "CAPACITY"]));
  const form = valueOf(record, ["ETC_OTC_NAME", "CLASS_NO_NAME", "FORM_CODE_NAME"]);
  const normalizedQuery = query.replace(/\s+/g, "");
  const normalizedProduct = productName.replace(/\s+/g, "");
  const score = normalizedProduct.includes(normalizedQuery) ? 90 : 60;

  return {
    id: `mfds-${itemSeq}`,
    productName,
    aliases: [],
    ingredients,
    dosage: dosage || undefined,
    form: form || undefined,
    sourceNames: ["의약품안전나라", "식품의약품안전처_의약품 제품 허가정보"],
    note: "식약처 의약품 제품 허가정보 API 조회 후보",
    matchedName: productName,
    score,
    lookupSource: {
      providerName: "식약처 의약품 제품 허가정보",
      sourceUrl: "https://www.data.go.kr/data/15095677/openapi.do",
      checkedAt,
      status: "external"
    }
  };
}

export class MfdsMedicationProvider implements MedicationProvider {
  providerName = "식약처 의약품 제품 허가정보";
  sourceUrl = "https://www.data.go.kr/data/15095677/openapi.do";

  constructor(private readonly apiKey = process.env.MFDS_API_KEY ?? process.env.DATA_GO_KR_API_KEY ?? "") {}

  async searchProducts(query: string, limit = 5): Promise<MedicationProductLookup[]> {
    if (!this.apiKey || query.trim().length < 2) return [];

    const checkedAt = new Date().toISOString();
    const url = new URL(SERVICE_URL);
    url.searchParams.set("serviceKey", this.apiKey);
    url.searchParams.set("type", "json");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", String(Math.min(Math.max(limit, 1), 20)));
    url.searchParams.set("item_name", query.trim());

    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) return [];

    const payload = await response.json() as unknown;
    return normalizeItems(payload)
      .map((record) => toLookup(record, query, checkedAt))
      .filter((result): result is MedicationProductLookup => Boolean(result))
      .slice(0, limit);
  }

  async getProductDetail(id: string): Promise<MedicationProductDetail | null> {
    const [result] = await this.searchProducts(id, 1);
    return result ? { ...result } : null;
  }
}
