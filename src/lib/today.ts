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
