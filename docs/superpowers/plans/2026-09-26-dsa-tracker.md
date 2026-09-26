# DSA Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web app chạy local hướng dẫn và theo dõi tiến độ học NeetCode 150 (1 bài/ngày) — theo spec `docs/superpowers/specs/2026-09-26-dsa-tracker-design.md`.

**Architecture:** React SPA (Vite). Dữ liệu tĩnh (150 bài, 18 guide markdown) nằm trong `src/data`. Toàn bộ logic nghiệp vụ là hàm thuần trong `src/lib` (test bằng Vitest). Trạng thái tiến độ nằm trong một React context, đồng bộ xuống localStorage sau mỗi thay đổi.

**Tech Stack:** React 19, TypeScript, Vite, react-router-dom, react-markdown + rehype-highlight (highlight.js), Vitest, jsdom, React Testing Library.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html` | Cấu hình build/test |
| `src/types.ts` | Mọi kiểu dữ liệu dùng chung |
| `src/lib/date.ts` | Ngày dạng `YYYY-MM-DD` theo giờ máy |
| `src/lib/review.ts` | Spaced repetition |
| `src/lib/streak.ts` | Ngày hoạt động, streak, mức heatmap |
| `src/lib/today.ts` | Bài hôm nay, bài cần ôn, mục tiêu ngày |
| `src/lib/storage.ts` | Validate/migrate/load/save progress |
| `src/data/topics.ts` | 18 chủ đề + số bài kỳ vọng |
| `src/data/problems.ts` | 150 bài + helper `videoUrl`, `solutionPath` |
| `src/data/guides.ts` | Nạp `guides/*.md` bằng `import.meta.glob` |
| `src/data/guides/<topic-id>.md` | 18 file hướng dẫn |
| `src/state/ProgressContext.tsx` | Context + hook `useProgress` |
| `src/components/*.tsx` | AttemptDialog, Heatmap, StatsRow, ProblemLinks, ProblemDetail |
| `src/pages/*.tsx` | TodayPage, RoadmapPage, TopicPage, SettingsPage |
| `src/App.tsx`, `src/main.tsx`, `src/styles.css` | Khung app, router, style |

---

### Task 1: Scaffold dự án

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`, `src/lib/sanity.test.ts`, `solutions/.gitkeep`, `backups/.gitkeep`

- [ ] **Step 1: Tạo `package.json`**

```json
{
  "name": "dsa-tracker",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Cài dependency**

```bash
npm install react react-dom react-router-dom react-markdown rehype-highlight highlight.js
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Tạo `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

- [ ] **Step 4: Tạo `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 5: Tạo `index.html`, `src/main.tsx`, `src/App.tsx` tạm, `src/test/setup.ts`, `.gitignore`**

`index.html`:
```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DSA Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`:
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (tạm, thay ở Task 9):
```tsx
export default function App() {
  return <h1>DSA Tracker</h1>;
}
```

`src/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

`.gitignore`:
```
node_modules
dist
```

`solutions/.gitkeep`, `backups/.gitkeep`: file rỗng.

- [ ] **Step 6: Test sanity** — `src/lib/sanity.test.ts`:

```ts
import { expect, test } from "vitest";
test("vitest chạy", () => expect(1 + 1).toBe(2));
```

Run: `npm test` → PASS. Run: `npx tsc` → không lỗi. Sau đó xoá `src/lib/sanity.test.ts`.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "chore: scaffold vite react-ts app"`

---

### Task 2: Types và date utils

**Files:** Create `src/types.ts`, `src/lib/date.ts`, Test `src/lib/date.test.ts`

- [ ] **Step 1: `src/types.ts`**

```ts
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Topic = { id: string; order: number; name: string; expectedCount: number };
export type Problem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  topicId: string;
  leetcodeUrl: string;
  premium?: boolean;
};

export type Rating = "easy" | "medium" | "hard";
export type Attempt = {
  date: string;
  rating: Rating;
  minutes?: number;
  usedSolution: boolean;
  isReview: boolean;
};
export type ReviewStage = 0 | 1 | 2 | 3;
export type ProblemProgress = {
  status: "todo" | "done";
  attempts: Attempt[];
  notes: string;
  reviewStage: ReviewStage;
  nextReview: string | null;
};
export type Progress = {
  version: 1;
  problems: Record<string, ProblemProgress>;
  lastExportAt: string | null;
};
```

- [ ] **Step 2: Test fail** — `src/lib/date.test.ts`:

```ts
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
```

Run: `npx vitest run src/lib/date.test.ts` → FAIL (module not found).

- [ ] **Step 3: `src/lib/date.ts`**

```ts
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function daysBetween(from: string, to: string): number {
  const ms = fromISODate(to).getTime() - fromISODate(from).getTime();
  return Math.round(ms / 86_400_000);
}
```

- [ ] **Step 4:** Run: `npx vitest run src/lib/date.test.ts` → PASS
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: add shared types and date utils"`

---

### Task 3: Spaced repetition (`review.ts`)

**Files:** Create `src/lib/review.ts`, Test `src/lib/review.test.ts`

- [ ] **Step 1: Test fail**

```ts
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
```

Run: `npx vitest run src/lib/review.test.ts` → FAIL.

- [ ] **Step 2: `src/lib/review.ts`**

```ts
import type { Attempt, ProblemProgress, ReviewStage } from "../types";
import { addDays } from "./date";

export const INTERVALS = [3, 7, 14] as const;
export const MASTERED: ReviewStage = 3;

export function emptyProblemProgress(): ProblemProgress {
  return { status: "todo", attempts: [], notes: "", reviewStage: 0, nextReview: null };
}

export function applyAttempt(p: ProblemProgress, attempt: Attempt): ProblemProgress {
  let stage: number;
  if (attempt.rating === "hard" || attempt.usedSolution) stage = 0;
  else if (!attempt.isReview) stage = attempt.rating === "easy" ? 1 : 0;
  else stage = p.reviewStage + (attempt.rating === "easy" ? 2 : 1);

  const reviewStage = Math.min(stage, MASTERED) as ReviewStage;
  const nextReview =
    reviewStage === MASTERED ? null : addDays(attempt.date, INTERVALS[reviewStage]);

  return { ...p, status: "done", attempts: [...p.attempts, attempt], reviewStage, nextReview };
}

export function isDue(p: ProblemProgress, today: string): boolean {
  return p.nextReview !== null && p.nextReview <= today;
}
```

- [ ] **Step 3:** Run: `npx vitest run src/lib/review.test.ts` → PASS
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: spaced repetition scheduling"`

---

### Task 4: Streak & heatmap (`streak.ts`)

**Files:** Create `src/lib/streak.ts`, Test `src/lib/streak.test.ts`

- [ ] **Step 1: Test fail**

```ts
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
```

Run → FAIL.

- [ ] **Step 2: `src/lib/streak.ts`**

```ts
import type { Progress } from "../types";
import { addDays } from "./date";

/** date → danh sách slug có attempt trong ngày (không trùng). */
export function activityByDay(progress: Progress): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [slug, p] of Object.entries(progress.problems)) {
    for (const { date } of p.attempts) {
      const list = map.get(date) ?? [];
      if (!list.includes(slug)) list.push(slug);
      map.set(date, list);
    }
  }
  return map;
}

export function currentStreak(days: Set<string>, today: string): number {
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function longestStreak(days: Set<string>): number {
  let best = 0;
  for (const d of days) {
    if (days.has(addDays(d, -1))) continue; // chỉ đếm từ đầu chuỗi
    let len = 1;
    let cursor = addDays(d, 1);
    while (days.has(cursor)) {
      len++;
      cursor = addDays(cursor, 1);
    }
    best = Math.max(best, len);
  }
  return best;
}

export function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  return Math.min(count, 4) as 0 | 1 | 2 | 3 | 4;
}
```

- [ ] **Step 3:** Run → PASS
- [ ] **Step 4: Commit** — `git commit -am "feat: streak and heatmap helpers"` (dùng `git add -A` trước)

---

### Task 5: Dữ liệu tĩnh — topics & problems

**Files:** Create `src/data/topics.ts`, `src/data/problems.ts`, Test `src/data/data.test.ts`

- [ ] **Step 1: Test fail** — `src/data/data.test.ts`

```ts
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
```

- [ ] **Step 2: `src/data/topics.ts`**

```ts
import type { Topic } from "../types";

export const TOPICS: Topic[] = [
  { id: "arrays-hashing", order: 1, name: "Arrays & Hashing", expectedCount: 9 },
  { id: "two-pointers", order: 2, name: "Two Pointers", expectedCount: 5 },
  { id: "sliding-window", order: 3, name: "Sliding Window", expectedCount: 6 },
  { id: "stack", order: 4, name: "Stack", expectedCount: 7 },
  { id: "binary-search", order: 5, name: "Binary Search", expectedCount: 7 },
  { id: "linked-list", order: 6, name: "Linked List", expectedCount: 11 },
  { id: "trees", order: 7, name: "Trees", expectedCount: 15 },
  { id: "tries", order: 8, name: "Tries", expectedCount: 3 },
  { id: "heap", order: 9, name: "Heap / Priority Queue", expectedCount: 7 },
  { id: "backtracking", order: 10, name: "Backtracking", expectedCount: 9 },
  { id: "graphs", order: 11, name: "Graphs", expectedCount: 13 },
  { id: "advanced-graphs", order: 12, name: "Advanced Graphs", expectedCount: 6 },
  { id: "dp-1d", order: 13, name: "1-D Dynamic Programming", expectedCount: 12 },
  { id: "dp-2d", order: 14, name: "2-D Dynamic Programming", expectedCount: 11 },
  { id: "greedy", order: 15, name: "Greedy", expectedCount: 8 },
  { id: "intervals", order: 16, name: "Intervals", expectedCount: 6 },
  { id: "math-geometry", order: 17, name: "Math & Geometry", expectedCount: 8 },
  { id: "bit-manipulation", order: 18, name: "Bit Manipulation", expectedCount: 7 },
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
```

- [ ] **Step 3: `src/data/problems.ts`** — danh sách gọn dạng tuple `[slug, title, difficulty, premium?]` theo chủ đề, rồi map sang `Problem`.

```ts
import type { Difficulty, Problem } from "../types";
import { topicById } from "./topics";

type Row = [slug: string, title: string, difficulty: Difficulty, premium?: true];

const BY_TOPIC: Record<string, Row[]> = {
  "arrays-hashing": [
    ["contains-duplicate", "Contains Duplicate", "Easy"],
    ["valid-anagram", "Valid Anagram", "Easy"],
    ["two-sum", "Two Sum", "Easy"],
    ["group-anagrams", "Group Anagrams", "Medium"],
    ["top-k-frequent-elements", "Top K Frequent Elements", "Medium"],
    ["encode-and-decode-strings", "Encode and Decode Strings", "Medium", true],
    ["product-of-array-except-self", "Product of Array Except Self", "Medium"],
    ["valid-sudoku", "Valid Sudoku", "Medium"],
    ["longest-consecutive-sequence", "Longest Consecutive Sequence", "Medium"],
  ],
  "two-pointers": [
    ["valid-palindrome", "Valid Palindrome", "Easy"],
    ["two-sum-ii-input-array-is-sorted", "Two Sum II - Input Array Is Sorted", "Medium"],
    ["3sum", "3Sum", "Medium"],
    ["container-with-most-water", "Container With Most Water", "Medium"],
    ["trapping-rain-water", "Trapping Rain Water", "Hard"],
  ],
  "sliding-window": [
    ["best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "Easy"],
    ["longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "Medium"],
    ["longest-repeating-character-replacement", "Longest Repeating Character Replacement", "Medium"],
    ["permutation-in-string", "Permutation in String", "Medium"],
    ["minimum-window-substring", "Minimum Window Substring", "Hard"],
    ["sliding-window-maximum", "Sliding Window Maximum", "Hard"],
  ],
  stack: [
    ["valid-parentheses", "Valid Parentheses", "Easy"],
    ["min-stack", "Min Stack", "Medium"],
    ["evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "Medium"],
    ["generate-parentheses", "Generate Parentheses", "Medium"],
    ["daily-temperatures", "Daily Temperatures", "Medium"],
    ["car-fleet", "Car Fleet", "Medium"],
    ["largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "Hard"],
  ],
  "binary-search": [
    ["binary-search", "Binary Search", "Easy"],
    ["search-a-2d-matrix", "Search a 2D Matrix", "Medium"],
    ["koko-eating-bananas", "Koko Eating Bananas", "Medium"],
    ["find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "Medium"],
    ["search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Medium"],
    ["time-based-key-value-store", "Time Based Key-Value Store", "Medium"],
    ["median-of-two-sorted-arrays", "Median of Two Sorted Arrays", "Hard"],
  ],
  "linked-list": [
    ["reverse-linked-list", "Reverse Linked List", "Easy"],
    ["merge-two-sorted-lists", "Merge Two Sorted Lists", "Easy"],
    ["linked-list-cycle", "Linked List Cycle", "Easy"],
    ["reorder-list", "Reorder List", "Medium"],
    ["remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "Medium"],
    ["copy-list-with-random-pointer", "Copy List with Random Pointer", "Medium"],
    ["add-two-numbers", "Add Two Numbers", "Medium"],
    ["find-the-duplicate-number", "Find the Duplicate Number", "Medium"],
    ["lru-cache", "LRU Cache", "Medium"],
    ["merge-k-sorted-lists", "Merge k Sorted Lists", "Hard"],
    ["reverse-nodes-in-k-group", "Reverse Nodes in k-Group", "Hard"],
  ],
  trees: [
    ["invert-binary-tree", "Invert Binary Tree", "Easy"],
    ["maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "Easy"],
    ["diameter-of-binary-tree", "Diameter of Binary Tree", "Easy"],
    ["balanced-binary-tree", "Balanced Binary Tree", "Easy"],
    ["same-tree", "Same Tree", "Easy"],
    ["subtree-of-another-tree", "Subtree of Another Tree", "Easy"],
    ["lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a Binary Search Tree", "Medium"],
    ["binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "Medium"],
    ["binary-tree-right-side-view", "Binary Tree Right Side View", "Medium"],
    ["count-good-nodes-in-binary-tree", "Count Good Nodes in Binary Tree", "Medium"],
    ["validate-binary-search-tree", "Validate Binary Search Tree", "Medium"],
    ["kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "Medium"],
    ["construct-binary-tree-from-preorder-and-inorder-traversal", "Construct Binary Tree from Preorder and Inorder Traversal", "Medium"],
    ["binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "Hard"],
    ["serialize-and-deserialize-binary-tree", "Serialize and Deserialize Binary Tree", "Hard"],
  ],
  tries: [
    ["implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "Medium"],
    ["design-add-and-search-words-data-structure", "Design Add and Search Words Data Structure", "Medium"],
    ["word-search-ii", "Word Search II", "Hard"],
  ],
  heap: [
    ["kth-largest-element-in-a-stream", "Kth Largest Element in a Stream", "Easy"],
    ["last-stone-weight", "Last Stone Weight", "Easy"],
    ["k-closest-points-to-origin", "K Closest Points to Origin", "Medium"],
    ["kth-largest-element-in-an-array", "Kth Largest Element in an Array", "Medium"],
    ["task-scheduler", "Task Scheduler", "Medium"],
    ["design-twitter", "Design Twitter", "Medium"],
    ["find-median-from-data-stream", "Find Median from Data Stream", "Hard"],
  ],
  backtracking: [
    ["subsets", "Subsets", "Medium"],
    ["combination-sum", "Combination Sum", "Medium"],
    ["combination-sum-ii", "Combination Sum II", "Medium"],
    ["permutations", "Permutations", "Medium"],
    ["subsets-ii", "Subsets II", "Medium"],
    ["word-search", "Word Search", "Medium"],
    ["palindrome-partitioning", "Palindrome Partitioning", "Medium"],
    ["letter-combinations-of-a-phone-number", "Letter Combinations of a Phone Number", "Medium"],
    ["n-queens", "N-Queens", "Hard"],
  ],
  graphs: [
    ["number-of-islands", "Number of Islands", "Medium"],
    ["max-area-of-island", "Max Area of Island", "Medium"],
    ["clone-graph", "Clone Graph", "Medium"],
    ["walls-and-gates", "Walls and Gates", "Medium", true],
    ["rotting-oranges", "Rotting Oranges", "Medium"],
    ["pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "Medium"],
    ["surrounded-regions", "Surrounded Regions", "Medium"],
    ["course-schedule", "Course Schedule", "Medium"],
    ["course-schedule-ii", "Course Schedule II", "Medium"],
    ["graph-valid-tree", "Graph Valid Tree", "Medium", true],
    ["number-of-connected-components-in-an-undirected-graph", "Number of Connected Components in an Undirected Graph", "Medium", true],
    ["redundant-connection", "Redundant Connection", "Medium"],
    ["word-ladder", "Word Ladder", "Hard"],
  ],
  "advanced-graphs": [
    ["network-delay-time", "Network Delay Time", "Medium"],
    ["min-cost-to-connect-all-points", "Min Cost to Connect All Points", "Medium"],
    ["cheapest-flights-within-k-stops", "Cheapest Flights Within K Stops", "Medium"],
    ["reconstruct-itinerary", "Reconstruct Itinerary", "Hard"],
    ["swim-in-rising-water", "Swim in Rising Water", "Hard"],
    ["alien-dictionary", "Alien Dictionary", "Hard", true],
  ],
  "dp-1d": [
    ["climbing-stairs", "Climbing Stairs", "Easy"],
    ["min-cost-climbing-stairs", "Min Cost Climbing Stairs", "Easy"],
    ["house-robber", "House Robber", "Medium"],
    ["house-robber-ii", "House Robber II", "Medium"],
    ["longest-palindromic-substring", "Longest Palindromic Substring", "Medium"],
    ["palindromic-substrings", "Palindromic Substrings", "Medium"],
    ["decode-ways", "Decode Ways", "Medium"],
    ["coin-change", "Coin Change", "Medium"],
    ["maximum-product-subarray", "Maximum Product Subarray", "Medium"],
    ["word-break", "Word Break", "Medium"],
    ["longest-increasing-subsequence", "Longest Increasing Subsequence", "Medium"],
    ["partition-equal-subset-sum", "Partition Equal Subset Sum", "Medium"],
  ],
  "dp-2d": [
    ["unique-paths", "Unique Paths", "Medium"],
    ["longest-common-subsequence", "Longest Common Subsequence", "Medium"],
    ["best-time-to-buy-and-sell-stock-with-cooldown", "Best Time to Buy and Sell Stock with Cooldown", "Medium"],
    ["coin-change-ii", "Coin Change II", "Medium"],
    ["target-sum", "Target Sum", "Medium"],
    ["interleaving-string", "Interleaving String", "Medium"],
    ["edit-distance", "Edit Distance", "Medium"],
    ["longest-increasing-path-in-a-matrix", "Longest Increasing Path in a Matrix", "Hard"],
    ["distinct-subsequences", "Distinct Subsequences", "Hard"],
    ["burst-balloons", "Burst Balloons", "Hard"],
    ["regular-expression-matching", "Regular Expression Matching", "Hard"],
  ],
  greedy: [
    ["maximum-subarray", "Maximum Subarray", "Medium"],
    ["jump-game", "Jump Game", "Medium"],
    ["jump-game-ii", "Jump Game II", "Medium"],
    ["gas-station", "Gas Station", "Medium"],
    ["hand-of-straights", "Hand of Straights", "Medium"],
    ["merge-triplets-to-form-target-triplet", "Merge Triplets to Form Target Triplet", "Medium"],
    ["partition-labels", "Partition Labels", "Medium"],
    ["valid-parenthesis-string", "Valid Parenthesis String", "Medium"],
  ],
  intervals: [
    ["meeting-rooms", "Meeting Rooms", "Easy", true],
    ["insert-interval", "Insert Interval", "Medium"],
    ["merge-intervals", "Merge Intervals", "Medium"],
    ["non-overlapping-intervals", "Non-overlapping Intervals", "Medium"],
    ["meeting-rooms-ii", "Meeting Rooms II", "Medium", true],
    ["minimum-interval-to-include-each-query", "Minimum Interval to Include Each Query", "Hard"],
  ],
  "math-geometry": [
    ["happy-number", "Happy Number", "Easy"],
    ["plus-one", "Plus One", "Easy"],
    ["rotate-image", "Rotate Image", "Medium"],
    ["spiral-matrix", "Spiral Matrix", "Medium"],
    ["set-matrix-zeroes", "Set Matrix Zeroes", "Medium"],
    ["powx-n", "Pow(x, n)", "Medium"],
    ["multiply-strings", "Multiply Strings", "Medium"],
    ["detect-squares", "Detect Squares", "Medium"],
  ],
  "bit-manipulation": [
    ["single-number", "Single Number", "Easy"],
    ["number-of-1-bits", "Number of 1 Bits", "Easy"],
    ["counting-bits", "Counting Bits", "Easy"],
    ["reverse-bits", "Reverse Bits", "Easy"],
    ["missing-number", "Missing Number", "Easy"],
    ["sum-of-two-integers", "Sum of Two Integers", "Medium"],
    ["reverse-integer", "Reverse Integer", "Medium"],
  ],
};

export const PROBLEMS: Problem[] = Object.entries(BY_TOPIC).flatMap(([topicId, rows]) =>
  rows.map(([slug, title, difficulty, premium]) => ({
    slug,
    title,
    difficulty,
    topicId,
    leetcodeUrl: `https://leetcode.com/problems/${slug}/`,
    ...(premium ? { premium: true } : {}),
  })),
);

export const problemBySlug = (slug: string) => PROBLEMS.find((p) => p.slug === slug);

export function videoUrl(p: Problem): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`neetcode ${p.title}`)}`;
}

export function solutionPath(p: Problem): string {
  const t = topicById(p.topicId)!;
  return `solutions/${String(t.order).padStart(2, "0")}-${t.id}/${p.slug}.java`;
}
```

- [ ] **Step 4:** Run: `npx vitest run src/data` → PASS
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: NeetCode 150 topic and problem data"`

---

### Task 6: Bài hôm nay (`today.ts`)

**Files:** Create `src/lib/today.ts`, Test `src/lib/today.test.ts`

- [ ] **Step 1: Test fail**

```ts
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
```

- [ ] **Step 2: `src/lib/today.ts`**

```ts
import type { Problem, Progress, Topic } from "../types";
import { isDue } from "./review";

export function orderedProblems(problems: Problem[], topics: Topic[]): Problem[] {
  const order = new Map(topics.map((t) => [t.id, t.order]));
  return problems
    .map((p, i) => ({ p, i }))
    .sort((x, y) => order.get(x.p.topicId)! - order.get(y.p.topicId)! || x.i - y.i)
    .map(({ p }) => p);
}

export function nextNewProblem(problems: Problem[], topics: Topic[], progress: Progress): Problem | null {
  return (
    orderedProblems(problems, topics).find((p) => progress.problems[p.slug]?.status !== "done") ?? null
  );
}

export function dueReviews(problems: Problem[], progress: Progress, today: string): Problem[] {
  return problems
    .filter((p) => {
      const pp = progress.problems[p.slug];
      return pp !== undefined && isDue(pp, today);
    })
    .sort((a, b) =>
      progress.problems[a.slug].nextReview!.localeCompare(progress.problems[b.slug].nextReview!),
    );
}

export function goalMetToday(progress: Progress, today: string): boolean {
  return Object.values(progress.problems).some((p) =>
    p.attempts.some((a) => a.date === today && !a.isReview),
  );
}
```

- [ ] **Step 3:** Run → PASS
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: today selection logic"`

---

### Task 7: Storage (`storage.ts`)

**Files:** Create `src/lib/storage.ts`, Test `src/lib/storage.test.ts`

- [ ] **Step 1: Test fail**

```ts
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
```

- [ ] **Step 2: `src/lib/storage.ts`**

```ts
import type { Progress } from "../types";

export const STORAGE_KEY = "dsa-progress";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ParseResult = { ok: true; progress: Progress } | { ok: false; error: string };

export function emptyProgress(): Progress {
  return { version: 1, problems: {}, lastExportAt: null };
}

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** Nâng cấp dữ liệu cũ lên version hiện tại. Hiện chỉ có v1. */
export function migrate(raw: unknown): unknown {
  return raw;
}

function validate(raw: unknown): string | null {
  if (!isObj(raw)) return "Dữ liệu phải là một object";
  if (raw.version !== 1) return `version không được hỗ trợ: ${String(raw.version)}`;
  if (raw.lastExportAt !== null && typeof raw.lastExportAt !== "string")
    return "lastExportAt phải là chuỗi hoặc null";
  if (!isObj(raw.problems)) return "Thiếu trường problems";
  for (const [slug, p] of Object.entries(raw.problems)) {
    const where = `problems["${slug}"]`;
    if (!isObj(p)) return `${where} không hợp lệ`;
    if (p.status !== "todo" && p.status !== "done") return `${where}.status không hợp lệ`;
    if (typeof p.notes !== "string") return `${where}.notes phải là chuỗi`;
    if (![0, 1, 2, 3].includes(p.reviewStage as number)) return `${where}.reviewStage không hợp lệ`;
    if (p.nextReview !== null && !(typeof p.nextReview === "string" && DATE_RE.test(p.nextReview)))
      return `${where}.nextReview không hợp lệ`;
    if (!Array.isArray(p.attempts)) return `${where}.attempts phải là mảng`;
    for (const [i, a] of p.attempts.entries()) {
      const aw = `${where}.attempts[${i}]`;
      if (!isObj(a)) return `${aw} không hợp lệ`;
      if (typeof a.date !== "string" || !DATE_RE.test(a.date)) return `${aw}.date không hợp lệ`;
      if (!["easy", "medium", "hard"].includes(a.rating as string)) return `${aw}.rating không hợp lệ`;
      if (typeof a.usedSolution !== "boolean") return `${aw}.usedSolution phải là boolean`;
      if (typeof a.isReview !== "boolean") return `${aw}.isReview phải là boolean`;
      if (a.minutes !== undefined && typeof a.minutes !== "number") return `${aw}.minutes phải là số`;
    }
  }
  return null;
}

export function parseProgress(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "File không phải JSON hợp lệ" };
  }
  const migrated = migrate(raw);
  const error = validate(migrated);
  return error ? { ok: false, error } : { ok: true, progress: migrated as Progress };
}

export function loadProgress(
  storage: Storage = localStorage,
  now: () => number = Date.now,
): { progress: Progress; recoveredFromCorruption: boolean } {
  const text = storage.getItem(STORAGE_KEY);
  if (text === null) return { progress: emptyProgress(), recoveredFromCorruption: false };
  const r = parseProgress(text);
  if (r.ok) return { progress: r.progress, recoveredFromCorruption: false };
  storage.setItem(`${STORAGE_KEY}-corrupt-${now()}`, text);
  return { progress: emptyProgress(), recoveredFromCorruption: true };
}

export function saveProgress(p: Progress, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function exportFileName(today: string): string {
  return `dsa-progress-${today}.json`;
}
```

- [ ] **Step 3:** Run → PASS. Run `npx tsc` → không lỗi.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: progress storage with validation"`

---

### Task 8: Progress context

**Files:** Create `src/state/ProgressContext.tsx`

- [ ] **Step 1: Viết context**

```tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Progress, Rating } from "../types";
import { applyAttempt, emptyProblemProgress } from "../lib/review";
import { emptyProgress, loadProgress, saveProgress } from "../lib/storage";
import { todayISO } from "../lib/date";

export type AttemptInput = { rating: Rating; minutes?: number; usedSolution: boolean; note: string };

type Ctx = {
  progress: Progress;
  today: string;
  recoveredFromCorruption: boolean;
  dismissRecovery: () => void;
  recordAttempt: (slug: string, input: AttemptInput) => void;
  setNotes: (slug: string, notes: string) => void;
  replaceProgress: (p: Progress) => void;
  markExported: (iso: string) => void;
  resetAll: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadProgress());
  const [progress, setProgress] = useState<Progress>(initial.progress);
  const [recovered, setRecovered] = useState(initial.recoveredFromCorruption);
  const today = todayISO();

  useEffect(() => saveProgress(progress), [progress]);

  const value = useMemo<Ctx>(() => {
    const updateProblem = (slug: string, fn: (p: ReturnType<typeof emptyProblemProgress>) => ReturnType<typeof emptyProblemProgress>) =>
      setProgress((prev) => ({
        ...prev,
        problems: { ...prev.problems, [slug]: fn(prev.problems[slug] ?? emptyProblemProgress()) },
      }));
    return {
      progress,
      today,
      recoveredFromCorruption: recovered,
      dismissRecovery: () => setRecovered(false),
      recordAttempt: (slug, { rating, minutes, usedSolution, note }) =>
        updateProblem(slug, (p) => {
          const next = applyAttempt(p, {
            date: today, rating, usedSolution, isReview: p.status === "done",
            ...(minutes !== undefined ? { minutes } : {}),
          });
          const trimmed = note.trim();
          if (!trimmed) return next;
          const notes = next.notes ? `${next.notes}\n\n**${today}:** ${trimmed}` : `**${today}:** ${trimmed}`;
          return { ...next, notes };
        }),
      setNotes: (slug, notes) => updateProblem(slug, (p) => ({ ...p, notes })),
      replaceProgress: (p) => setProgress(p),
      markExported: (iso) => setProgress((prev) => ({ ...prev, lastExportAt: iso })),
      resetAll: () => setProgress(emptyProgress()),
    };
  }, [progress, recovered, today]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress phải nằm trong ProgressProvider");
  return ctx;
}
```

- [ ] **Step 2:** Run `npx tsc` → không lỗi.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: progress context"`

---

### Task 9: Khung app, style, trang Hôm nay + smoke test

**Files:** Create `src/styles.css`, `src/components/ProblemLinks.tsx`, `src/components/AttemptDialog.tsx`, `src/components/StatsRow.tsx`, `src/components/Heatmap.tsx`, `src/pages/TodayPage.tsx`, Modify `src/App.tsx`, `src/main.tsx`, Test `src/pages/TodayPage.test.tsx`

- [ ] **Step 1: Smoke test fail** — `src/pages/TodayPage.test.tsx`

```tsx
import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ProgressProvider } from "../state/ProgressContext";
import TodayPage from "./TodayPage";

beforeEach(() => localStorage.clear());

test("đánh dấu xong bài hôm nay → đạt mục tiêu, streak 1, bài kế tiếp", async () => {
  render(
    <MemoryRouter>
      <ProgressProvider>
        <TodayPage />
      </ProgressProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Contains Duplicate" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Đánh dấu xong" }));
  await userEvent.click(screen.getByRole("radio", { name: "Vừa" }));
  await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
  expect(screen.getByText(/Đã hoàn thành mục tiêu hôm nay/)).toBeInTheDocument();
  expect(screen.getByTestId("streak-current")).toHaveTextContent("1");
  await userEvent.click(screen.getByRole("button", { name: "Làm thêm bài nữa" }));
  expect(screen.getByRole("heading", { name: "Valid Anagram" })).toBeInTheDocument();
});
```

- [ ] **Step 2: `src/styles.css`** — biến màu trên `:root`, dark mode qua `@media (prefers-color-scheme: dark)`, class: `.app-nav`, `.container`, `.card`, `.btn`, `.btn-primary`, `.badge`, `.badge-easy/.badge-medium/.badge-hard`, `.stats`, `.stat`, `.heatmap`, `.heat-0..4`, `.dialog-backdrop`, `.dialog`, `.topic-grid`, `.topic-card`, `.progress-bar`, `.table`, `.banner`, `.muted`, `.guide` (xem code trong commit).

- [ ] **Step 3: Components**

`src/components/ProblemLinks.tsx`:
```tsx
import type { Problem } from "../types";
import { videoUrl } from "../data/problems";

export function DifficultyBadge({ d }: { d: Problem["difficulty"] }) {
  return <span className={`badge badge-${d.toLowerCase()}`}>{d}</span>;
}

export function ProblemLinks({ problem }: { problem: Problem }) {
  return (
    <>
      <a className="btn" href={problem.leetcodeUrl} target="_blank" rel="noreferrer">Mở LeetCode</a>
      <a className="btn" href={videoUrl(problem)} target="_blank" rel="noreferrer">Xem video</a>
    </>
  );
}
```

`src/components/AttemptDialog.tsx`:
```tsx
import { useState } from "react";
import type { Problem, Rating } from "../types";
import { useProgress } from "../state/ProgressContext";

const RATINGS: [Rating, string][] = [["easy", "Dễ"], ["medium", "Vừa"], ["hard", "Khó"]];

export function AttemptDialog({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const { progress, recordAttempt } = useProgress();
  const isReview = progress.problems[problem.slug]?.status === "done";
  const [rating, setRating] = useState<Rating | null>(null);
  const [minutes, setMinutes] = useState("");
  const [usedSolution, setUsedSolution] = useState(false);
  const [note, setNote] = useState("");

  const save = () => {
    if (!rating) return;
    const m = Number(minutes);
    recordAttempt(problem.slug, {
      rating, usedSolution, note,
      ...(minutes.trim() && Number.isFinite(m) && m > 0 ? { minutes: m } : {}),
    });
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-label={problem.title} onClick={(e) => e.stopPropagation()}>
        <h3>{isReview ? "Ôn lại" : "Hoàn thành"}: {problem.title}</h3>
        <fieldset>
          <legend>Tự đánh giá</legend>
          {RATINGS.map(([value, label]) => (
            <label key={value} className="radio">
              <input type="radio" name="rating" checked={rating === value} onChange={() => setRating(value)} />
              {label}
            </label>
          ))}
        </fieldset>
        <label>Số phút <input type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
        <label className="checkbox">
          <input type="checkbox" checked={usedSolution} onChange={(e) => setUsedSolution(e.target.checked)} />
          Đã xem lời giải
        </label>
        <label>Ghi chú nhanh
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ý tưởng, độ phức tạp..." />
        </label>
        <div className="row">
          <button className="btn" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary" disabled={!rating} onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
```

`src/components/StatsRow.tsx`:
```tsx
import { useProgress } from "../state/ProgressContext";
import { activityByDay, currentStreak, longestStreak } from "../lib/streak";
import { PROBLEMS } from "../data/problems";

export function StatsRow() {
  const { progress, today } = useProgress();
  const days = new Set(activityByDay(progress).keys());
  const known = PROBLEMS.map((p) => progress.problems[p.slug]).filter(Boolean);
  const done = known.filter((p) => p.status === "done").length;
  const mastered = known.filter((p) => p.reviewStage === 3).length;
  return (
    <div className="stats">
      <div className="stat"><span data-testid="streak-current">{currentStreak(days, today)}</span><small>🔥 Streak</small></div>
      <div className="stat"><span>{longestStreak(days)}</span><small>Streak dài nhất</small></div>
      <div className="stat"><span>{done}/{PROBLEMS.length}</span><small>Đã làm</small></div>
      <div className="stat"><span>{mastered}</span><small>Đã thuộc</small></div>
    </div>
  );
}
```

`src/components/Heatmap.tsx`:
```tsx
import { useProgress } from "../state/ProgressContext";
import { activityByDay, heatLevel } from "../lib/streak";
import { addDays, fromISODate } from "../lib/date";
import { problemBySlug } from "../data/problems";

export function Heatmap() {
  const { progress, today } = useProgress();
  const activity = activityByDay(progress);
  const start = addDays(today, -(52 * 7 + fromISODate(today).getDay()));
  const cells: string[] = [];
  for (let d = start; d <= today; d = addDays(d, 1)) cells.push(d);
  return (
    <div className="heatmap" aria-label="Lịch sử làm bài 12 tháng">
      {cells.map((d) => {
        const slugs = activity.get(d) ?? [];
        const names = slugs.map((s) => problemBySlug(s)?.title ?? s).join(", ");
        return (
          <div key={d} className={`heat heat-${heatLevel(slugs.length)}`}
            title={`${d}: ${slugs.length} bài${names ? ` — ${names}` : ""}`} />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: `src/pages/TodayPage.tsx`**

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useProgress } from "../state/ProgressContext";
import { PROBLEMS, solutionPath } from "../data/problems";
import { TOPICS, topicById } from "../data/topics";
import { dueReviews, goalMetToday, nextNewProblem } from "../lib/today";
import { daysBetween } from "../lib/date";
import type { Problem } from "../types";
import { AttemptDialog } from "../components/AttemptDialog";
import { DifficultyBadge, ProblemLinks } from "../components/ProblemLinks";
import { StatsRow } from "../components/StatsRow";
import { Heatmap } from "../components/Heatmap";

export default function TodayPage() {
  const { progress, today, recoveredFromCorruption, dismissRecovery } = useProgress();
  const [dialogFor, setDialogFor] = useState<Problem | null>(null);
  const [showExtra, setShowExtra] = useState(false);
  const next = nextNewProblem(PROBLEMS, TOPICS, progress);
  const goalMet = goalMetToday(progress, today);
  const due = dueReviews(PROBLEMS, progress, today);
  const hasAttempts = Object.values(progress.problems).some((p) => p.attempts.length > 0);
  const needBackup =
    hasAttempts && (!progress.lastExportAt || daysBetween(progress.lastExportAt.slice(0, 10), today) > 14);

  return (
    <div className="container">
      {recoveredFromCorruption && (
        <div className="banner banner-warn">
          Dữ liệu tiến độ bị hỏng nên app đã bắt đầu lại từ đầu (bản cũ được giữ trong localStorage).
          Hãy <Link to="/settings">Import file backup</Link> nếu có.
          <button className="btn" onClick={dismissRecovery}>Đóng</button>
        </div>
      )}
      {needBackup && (
        <div className="banner">
          Đã hơn 14 ngày chưa backup. <Link to="/settings">Export JSON</Link> để không mất tiến độ.
        </div>
      )}

      <section className="card">
        <h2 className="card-label">Bài hôm nay</h2>
        {next === null ? (
          <p>🎉 Bạn đã hoàn thành cả 150 bài NeetCode! Tiếp tục ôn các bài đến hạn nhé.</p>
        ) : goalMet && !showExtra ? (
          <div>
            <p className="success">✅ Đã hoàn thành mục tiêu hôm nay</p>
            <button className="btn" onClick={() => setShowExtra(true)}>Làm thêm bài nữa</button>
          </div>
        ) : (
          <div>
            <h3>{next.title}</h3>
            <p className="meta">
              <DifficultyBadge d={next.difficulty} />
              <Link to={`/topic/${next.topicId}`}>{topicById(next.topicId)?.name}</Link>
              {next.premium && <span className="badge">Premium</span>}
            </p>
            <p className="muted">Lưu lời giải vào <code>{solutionPath(next)}</code></p>
            <div className="row">
              <ProblemLinks problem={next} />
              <button className="btn btn-primary" onClick={() => setDialogFor(next)}>Đánh dấu xong</button>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="card-label">Cần ôn hôm nay ({due.length})</h2>
        {due.length === 0 ? (
          <p className="muted">Không có bài nào đến hạn ôn.</p>
        ) : (
          <ul className="list">
            {due.map((p) => (
              <li key={p.slug}>
                <span>{p.title} <DifficultyBadge d={p.difficulty} /></span>
                <span className="row">
                  <ProblemLinks problem={p} />
                  <button className="btn btn-primary" onClick={() => setDialogFor(p)}>Đã ôn</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <StatsRow />
      <section className="card">
        <h2 className="card-label">12 tháng gần nhất</h2>
        <Heatmap />
      </section>

      {dialogFor && <AttemptDialog problem={dialogFor} onClose={() => setDialogFor(null)} />}
    </div>
  );
}
```

- [ ] **Step 5: `src/App.tsx` + import CSS trong `main.tsx`**

```tsx
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./state/ProgressContext";
import TodayPage from "./pages/TodayPage";
import RoadmapPage from "./pages/RoadmapPage";
import TopicPage from "./pages/TopicPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <nav className="app-nav">
          <span className="brand">DSA Tracker</span>
          <NavLink to="/" end>Hôm nay</NavLink>
          <NavLink to="/roadmap">Lộ trình</NavLink>
          <NavLink to="/settings">Cài đặt</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/topic/:id" element={<TopicPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
}
```

`src/main.tsx` thêm `import "./styles.css";`. (Task 9 tạo stub cho RoadmapPage/TopicPage/SettingsPage trả về `<div className="container" />`, thay thật ở Task 10–11.)

- [ ] **Step 6:** Run: `npm test` → PASS toàn bộ. `npx tsc` → không lỗi.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: app shell and Today page"`

---

### Task 10: Guides + trang Lộ trình + trang Chủ đề

**Files:** Create `src/data/guides.ts`, `src/data/guides/<topic-id>.md` ×18, `src/pages/RoadmapPage.tsx`, `src/pages/TopicPage.tsx`, `src/components/ProblemDetail.tsx`, Modify `src/data/data.test.ts`

- [ ] **Step 1: Test fail** — thêm vào `src/data/data.test.ts`:

```ts
import { GUIDES } from "./guides";
test("đủ 18 guide, mỗi guide có template Java", () => {
  for (const t of TOPICS) {
    expect(GUIDES[t.id], t.id).toBeTruthy();
    expect(GUIDES[t.id], t.id).toContain("```java");
  }
});
```

- [ ] **Step 2: `src/data/guides.ts`**

```ts
const files = import.meta.glob("./guides/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const GUIDES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, text]) => [path.replace("./guides/", "").replace(".md", ""), text]),
);
```

- [ ] **Step 3: Viết 18 guide** (tiếng Việt, template Java). Mỗi file theo khung:

```markdown
## Pattern
<2–4 câu tóm tắt ý tưởng cốt lõi>

## Khi nào dùng
- <dấu hiệu trong đề>

## Template Java
```java
<1–3 template ngắn, có comment>
```

## Độ phức tạp
- <time/space điển hình>

## Lỗi hay gặp
- <3–5 lỗi>
```

Nội dung chính theo chủ đề:
- arrays-hashing: HashMap/HashSet đếm tần suất, prefix/suffix product, bucket sort; template đếm tần suất `getOrDefault`.
- two-pointers: 2 con trỏ hai đầu trên mảng đã sắp; bỏ trùng trong 3Sum; template `while (l < r)`.
- sliding-window: cửa sổ co giãn với map đếm; cửa sổ cố định; deque đơn điệu; template `for r … while (invalid) l++`.
- stack: stack cơ bản, monotonic stack (next greater), `Deque<Integer> stack = new ArrayDeque<>()`.
- binary-search: template `lo <= hi` tìm chính xác và template tìm biên/“binary search on answer” (Koko); `mid = lo + (hi - lo) / 2`.
- linked-list: dummy node, fast/slow pointer, đảo list; template reverse + tìm giữa.
- trees: DFS đệ quy trả về giá trị, BFS theo level bằng `Queue`, BST inorder; template cả hai.
- tries: `TrieNode children[26] + isEnd`; insert/search/startsWith.
- heap: `PriorityQueue` min/max, top-K bằng heap size k, 2 heap cho median.
- backtracking: template choose → explore → unchoose; bỏ trùng bằng sort + `i > start && nums[i]==nums[i-1]`.
- graphs: DFS/BFS trên grid (4 hướng), visited, topological sort (Kahn), Union-Find.
- advanced-graphs: Dijkstra với `PriorityQueue<int[]>`, Prim/Kruskal, Bellman-Ford giới hạn K cạnh.
- dp-1d: xác định state `dp[i]`, recurrence, base case; top-down memo vs bottom-up; tối ưu O(1) bộ nhớ.
- dp-2d: `dp[i][j]` trên 2 chuỗi/lưới; knapsack 0/1 và unbounded; thứ tự vòng lặp.
- greedy: chọn cục bộ tối ưu + lý do đúng; Kadane; jump game theo "goal"/tầm xa.
- intervals: sort theo start, merge; đếm phòng bằng 2 mảng start/end hoặc min-heap.
- math-geometry: xoay ma trận (transpose + reverse), duyệt xoắn ốc với 4 biên, fast pow.
- bit-manipulation: `&`, `|`, `^`, `<<`, `>>>`; `n & (n-1)`, XOR tìm số lẻ, `>>>` với số âm trong Java.

- [ ] **Step 4: `src/components/ProblemDetail.tsx`**

```tsx
import { useState } from "react";
import type { Problem } from "../types";
import { useProgress } from "../state/ProgressContext";
import { solutionPath } from "../data/problems";
import { AttemptDialog } from "./AttemptDialog";
import { DifficultyBadge, ProblemLinks } from "./ProblemLinks";

const RATING_LABEL = { easy: "Dễ", medium: "Vừa", hard: "Khó" } as const;

export function ProblemDetail({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const { progress, setNotes } = useProgress();
  const [dialog, setDialog] = useState(false);
  const pp = progress.problems[problem.slug];
  const done = pp?.status === "done";
  const mastered = pp?.reviewStage === 3;

  return (
    <aside className="card detail">
      <div className="row between">
        <h3>{problem.title} <DifficultyBadge d={problem.difficulty} /></h3>
        <button className="btn" onClick={onClose}>Đóng</button>
      </div>
      <p className="muted">Lời giải: <code>{solutionPath(problem)}</code></p>
      <div className="row">
        <ProblemLinks problem={problem} />
        {!done && <button className="btn btn-primary" onClick={() => setDialog(true)}>Đánh dấu xong</button>}
        {done && !mastered && <button className="btn btn-primary" onClick={() => setDialog(true)}>Đã ôn</button>}
      </div>
      <h4>Lịch sử</h4>
      {pp?.attempts.length ? (
        <ul className="list">
          {pp.attempts.map((a, i) => (
            <li key={i}>
              {a.date} · {a.isReview ? "Ôn" : "Lần đầu"} · {RATING_LABEL[a.rating]}
              {a.minutes ? ` · ${a.minutes} phút` : ""}{a.usedSolution ? " · đã xem lời giải" : ""}
            </li>
          ))}
        </ul>
      ) : <p className="muted">Chưa làm.</p>}
      {pp?.nextReview && <p>Ôn tiếp: {pp.nextReview}</p>}
      <h4>Ghi chú</h4>
      <textarea rows={8} value={pp?.notes ?? ""} onChange={(e) => setNotes(problem.slug, e.target.value)}
        placeholder="Ý tưởng, độ phức tạp, bẫy..." />
      {dialog && <AttemptDialog problem={problem} onClose={() => setDialog(false)} />}
    </aside>
  );
}
```

- [ ] **Step 5: `src/pages/RoadmapPage.tsx`**

```tsx
import { Link } from "react-router-dom";
import { useProgress } from "../state/ProgressContext";
import { TOPICS } from "../data/topics";
import { PROBLEMS } from "../data/problems";
import { nextNewProblem } from "../lib/today";

export default function RoadmapPage() {
  const { progress } = useProgress();
  const next = nextNewProblem(PROBLEMS, TOPICS, progress);
  const currentOrder = next ? TOPICS.find((t) => t.id === next.topicId)!.order : Infinity;
  return (
    <div className="container">
      <h1>Lộ trình NeetCode 150</h1>
      <div className="topic-grid">
        {TOPICS.map((t) => {
          const list = PROBLEMS.filter((p) => p.topicId === t.id);
          const done = list.filter((p) => progress.problems[p.slug]?.status === "done").length;
          return (
            <Link key={t.id} to={`/topic/${t.id}`}
              className={`card topic-card${t.order > currentOrder ? " dim" : ""}${t.order === currentOrder ? " current" : ""}`}>
              <small className="muted">{String(t.order).padStart(2, "0")}</small>
              <strong>{t.name}</strong>
              <div className="progress-bar"><div style={{ width: `${(done / list.length) * 100}%` }} /></div>
              <small>{done}/{list.length}</small>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: `src/pages/TopicPage.tsx`**

```tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { useProgress } from "../state/ProgressContext";
import { topicById } from "../data/topics";
import { PROBLEMS } from "../data/problems";
import { GUIDES } from "../data/guides";
import type { Problem, ProblemProgress } from "../types";
import { DifficultyBadge } from "../components/ProblemLinks";
import { ProblemDetail } from "../components/ProblemDetail";

function statusLabel(pp: ProblemProgress | undefined) {
  if (!pp || pp.status === "todo") return "Chưa làm";
  return pp.reviewStage === 3 ? "⭐ Đã thuộc" : "✔ Đã làm";
}

export default function TopicPage() {
  const { id = "" } = useParams();
  const { progress } = useProgress();
  const [selected, setSelected] = useState<Problem | null>(null);
  const topic = topicById(id);
  if (!topic) return <div className="container"><p>Không tìm thấy chủ đề. <Link to="/roadmap">Về lộ trình</Link></p></div>;
  const list = PROBLEMS.filter((p) => p.topicId === id);

  return (
    <div className="container">
      <p><Link to="/roadmap">← Lộ trình</Link></p>
      <h1>{topic.order}. {topic.name}</h1>
      <article className="card guide">
        <Markdown rehypePlugins={[rehypeHighlight]}>{GUIDES[id] ?? ""}</Markdown>
      </article>
      <table className="table">
        <thead><tr><th>Bài</th><th>Độ khó</th><th>Trạng thái</th><th>Ôn tiếp</th></tr></thead>
        <tbody>
          {list.map((p) => {
            const pp = progress.problems[p.slug];
            return (
              <tr key={p.slug} className={selected?.slug === p.slug ? "selected" : ""} onClick={() => setSelected(p)}>
                <td>{p.title}{p.premium && <span className="badge">Premium</span>}</td>
                <td><DifficultyBadge d={p.difficulty} /></td>
                <td>{statusLabel(pp)}</td>
                <td>{pp?.nextReview ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selected && <ProblemDetail problem={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
```

- [ ] **Step 7:** Run `npm test` → PASS; `npx tsc` → không lỗi.
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: topic guides, roadmap and topic pages"`

---

### Task 11: Trang Cài đặt

**Files:** Create `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Viết trang**

```tsx
import { useRef, useState } from "react";
import { useProgress } from "../state/ProgressContext";
import { exportFileName, parseProgress } from "../lib/storage";

export default function SettingsPage() {
  const { progress, today, replaceProgress, markExported, resetAll } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const doExport = () => {
    const now = new Date().toISOString();
    const blob = new Blob([JSON.stringify({ ...progress, lastExportAt: now }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName(today);
    a.click();
    URL.revokeObjectURL(url);
    markExported(now);
    setMessage({ kind: "ok", text: `Đã export ${a.download}. Có thể bỏ vào thư mục backups/ và commit.` });
  };

  const doImport = async (file: File) => {
    const r = parseProgress(await file.text());
    if (!r.ok) return setMessage({ kind: "error", text: `Import thất bại: ${r.error}` });
    const count = Object.values(r.progress.problems).filter((p) => p.status === "done").length;
    if (!confirm(`File có ${count} bài đã làm. Ghi đè toàn bộ tiến độ hiện tại?`)) return;
    replaceProgress(r.progress);
    setMessage({ kind: "ok", text: "Đã import thành công." });
  };

  const doReset = () => {
    if (!confirm("Xoá toàn bộ tiến độ?")) return;
    if (!confirm("Chắc chắn? Hành động này không hoàn tác được.")) return;
    resetAll();
    setMessage({ kind: "ok", text: "Đã reset." });
  };

  return (
    <div className="container">
      <h1>Cài đặt</h1>
      {message && <div className={`banner ${message.kind === "error" ? "banner-warn" : ""}`}>{message.text}</div>}
      <section className="card">
        <h2 className="card-label">Backup</h2>
        <p className="muted">Lần export gần nhất: {progress.lastExportAt ? new Date(progress.lastExportAt).toLocaleString("vi-VN") : "chưa có"}</p>
        <div className="row">
          <button className="btn btn-primary" onClick={doExport}>Export JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ""; }} />
        </div>
      </section>
      <section className="card">
        <h2 className="card-label">Vùng nguy hiểm</h2>
        <button className="btn btn-danger" onClick={doReset}>Reset toàn bộ</button>
      </section>
    </div>
  );
}
```

- [ ] **Step 2:** `npx tsc` + `npm test` → PASS
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: settings page with export/import/reset"`

---

### Task 12: README, kiểm tra thực tế, GitHub

**Files:** Create `README.md`

- [ ] **Step 1: `README.md`** — mô tả app, `npm install`, `npm run dev`, `npm test`, quy ước `solutions/NN-topic/slug.java`, backup vào `backups/`, lệnh commit hằng ngày.
- [ ] **Step 2: Kiểm tra** — `npm run build` thành công; chạy `npm run dev`, mở `http://localhost:5173`, đi qua: Hôm nay → Đánh dấu xong → Lộ trình → Chủ đề (guide hiển thị, highlight Java) → Cài đặt Export.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "docs: README"`
- [ ] **Step 4: GitHub** (khi người dùng đồng ý) — `gh repo create dsa-tracker --public --source . --push`
