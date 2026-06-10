"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { createId } from "@/lib/ids";
import { storage } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sport, setSport] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = storage.getProfile();
    if (profile) {
      setName(profile.name);
      setBirthDate(profile.birthDate);
      setSport(profile.sport);
      setTeamName(profile.teamName ?? "");
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !birthDate || !sport.trim()) {
      setError("이름, 생년월일, 종목을 입력해주세요.");
      return;
    }
    const existing = storage.getProfile();
    storage.saveProfile({
      id: existing?.id ?? createId("profile"),
      name: name.trim(),
      birthDate,
      sport: sport.trim(),
      teamName: teamName.trim() || undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString()
    });
    router.push("/upload");
  }

  return (
    <main className="flow-shell">
      <StepIndicator current={0} />

      <div className="section-card mt-2">
        <h1 className="text-xl font-bold text-[#e6e0e9] mb-1">선수 정보 입력</h1>
        <p className="text-sm text-[#cbc4d2] mb-6">
          정확한 분석을 위해 정보를 입력해주세요.
        </p>

        <form data-testid="profile-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="form-label">이름</label>
            <input
              id="name"
              className="form-input"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="form-label">생년월일</label>
            <input
              id="birthDate"
              className="form-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="sport" className="form-label">종목</label>
            <input
              id="sport"
              className="form-input"
              placeholder="육상, 수영, 축구 …"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="teamName" className="form-label">소속/팀명</label>
            <input
              id="teamName"
              className="form-input"
              placeholder="선택 사항"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm font-semibold" style={{ color: "#ffb4ab" }}>
              {error}
            </p>
          )}

          {/* Privacy notice */}
          <div
            className="flex gap-2 items-start rounded-xl p-3 text-xs text-[#cbc4d2]"
            style={{ background: "rgba(30, 38, 45, 0.8)", border: "1px solid #3d4a56" }}
          >
            <svg width="14" height="14" className="mt-0.5 shrink-0 text-[#cfbcff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            이름과 생년월일은 본인 기록 식별 용도로만 사용됩니다.
          </div>

          <button type="submit" className="primary-button w-full mt-2">
            다음으로 이동
          </button>
        </form>
      </div>
    </main>
  );
}
