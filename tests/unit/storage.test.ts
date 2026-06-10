import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and reads a profile", () => {
    storage.saveProfile({
      id: "profile_1",
      name: "김도핑",
      birthDate: "2001-03-15",
      sport: "육상",
      createdAt: "2026-06-10T00:00:00.000Z"
    });

    expect(storage.getProfile()?.name).toBe("김도핑");
  });

  it("saves and reads uploads", () => {
    storage.saveUpload({
      id: "upload_1",
      userId: "profile_1",
      uploadType: "prescription",
      createdAt: "2026-06-10T00:00:00.000Z"
    });

    expect(storage.getUploads()).toHaveLength(1);
  });

  it("saves and reads extracted items", () => {
    storage.saveExtractedItem({
      id: "item_1",
      uploadId: "upload_1",
      userId: "profile_1",
      itemName: "콘서타정",
      userConfirmed: true,
      createdAt: "2026-06-10T00:00:00.000Z"
    });

    expect(storage.getExtractedItems()[0].itemName).toBe("콘서타정");
  });

  it("saves and reads risk checks", () => {
    storage.saveRiskCheck({
      id: "risk_1",
      itemId: "item_1",
      riskLevel: "high_risk_candidate",
      riskReason: "확인 필요",
      recommendedAction: "전문가 상담",
      createdAt: "2026-06-10T00:00:00.000Z"
    });

    expect(storage.getRiskChecks()[0].riskLevel).toBe("high_risk_candidate");
  });

  it("saves and reads extracted substances", () => {
    storage.saveExtractedSubstance({
      id: "substance_1",
      itemId: "item_1",
      userId: "profile_1",
      ingredientName: "pseudoephedrine",
      dosage: "60mg",
      sourceText: "pseudoephedrine 60mg",
      createdAt: "2026-06-10T00:00:00.000Z"
    });

    expect(storage.getExtractedSubstances()[0].ingredientName).toBe("pseudoephedrine");
  });

  it("saves and reads intake logs", () => {
    storage.saveIntakeLog({
      id: "log_1",
      userId: "profile_1",
      itemId: "item_1",
      intakeStatus: "taken",
      intakeDate: "2026-06-10",
      intakeTime: "09:00",
      createdAt: "2026-06-10T00:00:00.000Z"
    });

    expect(storage.getIntakeLogs()[0].intakeStatus).toBe("taken");
  });

  it("clears all records", () => {
    storage.saveUpload({
      id: "upload_1",
      userId: "profile_1",
      uploadType: "prescription",
      createdAt: "2026-06-10T00:00:00.000Z"
    });
    storage.clearAll();
    expect(storage.getUploads()).toEqual([]);
  });

  it("does not throw on broken JSON", () => {
    window.localStorage.setItem(STORAGE_KEYS.uploads, "{broken");
    expect(storage.getUploads()).toEqual([]);
  });
});
