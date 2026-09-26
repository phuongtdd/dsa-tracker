## Pattern
Hầu hết bài intervals bắt đầu bằng việc sắp xếp: theo điểm bắt đầu để merge/insert, hoặc theo điểm kết thúc để chọn được nhiều khoảng không chồng nhau nhất. Sau khi sắp xếp, chỉ cần so khoảng hiện tại với khoảng cuối cùng đã xử lý: hai khoảng `[a, b]` và `[c, d]` (với `a <= c`) chồng nhau khi `c <= b`. Với bài đếm số khoảng chồng nhau cùng lúc (Meeting Rooms II), dùng min-heap chứa thời điểm kết thúc hoặc hai mảng start/end đã sắp xếp.

## Khi nào dùng
- Input là danh sách cặp `[start, end]`: lịch họp, đoạn thời gian, khoảng số.
- Đề yêu cầu gộp, chèn, xóa ít nhất để không chồng nhau, hoặc kiểm tra xung đột.
- Hỏi số tài nguyên tối đa cần dùng cùng lúc (phòng họp, máy chủ).
- Truy vấn "khoảng nhỏ nhất chứa điểm q" → sắp xếp cả khoảng lẫn query rồi dùng heap.

## Template Java
```java
// Merge Intervals: sort theo start, gộp vào khoảng cuối của kết quả
int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> res = new ArrayList<>();
    for (int[] cur : intervals) {
        if (res.isEmpty() || res.get(res.size() - 1)[1] < cur[0]) {
            res.add(cur);                                   // không chồng
        } else {
            int[] last = res.get(res.size() - 1);
            last[1] = Math.max(last[1], cur[1]);            // chồng -> mở rộng end
        }
    }
    return res.toArray(new int[0][]);
}

// Non-overlapping Intervals: sort theo END, giữ khoảng kết thúc sớm nhất
int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
    int removed = 0, prevEnd = Integer.MIN_VALUE;
    for (int[] cur : intervals) {
        if (cur[0] >= prevEnd) prevEnd = cur[1];            // giữ lại
        else removed++;                                     // chồng -> xóa
    }
    return removed;
}
```

```java
// Meeting Rooms II: min-heap chứa end time của các phòng đang dùng
int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int[] cur : intervals) {
        if (!heap.isEmpty() && heap.peek() <= cur[0]) heap.poll(); // tái dùng phòng
        heap.offer(cur[1]);
    }
    return heap.size();
}

// Cách khác: hai mảng start/end đã sắp xếp, đếm số cuộc họp đang diễn ra
int minMeetingRooms2(int[] start, int[] end) {
    Arrays.sort(start); Arrays.sort(end);
    int rooms = 0, best = 0, j = 0;
    for (int i = 0; i < start.length; i++) {
        while (end[j] <= start[i]) { j++; rooms--; }   // j < i nên không vượt biên
        rooms++;
        best = Math.max(best, rooms);
    }
    return best;
}
```

## Độ phức tạp
- Sắp xếp chiếm O(n log n) time; lượt duyệt sau đó O(n).
- Space O(n) cho kết quả, heap hoặc mảng phụ; Insert Interval chỉ cần O(n) time vì input đã sắp xếp.
- Minimum Interval to Include Each Query: O((n + q) log n + q log q).

## Lỗi hay gặp
- Comparator dạng `(a, b) -> a[0] - b[0]` có thể overflow khi giá trị gần `Integer.MIN_VALUE`/`MAX_VALUE`; luôn dùng `Integer.compare`.
- Nhầm điều kiện chồng nhau ở biên: `[1,2]` và `[2,3]` có chồng không tùy đề (Merge coi là chồng, Non-overlapping và Meeting Rooms thì không).
- Sort theo start trong Non-overlapping Intervals mà không xử lý đúng → phải sort theo end hoặc khi chồng thì giữ khoảng có end nhỏ hơn.
- Quên sắp xếp query nhưng vẫn phải trả kết quả theo thứ tự ban đầu → sắp xếp chỉ số hoặc lưu vào `HashMap`.
- Sửa trực tiếp mảng input khi gộp mà đề không cho phép (hoặc không muốn); tạo mảng mới nếu cần.

## Bài trong chủ đề
- **Meeting Rooms**: sắp xếp theo start rồi kiểm tra có cuộc họp nào bắt đầu trước khi cuộc trước kết thúc không.
- **Insert Interval**: thêm các khoảng kết thúc trước `newInterval`, gộp mọi khoảng chồng vào nó bằng min/max, rồi thêm phần còn lại.
- **Merge Intervals**: sắp xếp theo start, chồng với khoảng cuối thì mở rộng end, không thì thêm mới.
- **Non-overlapping Intervals**: sắp xếp theo end, giữ khoảng kết thúc sớm nhất và đếm số khoảng bị bỏ.
- **Meeting Rooms II**: min-heap end time, hoặc hai mảng start/end sắp xếp riêng để đếm số cuộc họp đồng thời lớn nhất.
- **Minimum Interval to Include Each Query**: sắp xếp khoảng theo start và query tăng dần, đẩy khoảng có `start <= q` vào min-heap theo độ dài, loại khoảng có `end < q`, đỉnh heap là đáp án.
