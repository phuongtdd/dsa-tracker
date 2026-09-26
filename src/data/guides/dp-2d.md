## Pattern
DP 2 chiều dùng `dp[i][j]` khi state cần hai tham số: vị trí trong hai chuỗi (LCS, Edit Distance), tọa độ trên grid, (số phần tử đã xét, tổng còn lại) trong knapsack, hoặc đoạn `[l, r]` trong interval DP. Recurrence thường chỉ nhìn các ô lân cận như `dp[i-1][j]`, `dp[i][j-1]`, `dp[i-1][j-1]`, nên nhiều bài có thể nén về một hàng O(n). Ngoài ra còn state machine DP (mỗi ngày ở một trong vài trạng thái) và memoized DFS trên matrix khi thứ tự điền bảng không hiển nhiên.

## Khi nào dùng
- Hai chuỗi/mảng được so khớp với nhau: subsequence chung, biến đổi chuỗi này thành chuỗi kia, interleave, regex matching.
- Đếm số đường đi hoặc chi phí trên grid chỉ đi phải/xuống.
- Chọn phần tử để đạt một tổng (đếm số cách, có/không) → knapsack.
- Mỗi thời điểm có vài "trạng thái" (đang giữ cổ phiếu, vừa bán, nghỉ) → state machine.
- Kết quả của đoạn `[l, r]` phụ thuộc cách chia đoạn tại một điểm `k` → interval DP.
- Đường đi tăng dần trong matrix (DAG ẩn) → DFS + memo.

## Template Java
```java
// LCS / Edit Distance: dp kích thước (m+1) x (n+1), hàng/cột 0 là chuỗi rỗng
int minDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;   // xóa hết
    for (int j = 0; j <= n; j++) dp[0][j] = j;   // chèn hết
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1],        // replace
                                Math.min(dp[i - 1][j], dp[i][j - 1])); // delete / insert
    return dp[m][n];
}

// Coin Change II (đếm tổ hợp, unbounded): coin ở vòng NGOÀI, amount TĂNG dần
int change(int amount, int[] coins) {
    int[] dp = new int[amount + 1];
    dp[0] = 1;
    for (int c : coins)
        for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
    return dp[amount];
}
```

```java
// State machine: Best Time to Buy and Sell Stock with Cooldown
int maxProfit(int[] prices) {
    int hold = Integer.MIN_VALUE / 2; // đang giữ cổ phiếu
    int sold = 0;                     // vừa bán hôm nay (mai phải cooldown)
    int rest = 0;                     // không giữ, được phép mua
    for (int p : prices) {
        int prevSold = sold;
        sold = hold + p;
        hold = Math.max(hold, rest - p);
        rest = Math.max(rest, prevSold);
    }
    return Math.max(sold, rest);
}

// Interval DP: Burst Balloons, k là quả bóng nổ CUỐI CÙNG trong (l, r)
int maxCoins(int[] nums) {
    int n = nums.length + 2;
    int[] a = new int[n];
    a[0] = a[n - 1] = 1;
    for (int i = 0; i < nums.length; i++) a[i + 1] = nums[i];
    int[][] dp = new int[n][n];
    for (int len = 2; len < n; len++)             // khoảng cách r - l
        for (int l = 0; l + len < n; l++) {
            int r = l + len;
            for (int k = l + 1; k < r; k++)
                dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
        }
    return dp[0][n - 1];
}
```

```java
// Memoized DFS trên matrix: Longest Increasing Path
int[][] memo; int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};
int dfs(int[][] g, int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];
    int best = 1;
    for (int[] d : DIRS) {
        int nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nr < g.length && nc >= 0 && nc < g[0].length && g[nr][nc] > g[r][c])
            best = Math.max(best, 1 + dfs(g, nr, nc));
    }
    return memo[r][c] = best; // tăng nghiêm ngặt nên không có chu trình, không cần visited
}
```

## Độ phức tạp
- Hai chuỗi / grid: O(m · n) time, O(m · n) space, thường nén được còn O(n).
- Knapsack: O(n · target) time, O(target) space với mảng 1-D.
- State machine: O(n) time, O(1) space.
- Interval DP: O(n³) time, O(n²) space.
- Memoized DFS trên matrix: O(m · n) time và space.

## Lỗi hay gặp
- Nhầm chỉ số khi bảng có kích thước `(m+1) x (n+1)`: `dp[i][j]` ứng với `charAt(i - 1)` và `charAt(j - 1)`.
- Đảo thứ tự vòng lặp trong Coin Change II (amount ở ngoài, coin ở trong) → đếm hoán vị thay vì tổ hợp.
- 0/1 knapsack nén 1-D mà duyệt tổng tăng dần → một phần tử bị dùng nhiều lần.
- Khởi tạo `hold = Integer.MIN_VALUE` rồi cộng giá → overflow; dùng `Integer.MIN_VALUE / 2` hoặc `-prices[0]`.
- Interval DP điền sai thứ tự: phải đi từ đoạn ngắn đến đoạn dài để `dp[l][k]`, `dp[k][r]` đã có sẵn.

## Bài trong chủ đề
- **Unique Paths**: `dp[i][j] = dp[i-1][j] + dp[i][j-1]`, nén được còn một hàng.
- **Longest Common Subsequence**: ký tự khớp thì `dp[i-1][j-1] + 1`, không khớp thì `max(dp[i-1][j], dp[i][j-1])`.
- **Best Time to Buy and Sell Stock with Cooldown**: state machine ba trạng thái hold / sold / rest cập nhật mỗi ngày.
- **Coin Change II**: đếm tổ hợp unbounded, coin ở vòng ngoài và amount tăng dần ở vòng trong.
- **Target Sum**: biến đổi thành đếm subset có tổng `(sum + target) / 2` (0/1 knapsack đếm cách), nhớ kiểm tra tính chẵn lẻ và giá trị âm.
- **Interleaving String**: `dp[i][j]` đúng nếu `s1[0..i)` và `s2[0..j)` tạo được `s3[0..i+j)`, xét ký tự cuối đến từ `s1` hay `s2`.
- **Edit Distance**: khớp thì lấy chéo, không khớp thì 1 + min của replace / delete / insert.
- **Longest Increasing Path in a Matrix**: DFS từ mỗi ô chỉ đi sang ô lớn hơn, memo độ dài đường dài nhất bắt đầu tại ô đó.
- **Distinct Subsequences**: `dp[i][j]` là số cách tạo `t[0..j)` từ `s[0..i)`; ký tự khớp thì cộng thêm `dp[i-1][j-1]` vào `dp[i-1][j]`, và `dp[i][0] = 1`.
- **Burst Balloons**: thêm 1 ở hai đầu, chọn `k` là quả nổ cuối cùng trong khoảng mở `(l, r)`.
- **Regular Expression Matching**: `dp[i][j]` so `s[i..]` với `p[j..]`; gặp `*` thì hoặc bỏ qua cặp `x*` (`j + 2`) hoặc ăn một ký tự khớp của `s` (`i + 1`).
