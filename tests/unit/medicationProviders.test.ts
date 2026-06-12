import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanEasyDrugText, EasyDrugMedicationProvider } from "@/lib/medicationProviders/easyDrugProvider";
import { LocalSeedMedicationProvider } from "@/lib/medicationProviders/localSeedProvider";
import { MfdsMedicationProvider } from "@/lib/medicationProviders/mfdsProvider";

describe("medication providers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("searches local seed products through provider interface", async () => {
    const provider = new LocalSeedMedicationProvider();
    const [result] = await provider.searchProducts("타이레놀 이알");

    expect(result.productName).toBe("타이레놀8시간이알서방정");
    expect(result.lookupSource.status).toBe("seed");
    expect(result.lookupSource.providerName).toBe("로컬 seed DB");
  });

  it("mfds provider returns empty list without api key", async () => {
    const provider = new MfdsMedicationProvider("");
    await expect(provider.searchProducts("타이레놀")).resolves.toEqual([]);
  });

  it("cleans EasyDrug HTML fields", () => {
    expect(cleanEasyDrugText("<p>복용 전&nbsp;확인</p><br />주의")).toBe("복용 전 확인 주의");
  });

  it("maps EasyDrug API fields to medication lookup metadata", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        body: {
          items: [
            {
              itemName: "판피린티정",
              efcyQesitm: "<p>감기 증상 완화</p>",
              intrcQesitm: "<p>다른 감기약과 병용 전 전문가와 상의</p>",
              seQesitm: "<p>졸음</p>"
            }
          ]
        }
      }), { status: 200 })
    ));

    const provider = new EasyDrugMedicationProvider("test-key");
    const [result] = await provider.searchProducts("판피린", 1);

    expect(result.productName).toBe("판피린티정");
    expect(result.efficacy).toBe("감기 증상 완화");
    expect(result.interactionWarnings).toContain("다른 감기약");
    expect(result.sideEffects).toBe("졸음");
    expect(result.lookupSource.status).toBe("external");
  });

  it("fills ingredient and content dosage from EasyDrug product name and directions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        body: {
          items: [
            {
              itemName: "이지엔6프로연질캡슐(덱시부프로펜)(수출명:DAUFENSoftCapsule)",
              useMethodQesitm: "성인은 1회 1캡슐(300 mg), 1일 2~4회 복용합니다."
            }
          ]
        }
      }), { status: 200 })
    ));

    const provider = new EasyDrugMedicationProvider("test-key");
    const [result] = await provider.searchProducts("이지엔6프로", 1);

    expect(result.ingredients).toEqual([{ name: "덱시부프로펜(KP)", dosage: "300.00mg" }]);
    expect(result.dosage).toBe("1캡슐당 300.00mg");
    expect(result.form).toBe("연질캡슐");
  });

  it("does not match EasyDrug products by ingredient parenthetical alone", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        body: {
          items: [
            {
              itemName: "이지엔6프로연질캡슐(덱시부프로펜)(수출명:DAUFENSoftCapsule)",
              useMethodQesitm: "성인은 1회 1캡슐(300 mg), 1일 2~4회 복용합니다."
            }
          ]
        }
      }), { status: 200 })
    ));

    const provider = new EasyDrugMedicationProvider("test-key");
    const results = await provider.searchProducts("덱시부프로펜", 1);

    expect(results).toEqual([]);
  });
});
