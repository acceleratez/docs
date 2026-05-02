# 动态规划（Dynamic Programming, DP）

## 动态规划概述

### 核心思想
- 将原问题分解为**相互重叠**的子问题，通过**记忆化**避免重复计算。
- 适用于**最优子结构**和**重叠子问题**的问题。
- 通常用**自底向上**或**自顶向下+记忆化**的方式求解。

### 适用条件
1. **最优子结构**：问题的最优解包含其子问题的最优解
2. **重叠子问题**：子问题可能被多次计算

### 基本步骤
1. 确定**状态表示**：$dp[i]$ 或 $dp[i][j]$ 的含义
2. 确立**状态转移方程**：如何从子问题推导当前问题
3. 确定**初始状态**和**边界条件**
4. 确定**遍历顺序**（自底向上或自顶向下）
5. 优化空间复杂度

## 经典问题

### 1. 斐波那契数列
```cpp
// 自底向上
int fib(int n) {
    if (n <= 1) return n;
    vector<int> dp(n+1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}
// 空间优化 O(1)
int fib_optimized(int n) {
    if (n <= 1) return n;
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int cur = prev1 + prev2;
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}
```

### 2. 爬楼梯
Leetcode 70：
```cpp
int climbStairs(int n) {
    if (n <= 2) return n;
    int dp[3] = {0, 1, 2};
    for (int i = 3; i <= n; i++) {
        dp[i%3] = dp[(i-1)%3] + dp[(i-2)%3];
    }
    return dp[n%3];
}
```

### 3. 经典DP序列

#### 最长递增子序列（LIS）
Leetcode 300：
```cpp
int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);
    int ans = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i])
                dp[i] = max(dp[i], dp[j] + 1);
        ans = max(ans, dp[i]);
    }
    return ans;
}
// 二分优化 O(n log n)
int lengthOfLISBinary(vector<int>& nums) {
    vector<int> tail;
    for (int x : nums) {
        auto it = lower_bound(tail.begin(), tail.end(), x);
        if (it == tail.end()) tail.push_back(x);
        else *it = x;
    }
    return tail.size();
}
```

#### 最长公共子序列（LCS）
```cpp
int longestCommonSubsequence(string text1, string text2) {
    int m = text1.size(), n = text2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i-1] == text2[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}
```
时间复杂度：$O(mn)$，空间可用两行优化至 $O(\min(m,n))$。

#### 编辑距离
Leetcode 72：
```cpp
int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i-1] == word2[j-1])
                dp[i][j] = dp[i-1][j-1];
            else
                dp[i][j] = min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]}) + 1;
        }
    }
    return dp[m][n];
}
```

### 4. 0-1背包问题

#### 基础版本
```cpp
int knapsack01(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i-1][w];
            if (w >= wt[i-1])
                dp[i][w] = max(dp[i][w], dp[i-1][w-wt[i-1]] + val[i-1]);
        }
    }
    return dp[n][W];
}
// 空间优化 O(W)
int knapsack01Space(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<int> dp(W+1, 0);
    for (int i = 0; i < n; i++)
        for (int w = W; w >= wt[i]; w--)
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[W];
}
```

#### 恰好装满的背包
初始化时将 $dp[0] = 0$，其余 $dp[j] = -\infty$。

### 5. 完全背包问题
每种物品有无限个：
```cpp
int completeKnapsack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<int> dp(W+1, 0);
    for (int i = 0; i < n; i++)
        for (int w = wt[i]; w <= W; w++)
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[W];
}
```
注意：完全背包的内层循环是**从小到大**遍历（正序），0-1背包是**从大到小**遍历（倒序）。

### 6. 多重背包问题
每种物品有有限数量：
```cpp
int multiKnapsack(int W, vector<int>& wt, vector<int>& val, vector<int>& cnt, int n) {
    vector<int> dp(W+1, 0);
    for (int i = 0; i < n; i++) {
        for (int k = 1; k <= cnt[i]; k++)
            for (int w = W; w >= wt[i]; w--)
                dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
    }
    return dp[W];
}
```
可优化为单调队列优化（物品数量大时）。

### 7. 区间DP

#### 石子合并
Leetcode 1000 / POJ 1080：
```cpp
int stoneMerge(vector<int>& stones) {
    int n = stones.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    vector<int> prefix(n+1, 0);
    for (int i = 0; i < n; i++) prefix[i+1] = prefix[i] + stones[i];
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len <= n; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k < j; k++)
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j] + prefix[j+1] - prefix[i]);
        }
    }
    return dp[0][n-1];
}
```
时间复杂度：$O(n^3)$，空间可优化至 $O(n)$（使用长度维度的滚动数组）。

#### 最优搜索二叉树
```cpp
// 给定概率p[1..n]，构造BST使搜索代价最小
int optimalBST(vector<double>& p, int n) {
    vector<vector<int>> dp(n+2, vector<int>(n+1, 0));
    for (int len = 1; len <= n; len++) {
        for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k <= j; k++) {
                int cost = dp[i][k-1] + dp[k+1][j];
                for (int t = i; t <= j; t++) cost += (int)p[t];
                dp[i][j] = min(dp[i][j], cost);
            }
        }
    }
    return dp[1][n];
}
```

### 8. 状态压缩DP

#### 旅行商问题（TSP）
```cpp
int tsp(int n, vector<vector<int>>& dist) {
    int N = 1 << n;
    vector<vector<int>> dp(N, vector<int>(n, INT_MAX));
    dp[1][0] = 0; // 从城市0出发，城市0已访问
    for (int mask = 1; mask < N; mask++) {
        for (int u = 0; u < n; u++) {
            if (!(mask & (1 << u)) || dp[mask][u] == INT_MAX) continue;
            for (int v = 0; v < n; v++) {
                if (mask & (1 << v)) continue;
                int nextMask = mask | (1 << v);
                dp[nextMask][v] = min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
            }
        }
    }
    int fullMask = (1 << n) - 1;
    int ans = INT_MAX;
    for (int u = 1; u < n; u++)
        ans = min(ans, dp[fullMask][u] + dist[u][0]);
    return ans;
}
```
时间复杂度：$O(n^2 2^n)$，空间 $O(n 2^n)$。

#### 蒙德里安的梦想
```cpp
int countWays(int n, int m) {
    vector<long long> dp(1 << m, 0);
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
        }
    }
    return dp[0];
}
```

### 9. 树形DP

#### 二叉树中的最大路径和
Leetcode 124：
```cpp
int maxPathSum(TreeNode* root) {
    int ans = INT_MIN;
    function<int(TreeNode*)> dfs = [&](TreeNode* node) {
        if (!node) return 0;
        int left = max(0, dfs(node->left));
        int right = max(0, dfs(node->right));
        ans = max(ans, left + right + node->val);
        return max(left, right) + node->val;
    };
    dfs(root);
    return ans;
}
```

#### 树形背包
```cpp
// 在以root为根的子树中选j个节点的最大权重
void dfs(int u, int parent) {
    for (int v : children[u]) {
        if (v == parent) continue;
        dfs(v, u);
        for (int i = sz[u]; i >= 0; i--) {
            for (int j = 0; j <= sz[v]; j++) {
                dp[u][i+j] = max(dp[u][i+j], dp[u][i] + dp[v][j]);
            }
        }
        sz[u] += sz[v];
    }
}
```

### 10. 数位DP

#### 统计[L,R]内满足条件的数的个数
```cpp
class DigitDP {
    vector<int> digits;
    long long memo[20][2][2];
    
public:
    long long count(int num) {
        digits.clear();
        while (num > 0) { digits.push_back(num % 10); num /= 10; }
        reverse(digits.begin(), digits.end());
        memset(memo, -1, sizeof(memo));
        return dfs(0, 1, 1);
    }
    
    long long dfs(int pos, int tight, int leadzero) {
        if (pos == digits.size()) return 1;
        long long& res = memo[pos][tight][leadzero];
        if (res != -1) return res;
        res = 0;
        int limit = tight ? digits[pos] : 9;
        for (int d = 0; d <= limit; d++) {
            int nextTight = tight && (d == limit);
            int nextLead = leadzero && (d == 0);
            res += dfs(pos + 1, nextTight, nextLead);
        }
        return res;
    }
};
```

#### 包含特定数字的个数
```cpp
// 统计包含数字2的个数
long long countWithDigit2(int n) {
    vector<int> digits;
    while (n > 0) { digits.push_back(n % 10); n /= 10; }
    reverse(digits.begin(), digits.end());
    long long ans = 0, pow10 = 1;
    for (int i = digits.size() - 1; i >= 0; i--) {
        int cur = digits[i];
        ans += cur * pow10;
        pow10 *= 10;
    }
    return ans;
}
```

## DP优化技巧

### 1. 空间优化
- **滚动数组**：$dp[i][j]$ 只依赖 $dp[i-1][*]$ 时，用两行或一行
- **压缩维度**：多维DP中去除不必要的维度

### 2. 单调队列优化
适用于DP方程形如 $dp[i] = \max_{j < i} (dp[j] + f(i-j))$ 的情况：
```cpp
// 单调队列维护最大值
deque<int> dq;
for (int i = 0; i < n; i++) {
    while (!dq.empty() && dp[dq.back()] <= dp[i]) dq.pop_back();
    dq.push_back(i);
    while (!dq.empty() && dq.front() < i - k) dq.pop_front();
}
```

### 3. 斜率优化
适用于 $dp[i] = \min_{j < i} (dp[j] + b_j * a_i)$ 形式的转移：
利用凸包维护下凸包凸壳，通过二分查找得到最优决策点。

### 4. 矩阵快速幂
适用于线性递推（如斐波那契、序列DP）：
```cpp
struct Matrix {
    long long a[3][3];
    Matrix operator*(const Matrix& o) const {
        Matrix r;
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 3; j++) {
                r.a[i][j] = 0;
                for (int k = 0; k < 3; k++)
                    r.a[i][j] += a[i][k] * o.a[k][j];
            }
        return r;
    }
};
```
