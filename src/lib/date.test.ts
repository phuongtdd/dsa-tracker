import { describe, expect, test } from "vitest";
import { addDays, daysBetween, toISODate } from "./date";

describe("date", () => {
  test("toISODate dùng giờ máy, có pad 0", () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
  test("addDays qua tháng/năm", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  test("daysBetween", () => {
    expect(daysBetween("2026-09-01", "2026-09-26")).toBe(25);
    expect(daysBetween("2026-09-26", "2026-09-26")).toBe(0);
  });
});
