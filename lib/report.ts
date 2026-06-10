import { isWithinLastDays } from "./dateRange";
import type {
  AthleteProfile,
  ExtractedItem,
  ExtractedSubstance,
  IntakeLog,
  ReportData,
  RiskCheck,
  RiskLevel,
  UploadRecord
} from "./types";

const EMPTY_COUNTS: Record<RiskLevel, number> = {
  confirmed_candidate: 0,
  needs_check: 0,
  high_risk_candidate: 0,
  unknown: 0
};

export function buildReportData(input: {
  profile: AthleteProfile;
  items: ExtractedItem[];
  risks: RiskCheck[];
  logs: IntakeLog[];
  uploads?: UploadRecord[];
  substances?: ExtractedSubstance[];
  days: 7 | 14 | 30;
  now?: Date;
}): ReportData {
  const includedLogs = input.logs
    .filter((log) => isWithinLastDays(log.intakeDate, input.days, input.now))
    .sort((a, b) => `${b.intakeDate} ${b.intakeTime}`.localeCompare(`${a.intakeDate} ${a.intakeTime}`));

  const counts = { ...EMPTY_COUNTS };
  const uploads = input.uploads ?? [];
  const substances = input.substances ?? [];

  const reportItems = includedLogs.map((log) => {
    const item = input.items.find((candidate) => candidate.id === log.itemId) ?? null;
    const risks = item ? input.risks.filter((candidate) => candidate.itemId === item.id) : [];
    const risk = risks.find((candidate) => candidate.riskLevel === "high_risk_candidate") ??
      risks.find((candidate) => candidate.riskLevel === "needs_check") ??
      risks.find((candidate) => candidate.riskLevel === "confirmed_candidate") ??
      risks.find((candidate) => candidate.riskLevel === "unknown") ??
      null;
    const itemSubstances = item ? substances.filter((candidate) => candidate.itemId === item.id) : [];
    const upload = item ? uploads.find((candidate) => candidate.id === item.uploadId) ?? null : null;

    if (risks.length > 0) {
      risks.forEach((candidate) => { counts[candidate.riskLevel] += 1; });
    }

    return { log, item, risk, risks, substances: itemSubstances, upload };
  });

  return {
    profile: input.profile,
    days: input.days,
    generatedAt: (input.now ?? new Date()).toISOString(),
    items: reportItems,
    counts
  };
}
