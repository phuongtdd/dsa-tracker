import { describe, expect, test } from "vitest";
import { dueReviews, goalMetToday, nextNewProblem, orderedProblems } from "./today";
import type { Problem, Progress, Topic } from "../types";

const topics: Topic[] = [
  { id: "b", order: 2, name: "B", expectedCount: 1 },
  { id: "a", order: 1, name: "A", expectedCount: 2 },
];
const P = (slug: string, topicId: string): Problem => ({
  slug, title: slug, difficulty: "Easy", topicId, leetcodeUrl: "",
});
const problems = [P("b1", "b"), P("a1", "a"), P("a2", "a")];
const done = (nextReview: string | null, dates: [string, boolean][] = []) => ({
  status: "done" as const, notes: "", reviewStage: 0 as const, nextReview,
  attempts: dates.map(([date, isReview]) => ({ date, isReview, rating: "medium" as const, usedSolution: false })),
});
const prog = (problemsMap: Progress["problems"]): Progress => ({ version: 1, problems: problemsMap, lastExportAt: null });

describe("today", () => {
  test("orderedProblems theo order chủ đề, giữ thứ tự trong chủ đề", () => {
    expect(orderedProblems(problems, topics).map((p) => p.slug)).toEqual(["a1", "a2", "b1"]);
  });
  test("nextNewProblem bỏ qua bài đã làm", () => {
    expect(nextNewProblem(problems, topics, prog({}))?.slug).toBe("a1");
    expect(nextNewProblem(problems, topics, prog({ a1: done(null) }))?.slug).toBe("a2");
  });
  test("nextNewProblem null khi làm hết", () => {
    expect(nextNewProblem(problems, topics, prog({ a1: done(null), a2: done(null), b1: done(null) }))).toBeNull();
  });
  test("dueReviews lọc đến hạn, sắp theo nextReview", () => {
    const p = prog({ a1: done("2026-09-26"), a2: done("2026-09-20"), b1: done("2026-09-30") });
    expect(dueReviews(problems, p, "2026-09-26").map((x) => x.slug)).toEqual(["a2", "a1"]);
  });
  test("goalMetToday chỉ tính bài mới", () => {
    expect(goalMetToday(prog({ a1: done(null, [["2026-09-26", true]]) }), "2026-09-26")).toBe(false);
    expect(goalMetToday(prog({ a1: done(null, [["2026-09-26", false]]) }), "2026-09-26")).toBe(true);
  });
});
