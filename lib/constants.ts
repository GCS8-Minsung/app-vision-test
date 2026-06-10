import type { IntakeStatus, RiskLevel, UploadType } from "./types";

export const APP_NAME = "도핑수첩 MVP";

export const COMMON_DISCLAIMER =
  "본 서비스는 공식 도핑 판정 도구가 아닙니다. 입력된 약물·성분 정보를 바탕으로 확인이 필요한 항목을 정리하는 기록 보조 도구입니다. 최종 확인은 KADA 공식 검색, 의료진, 약사 등 전문가를 통해 진행해야 합니다.";

export const STORAGE_PREFIX = "doping-note:";

export const STORAGE_KEYS = {
  profile: `${STORAGE_PREFIX}profile`,
  uploads: `${STORAGE_PREFIX}uploads`,
  extractedItems: `${STORAGE_PREFIX}items`,
  extractedSubstances: `${STORAGE_PREFIX}substances`,
  riskChecks: `${STORAGE_PREFIX}risk-checks`,
  intakeLogs: `${STORAGE_PREFIX}intake-logs`,
  draftUploadId: `${STORAGE_PREFIX}draft-upload-id`,
  draftOcr: `${STORAGE_PREFIX}draft-ocr`,
  currentItemId: `${STORAGE_PREFIX}current-item-id`,
  currentRiskId: `${STORAGE_PREFIX}current-risk-id`,
  athleteDb: `${STORAGE_PREFIX}athlete-db`,
  sessionAthleteId: `${STORAGE_PREFIX}session-athlete-id`,
  customMedicationProducts: `${STORAGE_PREFIX}custom-medication-products`,
  medicationLookupCache: `${STORAGE_PREFIX}medication-lookup-cache`
} as const;

export const OFFICIAL_CHECK_LINKS = [
  {
    label: "WADA Prohibited List",
    href: "https://www.wada-ama.org/en/prohibited-list"
  },
  {
    label: "KADA 금지약물 검색서비스",
    href: "https://www.kada-ad.or.kr/kada?where=drug/drug_search"
  },
  {
    label: "약학정보원",
    href: "https://www.health.kr/"
  },
  {
    label: "의약품안전나라",
    href: "https://nedrug.mfds.go.kr/"
  }
] as const;

export const ADMIN_PASSCODE = "doping2024";

export const AUTH_PATHS = ["/login", "/admin"] as const;
export const FLOW_PATHS = ["/onboarding", "/upload", "/review"] as const;

export const UPLOAD_TYPE_LABELS: Record<UploadType, string> = {
  medicine_package: "약 봉투/약 상자",
  prescription: "처방전",
  ingredient_label: "성분표/보충제 라벨"
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  confirmed_candidate: "이상 없음 (잠정)",
  needs_check: "확인 필요",
  high_risk_candidate: "고위험 후보",
  unknown: "판정 불가"
};

export const RISK_DESCRIPTIONS: Record<RiskLevel, string> = {
  confirmed_candidate:
    "현재 데이터베이스 기준으로 금지 대상으로 즉시 분류되지 않았습니다. 경기기간·투여경로·용량에 따라 달라질 수 있으니 KADA에서 최종 확인하세요.",
  needs_check: "성분·용량·경기기간 조건에 따라 리스크가 달라질 수 있어 추가 확인이 필요합니다.",
  high_risk_candidate: "금지성분 또는 TUE 관련 확인이 필요할 수 있는 성분이 포함된 것으로 추정됩니다.",
  unknown: "성분 정보가 부족하거나 불명확해 자동 분류할 수 없습니다."
};

export const INTAKE_STATUS_LABELS: Record<IntakeStatus, string> = {
  not_taken: "아직 안 먹음",
  taken: "복용함",
  planned: "복용 예정"
};

export const VERIFICATION_LABELS = {
  ingredient_checked: "성분표 확인함",
  dosage_checked: "용량 확인함",
  competition_period_checked: "경기기간 여부 확인함",
  expert_consult_planned: "전문가 상담 예정",
  expert_consult_done: "전문가 상담 완료"
} as const;
