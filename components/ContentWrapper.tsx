"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <div
      className={clsx(
        "pt-16",
        isFlow ? "pb-12" : "pb-28 md:pb-10 md:pl-80"
      )}
    >
      {children}
    </div>
  );
}
