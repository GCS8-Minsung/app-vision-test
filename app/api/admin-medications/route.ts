import { NextResponse } from "next/server";
import { ADMIN_PASSCODE } from "@/lib/constants";
import { createId } from "@/lib/ids";
import { createSupabaseAdminServerClient, hasSupabaseAdminConfig } from "@/lib/supabaseServer";
import type { MedicationIngredient, MedicationProductEntry } from "@/lib/medicationDatabase";
import type { CustomMedicationProduct } from "@/lib/medicationProviders/types";

const CUSTOM_SOURCE = "admin_custom";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[-\s()[\]{}·ㆍ.,:：;'"`~…_]/g, "");
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

function toMedication(row: Record<string, unknown>): CustomMedicationProduct {
  const raw = row.raw && typeof row.raw === "object" ? row.raw as Record<string, unknown> : {};
  const now = new Date().toISOString();
  return {
    id: String(row.source_item_name ?? row.id ?? createId("custom-med")),
    productName: String(row.item_name ?? ""),
    aliases: Array.isArray(row.aliases) ? row.aliases as string[] : [],
    ingredients: Array.isArray(row.ingredients) ? row.ingredients as MedicationIngredient[] : [],
    dosage: typeof row.dosage === "string" ? row.dosage : undefined,
    form: typeof row.form === "string" ? row.form : undefined,
    efficacy: typeof row.efficacy === "string" ? row.efficacy : undefined,
    interactionWarnings: typeof row.interaction_warnings === "string" ? row.interaction_warnings : undefined,
    sideEffects: typeof row.side_effects === "string" ? row.side_effects : undefined,
    externalSourceId: CUSTOM_SOURCE,
    lastSyncedAt: typeof row.last_synced_at === "string" ? row.last_synced_at : undefined,
    sourceNames: Array.isArray(row.source_names) ? row.source_names as string[] : ["관리자 보강 DB"],
    note: typeof raw.note === "string" ? raw.note : "관리자 보강 후보",
    createdAt: typeof row.created_at === "string" ? row.created_at : now,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : now
  };
}

function toRow(input: MedicationProductEntry) {
  const now = new Date().toISOString();
  return {
    source: CUSTOM_SOURCE,
    source_item_name: input.id || createId("custom-med"),
    item_name: input.productName,
    normalized_item_name: normalize(input.productName),
    aliases: input.aliases ?? [],
    ingredients: input.ingredients ?? [],
    dosage: input.dosage ?? null,
    form: input.form ?? null,
    efficacy: input.efficacy ?? null,
    interaction_warnings: input.interactionWarnings ?? null,
    side_effects: input.sideEffects ?? null,
    source_names: input.sourceNames?.length ? input.sourceNames : ["관리자 보강 DB"],
    raw: {
      note: input.note,
      local_id: input.id
    },
    last_synced_at: now,
    updated_at: now
  };
}

async function listMedications(): Promise<CustomMedicationProduct[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("medication_products")
    .select("id,source_item_name,item_name,aliases,ingredients,dosage,form,efficacy,interaction_warnings,side_effects,source_names,raw,last_synced_at,created_at,updated_at")
    .eq("source", CUSTOM_SOURCE)
    .order("item_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toMedication(row as Record<string, unknown>));
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      action?: "list" | "save" | "import";
      passcode?: string;
      medication?: MedicationProductEntry;
      medications?: MedicationProductEntry[];
    };

    requireAdmin(body.passcode);

    if (body.action === "list") {
      return NextResponse.json({ medications: await listMedications() });
    }

    if (body.action === "save" || body.action === "import") {
      const inputs = body.action === "import" ? body.medications ?? [] : body.medication ? [body.medication] : [];
      if (inputs.length === 0) return jsonError("medication is required.");

      const supabase = requireSupabase();
      const { error } = await supabase
        .from("medication_products")
        .upsert(inputs.map(toRow), { onConflict: "source,normalized_item_name" });

      if (error) throw error;
      return NextResponse.json({ medications: await listMedications() });
    }

    return jsonError("Unsupported action.");
  } catch (error) {
    console.error("[AdminMedications]", error);
    return jsonError(error instanceof Error ? error.message : "의약품 보강 DB를 처리하지 못했습니다.", 500);
  }
}
