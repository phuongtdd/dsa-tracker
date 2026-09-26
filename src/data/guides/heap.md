## Pattern
Heap (priority queue) luôn cho lấy phần tử nhỏ nhất (min-heap) hoặc lớn nhất (max-heap) trong O(log n). Trong Java dùng `PriorityQueue`, mặc định là min-heap; muốn max-heap thì truyền comparator. Hai mẹo kinh điển: giữ **heap kích thước k** để tìm top-K, và dùng **hai heap** (max-heap nửa dưới, min-heap nửa trên) để lấy median liên tục.

## Khi nào dùng
- Đề hỏi "k lớn nhất", "k nhỏ nhất", "k gần nhất", "phần tử thứ k"
- Dữ liệu đến dạng stream, cần lấy min/max hoặc median sau mỗi lần thêm
- Mô phỏng: mỗi bước lấy phần tử lớn/nhỏ nhất, xử lý rồi đẩy lại (Last Stone Weight, Task Scheduler)
- Trộn nhiều danh sách đã sắp xếp (merge k sorted, news feed của Design Twitter)

## Template Java
```java
// Min-heap mặc định và max-heap bằng comparator
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
// Heap của mảng: sắp theo khoảng cách tới gốc tọa độ, lớn nhất ở đỉnh
PriorityQueue<int[]> far = new PriorityQueue<>(
    (a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));

// Top-K: giữ min-heap kích thước k → đỉnh heap là phần tử lớn thứ k
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : nums) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();   // bỏ phần tử nhỏ nhất
    }
    return heap.peek();
}
```

```java
// Hai heap cho running median
class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder()); // nửa dưới
    private final PriorityQueue<Integer> high = new PriorityQueue<>();                          // nửa trên

    public void addNum(int num) {
        low.offer(num);
        high.offer(low.poll());             // đảm bảo max(low) <= min(high)
        if (high.size() > low.size()) low.offer(high.poll()); // low luôn >= high về size
    }

    public double findMedian() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + (long) high.peek()) / 2.0;
    }
}
```

```java
// Task Scheduler: mô phỏng bằng max-heap + queue cooldown
public int leastInterval(char[] tasks, int n) {
    int[] cnt = new int[26];
    for (char t : tasks) cnt[t - 'A']++;
    PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
    for (int c : cnt) if (c > 0) heap.offer(c);
    Queue<int[]> cooldown = new ArrayDeque<>();   // {số lần còn lại, thời điểm được chạy lại}
    int time = 0;
    while (!heap.isEmpty() || !cooldown.isEmpty()) {
        time++;
        if (!heap.isEmpty()) {
            int left = heap.poll() - 1;
            if (left > 0) cooldown.offer(new int[]{left, time + n});
        }
        if (!cooldown.isEmpty() && cooldown.peek()[1] == time) {
            heap.offer(cooldown.poll()[0]);       // hết cooldown, quay lại heap
        }
    }
    return time;
}
```

## Độ phức tạp
- `offer` / `poll`: O(log n); `peek`: O(1); build heap từ n phần tử bằng offer: O(n log n)
- Top-K với heap size k: time O(n log k), space O(k)
- Running median: `addNum` O(log n), `findMedian` O(1)
- Task Scheduler: O(T · log 26) ≈ O(T) với T là tổng thời gian

## Lỗi hay gặp
- Quên rằng `PriorityQueue` mặc định là **min-heap**; muốn max-heap phải dùng `Collections.reverseOrder()` hoặc `(a, b) -> b - a`
- Comparator `(a, b) -> b - a` có thể tràn `int` với giá trị lớn/âm; an toàn hơn là `Integer.compare(b, a)`
- Duyệt `PriorityQueue` bằng for-each **không** theo thứ tự ưu tiên; phải `poll()` liên tục
- Tính median bằng `(a + b) / 2` với `int` → vừa tràn số vừa mất phần thập phân; dùng `long` và chia `2.0`
- Top-K lớn nhất nhưng lại dùng max-heap chứa toàn bộ n phần tử → O(n log n) thay vì O(n log k)

## Bài trong chủ đề
- **Kth Largest Element in a Stream**: Giữ min-heap size k, mỗi lần `add` thì offer rồi poll nếu vượt k, trả về `peek()`.
- **Last Stone Weight**: Max-heap, mỗi lần lấy hai viên nặng nhất, nếu khác nhau thì đẩy lại phần chênh lệch.
- **K Closest Points to Origin**: Max-heap theo `x² + y²` giữ k điểm, vượt k thì bỏ điểm xa nhất.
- **Kth Largest Element in an Array**: Min-heap size k, đỉnh heap là đáp án (hoặc Quickselect trung bình O(n)).
- **Task Scheduler**: Max-heap theo số lần còn lại, kèm queue lưu task đang cooldown cùng thời điểm được chạy lại.
- **Design Twitter**: Mỗi tweet có timestamp tăng dần, `getNewsFeed` dùng max-heap trộn tweet mới nhất của các followee như merge k lists.
- **Find Median from Data Stream**: Max-heap cho nửa nhỏ, min-heap cho nửa lớn, cân bằng size chênh nhau tối đa 1.
