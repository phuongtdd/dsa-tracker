## Pattern
Backtracking là DFS trên cây lựa chọn: ở mỗi bước ta **choose** (thêm một lựa chọn), **explore** (đệ quy), rồi **unchoose** (gỡ lựa chọn) để thử nhánh khác. Subsets và combinations dùng tham số `start` để chỉ chọn các phần tử phía sau (không lặp thứ tự), còn permutations dùng mảng `used[]` vì mọi vị trí đều có thể được chọn. Khi input có phần tử trùng, sort trước rồi bỏ qua phần tử giống phần tử liền trước ở cùng tầng.

## Khi nào dùng
- Đề yêu cầu "liệt kê tất cả" (all subsets, all permutations, all combinations, all partitions)
- Ràng buộc nhỏ (n ≤ 10–20) → gợi ý độ phức tạp mũ là chấp nhận được
- Có ràng buộc hợp lệ cần kiểm tra trong lúc xây dựng lời giải (N-Queens, palindrome)
- Tìm đường/từ trên lưới mà mỗi ô chỉ được dùng một lần (Word Search)

## Template Java
```java
// Subsets / Combinations: dùng start; dedupe khi có phần tử trùng
public List<List<Integer>> subsetsWithDup(int[] nums) {
    Arrays.sort(nums);                          // bắt buộc để dedupe
    List<List<Integer>> res = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), res);
    return res;
}

private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
    res.add(new ArrayList<>(path));             // copy! mỗi node là một subset
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue; // bỏ trùng cùng tầng
        path.add(nums[i]);                      // choose
        backtrack(nums, i + 1, path, res);      // explore (i + 1: không dùng lại)
        path.remove(path.size() - 1);           // unchoose
    }
}
```

```java
// Permutations: dùng used[] thay cho start
private void permute(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {
    if (path.size() == nums.length) {
        res.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;  path.add(nums[i]);         // choose
        permute(nums, used, path, res);             // explore
        used[i] = false; path.remove(path.size() - 1); // unchoose
    }
}
// Combination Sum (được dùng lại phần tử): gọi đệ quy với i thay vì i + 1
```

```java
// Grid backtracking (Word Search)
private boolean dfs(char[][] board, String word, int r, int c, int k) {
    if (k == word.length()) return true;
    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length
            || board[r][c] != word.charAt(k)) return false;
    char tmp = board[r][c];
    board[r][c] = '#';                          // choose: đánh dấu đã dùng
    boolean found = dfs(board, word, r + 1, c, k + 1) || dfs(board, word, r - 1, c, k + 1)
                 || dfs(board, word, r, c + 1, k + 1) || dfs(board, word, r, c - 1, k + 1);
    board[r][c] = tmp;                          // unchoose: khôi phục
    return found;
}
```

## Độ phức tạp
- Subsets: O(n · 2^n) time (2^n tập, mỗi tập copy O(n))
- Permutations: O(n · n!) time
- Combinations/Combination Sum: mũ theo độ sâu, phụ thuộc target và giá trị nhỏ nhất
- Grid search: O(m · n · 4 · 3^(L−1)) với L là độ dài từ
- Space: O(n) cho đệ quy và `path` (chưa tính output)

## Lỗi hay gặp
- `res.add(path)` thay vì `res.add(new ArrayList<>(path))` → mọi phần tử trong kết quả cùng trỏ tới một list, cuối cùng đều rỗng
- Quên unchoose (`path.remove(path.size() - 1)`) hoặc quên khôi phục ô lưới
- `path.remove(x)` với `List<Integer>`: nếu truyền `int` thì Java hiểu là **index**, truyền `Integer` là **giá trị**; dùng `remove(path.size() - 1)` cho chắc
- Dedupe bằng `i > 0` thay vì `i > start` → bỏ mất các tổ hợp hợp lệ như [1,1]; hoặc quên `Arrays.sort` trước khi dedupe
- Nhầm `i` và `i + 1` khi đệ quy: `i` cho phép dùng lại phần tử (Combination Sum), `i + 1` thì không

## Bài trong chủ đề
- **Subsets**: Mỗi node trên cây đệ quy là một subset; thêm copy của `path` vào kết quả rồi thử các phần tử từ `start`.
- **Combination Sum**: Đệ quy với `i` (không phải `i + 1`) để dùng lại phần tử, dừng khi tổng vượt target.
- **Combination Sum II**: Sort, đệ quy với `i + 1`, bỏ qua `nums[i] == nums[i-1]` khi `i > start`, và `break` khi vượt target.
- **Permutations**: Dùng `boolean[] used`, thêm vào kết quả khi `path` đủ n phần tử.
- **Subsets II**: Như Subsets nhưng sort trước và skip phần tử trùng ở cùng tầng bằng điều kiện `i > start`.
- **Word Search**: DFS từ mỗi ô, đánh dấu ô bằng `'#'` khi đi vào và khôi phục khi quay lui.
- **Palindrome Partitioning**: Tại vị trí `start`, thử mọi đoạn `s[start..i]` là palindrome rồi đệ quy từ `i + 1`.
- **Letter Combinations of a Phone Number**: Map mỗi chữ số sang chuỗi chữ cái, mỗi tầng đệ quy chọn một chữ cái cho một chữ số.
- **N-Queens**: Đặt hậu theo từng hàng, dùng ba `Set`/mảng boolean cho cột, đường chéo `r - c` và `r + c`.
