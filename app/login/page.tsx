"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, LogIn, Shield } from "lucide-react";
import { athleteDb, sessionAuth, toAthleteProfile } from "@/lib/athleteDb";
import { APP_NAME } from "@/lib/constants";
import { formatPhone } from "@/lib/formatPhone";
import { storage, syncStorageWithSupabase } from "@/lib/storage";
import type { RegisteredAthlete } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [name,      setName]      = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone,     setPhone]     = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  function handlePhone(raw: string) {
    setPhone(formatPhone(raw));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !birthDate || !phone.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setLoading(true);

    let athlete: RegisteredAthlete | null = null;
    try {
      const response = await fetch("/api/athletes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "login",
          name,
          birthDate,
          phone
        })
      });
      if (response.ok) {
        const payload = await response.json() as { athlete?: RegisteredAthlete | null };
        athlete = payload.athlete ?? null;
      }
    } catch {
      athlete = null;
    }

    if (!athlete) {
      if (!athleteDb.isSeeded()) athleteDb.seedDemo();
      athlete = athleteDb.findByCredentials(name, birthDate, phone);
    }

    if (!athlete) {
      setError("일치하는 선수 정보를 찾을 수 없습니다. 관리자에게 문의하세요.");
      setLoading(false);
      return;
    }
    sessionAuth.setAthleteId(athlete.id);
    storage.saveProfile(toAthleteProfile(athlete));
    await syncStorageWithSupabase(athlete.id);
    router.replace("/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "3rem 1rem", background: "#141218", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-8rem", left: "50%", transform: "translateX(-50%)",
          width: 480, height: 480, borderRadius: "50%",
          background: "#6750a4", opacity: 0.18, filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-6rem", right: "-6rem",
          width: 320, height: 320, borderRadius: "50%",
          background: "#cfbcff", opacity: 0.08, filter: "blur(60px)",
        }} />
      </div>

      {/* Brand */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 36 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 64, height: 64, borderRadius: 24,
          background: "linear-gradient(135deg,#6750a4,#7c4dff)",
          boxShadow: "0 0 24px rgba(124,77,255,0.4)",
        }}>
          <ClipboardList size={30} color="#fff" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#e6e0e9" }}>{APP_NAME}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#948e9c" }}>선수 복용 기록 & 도핑 리스크 관리</p>
        </div>
      </div>

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1, width: "100%", maxWidth: 380,
        background: "#211f24", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, padding: "28px 28px 24px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
      }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#e6e0e9" }}>로그인</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#948e9c" }}>
          이름, 생년월일, 전화번호로 인증합니다.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="login-name" className="form-label">이름</label>
            <input
              id="login-name" className="form-input"
              placeholder="홍길동" value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name" required
            />
          </div>

          <div>
            <label htmlFor="login-birth" className="form-label">생년월일</label>
            <input
              id="login-birth" className="form-input"
              type="date" value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-phone" className="form-label">전화번호</label>
            <input
              id="login-phone" className="form-input"
              type="tel" placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => handlePhone(e.target.value)}
              autoComplete="tel" required
            />
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 14px",
              background: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.25)",
              borderRadius: 12, color: "#ffb4ab", fontSize: 13,
            }}>
              <svg width="14" height="14" style={{ marginTop: 1, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="primary-button" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
            <LogIn size={16} />
            {loading ? "확인 중…" : "로그인"}
          </button>
        </form>

        {/* Disclaimer */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8, marginTop: 16,
          padding: "10px 14px",
          background: "rgba(30,27,32,0.8)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
        }}>
          <Shield size={12} color="#cfbcff" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 11, color: "#948e9c", lineHeight: 1.5 }}>
            등록된 선수만 로그인할 수 있습니다. 등록 요청은 관리자에게 문의하세요.
          </p>
        </div>
      </div>

      {/* Admin link */}
      <p style={{ position: "relative", zIndex: 1, marginTop: 24, fontSize: 12, color: "#494551" }}>
        관리자이신가요?{" "}
        <a href="/admin" style={{ color: "#948e9c", textDecoration: "underline" }}>관리자 페이지</a>
      </p>
    </div>
  );
}
