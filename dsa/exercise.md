# 算法习题

## 第一章：复杂度分析

### 题目1：斐波那契数列的快速幂
利用 `power2()` 的思想，设计在 $O(\log n)$ 时间内计算 `fib(n)` 的算法。

```cpp
// power2: compute 2^n in O(logn)
long long sqr(long long a) { return a * a; }
long long power2(int n) {
    if (0 == n) return 1;
    return (n & 1) ? sqr(power2(n >> 1)) << 1 : sqr(power2(n >> 1));
}
```

**解答思路**：利用矩阵快速幂：
$$
\begin{pmatrix} 0 & 1 \\ 1 & 1 \end{pmatrix}^n 
\begin{pmatrix} fib(0) \\ fib(1) \end{pmatrix} = 
\begin{pmatrix} fib(n) \\ fib(n+1) \end{pmatrix}
$$
时间复杂度 $O(\log n)$。

### 题目2：更相减损术分析
分析以下代码的时间复杂度：
```cpp
long long gcdCN(long long a, long long b) {
    int r = 0;
    while (!((a & 1) || (b & 1))) { a >>= 1; b >>= 1; r++; }
    while (1) {
        while (!(a & 1)) a >>= 1;
        while (!(b & 1)) b >>= 1;
        (a > b) ? a = a - b : b = b - a;
        if (0 == a) return b << r;
        if (0 == b) return a << r;
    }
}
```
**解答**：时间复杂度 $O(\log(a+b))$，与欧几里得算法相当。

### 题目3：循环移位算法
使用三个翻转操作实现数组的循环移位：
```cpp
int shift2(int* A, int n, int k) {
    k %= n;
    reverse(A, k);
    reverse(A + k, n - k);
    reverse(A, n);
    return 3 * n;
}
```
原理：$(R+L)' = L'+R'$

## 第二章：数组与向量

### 题目1：两数之和
Leetcode 1. 使用哈希表 $O(n)$ 解法：
```cpp
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (mp.count(complement)) return {mp[complement], i};
        mp[nums[i]] = i;
    }
    return {};
}
```

### 题目2：最大子数组和
Leetcode 53. 贪心解法：
```cpp
int maxSubArray(vector<int>& nums) {
    int ans = nums[0], cur = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        cur = max(cur + nums[i], nums[i]);
        ans = max(ans, cur);
    }
    return ans;
}
```

## 第三章：栈与队列

### 题目1：有效的括号
Leetcode 20. 使用栈匹配：
```cpp
bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c=='('||c=='{'||c=='[') st.push(c);
        else {
            if (st.empty()) return false;
            if (c==')'&&st.top()!='(') return false;
            if (c=='}'&&st.top()!='{') return false;
            if (c==']'&&st.top()!='[') return false;
            st.pop();
        }
    }
    return st.empty();
}
```

### 题目2：最小栈
Leetcode 155. 实现 $O(1)$ 获取最小值：
```cpp
class MinStack {
    stack<pair<int,int>> st;
public:
    void push(int x) {
        if (st.empty()) st.push({x, x});
        else st.push({x, min(x, st.top().second)});
    }
    int getMin() { return st.top().second; }
    int top() { return st.top().first; }
    void pop() { st.pop(); }
};
```

## 第四章：链表

### 题目1：反转链表
Leetcode 206. 迭代与递归：
```cpp
ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *curr = head;
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

### 题目2：合并两个有序链表
Leetcode 21:
```cpp
ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) { tail->next = l1; l1 = l1->next; }
        else { tail->next = l2; l2 = l2->next; }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    return dummy.next;
}
```

## 第五章：排序

### 题目1：快速排序优化
三数取中 + 插入排序优化：
```cpp
void quickSort(vector<int>& arr, int low, int high) {
    if (high - low < 10) {
        insertionSort(arr, low, high);
        return;
    }
    int mid = (low + high) >> 1;
    if (arr[low] > arr[mid]) swap(arr[low], arr[mid]);
    if (arr[low] > arr[high]) swap(arr[low], arr[high]);
    if (arr[mid] > arr[high]) swap(arr[mid], arr[high]);
    int pivot = arr[high - 1];
    int i = low, j = high - 1;
    while (true) {
        while (arr[++i] < pivot) {}
        while (arr[--j] > pivot) {}
        if (i < j) swap(arr[i], arr[j]);
        else break;
    }
    swap(arr[i], arr[high - 1]);
    quickSort(arr, low, i - 1);
    quickSort(arr, i + 1, high);
}
```

### 题目2：归并排序求逆序对
Leetcode 315:
```cpp
long long mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return 0;
    int mid = (l + r) >> 1;
    long long cnt = mergeSort(arr, l, mid) + mergeSort(arr, mid+1, r);
    int i = l, j = mid + 1, k = 0;
    vector<int> tmp(r - l + 1);
    while (i <= mid && j <= r) {
        if (arr[i] <= arr[j]) tmp[k++] = arr[i++];
        else { tmp[k++] = arr[j++]; cnt += mid - i + 1; }
    }
    while (i <= mid) tmp[k++] = arr[i++];
    while (j <= r) tmp[k++] = arr[j++];
    for (int p = 0; p < k; p++) arr[l + p] = tmp[p];
    return cnt;
}
```

## 第六章：树

### 题目1：二叉树遍历
- 前序、中序、后序（递归 + 迭代）：
```cpp
// Morris中序 O(1)空间
vector<int> inorderTraversal(TreeNode* root) {
    vector<int> res;
    TreeNode *cur = root, *pre;
    while (cur) {
        if (!cur->left) {
            res.push_back(cur->val);
            cur = cur->right;
        } else {
            pre = cur->left;
            while (pre->right && pre->right != cur) pre = pre->right;
            if (!pre->right) {
                pre->right = cur;
                cur = cur->left;
            } else {
                pre->right = nullptr;
                res.push_back(cur->val);
                cur = cur->right;
            }
        }
    }
    return res;
}
```

### 题目2：验证二叉搜索树
Leetcode 98:
```cpp
bool isValidBST(TreeNode* root, long long mn = LONG_MIN, long long mx = LONG_MAX) {
    if (!root) return true;
    if (root->val <= mn || root->val >= mx) return false;
    return isValidBST(root->left, mn, root->val) && isValidBST(root->right, root->val, mx);
}
```

## 第七章：图

### 题目1：岛屿数量
Leetcode 200. BFS/DFS flood fill:
```cpp
void dfs(vector<vector<char>>& grid, int i, int j) {
    int m = grid.size(), n = grid[0].size();
    if (i<0||j<0||i>=m||j>=n||grid[i][j]=='0') return;
    grid[i][j] = '0';
    dfs(grid, i+1, j); dfs(grid, i-1, j);
    dfs(grid, i, j+1); dfs(grid, i, j-1);
}
int numIslands(vector<vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size(), cnt = 0;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (grid[i][j] == '1') { dfs(grid, i, j); cnt++; }
    return cnt;
}
```

### 题目2：最短路径（Dijkstra）
```cpp
vector<int> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, src}); dist[src] = 0;
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[v] > d + w) {
                dist[v] = d + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
```

## 第八章：动态规划

### 题目1：最长递增子序列
Leetcode 300:
```cpp
int lengthOfLIS(vector<int>& nums) {
    vector<int> dp(nums.size(), 1);
    int ans = 1;
    for (int i = 1; i < nums.size(); i++) {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
        ans = max(ans, dp[i]);
    }
    return ans;
}
```

### 题目2：0-1背包问题
```cpp
int knapSack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<int> dp(W+1, 0);
    for (int i = 0; i < n; i++)
        for (int j = W; j >= wt[i]; j--)
            dp[j] = max(dp[j], dp[j - wt[i]] + val[i]);
    return dp[W];
}
```

## 第九章：字符串

### 题目1：KMP模式匹配
实现KMP搜索：
```cpp
vector<int> computeLPS(const string& pattern) {
    int m = pattern.size();
    vector<int> lps(m, 0);
    for (int i = 1, len = 0; i < m; ) {
        if (pattern[i] == pattern[len]) lps[i++] = ++len;
        else if (len > 0) len = lps[len-1];
        else lps[i++] = 0;
    }
    return lps;
}

int kmpSearch(const string& text, const string& pattern) {
    vector<int> lps = computeLPS(pattern);
    int i = 0, j = 0;
    while (i < (int)text.size() && j < (int)pattern.size()) {
        if (text[i] == pattern[j]) { i++; j++; }
        else if (j > 0) j = lps[j-1];
        else i++;
    }
    return j == pattern.size() ? i - j : -1;
}
```

### 题目2：字符串全排列
带重复字符的去重全排列：
```cpp
void backtrack(vector<string>& res, string& s, int idx) {
    if (idx == s.size()) { res.push_back(s); return; }
    unordered_set<char> used;
    for (int i = idx; i < s.size(); i++) {
        if (used.count(s[i])) continue;
        used.insert(s[i]);
        swap(s[idx], s[i]);
        backtrack(res, s, idx + 1);
        swap(s[idx], s[i]);
    }
}
```

---

This file contains comprehensive algorithm exercises organized by topic. Each problem includes:
- Problem description with Chinese explanation
- C++ implementation with detailed comments
- Algorithmic insight and complexity analysis
- Related Leetcode problem references where applicable