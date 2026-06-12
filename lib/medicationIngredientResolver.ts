import type { MedicationIngredient } from "./medicationDatabase";

interface ResolveMedicationIngredientInput {
  productName: string;
  existingIngredients?: MedicationIngredient[];
  dosageText?: string;
  useMethodText?: string;
  form?: string;
}

interface ResolvedMedicationIngredients {
  ingredients: MedicationIngredient[];
  dosage?: string;
  form?: string;
}

const SKIP_PARENTHETICAL_PATTERN = /(수출명|수입명|제조원|판매원|보험|포장|성상|첨가제|전문의약품|일반의약품|export|import)/i;
const KNOWN_INGREDIENT_LABELS: Array<{ terms: string[]; label: string }> = [
  { terms: ["덱시부프로펜", "dexibuprofen"], label: "덱시부프로펜(KP)" },
  { terms: ["아세트아미노펜", "acetaminophen", "paracetamol"], label: "아세트아미노펜" },
  { terms: ["이부프로펜", "ibuprofen"], label: "이부프로펜" },
  { terms: ["나프록센", "naproxen"], label: "나프록센" },
  { terms: ["슈도에페드린", "pseudoephedrine"], label: "슈도에페드린" },
  { terms: ["메틸에페드린", "methylephedrine"], label: "메틸에페드린" },
  { terms: ["덱스트로메토르판", "dextromethorphan"], label: "덱스트로메토르판" },
  { terms: ["구아이페네신", "guaifenesin"], label: "구아이페네신" },
  { terms: ["클로르페니라민", "chlorpheniramine"], label: "클로르페니라민" },
  { terms: ["카페인", "caffeine"], label: "카페인" },
  { terms: ["메틸페니데이트", "methylphenidate"], label: "메틸페니데이트" },
  { terms: ["살부타몰", "salbutamol", "albuterol"], label: "살부타몰" },
  { terms: ["프레드니솔론", "prednisolone"], label: "프레드니솔론" },
  { terms: ["덱사메타손", "dexamethasone"], label: "덱사메타손" },
  { terms: ["푸로세미드", "furosemide"], label: "푸로세미드" },
  { terms: ["트라마돌", "tramadol"], label: "트라마돌" }
];

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
}

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function canonicalizeIngredientName(value: string): string {
  const trimmed = cleanText(value)
    .replace(/^(주성분|성분명|유효성분)\s*[:：]?\s*/i, "")
    .replace(/\s*\d+(?:\.\d+)?\s?(?:mg|㎎|밀리그램|밀리그람|mcg|μg|마이크로그램|g|그램)\s*$/i, "")
    .trim();
  const normalized = normalize(trimmed);
  const known = KNOWN_INGREDIENT_LABELS.find((entry) =>
    entry.terms.some((term) => normalized.includes(normalize(term)))
  );

  return known?.label ?? trimmed;
}

function parseIngredientsFromParentheses(productName: string): string[] {
  const ingredients: string[] = [];
  const matches = productName.matchAll(/[（(]([^()（）]+)[）)]/g);

  for (const match of matches) {
    const content = cleanText(match[1] ?? "");
    if (!content || SKIP_PARENTHETICAL_PATTERN.test(content)) continue;

    content
      .split(/\s*(?:\+|,|，|;|；|\/|ㆍ|·|\s및\s)\s*/)
      .map(canonicalizeIngredientName)
      .filter((part) => part.length >= 2 && part.length <= 40)
      .forEach((part) => ingredients.push(part));
  }

  return uniqueValues(ingredients);
}

function parseKnownIngredientsFromText(text: string): string[] {
  const normalizedText = normalize(text);
  return KNOWN_INGREDIENT_LABELS
    .filter((entry) => entry.terms.some((term) => normalizedText.includes(normalize(term))))
    .map((entry) => entry.label);
}

function normalizeUnit(unit: string): "mg" | "mcg" | "g" | null {
  const normalized = unit.toLowerCase();
  if (["mg", "㎎", "밀리그램", "밀리그람"].includes(normalized)) return "mg";
  if (["mcg", "μg", "마이크로그램", "마이크로그람"].includes(normalized)) return "mcg";
  if (["g", "그램"].includes(normalized)) return "g";
  return null;
}

function formatStrength(value: number, unit: "mg" | "mcg" | "g", fixed = false): string {
  const amount = fixed ? value.toFixed(2) : Number.isInteger(value) ? String(value) : String(value);
  return `${amount}${unit}`;
}

function extractStrengthFromProductName(productName: string): string | undefined {
  const matches = [...productName.matchAll(/(\d+(?:\.\d+)?)\s*(밀리그램|밀리그람|mg|㎎|마이크로그램|마이크로그람|mcg|μg|그램|g)/gi)];
  const match = matches.at(-1);
  if (!match) return undefined;

  const value = Number(match[1]);
  const unit = normalizeUnit(match[2] ?? "");
  if (!Number.isFinite(value) || !unit) return undefined;

  return formatStrength(value, unit, /밀리|마이크로|그램|그람/.test(match[2] ?? ""));
}

function extractPerUnitStrengthFromUseMethod(useMethodText: string): string | undefined {
  const text = cleanText(useMethodText);
  const fixedUnitPattern = /(1회|성인)\s*(\d+(?:\.\d+)?)\s*(정|캡슐|연질캡슐|포|스틱)\s*[（(]\s*(\d+(?:\.\d+)?)\s*(mg|㎎|밀리그램|밀리그람|mcg|μg|마이크로그램|마이크로그람|g|그램)\s*[）)]/i;
  const match = text.match(fixedUnitPattern);
  if (!match) return undefined;

  const unitCount = Number(match[2]);
  const totalAmount = Number(match[4]);
  const unit = normalizeUnit(match[5] ?? "");
  if (!Number.isFinite(unitCount) || unitCount <= 0 || !Number.isFinite(totalAmount) || !unit) return undefined;

  return formatStrength(totalAmount / unitCount, unit, true);
}

function inferFormFromProductName(productName: string, fallback?: string): string | undefined {
  if (fallback?.trim()) return fallback.trim();
  const compact = productName.replace(/\s+/g, "");
  const forms = ["연질캡슐", "경질캡슐", "서방정", "필름코팅정", "캡슐", "정", "시럽", "현탁액", "액", "산", "과립", "분말", "흡입제", "주사"];
  return forms.find((form) => compact.includes(form));
}

function getDoseUnitLabel(form?: string): string {
  if (!form) return "1단위";
  if (form.includes("캡슐")) return "1캡슐";
  if (form.includes("정")) return "1정";
  if (form.includes("산") || form.includes("과립") || form.includes("분말")) return "1포";
  if (form.includes("시럽") || form.includes("액")) return "1회";
  return "1단위";
}

export function resolveMedicationIngredients(input: ResolveMedicationIngredientInput): ResolvedMedicationIngredients {
  const productName = cleanText(input.productName);
  const form = inferFormFromProductName(productName, input.form);
  const existingIngredients = input.existingIngredients?.filter((ingredient) => ingredient.name.trim()) ?? [];
  const parsedNames = parseIngredientsFromParentheses(productName);
  const fallbackNames = parsedNames.length > 0 ? parsedNames : parseKnownIngredientsFromText(productName);
  const strength = extractStrengthFromProductName(productName) ?? extractPerUnitStrengthFromUseMethod(input.useMethodText ?? "");
  const sourceIngredients: MedicationIngredient[] = existingIngredients.length > 0
    ? existingIngredients
    : fallbackNames.map((name) => ({ name }));

  const ingredients = sourceIngredients.map((ingredient) => ({
    name: canonicalizeIngredientName(ingredient.name),
    dosage: ingredient.dosage ?? (sourceIngredients.length === 1 ? strength : undefined)
  }));
  const dosage = input.dosageText?.trim()
    || (strength ? `${getDoseUnitLabel(form)}당 ${strength}` : undefined);

  return {
    ingredients,
    dosage,
    form
  };
}
