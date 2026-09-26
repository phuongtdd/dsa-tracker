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
      rating,
      usedSolution,
      note,
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
          <div className="row">
            {RATINGS.map(([value, label]) => (
              <label key={value} className="choice">
                <input type="radio" name="rating" checked={rating === value} onChange={() => setRating(value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          Số phút (tuỳ chọn)
          <input type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </label>
        <label className="choice">
          <input type="checkbox" checked={usedSolution} onChange={(e) => setUsedSolution(e.target.checked)} />
          Đã xem lời giải
        </label>
        <label className="field">
          Ghi chú nhanh
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ý tưởng, độ phức tạp..." />
        </label>
        <div className="row end">
          <button className="btn" onClick={onClose}>Huỷ</button>
          <button className="btn btn-primary" disabled={!rating} onClick={save}>Lưu</button>
        </div>
      </div>
    </div>
  );
}
