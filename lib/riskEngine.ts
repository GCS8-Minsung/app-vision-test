import type { RiskCheck, RiskLevel } from "./types";
import { DATABASE_VERSION, findSubstanceEntry } from "./substanceDatabase";

type RiskResult = Omit<RiskCheck, "id" | "itemId" | "createdAt">;

const COPY: Record<RiskLevel, RiskResult> = {
  confirmed_candidate: {
    riskLevel: "confirmed_candidate",
    riskReason:
      "입력된 정보 기준으로 즉시 고위험 후보로 분류되지는 않았습니다. 단, 최종 확인 결과는 아니며 경기기간, 투여경로, 용량에 따라 달라질 수 있습니다.",
    recommendedAction: "KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요."
  },
  needs_check: {
    riskLevel: "needs_check",
    riskReason:
      "성분명, 용량, 투여경로, 경기기간 여부에 따라 도핑 리스크가 달라질 수 있습니다.",
    recommendedAction: "복용 전 KADA 공식 검색, 약사 또는 의료진 확인을 권장합니다."
  },
  high_risk_candidate: {
    riskLevel: "high_risk_candidate",
    riskReason:
      "금지성분 또는 TUE 확인이 필요할 수 있는 성분 후보가 포함되어 있을 가능성이 있습니다.",
    recommendedAction: "복용 전 반드시 공식 확인 또는 전문가 상담을 진행하세요."
  },
  unknown: {
    riskLevel: "unknown",
    riskReason: "성분 정보가 부족하거나 입력 정보가 불명확하여 판단할 수 없습니다.",
    recommendedAction: "성분표를 다시 확인하거나 약사 또는 의료진에게 문의하세요."
  }
};

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function analyzeRisk(input: {
  itemName: string;
  ingredientName?: string;
  dosage?: string;
}): RiskResult {
  const itemName = input.itemName.trim();
  const ingredientName = input.ingredientName?.trim() ?? "";
  const target = `${itemName} ${ingredientName}`.toLowerCase();

  if (!itemName && !ingredientName) {
    return COPY.unknown;
  }

  if (itemName && !ingredientName) {
    const productMatch = findSubstanceEntry({ itemName, ingredientName });
    if (productMatch) {
      return {
        riskLevel: productMatch.riskLevel,
        riskReason: productMatch.reasonTemplate,
        recommendedAction: productMatch.actionTemplate,
        databaseMatch: {
          substanceName: productMatch.primaryName,
          wadaClass: productMatch.wadaClass,
          sourceNames: productMatch.sourceIds,
          databaseVersion: DATABASE_VERSION
        }
      };
    }

    return COPY.unknown;
  }

  const databaseMatch = findSubstanceEntry({ itemName, ingredientName });
  if (databaseMatch) {
    return {
      riskLevel: databaseMatch.riskLevel,
      riskReason: databaseMatch.reasonTemplate,
      recommendedAction: databaseMatch.actionTemplate,
      databaseMatch: {
        substanceName: databaseMatch.primaryName,
        wadaClass: databaseMatch.wadaClass,
        sourceNames: databaseMatch.sourceIds,
        databaseVersion: DATABASE_VERSION
      }
    };
  }

  if (includesAny(target, ["methylphenidate", "메틸페니데이트", "testosterone", "테스토스테론"])) {
    return COPY.high_risk_candidate;
  }

  if (
    includesAny(target, [
      "pseudoephedrine",
      "슈도에페드린",
      "salbutamol",
      "살부타몰",
      "prednisolone",
      "프레드니솔론"
    ])
  ) {
    return COPY.needs_check;
  }

  if (includesAny(target, ["caffeine", "카페인"])) {
    return COPY.confirmed_candidate;
  }

  return COPY.needs_check;
}
