## Pattern
Đặt hai con trỏ ở hai đầu mảng (thường là mảng đã sort hoặc chuỗi), rồi dựa vào điều kiện để quyết định dịch con trỏ nào vào giữa. Mỗi bước loại bỏ được một phần tử khỏi không gian tìm kiếm, nên từ O(n²) giảm còn O(n). Với 3Sum thì cố định một phần tử rồi chạy two pointers trên phần còn lại.

## Khi nào dùng
- Mảng **đã sort** (hoặc được phép sort) và cần tìm cặp/bộ ba có tổng bằng target
- Kiểm tra palindrome, so sánh đối xứng hai đầu
- Tối ưu một đại lượng phụ thuộc vào khoảng cách và giá trị hai đầu (Container With Most Water)
- Cần O(1) extra space thay vì dùng HashMap

## Template Java
```java
// Two pointers từ hai đầu trên mảng đã sort
int l = 0, r = nums.length - 1;
while (l < r) {
    int sum = nums[l] + nums[r];
    if (sum == target) {
        // xử lý kết quả
        l++;
        r--;
    } else if (sum < target) {
        l++;      // cần tổng lớn hơn
    } else {
        r--;      // cần tổng nhỏ hơn
    }
}
```

```java
// 3Sum: sort, cố định i, two pointers trên [i+1, n-1], bỏ qua phần tử trùng
Arrays.sort(nums);
List<List<Integer>> res = new ArrayList<>();
for (int i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue; // bỏ trùng cho i
    int l = i + 1, r = nums.length - 1;
    while (l < r) {
        int sum = nums[i] + nums[l] + nums[r];
        if (sum < 0) l++;
        else if (sum > 0) r--;
        else {
            res.add(Arrays.asList(nums[i], nums[l], nums[r]));
            l++;
            r--;
            while (l < r && nums[l] == nums[l - 1]) l++; // bỏ trùng cho l
        }
    }
}
```

```java
// Trapping Rain Water: dịch bên có max nhỏ hơn
int l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
while (l < r) {
    if (height[l] < height[r]) {
        leftMax = Math.max(leftMax, height[l]);
        water += leftMax - height[l];
        l++;
    } else {
        rightMax = Math.max(rightMax, height[r]);
        water += rightMax - height[r];
        r--;
    }
}
```

## Độ phức tạp
- Time: O(n) cho một lượt two pointers; O(n²) cho 3Sum (cộng O(n log n) để sort)
- Space: O(1) (không tính output và bộ nhớ của sort)

## Lỗi hay gặp
- Quên sort mảng trước khi dùng two pointers kiểu tổng
- 3Sum bị trùng kết quả do không skip phần tử trùng ở cả `i` lẫn `l` (sau khi tìm được một bộ)
- Dùng `while (l <= r)` khi hai con trỏ không được trùng nhau → dùng cùng một phần tử hai lần
- Valid Palindrome: quên bỏ ký tự không phải chữ/số hoặc quên `Character.toLowerCase`; nhớ kiểm tra `l < r` trong các vòng skip bên trong
- Two Sum II trả về chỉ số 1-indexed, không phải 0-indexed

## Bài trong chủ đề
- **Valid Palindrome**: Hai con trỏ từ hai đầu, bỏ qua ký tự không phải `Character.isLetterOrDigit`, so sánh sau khi lowercase.
- **Two Sum II - Input Array Is Sorted**: Mảng đã sort nên tổng nhỏ thì `l++`, tổng lớn thì `r--`; nhớ trả về chỉ số +1.
- **3Sum**: Sort, cố định `nums[i]` rồi tìm cặp có tổng `-nums[i]` bằng two pointers, skip trùng cẩn thận.
- **Container With Most Water**: Diện tích = `min(h[l], h[r]) * (r - l)`; luôn dịch cột thấp hơn vì cột đó không thể cho kết quả tốt hơn.
- **Trapping Rain Water**: Nước tại một vị trí = `min(leftMax, rightMax) - height`; dịch bên có max nhỏ hơn vì bên đó đã xác định được mực nước.
