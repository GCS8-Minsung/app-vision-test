import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { formatIngredientContentDosage, formatIngredientNames, inferIntakeAmount } from "@/lib/medicationDisplay";
import {
  dedupeMedicationLookups,
  findReliableProductNameMatch,
  normalizeMedicationName
} from "@/lib/medicationNameMatching";
import { searchServerMedicationProviders } from "@/lib/medicationProviders";
import type { MedicationProductLookup } from "@/lib/medicationProviders/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? "");

// 503 과부하 시 순서대로 시도
const MODEL_CHAIN = [
  "gemini-2.5-flash",       // primary — 503 시 아래로 폴백
  "gemini-2.5-flash-lite",  // 확인된 무료 폴백
];

const EXTRACTION_PROMPT = `이 이미지는 한국의 약 봉투, 처방전, 약 상자, 알약 포장, 또는 보충제 성분표입니다.
목표는 단순 OCR이 아니라 이미지에서 실제 제품명 후보를 식별하는 것입니다.
상표명, 제형, 함량, 포장에 반복되는 큰 글자, 처방전 약품명 줄을 우선해 후보를 고르세요.
이미지가 흐리거나 일부만 보이면 가능한 후보를 여러 개 제시하되, 보이는 글자와 맞지 않는 제품명을 지어내지 마세요.
다음 JSON 형식으로만 응답하세요. 다른 설명은 절대 하지 마세요.

{
  "itemName": "제품명 또는 약 이름 (예: 타이레놀 이알서방정)",
  "candidateProductNames": ["이미지에서 가능한 정확한 제품명 후보를 신뢰도 높은 순서로 최대 5개"],
  "ingredientName": "주성분명 한글 또는 영문 (예: 아세트아미노펜, Acetaminophen)",
  "dosage": "제품 1정/1캡슐/1포/1회 안에 포함된 성분 함량 또는 규격 (예: 300.00mg, 650mg, 1정당 500mg)",
  "hospitalName": "처방 병원명 (없으면 빈 문자열)",
  "conditionName": "진단명 또는 복용 목적 (없으면 빈 문자열)",
  "confidence": 0부터 100 사이의 숫자
}

찾을 수 없는 항목은 반드시 빈 문자열("")로 응답합니다.`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function is503(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: number }).status === 503
  );
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function uniqueQueries(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter((value) => value.length >= 2)
    .filter((value) => {
      const key = normalizeMedicationName(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(cleanText).filter(Boolean).slice(0, 5);
}

function getConfidence(value: unknown): number | undefined {
  const confidence = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(confidence)) return undefined;
  return Math.min(Math.max(Math.round(confidence), 0), 100);
}

async function matchMedicationProducts(queries: string[], limit = 5): Promise<MedicationProductLookup[]> {
  if (queries.length === 0) return [];

  const batches = await Promise.all(
    queries.map((query) => searchServerMedicationProviders(query, limit).catch(() => []))
  );
  return dedupeMedicationLookups(batches.flat()).slice(0, limit);
}

async function callWithFallback(base64: string, mimeType: string): Promise<string> {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { inlineData: { data: base64, mimeType } },
        EXTRACTION_PROMPT,
      ]);
      console.log(`[OCR] 성공: ${modelName}`);
      return result.response.text();
    } catch (err) {
      if (is503(err) && i < MODEL_CHAIN.length - 1) {
        console.warn(`[OCR] ${modelName} 503 → ${MODEL_CHAIN[i + 1]} 로 전환, 2초 대기`);
        await sleep(2000);
        continue;
      }
      throw err;
    }
  }
  throw new Error("모든 모델이 응답하지 않았습니다.");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    const rawText = await callWithFallback(base64, mimeType);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({
        itemName: "", ingredientName: "", dosage: "",
        hospitalName: "", conditionName: "", source: "empty",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const itemName = cleanText(parsed.itemName);
    const ingredientName = cleanText(parsed.ingredientName);
    const dosage = cleanText(parsed.dosage);
    const candidateProductNames = getStringArray(parsed.candidateProductNames);
    const queries = uniqueQueries([itemName, ...candidateProductNames]);
    const medicationCandidates = await matchMedicationProducts(queries);
    const matchedMedication = findReliableProductNameMatch(queries, medicationCandidates);

    return NextResponse.json({
      itemName:       matchedMedication?.productName ?? itemName,
      ingredientName: matchedMedication?.ingredients?.length ? formatIngredientNames(matchedMedication.ingredients) : ingredientName,
      dosage:         matchedMedication?.ingredients?.length
        ? formatIngredientContentDosage(matchedMedication.ingredients, matchedMedication.dosage)
        : dosage,
      intakeAmount:   matchedMedication ? inferIntakeAmount({
        productName: matchedMedication.productName,
        form: matchedMedication.form,
        dosage: matchedMedication.dosage
      }) : undefined,
      hospitalName:   cleanText(parsed.hospitalName),
      conditionName:  cleanText(parsed.conditionName),
      candidateProductNames,
      matchedMedication,
      medicationCandidates,
      databaseMatched: Boolean(matchedMedication),
      confidence: getConfidence(parsed.confidence) ?? (matchedMedication ? Math.max(matchedMedication.score, 80) : undefined),
      source: "gemini-vision",
    });
  } catch (err) {
    console.error("[OCR API]", err);
    return NextResponse.json(
      { error: "OCR 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
