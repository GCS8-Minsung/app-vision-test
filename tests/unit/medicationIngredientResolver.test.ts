import { describe, expect, it } from "vitest";
import { resolveMedicationIngredients } from "@/lib/medicationIngredientResolver";

describe("resolveMedicationIngredients", () => {
  it("extracts Korean ingredient names from EasyDrug product names", () => {
    const resolved = resolveMedicationIngredients({
      productName: "이지엔6프로연질캡슐(덱시부프로펜)(수출명:DAUFENSoftCapsule)",
      useMethodText: "성인은 1회 1캡슐(300 mg), 1일 2~4회 복용합니다."
    });

    expect(resolved.ingredients).toEqual([{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }]);
    expect(resolved.dosage).toBe("1캡슐당 300.00mg");
    expect(resolved.form).toBe("연질캡슐");
  });

  it("extracts strength from Korean product names", () => {
    const resolved = resolveMedicationIngredients({
      productName: "타이레놀정500밀리그람(아세트아미노펜)"
    });

    expect(resolved.ingredients).toEqual([{ name: "아세트아미노펜", dosage: "500.00mg" }]);
    expect(resolved.dosage).toBe("1정당 500.00mg");
  });

  it("does not treat weight based syrup directions as ingredient content", () => {
    const resolved = resolveMedicationIngredients({
      productName: "맥시부펜시럽(덱시부프로펜)",
      useMethodText: "생후 6개월 이상의 소아는 1회 0.4~0.6 mL/kg(5~7 mg/kg) 복용합니다."
    });

    expect(resolved.ingredients).toEqual([{ name: "덱시부프로펜(KP)", dosage: undefined }]);
    expect(resolved.dosage).toBeUndefined();
  });
});
