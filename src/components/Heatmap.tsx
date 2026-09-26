import { useProgress } from "../state/ProgressContext";
import { activityByDay, heatLevel } from "../lib/streak";
import { addDays, fromISODate } from "../lib/date";
import { problemBySlug } from "../data/problems";

export function Heatmap() {
  const { progress, today } = useProgress();
  const activity = activityByDay(progress);
  // 53 cột tuần, cột đầu bắt đầu từ Chủ nhật
  const start = addDays(today, -(52 * 7 + fromISODate(today).getDay()));
  const cells: string[] = [];
  for (let d = start; d <= today; d = addDays(d, 1)) cells.push(d);
  return (
    <div className="heatmap-wrap">
      <div className="heatmap" aria-label="Lịch sử làm bài 12 tháng">
        {cells.map((d) => {
          const slugs = activity.get(d) ?? [];
          const names = slugs.map((s) => problemBySlug(s)?.title ?? s).join(", ");
          return (
            <div
              key={d}
              className={`heat heat-${heatLevel(slugs.length)}`}
              title={`${d}: ${slugs.length} bài${names ? ` — ${names}` : ""}`}
            />
          );
        })}
      </div>
      <div className="heat-legend muted">
        Ít <span className="heat heat-0" /><span className="heat heat-1" /><span className="heat heat-2" />
        <span className="heat heat-3" /><span className="heat heat-4" /> Nhiều
      </div>
    </div>
  );
}
