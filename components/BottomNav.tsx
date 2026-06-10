"use client";

import Link from "next/link";
import { BarChart3, FileText, Home, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";

const ITEMS = [
  { href: "/",              label: "홈",     icon: Home },
  { href: "/upload",        label: "추가",   icon: PlusCircle },
  { href: "/dashboard",     label: "대시보드",icon: BarChart3 },
  { href: "/report?days=7", label: "리포트", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);
  if (isAuth || isFlow) return null;

  return (
    <nav className="bottom-nav-bar print:hidden">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", width: "100%", padding: "6px 8px" }}>
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href.split("?")[0];
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "8px 16px", borderRadius: 16, minWidth: 60,
                textDecoration: "none", transition: "all 0.15s",
                color: active ? "#cfbcff" : "#948e9c",
                background: active ? "rgba(207,188,255,0.1)" : "transparent",
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
