import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProblemProgress, Progress, Rating } from "../types";
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
    const updateProblem = (slug: string, fn: (p: ProblemProgress) => ProblemProgress) =>
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
            date: today,
            rating,
            usedSolution,
            isReview: p.status === "done",
            ...(minutes !== undefined ? { minutes } : {}),
          });
          const trimmed = note.trim();
          if (!trimmed) return next;
          const entry = `**${today}:** ${trimmed}`;
          return { ...next, notes: next.notes ? `${next.notes}\n\n${entry}` : entry };
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
