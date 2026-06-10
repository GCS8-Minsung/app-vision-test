"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Check, Edit2, Plus, Shield, Trash2, Users, X } from "lucide-react";
import { athleteDb } from "@/lib/athleteDb";
import { ADMIN_PASSCODE, APP_NAME } from "@/lib/constants";
import { createId } from "@/lib/ids";
import type { RegisteredAthlete } from "@/lib/types";

const EMPTY_FORM = { name: "", birthDate: "", phone: "", sport: "", teamName: "" };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState("");

  const [athletes, setAthletes] = useState<RegisteredAthlete[]>([]);
  const [editing, setEditing] = useState<RegisteredAthlete | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (authed) setAthletes(athleteDb.getAll());
  }, [authed]);

  function handleAuth(e: FormEvent) {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setAuthed(true);
    } else {
      setPassError("비밀번호가 올바르지 않습니다.");
    }
  }

  function refreshList() {
    setAthletes(athleteDb.getAll());
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(a: RegisteredAthlete) {
    setEditing(a);
    setForm({ name: a.name, birthDate: a.birthDate, phone: a.phone, sport: a.sport, teamName: a.teamName ?? "" });
    setShowForm(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate || !form.phone.trim() || !form.sport.trim()) {
      return;
    }
    const now = new Date().toISOString();
    const athlete: RegisteredAthlete = {
      id: editing?.id ?? createId("athlete"),
      name: form.name.trim(),
      birthDate: form.birthDate,
      phone: form.phone.trim(),
      sport: form.sport.trim(),
      teamName: form.teamName.trim() || undefined,
      createdAt: editing?.createdAt ?? now,
    };
    athleteDb.save(athlete);
    refreshList();
    setShowForm(false);
    setFeedback(editing ? "선수 정보가 수정되었습니다." : "새 선수가 추가되었습니다.");
    setTimeout(() => setFeedback(""), 3000);
  }

  function handleDelete(id: string) {
    athleteDb.remove(id);
    refreshList();
    setFeedback("선수가 삭제되었습니다.");
    setTimeout(() => setFeedback(""), 3000);
  }

  function handleSeedDemo() {
    athleteDb.seedDemo();
    refreshList();
    setFeedback("데모 데이터 5명이 추가되었습니다.");
    setTimeout(() => setFeedback(""), 3000);
  }

  /* ─── Passcode gate ─── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#141218" }}>
        <div
          className="w-full max-w-sm rounded-3xl p-8 space-y-5"
          style={{ background: "#211f24", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#6750a4,#7c4dff)" }}>
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#e6e0e9]">관리자 인증</h1>
              <p className="text-xs text-[#948e9c]">{APP_NAME}</p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="form-label">관리자 비밀번호</label>
              <input
                id="passcode"
                className="form-input"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="비밀번호 입력"
                required
              />
              {passError && <p className="mt-1.5 text-xs" style={{ color: "#ffb4ab" }}>{passError}</p>}
            </div>
            <button type="submit" className="primary-button w-full">
              <Shield size={16} />
              인증하기
            </button>
          </form>

          <p className="text-center text-xs text-[#494551]">
            <a href="/login" className="text-[#948e9c] hover:underline underline-offset-2">
              선수 로그인으로 이동
            </a>
          </p>
        </div>
      </div>
    );
  }

  /* ─── Admin dashboard ─── */
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto" style={{ background: "#141218", color: "#e6e0e9" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#6750a4,#7c4dff)" }}>
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#e6e0e9]">관리자 패널</h1>
            <p className="text-xs text-[#948e9c]">{APP_NAME}</p>
          </div>
        </div>
        <a href="/login" className="secondary-button" style={{ fontSize: "13px", padding: "8px 16px" }}>
          선수 로그인 페이지
        </a>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="flex items-center gap-2 rounded-xl p-3 mb-5 text-sm font-medium"
          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}
        >
          <Check size={15} />
          {feedback}
        </div>
      )}

      {/* Stats + Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3">
        <div className="metric-card col-span-1">
          <span>등록 선수</span>
          <strong>{athletes.length}</strong>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="primary-button col-span-1 sm:col-span-1"
        >
          <Plus size={16} />
          선수 추가
        </button>
        <button
          type="button"
          onClick={handleSeedDemo}
          className="secondary-button col-span-2 sm:col-span-1"
        >
          <Users size={16} />
          데모 데이터 추가
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div
          className="mb-6 rounded-3xl p-6 space-y-4"
          style={{ background: "#211f24", border: "1px solid rgba(207,188,255,0.15)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#e6e0e9]">
              {editing ? "선수 정보 수정" : "새 선수 등록"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex size-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-[#948e9c]" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="f-name" className="form-label">이름 *</label>
              <input id="f-name" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="f-birth" className="form-label">생년월일 *</label>
              <input id="f-birth" className="form-input" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="f-phone" className="form-label">전화번호 *</label>
              <input id="f-phone" className="form-input" placeholder="010-0000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="f-sport" className="form-label">종목 *</label>
              <input id="f-sport" className="form-input" placeholder="육상, 수영 ..." value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="f-team" className="form-label">소속/팀명</label>
              <input id="f-team" className="form-input" placeholder="선택 사항" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="primary-button flex-1">
                <Check size={16} />
                {editing ? "저장하기" : "추가하기"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="secondary-button">
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Athlete table */}
      {athletes.length === 0 ? (
        <div
          className="rounded-3xl p-10 text-center"
          style={{ background: "#211f24", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-[#cbc4d2]">등록된 선수가 없습니다.</p>
          <p className="text-sm text-[#948e9c] mt-1">
            &apos;데모 데이터 추가&apos; 또는 &apos;선수 추가&apos; 버튼을 눌러 시작하세요.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden" style={{ background: "#211f24", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-[#948e9c]"
            style={{ fontFamily: "JetBrains Mono, monospace", borderBottom: "1px solid #3d4a56" }}
          >
            <span>선수</span>
            <span className="hidden sm:block">전화번호</span>
            <span>종목</span>
            <span>관리</span>
          </div>

          {athletes.map((a, i) => (
            <div
              key={a.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-5 py-3.5 transition-colors hover:bg-white/5"
              style={{ borderBottom: i < athletes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            >
              <div className="min-w-0">
                <p className="font-medium text-[#e6e0e9] truncate">{a.name}</p>
                <p className="text-xs text-[#948e9c] truncate">{a.birthDate}{a.teamName ? ` · ${a.teamName}` : ""}</p>
              </div>
              <span className="hidden sm:block text-sm text-[#cbc4d2]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                {a.phone}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: "rgba(207,188,255,0.1)", color: "#cfbcff", fontFamily: "JetBrains Mono, monospace" }}
              >
                {a.sport}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="flex size-8 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
                  aria-label="수정"
                >
                  <Edit2 size={13} className="text-[#cfbcff]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="flex size-8 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
                  aria-label="삭제"
                >
                  <Trash2 size={13} className="text-[#ffb4ab]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login credentials hint */}
      <div
        className="mt-6 rounded-2xl p-4 text-sm text-[#cbc4d2] space-y-1"
        style={{ background: "rgba(103,80,164,0.08)", border: "1px solid rgba(103,80,164,0.2)" }}
      >
        <p className="font-semibold text-[#cfbcff] text-xs uppercase tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          로그인 방법
        </p>
        <p>선수는 <strong className="text-[#e6e0e9]">이름 + 생년월일 + 전화번호</strong>로 로그인합니다.</p>
        <p>전화번호는 하이픈 유무와 관계없이 입력 가능합니다.</p>
      </div>
    </div>
  );
}
