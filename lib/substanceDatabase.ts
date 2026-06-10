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

export interface SubstanceMatch {
  entry: ProhibitedSubstanceEntry;
  matchedTerm: string;
  matchedBy: "ingredient" | "product_alias";
  productAlias?: string;
}

export const DATABASE_VERSION = "2026.4-expanded-aliases";

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
    id: "s1-danazol",
    primaryName: "danazol",
    aliases: ["danazol"],
    koreanNames: ["다나졸"],
    wadaClass: "S1 동화작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S1 동화작용제 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s1-stanozolol",
    primaryName: "stanozolol",
    aliases: ["stanozolol", "stanazolol"],
    koreanNames: ["스타노졸롤"],
    wadaClass: "S1 동화작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S1 동화작용제 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s1-dhea",
    primaryName: "dhea",
    aliases: ["dhea", "dehydroepiandrosterone", "prasterone"],
    koreanNames: ["디에이치이에이", "프라스테론"],
    wadaClass: "S1 동화작용제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "보충제 등에 표시될 수 있는 S1 동화작용제 계열 성분 후보입니다.",
    actionTemplate: "보충제 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 진행하세요.",
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
    id: "s2-darbepoetin",
    primaryName: "darbepoetin",
    aliases: ["darbepoetin", "darbepoetin alfa"],
    koreanNames: ["다베포에틴"],
    wadaClass: "S2 펩티드호르몬, 성장인자, 관련약물 및 유사제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S2 계열 예시와 일치하거나 유사한 성분 후보입니다.",
    actionTemplate: "복용 또는 투여 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s2-roxadustat",
    primaryName: "roxadustat",
    aliases: ["roxadustat"],
    koreanNames: ["록사두스타트"],
    wadaClass: "S2 펩티드호르몬, 성장인자, 관련약물 및 유사제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "저산소 유도인자 계열로 확인이 필요한 S2 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
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
    id: "s4-meldonium",
    primaryName: "meldonium",
    aliases: ["meldonium", "mildronate"],
    koreanNames: ["멜도니움"],
    wadaClass: "S4 호르몬 및 대사 변조제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S4 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s4-tamoxifen",
    primaryName: "tamoxifen",
    aliases: ["tamoxifen"],
    koreanNames: ["타목시펜"],
    wadaClass: "S4 호르몬 및 대사 변조제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S4 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s4-clomifene",
    primaryName: "clomifene",
    aliases: ["clomifene", "clomiphene"],
    koreanNames: ["클로미펜"],
    wadaClass: "S4 호르몬 및 대사 변조제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S4 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 의료진 확인을 진행하세요.",
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
    id: "s5-hydrochlorothiazide",
    primaryName: "hydrochlorothiazide",
    aliases: ["hydrochlorothiazide", "hctz"],
    koreanNames: ["히드로클로로티아지드", "하이드로클로로티아지드"],
    wadaClass: "S5 이뇨제 및 기타 은폐제",
    scope: "all_times",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S5 이뇨제 계열 예시와 일치하는 성분 후보입니다.",
    actionTemplate: "복용 전 KADA 공식 검색과 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s5-spironolactone",
    primaryName: "spironolactone",
    aliases: ["spironolactone"],
    koreanNames: ["스피로노락톤"],
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
    id: "s6-ephedrine",
    primaryName: "ephedrine",
    aliases: ["ephedrine"],
    koreanNames: ["에페드린"],
    wadaClass: "S6 흥분제",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "감기약 또는 호흡기 증상 약에서 확인이 필요한 S6 흥분제 성분 후보입니다.",
    actionTemplate: "복용 시점, 용량, 경기기간 여부를 확인하고 KADA 공식 검색 또는 약사 상담을 진행하세요.",
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
    id: "s6-amphetamine",
    primaryName: "amphetamine",
    aliases: ["amphetamine", "dextroamphetamine", "lisdexamfetamine"],
    koreanNames: ["암페타민", "덱스트로암페타민", "리스덱삼페타민"],
    wadaClass: "S6 흥분제",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "WADA/KADA 금지목록의 S6 흥분제 계열 예시 또는 유사 성분 후보입니다.",
    actionTemplate: "경기기간 여부와 TUE 필요 여부를 포함해 KADA 공식 검색과 의료진 확인을 진행하세요.",
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
    id: "s7-morphine",
    primaryName: "morphine",
    aliases: ["morphine"],
    koreanNames: ["모르핀"],
    wadaClass: "S7 마약",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "경기기간 중 확인이 필요한 S7 마약성 진통제 성분 후보입니다.",
    actionTemplate: "복용 전 경기기간 여부와 KADA 공식 검색, 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s7-fentanyl",
    primaryName: "fentanyl",
    aliases: ["fentanyl"],
    koreanNames: ["펜타닐"],
    wadaClass: "S7 마약",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "경기기간 중 확인이 필요한 S7 마약성 진통제 성분 후보입니다.",
    actionTemplate: "복용 전 경기기간 여부와 KADA 공식 검색, 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s8-thc",
    primaryName: "tetrahydrocannabinol",
    aliases: ["tetrahydrocannabinol", "thc", "cannabis"],
    koreanNames: ["테트라하이드로칸나비놀", "대마", "카나비스"],
    wadaClass: "S8 카나비노이드",
    scope: "in_competition",
    riskLevel: "high_risk_candidate",
    reasonTemplate: "경기기간 중 확인이 필요한 S8 카나비노이드 성분 후보입니다.",
    actionTemplate: "제품 또는 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 진행하세요.",
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
    id: "s9-dexamethasone",
    primaryName: "dexamethasone",
    aliases: ["dexamethasone"],
    koreanNames: ["덱사메타손"],
    wadaClass: "S9 글루코코르티코이드",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "투여경로와 경기기간에 따라 확인이 필요한 S9 글루코코르티코이드 성분 후보입니다.",
    actionTemplate: "투여경로와 복용 시점을 확인하고 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s9-methylprednisolone",
    primaryName: "methylprednisolone",
    aliases: ["methylprednisolone", "methyl prednisolone"],
    koreanNames: ["메틸프레드니솔론"],
    wadaClass: "S9 글루코코르티코이드",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "투여경로와 경기기간에 따라 확인이 필요한 S9 글루코코르티코이드 성분 후보입니다.",
    actionTemplate: "투여경로와 복용 시점을 확인하고 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "s9-triamcinolone",
    primaryName: "triamcinolone",
    aliases: ["triamcinolone"],
    koreanNames: ["트리암시놀론"],
    wadaClass: "S9 글루코코르티코이드",
    scope: "conditional",
    riskLevel: "needs_check",
    reasonTemplate: "투여경로와 경기기간에 따라 확인이 필요한 S9 글루코코르티코이드 성분 후보입니다.",
    actionTemplate: "투여경로와 복용 시점을 확인하고 KADA 공식 검색 또는 의료진 상담을 진행하세요.",
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
    id: "p1-atenolol",
    primaryName: "atenolol",
    aliases: ["atenolol"],
    koreanNames: ["아테놀롤"],
    wadaClass: "P1 베타차단제",
    scope: "specific_sports",
    riskLevel: "needs_check",
    reasonTemplate: "특정 종목에서 확인이 필요한 P1 베타차단제 성분 후보입니다.",
    actionTemplate: "종목별 적용 여부를 KADA 공식 검색 또는 경기단체 규정으로 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "p1-metoprolol",
    primaryName: "metoprolol",
    aliases: ["metoprolol"],
    koreanNames: ["메토프롤롤"],
    wadaClass: "P1 베타차단제",
    scope: "specific_sports",
    riskLevel: "needs_check",
    reasonTemplate: "특정 종목에서 확인이 필요한 P1 베타차단제 성분 후보입니다.",
    actionTemplate: "종목별 적용 여부를 KADA 공식 검색 또는 경기단체 규정으로 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지목록 소개"]
  },
  {
    id: "p1-bisoprolol",
    primaryName: "bisoprolol",
    aliases: ["bisoprolol"],
    koreanNames: ["비소프롤롤"],
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
    id: "common-ibuprofen",
    primaryName: "ibuprofen",
    aliases: ["ibuprofen"],
    koreanNames: ["이부프로펜"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-naproxen",
    primaryName: "naproxen",
    aliases: ["naproxen", "naproxen sodium"],
    koreanNames: ["나프록센", "나프록센나트륨"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-aspirin",
    primaryName: "aspirin",
    aliases: ["aspirin", "acetylsalicylic acid"],
    koreanNames: ["아스피린", "아세틸살리실산"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-cetirizine",
    primaryName: "cetirizine",
    aliases: ["cetirizine", "levocetirizine"],
    koreanNames: ["세티리진", "레보세티리진"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-loratadine",
    primaryName: "loratadine",
    aliases: ["loratadine"],
    koreanNames: ["로라타딘"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-fexofenadine",
    primaryName: "fexofenadine",
    aliases: ["fexofenadine"],
    koreanNames: ["펙소페나딘"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-dextromethorphan",
    primaryName: "dextromethorphan",
    aliases: ["dextromethorphan", "dxm"],
    koreanNames: ["덱스트로메토르판"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-guaifenesin",
    primaryName: "guaifenesin",
    aliases: ["guaifenesin"],
    koreanNames: ["구아이페네신"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-phenylephrine",
    primaryName: "phenylephrine",
    aliases: ["phenylephrine"],
    koreanNames: ["페닐레프린"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-chlorpheniramine",
    primaryName: "chlorpheniramine",
    aliases: ["chlorpheniramine", "chlorphenamine"],
    koreanNames: ["클로르페니라민", "클로르페니라민말레산염"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-diphenhydramine",
    primaryName: "diphenhydramine",
    aliases: ["diphenhydramine"],
    koreanNames: ["디펜히드라민"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-ambroxol",
    primaryName: "ambroxol",
    aliases: ["ambroxol"],
    koreanNames: ["암브록솔"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-acetylcysteine",
    primaryName: "acetylcysteine",
    aliases: ["acetylcysteine", "n-acetylcysteine", "nac"],
    koreanNames: ["아세틸시스테인", "엔아세틸시스테인"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-famotidine",
    primaryName: "famotidine",
    aliases: ["famotidine"],
    koreanNames: ["파모티딘"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-omeprazole",
    primaryName: "omeprazole",
    aliases: ["omeprazole"],
    koreanNames: ["오메프라졸"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-loperamide",
    primaryName: "loperamide",
    aliases: ["loperamide"],
    koreanNames: ["로페라미드"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-metoclopramide",
    primaryName: "metoclopramide",
    aliases: ["metoclopramide"],
    koreanNames: ["메토클로프라미드"],
    wadaClass: "Not currently in prohibited classes",
    scope: "not_listed_or_monitoring",
    riskLevel: "confirmed_candidate",
    reasonTemplate: "현재 MVP seed DB 기준으로 즉시 고위험 후보로 분류되지는 않는 성분입니다. 단, 제품의 다른 성분과 경기기간 조건은 별도 확인이 필요합니다.",
    actionTemplate: "제품 전체 성분표를 확인하고 KADA 공식 검색 또는 전문가 상담을 통해 최종 확인하세요.",
    sourceIds: ["WADA 2026 Prohibited List", "KADA 금지약물 검색서비스"]
  },
  {
    id: "common-amoxicillin",
    primaryName: "amoxicillin",
    aliases: ["amoxicillin"],
    koreanNames: ["아목시실린"],
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
  // ── ADHD 치료제 (methylphenidate / S6 흥분제) ─────────────────────────────
  {
    productName: "콘서타정",
    aliases: ["콘서타", "concerta"],
    ingredientName: "methylphenidate",
    note: "ADHD 치료제 계열 제품명 alias"
  },
  {
    productName: "페니드정",
    aliases: ["페니드", "penid", "메타데이트", "metadate", "리탈린", "ritalin"],
    ingredientName: "methylphenidate",
    note: "ADHD 치료제 계열 제품명 alias"
  },
  {
    productName: "엘반스",
    aliases: ["elvanse", "vyvanse", "바이반스"],
    ingredientName: "lisdexamfetamine",
    note: "ADHD 치료제 계열 제품명 alias"
  },
  // ── 슈도에페드린 함유 코감기약 (pseudoephedrine / S6 흥분제) ─────────────────
  {
    productName: "콘택골드",
    aliases: ["콘택 골드", "콘택골드캡슐", "contac gold", "contacgold", "contac"],
    ingredientName: "pseudoephedrine",
    note: "종합 감기약 — 슈도에페드린염산염 함유 (S6 흥분제 조건부)"
  },
  {
    productName: "슈다페드정",
    aliases: ["슈다페드", "수다페드", "sudafed"],
    ingredientName: "pseudoephedrine",
    note: "코감기약 계열에서 확인이 필요한 성분 alias"
  },
  {
    productName: "코아레진캡슐",
    aliases: ["코아레진", "코아 레진"],
    ingredientName: "pseudoephedrine",
    note: "슈도에페드린 함유 코감기약 alias"
  },
  {
    productName: "액티피드",
    aliases: ["액티피드정", "actifed"],
    ingredientName: "pseudoephedrine",
    note: "코감기약 계열에서 확인이 필요한 제품명 alias"
  },
  {
    productName: "코싹엘정",
    aliases: ["코싹", "코싹엘", "코싹정", "cosac"],
    ingredientName: "pseudoephedrine",
    note: "코감기약 계열에서 확인이 필요한 제품명 alias"
  },
  {
    productName: "판콜",
    aliases: ["판콜에스", "판콜에이", "판콜", "pancold"],
    ingredientName: "methylephedrine",
    note: "종합 감기약 계열에서 확인이 필요한 제품명 alias"
  },
  {
    productName: "판피린",
    aliases: ["판피린티", "판피린큐", "판피린", "panpyrin"],
    ingredientName: "methylephedrine",
    note: "종합 감기약 계열에서 확인이 필요한 제품명 alias"
  },
  {
    productName: "화콜",
    aliases: ["화콜캡슐", "화콜에스", "hwacol"],
    ingredientName: "methylephedrine",
    note: "종합 감기약 계열에서 확인이 필요한 제품명 alias"
  },
  {
    productName: "콜대원 코프",
    aliases: ["콜대원코프", "콜대원 기침", "coldaeone cough"],
    ingredientName: "dextromethorphan",
    note: "기침약 계열 제품명 alias"
  },
  {
    productName: "타이레놀 콜드",
    aliases: ["타이레놀콜드", "tylenol cold"],
    ingredientName: "pseudoephedrine",
    note: "복합 감기약 계열에서 확인이 필요한 제품명 alias"
  },
  // ── 천식 흡입제 (salbutamol / S3 베타-2 작용제) ───────────────────────────
  {
    productName: "벤토린",
    aliases: ["ventolin", "벤토린흡입액", "벤토린에보할러", "살부타몰 흡입제"],
    ingredientName: "salbutamol",
    note: "천식 흡입제 계열 alias"
  },
  {
    productName: "심비코트",
    aliases: ["symbicort", "심비코트터부헬러"],
    ingredientName: "formoterol",
    note: "천식 흡입제 계열 제품명 alias"
  },
  {
    productName: "세레타이드",
    aliases: ["seretide", "세레타이드디스커스"],
    ingredientName: "salmeterol",
    note: "천식 흡입제 계열 제품명 alias"
  },
  // ── 스테로이드 (prednisolone / S9 글루코코르티코이드) ─────────────────────
  {
    productName: "소론도정",
    aliases: ["소론도", "solondo"],
    ingredientName: "prednisolone",
    note: "스테로이드 계열 제품명 alias"
  },
  {
    productName: "메드롤정",
    aliases: ["메드롤", "medrol"],
    ingredientName: "methylprednisolone",
    note: "글루코코르티코이드 계열 제품명 alias"
  },
  {
    productName: "덱사메타손정",
    aliases: ["덱사메타손", "dexamethasone"],
    ingredientName: "dexamethasone",
    note: "글루코코르티코이드 계열 제품명 alias"
  },
  {
    productName: "트리암시놀론주",
    aliases: ["트리암시놀론", "triamcinolone"],
    ingredientName: "triamcinolone",
    note: "글루코코르티코이드 계열 제품명 alias"
  },
  // ── 이뇨제 및 베타차단제 ───────────────────────────────────────────────────
  {
    productName: "라식스정",
    aliases: ["라식스", "lasix"],
    ingredientName: "furosemide",
    note: "이뇨제 계열 제품명 alias"
  },
  {
    productName: "다이크로짇정",
    aliases: ["다이크로짇", "dichlozid"],
    ingredientName: "hydrochlorothiazide",
    note: "이뇨제 계열 제품명 alias"
  },
  {
    productName: "알닥톤필름코팅정",
    aliases: ["알닥톤", "aldactone"],
    ingredientName: "spironolactone",
    note: "이뇨제 계열 제품명 alias"
  },
  {
    productName: "인데놀정",
    aliases: ["인데놀", "inderal"],
    ingredientName: "propranolol",
    note: "베타차단제 계열 제품명 alias"
  },
  {
    productName: "테놀민정",
    aliases: ["테놀민", "tenormin"],
    ingredientName: "atenolol",
    note: "베타차단제 계열 제품명 alias"
  },
  {
    productName: "콩코르정",
    aliases: ["콩코르", "concor"],
    ingredientName: "bisoprolol",
    note: "베타차단제 계열 제품명 alias"
  },
  // ── 진통제 및 마약성 진통제 ────────────────────────────────────────────────
  {
    productName: "트리돌",
    aliases: ["트리돌캡슐", "tridol"],
    ingredientName: "tramadol",
    note: "마약성 진통제 계열 제품명 alias"
  },
  {
    productName: "울트라셋",
    aliases: ["울트라셋정", "ultracet"],
    ingredientName: "tramadol",
    note: "트라마돌 복합제 계열 제품명 alias"
  },
  {
    productName: "듀로제식",
    aliases: ["듀로제식패치", "durogesic"],
    ingredientName: "fentanyl",
    note: "마약성 진통제 계열 제품명 alias"
  },
  {
    productName: "모르핀",
    aliases: ["morphine", "모르핀주"],
    ingredientName: "morphine",
    note: "마약성 진통제 계열 제품명 alias"
  },
  // ── 해열진통제와 흔한 일반의약품 ─────────────────────────────────────────
  {
    productName: "타이레놀",
    aliases: ["타이레놀정", "타이레놀이알", "타이레놀 8시간", "tylenol", "어린이타이레놀"],
    ingredientName: "acetaminophen",
    note: "아세트아미노펜 단일 성분 제품명 alias"
  },
  {
    productName: "타세놀",
    aliases: ["타세놀정", "타세놀이알", "tacenol"],
    ingredientName: "acetaminophen",
    note: "아세트아미노펜 단일 성분 제품명 alias"
  },
  {
    productName: "써스펜",
    aliases: ["써스펜이알", "suspen"],
    ingredientName: "acetaminophen",
    note: "아세트아미노펜 단일 성분 제품명 alias"
  },
  {
    productName: "부루펜",
    aliases: ["부루펜정", "부루펜시럽", "brufen"],
    ingredientName: "ibuprofen",
    note: "이부프로펜 계열 제품명 alias"
  },
  {
    productName: "애드빌",
    aliases: ["advil", "애드빌정"],
    ingredientName: "ibuprofen",
    note: "이부프로펜 계열 제품명 alias"
  },
  {
    productName: "이지엔6 애니",
    aliases: ["이지엔6애니", "이지엔 애니", "e zn6 any"],
    ingredientName: "ibuprofen",
    note: "이부프로펜 계열 제품명 alias"
  },
  {
    productName: "탁센",
    aliases: ["탁센연질캡슐", "taxen"],
    ingredientName: "naproxen",
    note: "나프록센 계열 제품명 alias"
  },
  {
    productName: "낙센",
    aliases: ["낙센정", "naxen"],
    ingredientName: "naproxen",
    note: "나프록센 계열 제품명 alias"
  },
  {
    productName: "아스피린",
    aliases: ["바이엘아스피린", "아스피린프로텍트", "aspirin protect", "bayer aspirin"],
    ingredientName: "aspirin",
    note: "아스피린 계열 제품명 alias"
  },
  {
    productName: "지르텍",
    aliases: ["zyrtec", "지르텍정"],
    ingredientName: "cetirizine",
    note: "항히스타민제 제품명 alias"
  },
  {
    productName: "씨잘",
    aliases: ["xyzal", "씨잘정"],
    ingredientName: "levocetirizine",
    note: "항히스타민제 제품명 alias"
  },
  {
    productName: "클라리틴",
    aliases: ["claritin", "클라리틴정"],
    ingredientName: "loratadine",
    note: "항히스타민제 제품명 alias"
  },
  {
    productName: "알레그라",
    aliases: ["allegra", "알레그라정"],
    ingredientName: "fexofenadine",
    note: "항히스타민제 제품명 alias"
  },
  {
    productName: "러미라",
    aliases: ["러미라정", "romilar"],
    ingredientName: "dextromethorphan",
    note: "기침약 계열 제품명 alias"
  },
  {
    productName: "뮤테란",
    aliases: ["뮤테란캡슐", "muteran"],
    ingredientName: "acetylcysteine",
    note: "가래약 계열 제품명 alias"
  },
  {
    productName: "무코펙트",
    aliases: ["mucospect", "무코펙트정"],
    ingredientName: "ambroxol",
    note: "가래약 계열 제품명 alias"
  },
  {
    productName: "가스터정",
    aliases: ["가스터", "gaster", "famotidine"],
    ingredientName: "famotidine",
    note: "소화기 증상 제품명 alias"
  },
  {
    productName: "오메드정",
    aliases: ["오메드", "omed", "omeprazole"],
    ingredientName: "omeprazole",
    note: "위산분비 억제제 계열 제품명 alias"
  },
  {
    productName: "로프민",
    aliases: ["로프민캡슐", "로페라미드", "loperamide"],
    ingredientName: "loperamide",
    note: "지사제 계열 제품명 alias"
  },
  {
    productName: "맥페란",
    aliases: ["맥페란정", "macperan"],
    ingredientName: "metoclopramide",
    note: "소화기 증상 제품명 alias"
  },
  {
    productName: "오구멘틴",
    aliases: ["오구멘틴정", "augmentin"],
    ingredientName: "amoxicillin",
    note: "항생제 계열 제품명 alias"
  },
  // ── 모니터링 성분 ─────────────────────────────────────────────────────────
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
  const normalizedTerm = normalize(term);
  if (/^[a-z0-9]+$/.test(normalizedTerm) && normalizedTerm.length <= 3) {
    return target
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .some((token) => token === normalizedTerm);
  }

  return normalize(target).includes(normalizedTerm);
}

function getEntryTerms(entry: ProhibitedSubstanceEntry): string[] {
  return [entry.primaryName, ...entry.aliases, ...entry.koreanNames].sort(
    (first, second) => normalize(second).length - normalize(first).length
  );
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
  return findSubstanceMatch(input)?.entry ?? null;
}

export function findSubstanceMatch(input: {
  itemName: string;
  ingredientName?: string;
}): SubstanceMatch | null {
  const medicationAlias = findMedicationAlias(input.itemName);
  const target = `${input.itemName} ${input.ingredientName ?? ""} ${medicationAlias?.ingredientName ?? ""}`;

  const sortedEntries = [...PROHIBITED_SUBSTANCE_DATABASE].sort((first, second) => {
    const firstLongest = Math.max(...getEntryTerms(first).map((term) => normalize(term).length));
    const secondLongest = Math.max(...getEntryTerms(second).map((term) => normalize(term).length));
    return secondLongest - firstLongest;
  });

  for (const entry of sortedEntries) {
    const matchedTerm = getEntryTerms(entry).find((alias) => containsTerm(target, alias));
    if (matchedTerm) {
      return {
        entry,
        matchedTerm,
        matchedBy: medicationAlias?.ingredientName === entry.primaryName ? "product_alias" : "ingredient",
        productAlias: medicationAlias?.ingredientName === entry.primaryName ? medicationAlias.productName : undefined
      };
    }
  }

  return null;
}

export function getSourceUrl(sourceName: string): string | null {
  return DATABASE_SOURCES.find((source) => source.name === sourceName)?.url ?? null;
}
