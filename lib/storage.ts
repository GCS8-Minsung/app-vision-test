import { STORAGE_KEYS } from "./constants";
import type { MedicationOcrResult } from "./ocrParser";
import type {
  AthleteProfile,
  ExtractedItem,
  ExtractedSubstance,
  IntakeLog,
  RiskCheck,
  UploadRecord
} from "./types";

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface DopingNoteRepository {
  getProfile(): Promise<AthleteProfile | null>;
  saveProfile(profile: AthleteProfile): Promise<void>;
  getUploads(): Promise<UploadRecord[]>;
  saveUpload(upload: UploadRecord): Promise<void>;
  getExtractedItems(): Promise<ExtractedItem[]>;
  saveExtractedItem(item: ExtractedItem): Promise<void>;
  getExtractedSubstances(): Promise<ExtractedSubstance[]>;
  saveExtractedSubstance(substance: ExtractedSubstance): Promise<void>;
  getRiskChecks(): Promise<RiskCheck[]>;
  saveRiskCheck(check: RiskCheck): Promise<void>;
  getIntakeLogs(): Promise<IntakeLog[]>;
  saveIntakeLog(log: IntakeLog): Promise<void>;
  clearAll(): Promise<void>;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJson<T>(key: StorageKey, fallback: T): T {
  if (!hasStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: StorageKey, value: T): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function upsertById<T extends { id: string }>(records: T[], next: T): T[] {
  const exists = records.some((record) => record.id === next.id);
  return exists ? records.map((record) => (record.id === next.id ? next : record)) : [...records, next];
}

export const storage = {
  getProfile(): AthleteProfile | null {
    return readJson<AthleteProfile | null>(STORAGE_KEYS.profile, null);
  },
  saveProfile(profile: AthleteProfile): void {
    writeJson(STORAGE_KEYS.profile, profile);
  },
  getUploads(): UploadRecord[] {
    return readJson<UploadRecord[]>(STORAGE_KEYS.uploads, []);
  },
  saveUpload(upload: UploadRecord): void {
    writeJson(STORAGE_KEYS.uploads, [...this.getUploads(), upload]);
  },
  getExtractedItems(): ExtractedItem[] {
    return readJson<ExtractedItem[]>(STORAGE_KEYS.extractedItems, []);
  },
  saveExtractedItem(item: ExtractedItem): void {
    writeJson(STORAGE_KEYS.extractedItems, [...this.getExtractedItems(), item]);
  },
  updateExtractedItem(item: ExtractedItem): void {
    writeJson(STORAGE_KEYS.extractedItems, upsertById(this.getExtractedItems(), item));
  },
  getExtractedSubstances(): ExtractedSubstance[] {
    return readJson<ExtractedSubstance[]>(STORAGE_KEYS.extractedSubstances, []);
  },
  saveExtractedSubstance(substance: ExtractedSubstance): void {
    writeJson(STORAGE_KEYS.extractedSubstances, [...this.getExtractedSubstances(), substance]);
  },
  getRiskChecks(): RiskCheck[] {
    return readJson<RiskCheck[]>(STORAGE_KEYS.riskChecks, []);
  },
  saveRiskCheck(check: RiskCheck): void {
    writeJson(STORAGE_KEYS.riskChecks, [...this.getRiskChecks(), check]);
  },
  getIntakeLogs(): IntakeLog[] {
    return readJson<IntakeLog[]>(STORAGE_KEYS.intakeLogs, []);
  },
  saveIntakeLog(log: IntakeLog): void {
    writeJson(STORAGE_KEYS.intakeLogs, [...this.getIntakeLogs(), log]);
  },
  clearAll(): void {
    if (!hasStorage()) {
      return;
    }

    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
  }
};

export const draftStorage = {
  saveDraftUploadId(id: string): void {
    writeJson(STORAGE_KEYS.draftUploadId, id);
  },
  getDraftUploadId(): string | null {
    return readJson<string | null>(STORAGE_KEYS.draftUploadId, null);
  },
  saveDraftOcr(value: {
    itemName: string;
    ingredientName: string;
    dosage: string;
    hospitalName: string;
    conditionName: string;
    rawText?: string;
    confidence?: number;
    source?: MedicationOcrResult["source"];
  }): void {
    writeJson(STORAGE_KEYS.draftOcr, value);
  },
  getDraftOcr(): MedicationOcrResult | null {
    return readJson(STORAGE_KEYS.draftOcr, null);
  },
  saveCurrentResult(itemId: string, riskId: string): void {
    writeJson(STORAGE_KEYS.currentItemId, itemId);
    writeJson(STORAGE_KEYS.currentRiskId, riskId);
  },
  getCurrentResult(): { itemId: string; riskId: string } | null {
    const itemId = readJson<string | null>(STORAGE_KEYS.currentItemId, null);
    const riskId = readJson<string | null>(STORAGE_KEYS.currentRiskId, null);
    return itemId && riskId ? { itemId, riskId } : null;
  }
};

export class LocalStorageRepository implements DopingNoteRepository {
  async getProfile(): Promise<AthleteProfile | null> {
    return storage.getProfile();
  }

  async saveProfile(profile: AthleteProfile): Promise<void> {
    storage.saveProfile(profile);
  }

  async getUploads(): Promise<UploadRecord[]> {
    return storage.getUploads();
  }

  async saveUpload(upload: UploadRecord): Promise<void> {
    storage.saveUpload(upload);
  }

  async getExtractedItems(): Promise<ExtractedItem[]> {
    return storage.getExtractedItems();
  }

  async saveExtractedItem(item: ExtractedItem): Promise<void> {
    storage.saveExtractedItem(item);
  }

  async getExtractedSubstances(): Promise<ExtractedSubstance[]> {
    return storage.getExtractedSubstances();
  }

  async saveExtractedSubstance(substance: ExtractedSubstance): Promise<void> {
    storage.saveExtractedSubstance(substance);
  }

  async getRiskChecks(): Promise<RiskCheck[]> {
    return storage.getRiskChecks();
  }

  async saveRiskCheck(check: RiskCheck): Promise<void> {
    storage.saveRiskCheck(check);
  }

  async getIntakeLogs(): Promise<IntakeLog[]> {
    return storage.getIntakeLogs();
  }

  async saveIntakeLog(log: IntakeLog): Promise<void> {
    storage.saveIntakeLog(log);
  }

  async clearAll(): Promise<void> {
    storage.clearAll();
  }
}
