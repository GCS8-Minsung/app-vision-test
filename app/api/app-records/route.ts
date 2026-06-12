import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminServerClient, hasSupabaseAdminConfig } from "@/lib/supabaseServer";

const RECORD_TYPES = new Set([
  "profile",
  "upload",
  "extracted_item",
  "extracted_substance",
  "risk_check",
  "intake_log",
  "registered_athlete"
]);

interface AppRecordInput {
  type: string;
  record: { id?: string; userId?: string } & Record<string, unknown>;
  userId?: string;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function requireSupabase() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin configuration is missing.");
  }
  return createSupabaseAdminServerClient();
}

function toRow(input: AppRecordInput) {
  if (!RECORD_TYPES.has(input.type)) throw new Error(`Unsupported record type: ${input.type}`);
  if (!input.record || typeof input.record !== "object") throw new Error("record is required.");

  const recordId = input.record.id;
  if (!recordId || typeof recordId !== "string") throw new Error("record.id is required.");

  return {
    record_type: input.type,
    record_id: recordId,
    user_id: input.userId ?? input.record.userId ?? recordId,
    payload: input.record
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabase();
    const userId = request.nextUrl.searchParams.get("userId");
    const type = request.nextUrl.searchParams.get("type");

    let query = supabase
      .from("app_records")
      .select("record_type,record_id,user_id,payload,updated_at")
      .order("updated_at", { ascending: true });

    if (userId) query = query.eq("user_id", userId);
    if (type) query = query.eq("record_type", type);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ records: data ?? [] });
  } catch (error) {
    console.error("[AppRecords:GET]", error);
    return jsonError("앱 기록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AppRecordInput | { records?: AppRecordInput[] };
    const inputs = "records" in body && Array.isArray(body.records) ? body.records : [body as AppRecordInput];
    const rows = inputs.map(toRow);

    const supabase = requireSupabase();
    const { error } = await supabase
      .from("app_records")
      .upsert(rows, { onConflict: "record_type,record_id" });

    if (error) throw error;
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (error) {
    console.error("[AppRecords:POST]", error);
    return jsonError("앱 기록을 저장하지 못했습니다.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");
    const recordId = request.nextUrl.searchParams.get("recordId");
    if (!type || !recordId) return jsonError("type and recordId are required.");
    if (!RECORD_TYPES.has(type)) return jsonError("Unsupported record type.");

    const supabase = requireSupabase();
    const { error } = await supabase
      .from("app_records")
      .delete()
      .eq("record_type", type)
      .eq("record_id", recordId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[AppRecords:DELETE]", error);
    return jsonError("앱 기록을 삭제하지 못했습니다.", 500);
  }
}
