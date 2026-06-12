"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Check, Database, Download, Edit2, Plus, Shield, Trash2, Upload, Users, X } from "lucide-react";
import { athleteDb } from "@/lib/athleteDb";
import { APP_NAME } from "@/lib/constants";
import { customMedicationProducts } from "@/lib/customMedicationProducts";
import { formatPhone } from "@/lib/formatPhone";
import { createId } from "@/lib/ids";
import type { CustomMedicationProduct } from "@/lib/medicationProviders/types";
import type { RegisteredAthlete } from "@/lib/types";

const EMPTY = { name: "", birthDate: "", phone: "", sport: "", teamName: "" };
const EMPTY_MEDICATION = {
  productName: "",
  aliases: "",
  ingredients: "",
  dosage: "",
  form: "",
  sourceNames: "사용자 보강 DB",
  note: ""
};

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

interface AdminUserOverview {
  id: string;
  name: string;
  birthDate?: string;
  phone?: string;
  sport?: string;
  teamName?: string;
  source: "registered" | "profile" | "records";
  counts: {
    uploads: number;
    items: number;
    substances: number;
    risks: number;
    intakeLogs: number;
  };
  highRiskCount: number;
  lastLoginAt?: string;
  lastActivityAt?: string;
  latestItemName?: string;
  latestIntakeDate?: string;
}

interface AdminAccessLog {
  id: string;
  eventType: string;
  subjectId?: string | null;
  subjectName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface AdminOverview {
  totals: {
    registeredUsers: number;
    activeProfiles: number;
    uploads: number;
    extractedItems: number;
    intakeLogs: number;
    highRiskChecks: number;
    medicationProducts: number;
    adminCustomMedications: number;
    loginSuccessesToday: number;
    failedLoginsToday: number;
    adminLoginsToday: number;
  };
  users: AdminUserOverview[];
  accessLogs: AdminAccessLog[];
}

const EVENT_LABELS: Record<string, string> = {
  athlete_login_success: "선수 로그인 성공",
  athlete_login_failed: "선수 로그인 실패",
  admin_login_success: "관리자 로그인 성공",
  admin_login_failed: "관리자 로그인 실패",
  admin_view: "관리자 화면 조회"
};

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function shortUserAgent(value?: string | null): string {
  if (!value) return "-";
  return value.length > 48 ? `${value.slice(0, 48)}...` : value;
}

export default function AdminPage() {
  const [authed,    setAuthed]    = useState(false);
  const [passcode,  setPasscode]  = useState("");
  const [passError, setPassError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [athletes,  setAthletes]  = useState<RegisteredAthlete[]>([]);
  const [editing,   setEditing]   = useState<RegisteredAthlete | null>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [showForm,  setShowForm]  = useState(false);
  const [feedback,  setFeedback]  = useState("");
  const [medications, setMedications] = useState<CustomMedicationProduct[]>([]);
  const [medicationForm, setMedicationForm] = useState(EMPTY_MEDICATION);
  const [medicationJson, setMedicationJson] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;

    async function loadInitialData() {
      try {
        const athletesResponse = await fetch("/api/athletes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "list", passcode })
        });
        const medicationsResponse = await fetch("/api/admin-medications", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "list", passcode })
        });

        if (!athletesResponse.ok || !medicationsResponse.ok) throw new Error("load failed");

        let athletesPayload = await athletesResponse.json() as { athletes: RegisteredAthlete[] };
        let medicationsPayload = await medicationsResponse.json() as { medications: CustomMedicationProduct[] };

        const localAthletes = athleteDb.getAll();
        if (localAthletes.length > 0) {
          const importResponse = await fetch("/api/athletes", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "import", passcode, athletes: localAthletes })
          });
          if (importResponse.ok) athletesPayload = await importResponse.json() as { athletes: RegisteredAthlete[] };
        }

        const localMedications = customMedicationProducts.getAll();
        if (localMedications.length > 0) {
          const importResponse = await fetch("/api/admin-medications", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "import", passcode, medications: localMedications })
          });
          if (importResponse.ok) medicationsPayload = await importResponse.json() as { medications: CustomMedicationProduct[] };
        }

        const overviewResponse = await fetch("/api/admin/activity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "overview", passcode })
        });
        const overviewPayload = overviewResponse.ok ? await overviewResponse.json() as AdminOverview : null;

        if (cancelled) return;
        setAthletes(athletesPayload.athletes);
        setMedications(medicationsPayload.medications);
        setOverview(overviewPayload);
      } catch {
        if (!cancelled) setFeedback("Supabase 데이터를 불러오지 못했습니다.");
      }
    }

    void loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [authed, passcode]);

  async function requestAthletes(action: "list" | "save" | "delete" | "seed" | "import", body: Record<string, unknown> = {}) {
    const response = await fetch("/api/athletes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, passcode, ...body })
    });
    if (!response.ok) throw new Error("선수 정보를 처리하지 못했습니다.");
    return response.json() as Promise<{ athletes: RegisteredAthlete[] }>;
  }

  async function requestMedications(action: "list" | "save" | "import", body: Record<string, unknown> = {}) {
    const response = await fetch("/api/admin-medications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, passcode, ...body })
    });
    if (!response.ok) throw new Error("의약품 보강 DB를 처리하지 못했습니다.");
    return response.json() as Promise<{ medications: CustomMedicationProduct[] }>;
  }

  async function refreshOverview() {
    try {
      const response = await fetch("/api/admin/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "overview", passcode })
      });
      if (!response.ok) throw new Error("overview failed");
      setOverview(await response.json() as AdminOverview);
    } catch {
      flash("운영 현황을 새로고침하지 못했습니다.");
    }
  }

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setPassError("");
    setAuthLoading(true);
    try {
      const response = await fetch("/api/admin/activity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "admin_login", passcode })
      });

      if (!response.ok) {
        setPassError("비밀번호가 올바르지 않습니다.");
        return;
      }
      setAuthed(true);
    } catch {
      setPassError("관리자 인증을 처리하지 못했습니다.");
    } finally {
      setAuthLoading(false);
    }
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setShowForm(true); }
  function openEdit(a: RegisteredAthlete) {
    setEditing(a);
    setForm({ name: a.name, birthDate: a.birthDate, phone: a.phone, sport: a.sport, teamName: a.teamName ?? "" });
    setShowForm(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate || !form.phone.trim() || !form.sport.trim()) return;
    const now = new Date().toISOString();
    const athlete = {
      id: editing?.id ?? createId("athlete"),
      name: form.name.trim(), birthDate: form.birthDate,
      phone: form.phone.trim(), sport: form.sport.trim(),
      teamName: form.teamName.trim() || undefined,
      createdAt: editing?.createdAt ?? now,
    };

    try {
      const payload = await requestAthletes("save", { athlete });
      setAthletes(payload.athletes);
      setShowForm(false);
      void refreshOverview();
      flash(editing ? "선수 정보가 수정되었습니다." : "새 선수가 추가되었습니다.");
    } catch {
      flash("선수 정보를 저장하지 못했습니다.");
    }
  }

  async function handleDelete(id: string) {
    try {
      const payload = await requestAthletes("delete", { id });
      setAthletes(payload.athletes);
      void refreshOverview();
      flash("선수가 삭제되었습니다.");
    } catch {
      flash("선수를 삭제하지 못했습니다.");
    }
  }

  async function handleSeed() {
    try {
      const payload = await requestAthletes("seed");
      setAthletes(payload.athletes);
      void refreshOverview();
      flash("데모 데이터 5명이 추가되었습니다.");
    } catch {
      flash("데모 데이터를 추가하지 못했습니다.");
    }
  }

  async function handleMedicationSave(e: FormEvent) {
    e.preventDefault();
    if (!medicationForm.productName.trim() || !medicationForm.ingredients.trim()) return;
    const ingredients = medicationForm.ingredients
      .split(/\s*(?:\+|,|，|;|；|\n)\s*/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const dosage = part.match(/(\d+(?:\.\d+)?\s?(?:mg|㎎|mcg|μg|g|ml|iu|정|캡슐))/i)?.[1]?.replace(/\s+/g, "");
        return {
          name: part.replace(/(\d+(?:\.\d+)?\s?(?:mg|㎎|mcg|μg|g|ml|iu|정|캡슐))/i, "").trim(),
          dosage
        };
      })
      .filter((ingredient) => ingredient.name);

    const medication = {
      id: createId("custom-med"),
      productName: medicationForm.productName.trim(),
      aliases: medicationForm.aliases.split(",").map((alias) => alias.trim()).filter(Boolean),
      ingredients,
      dosage: medicationForm.dosage.trim() || undefined,
      form: medicationForm.form.trim() || undefined,
      sourceNames: medicationForm.sourceNames.split(",").map((source) => source.trim()).filter(Boolean),
      note: medicationForm.note.trim() || "관리자 보강 후보"
    };

    try {
      const payload = await requestMedications("save", { medication });
      setMedications(payload.medications);
      setMedicationForm(EMPTY_MEDICATION);
      void refreshOverview();
      flash("의약품 후보가 보강 DB에 추가되었습니다.");
    } catch {
      flash("의약품 후보를 저장하지 못했습니다.");
    }
  }

  async function handleMedicationImport() {
    try {
      const medications = JSON.parse(medicationJson) as CustomMedicationProduct[];
      if (!Array.isArray(medications)) throw new Error("Invalid JSON");
      const payload = await requestMedications("import", { medications });
      setMedications(payload.medications);
      void refreshOverview();
      flash(`${medications.length}개 의약품 후보를 가져왔습니다.`);
    } catch {
      flash("JSON 형식을 확인해주세요.");
    }
  }

  function handleMedicationExport() {
    setMedicationJson(JSON.stringify(medications, null, 2));
    flash("의약품 보강 DB를 JSON으로 내보냈습니다.");
  }

  function handleAccessLogExport() {
    if (!overview) return;
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ["시간", "이벤트", "대상", "IP", "User-Agent"].map(escapeCsv).join(","),
      ...overview.accessLogs.map((log) =>
        [
          log.createdAt,
          EVENT_LABELS[log.eventType] ?? log.eventType,
          log.subjectName ?? log.subjectId ?? "",
          log.ipAddress ?? "",
          log.userAgent ?? ""
        ].map(escapeCsv).join(",")
      )
    ];
    const blob = new Blob([`\uFEFF${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `clean-check-access-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
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
            <button type="submit" className="primary-button" style={{ width: "100%" }} disabled={authLoading}>
              <Shield size={15} /> {authLoading ? "확인 중..." : "인증하기"}
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

        {/* Operations overview */}
        {overview ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
              {[
                { label: "전체 사용자", value: overview.users.length, hint: `등록 ${overview.totals.registeredUsers}명` },
                { label: "오늘 로그인", value: overview.totals.loginSuccessesToday, hint: `실패 ${overview.totals.failedLoginsToday}건` },
                { label: "복용 기록", value: overview.totals.intakeLogs, hint: `업로드 ${overview.totals.uploads}건` },
                { label: "고위험 후보", value: overview.totals.highRiskChecks, hint: "전체 위험 체크 기준" },
                { label: "의약품 DB", value: overview.totals.medicationProducts, hint: `관리자 보강 ${overview.totals.adminCustomMedications}건` }
              ].map((metric) => (
                <div key={metric.label} style={{ ...S.card, padding: "14px 16px" }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.02em", color: "#948e9c" }}>{metric.label}</p>
                  <strong style={{ display: "block", marginTop: 6, fontSize: 26, color: "#e6e0e9", lineHeight: 1 }}>{metric.value}</strong>
                  <span style={{ display: "block", marginTop: 6, fontSize: 12, color: "#cbc4d2" }}>{metric.hint}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, padding: 0, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e6e0e9" }}>전체 사용자 현황</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#948e9c" }}>등록 선수, 온보딩 사용자, 기록 생성 사용자를 통합해 표시합니다.</p>
                </div>
                <button type="button" className="secondary-button" style={{ minHeight: 36, padding: "8px 12px", fontSize: 12 }} onClick={refreshOverview}>
                  새로고침
                </button>
              </div>

              <div style={{ maxHeight: 420, overflow: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1.4fr) 110px 150px 150px 80px", gap: 10, minWidth: 760, padding: "11px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em", color: "#948e9c", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span>사용자</span>
                  <span>최근 접속</span>
                  <span>최근 활동</span>
                  <span>기록</span>
                  <span>위험</span>
                </div>
                {overview.users.length === 0 ? (
                  <div style={{ padding: "28px 20px", color: "#948e9c", fontSize: 14 }}>아직 사용자 기록이 없습니다.</div>
                ) : (
                  overview.users.map((user) => (
                    <div key={user.id} style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1.4fr) 110px 150px 150px 80px", gap: 10, alignItems: "center", minWidth: 760, padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: "#e6e0e9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#948e9c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.birthDate ?? "-"}
                          {user.sport ? ` · ${user.sport}` : ""}
                          {user.teamName ? ` · ${user.teamName}` : ""}
                        </p>
                      </div>
                      <span style={{ fontSize: 12, color: "#cbc4d2" }}>{formatDateTime(user.lastLoginAt)}</span>
                      <span style={{ fontSize: 12, color: "#cbc4d2" }}>
                        {formatDateTime(user.lastActivityAt)}
                        {user.latestItemName ? <span style={{ display: "block", color: "#948e9c" }}>{user.latestItemName}</span> : null}
                      </span>
                      <span style={{ fontSize: 12, color: "#cbc4d2" }}>
                        업로드 {user.counts.uploads} · 약품 {user.counts.items}
                        <span style={{ display: "block", color: "#948e9c" }}>복용 {user.counts.intakeLogs} · 위험 {user.counts.risks}</span>
                      </span>
                      <span style={{ display: "inline-flex", width: "fit-content", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700, background: user.highRiskCount > 0 ? "rgba(255,180,171,0.1)" : "rgba(52,211,153,0.1)", color: user.highRiskCount > 0 ? "#ffb4ab" : "#34d399" }}>
                        {user.highRiskCount}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...S.card, padding: 0, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e6e0e9" }}>접속 기록</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#948e9c" }}>최근 로그인, 로그인 실패, 관리자 조회 이벤트를 표시합니다.</p>
                </div>
                <button type="button" className="secondary-button" style={{ minHeight: 36, padding: "8px 12px", fontSize: 12 }} onClick={handleAccessLogExport}>
                  <Download size={14} /> CSV
                </button>
              </div>

              <div style={{ maxHeight: 340, overflow: "auto" }}>
                {overview.accessLogs.length === 0 ? (
                  <div style={{ padding: "28px 20px", color: "#948e9c", fontSize: 14 }}>아직 접속 기록이 없습니다.</div>
                ) : (
                  overview.accessLogs.slice(0, 40).map((log) => (
                    <div key={log.id} style={{ display: "grid", gridTemplateColumns: "120px 150px minmax(110px, 1fr) minmax(140px, 1fr)", gap: 10, minWidth: 720, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
                      <span style={{ color: "#cbc4d2" }}>{formatDateTime(log.createdAt)}</span>
                      <span style={{ color: log.eventType.includes("failed") ? "#ffb4ab" : "#cfbcff", fontWeight: 700 }}>{EVENT_LABELS[log.eventType] ?? log.eventType}</span>
                      <span style={{ color: "#e6e0e9" }}>{log.subjectName ?? log.subjectId ?? "-"}</span>
                      <span style={{ color: "#948e9c" }}>{log.ipAddress ?? "-"} · {shortUserAgent(log.userAgent)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...S.card, padding: 20, marginBottom: 20, color: "#948e9c", fontSize: 14 }}>
            운영 현황을 불러오는 중입니다.
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

        {/* Medication seed manager */}
        <div style={{ ...S.card, padding: 24, marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Database size={18} color="#cfbcff" />
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e6e0e9" }}>의약품 seed DB 관리</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#948e9c" }}>
                제품명만 인식된 경우 성분·용량 후보를 보강하는 사용자 DB입니다.
              </p>
            </div>
          </div>

          <form onSubmit={handleMedicationSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              <div>
                <label htmlFor="med-product" style={S.label}>제품명 *</label>
                <input id="med-product" style={S.input} value={medicationForm.productName} onChange={(e) => setMedicationForm({ ...medicationForm, productName: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="med-aliases" style={S.label}>alias, 쉼표 구분</label>
                <input id="med-aliases" style={S.input} value={medicationForm.aliases} onChange={(e) => setMedicationForm({ ...medicationForm, aliases: e.target.value })} />
              </div>
              <div>
                <label htmlFor="med-ingredients" style={S.label}>성분 *</label>
                <input id="med-ingredients" placeholder="acetaminophen 650mg + caffeine" style={S.input} value={medicationForm.ingredients} onChange={(e) => setMedicationForm({ ...medicationForm, ingredients: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="med-dosage" style={S.label}>용량/함량</label>
                <input id="med-dosage" placeholder="1정당 650mg" style={S.input} value={medicationForm.dosage} onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })} />
              </div>
              <div>
                <label htmlFor="med-form" style={S.label}>제형</label>
                <input id="med-form" placeholder="정제, 캡슐, 흡입제" style={S.input} value={medicationForm.form} onChange={(e) => setMedicationForm({ ...medicationForm, form: e.target.value })} />
              </div>
              <div>
                <label htmlFor="med-sources" style={S.label}>출처, 쉼표 구분</label>
                <input id="med-sources" style={S.input} value={medicationForm.sourceNames} onChange={(e) => setMedicationForm({ ...medicationForm, sourceNames: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="med-note" style={S.label}>메모</label>
                <input id="med-note" style={S.input} value={medicationForm.note} onChange={(e) => setMedicationForm({ ...medicationForm, note: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="primary-button" style={{ marginTop: 16 }}>
              <Plus size={15} /> 의약품 후보 추가
            </button>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12, marginTop: 20 }}>
            <label htmlFor="med-json" style={S.label}>JSON import / export</label>
            <textarea
              id="med-json"
              className="form-input"
              style={{ minHeight: 120, resize: "vertical" }}
              value={medicationJson}
              onChange={(e) => setMedicationJson(e.target.value)}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="secondary-button" onClick={handleMedicationExport}>
                <Download size={15} /> JSON 내보내기
              </button>
              <button type="button" className="secondary-button" onClick={handleMedicationImport}>
                <Upload size={15} /> JSON 가져오기
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <p style={S.label}>사용자 보강 후보 {medications.length}개</p>
            <div style={{ display: "grid", gap: 8 }}>
              {medications.slice(0, 8).map((medication) => (
                <div key={medication.id} style={{ padding: 12, borderRadius: 12, background: "#1d1b20", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#e6e0e9" }}>{medication.productName}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#cbc4d2" }}>
                    {medication.ingredients.map((ingredient) => `${ingredient.name}${ingredient.dosage ? ` ${ingredient.dosage}` : ""}`).join(" + ")}
                    {medication.dosage ? ` · ${medication.dosage}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
