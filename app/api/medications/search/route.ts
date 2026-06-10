import { NextResponse, type NextRequest } from "next/server";
import { searchServerMedicationProviders } from "@/lib/medicationProviders";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "5");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.floor(limitParam), 1), 10) : 5;

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
      status: "empty",
      message: "검색어를 두 글자 이상 입력해주세요."
    });
  }

  try {
    const results = await searchServerMedicationProviders(query, limit);
    const status = results[0]?.lookupSource.status ?? "empty";
    return NextResponse.json({
      results,
      status,
      message: results.length > 0 ? "의약품 후보를 찾았습니다." : "일치하는 후보가 없습니다."
    });
  } catch (error) {
    console.error("[MedicationSearch]", error);
    return NextResponse.json({
      results: [],
      status: "fallback",
      message: "검색 중 오류가 발생했지만 기록 흐름은 계속 진행할 수 있습니다."
    });
  }
}
