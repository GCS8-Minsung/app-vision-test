import type { MedicationIngredient } from "@/lib/medicationDatabase";

const COLORS = ["#cfbcff", "#34d399", "#e7c365", "#ffb4ab", "#8bd3ff", "#c7f59b"];

function toMilligrams(dosage?: string): number | null {
  if (!dosage) return null;
  const match = dosage.match(/(\d+(?:\.\d+)?)\s*(mg|㎎|mcg|μg|g)\b/i);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;

  const unit = match[2].toLowerCase();
  if (unit === "g") return value * 1000;
  if (unit === "mcg" || unit === "μg") return value / 1000;
  return value;
}

function getWeights(ingredients: MedicationIngredient[]): number[] {
  const parsed = ingredients.map((ingredient) => toMilligrams(ingredient.dosage));
  if (parsed.every((value): value is number => typeof value === "number" && value > 0)) {
    return parsed;
  }
  return ingredients.map(() => 1);
}

export function IngredientCompositionGraph({
  ingredients,
  compact = false
}: {
  ingredients: MedicationIngredient[];
  compact?: boolean;
}) {
  const visibleIngredients = ingredients.filter((ingredient) => ingredient.name.trim());
  if (visibleIngredients.length === 0) return null;

  const weights = getWeights(visibleIngredients);
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;

  return (
    <div
      className={compact ? "space-y-2" : "rounded-xl p-3"}
      style={compact ? undefined : { background: "#1e262d", border: "1px solid #3d4a56" }}
    >
      {!compact && (
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 10 }}>
          성분 비율
        </p>
      )}
      <div className="flex h-3 overflow-hidden rounded-full" style={{ background: "#141218" }}>
        {visibleIngredients.map((ingredient, index) => {
          const percent = (weights[index] / total) * 100;
          return (
            <span
              key={`${ingredient.name}-${index}`}
              title={`${ingredient.name}${ingredient.dosage ? ` ${ingredient.dosage}` : ""}`}
              style={{
                width: `${percent}%`,
                minWidth: visibleIngredients.length > 1 ? 6 : undefined,
                background: COLORS[index % COLORS.length]
              }}
            />
          );
        })}
      </div>
      <div className={compact ? "mt-2 flex flex-wrap gap-1.5" : "mt-3 grid gap-2"}>
        {visibleIngredients.map((ingredient, index) => {
          const percent = Math.round((weights[index] / total) * 100);
          return (
            <div
              key={`${ingredient.name}-${index}`}
              className={compact ? "rounded-full px-2 py-0.5 text-[10px] font-semibold" : "flex items-center justify-between gap-3 text-xs"}
              style={compact
                ? { background: "rgba(255,255,255,0.05)", color: "#cbc4d2", border: "1px solid rgba(255,255,255,0.08)" }
                : { color: "#cbc4d2" }}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">
                  {ingredient.name}
                  {ingredient.dosage ? ` / ${ingredient.dosage}` : ""}
                </span>
              </span>
              {!compact && <span className="shrink-0 text-[#948e9c]">{percent}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
