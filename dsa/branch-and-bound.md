# 分支限界法（Branch and Bound）

## 算法思想

### 基本概念
- **分支限界法**（Branch and Bound）是一种用于求解**组合优化问题**的算法框架。
- 通过**搜索**问题的可行解空间，同时利用**上界/下界**（bound）来**剪枝**（pruning），避免无效搜索。
- 与回溯法的区别：回溯法使用深度优先搜索；分支限界法通常使用**广度优先**或**最佳优先**搜索。

### 核心要素
1. **分支（Branch）**：将问题分解为若干子问题
2. **限界（Bound）**：计算子问题的可行解下界（上界），用于剪枝
3. **队列（Queue）**：通常使用FIFO队列存储待扩展的节点

### 解空间树
- 每个节点代表问题的一个状态
- 树的根节点代表空解
- 叶节点代表完整的解

### 搜索策略
1. **FIFO分支限界**：使用队列，按入队顺序扩展节点（类似BFS）
2. **LIFO分支限界**：使用栈，深度优先
3. **优先队列分支限界**：使用优先级队列，按限界值排序（类似Dijkstra的Best-First）

## 经典问题

### 1. 0-1背包问题（分支限界）

```cpp
struct Node {
    int level;      // 当前层
    int profit;     // 当前获得的价值
    int weight;     // 当前总重量
    float bound;    // 价值上界
};

struct cmp {
    bool operator()(Node* a, Node* a2) {
        return a->bound < a2->bound; // 最大堆
    }
};

float calcBound(Node& node, int n, int W, vector<int>& wt, vector<int>& val) {
    float profit = node.profit;
    int weight = node.weight;
    while (weight < W && node.level < n) {
        if (weight + wt[node.level] <= W) {
            profit += val[node.level];
            weight += wt[node.level];
        } else {
            profit += (float)(W - weight) * val[node.level] / wt[node.level];
            break;
        }
        node.level++;
    }
    return profit;
}

int knapsackBranchBound(int W, vector<int>& wt, vector<int>& val) {
    int n = wt.size();
    priority_queue<Node*, vector<Node*>, cmp> pq;
    Node root = {-1, 0, 0, 0};
    root.bound = calcBound(root, n, W, wt, val);
    pq.push(&root);
    int bestProfit = 0;
    
    while (!pq.empty()) {
        Node* node = pq.top(); pq.pop();
        if (node->bound > bestProfit) {
            int level = node->level + 1;
            // 分支：不选择第level个物品
            Node* left = new Node{level, node->profit, node->weight, 0};
            left->bound = calcBound(*left, n, W, wt, val);
            if (left->weight <= W && left->profit > bestProfit) bestProfit = left->profit;
            if (left->bound > bestProfit) pq.push(left);
            
            // 分支：选择第level个物品
            Node* right = new Node{level, node->profit + val[level], node->weight + wt[level], 0};
            right->bound = calcBound(*right, n, W, wt, val);
            if (right->weight <= W && right->profit > bestProfit) bestProfit = right->profit;
            if (right->bound > bestProfit) pq.push(right);
        }
    }
    return bestProfit;
}
```

### 2. 旅行商问题（TSP）的分支限界

```cpp
struct TSPSolution {
    vector<int> path;
    int cost;
};

int tspBranchBound(vector<vector<int>>& dist, int n) {
    int best = INT_MAX;
    priority_queue<pair<int, vector<int>>, vector<pair<int, vector<int>>>, greater<pair<int, vector<int>>>> pq;
    // 初始：只包含起点
    vector<int> start = {0};
    pq.push({dist[0][0], start}); // cost=0, path={0}
    
    while (!pq.empty()) {
        auto [cost, path] = pq.top(); pq.pop();
        if (cost >= best) continue; // 剪枝
        
        if (path.size() == n) {
            // 回到起点
            best = min(best, cost + dist[path.back()][0]);
            continue;
        }
        
        int last = path.back();
        for (int next = 0; next < n; next++) {
            if (find(path.begin(), path.end(), next) != path.end()) continue;
            int newCost = cost + dist[last][next];
            if (newCost < best) {
                vector<int> newPath = path;
                newPath.push_back(next);
                pq.push({newCost, newPath});
            }
        }
    }
    return best;
}
```

### 3. 装载问题（Loading Problem）

```cpp
struct LoadingNode {
    int level;
    int weight;
    int profit;
    float bound;
};

float calcLoadingBound(LoadingNode& node, int n, int W, vector<int>& w) {
    float bound = node.profit;
    int weight = node.weight;
    for (int i = node.level + 1; i < n; i++)
        weight += w[i];
    return bound + weight; // 能装入的最大价值上界
}

int maxLoading(vector<int>& w, int W) {
    int n = w.size();
    priority_queue<pair<int, LoadingNode*>> pq; // (bound, node)
    
    LoadingNode root = {-1, 0, 0, 0};
    root.bound = calcLoadingBound(root, n, W, w);
    pq.push({root.bound, &root});
    
    int best = 0;
    while (!pq.empty()) {
        auto [bound, node] = pq.top(); pq.pop();
        if (bound <= best) continue;
        
        int level = node->level + 1;
        // 分支1：不装第level个箱子
        LoadingNode* left = new LoadingNode{level, node->weight, node->profit, 0};
        left->bound = calcLoadingBound(*left, n, W, w);
        if (left->weight <= W && left->profit > best) best = left->profit;
        if (left->bound > best) pq.push({left->bound, left});
        
        // 分支2：装第level个箱子
        LoadingNode* right = new LoadingNode{level, node->weight + w[level], node->profit + w[level], 0};
        right->bound = calcLoadingBound(*right, n, W, w);
        if (right->weight <= W && right->profit > best) best = right->profit;
        if (right->bound > best) pq.push({right->bound, right});
    }
    return best;
}
```

### 4. 旅行商问题的其他分支限界优化

```cpp
// 使用reduced cost matrix计算更紧的界
class ReducedMatrix {
public:
    int n;
    vector<vector<int>> mat;
    
    int reduce() {
        int cost = 0;
        for (int i = 0; i < n; i++) {
            int rowMin = INT_MAX;
            for (int j = 0; j < n; j++) rowMin = min(rowMin, mat[i][j]);
            if (rowMin == INT_MAX) rowMin = 0;
            for (int j = 0; j < n; j++) mat[i][j] -= rowMin;
            cost += rowMin;
        }
        for (int j = 0; j < n; j++) {
            int colMin = INT_MAX;
            for (int i = 0; i < n; i++) colMin = min(colMin, mat[i][j]);
            if (colMin == INT_MAX) colMin = 0;
            for (int i = 0; i < n; i++) mat[i][j] -= colMin;
            cost += colMin;
        }
        return cost;
    }
};
```

### 5. 批处理作业调度（Job Scheduling）

```cpp
struct JobNode {
    int level;
    int profit;
    int time;
    float bound;
};

struct Job {
    int t1, t2;
};

float calcJobBound(JobNode& node, int n, vector<Job>& jobs) {
    float bound = node.profit;
    int time = node.time;
    for (int i = node.level + 1; i < n; i++) {
        bound += max(jobs[i].t1, jobs[i].t2);
        time += min(jobs[i].t1, jobs[i].t2);
    }
    return bound;
}
```

## 限界函数的设计

### 1. 基于贪心的界
使用贪心算法快速得到一个可行解，作为上界/下界。

### 2. 基于松弛的界
将原问题的整数约束松弛为连续约束，求解松弛问题得到界。

### 3. 基于成本矩阵的界
旅行商问题中，对行和列进行归约，得到的归约成本作为下界。

## 分支限界的实现技巧

```cpp
// 1. 使用结构体表示节点
struct BBNode {
    int level;         // 当前深度
    int profit;        // 当前利润
    int weight;        // 当前重量
    float bound;       // 界限值
    vector<int> path;  // 当前路径
};

// 2. 自定义比较器实现优先队列
struct BoundCmp {
    bool operator()(const BBNode* a, const BBNode* b) const {
        return a->bound < b->bound; // 最大堆
    }
};

// 3. 记忆化剪枝（类似动态规划）
unordered_map<string, int> memo; // state -> best value from this state

bool shouldPrune(int level, int profit, int weight) {
    // 检查是否已经搜索过相同状态
    // ...
}
```

## 优先队列分支限界框架

```cpp
template<typename Node>
class BranchAndBound {
    priority_queue<pair<float, Node*>, vector<pair<float, Node*>>, greater<pair<float, Node*>>> pq;
    
public:
    int solve(Node start, int n) {
        int best = 0;
        pq.push({start.bound(), &start});
        
        while (!pq.empty()) {
            auto [bound, node] = pq.top(); pq.pop();
            if (bound <= best) continue;
            
            if (isGoal(node)) {
                best = max(best, getValue(node));
                continue;
            }
            
            for (Node* child : expand(node)) {
                if (isPromising(child, best)) {
                    child->updateBound();
                    pq.push({child->bound, child});
                }
            }
        }
        return best;
    }
};
```

## 与回溯法的对比

| 特性 | 回溯法 | 分支限界法 |
|------|--------|----------|
| 搜索策略 | 深度优先 | 广度优先/最佳优先 |
| 解空间 | 前缀树 | 解空间树 |
| 剪枝策略 | 约束剪枝、限界剪枝 | 限界函数剪枝 |
| 主要应用 | 求解全部解 | 求解最优解 |
| 结点存储 | 栈（递归） | 队列/优先队列 |
| 限界函数 | 可选 | 通常必须 |