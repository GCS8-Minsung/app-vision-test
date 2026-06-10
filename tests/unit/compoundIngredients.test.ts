import { describe, expect, it } from "vitest";
import { parseCompoundIngredients } from "@/lib/compoundIngredients";

describe("parseCompoundIngredients", () => {
  it("splits multiple ingredients by common separators", () => {
    const result = parseCompoundIngredients({
      ingredientName: "acetaminophen 500mg + pseudoephedrine 60mg, chlorpheniramine",
      dosage: "1정"
    });

    expect(result.map((item) => item.ingredientName)).toEqual([
      "acetaminophen",
      "pseudoephedrine",
      "chlorpheniramine"
    ]);
    expect(result[0].dosage).toBe("500mg");
    expect(result[1].dosage).toBe("60mg");
    expect(result[2].dosage).toBe("1정");
  });

  it("returns an empty list when ingredient is blank", () => {
    expect(parseCompoundIngredients({ ingredientName: " " })).toEqual([]);
  });
});
