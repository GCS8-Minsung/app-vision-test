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
type CloudRecordType =
  | "profile"
  | "upload"
  | "extracted_item"
  | "extracted_substance"
  | "risk_check"
  | "intake_log";

interface CloudRecordRow {
  record_type: CloudRecordType;
  record_id: string;
  user_id: string | null;
  payload: Record<string, unknown>;
  updated_at: string;
}

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

function canUseCloudSync(): boolean {
  return typeof fetch !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function sanitizeCloudRecord<T extends { id: string }>(type: CloudRecordType, record: T): T {
  if (type !== "upload") return record;
  const rest = { ...record } as T & { imageDataUrl?: string };
  delete rest.imageDataUrl;
  return rest as T;
}

function getCurrentUserId(): string | undefined {
  return storage.getProfile()?.id;
}

function saveCloudRecord<T extends { id: string; userId?: string }>(
  type: CloudRecordType,
  record: T,
  userId = record.userId ?? getCurrentUserId()
): void {
  if (!canUseCloudSync() || !userId) return;

  fetch("/api/app-records", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type,
      userId,
      record: sanitizeCloudRecord(type, record)
    })
  }).catch((error) => {
    console.warn("[Storage] Supabase sync failed.", error);
  });
}

function getLocalCloudInputs(userId: string): { type: CloudRecordType; userId: string; record: { id: string } & Record<string, unknown> }[] {
  const profile = storage.getProfile();
  const uploads = storage.getUploads().filter((record) => record.userId === userId);
  const items = storage.getExtractedItems().filter((record) => record.userId === userId);
  const substances = storage.getExtractedSubstances().filter((record) => record.userId === userId);
  const logs = storage.getIntakeLogs().filter((record) => record.userId === userId);
  const itemIds = new Set(items.map((item) => item.id));
  const risks = storage.getRiskChecks().filter((record) => itemIds.has(record.itemId));
  const records: { type: CloudRecordType; userId: string; record: { id: string } & Record<string, unknown> }[] = [];

  if (profile?.id === userId) records.push({ type: "profile", userId, record: profile as unknown as { id: string } & Record<string, unknown> });
  uploads.forEach((record) => records.push({ type: "upload", userId, record: sanitizeCloudRecord("upload", record) as unknown as { id: string } & Record<string, unknown> }));
  items.forEach((record) => records.push({ type: "extracted_item", userId, record: record as unknown as { id: string } & Record<string, unknown> }));
  substances.forEach((record) => records.push({ type: "extracted_substance", userId, record: record as unknown as { id: string } & Record<string, unknown> }));
  risks.forEach((record) => records.push({ type: "risk_check", userId, record: record as unknown as { id: string } & Record<string, unknown> }));
  logs.forEach((record) => records.push({ type: "intake_log", userId, record: record as unknown as { id: string } & Record<string, unknown> }));

  return records;
}

export async function syncLocalStorageToSupabase(userId: string): Promise<boolean> {
  if (!canUseCloudSync() || !userId) return false;
  const records = getLocalCloudInputs(userId);
  if (records.length === 0) return true;

  try {
    const response = await fetch("/api/app-records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ records })
    });
    return response.ok;
  } catch (error) {
    console.warn("[Storage] Supabase local migration failed.", error);
    return false;
  }
}

function mergeRemoteRecords<T extends { id: string }>(
  key: StorageKey,
  rows: CloudRecordRow[],
  type: CloudRecordType,
  merge?: (remote: T, local?: T) => T
): void {
  const current = readJson<T[]>(key, []);
  const map = new Map(current.map((record) => [record.id, record]));
  rows
    .filter((row) => row.record_type === type)
    .forEach((row) => {
      const remote = row.payload as T;
      map.set(remote.id, merge ? merge(remote, map.get(remote.id)) : remote);
    });
  writeJson(key, [...map.values()]);
}

export async function hydrateStorageFromSupabase(userId: string): Promise<boolean> {
  if (!canUseCloudSync() || !userId) return false;

  try {
    const response = await fetch(`/api/app-records?userId=${encodeURIComponent(userId)}`, {
      cache: "no-store"
    });
    if (!response.ok) return false;

    const payload = await response.json() as { records?: CloudRecordRow[] };
    const rows = payload.records ?? [];
    const profile = rows.find((row) => row.record_type === "profile")?.payload as AthleteProfile | undefined;

    if (profile) writeJson(STORAGE_KEYS.profile, profile);
    mergeRemoteRecords<UploadRecord>(STORAGE_KEYS.uploads, rows, "upload", (remote, local) => ({
      ...remote,
      imageDataUrl: local?.imageDataUrl
    }));
    mergeRemoteRecords<ExtractedItem>(STORAGE_KEYS.extractedItems, rows, "extracted_item");
    mergeRemoteRecords<ExtractedSubstance>(STORAGE_KEYS.extractedSubstances, rows, "extracted_substance");
    mergeRemoteRecords<RiskCheck>(STORAGE_KEYS.riskChecks, rows, "risk_check");
    mergeRemoteRecords<IntakeLog>(STORAGE_KEYS.intakeLogs, rows, "intake_log");
    return true;
  } catch (error) {
    console.warn("[Storage] Supabase hydrate failed.", error);
    return false;
  }
}

export async function syncStorageWithSupabase(userId: string): Promise<boolean> {
  await syncLocalStorageToSupabase(userId);
  return hydrateStorageFromSupabase(userId);
}

export const storage = {
  getProfile(): AthleteProfile | null {
    return readJson<AthleteProfile | null>(STORAGE_KEYS.profile, null);
  },
  saveProfile(profile: AthleteProfile): void {
    writeJson(STORAGE_KEYS.profile, profile);
    saveCloudRecord("profile", profile, profile.id);
  },
  getUploads(): UploadRecord[] {
    return readJson<UploadRecord[]>(STORAGE_KEYS.uploads, []);
  },
  saveUpload(upload: UploadRecord): void {
    writeJson(STORAGE_KEYS.uploads, [...this.getUploads(), upload]);
    saveCloudRecord("upload", upload);
  },
  getExtractedItems(): ExtractedItem[] {
    return readJson<ExtractedItem[]>(STORAGE_KEYS.extractedItems, []);
  },
  saveExtractedItem(item: ExtractedItem): void {
    writeJson(STORAGE_KEYS.extractedItems, [...this.getExtractedItems(), item]);
    saveCloudRecord("extracted_item", item);
  },
  updateExtractedItem(item: ExtractedItem): void {
    writeJson(STORAGE_KEYS.extractedItems, upsertById(this.getExtractedItems(), item));
    saveCloudRecord("extracted_item", item);
  },
  getExtractedSubstances(): ExtractedSubstance[] {
    return readJson<ExtractedSubstance[]>(STORAGE_KEYS.extractedSubstances, []);
  },
  saveExtractedSubstance(substance: ExtractedSubstance): void {
    writeJson(STORAGE_KEYS.extractedSubstances, [...this.getExtractedSubstances(), substance]);
    saveCloudRecord("extracted_substance", substance);
  },
  getRiskChecks(): RiskCheck[] {
    return readJson<RiskCheck[]>(STORAGE_KEYS.riskChecks, []);
  },
  saveRiskCheck(check: RiskCheck): void {
    writeJson(STORAGE_KEYS.riskChecks, [...this.getRiskChecks(), check]);
    saveCloudRecord("risk_check", check);
  },
  getIntakeLogs(): IntakeLog[] {
    return readJson<IntakeLog[]>(STORAGE_KEYS.intakeLogs, []);
  },
  saveIntakeLog(log: IntakeLog): void {
    writeJson(STORAGE_KEYS.intakeLogs, [...this.getIntakeLogs(), log]);
    saveCloudRecord("intake_log", log);
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
  } & Partial<Pick<MedicationOcrResult, "intakeAmount" | "candidateProductNames" | "matchedMedication" | "medicationCandidates" | "databaseMatched">>): void {
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
