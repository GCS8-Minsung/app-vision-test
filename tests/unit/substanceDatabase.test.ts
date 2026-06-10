import { describe, expect, it } from "vitest";
import {
  DATABASE_SOURCES,
  findMedicationAlias,
  findSubstanceEntry,
  PROHIBITED_SUBSTANCE_DATABASE
} from "@/lib/substanceDatabase";

describe("substance database", () => {
  it("contains official source metadata", () => {
    expect(DATABASE_SOURCES.map((source) => source.name)).toContain("WADA 2026 Prohibited List");
    expect(DATABASE_SOURCES.map((source) => source.name)).toContain("KADA 금지약물 검색서비스");
  });

  it("maps Korean medicine aliases to ingredients", () => {
    expect(findMedicationAlias("콘서타정 18mg")?.ingredientName).toBe("methylphenidate");
    expect(findMedicationAlias("슈다페드정")?.ingredientName).toBe("pseudoephedrine");
    expect(findMedicationAlias("타이레놀 이알 650mg")?.ingredientName).toBe("acetaminophen");
    expect(findMedicationAlias("벤토린에보할러")?.ingredientName).toBe("salbutamol");
    expect(findMedicationAlias("라식스정")?.ingredientName).toBe("furosemide");
  });

  it("finds substance entries by English and Korean names", () => {
    expect(findSubstanceEntry({ itemName: "제품", ingredientName: "testosterone" })?.wadaClass).toBe("S1 동화작용제");
    expect(findSubstanceEntry({ itemName: "제품", ingredientName: "프레드니솔론" })?.wadaClass).toBe("S9 글루코코르티코이드");
  });

  it("keeps caffeine as a candidate requiring final confirmation", () => {
    const entry = PROHIBITED_SUBSTANCE_DATABASE.find((candidate) => candidate.primaryName === "caffeine");
    expect(entry?.riskLevel).toBe("confirmed_candidate");
  });

  it("includes acetaminophen as a common medicine-box ingredient", () => {
    expect(findSubstanceEntry({ itemName: "", ingredientName: "아세트아미노펜(USP)" })?.primaryName).toBe("acetaminophen");
    expect(findSubstanceEntry({ itemName: "타이레놀 이알", ingredientName: "acetaminophen 650mg" })?.primaryName).toBe("acetaminophen");
  });

  it("connects expanded product aliases to WADA/KADA seed entries", () => {
    expect(findSubstanceEntry({ itemName: "콩코르정", ingredientName: "" })?.primaryName).toBe("bisoprolol");
    expect(findSubstanceEntry({ itemName: "울트라셋정", ingredientName: "" })?.primaryName).toBe("tramadol");
    expect(findSubstanceEntry({ itemName: "판피린큐", ingredientName: "" })?.primaryName).toBe("methylephedrine");
  });
});
