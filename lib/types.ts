export type UploadType =
  | "medicine_package"
  | "prescription"
  | "ingredient_label";

export type RiskLevel =
  | "confirmed_candidate"
  | "needs_check"
  | "high_risk_candidate"
  | "unknown";

export type IntakeStatus =
  | "not_taken"
  | "taken"
  | "planned";

export type VerificationKey =
  | "ingredient_checked"
  | "dosage_checked"
  | "competition_period_checked"
  | "expert_consult_planned"
  | "expert_consult_done";

export interface OcrFieldConfidence {
  itemName: "high" | "medium" | "low" | "missing";
  ingredientName: "high" | "medium" | "low" | "missing";
  dosage: "high" | "medium" | "low" | "missing";
}

export interface MedicationIngredientRecord {
  name: string;
  dosage?: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  birthDate: string;
  sport: string;
  teamName?: string;
  createdAt: string;
}

export interface RegisteredAthlete {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  sport: string;
  teamName?: string;
  createdAt: string;
}

export interface UploadRecord {
  id: string;
  userId: string;
  uploadType: UploadType;
  imageDataUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface ExtractedItem {
  id: string;
  uploadId: string;
  userId: string;
  itemName: string;
  ingredientName?: string;
  dosage?: string;
  hospitalName?: string;
  conditionName?: string;
  medicationProductId?: string;
  ingredients?: MedicationIngredientRecord[];
  efficacy?: string;
  interactionWarnings?: string;
  sideEffects?: string;
  lookupSourceName?: string;
  lookupCheckedAt?: string;
  intakeAmount?: string;
  userConfirmed: boolean;
  ocrConfidence?: OcrFieldConfidence;
  userVerifiedFields?: VerificationKey[];
  createdAt: string;
}

export interface ExtractedSubstance {
  id: string;
  itemId: string;
  userId: string;
  ingredientName: string;
  dosage?: string;
  sourceText: string;
  createdAt: string;
}

export interface RiskCheck {
  id: string;
  itemId: string;
  substanceId?: string;
  riskLevel: RiskLevel;
  riskReason: string;
  recommendedAction: string;
  databaseMatch?: {
    substanceName: string;
    wadaClass: string;
    sourceNames: string[];
    databaseVersion: string;
    matchedTerm?: string;
    matchedBy?: "ingredient" | "product_alias" | "fallback_rule";
    productAlias?: string;
  };
  createdAt: string;
}

export interface IntakeLog {
  id: string;
  userId: string;
  itemId: string;
  intakeStatus: IntakeStatus;
  isCompetitionPeriod?: boolean;
  intakeDate: string;
  intakeTime: string;
  dosage?: string;
  intakeAmount?: string;
  note?: string;
  createdAt: string;
}

export interface ReportItem {
  log: IntakeLog;
  item: ExtractedItem | null;
  risk: RiskCheck | null;
  risks: RiskCheck[];
  substances: ExtractedSubstance[];
  upload: UploadRecord | null;
}

export interface ReportData {
  profile: AthleteProfile;
  days: 7 | 14 | 30;
  generatedAt: string;
  items: ReportItem[];
  counts: Record<RiskLevel, number>;
}
