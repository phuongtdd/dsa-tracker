import { describe, expect, test } from "vitest";
import { TOPICS } from "./topics";
import { PROBLEMS, solutionPath, videoUrl } from "./problems";

describe("dữ liệu tĩnh", () => {
  test("18 chủ đề, order 1..18", () => {
    expect(TOPICS.map((t) => t.order)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
  });
  test("đủ 150 bài, slug không trùng", () => {
    expect(PROBLEMS).toHaveLength(150);
    expect(new Set(PROBLEMS.map((p) => p.slug)).size).toBe(150);
  });
  test("mọi topicId hợp lệ và số bài mỗi chủ đề khớp", () => {
    const ids = new Set(TOPICS.map((t) => t.id));
    expect(PROBLEMS.filter((p) => !ids.has(p.topicId))).toEqual([]);
    for (const t of TOPICS) {
      expect(PROBLEMS.filter((p) => p.topicId === t.id), t.id).toHaveLength(t.expectedCount);
    }
  });
  test("trong mỗi chủ đề sắp Easy → Medium → Hard", () => {
    const rank = { Easy: 0, Medium: 1, Hard: 2 };
    for (const t of TOPICS) {
      const r = PROBLEMS.filter((p) => p.topicId === t.id).map((p) => rank[p.difficulty]);
      expect(r, t.id).toEqual([...r].sort((x, y) => x - y));
    }
  });
  test("helpers", () => {
    const twoSum = PROBLEMS.find((p) => p.slug === "two-sum")!;
    expect(twoSum.leetcodeUrl).toBe("https://leetcode.com/problems/two-sum/");
    expect(solutionPath(twoSum)).toBe("solutions/01-arrays-hashing/two-sum.java");
    expect(videoUrl(twoSum)).toBe("https://www.youtube.com/results?search_query=neetcode%20Two%20Sum");
  });
});

test("đủ 18 guide, mỗi guide có template Java", async () => {
  const { GUIDES } = await import("./guides");
  for (const t of TOPICS) {
    expect(GUIDES[t.id], t.id).toBeTruthy();
    expect(GUIDES[t.id], t.id).toContain("```java");
  }
});
