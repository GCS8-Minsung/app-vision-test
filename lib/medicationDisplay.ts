import type { MedicationIngredient } from "./medicationDatabase";

const DEFAULT_INTAKE_AMOUNT = "1회";

export function formatIngredientNames(ingredients: MedicationIngredient[]): string {
  return ingredients
    .map((ingredient) => ingredient.name.trim())
    .filter(Boolean)
    .join(" + ");
}

export function formatIngredientContentDosage(ingredients: MedicationIngredient[], fallback?: string): string {
  if (ingredients.length === 0) return fallback ?? "";
  if (ingredients.length === 1) return ingredients[0].dosage ?? fallback ?? "";

  return ingredients
    .map((ingredient) => `${ingredient.name}${ingredient.dosage ? ` ${ingredient.dosage}` : ""}`.trim())
    .filter(Boolean)
    .join(" + ");
}

export function formatIngredientsWithDosage(ingredients: MedicationIngredient[]): string {
  return ingredients
    .map((ingredient) => `${ingredient.name}${ingredient.dosage ? ` ${ingredient.dosage}` : ""}`.trim())
    .filter(Boolean)
    .join(" + ");
}

export function inferIntakeAmount(input: { productName?: string; form?: string; dosage?: string }): string {
  const text = `${input.productName ?? ""} ${input.form ?? ""} ${input.dosage ?? ""}`.toLowerCase();

  if (/캡슐|capsule/.test(text)) return "1캡슐";
  if (/정|tablet|tab/.test(text)) return "1정";
  if (/산|과립|분말|powder|granule|포\b/.test(text)) return "1포";
  if (/시럽|액|현탁|solution|syrup|ml/.test(text)) return "1회";
  if (/흡입|에보할러|inhaler|puff/.test(text)) return "1회";
  if (/스쿱|scoop/.test(text)) return "1스쿱";

  return DEFAULT_INTAKE_AMOUNT;
}
