"use client";

import clsx from "clsx";
import Link from "next/link";
import { BarChart3, FileText, Home, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";

const ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/upload", label: "추가", icon: PlusCircle },
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/report?days=7", label: "리포트", icon: FileText }
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);
  if (isAuth || isFlow) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden print:hidden"
      style={{
        background: "rgba(20, 18, 24, 0.96)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {ITEMS.map((item) => {
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
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 min-w-[60px] transition-all",
                active ? "text-[#cfbcff]" : "text-[#948e9c]"
              )}
              style={active ? { background: "rgba(207, 188, 255, 0.1)" } : {}}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
