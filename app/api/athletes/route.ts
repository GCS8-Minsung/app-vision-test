import { NextResponse, type NextRequest } from "next/server";
import { writeAccessLog } from "@/lib/accessLogServer";
import { ADMIN_PASSCODE } from "@/lib/constants";
import { createId } from "@/lib/ids";
import { createSupabaseAdminServerClient, hasSupabaseAdminConfig } from "@/lib/supabaseServer";
import type { AthleteProfile, RegisteredAthlete } from "@/lib/types";

const DEMO_SEED: Omit<RegisteredAthlete, "id" | "createdAt">[] = [
  { name: "이민성", birthDate: "1995-01-24", phone: "010-1234-5678", sport: "육상", teamName: "가천대학교" },
  { name: "김철수", birthDate: "1998-03-15", phone: "010-9876-5432", sport: "수영", teamName: "대한수영연맹" },
  { name: "박지은", birthDate: "2001-07-22", phone: "010-5555-1234", sport: "배드민턴", teamName: "삼성블루팀" },
  { name: "최영호", birthDate: "1993-11-08", phone: "010-7777-3333", sport: "축구", teamName: "FC서울" },
  { name: "정수연", birthDate: "2000-05-19", phone: "010-2222-6666", sport: "육상", teamName: "국민체육진흥공단" }
];

function normalizePhone(phone: string): string {
  return phone.replace(/[-\s]/g, "");
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function requireAdmin(passcode?: string) {
  if (passcode !== ADMIN_PASSCODE) throw new Error("관리자 인증이 필요합니다.");
}

function requireSupabase() {
  if (!hasSupabaseAdminConfig()) throw new Error("Supabase admin configuration is missing.");
  return createSupabaseAdminServerClient();
}

function toProfile(athlete: RegisteredAthlete): AthleteProfile {
  return {
    id: athlete.id,
    name: athlete.name,
    birthDate: athlete.birthDate,
    sport: athlete.sport,
    teamName: athlete.teamName,
    createdAt: athlete.createdAt
  };
}

async function listAthletes(): Promise<RegisteredAthlete[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("app_records")
    .select("payload")
    .eq("record_type", "registered_athlete")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => row.payload as RegisteredAthlete);
}

async function saveAthletes(athletes: RegisteredAthlete[]) {
  if (athletes.length === 0) return;
  const supabase = requireSupabase();
  const { error } = await supabase.from("app_records").upsert(
    athletes.map((athlete) => ({
      record_type: "registered_athlete",
      record_id: athlete.id,
      user_id: athlete.id,
      payload: athlete
    })),
    { onConflict: "record_type,record_id" }
  );
  if (error) throw error;
}

async function seedDemoIfEmpty() {
  const current = await listAthletes();
  if (current.length > 0) return current;

  const now = new Date().toISOString();
  const athletes = DEMO_SEED.map((seed) => ({
    ...seed,
    id: createId("athlete"),
    createdAt: now
  }));
  await saveAthletes(athletes);
  return athletes;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action?: "login" | "list" | "save" | "delete" | "seed" | "import";
      passcode?: string;
      athlete?: RegisteredAthlete;
      athletes?: RegisteredAthlete[];
      id?: string;
      name?: string;
      birthDate?: string;
      phone?: string;
    };

    if (body.action === "login") {
      const athletes = await seedDemoIfEmpty();
      const normalizedPhone = normalizePhone(body.phone ?? "");
      const athlete = athletes.find(
        (candidate) =>
          candidate.name.trim() === (body.name ?? "").trim() &&
          candidate.birthDate === body.birthDate &&
          normalizePhone(candidate.phone) === normalizedPhone
      );

      await writeAccessLog(request, {
        eventType: athlete ? "athlete_login_success" : "athlete_login_failed",
        subjectId: athlete?.id,
        subjectName: athlete?.name ?? body.name,
        metadata: {
          birthDate: body.birthDate,
          phoneLast4: normalizePhone(body.phone ?? "").slice(-4)
        }
      });

      return NextResponse.json({ athlete: athlete ?? null, profile: athlete ? toProfile(athlete) : null });
    }

    requireAdmin(body.passcode);

    if (body.action === "list") {
      return NextResponse.json({ athletes: await listAthletes() });
    }

    if (body.action === "seed") {
      const now = new Date().toISOString();
      const athletes = DEMO_SEED.map((seed) => ({ ...seed, id: createId("athlete"), createdAt: now }));
      await saveAthletes(athletes);
      return NextResponse.json({ athletes: await listAthletes() });
    }

    if (body.action === "import") {
      await saveAthletes(body.athletes ?? []);
      return NextResponse.json({ athletes: await listAthletes() });
    }

    if (body.action === "save") {
      if (!body.athlete) return jsonError("athlete is required.");
      await saveAthletes([body.athlete]);
      return NextResponse.json({ athletes: await listAthletes() });
    }

    if (body.action === "delete") {
      if (!body.id) return jsonError("id is required.");
      const supabase = requireSupabase();
      const { error } = await supabase
        .from("app_records")
        .delete()
        .eq("record_type", "registered_athlete")
        .eq("record_id", body.id);
      if (error) throw error;
      return NextResponse.json({ athletes: await listAthletes() });
    }

    return jsonError("Unsupported action.");
  } catch (error) {
    console.error("[Athletes]", error);
    return jsonError(error instanceof Error ? error.message : "선수 정보를 처리하지 못했습니다.", 500);
  }
}
