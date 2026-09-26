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
        <h3>
          {problem.title} <DifficultyBadge d={problem.difficulty} />
        </h3>
        <button className="btn" onClick={onClose}>Đóng</button>
      </div>
      <p className="muted small">
        Lời giải: <code>{solutionPath(problem)}</code>
      </p>
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
              {a.minutes ? ` · ${a.minutes} phút` : ""}
              {a.usedSolution ? " · đã xem lời giải" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Chưa làm.</p>
      )}
      {pp?.nextReview && <p>Ôn tiếp: {pp.nextReview}</p>}
      {mastered && <p>⭐ Đã thuộc</p>}

      <h4>Ghi chú</h4>
      <textarea
        rows={8}
        value={pp?.notes ?? ""}
        onChange={(e) => setNotes(problem.slug, e.target.value)}
        placeholder="Ý tưởng, độ phức tạp, bẫy..."
      />
      {dialog && <AttemptDialog problem={problem} onClose={() => setDialog(false)} />}
    </aside>
  );
}
