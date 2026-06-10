"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, ClipboardList, FileText, Home, LogOut, PlusCircle, User } from "lucide-react";
import { APP_NAME, AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";
import { sessionAuth } from "@/lib/athleteDb";
import { storage } from "@/lib/storage";
import type { AthleteProfile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/",               label: "홈",       icon: Home },
  { href: "/upload",         label: "기록 추가", icon: PlusCircle },
  { href: "/dashboard",      label: "대시보드",  icon: BarChart3 },
  { href: "/report?days=7",  label: "리포트",    icon: FileText },
];

const ACTIVE_STYLE = {
  background: "rgba(207,188,255,0.1)",
  color: "#cfbcff",
  fontWeight: 700,
} as const;
const IDLE_STYLE = { color: "#cbc4d2" } as const;

export function DesktopSidebar() {
  const pathname = usePathname() ?? "";
  const router   = useRouter();
  const [profile, setProfile] = useState<AthleteProfile | null>(null);

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);

  useEffect(() => { setProfile(storage.getProfile()); }, [pathname]);

  if (isAuth || isFlow) return null;

  function handleLogout() {
    sessionAuth.clearSession();
    storage.clearAll();
    router.replace("/login");
  }

  return (
    <aside className="desktop-sidebar print:hidden">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 20px 20px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg,#6750a4,#7c4dff)",
        }}>
          <ClipboardList size={17} color="#fff" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#e6e0e9" }}>{APP_NAME}</span>
      </div>

      {/* Profile chip */}
      {profile && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          margin: "0 12px 16px",
          padding: "12px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#6750a4,#7c4dff)",
          }}>
            <User size={14} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#e6e0e9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.name}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "#948e9c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.sport}{profile.teamName ? ` · ${profile.teamName}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href.split("?")[0];
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", borderRadius: 12,
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                transition: "all 0.15s",
                ...(active ? ACTIVE_STYLE : IDLE_STYLE),
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "0 12px 24px" }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", padding: "10px 16px", borderRadius: 12,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 500, color: "#948e9c",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "#e6e0e9"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseOut={(e)  => { e.currentTarget.style.color = "#948e9c"; e.currentTarget.style.background = "none"; }}
        >
          <LogOut size={17} />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
