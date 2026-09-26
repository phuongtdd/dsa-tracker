# DSA Tracker — NeetCode 150

Web app chạy local để học lại DSA theo lộ trình **NeetCode 150**, mục tiêu **ít nhất 1 bài LeetCode mỗi ngày**.

- **Bài hôm nay**: tự gợi ý bài tiếp theo theo lộ trình (18 chủ đề, Easy → Hard)
- **Hướng dẫn theo chủ đề**: pattern, dấu hiệu nhận biết, template Java, lỗi hay gặp, gợi ý từng bài
- **Ôn tập spaced repetition**: sau khi làm, tự đánh giá Dễ / Vừa / Khó → app nhắc ôn sau 3 → 7 → 14 ngày
- **Streak + heatmap** 12 tháng, ghi chú cho từng bài
- **Export/Import JSON** để backup (dữ liệu nằm trong localStorage của trình duyệt)

## Chạy

Yêu cầu Node.js 20+.

```bash
npm install
npm run dev      # mở http://localhost:5173
npm test         # chạy unit test
npm run build    # build production vào dist/
```

## Quy tắc ôn tập

| Tình huống | Ôn lại sau |
|---|---|
| Lần đầu, chấm **Vừa** | 3 ngày |
| Lần đầu, chấm **Dễ** | 7 ngày |
| Chấm **Khó** hoặc **đã xem lời giải** | 3 ngày (về mốc đầu) |
| Ôn lại, chấm **Vừa** | lên 1 mốc (3 → 7 → 14 → đã thuộc) |
| Ôn lại, chấm **Dễ** | lên 2 mốc |

Mục tiêu ngày chỉ tính khi làm **bài mới**; ôn bài cũ vẫn giữ streak.

## Lưu lời giải

Mỗi bài có đường dẫn gợi ý hiển thị trong app:

```
solutions/<NN-chủ-đề>/<slug>.java      # vd solutions/01-arrays-hashing/two-sum.java
```

Commit hằng ngày:

```bash
git add solutions backups
git commit -m "Day 12: two-sum"
git push
```

## Backup tiến độ

Vào **Cài đặt → Export JSON**, bỏ file `dsa-progress-YYYY-MM-DD.json` vào `backups/` rồi commit. Khi đổi máy hoặc xoá dữ liệu trình duyệt: **Import JSON**. App nhắc backup nếu quá 14 ngày chưa export.

## Cấu trúc

```
src/data/        # 150 bài, 18 chủ đề, guides/*.md
src/lib/         # logic thuần (review, streak, today, storage) + test
src/state/       # React context lưu tiến độ
src/components/  src/pages/
docs/superpowers/ # spec thiết kế và kế hoạch triển khai
```
