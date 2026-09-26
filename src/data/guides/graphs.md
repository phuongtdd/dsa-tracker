## Pattern
Đồ thị được biểu diễn bằng adjacency list (`List<List<Integer>>`) hoặc ngầm định dưới dạng lưới, khi đó mỗi ô có 4 hàng xóm theo mảng hướng `dirs`. DFS/BFS duyệt từng thành phần liên thông, luôn kèm `visited` để không thăm lại. BFS nhiều nguồn (multi-source BFS) cho khoảng cách ngắn nhất từ nhiều điểm cùng lúc; **topological sort (Kahn)** xử lý quan hệ phụ thuộc; **Union-Find** gom nhóm và phát hiện chu trình trong đồ thị vô hướng.

## Khi nào dùng
- Lưới `char[][]`/`int[][]` với "đảo", "vùng", "lan ra ô kề" → DFS/BFS trên grid
- "Số bước/phút tối thiểu" trong đồ thị không trọng số, nhất là khi có nhiều điểm xuất phát → BFS (multi-source)
- "Điều kiện tiên quyết", "thứ tự thực hiện", "có chu trình không" trên đồ thị có hướng → topological sort
- "Số thành phần liên thông", "cạnh thừa tạo chu trình", "có phải cây không" trên đồ thị vô hướng → Union-Find
- Biến đổi từng bước giữa các trạng thái (Word Ladder) → BFS trên đồ thị ngầm định

## Template Java
```java
// Multi-source BFS trên grid (Rotting Oranges)
private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length, fresh = 0, minutes = 0;
    Queue<int[]> q = new ArrayDeque<>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 2) q.offer(new int[]{r, c}); // mọi nguồn vào queue từ đầu
            else if (grid[r][c] == 1) fresh++;
        }
    while (!q.isEmpty() && fresh > 0) {
        for (int size = q.size(); size > 0; size--) {       // xử lý một "phút"
            int[] cur = q.poll();
            for (int[] d : DIRS) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;                           // đánh dấu visited khi push
                fresh--;
                q.offer(new int[]{nr, nc});
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}
```

```java
// Topological sort - Kahn's algorithm (Course Schedule II)
public int[] findOrder(int n, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] p : prerequisites) {         // p[1] -> p[0]
        adj.get(p[1]).add(p[0]);
        indegree[p[0]]++;
    }
    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) q.offer(i);
    int[] order = new int[n];
    int idx = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        order[idx++] = u;
        for (int v : adj.get(u)) {
            if (--indegree[v] == 0) q.offer(v);
        }
    }
    return idx == n ? order : new int[0];   // idx < n nghĩa là có chu trình
}
```

```java
// Union-Find với path compression + union by rank
class UnionFind {
    int[] parent, rank;
    UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }
    boolean union(int a, int b) {           // false nếu a, b đã cùng nhóm (tạo chu trình)
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                    // gắn cây thấp vào cây cao
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
}
```

## Độ phức tạp
- DFS/BFS trên grid: time O(m · n), space O(m · n) cho visited/queue/call stack
- DFS/BFS trên đồ thị: time O(V + E), space O(V + E)
- Kahn's algorithm: O(V + E)
- Union-Find với cả hai tối ưu: gần như O(1) mỗi thao tác (O(α(n))), tổng O(E · α(V))
- Word Ladder: O(N · L²) với N từ, độ dài L (thử 26 ký tự cho mỗi vị trí)

## Lỗi hay gặp
- Đánh dấu visited khi **poll** thay vì khi **push** trong BFS → một ô bị thêm vào queue nhiều lần, chậm hoặc sai khoảng cách
- DFS đệ quy trên grid lớn (vd 10^6 ô) có thể `StackOverflowError`; khi đó chuyển sang BFS hoặc stack tự quản lý
- Nhầm chiều cạnh trong Course Schedule: `[a, b]` nghĩa là muốn học a phải học b trước, tức cạnh `b -> a`
- Dùng `List<Integer>[]` với generic array gây warning/khó đọc; `List<List<Integer>>` khởi tạo đủ n list là an toàn nhất
- Union-Find quên gọi `find` (so sánh `parent[a] == parent[b]` trực tiếp) → kết quả sai khi cây chưa được nén

## Bài trong chủ đề
- **Number of Islands**: Duyệt mọi ô, gặp `'1'` thì tăng đếm và DFS/BFS "đánh chìm" cả đảo thành `'0'`.
- **Max Area of Island**: DFS trả về số ô của đảo (1 + tổng 4 hướng), lấy max qua mọi đảo.
- **Clone Graph**: DFS/BFS với `HashMap<Node, Node>` từ node gốc sang bản sao, map này cũng đóng vai trò visited.
- **Walls and Gates**: Multi-source BFS từ tất cả cổng (giá trị 0), phòng trống được gán khoảng cách lần đầu chạm tới.
- **Rotting Oranges**: Multi-source BFS từ mọi quả thối, đếm số tầng BFS và kiểm tra còn cam tươi không.
- **Pacific Atlantic Water Flow**: Đi ngược từ bờ biển vào trong (chỉ đi lên ô cao hơn hoặc bằng), lấy giao của hai tập ô tới được.
- **Surrounded Regions**: DFS từ các `'O'` ở biên để đánh dấu vùng an toàn, phần `'O'` còn lại thì lật thành `'X'`.
- **Course Schedule**: Kahn's algorithm, có thể học hết khi số node được lấy ra bằng `numCourses` (không có chu trình).
- **Course Schedule II**: Như Course Schedule nhưng ghi lại thứ tự lấy ra khỏi queue, có chu trình thì trả về mảng rỗng.
- **Graph Valid Tree**: Cây cần đúng `n - 1` cạnh và không có chu trình, kiểm tra bằng Union-Find.
- **Number of Connected Components in an Undirected Graph**: Bắt đầu với n thành phần, mỗi lần `union` thành công thì trừ 1.
- **Redundant Connection**: Duyệt cạnh theo thứ tự, cạnh đầu tiên mà `union` trả về false chính là cạnh thừa.
- **Word Ladder**: BFS theo tầng từ `beginWord`, thử thay từng ký tự bằng `'a'`–`'z'` và chỉ đi tới từ có trong `HashSet`.
