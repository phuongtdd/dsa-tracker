## Pattern
Nhóm bài này ít dựa vào cấu trúc dữ liệu phức tạp mà dựa vào quan sát toán học hoặc hình học: xoay ma trận = transpose rồi đảo từng hàng, duyệt xoắn ốc bằng 4 biên co dần, dùng chính hàng/cột đầu làm marker để tiết kiệm bộ nhớ. Với số học, cần mô phỏng phép tính từng chữ số (cộng, nhân) và dùng fast power để tính `x^n` trong O(log n). Một số bài số học thực chất là phát hiện chu trình, áp dụng fast/slow pointer như trên linked list.

## Khi nào dùng
- Thao tác trên ma trận 2D: xoay, duyệt theo thứ tự đặc biệt, đánh dấu in-place với O(1) extra space.
- Số rất lớn biểu diễn bằng chuỗi hoặc mảng chữ số → mô phỏng từng chữ số với carry.
- Lũy thừa với số mũ lớn hoặc âm → fast power (binary exponentiation).
- Dãy số sinh bởi một phép biến đổi lặp lại có thể rơi vào vòng lặp → cycle detection.
- Bài hình học với tọa độ nguyên → đếm bằng `HashMap` theo điểm.

## Template Java
```java
// Rotate Image 90 độ theo chiều kim đồng hồ: transpose + reverse từng hàng
void rotate(int[][] m) {
    int n = m.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {        // chỉ tam giác trên
            int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;
        }
    for (int[] row : m)
        for (int l = 0, r = n - 1; l < r; l++, r--) {
            int t = row[l]; row[l] = row[r]; row[r] = t;
        }
}

// Spiral Matrix: 4 biên top, bottom, left, right
List<Integer> spiralOrder(int[][] m) {
    List<Integer> res = new ArrayList<>();
    int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res.add(m[top][j]);
        top++;
        for (int i = top; i <= bottom; i++) res.add(m[i][right]);
        right--;
        if (top <= bottom) { for (int j = right; j >= left; j--) res.add(m[bottom][j]); bottom--; }
        if (left <= right) { for (int i = bottom; i >= top; i--) res.add(m[i][left]); left++; }
    }
    return res;
}
```

```java
// Fast power: đổi n sang long vì -Integer.MIN_VALUE vẫn overflow trong int
double myPow(double x, int n) {
    long e = n;
    if (e < 0) { x = 1 / x; e = -e; }
    double res = 1;
    while (e > 0) {
        if ((e & 1) == 1) res *= x;
        x *= x;
        e >>= 1;
    }
    return res;
}

// Happy Number: fast/slow trên dãy số, gặp nhau tại 1 hoặc trong chu trình
boolean isHappy(int n) {
    int slow = n, fast = next(n);
    while (fast != 1 && slow != fast) {
        slow = next(slow);
        fast = next(next(fast));
    }
    return fast == 1;
}
int next(int n) {
    int s = 0;
    while (n > 0) { int d = n % 10; s += d * d; n /= 10; }
    return s;
}
```

```java
// Multiply Strings: num1[i] * num2[j] rơi vào vị trí i + j và i + j + 1
String multiply(String a, String b) {
    int[] pos = new int[a.length() + b.length()];
    for (int i = a.length() - 1; i >= 0; i--)
        for (int j = b.length() - 1; j >= 0; j--) {
            int sum = (a.charAt(i) - '0') * (b.charAt(j) - '0') + pos[i + j + 1];
            pos[i + j + 1] = sum % 10;
            pos[i + j] += sum / 10;       // carry
        }
    StringBuilder sb = new StringBuilder();
    for (int d : pos) if (!(sb.length() == 0 && d == 0)) sb.append(d); // bỏ số 0 đầu
    return sb.length() == 0 ? "0" : sb.toString();
}
```

## Độ phức tạp
- Rotate Image, Spiral Matrix, Set Matrix Zeroes: O(m · n) time; O(1) extra space (không tính output).
- Pow(x, n): O(log n) time, O(1) space.
- Multiply Strings: O(m · n) time, O(m + n) space.
- Happy Number: O(log n) mỗi bước biến đổi, số bước bị chặn nhỏ; O(1) space với fast/slow.
- Detect Squares: `add` O(1), `count` O(số điểm phân biệt).

## Lỗi hay gặp
- `-n` với `n = Integer.MIN_VALUE` vẫn là `Integer.MIN_VALUE` (overflow); phải ép sang `long` trước khi đổi dấu.
- Transpose duyệt cả ma trận (`j` từ 0) → mỗi cặp bị đổi hai lần và ma trận quay về như cũ.
- Spiral Matrix quên kiểm tra `top <= bottom` / `left <= right` trước khi duyệt cạnh dưới và cạnh trái → in trùng phần tử với ma trận không vuông.
- Set Matrix Zeroes dùng hàng 0 và cột 0 làm marker nhưng quên lưu riêng trạng thái của chính hàng 0 / cột 0 → xóa nhầm.
- Plus One quên trường hợp toàn chữ số 9 → cần tạo mảng mới dài hơn một phần tử.

## Bài trong chủ đề
- **Happy Number**: tính tổng bình phương các chữ số lặp lại, dùng fast/slow (hoặc `HashSet`) để phát hiện chu trình không chứa 1.
- **Plus One**: duyệt từ cuối, chữ số < 9 thì cộng 1 và trả về ngay, bằng 9 thì gán 0; hết vòng thì tạo mảng mới bắt đầu bằng 1.
- **Rotate Image**: transpose theo đường chéo chính rồi đảo ngược từng hàng.
- **Spiral Matrix**: duyệt 4 cạnh theo 4 biên, co biên sau mỗi cạnh và kiểm tra biên trước hai cạnh cuối.
- **Set Matrix Zeroes**: dùng hàng 0 và cột 0 làm marker, thêm một biến riêng cho việc cột 0 (hoặc hàng 0) có chứa 0 hay không.
- **Pow(x, n)**: binary exponentiation, ép `n` sang `long` rồi xử lý số mũ âm bằng `x = 1 / x`.
- **Multiply Strings**: tích của chữ số `i` và `j` cộng vào ô `i + j + 1`, carry đẩy sang ô `i + j`.
- **Detect Squares**: đếm điểm bằng `HashMap`, khi query duyệt mọi điểm làm đỉnh chéo có `|dx| == |dy| != 0` và nhân số lần xuất hiện của hai đỉnh còn lại.
