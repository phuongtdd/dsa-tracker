## Pattern
Trie (prefix tree) lưu các chuỗi theo từng ký tự: mỗi node có mảng `TrieNode[] children = new TrieNode[26]` và cờ `boolean isEnd` đánh dấu kết thúc một từ. Các từ có chung prefix sẽ dùng chung đường đi, nên tra cứu prefix chỉ tốn O(độ dài chuỗi). Khi có wildcard (`.`) hoặc cần tìm nhiều từ trên lưới, ta DFS/backtracking đồng thời trên trie để cắt nhánh sớm.

## Khi nào dùng
- Đề yêu cầu `insert`, `search`, `startsWith` hoặc "prefix" của chuỗi
- Cần tìm nhiều từ cùng lúc trong một lưới/chuỗi (Word Search II) → gom từ vào trie để dùng chung một lần DFS
- Có ký tự đại diện `.` khớp với bất kỳ chữ cái nào → DFS thử cả 26 nhánh
- Bảng chữ cái nhỏ và cố định (thường chỉ `'a'`–`'z'`) → dùng mảng 26 thay cho `HashMap`

## Template Java
```java
class Trie {
    private static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd;
    }

    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new TrieNode();
            node = node.children[i];
        }
        node.isEnd = true;                  // đánh dấu kết thúc từ
    }

    public boolean search(String word) {
        TrieNode node = find(word);
        return node != null && node.isEnd;  // phải là từ hoàn chỉnh
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;        // chỉ cần tồn tại đường đi
    }

    private TrieNode find(String s) {
        TrieNode node = root;
        for (char c : s.toCharArray()) {
            node = node.children[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }
}
```

```java
// DFS với wildcard '.' (Design Add and Search Words)
private boolean dfs(String word, int idx, TrieNode node) {
    if (node == null) return false;
    if (idx == word.length()) return node.isEnd;
    char c = word.charAt(idx);
    if (c == '.') {
        for (TrieNode child : node.children) {   // thử mọi nhánh
            if (child != null && dfs(word, idx + 1, child)) return true;
        }
        return false;
    }
    return dfs(word, idx + 1, node.children[c - 'a']);
}
```

```java
// Word Search II: trie + backtracking trên lưới
// TrieNode ở đây có thêm field String word (lưu từ tại node cuối) thay cho isEnd
private void dfs(char[][] board, int r, int c, TrieNode node, List<String> res) {
    if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) return;
    char ch = board[r][c];
    if (ch == '#' || node.children[ch - 'a'] == null) return;  // cắt nhánh
    node = node.children[ch - 'a'];
    if (node.word != null) {
        res.add(node.word);
        node.word = null;                   // tránh thêm trùng
    }
    board[r][c] = '#';                      // choose: đánh dấu đã thăm
    dfs(board, r + 1, c, node, res);
    dfs(board, r - 1, c, node, res);
    dfs(board, r, c + 1, node, res);
    dfs(board, r, c - 1, node, res);
    board[r][c] = ch;                       // unchoose: khôi phục
}
```

## Độ phức tạp
- `insert` / `search` / `startsWith`: time O(L) với L là độ dài chuỗi
- Space: O(tổng số ký tự của mọi từ × 26) trong trường hợp xấu nhất
- Search có wildcard: xấu nhất O(26^L), thực tế nhỏ hơn nhiều nhờ trie thưa
- Word Search II: khoảng O(m·n·4·3^(L−1)) với L là độ dài từ dài nhất

## Lỗi hay gặp
- `search` quên kiểm tra `isEnd`, nên trả về true cho cả prefix (ví dụ đã insert "apple" mà search "app" ra true)
- Tính index sai: phải là `c - 'a'`, không phải `c - 'A'` hay `(int) c`
- Word Search II: không khôi phục ô lưới sau khi DFS, hoặc không set `node.word = null` nên kết quả bị trùng
- Word Search II: chạy Word Search riêng cho từng từ thay vì dùng trie → TLE
- Tạo `new TrieNode()` cho mọi con ngay từ đầu (thay vì lazy khi cần) → tốn bộ nhớ, dễ Memory Limit Exceeded

## Bài trong chủ đề
- **Implement Trie (Prefix Tree)**: Mỗi node có `children[26]` và `isEnd`; `search` cần `isEnd`, `startsWith` chỉ cần đi hết prefix.
- **Design Add and Search Words Data Structure**: Dùng trie như trên, gặp `.` thì DFS thử tất cả các con khác null.
- **Word Search II**: Insert mọi từ vào trie, rồi backtracking từ mỗi ô và chỉ đi tiếp khi ký tự còn tồn tại trong trie.
