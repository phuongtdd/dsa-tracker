## Pattern
Stack (LIFO) phù hợp khi phần tử mở gần nhất phải được đóng/xử lý trước — như ngoặc lồng nhau hay biểu thức hậu tố (RPN). Biến thể quan trọng là **monotonic stack**: giữ các phần tử theo thứ tự tăng/giảm, khi phần tử mới phá vỡ thứ tự thì pop ra và lúc đó ta biết được "phần tử lớn hơn/nhỏ hơn kế tiếp" của phần tử bị pop. Trong Java dùng `ArrayDeque` thay cho lớp `Stack` cũ.

## Khi nào dùng
- Kiểm tra ngoặc hợp lệ, xử lý cấu trúc lồng nhau
- Tính biểu thức (RPN, calculator)
- "Next greater / next smaller element", "bao nhiêu ngày nữa thì ấm hơn"
- Tìm phạm vi mà một phần tử là min/max (histogram, rectangle)
- Cần undo/quay lui trạng thái gần nhất

## Template Java
```java
// Stack cơ bản: kiểm tra ngoặc
Deque<Character> stack = new ArrayDeque<>();
for (char c : s.toCharArray()) {
    if (c == '(') stack.push(')');
    else if (c == '[') stack.push(']');
    else if (c == '{') stack.push('}');
    else if (stack.isEmpty() || stack.pop() != c) return false;
}
return stack.isEmpty();
```

```java
// Monotonic stack (giảm dần): tìm next greater element
Deque<Integer> stack = new ArrayDeque<>(); // lưu chỉ số
int[] res = new int[nums.length];          // mặc định 0 = không có
for (int i = 0; i < nums.length; i++) {
    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
        int j = stack.pop();
        res[j] = i - j;                    // Daily Temperatures: số ngày phải chờ
    }
    stack.push(i);
}
```

```java
// Largest Rectangle in Histogram: stack tăng dần, thêm cột 0 ở cuối
Deque<Integer> stack = new ArrayDeque<>();
int best = 0, n = heights.length;
for (int i = 0; i <= n; i++) {
    int h = (i == n) ? 0 : heights[i];
    while (!stack.isEmpty() && heights[stack.peek()] >= h) {
        int height = heights[stack.pop()];
        int left = stack.isEmpty() ? -1 : stack.peek();
        best = Math.max(best, height * (i - left - 1));
    }
    stack.push(i);
}
```

## Độ phức tạp
- Time: O(n) — mỗi phần tử được push và pop tối đa một lần
- Space: O(n) cho stack

## Lỗi hay gặp
- Dùng lớp `Stack` (đồng bộ, chậm, kế thừa `Vector`) thay vì `Deque<Integer> stack = new ArrayDeque<>()`
- Gọi `pop()`/`peek()` khi stack rỗng: `ArrayDeque.pop()` ném `NoSuchElementException`, `peek()` trả về `null` → `NullPointerException` khi unbox
- So sánh hai `Integer` lấy từ stack bằng `==` (ví dụ `stack.peek() == minStack.peek()` trong Min Stack) — dùng `.equals()` hoặc ép sang `int`
- RPN: pop sai thứ tự toán hạng; phải là `b = pop(), a = pop()` rồi tính `a - b`, `a / b`
- Histogram: quên xử lý các cột còn lại trong stack ở cuối (thêm cột cao 0 là cách gọn nhất)

## Bài trong chủ đề
- **Valid Parentheses**: Gặp ngoặc mở thì push ngoặc đóng tương ứng, gặp ngoặc đóng thì pop và so khớp.
- **Min Stack**: Dùng thêm một stack phụ lưu giá trị min tại mỗi thời điểm (hoặc lưu cặp `{val, min}`).
- **Evaluate Reverse Polish Notation**: Gặp số thì push, gặp toán tử thì pop hai số (chú ý thứ tự) và push kết quả.
- **Generate Parentheses**: Backtracking, chỉ thêm `(` khi `open < n` và thêm `)` khi `close < open`.
- **Daily Temperatures**: Monotonic stack giảm dần lưu chỉ số; khi gặp ngày ấm hơn thì pop và ghi khoảng cách ngày.
- **Car Fleet**: Sort xe theo vị trí giảm dần, tính thời gian tới đích; xe nào tới chậm hơn đỉnh stack thì tạo fleet mới.
- **Largest Rectangle in Histogram**: Monotonic stack tăng dần; khi pop một cột, biên trái là đỉnh stack mới và biên phải là `i`.
