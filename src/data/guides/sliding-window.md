## Pattern
Duy trì một "cửa sổ" liên tục `[l, r]` trên mảng/chuỗi: mở rộng `r` từng bước, và khi cửa sổ vi phạm điều kiện thì co `l` lại. Trạng thái của cửa sổ (tần suất ký tự, tổng, max...) được cập nhật tăng dần nên mỗi phần tử chỉ vào và ra một lần, cho O(n). Với bài cần max/min của cửa sổ trượt, dùng monotonic deque.

## Khi nào dùng
- Đề hỏi về **subarray/substring liên tục** dài nhất/ngắn nhất thoả điều kiện
- Cửa sổ có kích thước cố định k (permutation, max của mỗi cửa sổ)
- Điều kiện có tính "đơn điệu": nếu cửa sổ `[l, r]` không hợp lệ thì mở rộng thêm cũng không hợp lệ (nên phải co `l`)
- Cần max/min của mọi cửa sổ kích thước k → monotonic deque

## Template Java
```java
// Cửa sổ thay đổi kích thước với mảng đếm
int[] count = new int[128];
int l = 0, best = 0;
for (int r = 0; r < s.length(); r++) {
    count[s.charAt(r)]++;                  // thêm phần tử bên phải
    while (/* cửa sổ không hợp lệ */ count[s.charAt(r)] > 1) {
        count[s.charAt(l)]--;              // bỏ phần tử bên trái
        l++;
    }
    best = Math.max(best, r - l + 1);      // cửa sổ [l, r] hợp lệ
}
```

```java
// Cửa sổ cố định kích thước k
int sum = 0, best = Integer.MIN_VALUE;
for (int r = 0; r < nums.length; r++) {
    sum += nums[r];
    if (r >= k) sum -= nums[r - k];        // phần tử rời cửa sổ
    if (r >= k - 1) best = Math.max(best, sum);
}
```

```java
// Monotonic deque: lưu chỉ số, giá trị giảm dần từ đầu đến cuối
Deque<Integer> dq = new ArrayDeque<>();
int[] res = new int[nums.length - k + 1];
for (int r = 0; r < nums.length; r++) {
    while (!dq.isEmpty() && dq.peekFirst() <= r - k) dq.pollFirst(); // ra khỏi cửa sổ
    while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[r]) dq.pollLast(); // bỏ phần tử nhỏ hơn
    dq.offerLast(r);
    if (r >= k - 1) res[r - k + 1] = nums[dq.peekFirst()];
}
```

## Độ phức tạp
- Time: O(n) — mỗi phần tử vào/ra cửa sổ (hoặc deque) tối đa một lần
- Space: O(1) nếu dùng mảng đếm cố định (26/128 ký tự), O(k) cho deque, O(n) nếu dùng HashMap

## Lỗi hay gặp
- Cập nhật kết quả sai chỗ: bài "dài nhất" cập nhật sau vòng `while` co, bài "ngắn nhất" (Minimum Window) cập nhật bên trong vòng `while`
- Tính độ dài cửa sổ sai: đúng là `r - l + 1`
- Lưu giá trị thay vì chỉ số trong deque → không biết phần tử nào đã ra khỏi cửa sổ
- So sánh `count.get(c) == need.get(c)` với `Integer` → sai khi giá trị > 127; dùng `.equals()` hoặc mảng `int[]`
- Quên trường hợp `s.length() < t.length()` hoặc `k > n`

## Bài trong chủ đề
- **Best Time to Buy and Sell Stock**: Giữ giá thấp nhất đã gặp (mốc mua), mỗi ngày tính lợi nhuận nếu bán hôm đó.
- **Longest Substring Without Repeating Characters**: Mở rộng `r`, khi ký tự mới bị trùng thì co `l` đến khi hết trùng.
- **Longest Repeating Character Replacement**: Cửa sổ hợp lệ khi `(r - l + 1) - maxFreq <= k`; không cần giảm `maxFreq` khi co.
- **Permutation in String**: Cửa sổ cố định dài `s1.length()` trên `s2`, so sánh hai mảng đếm 26 ký tự (hoặc đếm số ký tự khớp).
- **Minimum Window Substring**: Đếm số ký tự cần đã đủ (`have == need`), khi đủ thì co `l` để tìm cửa sổ ngắn nhất.
- **Sliding Window Maximum**: Monotonic deque giảm dần chứa chỉ số, đầu deque luôn là max của cửa sổ hiện tại.
