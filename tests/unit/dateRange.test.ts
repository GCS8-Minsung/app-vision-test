import { describe, expect, it } from "vitest";
import { isWithinLastDays } from "@/lib/dateRange";

describe("isWithinLastDays", () => {
  const now = new Date("2026-06-10T12:00:00+09:00");

  it("includes today's record", () => {
    expect(isWithinLastDays("2026-06-10", 7, now)).toBe(true);
  });

  it("includes a record from 7 days ago", () => {
    expect(isWithinLastDays("2026-06-03", 7, now)).toBe(true);
  });

  it("excludes a record from 8 days ago in a 7 day report", () => {
    expect(isWithinLastDays("2026-06-02", 7, now)).toBe(false);
  });

  it("handles 14 day and 30 day ranges", () => {
    expect(isWithinLastDays("2026-05-27", 14, now)).toBe(true);
    expect(isWithinLastDays("2026-05-26", 14, now)).toBe(false);
    expect(isWithinLastDays("2026-05-11", 30, now)).toBe(true);
    expect(isWithinLastDays("2026-05-10", 30, now)).toBe(false);
  });

  it("excludes future dates", () => {
    expect(isWithinLastDays("2026-06-11", 7, now)).toBe(false);
  });
});
