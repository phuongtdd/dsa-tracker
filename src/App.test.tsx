import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { TOPICS } from "./data/topics";

beforeEach(() => localStorage.clear());

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

test("trang Lộ trình hiện đủ 18 chủ đề", () => {
  renderAt("/roadmap");
  for (const t of TOPICS) expect(screen.getByText(t.name)).toBeInTheDocument();
});

test.each(TOPICS.map((t) => [t.id, t.name]))("trang chủ đề %s render guide có code Java", (id, name) => {
  const { container } = renderAt(`/topic/${id}`);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(name);
  expect(container.querySelector("pre code.hljs")).not.toBeNull();
});

test("trang Cài đặt", () => {
  renderAt("/settings");
  expect(screen.getByRole("button", { name: "Export JSON" })).toBeInTheDocument();
});
