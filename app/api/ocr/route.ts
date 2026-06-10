import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? "");

const EXTRACTION_PROMPT = `이 이미지는 한국의 약 봉투, 처방전, 또는 보충제 성분표입니다.
이미지에서 다음 정보를 추출하여 JSON 형식으로만 응답하세요. 다른 설명은 절대 하지 마세요.

{
  "itemName": "제품명 또는 약 이름 (예: 타이레놀 이알서방정)",
  "ingredientName": "주성분명 한글 또는 영문 (예: 아세트아미노펜, Acetaminophen)",
  "dosage": "1회 용량 또는 규격 (예: 650mg, 1정당 500mg)",
  "hospitalName": "처방 병원명 (없으면 빈 문자열)",
  "conditionName": "진단명 또는 복용 목적 (없으면 빈 문자열)"
}

찾을 수 없는 항목은 반드시 빈 문자열("")로 응답합니다.`;

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      EXTRACTION_PROMPT,
    ]);

    const rawText = result.response.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({
        itemName: "", ingredientName: "", dosage: "",
        hospitalName: "", conditionName: "", source: "empty",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;

    return NextResponse.json({
      itemName:       (parsed.itemName       ?? "").trim(),
      ingredientName: (parsed.ingredientName ?? "").trim(),
      dosage:         (parsed.dosage         ?? "").trim(),
      hospitalName:   (parsed.hospitalName   ?? "").trim(),
      conditionName:  (parsed.conditionName  ?? "").trim(),
      source: "claude-vision",
    });
  } catch (err) {
    console.error("[OCR API]", err);
    return NextResponse.json(
      { error: "OCR 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
