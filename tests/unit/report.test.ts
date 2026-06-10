import { describe, expect, it } from "vitest";
import { buildReportData } from "@/lib/report";
import type { AthleteProfile, ExtractedItem, IntakeLog, RiskCheck } from "@/lib/types";

const profile: AthleteProfile = {
  id: "profile_1",
  name: "김도핑",
  birthDate: "2001-03-15",
  sport: "육상",
  teamName: "테스트팀",
  createdAt: "2026-06-01T00:00:00.000Z"
};

const items: ExtractedItem[] = [
  {
    id: "item_1",
    uploadId: "upload_1",
    userId: "profile_1",
    itemName: "콘서타정",
    ingredientName: "methylphenidate",
    dosage: "18mg",
    userConfirmed: true,
    createdAt: "2026-06-10T00:00:00.000Z"
  }
];

const risks: RiskCheck[] = [
  {
    id: "risk_1",
    itemId: "item_1",
    riskLevel: "high_risk_candidate",
    riskReason: "확인 필요",
    recommendedAction: "전문가 상담",
    createdAt: "2026-06-10T00:00:00.000Z"
  }
];

const logs: IntakeLog[] = [
  {
    id: "log_1",
    userId: "profile_1",
    itemId: "item_1",
    intakeStatus: "taken",
    intakeDate: "2026-06-10",
    intakeTime: "09:00",
    dosage: "18mg",
    createdAt: "2026-06-10T00:00:00.000Z"
  },
  {
    id: "log_old",
    userId: "profile_1",
    itemId: "item_1",
    intakeStatus: "taken",
    intakeDate: "2026-06-01",
    intakeTime: "09:00",
    dosage: "18mg",
    createdAt: "2026-06-01T00:00:00.000Z"
  }
];

describe("buildReportData", () => {
  it("includes only records within the selected day range", () => {
    const report = buildReportData({ profile, items, risks, logs, days: 7, now: new Date("2026-06-10T12:00:00+09:00") });
    expect(report.items).toHaveLength(1);
    expect(report.items[0].log.id).toBe("log_1");
  });

  it("joins item and risk data", () => {
    const report = buildReportData({ profile, items, risks, logs, days: 7, now: new Date("2026-06-10T12:00:00+09:00") });
    expect(report.items[0].item?.itemName).toBe("콘서타정");
    expect(report.items[0].risk?.riskLevel).toBe("high_risk_candidate");
  });

  it("counts risk levels", () => {
    const report = buildReportData({ profile, items, risks, logs, days: 7, now: new Date("2026-06-10T12:00:00+09:00") });
    expect(report.counts.high_risk_candidate).toBe(1);
    expect(report.counts.needs_check).toBe(0);
  });

  it("handles empty logs", () => {
    const report = buildReportData({ profile, items, risks, logs: [], days: 7, now: new Date("2026-06-10T12:00:00+09:00") });
    expect(report.items).toEqual([]);
    expect(report.counts.unknown).toBe(0);
  });
});
