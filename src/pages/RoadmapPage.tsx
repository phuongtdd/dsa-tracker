import { Link } from "react-router-dom";
import { useProgress } from "../state/ProgressContext";
import { TOPICS } from "../data/topics";
import { PROBLEMS } from "../data/problems";
import { nextNewProblem } from "../lib/today";

export default function RoadmapPage() {
  const { progress } = useProgress();
  const next = nextNewProblem(PROBLEMS, TOPICS, progress);
  const currentOrder = next ? TOPICS.find((t) => t.id === next.topicId)!.order : Infinity;

  return (
    <div className="container">
      <h1>Lộ trình NeetCode 150</h1>
      <div className="topic-grid">
        {TOPICS.map((t) => {
          const list = PROBLEMS.filter((p) => p.topicId === t.id);
          const done = list.filter((p) => progress.problems[p.slug]?.status === "done").length;
          const state = t.order > currentOrder ? " dim" : t.order === currentOrder ? " current" : "";
          return (
            <Link key={t.id} to={`/topic/${t.id}`} className={`card topic-card${state}`}>
              <small className="muted">{String(t.order).padStart(2, "0")}</small>
              <strong>{t.name}</strong>
              <div className="progress-bar">
                <div style={{ width: `${(done / list.length) * 100}%` }} />
              </div>
              <small>{done}/{list.length}</small>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
