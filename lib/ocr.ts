"use client";

import { extractMedicationInfoFromFileName } from "./mockOcr";
import { createOcrImageVariants } from "./ocrImagePreprocess";
import {
  getMedicationInfoScore,
  hasMeaningfulMedicationInfo,
  parseMedicationText,
  type MedicationOcrResult
} from "./ocrParser";

export async function extractMedicationInfo(file: File): Promise<MedicationOcrResult> {
  const filenameResult = await extractMedicationInfoFromFileName(file);
  if (hasMeaningfulMedicationInfo(filenameResult)) {
    return filenameResult;
  }

  try {
    const tesseract = await import("tesseract.js");
    const variants = await createOcrImageVariants(file);
    let bestResult: MedicationOcrResult | null = null;
    let bestScore = 0;

    for (const variant of variants) {
      const result = await tesseract.recognize(variant.image, "kor+eng");
      const parsed = parseMedicationText(result.data.text, result.data.confidence);
      const score = getMedicationInfoScore(parsed);

      if (score > bestScore) {
        bestResult = {
          ...parsed,
          rawText: `[${variant.label}]\n${parsed.rawText ?? ""}`
        };
        bestScore = score;
      }

      if (score >= 9) {
        break;
      }
    }

    if (bestResult && hasMeaningfulMedicationInfo(bestResult)) {
      return bestResult;
    }
  } catch (error) {
    console.warn("OCR extraction fell back to filename sample.", error);
  }

  return filenameResult;
}
