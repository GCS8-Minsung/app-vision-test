"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_PATHS, FLOW_PATHS } from "@/lib/constants";
import { sessionAuth } from "@/lib/athleteDb";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const isAuth = (AUTH_PATHS as readonly string[]).includes(pathname);
  const isFlow = (FLOW_PATHS as readonly string[]).includes(pathname);

  useEffect(() => {
    if (!isAuth && !sessionAuth.isLoggedIn()) {
      router.replace("/login");
    }
  }, [pathname, isAuth, router]);

  if (isAuth)  return <div className="content-auth">{children}</div>;
  if (isFlow)  return <div className="content-flow">{children}</div>;
  return       <div className="content-main">{children}</div>;
}
