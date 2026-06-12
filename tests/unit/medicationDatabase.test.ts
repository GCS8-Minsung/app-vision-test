import { describe, expect, it } from "vitest";
import {
  MEDICATION_DATABASE_VERSION,
  MEDICATION_PRODUCT_DATABASE,
  formatIngredients,
  searchMedicationProducts
} from "@/lib/medicationDatabase";
import {
  BULK_MEDICATION_BLUEPRINT_COUNT,
  BULK_MEDICATION_PRODUCT_DATABASE
} from "@/lib/medicationSeedBulk";

describe("medication product database", () => {
  it("keeps a large searchable built-in seed set", () => {
    expect(MEDICATION_DATABASE_VERSION).toBe("2026.3-product-seed-ingredient-resolution");
    expect(BULK_MEDICATION_BLUEPRINT_COUNT).toBeGreaterThanOrEqual(100);
    expect(BULK_MEDICATION_PRODUCT_DATABASE.length).toBeGreaterThanOrEqual(500);
    expect(MEDICATION_PRODUCT_DATABASE.length).toBeGreaterThanOrEqual(520);
  });

  it("keeps seed entries structurally usable", () => {
    const ids = new Set(MEDICATION_PRODUCT_DATABASE.map((entry) => entry.id));

    expect(ids.size).toBe(MEDICATION_PRODUCT_DATABASE.length);
    for (const entry of MEDICATION_PRODUCT_DATABASE) {
      expect(entry.productName.trim().length).toBeGreaterThan(0);
      expect(entry.ingredients.length).toBeGreaterThan(0);
      expect(entry.ingredients.every((ingredient) => ingredient.name.trim().length > 0)).toBe(true);
      expect(entry.sourceNames.length).toBeGreaterThan(0);
    }
  });

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

  it("finds common generic seeds by Korean and English names", () => {
    const [amlodipine] = searchMedicationProducts("암로디핀 5mg");
    const [metformin] = searchMedicationProducts("metformin 500mg");
    const [salbutamol] = searchMedicationProducts("살부타몰 흡입제");

    expect(amlodipine.entry.ingredients[0].name).toBe("amlodipine");
    expect(amlodipine.entry.dosage).toContain("5mg");
    expect(metformin.entry.ingredients[0].name).toBe("metformin");
    expect(metformin.entry.dosage).toContain("500mg");
    expect(salbutamol.entry.ingredients[0].name).toBe("salbutamol");
    expect(salbutamol.entry.form).toBe("흡입제");
  });

  it("finds dexibuprofen product content from curated product names", () => {
    const [result] = searchMedicationProducts("이지엔6프로");

    expect(result.entry.productName).toBe("이지엔6프로연질캡슐");
    expect(result.entry.ingredients).toEqual([{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }]);
    expect(result.entry.dosage).toBe("1캡슐당 300.00mg");
  });

  it("keeps Pharmpain Pro distinct from other dexibuprofen products", () => {
    const [result] = searchMedicationProducts("팜페인 프로");

    expect(result.entry.productName).toBe("팜페인프로연질캡슐");
    expect(result.entry.ingredients).toEqual([{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }]);
  });
});
