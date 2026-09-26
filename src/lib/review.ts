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
