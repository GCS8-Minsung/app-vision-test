"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Check, Edit2, Plus, Shield, Trash2, Users, X } from "lucide-react";
import { athleteDb } from "@/lib/athleteDb";
import { ADMIN_PASSCODE, APP_NAME } from "@/lib/constants";
import { formatPhone } from "@/lib/formatPhone";
import { createId } from "@/lib/ids";
import type { RegisteredAthlete } from "@/lib/types";

const EMPTY = { name: "", birthDate: "", phone: "", sport: "", teamName: "" };

const S = {
  card: {
    background: "#211f24", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
  } as React.CSSProperties,
  input: {
    display: "block", width: "100%", minHeight: 44, padding: "10px 14px",
    background: "#1d1b20", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#e6e0e9", fontSize: 14, outline: "none",
    fontFamily: "inherit",
  } as React.CSSProperties,
  label: {
    display: "block", marginBottom: 6,
    fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
    color: "#cbc4d2",
  } as React.CSSProperties,
};

export default function AdminPage() {
  const [authed,    setAuthed]    = useState(false);
  const [passcode,  setPasscode]  = useState("");
  const [passError, setPassError] = useState("");
  const [athletes,  setAthletes]  = useState<RegisteredAthlete[]>([]);
  const [editing,   setEditing]   = useState<RegisteredAthlete | null>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [showForm,  setShowForm]  = useState(false);
  const [feedback,  setFeedback]  = useState("");

  useEffect(() => { if (authed) setAthletes(athleteDb.getAll()); }, [authed]);

  function refresh() { setAthletes(athleteDb.getAll()); }

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  }

  function handleAuth(e: FormEvent) {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) setAuthed(true);
    else setPassError("비밀번호가 올바르지 않습니다.");
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(a: RegisteredAthlete) {
    setEditing(a);
    setForm({ name: a.name, birthDate: a.birthDate, phone: a.phone, sport: a.sport, teamName: a.teamName ?? "" });
    setShowForm(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate || !form.phone.trim() || !form.sport.trim()) return;
    const now = new Date().toISOString();
    athleteDb.save({
      id: editing?.id ?? createId("athlete"),
      name: form.name.trim(), birthDate: form.birthDate,
      phone: form.phone.trim(), sport: form.sport.trim(),
      teamName: form.teamName.trim() || undefined,
      createdAt: editing?.createdAt ?? now,
    });
    refresh(); setShowForm(false);
    flash(editing ? "선수 정보가 수정되었습니다." : "새 선수가 추가되었습니다.");
  }

  function handleDelete(id: string) {
    athleteDb.remove(id); refresh(); flash("선수가 삭제되었습니다.");
  }

  function handleSeed() {
    athleteDb.seedDemo(); refresh(); flash("데모 데이터 5명이 추가되었습니다.");
  }

  /* ── Passcode gate ─────────────────────────────── */
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", background: "#141218" }}>
        <div style={{ ...S.card, width: "100%", maxWidth: 360, padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6750a4,#7c4dff)", flexShrink: 0 }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e6e0e9" }}>관리자 인증</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#948e9c" }}>{APP_NAME}</p>
            </div>
          </div>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="passcode" style={S.label}>관리자 비밀번호</label>
              <input id="passcode" type="password" style={S.input} placeholder="비밀번호 입력" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />
              {passError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ffb4ab" }}>{passError}</p>}
            </div>
            <button type="submit" className="primary-button" style={{ width: "100%" }}>
              <Shield size={15} /> 인증하기
            </button>
          </form>
          <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#494551" }}>
            <a href="/login" style={{ color: "#948e9c", textDecoration: "underline" }}>선수 로그인으로 이동</a>
          </p>
        </div>
      </div>
    );
  }

  /* ── Admin dashboard ───────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "#141218", color: "#e6e0e9", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6750a4,#7c4dff)" }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e6e0e9" }}>관리자 패널</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#948e9c" }}>{APP_NAME}</p>
            </div>
          </div>
          <a href="/login" className="secondary-button" style={{ fontSize: 13, padding: "8px 16px", minHeight: "auto" }}>선수 로그인</a>
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", marginBottom: 20, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 12, color: "#34d399", fontSize: 14 }}>
            <Check size={15} /> {feedback}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ ...S.card, padding: "12px 20px", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cbc4d2", marginBottom: 4 }}>등록 선수</span>
            <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: "#e6e0e9" }}>{athletes.length}</span>
          </div>
          <button type="button" onClick={openAdd} className="primary-button">
            <Plus size={16} /> 선수 추가
          </button>
          <button type="button" onClick={handleSeed} className="secondary-button">
            <Users size={16} /> 데모 데이터 추가
          </button>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div style={{ ...S.card, padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e6e0e9" }}>
                {editing ? "선수 정보 수정" : "새 선수 등록"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "none", border: "none", cursor: "pointer", color: "#948e9c" }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <label htmlFor="f-name" style={S.label}>이름 *</label>
                  <input id="f-name" style={S.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label htmlFor="f-birth" style={S.label}>생년월일 *</label>
                  <input id="f-birth" type="date" style={S.input} value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} required />
                </div>
                <div>
                  <label htmlFor="f-phone" style={S.label}>전화번호 *</label>
                  <input id="f-phone" type="tel" placeholder="010-0000-0000" style={S.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} required />
                </div>
                <div>
                  <label htmlFor="f-sport" style={S.label}>종목 *</label>
                  <input id="f-sport" placeholder="육상, 수영 …" style={S.input} value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} required />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="f-team" style={S.label}>소속/팀명</label>
                  <input id="f-team" placeholder="선택 사항" style={S.input} value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  <Check size={15} /> {editing ? "저장하기" : "추가하기"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="secondary-button">취소</button>
              </div>
            </form>
          </div>
        )}

        {/* Athlete list */}
        {athletes.length === 0 ? (
          <div style={{ ...S.card, padding: "40px 24px", textAlign: "center" }}>
            <Users size={36} color="#494551" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontWeight: 600, color: "#cbc4d2" }}>등록된 선수가 없습니다.</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#948e9c" }}>
              &apos;데모 데이터 추가&apos; 또는 &apos;선수 추가&apos; 버튼을 눌러 시작하세요.
            </p>
          </div>
        ) : (
          <div style={{ ...S.card, overflow: "hidden", padding: 0 }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 160px 100px 80px",
              gap: 8, padding: "12px 20px",
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.02em", color: "#948e9c",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span>선수</span>
              <span>전화번호</span>
              <span>종목</span>
              <span>관리</span>
            </div>

            {athletes.map((a, i) => (
              <div key={a.id} style={{
                display: "grid", gridTemplateColumns: "1fr 160px 100px 80px",
                gap: 8, alignItems: "center", padding: "14px 20px",
                borderBottom: i < athletes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                transition: "background 0.15s",
              }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#e6e0e9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#948e9c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.birthDate}{a.teamName ? ` · ${a.teamName}` : ""}
                  </p>
                </div>
                <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12, color: "#cbc4d2" }}>{a.phone}</span>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 9999,
                  fontSize: 11, fontWeight: 600,
                  background: "rgba(207,188,255,0.1)", color: "#cfbcff",
                }}>
                  {a.sport}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" onClick={() => openEdit(a)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#cfbcff" }} aria-label="수정">
                    <Edit2 size={13} />
                  </button>
                  <button type="button" onClick={() => handleDelete(a.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#ffb4ab" }} aria-label="삭제">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login hint */}
        <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(103,80,164,0.08)", border: "1px solid rgba(103,80,164,0.2)", borderRadius: 16 }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: "#cfbcff" }}>
            로그인 방법
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#cbc4d2" }}>
            선수는 <strong style={{ color: "#e6e0e9" }}>이름 + 생년월일 + 전화번호</strong>로 로그인합니다.
            전화번호는 하이픈(-)을 자동으로 입력합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
