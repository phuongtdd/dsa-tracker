## Pattern
Greedy chọn phương án tốt nhất tại mỗi bước (local optimum) và không bao giờ quay lại sửa lựa chọn. Cách này chỉ đúng khi chứng minh được rằng lựa chọn cục bộ luôn nằm trong một lời giải tối ưu, thường bằng lập luận "exchange argument" (đổi lựa chọn bất kỳ sang lựa chọn greedy không làm kết quả tệ hơn) hoặc bằng một bất biến được giữ suốt vòng lặp. Nhiều bài greedy thực chất là DP được rút gọn, ví dụ Kadane, hoặc chỉ cần theo dõi một khoảng/giới hạn (reachable, min/max).

## Khi nào dùng
- Đề hỏi max/min hoặc "có thể hay không" và có thể quyết định dứt khoát tại mỗi phần tử.
- Duyệt một lượt từ trái sang phải (hoặc phải sang trái) và chỉ cần giữ vài biến trạng thái.
- Bài có tính chất "nếu tổng/giá trị âm thì bỏ đi làm lại từ đầu".
- Có thể sắp xếp dữ liệu rồi xử lý theo thứ tự (nhỏ nhất trước, kết thúc sớm nhất trước).
- Tập trạng thái có thể biểu diễn bằng một khoảng `[lo, hi]` thay vì liệt kê hết.

## Template Java
```java
// Kadane: tổng lớn nhất của subarray liên tiếp
int maxSubArray(int[] nums) {
    int cur = 0, best = nums[0];
    for (int x : nums) {
        cur = Math.max(x, cur + x);   // bắt đầu lại nếu phần trước làm giảm tổng
        best = Math.max(best, cur);
    }
    return best;
}

// Jump Game: kéo goal từ cuối về đầu
boolean canJump(int[] nums) {
    int goal = nums.length - 1;
    for (int i = nums.length - 2; i >= 0; i--)
        if (i + nums[i] >= goal) goal = i;
    return goal == 0;
}
```

```java
// Gas Station: nếu tổng gas >= tổng cost thì chắc chắn có đáp án
int canCompleteCircuit(int[] gas, int[] cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        if (tank < 0) {        // không thể xuất phát từ start..i
            start = i + 1;
            tank = 0;
        }
    }
    return total < 0 ? -1 : start;
}

// Valid Parenthesis String: theo dõi khoảng số '(' đang mở [lo, hi]
boolean checkValidString(String s) {
    int lo = 0, hi = 0;
    for (char c : s.toCharArray()) {
        if (c == '(') { lo++; hi++; }
        else if (c == ')') { lo--; hi--; }
        else { lo--; hi++; }   // '*' có thể là ')', rỗng hoặc '('
        if (hi < 0) return false;
        lo = Math.max(lo, 0);
    }
    return lo == 0;
}
```

## Độ phức tạp
- Thường O(n) time, O(1) space với một lượt duyệt.
- O(n log n) nếu cần sắp xếp trước (Hand of Straights dùng `TreeMap`).
- O(n) space khi cần map đếm tần suất hoặc vị trí cuối của ký tự.

## Lỗi hay gặp
- Dùng greedy khi chưa chứng minh được tính đúng; nếu tìm được phản ví dụ thì chuyển sang DP.
- Kadane khởi tạo `best = 0` → sai khi mọi phần tử đều âm; phải khởi tạo bằng `nums[0]`.
- Valid Parenthesis String quên kẹp `lo` về 0, làm `lo` âm và kết luận sai.
- Jump Game II đếm bước sai vì tăng `jumps` ở mỗi `i` thay vì chỉ khi chạm biên của tầng hiện tại.
- Dùng `int` cho tổng lớn khi đề cho giá trị lớn; cân nhắc `long` để tránh overflow.

## Bài trong chủ đề
- **Maximum Subarray**: Kadane, bỏ tiền tố khi nó làm tổng hiện tại nhỏ hơn chính phần tử mới.
- **Jump Game**: kéo `goal` về phía đầu mỗi khi `i + nums[i] >= goal`, kiểm tra `goal == 0` ở cuối.
- **Jump Game II**: duyệt theo "tầng" kiểu BFS, giữ `end` của tầng hiện tại và `farthest`, chạm `end` thì tăng số bước.
- **Gas Station**: tổng âm thì trả -1, ngược lại reset điểm xuất phát sang `i + 1` mỗi khi tank âm.
- **Hand of Straights**: đếm tần suất bằng `TreeMap`, luôn bắt đầu nhóm từ lá bài nhỏ nhất còn lại và trừ `groupSize` lá liên tiếp.
- **Merge Triplets to Form Target Triplet**: bỏ các triplet có thành phần vượt target, với phần còn lại kiểm tra xem mỗi vị trí có triplet nào bằng đúng target không.
- **Partition Labels**: lưu vị trí xuất hiện cuối của từng ký tự, mở rộng `end` của đoạn hiện tại và cắt khi `i == end`.
- **Valid Parenthesis String**: giữ khoảng `[lo, hi]` số ngoặc mở có thể có; `hi < 0` thì sai, cuối cùng cần `lo == 0`.
