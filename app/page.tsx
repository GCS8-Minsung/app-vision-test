"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, ClipboardList, SearchCheck } from "lucide-react";
import { sessionAuth } from "@/lib/athleteDb";
import { storage } from "@/lib/storage";

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [athleteName, setAthleteName] = useState("");

  useEffect(() => {
    const isAuthed = sessionAuth.isLoggedIn();
    setLoggedIn(isAuthed);
    if (isAuthed) {
      const profile = storage.getProfile();
      setAthleteName(profile?.name ?? "");
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <main className="page-shell">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "#6750a4" }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "#cfbcff" }}
        />
      </div>

      {/* Hero */}
      <section className="section-card mb-5">
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff", marginBottom: 12 }}>
          Clean Check
        </p>
        {loggedIn && athleteName ? (
          <h1 className="text-3xl font-bold leading-tight text-[#e6e0e9] sm:text-4xl">
            안녕하세요,{" "}
            <span style={{ background: "linear-gradient(90deg, #cfbcff, #7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {athleteName}
            </span>{" "}
            선수
          </h1>
        ) : (
          <h1 className="text-3xl font-bold leading-tight text-[#e6e0e9] sm:text-4xl">
            먹기 전{" "}
            <span style={{ background: "linear-gradient(90deg, #cfbcff, #7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              확인
            </span>
            하고,<br />
            먹은 뒤{" "}
            <span style={{ background: "linear-gradient(90deg, #cfbcff, #7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              기록
            </span>
            하세요.
          </h1>
        )}
        <p className="mt-3 text-base leading-7 text-[#cbc4d2]">
          도핑검사 때 필요한 최근 복용 이력을 정리합니다.
        </p>
        <div
          className="mt-3 rounded-xl p-3 text-sm font-medium text-[#cbc4d2]"
          style={{ background: "rgba(148, 142, 156, 0.08)", border: "1px solid rgba(148, 142, 156, 0.15)" }}
        >
          공식 도핑 판정이 아닌 기록 보조 도구입니다.
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {loggedIn ? (
            <>
              <Link href="/upload" className="primary-button flex-1 sm:flex-none" data-testid="start-button">
                <ClipboardList size={17} aria-hidden="true" />
                새 기록 추가
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/dashboard" className="secondary-button flex-1 sm:flex-none">
                <BarChart3 size={17} aria-hidden="true" />
                대시보드로 이동
              </Link>
            </>
          ) : (
            <>
              <Link
                data-testid="start-button"
                href="/onboarding"
                className="primary-button flex-1 sm:flex-none"
              >
                <ClipboardList size={17} aria-hidden="true" />
                기록 시작하기
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/admin" className="secondary-button flex-1 sm:flex-none">
                관리자 페이지
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="m9 12 2 2 4-4" />
              </svg>
            ),
            color: "#cfbcff",
            title: "이미지 업로드",
            desc: "처방전이나 약 봉투를 사진으로 찍어 간편하게 등록하세요."
          },
          {
            icon: <SearchCheck size={22} />,
            color: "#e7c365",
            title: "성분 확인",
            desc: "주의해야 할 성분이 포함되어 있는지 1차적으로 필터링합니다."
          },
          {
            icon: <BarChart3 size={22} />,
            color: "#34d399",
            title: "리포트 생성",
            desc: "최근 7·14·30일 복용 기록을 한눈에 보기 쉬운 리포트로 제공합니다."
          }
        ].map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-start rounded-3xl p-5 gap-3 transition-colors"
            style={{
              background: "#211f24",
              border: "1px solid rgba(255,255,255,0.06)"
            }}
          >
            <div
              className="flex size-12 items-center justify-center rounded-2xl"
              style={{ background: `${f.color}18`, color: f.color }}
            >
              {f.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[#e6e0e9]">{f.title}</h3>
              <p className="mt-1 text-sm leading-5 text-[#cbc4d2]">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
