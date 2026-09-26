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

const BACKUP_REMINDER_DAYS = 14;

export default function TodayPage() {
  const { progress, today, recoveredFromCorruption, dismissRecovery } = useProgress();
  const [dialogFor, setDialogFor] = useState<Problem | null>(null);
  const [showExtra, setShowExtra] = useState(false);
  const next = nextNewProblem(PROBLEMS, TOPICS, progress);
  const goalMet = goalMetToday(progress, today);
  const due = dueReviews(PROBLEMS, progress, today);
  const hasAttempts = Object.values(progress.problems).some((p) => p.attempts.length > 0);
  const needBackup =
    hasAttempts &&
    (!progress.lastExportAt ||
      daysBetween(progress.lastExportAt.slice(0, 10), today) > BACKUP_REMINDER_DAYS);

  return (
    <div className="container">
      {recoveredFromCorruption && (
        <div className="banner banner-warn">
          <span>
            Dữ liệu tiến độ bị hỏng nên app đã bắt đầu lại (bản cũ vẫn được giữ trong localStorage).
            Hãy <Link to="/settings">Import file backup</Link> nếu có.
          </span>
          <button className="btn" onClick={dismissRecovery}>Đóng</button>
        </div>
      )}
      {needBackup && (
        <div className="banner">
          <span>
            Đã hơn {BACKUP_REMINDER_DAYS} ngày chưa backup. <Link to="/settings">Export JSON</Link> để không mất tiến độ.
          </span>
        </div>
      )}

      <section className="card hero">
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
            <h3 className="problem-title">{next.title}</h3>
            <p className="meta">
              <DifficultyBadge d={next.difficulty} />
              <Link to={`/topic/${next.topicId}`}>{topicById(next.topicId)?.name}</Link>
              {next.premium && <span className="badge">Premium</span>}
            </p>
            <p className="muted small">
              Lưu lời giải vào <code>{solutionPath(next)}</code>
            </p>
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
                <span>
                  {p.title} <DifficultyBadge d={p.difficulty} />
                </span>
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
