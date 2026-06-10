import { beforeEach, describe, expect, it } from "vitest";
import { medicationLookupCache } from "@/lib/medicationLookupCache";
import type { MedicationProductLookup } from "@/lib/medicationProviders/types";

const result: MedicationProductLookup = {
  id: "med-tylenol-er-650",
  productName: "타이레놀8시간이알서방정",
  aliases: ["타이레놀 이알"],
  ingredients: [{ name: "acetaminophen", dosage: "650mg" }],
  dosage: "1정당 650mg",
  form: "서방정",
  sourceNames: ["약학정보원"],
  note: "test",
  matchedName: "타이레놀 이알",
  score: 100,
  lookupSource: {
    providerName: "로컬 seed DB",
    sourceUrl: "https://www.health.kr/",
    checkedAt: "2026-06-10T00:00:00.000Z",
    status: "seed"
  }
};

describe("medicationLookupCache", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores and reads lookup results by normalized query", () => {
    medicationLookupCache.set("타이레놀 이알", [result]);

    const cached = medicationLookupCache.get("타이레놀이알");
    expect(cached?.[0].productName).toBe("타이레놀8시간이알서방정");
    expect(cached?.[0].lookupSource.status).toBe("cache");
  });

  it("returns null for broken JSON", () => {
    window.localStorage.setItem("doping-note:medication-lookup-cache", "{broken");
    expect(medicationLookupCache.get("타이레놀")).toBeNull();
  });
});
