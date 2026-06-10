import type { RiskLevel } from "./types";

const RANK: Record<RiskLevel, number> = {
  unknown: 0,
  confirmed_candidate: 1,
  needs_check: 2,
  high_risk_candidate: 3
};

export function getHighestRiskLevel(levels: RiskLevel[]): RiskLevel {
  if (levels.length === 0) return "unknown";
  return levels.reduce((highest, current) => (RANK[current] > RANK[highest] ? current : highest), "unknown");
}
