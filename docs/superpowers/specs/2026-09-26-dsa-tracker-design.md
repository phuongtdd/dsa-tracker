# DSA Tracker — Thiết kế

Ngày: 2026-09-26

## Mục tiêu

Web app chạy local giúp học lại DSA từ đầu theo lộ trình **NeetCode 150**, với mục tiêu **ít nhất 1 bài LeetCode mỗi ngày**. App vừa **hướng dẫn** (lý thuyết + template Java theo chủ đề) vừa **tracking** tiến độ (streak, heatmap, ôn tập spaced repetition).

Repo được đẩy lên GitHub (public), đồng thời là nơi lưu lời giải Java của từng bài.

## Quyết định chính

| Hạng mục | Lựa chọn |
|---|---|
| Nền tảng | React + Vite + TypeScript, chạy `npm run dev` |
| Lưu trữ | localStorage + Export/Import JSON |
| Lộ trình | NeetCode 150 (18 chủ đề) |
| Ngôn ngữ template | Java |
| Ngôn ngữ giao diện | Tiếng Việt; tên bài giữ tiếng Anh |
| Thư viện thêm | `react-router-dom`, `react-markdown`, `highlight.js` |
| Test | Vitest (+ React Testing Library cho smoke test) |
| Style | Một file CSS global với biến màu, tự theo dark/light của hệ điều hành |

## Ngoài phạm vi

Đăng nhập, đồng bộ cloud, gọi API LeetCode (tick tay), notification, app tự push GitHub.

## Cấu trúc repo

```
docs/superpowers/specs/     # tài liệu thiết kế
src/
  data/
    topics.ts               # 18 chủ đề theo thứ tự lộ trình
    problems.ts             # 150 bài
    guides/<topic-id>.md    # 18 file hướng dẫn (tiếng Việt, template Java)
  lib/                      # logic thuần, không phụ thuộc React
    storage.ts
    review.ts
    streak.ts
    today.ts
  components/
  pages/
solutions/<NN-topic-id>/<slug>.java   # lời giải người dùng tự viết
backups/                              # file export JSON người dùng tự bỏ vào
```

## Dữ liệu tĩnh

**Chủ đề** (thứ tự lộ trình, số bài):
1. Arrays & Hashing (9) · 2. Two Pointers (5) · 3. Sliding Window (6) · 4. Stack (7) · 5. Binary Search (7) · 6. Linked List (11) · 7. Trees (15) · 8. Tries (3) · 9. Heap / Priority Queue (7) · 10. Backtracking (9) · 11. Graphs (13) · 12. Advanced Graphs (6) · 13. 1-D DP (12) · 14. 2-D DP (11) · 15. Greedy (8) · 16. Intervals (6) · 17. Math & Geometry (8) · 18. Bit Manipulation (7) — tổng 150.

```ts
type Topic = { id: string; order: number; name: string };   // id vd "arrays-hashing"
type Difficulty = "Easy" | "Medium" | "Hard";
type Problem = {
  slug: string;          // slug LeetCode, vd "two-sum"
  title: string;
  difficulty: Difficulty;
  topicId: string;
  leetcodeUrl: string;   // https://leetcode.com/problems/<slug>/
  premium?: boolean;     // bài cần LeetCode Premium (hiện badge)
};
```

Link video = link tìm kiếm YouTube `neetcode <title>` (tính bằng hàm `videoUrl(problem)`, không lưu cứng).

Thứ tự bài trong một chủ đề: theo thứ tự trong `problems.ts` (đã sắp Easy → Medium → Hard).

**File hướng dẫn** (`guides/<topic-id>.md`), mỗi file gồm các mục:
- Pattern tóm tắt
- Khi nào dùng (dấu hiệu nhận biết đề)
- Template Java (1 hoặc vài đoạn code)
- Độ phức tạp điển hình
- Lỗi hay gặp

## Dữ liệu tiến độ

Lưu dưới key localStorage `dsa-progress`. Đây cũng là định dạng file export.

```ts
type Rating = "easy" | "medium" | "hard";
type Attempt = {
  date: string;            // "YYYY-MM-DD" theo giờ máy
  rating: Rating;
  minutes?: number;
  usedSolution: boolean;
  isReview: boolean;
};
type ProblemProgress = {
  status: "todo" | "done";
  attempts: Attempt[];
  notes: string;           // markdown
  reviewStage: 0 | 1 | 2 | 3;   // số mốc ôn đã vượt; 3 = đã thuộc
  nextReview: string | null;    // "YYYY-MM-DD"; null khi chưa làm hoặc đã thuộc
};
type Progress = {
  version: 1;
  problems: Record<string, ProblemProgress>;  // key = slug
  lastExportAt: string | null;               // ISO datetime
};
```

## Logic

### Spaced repetition (`review.ts`)

Mốc ôn: `INTERVALS = [3, 7, 14]` ngày. `reviewStage` = chỉ số mốc tiếp theo cần vượt.

Khi ghi một lần làm (lần đầu hoặc ôn) vào ngày `d`:
- Nếu `rating === "hard"` hoặc `usedSolution` → `reviewStage = 0`, `nextReview = d + 3`.
- Lần đầu làm (không phải ôn) với `rating` easy/medium → `reviewStage = 0`, `nextReview = d + 3`. Riêng `easy` → `reviewStage = 1`, `nextReview = d + 7`.
- Lần ôn với `medium` → `reviewStage += 1`; với `easy` → `reviewStage += 2`.
- Sau khi tăng: nếu `reviewStage >= 3` → `reviewStage = 3`, `nextReview = null` (đã thuộc); ngược lại `nextReview = d + INTERVALS[reviewStage]`.

Bài **đến hạn ôn** khi `nextReview !== null && nextReview <= hôm nay`.

Hàm thuần: `applyAttempt(progress: ProblemProgress, attempt: Attempt): ProblemProgress`.

### Streak & heatmap (`streak.ts`)

- Một ngày "có hoạt động" nếu có ≥ 1 attempt (mới hoặc ôn) mang ngày đó.
- **Streak hiện tại**: đếm ngược các ngày liên tiếp có hoạt động, bắt đầu từ hôm nay; nếu hôm nay chưa có hoạt động thì bắt đầu từ hôm qua (streak chưa bị mất cho tới hết ngày).
- **Streak dài nhất**: chuỗi liên tiếp dài nhất trong toàn bộ lịch sử.
- **Heatmap**: `Map<date, { count, slugs[] }>` cho 365 ngày gần nhất. Mức màu: 0, 1, 2, 3, 4+.

### Bài hôm nay (`today.ts`)

- **Bài mới hôm nay**: bài `todo` đầu tiên theo thứ tự (chủ đề theo `order`, rồi thứ tự trong `problems.ts`). `null` nếu đã làm hết 150.
- **Mục tiêu hôm nay đạt** khi hôm nay có ≥ 1 attempt `isReview === false`.
- **Cần ôn**: danh sách bài đến hạn, sắp theo `nextReview` tăng dần.

### Lưu trữ (`storage.ts`)

- `loadProgress()`: đọc key, parse, validate, `migrate()`. Nếu parse/validate lỗi → sao chuỗi gốc sang key `dsa-progress-corrupt-<timestamp>`, trả về progress rỗng và cờ `recoveredFromCorruption = true` (UI hiện banner đề nghị Import).
- `saveProgress(p)`: ghi JSON.
- `exportProgress(p)`: tạo file tải về `dsa-progress-YYYY-MM-DD.json`, cập nhật `lastExportAt`.
- `importProgress(text)`: parse + validate; trả về lỗi mô tả cụ thể nếu sai; không ghi đè dữ liệu hiện có cho tới khi người dùng xác nhận.
- `migrate(raw)`: nâng cấp theo `version` (hiện chỉ có v1).
- Slug trong progress mà không còn trong `problems.ts`: giữ nguyên, không hiển thị.

## Màn hình

Thanh điều hướng trên cùng: **Hôm nay · Lộ trình · Cài đặt**.

1. **Hôm nay** (`/`)
   - Thẻ *Bài hôm nay*: tên, độ khó, chủ đề, đường dẫn file lời giải gợi ý (`solutions/NN-topic/slug.java`), nút *Mở LeetCode*, *Xem video*, *Đánh dấu xong*. Khi mục tiêu đã đạt: "✅ Đã hoàn thành mục tiêu hôm nay" + nút *Làm thêm bài nữa*.
   - Danh sách *Cần ôn hôm nay*, mỗi bài có nút *Đã ôn*.
   - Thống kê: streak hiện tại, streak dài nhất, số bài đã làm / 150, số bài đã thuộc.
   - Heatmap 12 tháng; hover hiện ngày + tên bài.
   - Nhắc backup nếu `lastExportAt` null hoặc > 14 ngày (chỉ khi đã có ít nhất 1 attempt).
   - Banner khôi phục nếu `recoveredFromCorruption`.
2. **Lộ trình** (`/roadmap`): 18 thẻ chủ đề theo thứ tự, thanh tiến độ mỗi chủ đề. Chủ đề sau chủ đề hiện tại được làm mờ nhưng vẫn bấm được.
3. **Chủ đề** (`/topic/:id`): nửa trên render guide markdown (highlight Java); nửa dưới là bảng bài: trạng thái (chưa làm / đã làm / đã thuộc), độ khó, ngày ôn tiếp, link LeetCode/video. Bấm một bài → panel *Chi tiết bài*: lịch sử attempt, ô ghi chú markdown tự lưu, nút *Đánh dấu xong* / *Đã ôn*.
4. **Cài đặt** (`/settings`): Export JSON, Import JSON (validate + xác nhận), Reset toàn bộ (xác nhận 2 lần).

**Hộp thoại ghi lần làm** (dùng chung cho *Đánh dấu xong* và *Đã ôn*): đánh giá Dễ/Vừa/Khó (bắt buộc), số phút (tuỳ chọn), checkbox "Đã xem lời giải", ghi chú nhanh (nối vào `notes`). Lưu → `applyAttempt` → `saveProgress` → UI cập nhật.

## Kiểm thử

Vitest, viết test trước (TDD) cho toàn bộ `lib/`:
- `review.ts`: tiến mốc 3→7→14, hard/xem lời giải reset, easy nhảy mốc, lần đầu easy, đạt đã thuộc, bài đến hạn.
- `streak.ts`: hôm nay chưa làm vẫn giữ streak tới hôm qua; ngắt quãng; streak dài nhất; qua tháng/năm; nhiều attempt cùng ngày.
- `today.ts`: bài todo đầu tiên đúng thứ tự; đã hết 150 bài; lọc & sắp bài cần ôn; mục tiêu hôm nay đạt/chưa.
- `storage.ts`: load/save; dữ liệu hỏng → backup key + progress rỗng; import sai trả lỗi cụ thể; migrate.
- Dữ liệu tĩnh: đủ 150 bài, slug không trùng, số bài mỗi chủ đề khớp danh sách trên, mọi `topicId` hợp lệ, đủ 18 file guide.

Smoke test UI (React Testing Library): luồng *Đánh dấu xong* cập nhật thẻ bài hôm nay và streak.

## GitHub

- Sau khi app chạy được: `git init`, commit, `gh repo create` (public) và push — Claude thực hiện khi người dùng đồng ý.
- Hằng ngày người dùng tự commit lời giải trong `solutions/` và (tuỳ chọn) file backup trong `backups/`.
- `README.md` hướng dẫn cài đặt, chạy, và quy ước lưu lời giải.
