import { describe, expect, it } from "vitest";
import {
  isReliableProductNameMatch,
  scoreMedicationName
} from "@/lib/medicationNameMatching";
import type { MedicationProductLookup } from "@/lib/medicationProviders/types";

function lookup(input: Partial<MedicationProductLookup>): MedicationProductLookup {
  return {
    id: "test-med",
    productName: "이지엔6프로연질캡슐(덱시부프로펜)",
    aliases: ["이지엔6프로"],
    ingredients: [{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }],
    sourceNames: ["test"],
    note: "test",
    matchedName: "이지엔6프로연질캡슐(덱시부프로펜)",
    score: 90,
    lookupSource: {
      providerName: "test",
      sourceUrl: "test",
      checkedAt: "2026-06-12T00:00:00.000Z",
      status: "seed"
    },
    ...input
  };
}

describe("medication name matching", () => {
  it("does not treat parenthetical ingredient text as a product-name match", () => {
    expect(scoreMedicationName("덱시부프로펜", "이지엔6프로연질캡슐(덱시부프로펜)")).toBeLessThan(45);
    expect(isReliableProductNameMatch("덱시부프로펜", lookup({}))).toBe(false);
  });

  it("keeps brand-name aliases as reliable product-name matches", () => {
    expect(isReliableProductNameMatch("이지엔6 프로", lookup({}))).toBe(true);
    expect(scoreMedicationName("팜페인 프로", "팜페인프로연질캡슐(덱시부프로펜)")).toBeGreaterThanOrEqual(85);
  });
});
