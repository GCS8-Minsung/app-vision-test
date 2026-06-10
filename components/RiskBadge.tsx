import clsx from "clsx";
import { RISK_DESCRIPTIONS, RISK_LABELS } from "@/lib/constants";
import type { RiskLevel } from "@/lib/types";

const CHIP_CLASS: Record<RiskLevel, string> = {
  confirmed_candidate: "risk-chip-confirmed",
  needs_check: "risk-chip-needs-check",
  high_risk_candidate: "risk-chip-high-risk",
  unknown: "risk-chip-unknown"
};

const DOT_COLOR: Record<RiskLevel, string> = {
  confirmed_candidate: "#34d399",
  needs_check: "#e7c365",
  high_risk_candidate: "#ffb4ab",
  unknown: "#948e9c"
};

export function RiskBadge({ riskLevel, compact = false }: { riskLevel: RiskLevel; compact?: boolean }) {
  return (
    <div
      data-testid="risk-badge"
      className={clsx(CHIP_CLASS[riskLevel], compact ? "text-[10px]" : "")}
    >
      <span
        className="shrink-0 rounded-full"
        style={{
          width: "6px",
          height: "6px",
          background: DOT_COLOR[riskLevel],
          display: "inline-block"
        }}
        aria-hidden="true"
      />
      <span>{RISK_LABELS[riskLevel]}</span>
      {!compact && (
        <span className="opacity-70 font-normal">
          &nbsp;· {RISK_DESCRIPTIONS[riskLevel]}
        </span>
      )}
    </div>
  );
}
