import { describe, expect, it } from "vitest";
import { LocalSeedMedicationProvider } from "@/lib/medicationProviders/localSeedProvider";
import { MfdsMedicationProvider } from "@/lib/medicationProviders/mfdsProvider";

describe("medication providers", () => {
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
});
