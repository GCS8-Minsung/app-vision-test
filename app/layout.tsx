import type { Metadata, Viewport } from "next";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { ContentWrapper } from "@/components/ContentWrapper";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "선수 복용 기록과 확인 필요 항목을 정리하는 모바일 우선 MVP"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141218"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@500&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppHeader />
        <DesktopSidebar />
        <ContentWrapper>{children}</ContentWrapper>
        <BottomNav />
      </body>
    </html>
  );
}
