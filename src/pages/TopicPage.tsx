import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { useProgress } from "../state/ProgressContext";
import { topicById } from "../data/topics";
import { PROBLEMS } from "../data/problems";
import { GUIDES } from "../data/guides";
import type { Problem, ProblemProgress } from "../types";
import { DifficultyBadge } from "../components/ProblemLinks";
import { ProblemDetail } from "../components/ProblemDetail";

function statusLabel(pp: ProblemProgress | undefined) {
  if (!pp || pp.status === "todo") return "Chưa làm";
  return pp.reviewStage === 3 ? "⭐ Đã thuộc" : "✔ Đã làm";
}

export default function TopicPage() {
  const { id = "" } = useParams();
  const { progress } = useProgress();
  const [selected, setSelected] = useState<Problem | null>(null);
  const topic = topicById(id);

  if (!topic) {
    return (
      <div className="container">
        <p>
          Không tìm thấy chủ đề. <Link to="/roadmap">Về lộ trình</Link>
        </p>
      </div>
    );
  }
  const list = PROBLEMS.filter((p) => p.topicId === id);

  return (
    <div className="container">
      <p>
        <Link to="/roadmap">← Lộ trình</Link>
      </p>
      <h1>
        {topic.order}. {topic.name}
      </h1>
      <article className="card guide">
        <Markdown rehypePlugins={[rehypeHighlight]}>{GUIDES[id] ?? ""}</Markdown>
      </article>
      <table className="table">
        <thead>
          <tr>
            <th>Bài</th>
            <th>Độ khó</th>
            <th>Trạng thái</th>
            <th>Ôn tiếp</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => {
            const pp = progress.problems[p.slug];
            return (
              <tr key={p.slug} className={selected?.slug === p.slug ? "selected" : ""} onClick={() => setSelected(p)}>
                <td>
                  {p.title}
                  {p.premium && <span className="badge">Premium</span>}
                </td>
                <td>
                  <DifficultyBadge d={p.difficulty} />
                </td>
                <td>{statusLabel(pp)}</td>
                <td>{pp?.nextReview ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selected && <ProblemDetail problem={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
