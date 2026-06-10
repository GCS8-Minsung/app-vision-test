import type { OcrFieldConfidence } from "./types";

type ConfidenceValue = OcrFieldConfidence[keyof OcrFieldConfidence];

function scoreField(value: string, baseConfidence?: number): ConfidenceValue {
  const trimmed = value.trim();
  if (!trimmed) return "missing";
  if (baseConfidence === undefined) return trimmed.length >= 3 ? "medium" : "low";
  if (baseConfidence >= 80) return "high";
  if (baseConfidence >= 55) return "medium";
  return "low";
}

function scoreDosage(value: string, baseConfidence?: number): ConfidenceValue {
  const trimmed = value.trim();
  if (!trimmed) return "missing";
  const looksLikeDose = /\d+(?:\.\d+)?\s?(?:mg|㎎|mcg|μg|g|ml|iu|정|캡슐|스쿱)/i.test(trimmed);
  if (!looksLikeDose) return "low";
  return scoreField(trimmed, baseConfidence);
}

export function buildOcrFieldConfidence(input: {
  itemName: string;
  ingredientName: string;
  dosage: string;
  confidence?: number;
}): OcrFieldConfidence {
  return {
    itemName: scoreField(input.itemName, input.confidence),
    ingredientName: scoreField(input.ingredientName, input.confidence),
    dosage: scoreDosage(input.dosage, input.confidence)
  };
}
