"use client";

import { usePathname } from "next/navigation";
import { AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);

  if (isAuth)  return <div className="content-auth">{children}</div>;
  if (isFlow)  return <div className="content-flow">{children}</div>;
  return       <div className="content-main">{children}</div>;
}
