"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { APP_NAME, AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";
import { sessionAuth } from "@/lib/athleteDb";
import { storage } from "@/lib/storage";

const FLOW_BACK: Record<string, string> = {
  "/onboarding": "/",
  "/upload": "/dashboard",
  "/review": "/upload",
};
const FLOW_STEPS: Record<string, string> = {
  "/onboarding": "1 / 3",
  "/upload": "2 / 3",
  "/review": "3 / 3",
};

export function AppHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);

  if (isAuth) return null;

  function handleLogout() {
    sessionAuth.clearSession();
    storage.clearAll();
    router.replace("/login");
  }

  if (isFlow) {
    return (
      <header className="app-header print:hidden">
        <button
          type="button"
          onClick={() => router.push(FLOW_BACK[pathname] ?? "/dashboard")}
          aria-label="뒤로 가기"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: "50%",
            background: "none", border: "none", cursor: "pointer",
            color: "#cbc4d2", transition: "background 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseOut={(e)  => (e.currentTarget.style.background = "none")}
        >
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#e6e0e9" }}>{APP_NAME}</span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#948e9c", minWidth: 36, textAlign: "right" }}>
          {FLOW_STEPS[pathname] ?? ""}
        </span>
      </header>
    );
  }

  return (
    <header className="app-header app-header-main print:hidden">
      <Link
        href="/dashboard"
        style={{ fontSize: "15px", fontWeight: 700, color: "#e6e0e9", textDecoration: "none" }}
      >
        {APP_NAME}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 9999,
          background: "none", border: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer", color: "#948e9c", fontSize: "13px", fontWeight: 500,
          transition: "all 0.15s",
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = "#e6e0e9"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
        onMouseOut={(e)  => { e.currentTarget.style.color = "#948e9c"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
      >
        <LogOut size={14} />
        로그아웃
      </button>
    </header>
  );
}
