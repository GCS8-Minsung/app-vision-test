export interface ParsedSubstanceInput {
  ingredientName: string;
  dosage?: string;
  sourceText: string;
}

const SPLIT_PATTERN = /\s*(?:\+|,|，|\/|;|；|\n|ㆍ|·)\s*/;
const DOSAGE_PATTERN = /(\d+(?:\.\d+)?\s?(?:mg|㎎|mcg|μg|g|ml|iu|정|캡슐|스쿱))/i;

function cleanToken(value: string): string {
  return value
    .replace(/^(주성분|성분명|유효성분)\s*[:：]?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseCompoundIngredients(input: {
  ingredientName?: string;
  dosage?: string;
}): ParsedSubstanceInput[] {
  const raw = input.ingredientName?.trim() ?? "";
  if (!raw) return [];

  const parts = raw
    .split(SPLIT_PATTERN)
    .map(cleanToken)
    .filter(Boolean);

  const unique = new Map<string, ParsedSubstanceInput>();

  parts.forEach((part) => {
    const dosageFromPart = part.match(DOSAGE_PATTERN)?.[1]?.replace(/\s+/g, "") ?? "";
    const ingredientName = cleanToken(part.replace(DOSAGE_PATTERN, ""));
    if (!ingredientName) return;

    const key = ingredientName.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, {
        ingredientName,
        dosage: dosageFromPart || input.dosage?.trim() || undefined,
        sourceText: part
      });
    }
  });

  return [...unique.values()];
}
