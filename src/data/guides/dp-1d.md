## Pattern
Dynamic Programming 1 chiều chia bài toán thành các bài toán con theo một chỉ số: `dp[i]` là đáp án cho tiền tố (hoặc hậu tố) dài `i`, hoặc cho lựa chọn kết thúc tại vị trí `i`. Ba bước cốt lõi: định nghĩa state thật rõ, viết recurrence từ các state nhỏ hơn, và xác định base case. Có thể cài đặt top-down (đệ quy + memo) hoặc bottom-up (vòng lặp điền bảng); khi `dp[i]` chỉ phụ thuộc vài state trước thì thu gọn thành vài biến rolling với O(1) space.

## Khi nào dùng
- Đề hỏi "số cách", "giá trị lớn nhất/nhỏ nhất", "có thể hay không" trên một dãy/chuỗi.
- Lựa chọn tại vị trí `i` chỉ phụ thuộc vào kết quả tại một vài vị trí trước đó (`i-1`, `i-2`, ...).
- Brute force đệ quy bị lặp lại cùng một tham số nhiều lần (overlapping subproblems).
- Bài dạng knapsack với một chiều tài nguyên (tổng tiền, tổng target).
- Bài palindrome trên substring: thường dùng expand-around-center thay cho bảng 2D.

## Template Java
```java
// Bottom-up với rolling variables (House Robber)
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])
int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;          // dp[i-2], dp[i-1]
    for (int x : nums) {
        int cur = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

// Top-down memo (Climbing Stairs): dùng Integer[] để phân biệt "chưa tính" (null)
Integer[] memo;
int climb(int i, int n) {
    if (i >= n) return i == n ? 1 : 0; // base case
    if (memo[i] != null) return memo[i];
    return memo[i] = climb(i + 1, n) + climb(i + 2, n);
}
```

```java
// Unbounded knapsack (Coin Change): mỗi đồng xu dùng vô hạn lần -> duyệt amount TĂNG dần
int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    java.util.Arrays.fill(dp, amount + 1);   // "vô cực" an toàn, tránh overflow khi +1
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}

// 0/1 knapsack (Partition Equal Subset Sum): mỗi số dùng 1 lần -> duyệt j GIẢM dần
boolean canPartition(int[] nums) {
    int sum = 0;
    for (int x : nums) sum += x;
    if (sum % 2 != 0) return false;
    int target = sum / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int x : nums)
        for (int j = target; j >= x; j--)   // ngược để không dùng x hai lần
            dp[j] = dp[j] || dp[j - x];
    return dp[target];
}
```

```java
// Expand-around-center (Longest Palindromic Substring)
int start = 0, maxLen = 0;
String longestPalindrome(String s) {
    for (int i = 0; i < s.length(); i++) {
        expand(s, i, i);       // độ dài lẻ
        expand(s, i, i + 1);   // độ dài chẵn
    }
    return s.substring(start, start + maxLen);
}
void expand(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
    if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
}
```

## Độ phức tạp
- Thường O(n) time với recurrence phụ thuộc hằng số state trước; O(n²) khi mỗi state duyệt mọi state trước (LIS, Word Break).
- Knapsack 1-D: O(n · target) time, O(target) space.
- Space O(n) cho bảng, giảm còn O(1) nếu chỉ cần vài state gần nhất.
- Expand-around-center: O(n²) time, O(1) space.

## Lỗi hay gặp
- Định nghĩa state mơ hồ (ví dụ lẫn "kết thúc tại i" với "trong tiền tố i") khiến recurrence sai.
- Dùng `Integer.MAX_VALUE` làm vô cực rồi cộng 1 → overflow thành số âm; hãy dùng `amount + 1` hoặc kiểm tra trước khi cộng.
- 0/1 knapsack 1-D mà duyệt `j` tăng dần → mỗi phần tử bị dùng nhiều lần (thành unbounded).
- Memo bằng `int[]` mặc định 0 trong khi 0 là đáp án hợp lệ → dùng `Integer[]` hoặc fill `-1`.
- Quên base case / off-by-one khi `dp` có kích thước `n + 1` (chỉ số `dp[i]` ứng với `s.charAt(i - 1)`).

## Bài trong chủ đề
- **Climbing Stairs**: `dp[i] = dp[i-1] + dp[i-2]`, chính là Fibonacci, chỉ cần hai biến.
- **Min Cost Climbing Stairs**: `dp[i]` là chi phí nhỏ nhất để đứng ở bậc `i`, lấy min từ bậc `i-1` và `i-2` cộng cost tương ứng.
- **House Robber**: tại mỗi nhà chọn cướp (`prev2 + nums[i]`) hoặc bỏ qua (`prev1`).
- **House Robber II**: nhà đầu và cuối kề nhau nên chạy House Robber hai lần trên `[0, n-2]` và `[1, n-1]` rồi lấy max.
- **Longest Palindromic Substring**: expand-around-center từ mỗi vị trí cho cả độ dài lẻ và chẵn.
- **Palindromic Substrings**: cũng expand-around-center, mỗi lần mở rộng thành công là đếm thêm một palindrome.
- **Decode Ways**: `dp[i]` cộng `dp[i-1]` nếu ký tự đơn khác '0' và cộng `dp[i-2]` nếu hai ký tự tạo số từ 10 đến 26.
- **Coin Change**: unbounded knapsack, `dp[a] = min(dp[a - c] + 1)` với vô cực là `amount + 1`.
- **Maximum Product Subarray**: giữ đồng thời max và min kết thúc tại `i` vì số âm có thể đảo min thành max.
- **Word Break**: `dp[i] = true` nếu có `j < i` với `dp[j]` đúng và `s.substring(j, i)` nằm trong dictionary (dùng `HashSet`).
- **Longest Increasing Subsequence**: `dp[i]` là độ dài LIS kết thúc tại `i`, duyệt mọi `j < i` có `nums[j] < nums[i]`; tối ưu O(n log n) bằng binary search trên mảng tails.
- **Partition Equal Subset Sum**: 0/1 knapsack trên `boolean[]` tới `sum / 2`, duyệt ngược từ target về `x`.
