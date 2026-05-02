# 贪心算法（Greedy Algorithm）

## 贪心算法概述

### 基本思想
- 贪心算法在每一步都做出**局部最优**的选择，期望通过一系列局部最优的选择达到**全局最优**。
- 贪心算法不保证总是最优解，但对某些问题确实能得到最优解。
- 关键：证明**贪心选择性质**（每一步的最优选择可以累积成全局最优）和**最优子结构**。

### 适用条件
1. **贪心选择性质**：局部最优选择能导致全局最优解
2. **最优子结构**：问题的最优解包含其子问题的最优解

### 基本步骤
1. 将问题分解为若干子问题
2. 选择当前状态下的最优解
3. 基于该选择，缩小问题规模
4. 递归求解子问题

## 常见问题类型

### 1. 活动选择问题（Activity Selection）
**问题描述**：选择最大数量的不重叠活动。

**贪心策略**：选择结束时间最早的活动

```cpp
struct Activity {
    int start, end;
};

int activitySelection(vector<Activity>& activities) {
    sort(activities.begin(), activities.end(), 
        [](const Activity& a, const Activity& b) {
            return a.end < b.end;
        });
    int count = 0;
    int lastEnd = -1;
    for (const auto& a : activities) {
        if (a.start >= lastEnd) {
            count++;
            lastEnd = a.end;
        }
    }
    return count;
}
```
时间复杂度：$O(n \log n)$（排序）

### 2. 区间调度问题
**问题**：给定 $n$ 个区间，选出最大数量的不相交区间。
**贪心策略**：选择结束时间最早的区间

```cpp
int intervalScheduling(vector<pair<int,int>>& intervals) {
    sort(intervals.begin(), intervals.end(),
        [](auto& a, auto& b){ return a.second < b.second; });
    int count = 0, lastEnd = INT_MIN;
    for (auto& p : intervals) {
        if (p.first >= lastEnd) {
            count++;
            lastEnd = p.second;
        }
    }
    return count;
}
```

### 3. 钱币找零问题
**问题**：用最少数量的纸币找零。
**策略**：优先使用面额最大的纸币（适用特定面额系统）

```cpp
int minCoins(int amount, const vector<int>& coins) {
    sort(coins.rbegin(), coins.rend());
    int count = 0;
    for (int c : coins) {
        count += amount / c;
        amount %= c;
    }
    return count;
}
```
**注意**：对于通用面额系统，贪心可能得不到最优解。

### 4. 分数背包问题（Fractional Knapsack）
**问题**：可以取物品的一部分，求最大价值。

**贪心策略**：按单位价值（$value/weight$）排序，依次选取。

```cpp
struct Item {
    int value, weight;
    double ratio;
};

double fractionalKnapsack(vector<Item>& items, int capacity) {
    sort(items.begin(), items.end(),
        [](const Item& a, const Item& b) {
            return a.ratio > b.ratio;
        });
    double total = 0.0;
    for (const auto& item : items) {
        if (capacity >= item.weight) {
            total += item.value;
            capacity -= item.weight;
        } else {
            total += item.ratio * capacity;
            break;
        }
    }
    return total;
}
```
时间复杂度：$O(n \log n)$，一定能得到最优解。

### 5. Huffman编码
**问题**：构造最优前缀编码树，使编码长度最短。

**贪心策略**：使用最小堆，每次合并两个最小权值的节点。

```cpp
struct HuffmanNode {
    char ch;
    int freq;
    HuffmanNode *left, *right;
};

struct Compare {
    bool operator()(HuffmanNode* a, HuffmanNode* b) {
        return a->freq > b->freq;
    }
};

HuffmanNode* buildHuffmanTree(const unordered_map<char,int>& freqMap) {
    priority_queue<HuffmanNode*, vector<HuffmanNode*>, Compare> pq;
    for (auto p : freqMap) {
        pq.push(new HuffmanNode{p.first, p.second, nullptr, nullptr});
    }
    while (pq.size() > 1) {
        HuffmanNode* left = pq.top(); pq.pop();
        HuffmanNode* right = pq.top(); pq.pop();
        HuffmanNode* parent = new HuffmanNode{'$', left->freq + right->freq, left, right};
        pq.push(parent);
    }
    return pq.top();
}

void encode(HuffmanNode* root, string code, unordered_map<char,string>& huffmanCode) {
    if (!root) return;
    if (!root->left && !root->right) {
        huffmanCode[root->ch] = code;
        return;
    }
    encode(root->left, code + "0", huffmanCode);
    encode(root->right, code + "1", huffmanCode);
}
```
时间复杂度：$O(n \log n)$

### 6. 单源最短路径（Dijkstra）
```cpp
vector<int> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, src});
    dist[src] = 0;
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
时间复杂度：$O((V+E)\log V)$，不适用于负权边。

### 7. 最小生成树（MST）

#### Prim算法
```cpp
vector<vector<pair<int,int>>> adj(n);
vector<int> minEdge(n, INT_MAX);
vector<bool> visited(n, false);
minEdge[0] = 0;
int result = 0;
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
pq.push({0, 0});
while (!pq.empty()) {
    auto [w, u] = pq.top(); pq.pop();
    if (visited[u]) continue;
    visited[u] = true;
    result += w;
    for (auto [v, weight] : adj[u]) {
        if (!visited[v] && weight < minEdge[v]) {
            minEdge[v] = weight;
            pq.push({weight, v});
        }
    }
}
```

#### Kruskal算法
```cpp
struct Edge { int u, v, w; };
int find(vector<int>& parent, int x) {
    return parent[x] == x ? x : parent[x] = find(parent, parent[x]);
}
int kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a.w < b.w; });
    vector<int> parent(n);
    for (int i = 0; i < n; i++) parent[i] = i;
    int sum = 0;
    for (auto& e : edges) {
        int pu = find(parent, e.u), pv = find(parent, e.v);
        if (pu != pv) {
            parent[pu] = pv;
            sum += e.w;
        }
    }
    return sum;
}
```

### 8. 背包问题的贪心失败例子
```cpp
// 贪心解法：按单位价值选
// 物品1: 重量10, 价值60, 单位价值6
// 物品2: 重量20, 价值100, 单位价值5
// 容量50：贪心选物品1，再选物品2的40%，总价值60+50=110
// 最优解：选物品2（价值100），剩余容量40选物品1的40（4/10*60=24），总价值124
// 贪心失败！
```

## 贪心算法的证明方法

### 1. 交换论证（Exchange Argument）
证明：任何最优解都可以通过一系列局部交换，转化为贪心解，且不降低解的质量。

### 2. 归纳论证（Induction）
- 基础情况：$n=1$ 时显然成立
- 归纳假设：对于规模 $< n$ 的问题，贪心是最优的
- 归纳步骤：证明对于规模 $n$，贪心选择后，剩余子问题仍然满足贪心适用条件

### 3. 界分析（Bounding）
证明贪心解与最优解的差距上界。
