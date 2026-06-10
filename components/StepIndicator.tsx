const STEPS = ["선수 정보", "이미지 업로드", "정보 확인"];

export function StepIndicator({ current }: { current: number }) {
  const total = STEPS.length;
  const progress = Math.min(((current + 1) / total) * 100, 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-medium uppercase tracking-widest text-[#cbc4d2]"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {STEPS[current] ?? ""}
        </span>
        <span
          className="text-[11px] font-medium text-[#cfbcff]"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {current + 1} / {total}
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: "#1e262d" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #cfbcff 0%, #7c4dff 100%)"
          }}
        />
      </div>
    </div>
  );
}
