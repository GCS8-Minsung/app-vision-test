import { Suspense } from "react";
import { ReportClient } from "./report-client";

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell">
          <div
            className="section-card animate-pulse"
            style={{ minHeight: "160px" }}
          >
            <div
              className="h-3 w-24 rounded-full mb-3"
              style={{ background: "#3d4a56" }}
            />
            <div
              className="h-6 w-40 rounded-full"
              style={{ background: "#3d4a56" }}
            />
          </div>
        </main>
      }
    >
      <ReportClient />
    </Suspense>
  );
}
