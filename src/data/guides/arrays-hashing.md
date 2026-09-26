## Pattern
Dùng `HashMap`/`HashSet` để tra cứu trong O(1) thay vì duyệt lồng hai vòng O(n²). Ý tưởng chung: đi qua mảng một lần, lưu lại "những gì đã thấy" (tần suất, chỉ số, key chuẩn hoá) để trả lời câu hỏi ngay lập tức. Ngoài ra còn các kỹ thuật mảng như prefix/suffix product, bucket sort theo tần suất, và encode chuỗi bằng length prefix.

## Khi nào dùng
- Đề hỏi "có phần tử trùng không", "đếm số lần xuất hiện", "tìm cặp có tổng bằng target"
- Cần nhóm các phần tử có cùng "đặc trưng" (ví dụ cùng tập ký tự → anagram)
- Top K phần tử xuất hiện nhiều nhất, và tần suất bị chặn bởi n → bucket sort
- Yêu cầu O(n) và không được dùng phép chia → prefix/suffix
- Cần tuần tự hoá danh sách chuỗi có thể chứa ký tự bất kỳ → length prefix

## Template Java
```java
// Đếm tần suất bằng getOrDefault
Map<Integer, Integer> count = new HashMap<>();
for (int x : nums) {
    count.put(x, count.getOrDefault(x, 0) + 1);
}
// Nếu chỉ có 'a'..'z' thì dùng mảng cho nhanh
int[] freq = new int[26];
for (char c : s.toCharArray()) freq[c - 'a']++;
```

```java
// Bucket sort cho Top K: bucket[i] = các số xuất hiện đúng i lần
List<Integer>[] bucket = new List[nums.length + 1];
for (Map.Entry<Integer, Integer> e : count.entrySet()) {
    int f = e.getValue();
    if (bucket[f] == null) bucket[f] = new ArrayList<>();
    bucket[f].add(e.getKey());
}
int[] res = new int[k];
int idx = 0;
for (int f = bucket.length - 1; f >= 0 && idx < k; f--) {
    if (bucket[f] == null) continue;
    for (int x : bucket[f]) {
        if (idx == k) break;
        res[idx++] = x;
    }
}
```

```java
// Prefix/suffix product: res[i] = tích bên trái * tích bên phải
int n = nums.length;
int[] res = new int[n];
res[0] = 1;
for (int i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];
int suffix = 1;
for (int i = n - 1; i >= 0; i--) {
    res[i] *= suffix;
    suffix *= nums[i];
}
```

## Độ phức tạp
- Time: O(n) cho đếm tần suất / tra cứu bằng hash; O(n·k·log k) nếu phải sort từng chuỗi (Group Anagrams)
- Space: O(n) cho map/set; O(1) phụ trợ với prefix/suffix (không tính mảng kết quả)

## Lỗi hay gặp
- So sánh hai `Integer` lấy từ map bằng `==` — chỉ đúng với giá trị trong khoảng cache -128..127; dùng `.equals()` hoặc unbox sang `int`
- Dùng `char[]` hoặc `int[]` làm key của `HashMap` — mảng không override `equals/hashCode`; phải chuyển sang `String` (`new String(chars)` hoặc `Arrays.toString(freq)`)
- Two Sum: đưa phần tử vào map trước khi kiểm tra → tự ghép với chính nó; hãy kiểm tra `target - x` trước rồi mới `put`
- Encode bằng delimiter đơn giản (như `,`) sẽ vỡ khi chuỗi chứa chính delimiter; dùng `length + "#" + str`
- Tạo mảng generic `new List<Integer>[n]` báo lỗi compile — phải viết `new List[n]` (chấp nhận unchecked warning)

## Bài trong chủ đề
- **Contains Duplicate**: Duyệt mảng, nếu `set.add(x)` trả về `false` thì đã có phần tử trùng.
- **Valid Anagram**: Đếm tần suất bằng `int[26]`, cộng cho `s` và trừ cho `t`, cuối cùng mọi ô phải bằng 0.
- **Two Sum**: Lưu `giá trị → chỉ số` vào map, với mỗi `x` kiểm tra `target - x` đã có trong map chưa.
- **Group Anagrams**: Dùng chuỗi đã sort (hoặc chuỗi đếm 26 ký tự) làm key để gom các từ vào cùng một nhóm.
- **Top K Frequent Elements**: Đếm tần suất rồi bucket sort theo tần suất (tối đa n), duyệt từ bucket lớn nhất xuống.
- **Encode and Decode Strings**: Mỗi chuỗi mã hoá thành `độ dài + '#' + chuỗi`, khi decode đọc số trước dấu `#` để biết cần cắt bao nhiêu ký tự.
- **Product of Array Except Self**: Lượt đi trái → phải tính tích prefix, lượt đi phải → trái nhân thêm tích suffix.
- **Valid Sudoku**: Dùng các `HashSet` cho từng hàng, cột và ô 3x3 (chỉ số ô là `(r / 3) * 3 + c / 3`).
- **Longest Consecutive Sequence**: Cho tất cả vào `HashSet`, chỉ bắt đầu đếm từ `x` khi `x - 1` không có trong set.
