import type { MedicationOcrResult } from "./ocrParser";

export async function extractMedicationInfoFromFileName(file: File): Promise<MedicationOcrResult> {
  const name = file.name.toLowerCase();

  if (name.includes("caffeine")) {
    return {
      itemName: "카페인 정",
      ingredientName: "caffeine",
      dosage: "100mg",
      hospitalName: "",
      conditionName: "피로 관리",
      source: "filename-fallback"
    };
  }

  if (name.includes("methyl")) {
    return {
      itemName: "콘서타정",
      ingredientName: "methylphenidate",
      dosage: "18mg",
      hospitalName: "테스트 의원",
      conditionName: "처방 확인",
      source: "filename-fallback"
    };
  }

  if (name.includes("pseudo")) {
    return {
      itemName: "감기약",
      ingredientName: "pseudoephedrine",
      dosage: "60mg",
      hospitalName: "",
      conditionName: "감기 증상",
      source: "filename-fallback"
    };
  }

  return {
    itemName: "",
    ingredientName: "",
    dosage: "",
    hospitalName: "",
    conditionName: "",
    source: "empty"
  };
}
