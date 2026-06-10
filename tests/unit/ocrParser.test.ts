import { describe, expect, it } from "vitest";
import { hasMeaningfulMedicationInfo, parseMedicationText } from "@/lib/ocrParser";

describe("parseMedicationText", () => {
  it("extracts labeled medication fields", () => {
    const result = parseMedicationText(`
      처방전
      약 이름: 콘서타정
      성분명: methylphenidate
      용량: 18mg
      병원명: 테스트 의원
      질환명: 처방 확인
    `);

    expect(result.itemName).toBe("콘서타정");
    expect(result.ingredientName).toBe("methylphenidate");
    expect(result.dosage).toBe("18mg");
    expect(result.hospitalName).toBe("테스트 의원");
    expect(result.conditionName).toBe("처방 확인");
    expect(result.source).toBe("tesseract");
  });

  it("infers known ingredient and dosage from unlabeled text", () => {
    const result = parseMedicationText("감기약 pseudoephedrine 60 mg");

    expect(result.ingredientName).toBe("pseudoephedrine");
    expect(result.dosage).toBe("60mg");
    expect(hasMeaningfulMedicationInfo(result)).toBe(true);
  });

  it("returns empty source when no medication info is found", () => {
    const result = parseMedicationText("이미지 흐림");

    expect(result.source).toBe("empty");
    expect(hasMeaningfulMedicationInfo(result)).toBe(false);
  });

  it("extracts active ingredient and per-tablet strength from noisy medicine box OCR", () => {
    const result = parseMedicationText(`
      일반의약품 정보
      [유효성분] 1정 중 야세트아미노펜()50.……65000】
      [효능효과] 해열 및 감기에 의한 동통
      [용법용량] 12세 이상의 소아 및 성인
    `);

    expect(result.itemName).toBe("");
    expect(result.ingredientName).toBe("아세트아미노펜(USP)");
    expect(result.dosage).toBe("1정당 650mg");
  });
});
