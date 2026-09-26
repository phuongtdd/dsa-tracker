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
