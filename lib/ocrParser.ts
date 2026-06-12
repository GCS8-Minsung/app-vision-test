import type { MedicationProductLookup } from "./medicationProviders/types";

export interface MedicationOcrResult {
  itemName: string;
  ingredientName: string;
  dosage: string;
  intakeAmount?: string;
  hospitalName: string;
  conditionName: string;
  rawText?: string;
  confidence?: number;
  candidateProductNames?: string[];
  matchedMedication?: MedicationProductLookup;
  medicationCandidates?: MedicationProductLookup[];
  databaseMatched?: boolean;
  source: "local-parser" | "filename-fallback" | "empty" | "gemini-vision";
}

const KNOWN_INGREDIENTS = [
  "acetaminophen",
  "paracetamol",
  "아세트아미노펜",
  "methylphenidate",
  "메틸페니데이트",
  "testosterone",
  "테스토스테론",
  "pseudoephedrine",
  "슈도에페드린",
  "salbutamol",
  "살부타몰",
  "prednisolone",
  "프레드니솔론",
  "caffeine",
  "카페인"
];

const DOSAGE_PATTERN = /(\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml|㎎|정|캡슐|스쿱))/i;
const PRODUCT_LABEL_PATTERN = /약\s*이름|제품명|약품명|item|product/i;
const NON_PRODUCT_LINE_PATTERN =
  /일반의약품|정보|유효성분|효능|효과|용법|용량|사용상|주의|경고|저장|방법|사용\s*기한|첨가제|성상|복용|환자|의사|약사|치과/i;

const INGREDIENT_CORRECTIONS = [
  {
    canonical: "아세트아미노펜(USP)",
    aliases: ["acetaminophen", "paracetamol", "아세트아미노펜", "야세트아미노펜", "세트아미노펜"]
  }
];

function normalizeLines(text: string): string[] {
  return text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function stripLabel(line: string): string {
  return line
    .replace(/^[^:：]{0,18}[:：]\s*/, "")
    .replace(/^(약\s*이름|제품명|약품명|성분명|주성분|용량|복용량|병원명|의료기관|질환명|복용\s*목적)\s*/i, "")
    .trim();
}

function findByLabels(lines: string[], labels: RegExp[]): string {
  const match = lines.find((line) => labels.some((label) => label.test(line)));
  return match ? stripLabel(match) : "";
}

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
}

function correctIngredient(text: string): string {
  const normalized = normalizeForMatch(text);
  const correction = INGREDIENT_CORRECTIONS.find((entry) =>
    entry.aliases.some((alias) => normalized.includes(normalizeForMatch(alias)))
  );

  return correction?.canonical ?? "";
}

function findKnownIngredient(text: string): string {
  const lower = text.toLowerCase();
  return correctIngredient(text) || (KNOWN_INGREDIENTS.find((ingredient) => lower.includes(ingredient.toLowerCase())) ?? "");
}

function findDosage(text: string): string {
  return text.match(DOSAGE_PATTERN)?.[1]?.replace(/\s+/g, "") ?? "";
}

function findEffectiveIngredientLine(lines: string[]): string {
  return (
    lines.find((line) => /유효\s*성분|유효성분|주성분|성분명/i.test(line)) ??
    lines.find((line) => correctIngredient(line)) ??
    ""
  );
}

function findIngredient(lines: string[], joined: string): string {
  const labeled = findByLabels(lines, [/성분명/i, /주성분/i, /ingredient/i]);
  return correctIngredient(labeled) || labeled || correctIngredient(findEffectiveIngredientLine(lines)) || findKnownIngredient(joined);
}

function findStrengthFromEffectiveLine(line: string, ingredientName: string): string {
  if (!line || !ingredientName) {
    return "";
  }

  const hasTabletUnit = /1\s*정|한\s*정|정\s*중/i.test(line);
  const compact = line.replace(/\s+/g, "");
  const directMg = compact.match(/(\d+(?:\.\d+)?)(?:mg|㎎)/i);

  if (directMg) {
    return hasTabletUnit ? `1정당 ${directMg[1]}mg` : `${directMg[1]}mg`;
  }

  const noisyAcetaminophen650 = correctIngredient(line) === "아세트아미노펜(USP)" && /650/.test(compact);
  if (noisyAcetaminophen650) {
    return "1정당 650mg";
  }

  return "";
}

function findDosageWithContext(lines: string[], joined: string, ingredientName: string): string {
  if (ingredientName === "아세트아미노펜(USP)" && /650/.test(joined.replace(/\s+/g, ""))) {
    return "1정당 650mg";
  }

  const effectiveLine = findEffectiveIngredientLine(lines);
  const strength = findStrengthFromEffectiveLine(effectiveLine, ingredientName);

  if (strength) {
    return strength;
  }

  const labeled = findByLabels(lines, [/용량/i, /복용량/i, /dosage/i]);
  const labeledDosage = labeled ? findDosage(labeled) : "";

  return labeledDosage || findDosage(joined);
}

function inferItemName(lines: string[], ingredientName: string, dosage: string): string {
  const explicitProduct = findByLabels(lines, [PRODUCT_LABEL_PATTERN]);
  if (explicitProduct && !NON_PRODUCT_LINE_PATTERN.test(explicitProduct)) {
    return explicitProduct;
  }

  const skipped = [/처방전/, /성분표/, /샘플/, /주민/, /카드/, /주소/, NON_PRODUCT_LINE_PATTERN];
  const candidate = lines.find((line) => {
    const normalized = line.toLowerCase();
    const looksLikeMedication = /약|정|캡슐|제품|tablet|capsule/i.test(line);
    return (
      looksLikeMedication &&
      line.length >= 2 &&
      line.length <= 36 &&
      !skipped.some((pattern) => pattern.test(line)) &&
      (!ingredientName || !normalized.includes(ingredientName.toLowerCase())) &&
      (!dosage || !normalized.includes(dosage.toLowerCase()))
    );
  });

  return candidate ? stripLabel(candidate) : "";
}

export function parseMedicationText(text: string, confidence?: number): MedicationOcrResult {
  const lines = normalizeLines(text);
  const joined = lines.join("\n");
  const ingredientName = findIngredient(lines, joined);
  const dosage = findDosageWithContext(lines, joined, ingredientName);
  const itemName = inferItemName(lines, ingredientName, dosage);

  return {
    itemName,
    ingredientName,
    dosage,
    hospitalName: findByLabels(lines, [/병원명/i, /의료기관/i, /hospital/i]),
    conditionName: findByLabels(lines, [/질환명/i, /복용\s*목적/i, /condition/i, /purpose/i]),
    rawText: text,
    confidence,
    source: itemName || ingredientName || dosage ? "local-parser" : "empty"
  };
}

export function hasMeaningfulMedicationInfo(result: MedicationOcrResult): boolean {
  return Boolean(result.itemName.trim() || result.ingredientName.trim() || result.dosage.trim());
}

export function getMedicationInfoScore(result: MedicationOcrResult): number {
  const dosageScore = result.dosage.trim()
    ? /mg|㎎|mcg|g|ml/i.test(result.dosage)
      ? 4
      : 1
    : 0;

  return (
    (result.ingredientName.trim() ? 5 : 0) +
    dosageScore +
    (result.itemName.trim() ? 1 : 0) +
    (result.hospitalName.trim() ? 1 : 0) +
    (result.conditionName.trim() ? 1 : 0)
  );
}
