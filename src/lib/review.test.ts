import { describe, expect, test } from "vitest";
import { applyAttempt, emptyProblemProgress, isDue } from "./review";
import type { Attempt } from "../types";

const a = (over: Partial<Attempt>): Attempt => ({
  date: "2026-09-01", rating: "medium", usedSolution: false, isReview: false, ...over,
});

describe("applyAttempt", () => {
  test("lần đầu medium → mốc 0, ôn sau 3 ngày, status done", () => {
    const p = applyAttempt(emptyProblemProgress(), a({}));
    expect(p.status).toBe("done");
    expect(p.reviewStage).toBe(0);
    expect(p.nextReview).toBe("2026-09-04");
    expect(p.attempts).toHaveLength(1);
  });
  test("lần đầu easy → mốc 1, ôn sau 7 ngày", () => {
    const p = applyAttempt(emptyProblemProgress(), a({ rating: "easy" }));
    expect(p.reviewStage).toBe(1);
    expect(p.nextReview).toBe("2026-09-08");
  });
  test("chuỗi ôn medium: 3 → 7 → 14 → đã thuộc", () => {
    let p = applyAttempt(emptyProblemProgress(), a({}));
    p = applyAttempt(p, a({ date: "2026-09-04", isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([1, "2026-09-11"]);
    p = applyAttempt(p, a({ date: "2026-09-11", isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([2, "2026-09-25"]);
    p = applyAttempt(p, a({ date: "2026-09-25", isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([3, null]);
  });
  test("ôn easy nhảy 2 mốc, không vượt quá 3", () => {
    let p = applyAttempt(emptyProblemProgress(), a({}));
    p = applyAttempt(p, a({ date: "2026-09-04", rating: "easy", isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([2, "2026-09-18"]);
    p = applyAttempt(p, a({ date: "2026-09-18", rating: "easy", isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([3, null]);
  });
  test("hard hoặc xem lời giải → reset về mốc 0", () => {
    let p = applyAttempt(emptyProblemProgress(), a({ rating: "easy" }));
    p = applyAttempt(p, a({ date: "2026-09-08", rating: "hard", isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([0, "2026-09-11"]);
    p = applyAttempt(p, a({ date: "2026-09-11", rating: "easy", usedSolution: true, isReview: true }));
    expect([p.reviewStage, p.nextReview]).toEqual([0, "2026-09-14"]);
  });
  test("không mutate input", () => {
    const base = emptyProblemProgress();
    applyAttempt(base, a({}));
    expect(base.attempts).toHaveLength(0);
  });
});

describe("isDue", () => {
  test("đến hạn khi nextReview <= hôm nay", () => {
    const p = applyAttempt(emptyProblemProgress(), a({}));
    expect(isDue(p, "2026-09-03")).toBe(false);
    expect(isDue(p, "2026-09-04")).toBe(true);
    expect(isDue(p, "2026-09-10")).toBe(true);
    expect(isDue(emptyProblemProgress(), "2026-09-10")).toBe(false);
  });
});
