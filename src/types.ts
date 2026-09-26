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
