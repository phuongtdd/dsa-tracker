## Pattern
Binary search loại bỏ một nửa không gian tìm kiếm sau mỗi bước, cho O(log n). Điều kiện cần là tính **đơn điệu**: tồn tại một hàm kiểm tra `ok(x)` sao cho kết quả có dạng `false...false true...true`. Không gian tìm kiếm có thể là chỉ số của mảng đã sort, hoặc chính **miền giá trị của đáp án** (binary search on the answer).

## Khi nào dùng
- Mảng đã sort (kể cả sort rồi bị xoay - rotated), ma trận sort theo hàng/cột
- Đề yêu cầu O(log n)
- "Tìm giá trị nhỏ nhất/lớn nhất sao cho điều kiện thoả" và điều kiện đơn điệu theo giá trị (tốc độ ăn, sức chứa, số ngày...)
- Tìm vị trí đầu tiên/cuối cùng thoả điều kiện, tìm theo timestamp

## Template Java
```java
// Tìm chính xác: trả về chỉ số hoặc -1
int lo = 0, hi = nums.length - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;   // tránh overflow
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
```

```java
// Lower bound: chỉ số đầu tiên có nums[i] >= target (có thể = n)
int lo = 0, hi = nums.length;       // hi là exclusive
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
}
return lo;
```

```java
// Binary search on the answer (Koko): tốc độ nhỏ nhất ăn hết trong h giờ
int lo = 1, hi = 0;
for (int p : piles) hi = Math.max(hi, p);
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    long hours = 0;                          // dùng long tránh overflow
    for (int p : piles) hours += (p + mid - 1) / mid; // làm tròn lên
    if (hours <= h) hi = mid;                // mid đủ nhanh, thử chậm hơn
    else lo = mid + 1;
}
return lo;
```

## Độ phức tạp
- Time: O(log n) cho tìm trên mảng; O(n · log M) cho binary search on the answer (M là miền giá trị)
- Space: O(1)

## Lỗi hay gặp
- Viết `mid = (lo + hi) / 2` → overflow khi `lo + hi` vượt `Integer.MAX_VALUE`; dùng `lo + (hi - lo) / 2`
- Trộn lẫn hai template: `while (lo < hi)` đi với `hi = mid`, còn `while (lo <= hi)` đi với `hi = mid - 1`; trộn sai gây vòng lặp vô hạn hoặc bỏ sót
- Cộng dồn tổng (số giờ, tổng trọng lượng) bằng `int` bị overflow → dùng `long`
- Rotated array: xác định sai nửa nào đã sort (so sánh `nums[lo] <= nums[mid]`, nhớ dấu `=`)
- Search a 2D Matrix: đổi chỉ số sai; với `mid` thì `row = mid / cols`, `col = mid % cols`

## Bài trong chủ đề
- **Binary Search**: Áp dụng trực tiếp template tìm chính xác với `lo <= hi`.
- **Search a 2D Matrix**: Coi ma trận như mảng 1 chiều dài `m * n`, đổi `mid` thành `(mid / n, mid % n)`.
- **Koko Eating Bananas**: Binary search trên tốc độ `k` từ 1 đến `max(piles)`, tìm `k` nhỏ nhất ăn hết trong `h` giờ.
- **Find Minimum in Rotated Sorted Array**: So `nums[mid]` với `nums[hi]`: nếu lớn hơn thì min nằm bên phải (`lo = mid + 1`), ngược lại `hi = mid`.
- **Search in Rotated Sorted Array**: Mỗi bước xác định nửa nào đã sort, kiểm tra target có nằm trong nửa đó không để chọn hướng.
- **Time Based Key-Value Store**: `HashMap<String, List<Pair>>` với timestamp tăng dần, tìm timestamp lớn nhất `<= t` bằng binary search (hoặc dùng `TreeMap.floorEntry`).
- **Median of Two Sorted Arrays**: Binary search số phần tử lấy từ mảng ngắn hơn sao cho `maxLeft <= minRight` ở cả hai mảng.
