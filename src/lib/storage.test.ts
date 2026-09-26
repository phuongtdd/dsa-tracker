import { beforeEach, describe, expect, test } from "vitest";
import { emptyProgress, exportFileName, loadProgress, parseProgress, saveProgress, STORAGE_KEY } from "./storage";
import type { Progress } from "../types";

const valid: Progress = {
  version: 1,
  lastExportAt: null,
  problems: {
    "two-sum": {
      status: "done", notes: "hash map", reviewStage: 0, nextReview: "2026-09-29",
      attempts: [{ date: "2026-09-26", rating: "medium", usedSolution: false, isReview: false, minutes: 20 }],
    },
  },
};

describe("parseProgress", () => {
  test("hợp lệ", () => {
    const r = parseProgress(JSON.stringify(valid));
    expect(r).toEqual({ ok: true, progress: valid });
  });
  test("không phải JSON", () => {
    const r = parseProgress("{oops");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/JSON/);
  });
  test("thiếu problems", () => {
    const r = parseProgress(JSON.stringify({ version: 1, lastExportAt: null }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/problems/);
  });
  test("attempt sai rating báo đúng slug", () => {
    const bad = structuredClone(valid) as any;
    bad.problems["two-sum"].attempts[0].rating = "super";
    const r = parseProgress(JSON.stringify(bad));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/two-sum/);
  });
  test("version lạ", () => {
    const r = parseProgress(JSON.stringify({ ...valid, version: 99 }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/version/);
  });
});

describe("load/save", () => {
  beforeEach(() => localStorage.clear());
  test("chưa có dữ liệu → rỗng", () => {
    expect(loadProgress(localStorage)).toEqual({ progress: emptyProgress(), recoveredFromCorruption: false });
  });
  test("save rồi load", () => {
    saveProgress(valid, localStorage);
    expect(loadProgress(localStorage).progress).toEqual(valid);
  });
  test("dữ liệu hỏng → backup key + rỗng", () => {
    localStorage.setItem(STORAGE_KEY, "garbage");
    const r = loadProgress(localStorage, () => 123);
    expect(r).toEqual({ progress: emptyProgress(), recoveredFromCorruption: true });
    expect(localStorage.getItem(`${STORAGE_KEY}-corrupt-123`)).toBe("garbage");
  });
});

test("exportFileName", () => {
  expect(exportFileName("2026-09-26")).toBe("dsa-progress-2026-09-26.json");
});
