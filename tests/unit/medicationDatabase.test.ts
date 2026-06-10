import { describe, expect, it } from "vitest";
import { formatIngredients, searchMedicationProducts } from "@/lib/medicationDatabase";

describe("medication product database", () => {
  it("finds product candidates by Korean product name", () => {
    const [result] = searchMedicationProducts("타이레놀 이알");

    expect(result.entry.productName).toBe("타이레놀8시간이알서방정");
    expect(formatIngredients(result.entry.ingredients)).toContain("acetaminophen 650mg");
    expect(result.entry.dosage).toBe("1정당 650mg");
  });

  it("finds high-risk candidate ingredients from product names", () => {
    const [result] = searchMedicationProducts("콘서타정 18mg");

    expect(result.entry.ingredients[0].name).toBe("methylphenidate");
    expect(result.entry.dosage).toBe("1정당 18mg");
  });

  it("returns multiple ingredients for combination products", () => {
    const [result] = searchMedicationProducts("판피린큐");

    expect(result.entry.ingredients.map((ingredient) => ingredient.name)).toContain("methylephedrine");
    expect(formatIngredients(result.entry.ingredients)).toContain("+");
  });
});
