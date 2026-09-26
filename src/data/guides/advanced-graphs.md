## Pattern
Với đồ thị có trọng số không âm, **Dijkstra** dùng `PriorityQueue<int[]>` luôn lấy đỉnh có khoảng cách nhỏ nhất ra để chốt. **Prim** có cùng khung nhưng ưu tiên theo trọng số cạnh nối vào cây khung (MST), không phải tổng đường đi. Khi bị giới hạn số cạnh, **Bellman-Ford** chạy đúng K+1 vòng relax trên bản sao mảng khoảng cách. Ngoài ra có **Hierholzer** để đi qua mọi cạnh đúng một lần (Eulerian path) và **topological sort** để suy ra thứ tự từ các ràng buộc (Alien Dictionary).

## Khi nào dùng
- "Đường đi ngắn nhất", "thời gian nhỏ nhất" với trọng số không âm → Dijkstra
- "Nối tất cả các điểm với chi phí nhỏ nhất" → MST (Prim hoặc Kruskal)
- "Tối đa K điểm dừng/K cạnh" → Bellman-Ford giới hạn K vòng (hoặc BFS theo tầng)
- "Dùng mọi vé/cạnh đúng một lần" → Hierholzer
- "Tối thiểu hóa giá trị lớn nhất trên đường đi" (Swim in Rising Water) → biến thể Dijkstra với `max` thay cho `+`
- Suy ra thứ tự từ các cặp so sánh → dựng đồ thị có hướng rồi topological sort

## Template Java
```java
// Dijkstra (Network Delay Time): heap chứa {dist, node}
public int networkDelayTime(int[][] times, int n, int k) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
    for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    pq.offer(new int[]{0, k});
    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int d = cur[0], u = cur[1];
        if (d > dist[u]) continue;              // bản ghi cũ, bỏ qua
        for (int[] e : adj.get(u)) {
            int v = e[0], nd = d + e[1];
            if (nd < dist[v]) { dist[v] = nd; pq.offer(new int[]{nd, v}); }
        }
    }
    int ans = 0;
    for (int i = 1; i <= n; i++) ans = Math.max(ans, dist[i]);
    return ans == Integer.MAX_VALUE ? -1 : ans;
}
// Prim (Min Cost to Connect All Points): cùng khung, nhưng push {weight cạnh, node},
// dùng boolean[] inMST; poll node chưa có trong MST thì cộng weight và đánh dấu.
```

```java
// Bellman-Ford giới hạn K điểm dừng = tối đa K + 1 cạnh
public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    for (int i = 0; i <= k; i++) {
        int[] tmp = dist.clone();               // chỉ relax từ kết quả vòng trước
        for (int[] f : flights) {
            int u = f[0], v = f[1], w = f[2];
            if (dist[u] == Integer.MAX_VALUE) continue;
            if (dist[u] + w < tmp[v]) tmp[v] = dist[u] + w;
        }
        dist = tmp;
    }
    return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
}
```

```java
// Hierholzer (Reconstruct Itinerary): min-heap để đi theo thứ tự từ điển
private final Map<String, PriorityQueue<String>> graph = new HashMap<>();
private final LinkedList<String> route = new LinkedList<>();

public List<String> findItinerary(List<List<String>> tickets) {
    for (List<String> t : tickets)
        graph.computeIfAbsent(t.get(0), x -> new PriorityQueue<>()).offer(t.get(1));
    dfs("JFK");
    return route;
}

private void dfs(String from) {
    PriorityQueue<String> next = graph.get(from);
    while (next != null && !next.isEmpty()) dfs(next.poll()); // dùng mỗi vé một lần
    route.addFirst(from);                       // thêm vào đầu khi hết đường (post-order)
}
```

## Độ phức tạp
- Dijkstra với heap: O(E log V) time, O(V + E) space
- Prim trên đồ thị đầy đủ n điểm: O(n² log n) với heap (hoặc O(n²) với mảng)
- Bellman-Ford K vòng: O(K · E) time, O(V) space
- Hierholzer: O(E log E) do heap sắp xếp điểm đến
- Alien Dictionary: O(C) với C là tổng số ký tự của mọi từ

## Lỗi hay gặp
- Comparator `(a, b) -> a[0] - b[0]` có thể tràn số; dùng `Integer.compare(a[0], b[0])`
- Dijkstra quên `if (d > dist[u]) continue;` → xử lý lại bản ghi cũ, chậm đi nhiều
- Bellman-Ford giới hạn K mà relax trực tiếp trên `dist` (không `clone`) → một vòng có thể đi nhiều cạnh, vượt giới hạn K
- Cộng `Integer.MAX_VALUE + w` → tràn thành số âm; phải kiểm tra vô cực trước khi cộng
- Alien Dictionary: quên trường hợp không hợp lệ khi từ dài đứng trước prefix của nó (vd "abc" trước "ab") và quên thêm mọi ký tự xuất hiện vào đồ thị

## Bài trong chủ đề
- **Network Delay Time**: Dijkstra từ k, đáp án là khoảng cách lớn nhất, còn đỉnh không tới được thì trả về -1.
- **Min Cost to Connect All Points**: Prim trên đồ thị đầy đủ với trọng số là khoảng cách Manhattan, cộng dồn cạnh nhỏ nhất nối đỉnh mới vào cây.
- **Cheapest Flights Within K Stops**: Bellman-Ford chạy K + 1 vòng, mỗi vòng relax trên bản sao của mảng giá.
- **Reconstruct Itinerary**: Hierholzer từ `"JFK"`, lấy điểm đến nhỏ nhất theo từ điển bằng min-heap, thêm sân bay vào đầu kết quả khi quay lui.
- **Swim in Rising Water**: Dijkstra với chi phí đường đi là `max` độ cao trên đường, lấy ô có max nhỏ nhất ra trước cho tới khi đến góc dưới phải.
- **Alien Dictionary**: So sánh từng cặp từ liền kề để tìm ký tự khác đầu tiên làm cạnh, rồi topological sort; có chu trình thì trả về `""`.
