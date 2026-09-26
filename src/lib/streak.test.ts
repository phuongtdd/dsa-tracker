import { describe, expect, test } from "vitest";
import { activityByDay, currentStreak, heatLevel, longestStreak } from "./streak";
import type { Progress } from "../types";

function progressWith(dates: Record<string, string[]>): Progress {
  const problems: Progress["problems"] = {};
  for (const [slug, ds] of Object.entries(dates)) {
    problems[slug] = {
      status: "done", notes: "", reviewStage: 0, nextReview: null,
      attempts: ds.map((date, i) => ({ date, rating: "medium", usedSolution: false, isReview: i > 0 })),
    };
  }
  return { version: 1, problems, lastExportAt: null };
}

describe("activityByDay", () => {
  test("gom slug theo ngày, nhiều attempt cùng ngày", () => {
    const m = activityByDay(progressWith({ a: ["2026-09-01"], b: ["2026-09-01", "2026-09-04"] }));
    expect(m.get("2026-09-01")).toEqual(["a", "b"]);
    expect(m.get("2026-09-04")).toEqual(["b"]);
  });
});

describe("currentStreak", () => {
  const days = new Set(["2026-09-23", "2026-09-24", "2026-09-25"]);
  test("hôm nay chưa làm vẫn giữ streak tới hôm qua", () => {
    expect(currentStreak(days, "2026-09-26")).toBe(3);
  });
  test("hôm nay đã làm", () => {
    expect(currentStreak(new Set([...days, "2026-09-26"]), "2026-09-26")).toBe(4);
  });
  test("bỏ quá 1 ngày → 0", () => {
    expect(currentStreak(days, "2026-09-27")).toBe(0);
  });
  test("qua năm", () => {
    expect(currentStreak(new Set(["2026-12-31", "2027-01-01"]), "2027-01-01")).toBe(2);
  });
});

describe("longestStreak", () => {
  test("chuỗi dài nhất, có ngắt quãng", () => {
    const days = new Set(["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-05", "2026-02-06"]);
    expect(longestStreak(days)).toBe(3);
    expect(longestStreak(new Set())).toBe(0);
  });
});

describe("heatLevel", () => {
  test("0,1,2,3,4+", () => {
    expect([0, 1, 2, 3, 4, 9].map(heatLevel)).toEqual([0, 1, 2, 3, 4, 4]);
  });
});
