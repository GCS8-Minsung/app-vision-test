import { BULK_MEDICATION_PRODUCT_DATABASE } from "./medicationSeedBulk";
import {
  getBestMedicationNameMatch,
  isSearchableMedicationMatch,
  normalizeMedicationName
} from "./medicationNameMatching";

export interface MedicationIngredient {
  name: string;
  dosage?: string;
}

export interface MedicationProductEntry {
  id: string;
  productName: string;
  aliases: string[];
  ingredients: MedicationIngredient[];
  dosage?: string;
  form?: string;
  efficacy?: string;
  interactionWarnings?: string;
  sideEffects?: string;
  externalSourceId?: string;
  lastSyncedAt?: string;
  sourceNames: string[];
  note: string;
}

export interface MedicationSearchResult {
  entry: MedicationProductEntry;
  matchedName: string;
  score: number;
}

export const MEDICATION_DATABASE_VERSION = "2026.3-product-seed-ingredient-resolution";

const CURATED_MEDICATION_PRODUCT_DATABASE: MedicationProductEntry[] = [
  {
    id: "med-tylenol-er-650",
    productName: "타이레놀8시간이알서방정",
    aliases: ["타이레놀 이알", "타이레놀ER", "타이레놀 8시간", "타이레놀이알서방정", "tylenol er"],
    ingredients: [{ name: "acetaminophen", dosage: "650mg" }],
    dosage: "1정당 650mg",
    form: "서방정",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "아세트아미노펜 단일 성분 제품명 seed"
  },
  {
    id: "med-tylenol-500",
    productName: "타이레놀정",
    aliases: ["타이레놀", "tylenol"],
    ingredients: [{ name: "acetaminophen", dosage: "500mg" }],
    dosage: "1정당 500mg",
    form: "정제",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "아세트아미노펜 단일 성분 제품명 seed"
  },
  {
    id: "med-tacenol-er",
    productName: "타세놀이알서방정",
    aliases: ["타세놀 이알", "타세놀이알", "tacenol er"],
    ingredients: [{ name: "acetaminophen", dosage: "650mg" }],
    dosage: "1정당 650mg",
    form: "서방정",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "아세트아미노펜 단일 성분 제품명 seed"
  },
  {
    id: "med-concerta-18",
    productName: "콘서타OROS서방정18mg",
    aliases: ["콘서타정 18mg", "콘서타 18", "concerta 18"],
    ingredients: [{ name: "methylphenidate", dosage: "18mg" }],
    dosage: "1정당 18mg",
    form: "서방정",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "제품명과 함량이 함께 인식된 경우 보강"
  },
  {
    id: "med-concerta",
    productName: "콘서타OROS서방정",
    aliases: ["콘서타정", "콘서타", "concerta"],
    ingredients: [{ name: "methylphenidate" }],
    form: "서방정",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "함량은 제품 포장 또는 처방전에서 추가 확인 필요"
  },
  {
    id: "med-penid",
    productName: "페니드정",
    aliases: ["페니드", "penid"],
    ingredients: [{ name: "methylphenidate" }],
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "함량은 제품 포장 또는 처방전에서 추가 확인 필요"
  },
  {
    id: "med-sudafed",
    productName: "슈다페드정",
    aliases: ["슈다페드", "수다페드", "sudafed"],
    ingredients: [{ name: "pseudoephedrine", dosage: "60mg" }],
    dosage: "1정당 60mg",
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "코감기약 계열 제품명 seed"
  },
  {
    id: "med-actifed",
    productName: "액티피드정",
    aliases: ["액티피드", "actifed"],
    ingredients: [
      { name: "pseudoephedrine" },
      { name: "triprolidine" }
    ],
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "복합 코감기약 제품명 seed"
  },
  {
    id: "med-panpyrin",
    productName: "판피린",
    aliases: ["판피린큐", "판피린티", "panpyrin"],
    ingredients: [
      { name: "acetaminophen" },
      { name: "methylephedrine" },
      { name: "caffeine" }
    ],
    form: "복합제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "복합 감기약 제품명 seed"
  },
  {
    id: "med-pancold",
    productName: "판콜",
    aliases: ["판콜에스", "판콜에이", "pancold"],
    ingredients: [
      { name: "acetaminophen" },
      { name: "methylephedrine" },
      { name: "caffeine" }
    ],
    form: "복합제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "복합 감기약 제품명 seed"
  },
  {
    id: "med-ventolin",
    productName: "벤토린에보할러",
    aliases: ["벤토린", "ventolin", "살부타몰 흡입제"],
    ingredients: [{ name: "salbutamol" }],
    form: "흡입제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "천식 흡입제 제품명 seed"
  },
  {
    id: "med-solondo",
    productName: "소론도정",
    aliases: ["소론도", "solondo"],
    ingredients: [{ name: "prednisolone", dosage: "5mg" }],
    dosage: "1정당 5mg",
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "글루코코르티코이드 제품명 seed"
  },
  {
    id: "med-medrol",
    productName: "메드롤정",
    aliases: ["메드롤", "medrol"],
    ingredients: [{ name: "methylprednisolone" }],
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "글루코코르티코이드 제품명 seed"
  },
  {
    id: "med-lasix",
    productName: "라식스정",
    aliases: ["라식스", "lasix"],
    ingredients: [{ name: "furosemide", dosage: "40mg" }],
    dosage: "1정당 40mg",
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "이뇨제 제품명 seed"
  },
  {
    id: "med-inderal",
    productName: "인데놀정",
    aliases: ["인데놀", "inderal"],
    ingredients: [{ name: "propranolol" }],
    form: "정제",
    sourceNames: ["약학정보원", "KADA 금지약물 검색서비스"],
    note: "베타차단제 제품명 seed"
  },
  {
    id: "med-brufen",
    productName: "부루펜정",
    aliases: ["부루펜", "brufen"],
    ingredients: [{ name: "ibuprofen" }],
    form: "정제",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "이부프로펜 제품명 seed"
  },
  {
    id: "med-advil",
    productName: "애드빌",
    aliases: ["advil", "애드빌정"],
    ingredients: [{ name: "ibuprofen" }],
    form: "정제",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "이부프로펜 제품명 seed"
  },
  {
    id: "med-taxen",
    productName: "탁센",
    aliases: ["탁센연질캡슐", "taxen"],
    ingredients: [{ name: "naproxen" }],
    form: "연질캡슐",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "나프록센 제품명 seed"
  },
  {
    id: "med-zyrtec",
    productName: "지르텍정",
    aliases: ["지르텍", "zyrtec"],
    ingredients: [{ name: "cetirizine", dosage: "10mg" }],
    dosage: "1정당 10mg",
    form: "정제",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "항히스타민제 제품명 seed"
  },
  {
    id: "med-claritin",
    productName: "클라리틴정",
    aliases: ["클라리틴", "claritin"],
    ingredients: [{ name: "loratadine", dosage: "10mg" }],
    dosage: "1정당 10mg",
    form: "정제",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "항히스타민제 제품명 seed"
  },
  {
    id: "med-pharmpain-pro",
    productName: "팜페인프로연질캡슐",
    aliases: ["팜페인프로", "팜페인 프로", "pharmpain pro", "pharmpain pro soft cap"],
    ingredients: [{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }],
    dosage: "1캡슐당 300.00mg",
    form: "연질캡슐",
    sourceNames: ["약학정보원", "의약품안전나라"],
    note: "제품명 오인식을 줄이기 위한 덱시부프로펜 300mg 제품명 seed"
  },
  {
    id: "med-ezn6-pro",
    productName: "이지엔6프로연질캡슐",
    aliases: ["이지엔6프로", "이지엔6 프로", "이지엔 프로"],
    ingredients: [{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }],
    dosage: "1캡슐당 300.00mg",
    form: "연질캡슐",
    sourceNames: ["의약품안전나라 e약은요", "공공데이터포털"],
    note: "제품명과 e약은요 복용법에서 덱시부프로펜 1캡슐 함량 보강"
  },
  {
    id: "med-maxibupen-er-300",
    productName: "맥시부펜이알정300밀리그램",
    aliases: ["맥시부펜 이알", "맥시부펜이알정", "맥시부펜 300"],
    ingredients: [{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }],
    dosage: "1정당 300.00mg",
    form: "서방정",
    sourceNames: ["의약품안전나라 e약은요", "공공데이터포털"],
    note: "제품명과 e약은요 복용법에서 덱시부프로펜 1정 함량 보강"
  }
];

export const MEDICATION_PRODUCT_DATABASE: MedicationProductEntry[] = [
  ...CURATED_MEDICATION_PRODUCT_DATABASE,
  ...BULK_MEDICATION_PRODUCT_DATABASE
];

export function searchMedicationProducts(query: string, limit = 5): MedicationSearchResult[] {
  const normalizedQuery = normalizeMedicationName(query);
  if (normalizedQuery.length < 2) return [];

  return MEDICATION_PRODUCT_DATABASE
    .map((entry) => {
      const names = [entry.productName, ...entry.aliases];
      const scored = getBestMedicationNameMatch(query, names);

      return {
        entry,
        matchedName: scored.name,
        score: scored.score
      };
    })
    .filter((result) => isSearchableMedicationMatch(result.score))
    .sort((first, second) => second.score - first.score || first.entry.productName.localeCompare(second.entry.productName))
    .slice(0, limit);
}

export function formatIngredients(ingredients: MedicationIngredient[]): string {
  return ingredients
    .map((ingredient) => `${ingredient.name}${ingredient.dosage ? ` ${ingredient.dosage}` : ""}`)
    .join(" + ");
}
