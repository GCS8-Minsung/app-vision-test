import { isWithinLastDays } from "./dateRange";
import type {
  AthleteProfile,
  ExtractedItem,
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
  days: 7 | 14 | 30;
  now?: Date;
}): ReportData {
  const includedLogs = input.logs
    .filter((log) => isWithinLastDays(log.intakeDate, input.days, input.now))
    .sort((a, b) => `${b.intakeDate} ${b.intakeTime}`.localeCompare(`${a.intakeDate} ${a.intakeTime}`));

  const counts = { ...EMPTY_COUNTS };
  const uploads = input.uploads ?? [];

  const reportItems = includedLogs.map((log) => {
    const item = input.items.find((candidate) => candidate.id === log.itemId) ?? null;
    const risk = item ? input.risks.find((candidate) => candidate.itemId === item.id) ?? null : null;
    const upload = item ? uploads.find((candidate) => candidate.id === item.uploadId) ?? null : null;

    if (risk) {
      counts[risk.riskLevel] += 1;
    }

    return { log, item, risk, upload };
  });

  return {
    profile: input.profile,
    days: input.days,
    generatedAt: (input.now ?? new Date()).toISOString(),
    items: reportItems,
    counts
  };
}
