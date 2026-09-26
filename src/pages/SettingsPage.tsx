import { useRef, useState } from "react";
import { useProgress } from "../state/ProgressContext";
import { exportFileName, parseProgress } from "../lib/storage";

export default function SettingsPage() {
  const { progress, today, replaceProgress, markExported, resetAll } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const doExport = () => {
    const now = new Date().toISOString();
    const json = JSON.stringify({ ...progress, lastExportAt: now }, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName(today);
    a.click();
    URL.revokeObjectURL(url);
    markExported(now);
    setMessage({ kind: "ok", text: `Đã export ${a.download}. Có thể bỏ vào thư mục backups/ rồi commit.` });
  };

  const doImport = async (file: File) => {
    const r = parseProgress(await file.text());
    if (!r.ok) {
      setMessage({ kind: "error", text: `Import thất bại: ${r.error}` });
      return;
    }
    const count = Object.values(r.progress.problems).filter((p) => p.status === "done").length;
    if (!confirm(`File có ${count} bài đã làm. Ghi đè toàn bộ tiến độ hiện tại?`)) return;
    replaceProgress(r.progress);
    setMessage({ kind: "ok", text: "Đã import thành công." });
  };

  const doReset = () => {
    if (!confirm("Xoá toàn bộ tiến độ?")) return;
    if (!confirm("Chắc chắn? Hành động này không hoàn tác được.")) return;
    resetAll();
    setMessage({ kind: "ok", text: "Đã reset toàn bộ tiến độ." });
  };

  return (
    <div className="container">
      <h1>Cài đặt</h1>
      {message && (
        <div className={`banner${message.kind === "error" ? " banner-warn" : ""}`}>
          <span>{message.text}</span>
        </div>
      )}
      <section className="card">
        <h2 className="card-label">Backup</h2>
        <p className="muted">
          Lần export gần nhất:{" "}
          {progress.lastExportAt ? new Date(progress.lastExportAt).toLocaleString("vi-VN") : "chưa có"}
        </p>
        <div className="row">
          <button className="btn btn-primary" onClick={doExport}>Export JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
              e.target.value = "";
            }}
          />
        </div>
      </section>
      <section className="card">
        <h2 className="card-label">Vùng nguy hiểm</h2>
        <button className="btn btn-danger" onClick={doReset}>Reset toàn bộ</button>
      </section>
    </div>
  );
}
