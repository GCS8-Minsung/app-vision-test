"use client";

import { Check, Printer, Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReportView } from "@/components/ReportView";
import { buildReportData } from "@/lib/report";
import { storage } from "@/lib/storage";
import type { ReportData } from "@/lib/types";

function parseDays(value: string | null): 7 | 14 | 30 {
  if (value === "14") return 14;
  if (value === "30") return 30;
  return 7;
}

export function ReportClient() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const profile = storage.getProfile();
    if (!profile) return;
    setReport(
      buildReportData({
        profile,
        items: storage.getExtractedItems(),
        risks: storage.getRiskChecks(),
        logs: storage.getIntakeLogs(),
        uploads: storage.getUploads(),
        days: parseDays(searchParams?.get("days") ?? null)
      })
    );
  }, [searchParams]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  }

  return (
    <main className="page-shell">
      <div className="no-print mb-4 grid grid-cols-2 gap-3">
        <button
          data-testid="copy-share-link"
          type="button"
          className="secondary-button"
          onClick={copyLink}
        >
          {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
          공유 링크 복사
        </button>
        <button
          data-testid="print-report"
          type="button"
          className="secondary-button"
          onClick={() => window.print()}
        >
          <Printer size={18} aria-hidden="true" />
          PDF로 저장하기
        </button>
      </div>

      {report ? (
        <ReportView report={report} />
      ) : (
        <section data-testid="report-view" className="section-card">
          <h1 className="text-xl font-bold text-[#e6e0e9]">
            리포트를 만들 선수 정보가 없습니다.
          </h1>
          <p className="mt-2 text-sm text-[#cbc4d2]">
            온보딩을 통해 선수 정보를 먼저 입력해주세요.
          </p>
        </section>
      )}
    </main>
  );
}
