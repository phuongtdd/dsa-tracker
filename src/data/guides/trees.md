## Pattern
Phần lớn bài cây giải bằng **recursive DFS**: hàm đệ quy trả về một giá trị cho subtree (chiều cao, tổng, true/false), còn đáp án toàn cục được cập nhật vào một biến global trong lúc đệ quy (pattern height/diameter). Khi đề nói về "từng tầng", dùng **BFS level order** với `Queue`. Với BST, nhớ tính chất trái < gốc < phải và **inorder traversal cho ra dãy tăng dần**.

## Khi nào dùng
- Đề hỏi chiều cao, đường kính, đường đi lớn nhất, cây cân bằng → DFS trả về giá trị + biến global max
- Đề nói "level", "tầng", "nhìn từ bên phải", "khoảng cách nhỏ nhất theo tầng" → BFS với `Queue`
- Đề cho BST, hỏi phần tử thứ k, validate, LCA → tận dụng thứ tự trái < gốc < phải hoặc inorder
- Cần truyền thông tin từ gốc xuống (max trên đường đi, khoảng min/max hợp lệ) → thêm tham số vào hàm DFS
- Xây dựng/tuần tự hóa cây → preorder + đệ quy, dùng index chung

## Template Java
```java
// Định nghĩa như trên LeetCode
public class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val; this.left = left; this.right = right;
    }
}

// DFS trả về chiều cao, cập nhật global max (Diameter)
class Solution {
    private int best = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return best;
    }

    private int height(TreeNode node) {
        if (node == null) return 0;
        int l = height(node.left);
        int r = height(node.right);
        best = Math.max(best, l + r);   // đường đi qua node
        return 1 + Math.max(l, r);      // trả về cho cha
    }
}
```

```java
// BFS level order: xử lý từng tầng bằng size của queue
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();            // chốt số node của tầng hiện tại
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            level.add(node.val);
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        res.add(level);
    }
    return res;
}
```

```java
// Validate BST: truyền khoảng (low, high) xuống, dùng long để tránh tràn
public boolean isValidBST(TreeNode root) {
    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean valid(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
}

// Inorder iterative (dùng cho Kth Smallest)
public int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !stack.isEmpty()) {
        while (cur != null) { stack.push(cur); cur = cur.left; }
        cur = stack.pop();
        if (--k == 0) return cur.val;   // phần tử thứ k theo thứ tự tăng
        cur = cur.right;
    }
    return -1;
}
```

## Độ phức tạp
- DFS/BFS: time O(n) vì mỗi node thăm một lần
- Space DFS: O(h) cho call stack (O(log n) nếu cân bằng, O(n) nếu cây lệch)
- Space BFS: O(w) với w là số node lớn nhất trên một tầng (tối đa ~n/2)
- Thao tác trên BST cân bằng: O(log n), cây lệch: O(n)

## Lỗi hay gặp
- Quên base case `if (node == null)` → `NullPointerException`
- Validate BST chỉ so sánh node với con trực tiếp thay vì với cả khoảng (low, high); dùng `int` cho biên nên sai khi `val == Integer.MAX_VALUE`
- Trong BFS dùng `q.size()` trực tiếp trong điều kiện vòng `for` (size thay đổi khi `offer`) thay vì lưu vào biến trước
- Nhầm giữa giá trị trả về cho cha (chỉ một nhánh) và giá trị cập nhật global (cả hai nhánh) trong Diameter/Max Path Sum
- Dùng biến `static` cho global max: LeetCode chạy nhiều test trên cùng class nên giá trị cũ bị giữ lại; hãy dùng field thường và reset

## Bài trong chủ đề
- **Invert Binary Tree**: Đổi chỗ `left` và `right` ở mỗi node rồi đệ quy xuống hai con.
- **Maximum Depth of Binary Tree**: Độ sâu = 1 + max(độ sâu con trái, độ sâu con phải), null trả về 0.
- **Diameter of Binary Tree**: Hàm trả về chiều cao, đồng thời cập nhật global max bằng `left + right` tại mỗi node.
- **Balanced Binary Tree**: Hàm chiều cao trả về -1 khi phát hiện lệch quá 1 để dừng sớm, tránh O(n²).
- **Same Tree**: So sánh đồng thời hai node: cùng null, cùng giá trị, rồi đệ quy trái-trái và phải-phải.
- **Subtree of Another Tree**: Tại mỗi node của cây lớn, gọi `isSameTree` với `subRoot`.
- **Lowest Common Ancestor of a Binary Search Tree**: Nếu cả p và q đều nhỏ hơn node thì đi trái, đều lớn hơn thì đi phải, còn lại node hiện tại là đáp án.
- **Binary Tree Level Order Traversal**: BFS với `Queue`, chốt `size` mỗi tầng để gom node vào cùng một list.
- **Binary Tree Right Side View**: BFS theo tầng và lấy node cuối cùng của mỗi tầng (hoặc DFS ưu tiên nhánh phải).
- **Count Good Nodes in Binary Tree**: DFS truyền xuống giá trị max trên đường từ gốc, node tốt khi `val >= max`.
- **Validate Binary Search Tree**: Truyền khoảng (low, high) kiểu `long` xuống mỗi node và kiểm tra `low < val < high`.
- **Kth Smallest Element in a BST**: Inorder traversal cho dãy tăng dần, dừng khi đếm đến k.
- **Construct Binary Tree from Preorder and Inorder Traversal**: Phần tử đầu preorder là gốc, tra vị trí của nó trong inorder bằng `HashMap` để chia cây trái/phải.
- **Binary Tree Maximum Path Sum**: Mỗi node trả về `val + max(0, nhánh tốt nhất)` và cập nhật global với `val + max(0,left) + max(0,right)`.
- **Serialize and Deserialize Binary Tree**: Preorder có ghi `"N"` cho null, khi deserialize đọc lần lượt bằng một index/queue chung.
