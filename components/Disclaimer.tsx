import { Info } from "lucide-react";
import { COMMON_DISCLAIMER } from "@/lib/constants";

export function Disclaimer() {
  return (
    <aside
      className="flex gap-3 items-start rounded-2xl p-4 text-sm leading-6"
      style={{
        background: "rgba(30, 38, 45, 0.7)",
        border: "1px solid rgba(148, 142, 156, 0.25)",
        backdropFilter: "blur(8px)"
      }}
    >
      <Info size={16} className="shrink-0 mt-0.5 text-[#948e9c]" aria-hidden="true" />
      <p className="text-[#cbc4d2]">{COMMON_DISCLAIMER}</p>
    </aside>
  );
}
