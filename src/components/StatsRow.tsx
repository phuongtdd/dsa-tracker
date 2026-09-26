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
      <div className="stat">
        <span data-testid="streak-current">{currentStreak(days, today)}</span>
        <small>🔥 Streak hiện tại</small>
      </div>
      <div className="stat">
        <span>{longestStreak(days)}</span>
        <small>Streak dài nhất</small>
      </div>
      <div className="stat">
        <span>{done}/{PROBLEMS.length}</span>
        <small>Đã làm</small>
      </div>
      <div className="stat">
        <span>{mastered}</span>
        <small>Đã thuộc</small>
      </div>
    </div>
  );
}
