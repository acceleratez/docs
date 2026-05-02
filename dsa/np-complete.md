# NP完全性理论（NP-Completeness）

## 计算复杂性概述

### 问题分类

1. **P问题**：可以在多项式时间内解决（确定性图灵机）
2. **NP问题**：可以在多项式时间内验证一个解
3. **NPC（NP完全）问题**：是NP问题中最难的问题
4. **NPH（NP难）问题**：至少和NPC一样难

关系：$P \subseteq NP$，但 $P = NP$ 是否成立尚未知。

### 多项式时间归约

如果问题 $A$ 可以在多项式时间内归约到问题 $B$（记作 $A \leq_p B$），则：

- 若 $B \in P$，则 $A \in P$
- 若 $A$ 是NP难问题，则 $B$ 也是NP难问题

## P类问题

### 排序问题

- 时间复杂度：$O(n \log n)$
- 算法：快速排序、归并排序、堆排序

### 最短路径

- Dijkstra算法：$O((V+E)\log V)$（非负权）
- Bellman-Ford：$O(VE)$（可处理负权）

### 最小生成树

- Prim算法：$O((V+E)\log V)$
- Kruskal算法：$O(E \log V)$

## NP类问题

### 问题的非确定性算法

非确定性算法可以在多项式时间内"猜测"一个解，然后验证。

## NP完全问题

### 21个经典NPC问题

#### 1. 布尔可满足性（SAT）

判断一个布尔公式是否可满足。

- 3-SAT：每个子句恰有3个文字
- 2-SAT：有多项式解法

```cpp
struct TwoSAT {
    int n;
    vector<vector<int>> adj, radj;
    vector<int> comp, order, assignment;
    
    TwoSAT(int n) : n(n) {
        adj.assign(2*n, {});
        radj.assign(2*n, {});
    }
    
    void addImplication(int i, bool f, int j, bool g) {
        int a = 2*i ^ f, b = 2*j ^ g;
        adj[a].push_back(b);
        radj[b].push_back(a);
    }
    
    bool satisfiable() {
        order.clear();
        comp.assign(2*n, -1);
        for (int v = 0; v < 2*n; v++)
            if (comp[v] == -1) dfs1(v);
        int cnt = 0;
        for (int v : reverse(order))
            if (comp[v] == -1) dfs2(v, cnt++);
        assignment.assign(n, 0);
        for (int i = 0; i < n; i++)
            if (comp[2*i] == comp[2*i+1]) return false;
            else assignment[i] = comp[2*i] < comp[2*i+1];
        return true;
    }
    
private:
    void dfs1(int v) {
        comp[v] = 1;
        for (int to : adj[v])
            if (comp[to] == -1) dfs1(to);
        order.push_back(v);
    }
    
    void dfs2(int v, int c) {
        comp[v] = c;
        for (int to : radj[v])
            if (comp[to] == -1) dfs2(to, c);
    }
};
```

#### 2. 顶点覆盖（Vertex Cover）

在无向图中找到最小规模的顶点覆盖。

```cpp
vector<int> vertexCoverApprox(int n, vector<vector<int>>& adj) {
    vector<bool> covered(n, false);
    vector<int> cover;
    for (int u = 0; u < n; u++) {
        if (covered[u]) continue;
        for (int v : adj[u]) {
            if (covered[v]) continue;
            cover.push_back(u);
            cover.push_back(v);
            covered[u] = covered[v] = true;
            break;
        }
    }
    return cover;
}
```

#### 3. 团问题（Clique）

在无向图中找到最大规模的完全子图（团）。

```cpp
vector<int> maxCliqueBrute(vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> best;
    for (int mask = 1; mask < (1<<n); mask++) {
        vector<int> clique;
        for (int i = 0; i < n; i++) if (mask & (1<<i)) {
            bool valid = true;
            for (int j : clique)
                if (!adj[i][j]) { valid = false; break; }
            if (valid) clique.push_back(i);
        }
        if (clique.size() > best.size()) best = clique;
    }
    return best;
}
```

#### 4. 哈密顿回路（Hamiltonian Cycle）

判断一个图是否存在经过每个顶点恰好一次的回路。

#### 5. 旅行商问题（TSP）

NP难。判定版本是NPC的。

```cpp
double tsp2Approx(vector<vector<double>>& dist) {
    int n = dist.size();
    vector<pair<double,int>> key(n, {1e18, -1});
    vector<bool> visited(n, false);
    key[0].first = 0;
    double mstCost = 0;
    for (int i = 0; i < n; i++) {
        int u = -1;
        for (int v = 0; v < n; v++)
            if (!visited[v] && (u == -1 || key[v].first < key[u].first))
                u = v;
        visited[u] = true;
        mstCost += key[u].first;
        for (int v = 0; v < n; v++)
            if (!visited[v] && dist[u][v] < key[v].first)
                key[v] = {dist[u][v], u};
    }
    vector<int> euler;
    vector<vector<pair<int,double>>> mstAdj(n);
    for (int i = 1; i < n; i++) {
        mstAdj[i].push_back({key[i].second, dist[i][key[i].second]});
        mstAdj[key[i].second].push_back({i, dist[i][key[i].second]});
    }
    vector<int> stack = {0};
    vector<int> order;
    while (!stack.empty()) {
        int u = stack.back();
        bool found = false;
        while (!mstAdj[u].empty()) {
            auto [v, w] = mstAdj[u].back();
            mstAdj[u].pop_back();
            if (w < 0) continue;
            for (auto& e : mstAdj[v])
                if (e.first == u) e.second = -1;
            stack.push_back(v);
            found = true;
            break;
        }
        if (!found) {
            order.push_back(u);
            stack.pop_back();
        }
    }
    vector<bool> seen(n, false);
    double tspCost = 0;
    int prev = -1;
    for (int v : order) {
        if (!seen[v]) {
            if (prev != -1) tspCost += dist[prev][v];
            seen[v] = true;
        }
        prev = v;
    }
    tspCost += dist[prev][0];
    return tspCost;
}
```

#### 6. 子集和问题（Subset Sum）

给定集合和目标和，判断是否存在子集和等于目标和。时间复杂度：$O(n \times \text{sum})$

```cpp
bool subsetSum(vector<int>& nums, int target) {
    int n = nums.size();
    vector<bool> dp(target+1, false);
    dp[0] = true;
    for (int x : nums) {
        for (int s = target; s >= x; s--)
            dp[s] = dp[s] || dp[s-x];
    }
    return dp[target];
}
```

#### 7. 划分问题（Partition）

判断是否可以分成两个和相等的子集。$O(n \times \text{sum})$

```cpp
bool canPartition(vector<int>& nums) {
    int sum = accumulate(nums.begin(), nums.end(), 0);
    if (sum % 2) return false;
    return subsetSum(nums, sum/2);
}
```

#### 8. 背包问题（Knapsack）

0-1背包是NP完全的（判定版本）。

```cpp
int knapsackPseudoPoly(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<int> dp(W+1, 0);
    for (int i = 0; i < n; i++)
        for (int w = W; w >= wt[i]; w--)
            dp[w] = max(dp[w], dp[w-wt[i]] + val[i]);
    return dp[W];
}
```

#### 9. 恰好覆盖（Exact Cover）

**精确覆盖问题**（Exact Cover）是NPC的。跳舞链（Dancing Links）可高效求解。

```cpp
struct DLX {
    int n, m, head, size;
    vector<int> L, R, U, D, col, row, S;
    
    DLX(int n, int m) : n(n), m(m) {
        L.resize(m+1);
        R.resize(m+1);
        U.resize(m+1);
        D.resize(m+1);
        col.resize(m+1);
        row.resize(m+1);
        S.resize(m+1);
        for (int i = 0; i <= m; i++) {
            L[i] = (i == 0) ? m : i-1;
            R[i] = (i == m) ? 0 : i+1;
            U[i] = D[i] = i;
        }
        head = 0;
        size = m+1;
    }
    
    void addRow(int r, const vector<int>& columns) {
        int first = -1;
        for (int c : columns) {
            int node = size++;
            row[node] = r;
            col[node] = c;
            U[node] = U[c];
            D[node] = c;
            D[U[c]] = node;
            U[c] = node;
            S[c]++;
            if (first == -1) {
                first = node;
                L[node] = R[node] = node;
            } else {
                L[node] = L[first];
                R[node] = first;
                L[first] = node;
                R[L[first]] = node;
            }
        }
    }
    
    void remove(int c) {
        L[R[c]] = L[c];
        R[L[c]] = R[c];
        for (int i = D[c]; i != c; i = D[i])
            for (int j = R[i]; j != i; j = R[j]) {
                U[D[j]] = U[j];
                D[U[j]] = D[j];
                S[col[j]]--;
            }
    }
    
    void resume(int c) {
        for (int i = U[c]; i != c; i = U[i])
            for (int j = L[i]; j != i; j = L[j]) {
                S[col[j]]++;
                U[D[j]] = j;
                D[U[j]] = j;
            }
        L[R[c]] = c;
        R[L[c]] = c;
    }
    
    bool search(int k, vector<int>& ans) {
        if (R[head] == head) return true;
        int c;
        int minS = INT_MAX;
        for (int j = R[head]; j != head; j = R[j])
            if (S[j] < minS) { minS = S[j]; c = j; }
        remove(c);
        for (int i = D[c]; i != c; i = D[i]) {
            ans.push_back(row[i]);
            for (int j = R[i]; j != i; j = R[j]) remove(col[j]);
            if (search(k+1, ans)) return true;
            for (int j = L[i]; j != i; j = L[j]) resume(col[j]);
            ans.pop_back();
        }
        resume(c);
        return false;
    }
};
```

#### 10. 3-着色（3-Color）

判断一个图是否可以用3种颜色着色。

```cpp
bool graph3Colorable(vector<vector<int>>& adj) {
    int n = adj.size();
    for (int mask = 0; mask < (1 << (2*n)); mask++) {
        vector<int> color(n, -1);
        bool valid = true;
        for (int i = 0; i < n && valid; i++) {
            int c1 = (mask >> (2*i)) & 3;
            int c2 = (mask >> (2*i+1)) & 1;
            int c = c1 + 2*c2;
            if (c == 0 || c >= 3) { valid = false; break; }
            color[i] = c;
            for (int j : adj[i])
                if (color[j] == c) { valid = false; break; }
        }
        if (valid) {
            bool allAssigned = true;
            for (int i = 0; i < n; i++)
                if (color[i] == -1) { allAssigned = false; break; }
            if (allAssigned) return true;
        }
    }
    return false;
}
```

## NPC问题的处理策略

### 1. 精确算法（指数级）

- **回溯搜索**：最坏情况 $O(n!)$
- **分支限界**：剪枝加速
- **动态规划**：$O(2^n n)$ 或 $O(n 2^n)$

### 2. 近似算法

- **常数近似比**：如TSP的2-近似
- **多项式时间近似方案（PTAS）**
- **完全多项式时间近似方案（FPTAS）**

```cpp
int fptasSubsetSum(vector<int>& nums, int W, double eps) {
    int n = nums.size();
    int L = *max_element(nums.begin(), nums.end());
    int K = max(1, (int)(n * log(L) / eps));
    vector<double> DP(2*K + 1, 0);
    DP[0] = 1;
    for (int x : nums) {
        vector<double> newDP(DP.size(), 0);
        for (int j = 0; j < (int)DP.size(); j++) {
            if (DP[j] > 0) {
                int nj = min((int)DP.size()-1, j + (int)(x * K / W));
                newDP[j] = max(newDP[j], DP[j]);
                newDP[nj] = max(newDP[nj], DP[j] * (1 - eps/n));
            }
        }
        DP.swap(newDP);
    }
    for (int s = W; s >= 0; s--) {
        int idx = (int)(s * K / W);
        if (idx < (int)DP.size() && DP[idx] > 0) return s;
    }
    return 0;
}
```

### 3. 参数化算法

如果某个参数 $k$ 较小，可以使用 $O(2^k \cdot n)$ 的算法。

```cpp
int vertexCoverFPT(int k, vector<vector<int>>& adj, int n) {
    for (int mask = 0; mask < (1<<n) && __builtin_popcount(mask) <= k; mask++) {
        bool ok = true;
        for (int u = 0; u < n && ok; u++)
            for (int v : adj[u])
                if (v > u && !(mask & (1<<u)) && !(mask & (1<<v)))
                    ok = false;
        if (ok) return mask;
    }
    return -1;
}
```

### 4. 启发式算法

局部搜索、遗传算法、模拟退火等（参见其他章节）。

## P vs NP问题

### 核心问题

- $P = NP$ 还是 $P \neq NP$？
- 这是计算机科学中最重要的未解问题之一

### Cook-Levin定理（1971）

布尔可满足性（SAT）问题是第一个被证明的NPC问题。

### Karp的21个NPC问题（1972）

证明了21个经典问题的NP完全性，包括顶点覆盖、团问题、哈密顿回路等。

## 归约技巧

### 1. 从已知NPC问题归约

- 3-SAT → 0-1整数规划
- 3-SAT → 图的顶点覆盖
- 顶点覆盖 → 团的补问题
- 划分问题 → 子集和

### 2. 限制法

将一般问题限制到特殊形式（如2-SAT有多项式解法）。

```cpp
bool twoSatSCC(int n, vector<pair<int,int>>& clauses) {
    TwoSAT solver(n);
    for (auto& p : clauses) {
        int u = abs(p.first) - 1;
        bool val1 = p.first > 0;
        int v = abs(p.second) - 1;
        bool val2 = p.second > 0;
        solver.addImplication(u, !val1, v, val2);
        solver.addImplication(v, !val2, u, val1);
    }
    return solver.satisfiable();
}
```