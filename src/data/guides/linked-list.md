## Pattern
Linked list không truy cập ngẫu nhiên được, nên hầu hết bài giải bằng cách thao tác con trỏ `next` một cách cẩn thận. Ba kỹ thuật cốt lõi: **dummy node** để khỏi xử lý riêng trường hợp head thay đổi, **fast/slow pointers** để tìm giữa, phát hiện cycle hoặc tìm node thứ n từ cuối, và **reverse in-place** với ba biến `prev`, `curr`, `next`. Nhiều bài khó là sự kết hợp của các kỹ thuật này (Reorder List = tìm giữa + reverse + merge).

## Khi nào dùng
- Đầu vào là `ListNode head`, yêu cầu O(1) extra space
- Head có thể bị xoá/thay đổi → dùng dummy node
- Tìm node giữa, phát hiện chu trình, node thứ n từ cuối → fast/slow
- Đảo ngược toàn bộ hoặc từng đoạn danh sách
- Gộp các danh sách đã sort (2 danh sách hoặc k danh sách với `PriorityQueue`)

## Template Java
```java
// Định nghĩa như trên LeetCode (LeetCode đã có sẵn, không cần khai báo lại)
public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// Reverse in-place
ListNode reverse(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next; // lưu lại trước khi đổi hướng
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;                   // head mới
}
```

```java
// Dummy node + merge hai danh sách đã sort
ListNode merge(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b; // nối phần còn lại
    return dummy.next;
}
```

```java
// Fast/slow: tìm giữa và phát hiện cycle
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;   // có cycle (so sánh tham chiếu)
}
// không có cycle: slow đang ở giữa (nửa sau nếu số node chẵn)
return false;
```

## Độ phức tạp
- Time: O(n) cho reverse, merge hai list, fast/slow; O(N log k) cho Merge k Sorted Lists với heap
- Space: O(1) cho các thao tác in-place; O(n) nếu dùng HashMap (Copy List with Random Pointer), O(k) cho heap

## Lỗi hay gặp
- Quên lưu `curr.next` trước khi gán `curr.next = prev` → mất phần còn lại của danh sách
- Truy cập `fast.next.next` mà không kiểm tra `fast != null && fast.next != null` → `NullPointerException`
- Không dùng dummy node nên phải viết code riêng cho trường hợp xoá head (Remove Nth Node)
- Không cắt đứt liên kết (`slow.next = null`) khi chia đôi danh sách → tạo cycle khi nối lại
- Dùng `==` so sánh giá trị `Integer` thay vì `int`; ngược lại, khi so sánh **node** thì `==` (so sánh tham chiếu) mới là đúng

## Bài trong chủ đề
- **Reverse Linked List**: Dùng ba biến `prev`, `curr`, `next` để đảo từng liên kết một.
- **Merge Two Sorted Lists**: Dummy node và con trỏ `tail`, mỗi bước nối node nhỏ hơn rồi nối phần dư ở cuối.
- **Linked List Cycle**: Fast đi 2 bước, slow đi 1 bước; nếu gặp nhau thì có cycle (Floyd).
- **Reorder List**: Tìm giữa bằng fast/slow, reverse nửa sau, rồi đan xen hai nửa.
- **Remove Nth Node From End of List**: Dummy node, cho `fast` đi trước `n + 1` bước rồi cùng dịch đến khi `fast == null`, xoá `slow.next`.
- **Copy List with Random Pointer**: Dùng `HashMap<Node, Node>` ánh xạ node cũ → node mới qua hai lượt (tạo node, rồi nối `next`/`random`).
- **Add Two Numbers**: Cộng từng chữ số từ đầu list kèm biến `carry`, dùng dummy node, nhớ xử lý `carry` còn dư cuối cùng.
- **Find the Duplicate Number**: Coi `i → nums[i]` là con trỏ `next`, dùng Floyd tìm điểm bắt đầu của cycle.
- **LRU Cache**: `HashMap<key, Node>` + doubly linked list với hai node giả head/tail; mỗi lần truy cập thì chuyển node về đầu.
- **Merge k Sorted Lists**: `PriorityQueue<ListNode>` theo `val` chứa head của k list, poll node nhỏ nhất rồi offer `node.next` (hoặc chia để trị merge từng cặp).
- **Reverse Nodes in k-Group**: Kiểm tra còn đủ k node chưa, reverse đúng k node rồi nối nhóm trước với nhóm vừa đảo qua con trỏ `groupPrev`.
