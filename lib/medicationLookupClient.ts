"use client";

import { customMedicationProducts } from "./customMedicationProducts";
import { medicationLookupCache } from "./medicationLookupCache";
import { dedupeMedicationLookups } from "./medicationNameMatching";
import type { MedicationProductLookup } from "./medicationProviders/types";

export interface MedicationLookupClientResult {
  results: MedicationProductLookup[];
  status: "custom" | "cache" | "database" | "external" | "seed" | "fallback" | "empty" | "error";
  message: string;
}

export async function searchMedicationCandidates(query: string, limit = 5): Promise<MedicationLookupClientResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { results: [], status: "empty", message: "검색어를 더 입력해주세요." };

  const custom = customMedicationProducts.search(trimmed, limit);
  if (custom.length >= limit) {
    return { results: custom, status: "custom", message: "사용자 보강 DB에서 후보를 찾았습니다." };
  }

  const cached = medicationLookupCache.get(trimmed);
  if (cached) {
    return {
      results: dedupeMedicationLookups([...custom, ...cached]).slice(0, limit),
      status: custom.length > 0 ? "custom" : "cache",
      message: custom.length > 0 ? "사용자 보강 DB와 캐시 후보를 함께 표시합니다." : "캐시된 검색 후보입니다."
    };
  }

  try {
    const response = await fetch(`/api/medications/search?query=${encodeURIComponent(trimmed)}&limit=${limit}`);
    if (!response.ok) throw new Error(`Medication lookup ${response.status}`);
    const payload = await response.json() as { results?: MedicationProductLookup[]; status?: MedicationLookupClientResult["status"]; message?: string };
    const remote = payload.results ?? [];
    medicationLookupCache.set(trimmed, remote);
    const merged = dedupeMedicationLookups([...custom, ...remote]).slice(0, limit);

    return {
      results: merged,
      status: custom.length > 0 ? "custom" : payload.status ?? "seed",
      message: custom.length > 0 ? "사용자 보강 DB와 조회 후보를 함께 표시합니다." : payload.message ?? "검색 후보입니다."
    };
  } catch {
    return {
      results: custom,
      status: custom.length > 0 ? "custom" : "error",
      message: custom.length > 0 ? "외부 조회 실패로 사용자 보강 DB 후보만 표시합니다." : "검색 후보를 불러오지 못했습니다."
    };
  }
}
