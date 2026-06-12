import { NextResponse, type NextRequest } from "next/server";
import { writeAccessLog } from "@/lib/accessLogServer";
import { ADMIN_PASSCODE } from "@/lib/constants";
import { createSupabaseAdminServerClient, hasSupabaseAdminConfig } from "@/lib/supabaseServer";
import type { RegisteredAthlete } from "@/lib/types";

interface AppRecordRow {
  record_type: string;
  record_id: string;
  user_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface AccessLogRow {
  id: string;
  event_type: string;
  subject_id: string | null;
  subject_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface UserOverview {
  id: string;
  name: string;
  birthDate?: string;
  phone?: string;
  sport?: string;
  teamName?: string;
  createdAt?: string;
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

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function requireSupabase() {
  if (!hasSupabaseAdminConfig()) throw new Error("Supabase admin configuration is missing.");
  return createSupabaseAdminServerClient();
}

function isAdmin(passcode?: string): boolean {
  return passcode === ADMIN_PASSCODE;
}

function maxDate(first?: string, second?: string): string | undefined {
  if (!first) return second;
  if (!second) return first;
  return new Date(first).getTime() >= new Date(second).getTime() ? first : second;
}

function ensureUser(map: Map<string, UserOverview>, id: string): UserOverview {
  const existing = map.get(id);
  if (existing) return existing;

  const next: UserOverview = {
    id,
    name: "이름 없는 사용자",
    source: "records",
    counts: {
      uploads: 0,
      items: 0,
      substances: 0,
      risks: 0,
      intakeLogs: 0
    },
    highRiskCount: 0
  };
  map.set(id, next);
  return next;
}

function assignAthlete(user: UserOverview, athlete: Partial<RegisteredAthlete>, source: UserOverview["source"]) {
  user.name = athlete.name ?? user.name;
  user.birthDate = athlete.birthDate ?? user.birthDate;
  user.phone = athlete.phone ?? user.phone;
  user.sport = athlete.sport ?? user.sport;
  user.teamName = athlete.teamName ?? user.teamName;
  user.createdAt = athlete.createdAt ?? user.createdAt;
  if (source === "registered" || user.source !== "registered") user.source = source;
}

function toClientLog(row: AccessLogRow) {
  return {
    id: row.id,
    eventType: row.event_type,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    metadata: row.metadata,
    createdAt: row.created_at
  };
}

async function buildOverview() {
  const supabase = requireSupabase();
  const [recordsResult, logsResult, medicationResult, customMedicationResult] = await Promise.all([
    supabase
      .from("app_records")
      .select("record_type,record_id,user_id,payload,created_at,updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("access_logs")
      .select("id,event_type,subject_id,subject_name,ip_address,user_agent,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("medication_products")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("medication_products")
      .select("id", { count: "exact", head: true })
      .eq("source", "admin_custom")
  ]);

  if (recordsResult.error) throw recordsResult.error;
  if (logsResult.error) throw logsResult.error;
  if (medicationResult.error) throw medicationResult.error;
  if (customMedicationResult.error) throw customMedicationResult.error;

  const records = (recordsResult.data ?? []) as AppRecordRow[];
  const accessLogs = (logsResult.data ?? []) as AccessLogRow[];
  const users = new Map<string, UserOverview>();

  records
    .filter((record) => record.record_type === "registered_athlete")
    .forEach((record) => {
      const athlete = record.payload as unknown as RegisteredAthlete;
      const user = ensureUser(users, athlete.id);
      assignAthlete(user, athlete, "registered");
      user.lastActivityAt = maxDate(user.lastActivityAt, record.updated_at);
    });

  records
    .filter((record) => record.record_type === "profile")
    .forEach((record) => {
      const profile = record.payload as Partial<RegisteredAthlete> & { id?: string };
      const id = profile.id ?? record.user_id ?? record.record_id;
      const user = ensureUser(users, id);
      assignAthlete(user, profile, "profile");
      user.lastActivityAt = maxDate(user.lastActivityAt, record.updated_at);
    });

  records.forEach((record) => {
    if (record.record_type === "registered_athlete" || record.record_type === "profile") return;
    const userId = record.user_id;
    if (!userId) return;
    const user = ensureUser(users, userId);
    user.lastActivityAt = maxDate(user.lastActivityAt, record.updated_at);

    if (record.record_type === "upload") user.counts.uploads += 1;
    if (record.record_type === "extracted_item") {
      user.counts.items += 1;
      user.latestItemName = typeof record.payload.itemName === "string" ? record.payload.itemName : user.latestItemName;
    }
    if (record.record_type === "extracted_substance") user.counts.substances += 1;
    if (record.record_type === "risk_check") {
      user.counts.risks += 1;
      if (record.payload.riskLevel === "high_risk_candidate") user.highRiskCount += 1;
    }
    if (record.record_type === "intake_log") {
      user.counts.intakeLogs += 1;
      if (typeof record.payload.intakeDate === "string") {
        user.latestIntakeDate = maxDate(user.latestIntakeDate, record.payload.intakeDate);
      }
    }
  });

  accessLogs
    .filter((log) => log.event_type === "athlete_login_success" && log.subject_id)
    .forEach((log) => {
      const user = ensureUser(users, log.subject_id ?? "");
      user.name = log.subject_name ?? user.name;
      user.lastLoginAt = maxDate(user.lastLoginAt, log.created_at);
    });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isToday = (value: string) => new Date(value).getTime() >= todayStart.getTime();

  const userList = [...users.values()].sort((first, second) => {
    const firstDate = first.lastActivityAt ?? first.lastLoginAt ?? first.createdAt ?? "";
    const secondDate = second.lastActivityAt ?? second.lastLoginAt ?? second.createdAt ?? "";
    return secondDate.localeCompare(firstDate) || first.name.localeCompare(second.name);
  });

  return {
    totals: {
      registeredUsers: records.filter((record) => record.record_type === "registered_athlete").length,
      activeProfiles: records.filter((record) => record.record_type === "profile").length,
      uploads: records.filter((record) => record.record_type === "upload").length,
      extractedItems: records.filter((record) => record.record_type === "extracted_item").length,
      intakeLogs: records.filter((record) => record.record_type === "intake_log").length,
      highRiskChecks: records.filter((record) => record.record_type === "risk_check" && record.payload.riskLevel === "high_risk_candidate").length,
      medicationProducts: medicationResult.count ?? 0,
      adminCustomMedications: customMedicationResult.count ?? 0,
      loginSuccessesToday: accessLogs.filter((log) => log.event_type === "athlete_login_success" && isToday(log.created_at)).length,
      failedLoginsToday: accessLogs.filter((log) => log.event_type === "athlete_login_failed" && isToday(log.created_at)).length,
      adminLoginsToday: accessLogs.filter((log) => log.event_type === "admin_login_success" && isToday(log.created_at)).length
    },
    users: userList,
    accessLogs: accessLogs.map(toClientLog)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { action?: "admin_login" | "overview"; passcode?: string };

    if (body.action === "admin_login") {
      const ok = isAdmin(body.passcode);
      await writeAccessLog(request, {
        eventType: ok ? "admin_login_success" : "admin_login_failed",
        subjectName: "admin",
        metadata: { passcodeLength: body.passcode?.length ?? 0 }
      });

      return ok ? NextResponse.json({ ok: true }) : jsonError("관리자 비밀번호가 올바르지 않습니다.", 401);
    }

    if (!isAdmin(body.passcode)) {
      await writeAccessLog(request, {
        eventType: "admin_login_failed",
        subjectName: "admin",
        metadata: { reason: "overview_denied" }
      });
      return jsonError("관리자 인증이 필요합니다.", 401);
    }

    if (body.action === "overview") {
      await writeAccessLog(request, {
        eventType: "admin_view",
        subjectName: "admin",
        metadata: { section: "overview" }
      });
      return NextResponse.json(await buildOverview());
    }

    return jsonError("Unsupported action.");
  } catch (error) {
    console.error("[AdminActivity]", error);
    return jsonError("관리자 활동 정보를 불러오지 못했습니다.", 500);
  }
}
