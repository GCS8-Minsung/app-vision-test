"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, LogIn, Shield } from "lucide-react";
import { athleteDb, sessionAuth, toAthleteProfile } from "@/lib/athleteDb";
import { APP_NAME } from "@/lib/constants";
import { storage } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !birthDate || !phone.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setLoading(true);

    /* Seed demo data on first login attempt */
    if (!athleteDb.isSeeded()) athleteDb.seedDemo();

    const athlete = athleteDb.findByCredentials(name, birthDate, phone);
    if (!athlete) {
      setError("일치하는 선수 정보를 찾을 수 없습니다. 관리자에게 문의하세요.");
      setLoading(false);
      return;
    }

    sessionAuth.setAthleteId(athlete.id);
    storage.saveProfile(toAthleteProfile(athlete));
    router.replace("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#141218" }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "#6750a4" }} />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full opacity-10 blur-3xl" style={{ background: "#cfbcff" }} />
      </div>

      {/* Brand */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div
          className="flex size-16 items-center justify-center rounded-3xl shadow-glow"
          style={{ background: "linear-gradient(135deg, #6750a4 0%, #7c4dff 100%)" }}
        >
          <ClipboardList size={30} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#e6e0e9]">{APP_NAME}</h1>
          <p className="text-sm text-[#948e9c] mt-1">선수 복용 기록 & 도핑 리스크 관리</p>
        </div>
      </div>

      {/* Login card */}
      <div
        className="w-full max-w-sm rounded-3xl p-7 space-y-5"
        style={{
          background: "#211f24",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)"
        }}
      >
        <div>
          <h2 className="text-lg font-bold text-[#e6e0e9]">로그인</h2>
          <p className="text-sm text-[#948e9c] mt-0.5">이름, 생년월일, 전화번호로 인증합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-name" className="form-label">이름</label>
            <input
              id="login-name"
              className="form-input"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="login-birthDate" className="form-label">생년월일</label>
            <input
              id="login-birthDate"
              className="form-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-phone" className="form-label">전화번호</label>
            <input
              id="login-phone"
              className="form-input"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-xl p-3 text-sm"
              style={{ background: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.25)", color: "#ffb4ab" }}
            >
              <svg width="14" height="14" className="mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="primary-button w-full" disabled={loading}>
            <LogIn size={17} />
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>

        {/* Disclaimer */}
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-xs text-[#948e9c]"
          style={{ background: "rgba(30,38,45,0.8)", border: "1px solid #3d4a56" }}
        >
          <Shield size={12} className="mt-0.5 shrink-0 text-[#cfbcff]" />
          등록된 선수만 로그인할 수 있습니다. 등록 요청은 관리자에게 문의하세요.
        </div>
      </div>

      {/* Admin link */}
      <p className="mt-6 text-xs text-[#494551]">
        관리자이신가요?{" "}
        <a href="/admin" className="text-[#948e9c] underline-offset-2 hover:underline">
          관리자 페이지
        </a>
      </p>
    </div>
  );
}
