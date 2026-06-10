"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, ClipboardList, FileText, Home, LogOut, PlusCircle, User } from "lucide-react";
import { APP_NAME, AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";
import { sessionAuth } from "@/lib/athleteDb";
import { storage } from "@/lib/storage";
import type { AthleteProfile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/upload", label: "기록 추가", icon: PlusCircle },
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/report?days=7", label: "리포트", icon: FileText }
];

export function DesktopSidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);

  useEffect(() => {
    setProfile(storage.getProfile());
  }, [pathname]);

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);
  if (isAuth || isFlow) return null;

  function handleLogout() {
    sessionAuth.clearSession();
    storage.clearAll();
    router.replace("/login");
  }

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 h-full w-80 flex-col z-40 print:hidden"
      style={{
        background: "rgba(21, 19, 25, 0.98)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div
          className="flex size-9 items-center justify-center rounded-xl shrink-0"
          style={{ background: "linear-gradient(135deg, #6750a4 0%, #7c4dff 100%)" }}
        >
          <ClipboardList size={18} className="text-white" />
        </div>
        <span className="text-[15px] font-bold text-[#e6e0e9]">{APP_NAME}</span>
      </div>

      {/* Profile chip */}
      {profile && (
        <div
          className="mx-3 mb-4 flex items-center gap-3 rounded-2xl p-3"
          style={{ background: "#1e262d", border: "1px solid #3d4a56" }}
        >
          <div
            className="flex size-9 items-center justify-center rounded-full shrink-0"
            style={{ background: "linear-gradient(135deg, #6750a4, #7c4dff)" }}
          >
            <User size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#e6e0e9] truncate">{profile.name}</p>
            <p className="text-[11px] text-[#948e9c] truncate">
              {profile.sport}{profile.teamName ? ` · ${profile.teamName}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href.split("?")[0];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-[#cfbcff] font-semibold"
                  : "text-[#cbc4d2] hover:text-[#e6e0e9] hover:bg-white/5"
              )}
              style={active ? { background: "rgba(207, 188, 255, 0.1)" } : {}}
            >
              <Icon size={18} aria-hidden="true" className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[#948e9c] transition-all hover:text-[#e6e0e9] hover:bg-white/5"
        >
          <LogOut size={18} className="shrink-0" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
