import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { extname } from "path";

const key = process.env.GOOGLE_AI_API_KEY;
if (!key) { console.error("GOOGLE_AI_API_KEY 환경변수가 없습니다."); process.exit(1); }

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const imagePath = process.argv[2];

if (!imagePath) {
  // 이미지 없으면 텍스트로 API 연결만 확인
  console.log("이미지 경로 없음 → API 연결 테스트...");
  const result = await model.generateContent("안녕하세요. 한 문장으로 응답하세요.");
  console.log("✓ API 응답:", result.response.text());
} else {
  const ext = extname(imagePath).toLowerCase();
  const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
  const mimeType = mimeMap[ext] ?? "image/jpeg";
  const data = readFileSync(imagePath).toString("base64");

  const result = await model.generateContent([
    { inlineData: { data, mimeType } },
    `이 이미지는 한국 약 봉투입니다. 다음을 JSON으로만 추출하세요:
{"itemName":"제품명","ingredientName":"주성분","dosage":"용량","hospitalName":"병원명","conditionName":"복용목적"}`
  ]);
  console.log("✓ OCR 결과:\n", result.response.text());
}
