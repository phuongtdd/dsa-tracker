import { beforeEach, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ProgressProvider } from "../state/ProgressContext";
import TodayPage from "./TodayPage";

beforeEach(() => localStorage.clear());

test("đánh dấu xong bài hôm nay → đạt mục tiêu, streak 1, bài kế tiếp", async () => {
  render(
    <MemoryRouter>
      <ProgressProvider>
        <TodayPage />
      </ProgressProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Contains Duplicate" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Đánh dấu xong" }));
  await userEvent.click(screen.getByRole("radio", { name: "Vừa" }));
  await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
  expect(screen.getByText(/Đã hoàn thành mục tiêu hôm nay/)).toBeInTheDocument();
  expect(screen.getByTestId("streak-current")).toHaveTextContent("1");
  await userEvent.click(screen.getByRole("button", { name: "Làm thêm bài nữa" }));
  expect(screen.getByRole("heading", { name: "Valid Anagram" })).toBeInTheDocument();
});
