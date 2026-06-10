import { describe, expect, it } from "vitest";
import { analyzeRisk } from "@/lib/riskEngine";

describe("analyzeRisk", () => {
  it.each([
    ["methylphenidate", "high_risk_candidate"],
    ["메틸페니데이트", "high_risk_candidate"],
    ["testosterone", "high_risk_candidate"],
    ["pseudoephedrine", "needs_check"],
    ["슈도에페드린", "needs_check"],
    ["salbutamol", "needs_check"],
    ["prednisolone", "needs_check"],
    ["caffeine", "confirmed_candidate"],
    ["카페인", "confirmed_candidate"]
  ] as const)("%s maps to %s", (ingredientName, expected) => {
    expect(analyzeRisk({ itemName: "테스트 약", ingredientName }).riskLevel).toBe(expected);
  });

  it("returns unknown when only item name exists", () => {
    expect(analyzeRisk({ itemName: "이름만 있는 약" }).riskLevel).toBe("unknown");
  });

  it("uses medication aliases when ingredient is not entered", () => {
    const result = analyzeRisk({ itemName: "콘서타정" });

    expect(result.riskLevel).toBe("high_risk_candidate");
    expect(result.databaseMatch?.substanceName).toBe("methylphenidate");
  });

  it("adds database match metadata for WADA/KADA seed entries", () => {
    const result = analyzeRisk({ itemName: "감기약", ingredientName: "pseudoephedrine" });

    expect(result.riskLevel).toBe("needs_check");
    expect(result.databaseMatch?.wadaClass).toBe("S6 흥분제");
  });

  it("matches acetaminophen medicine-box ingredient without making a high risk candidate", () => {
    const result = analyzeRisk({ itemName: "", ingredientName: "아세트아미노펜(USP)", dosage: "1정당 650mg" });

    expect(result.riskLevel).toBe("confirmed_candidate");
    expect(result.databaseMatch?.substanceName).toBe("acetaminophen");
  });

  it("returns unknown when item and ingredient are blank", () => {
    expect(analyzeRisk({ itemName: " ", ingredientName: " " }).riskLevel).toBe("unknown");
  });

  it("returns needs_check for an unknown ingredient", () => {
    expect(analyzeRisk({ itemName: "테스트 약", ingredientName: "unknown ingredient" }).riskLevel).toBe("needs_check");
  });

  it("does not include blocked decision copy in result text", () => {
    const forbidden = ["안" + "전", "복용 " + "가능", "도핑 " + "아님"];
    const result = analyzeRisk({ itemName: "테스트 약", ingredientName: "caffeine" });
    const copy = `${result.riskReason} ${result.recommendedAction}`;

    forbidden.forEach((term) => expect(copy).not.toContain(term));
  });
});
