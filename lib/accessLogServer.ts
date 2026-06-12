import type { NextRequest } from "next/server";
import { createSupabaseAdminServerClient, hasSupabaseAdminConfig } from "./supabaseServer";

export type AccessLogEventType =
  | "athlete_login_success"
  | "athlete_login_failed"
  | "admin_login_success"
  | "admin_login_failed"
  | "admin_view";

interface AccessLogInput {
  eventType: AccessLogEventType;
  subjectId?: string;
  subjectName?: string;
  metadata?: Record<string, unknown>;
}

function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || undefined;
}

export async function writeAccessLog(request: NextRequest, input: AccessLogInput): Promise<void> {
  if (!hasSupabaseAdminConfig()) return;

  try {
    const supabase = createSupabaseAdminServerClient();
    const { error } = await supabase.from("access_logs").insert({
      event_type: input.eventType,
      subject_id: input.subjectId ?? null,
      subject_name: input.subjectName ?? null,
      ip_address: getClientIp(request) ?? null,
      user_agent: request.headers.get("user-agent"),
      metadata: input.metadata ?? {}
    });

    if (error) console.warn("[AccessLog]", error.message);
  } catch (error) {
    console.warn("[AccessLog]", error);
  }
}
