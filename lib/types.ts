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
  userConfirmed: boolean;
  createdAt: string;
}

export interface RiskCheck {
  id: string;
  itemId: string;
  riskLevel: RiskLevel;
  riskReason: string;
  recommendedAction: string;
  databaseMatch?: {
    substanceName: string;
    wadaClass: string;
    sourceNames: string[];
    databaseVersion: string;
  };
  createdAt: string;
}

export interface IntakeLog {
  id: string;
  userId: string;
  itemId: string;
  intakeStatus: IntakeStatus;
  intakeDate: string;
  intakeTime: string;
  dosage?: string;
  note?: string;
  createdAt: string;
}

export interface ReportItem {
  log: IntakeLog;
  item: ExtractedItem | null;
  risk: RiskCheck | null;
  upload: UploadRecord | null;
}

export interface ReportData {
  profile: AthleteProfile;
  days: 7 | 14 | 30;
  generatedAt: string;
  items: ReportItem[];
  counts: Record<RiskLevel, number>;
}
