import type { Problem } from "../types";
import { videoUrl } from "../data/problems";

export function DifficultyBadge({ d }: { d: Problem["difficulty"] }) {
  return <span className={`badge badge-${d.toLowerCase()}`}>{d}</span>;
}

export function ProblemLinks({ problem }: { problem: Problem }) {
  return (
    <>
      <a className="btn" href={problem.leetcodeUrl} target="_blank" rel="noreferrer">Mở LeetCode</a>
      <a className="btn" href={videoUrl(problem)} target="_blank" rel="noreferrer">Xem video</a>
    </>
  );
}
