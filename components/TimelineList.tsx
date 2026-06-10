import { INTAKE_STATUS_LABELS, RISK_LABELS } from "@/lib/constants";
import type { ExtractedItem, IntakeLog, RiskCheck } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";

export function TimelineList({
  logs,
  items,
  risks
}: {
  logs: IntakeLog[];
  items: ExtractedItem[];
  risks: RiskCheck[];
}) {
  const sorted = [...logs].sort(
    (a, b) => `${b.intakeDate} ${b.intakeTime}`.localeCompare(`${a.intakeDate} ${a.intakeTime}`)
  );

  return (
    <div className="space-y-3">
      {sorted.map((log) => {
        const item = items.find((c) => c.id === log.itemId);
        const risk = item ? risks.find((c) => c.itemId === item.id) : undefined;

        return (
          <article
            key={log.id}
            className="flex items-center gap-4 rounded-2xl p-4 transition-colors"
            style={{
              background: "#303b45",
              border: "1px solid rgba(255,255,255,0.06)"
            }}
          >
            {/* Icon area */}
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbc4d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[#e6e0e9] truncate">
                {item?.itemName ?? "이름 없는 기록"}
              </h3>
              <p className="mt-0.5 text-xs text-[#948e9c] truncate">
                {log.intakeDate} {log.intakeTime} · {INTAKE_STATUS_LABELS[log.intakeStatus]}
              </p>
              {item?.ingredientName && (
                <p className="mt-0.5 text-xs text-[#cbc4d2] truncate">{item.ingredientName}</p>
              )}
              {log.dosage && (
                <p className="mt-0.5 text-xs text-[#cbc4d2]">{log.dosage}</p>
              )}
            </div>

            <div className="shrink-0">
              {risk ? (
                <RiskBadge riskLevel={risk.riskLevel} compact />
              ) : (
                <span className="risk-chip-unknown">{RISK_LABELS.unknown}</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
