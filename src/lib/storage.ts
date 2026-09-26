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
