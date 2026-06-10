"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { APP_NAME, AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";
import { sessionAuth } from "@/lib/athleteDb";
import { storage } from "@/lib/storage";

const FLOW_BACK: Record<string, string> = {
  "/onboarding": "/",
  "/upload": "/dashboard",
  "/review": "/upload"
};

const FLOW_STEPS: Record<string, string> = {
  "/onboarding": "1 / 3",
  "/upload": "2 / 3",
  "/review": "3 / 3"
};

export function AppHeader() {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? "";
  const router = useRouter();

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);

  if (isAuth) return null;

  function handleLogout() {
    sessionAuth.clearSession();
    storage.clearAll();
    router.replace("/login");
  }

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between px-4 transition-all print:hidden",
        !isFlow && "md:pl-[calc(20rem+1rem)]"
      )}
      style={{
        background: "rgba(20,18,24,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {isFlow ? (
        <>
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={() => router.push(FLOW_BACK[pathname] ?? "/dashboard")}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={22} className="text-[#cbc4d2]" />
          </button>
          <span className="text-[15px] font-bold text-[#e6e0e9]">{APP_NAME}</span>
          <span
            className="text-[11px] font-medium text-[#948e9c]"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            {FLOW_STEPS[pathname] ?? ""}
          </span>
        </>
      ) : (
        <>
          <Link
            href="/dashboard"
            aria-label={`${APP_NAME} 대시보드`}
            className="text-[15px] font-bold text-[#e6e0e9] hover:text-white transition-colors"
          >
            {APP_NAME}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#948e9c] transition-colors hover:text-[#e6e0e9] hover:bg-white/10"
            aria-label="로그아웃"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </>
      )}
    </header>
  );
}
