import type { RiskLevel } from "./types";

export type ProhibitionScope =
  | "all_times"
  | "in_competition"
  | "specific_sports"
  | "conditional"
  | "not_listed_or_monitoring";

export interface SubstanceDatabaseSource {
  name: string;
  url: string;
  lastCheckedAt: string;
  note: string;
}

export interface ProhibitedSubstanceEntry {
  id: string;
  primaryName: string;
  aliases: string[];
  koreanNames: string[];
  wadaClass: string;
  scope: ProhibitionScope;
  riskLevel: RiskLevel;
  reasonTemplate: string;
  actionTemplate: string;
  sourceIds: string[];
}

export interface MedicationAliasEntry {
  productName: string;
  aliases: string[];
  ingredientName: string;
  note: string;
}

export const DATABASE_VERSION = "2026.1-mvp-seed";

export const DATABASE_SOURCES: SubstanceDatabaseSource[] = [
  {
    name: "WADA 2026 Prohibited List",
    url: "https://www.wada-ama.org/en/resources/world-anti-doping-code-and-international-standards/prohibited-list",
    lastCheckedAt: "2026-06-10",
    note: "2026년 1월 1일부터 적용되는 WADA 금지목록 기준"
  },
  {
    name: "KADA 금지목록 소개",
    url: "https://www.kada-ad.or.kr/kada?where=drug/drug_info_method",
    lastCheckedAt: "2026-06-10",
    note: "국내 적용 금지목록 분류와 주요 예시 확인"
  },
  {
    name: "KADA 금지약물 검색서비스",
    url: "https://www.kada-ad.or.kr/kada?where=drug/drug_search",
    lastCheckedAt: "2026-06-10",
    note: "WADA 금지목록과 국내 의약품 정보를 기준으로 검색하는 공식 확인 경로"
  }
];

export const PROHIBITED_SUBSTANCE_DATABASE: ProhibitedSubstanceEntry[] = [
  {
    id: "s1-testosterone",
    primaryName: "testosterone",
    aliases: ["testosterone", "testosterone ester"],
    koreanNames: ["테스토스테론"],
    wadaClass: "S1 동화작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S1 동화작용제 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 또는 투여 전 TUE 필요 여부를 포함해 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s1-nandrolone",
    primaryName: "nandrolone",
    aliases: ["nandrolone", "19-nortestosterone"],
    koreanNames: ["난드롤론"],
    wadaClass: "S1 동화작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S1 동화작용제 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 또는 투여 전 TUE 필요 여부를 포함해 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s1-clenbuterol",
    primaryName: "clenbuterol",
    aliases: ["clenbuterol"],
    koreanNames: ["클렌부테롤"],
    wadaClass: "S1 동화작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "호흡기 질환 치료 과정에서도 사용될 수 있는 S1 동화작용제 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s2-epo",
    primaryName: "erythropoietin",
    aliases: ["erythropoietin", "epo", "pegmolesatide"],
    koreanNames: ["에리트로포이에틴", "페그몰레사타이드"],
    wadaClass: "S2 펩티드호르몬, 성장인자, 관련약물 및 유사제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S2 계열 예시와 일치하거나 유사한 성분 후보입니다.",
    actionTemplate: "복용 또는 투여 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s2-growth-hormone",
    primaryName: "growth hormone",
    aliases: ["growth hormone", "hgh", "somatropin"],
    koreanNames: ["성장호르몬", "소마트로핀"],
    wadaClass: "S2 펩티드호르몬, 성장인자, 관련약물 및 유사제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S2 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 또는 투여 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s3-salbutamol",
    primaryName: "salbutamol",
    aliases: ["salbutamol", "albuterol"],
    koreanNames: ["살부타몰", "알부테롤"],
    wadaClass: "S3 베타-2 작용제",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "천식 치료 등에 쓰일 수 있으나 용량, 투여경로, 경기기간 조건에 따라 확인이 필요한 성분 후보입니다.",
    actionTemplate: "처방 용량과 투여경로를 확인한 뒤 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s3-salmeterol",
    primaryName: "salmeterol",
    aliases: ["salmeterol"],
    koreanNames: ["살메테롤"],
    wadaClass: "S3 베타-2 작용제",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "2026년 금지목록에서 투여 간격과 용량 기준 확인이 중요한 베타-2 작용제 후보입니다.",
    actionTemplate: "처방전의 사용량과 간격을 확인하고 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s3-formoterol",
    primaryName: "formoterol",
    aliases: ["formoterol"],
    koreanNames: ["포르모테롤"],
    wadaClass: "S3 베타-2 작용제",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "천식 치료 등에 쓰일 수 있으나 용량과 투여경로 조건 확인이 필요한 성분 후보입니다.",
    actionTemplate: "처방 용량과 투여경로를 확인한 뒤 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s3-higenamine",
    primaryName: "higenamine",
    aliases: ["higenamine", "norcoclaurine"],
    koreanNames: ["히게나민"],
    wadaClass: "S3 베타-2 작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "보충제 등을 통해 유입될 수 있는 S3 계열 성분 후보입니다.",
    actionTemplate: "보충제 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s4-trimetazidine",
    primaryName: "trimetazidine",
    aliases: ["trimetazidine"],
    koreanNames: ["트리메타지딘"],
    wadaClass: "S4 호르몬 및 대사 변조제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S4 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s4-insulin",
    primaryName: "insulin",
    aliases: ["insulin"],
    koreanNames: ["인슐린"],
    wadaClass: "S4 호르몬 및 대사 변조제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S4 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "질환 치료 목적 사용 여부를 포함해 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s5-furosemide",
    primaryName: "furosemide",
    aliases: ["furosemide"],
    koreanNames: ["푸로세미드", "후로세미드"],
    wadaClass: "S5 이뇨제 및 기타 은폐제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S5 이뇨제 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s6-methylphenidate",
    primaryName: "methylphenidate",
    aliases: ["methylphenidate", "methyl phenidate"],
    koreanNames: ["메틸페니데이트"],
    wadaClass: "S6 흥분제",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "ADHD 치료 과정에서 사용될 수 있는 S6 흥분제 성분 후보입니다.",
    actionTemplate: "경기기간 여부와 TUE 필요 여부를 포함해 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s6-pseudoephedrine",
    primaryName: "pseudoephedrine",
    aliases: ["pseudoephedrine", "pseudo ephedrine"],
    koreanNames: ["슈도에페드린"],
    wadaClass: "S6 흥분제",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "코감기약 등에 쓰일 수 있는 S6 흥분제 성분 후보이며 경기기간과 용량 조건 확인이 필요합니다.",
    actionTemplate: "복용 시점, 1회/1일 용량, 경기기간 여부를 확인하고 KADA 공식 검색 또는 약사 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개", "KADA 금지약물 검색서비스"]
  },
  {
    id: "s6-methylephedrine",
    primaryName: "methylephedrine",
    aliases: ["methylephedrine", "methyl ephedrine"],
    koreanNames: ["메틸에페드린"],
    wadaClass: "S6 흥분제",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "코감기약 등에 쓰일 수 있는 S6 흥분제 성분 후보입니다.",
    actionTemplate: "복용 시점, 용량, 경기기간 여부를 확인하고 KADA 공식 검색 또는 약사 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개", "KADA 금지약물 검색서비스"]
  },
  {
    id: "s6-modafinil",
    primaryName: "modafinil",
    aliases: ["modafinil", "flmodafinil", "fladrafinil", "adrafinil"],
    koreanNames: ["모다피닐", "플모다피닐", "플라드라피닐", "아드라피닐"],
    wadaClass: "S6 흥분제",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S6 흥분제 계열 예시 또는 유사 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s7-tramadol",
    primaryName: "tramadol",
    aliases: ["tramadol"],
    koreanNames: ["트라마돌"],
    wadaClass: "S7 마약",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "경기기간 중 확인이 필요한 S7 마약성 진통제 성분 후보입니다.",
    actionTemplate: "복용 전 경기기간 여부와 KADA 공식 검색, 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s9-prednisolone",
    primaryName: "prednisolone",
    aliases: ["prednisolone"],
    koreanNames: ["프레드니솔론"],
    wadaClass: "S9 글루코코르티코이드",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "투여경로와 경기기간에 따라 확인이 필요한 S9 글루코코르티코이드 성분 후보입니다.",
    actionTemplate: "경구, 주사, 좌약 등 투여경로와 복용 시점을 확인하고 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "p1-propranolol",
    primaryName: "propranolol",
    aliases: ["propranolol"],
    koreanNames: ["프로프라놀롤"],
    wadaClass: "P1 베타차단제",
    scope: "specific_sports",
    riskLevel: "needs_check",
    reasonTemplate: "특정 종목에서 확인이 필요한 P1 베타차단제 성분 후보입니다.",
    actionTemplate: "종목별 적용 여부를 KADA 공식 검색 또는 경기단체 규정으로 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "common-acetaminophen",
    primaryName: "acetaminophen",
    aliases: ["acetaminophen", "paracetamol"],
    koreanNames: ["아세트아미노펜", "아세트아미노펜(USP)"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "monitoring-caffeine",
    primaryName: "caffeine",
    aliases: ["caffeine"],
    koreanNames: ["카페인"],
    wadaClass: "Monitoring / not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  }
];

export const MEDICATION_ALIAS_DATABASE: MedicationAliasEntry[] = [
  {
    productName: "콘서타정",
    aliases: ["콘서타", "concerta"],
    ingredientName: "methylphenidate",
    note: "ADHD 치료제 계열 제품명 alias"
  },
  {
    productName: "페니드정",
    aliases: ["페니드", "penid"],
    ingredientName: "methylphenidate",
    note: "ADHD 치료제 계열 제품명 alias"
  },
  {
    productName: "슈다페드정",
    aliases: ["슈다페드", "sudafed", "코감기약", "감기약"],
    ingredientName: "pseudoephedrine",
    note: "코감기약 계열에서 확인이 필요한 성분 alias"
  },
  {
    productName: "벤토린",
    aliases: ["ventolin", "살부타몰 흡입제"],
    ingredientName: "salbutamol",
    note: "천식 흡입제 계열 alias"
  },
  {
    productName: "소론도정",
    aliases: ["소론도", "solondo"],
    ingredientName: "prednisolone",
    note: "스테로이드 계열 제품명 alias"
  },
  {
    productName: "카페인 정",
    aliases: ["caffeine tablet", "카페인"],
    ingredientName: "caffeine",
    note: "데모 및 보충제 성분표 확인용 alias"
  }
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function containsTerm(target: string, term: string): boolean {
  return normalize(target).includes(normalize(term));
}

export function findMedicationAlias(input: string): MedicationAliasEntry | null {
  return (
    MEDICATION_ALIAS_DATABASE.find((entry) =>
      [entry.productName, ...entry.aliases].some((alias) => containsTerm(input, alias))
    ) ?? null
  );
}

export function findSubstanceEntry(input: {
  itemName: string;
  ingredientName?: string;
}): ProhibitedSubstanceEntry | null {
  const medicationAlias = findMedicationAlias(input.itemName);
  const target = `${input.itemName} ${input.ingredientName ?? ""} ${medicationAlias?.ingredientName ?? ""}`;

  return (
    PROHIBITED_SUBSTANCE_DATABASE.find((entry) =>
      [entry.primaryName, ...entry.aliases, ...entry.koreanNames].some((alias) => containsTerm(target, alias))
    ) ?? null
  );
}
