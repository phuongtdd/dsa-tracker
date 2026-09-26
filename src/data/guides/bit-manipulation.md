## Pattern
Bit manipulation thao tác trực tiếp trên biểu diễn nhị phân (two's complement 32-bit với `int` trong Java) bằng các toán tử `&`, `|`, `^`, `~`, `<<`, `>>` (dịch phải giữ dấu) và `>>>` (dịch phải điền 0). Vài tính chất cốt lõi: `x ^ x = 0`, `x ^ 0 = x` nên XOR triệt tiêu các cặp giống nhau; `n & (n - 1)` xóa bit 1 thấp nhất; `n & 1` lấy bit cuối. Java không có kiểu unsigned, nên khi coi `int` là số không dấu phải dùng `>>>` và giới hạn số vòng lặp là 32.

## Khi nào dùng
- Đề nhắc "không dùng thêm bộ nhớ", "mọi phần tử xuất hiện hai lần trừ một" → XOR.
- Đếm bit 1, đảo bit, kiểm tra lũy thừa của 2.
- Input được mô tả là "unsigned integer" hoặc "32-bit".
- Cấm dùng toán tử `+`, `-`, `*` → mô phỏng phép cộng bằng XOR và carry.
- Tìm phần tử bị thiếu trong dãy `0..n` → XOR hoặc công thức tổng.

## Template Java
```java
// Các thao tác cơ bản
boolean getBit(int n, int i) { return ((n >> i) & 1) == 1; }
int setBit(int n, int i)     { return n | (1 << i); }
int clearBit(int n, int i)   { return n & ~(1 << i); }
boolean isPowerOfTwo(int n)  { return n > 0 && (n & (n - 1)) == 0; }

// Number of 1 Bits: mỗi lần n & (n - 1) xóa một bit 1, kể cả khi n âm
int hammingWeight(int n) {
    int count = 0;
    while (n != 0) { n &= n - 1; count++; }
    return count;
}

// Single Number: các cặp XOR triệt tiêu nhau
int singleNumber(int[] nums) {
    int res = 0;
    for (int x : nums) res ^= x;
    return res;
}

// Counting Bits: số bit của i = số bit của i/2 + bit cuối
int[] countBits(int n) {
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);
    return dp;
}
```

```java
// Reverse Bits: coi n là unsigned, dùng >>> và lặp đúng 32 lần
int reverseBits(int n) {
    int res = 0;
    for (int i = 0; i < 32; i++) {
        res = (res << 1) | (n & 1);
        n >>>= 1;
    }
    return res;
}

// Sum of Two Integers: XOR là tổng không nhớ, (a & b) << 1 là carry
int getSum(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}

// Reverse Integer: kiểm tra overflow TRƯỚC khi nhân 10
int reverse(int x) {
    int res = 0;
    while (x != 0) {
        int d = x % 10;               // giữ dấu với số âm
        x /= 10;
        if (res > Integer.MAX_VALUE / 10 || (res == Integer.MAX_VALUE / 10 && d > 7)) return 0;
        if (res < Integer.MIN_VALUE / 10 || (res == Integer.MIN_VALUE / 10 && d < -8)) return 0;
        res = res * 10 + d;
    }
    return res;
}
```

## Độ phức tạp
- Thao tác trên một số: O(1) (tối đa 32 bước với `int`).
- Single Number, Missing Number: O(n) time, O(1) space.
- Counting Bits: O(n) time, O(n) space cho output.
- Reverse Integer: O(số chữ số) = O(log x).

## Lỗi hay gặp
- Dùng `>>` thay cho `>>>` với số âm: `>>` điền bit dấu nên vòng `while (n != 0)` không bao giờ dừng.
- Quên dấu ngoặc: `n & 1 == 0` được hiểu là `n & (1 == 0)` và lỗi biên dịch; phải viết `(n & 1) == 0`.
- Reverse Integer kiểm tra overflow sau khi đã tính `res * 10 + d` → giá trị đã tràn, kiểm tra vô nghĩa; phải kiểm tra trước (hoặc dùng `long`).
- `1 << 31` là số âm (`Integer.MIN_VALUE`) và `1 << 32` bằng `1` (Java chỉ lấy 5 bit thấp của số dịch); dùng `1L << i` khi cần 64-bit.
- `Math.abs(Integer.MIN_VALUE)` vẫn trả về `Integer.MIN_VALUE`, đừng dựa vào nó để bỏ dấu.

## Bài trong chủ đề
- **Single Number**: XOR toàn bộ mảng, các cặp triệt tiêu và chỉ còn lại số xuất hiện một lần.
- **Number of 1 Bits**: lặp `n &= n - 1` cho đến khi `n == 0`, hoặc kiểm tra `n & 1` rồi `n >>>= 1`.
- **Counting Bits**: `dp[i] = dp[i >> 1] + (i & 1)`, tính tăng dần từ 1 đến n.
- **Reverse Bits**: lặp 32 lần, đẩy bit cuối của `n` vào `res` qua `res << 1`, dịch `n` bằng `>>>`.
- **Missing Number**: XOR tất cả chỉ số `0..n` với mọi phần tử, phần còn lại là số bị thiếu.
- **Sum of Two Integers**: lặp `a ^ b` (tổng không nhớ) và `(a & b) << 1` (carry) cho đến khi carry bằng 0; trong Java số âm vẫn chạy đúng vì `int` tự cắt về 32 bit.
- **Reverse Integer**: lấy từng chữ số bằng `% 10`, kiểm tra với `Integer.MAX_VALUE / 10` và `Integer.MIN_VALUE / 10` trước khi nhân 10.
