# 近似算法（Approximation Algorithms）

## 算法思想

### 基本概念

- 近似算法用于求解**NP难问题**（特别是优化问题），在**多项式时间**内给出近似解。
- 核心指标：**近似比**（Approximation Ratio），保证解的质量与最优解的差距。

### 近似比定义

对于一个最小化问题，算法 $A$ 的近似比为 $\rho$ 当且仅当：

$$
\frac{A(I)}{OPT(I)} \leq \rho, \quad \forall I
$$

对于最大化问题：

$$
\frac{OPT(I)}{A(I)} \leq \rho, \quad \forall I
$$

### 分类

1. **常数近似比**：如 $\rho = 2$, $\rho = 1.5$
2. **多项式时间近似方案（PTAS）**：对于任意 $\epsilon > 0$，存在 $(1+\epsilon)$-近似的多项式算法
3. **完全多项式时间近似方案（FPTAS）**：时间复杂度为 $O(n^2 / \epsilon)$

## 顶点覆盖问题（Vertex Cover）

### 2-近似算法

```cpp
vector<int> vertexCover2Approx(vector<vector<int>>& adj, int n) {
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

近似比：$\rho = 2$

**证明**：

设 $C$ 为算法输出的解，$C^*$ 为最优解。

- 每个被选择的边 $(u,v)$ 对应算法选择两个顶点
- $C$ 中的顶点集合覆盖了所有被选择的边
- 每个最优解 $C^*$ 中的顶点最多覆盖一条这样的边
- 因此 $|C| \leq 2|C^*|$

### 贪心算法的反例

```cpp
vector<int> vertexCoverGreedyBad(vector<vector<int>>& adj, int n) {
    vector<bool> inCover(n, false);
    vector<int> cover;
    vector<int> degree(n);
    for (int i = 0; i < n; i++) degree[i] = adj[i].size();
    
    int maxDeg = *max_element(degree.begin(), degree.end());
    while (maxDeg > 0) {
        int u = max_element(degree.begin(), degree.end()) - degree.begin();
        inCover[u] = true;
        cover.push_back(u);
        for (int v : adj[u]) degree[v]--;
        degree[u] = 0;
        maxDeg = *max_element(degree.begin(), degree.end());
    }
    return cover;
}
```

该算法的近似比可能很大，不能保证常数近似。

## 旅行商问题（TSP）

### 度数受限生成树算法（2-近似）

```cpp
double tsp2Approx(vector<vector<double>>& dist, int n, int start = 0) {
    vector<bool> visited(n, false);
    vector<double> minDist(n, INFINITY);
    minDist[start] = 0;
    for (int i = 0; i < n; i++) {
        int u = -1;
        for (int v = 0; v < n; v++)
            if (!visited[v] && (u == -1 || minDist[v] < minDist[u]))
                u = v;
        visited[u] = true;
        for (int v = 0; v < n; v++)
            if (!visited[v] && dist[u][v] < minDist[v])
                minDist[v] = dist[u][v];
    }
    
    vector<int> eulerPath;
    
    double result = 0;
    vector<bool> visitedCity(n, false);
    int curr = start;
    visitedCity[curr] = true;
    for (int step = 0; step < n - 1; step++) {
        int nearest = -1;
        double minD = INFINITY;
        for (int next = 0; next < n; next++)
            if (!visitedCity[next] && dist[curr][next] < minD) {
                minD = dist[curr][next];
                nearest = next;
            }
        result += minD;
        visitedCity[nearest] = true;
        curr = nearest;
    }
    result += dist[curr][start];
    return result;
}
```

近似比：$\rho = 2$（当满足三角形不等式时）

### Christofides算法（1.5-近似）

**步骤**：

1. 求最小生成树MST
2. 找MST中度数为奇数的顶点集合 $O$
3. 在 $O$ 上求最小完美匹配
4. 将匹配边加到MST，得到欧拉图
5. 求欧拉回路，进行捷径得到TSP近似解

近似比：$\rho = 1.5$

## 集合覆盖问题（Set Cover）

### 贪心算法的 $\ln n$-近似

```cpp
vector<int> setCoverGreedy(vector<vector<int>>& sets, int n) {
    vector<bool> covered(n, false);
    vector<int> cover;
    int coveredCount = 0;
    
    while (coveredCount < n) {
        int bestSet = -1;
        int bestNewCover = 0;
        for (int i = 0; i < sets.size(); i++) {
            int newCover = 0;
            for (int elem : sets[i])
                if (!covered[elem]) newCover++;
            if (newCover > bestNewCover) {
                bestNewCover = newCover;
                bestSet = i;
            }
        }
        cover.push_back(bestSet);
        for (int elem : sets[bestSet])
            if (!covered[elem]) {
                covered[elem] = true;
                coveredCount++;
            }
    }
    return cover;
}
```

近似比：$\rho = \ln n$

**分析**：

设 $C^*$ 为最优解大小，第 $k$ 步选择的集合覆盖了至少 $\frac{|U|}{OPT}$ 个未覆盖元素。迭代 $\ln n$ 次后，至少覆盖 $n - n/e$ 的元素。

## 装箱问题（Bin Packing）

### First Fit Decreasing（FFD）

```cpp
int firstFitDecreasing(vector<double>& items) {
    sort(items.rbegin(), items.rend());
    vector<double> bins;
    int count = 1;
    bins.push_back(items[0]);
    for (size_t i = 1; i < items.size(); i++) {
        bool placed = false;
        for (double& b : bins) {
            if (b + items[i] <= 1.0) {
                b += items[i];
                placed = true;
                break;
            }
        }
        if (!placed) {
            bins.push_back(items[i]);
            count++;
        }
    }
    return count;
}
```

近似比：$FFD \leq \frac{11}{9} OPT + \frac{6}{9}$，在某些实例上接近 $\frac{11}{9}$。

### Best Fit Decreasing

```cpp
int bestFitDecreasing(vector<double>& items) {
    sort(items.rbegin(), items.rend());
    vector<double> bins;
    int count = 1;
    bins.push_back(items[0]);
    for (size_t i = 1; i < items.size(); i++) {
        int bestBin = -1;
        double minSpace = INFINITY;
        for (int j = 0; j < bins.size(); j++) {
            if (bins[j] + items[i] <= 1.0) {
                double space = 1.0 - bins[j] - items[i];
                if (space < minSpace) {
                    minSpace = space;
                    bestBin = j;
                }
            }
        }
        if (bestBin != -1) bins[bestBin] += items[i];
        else {
            bins.push_back(items[i]);
            count++;
        }
    }
    return count;
}
```

## 调度问题（Scheduling）

### 流水车间调度（Makespan）

**Johnson算法**（两台机器的流水车间调度，$O(n \log n)$）：

```cpp
struct Job { int id; int t1, t2; };

int johnsonAlgorithm(vector<Job>& jobs) {
    vector<Job> A, B;
    for (auto& job : jobs) {
        if (job.t1 < job.t2) A.push_back(job);
        else B.push_back(job);
    }
    sort(A.begin(), A.end(), [](Job& a, Job& b){ return a.t1 < b.t1; });
    sort(B.begin(), B.end(), [](Job& a, Job& b){ return a.t2 > b.t2; });
    vector<Job> schedule = A;
    schedule.insert(schedule.end(), B.begin(), B.end());
    int time1 = 0, time2 = 0;
    for (auto& job : schedule) {
        time1 += job.t1;
        time2 = max(time2, time1) + job.t2;
    }
    return time2;
}
```

Johnson算法得到**最优解**（对于两台机器的流水车间调度）。

### 等价类装箱（Identical Parallel Machines）

- LPT（Longest Processing Time First）算法：$\rho = \frac{4}{3} - \frac{1}{3m}$
- LS（List Scheduling）算法：$\rho = 2 - \frac{1}{m}$

```cpp
int makespanLPT(int m, vector<int>& jobs) {
    sort(jobs.rbegin(), jobs.rend());
    vector<int> machineTime(m, 0);
    for (int job : jobs) {
        int minMachine = min_element(machineTime.begin(), machineTime.end()) - machineTime.begin();
        machineTime[minMachine] += job;
    }
    return *max_element(machineTime.begin(), machineTime.end());
}
```

## 最大割（Max Cut）

### 随机算法的0.5-近似

```cpp
vector<int> maxCutRandom(vector<vector<int>>& adj, int n) {
    vector<int> cut(n);
    for (int i = 0; i < n; i++)
        cut[i] = uniform_int_distribution<int>(0, 1)(rng);
    
    int cutSize = 0;
    for (int u = 0; u < n; u++)
        for (int v : adj[u])
            if (v > u && cut[u] != cut[v]) cutSize++;
    return cut;
}
```

期望割的大小至少为 $m/2$（$m$ 为边数），近似比 $\rho = 2$。

### 局部搜索改进

```cpp
vector<int> maxCutLocalSearch(vector<int> cut, vector<vector<int>>& adj, int n) {
    bool improved = true;
    while (improved) {
        improved = false;
        for (int i = 0; i < n; i++) {
            int curGain = 0, newGain = 0;
            for (int v : adj[i])
                if (cut[i] == cut[v]) curGain++;
                else newGain++;
            if (newGain > curGain) {
                cut[i] = 1 - cut[i];
                improved = true;
            }
        }
    }
    return cut;
}
```

## PTAS与FPTAS

### PTAS的例子：子集和

```cpp
double subsetSumPTAS(vector<int>& nums, double target, double eps) {
    int n = nums.size();
    return 0.0;
}
```

### FPTAS的条件

问题存在**伪多项式时间算法**（如背包问题的 $O(nW)$）可以转化为FPTAS。

## 关键定理总结

| 问题 | 算法 | 近似比 |
|------|------|--------|
| 顶点覆盖 | 2-近似 | $\rho = 2$ |
| TSP（三角不等式） | MST+捷径 | $\rho = 2$ |
| TSP（三角不等式） | Christofides | $\rho = 1.5$ |
| 集合覆盖 | 贪心 | $\rho = \ln n$ |
| 装箱 | FFD | $\rho = 11/9$ |
| 最大割 | 随机 | $\rho = 2$ |
| 最大割 | 局部搜索 | 改进解质量 |
| 流水车间（2机） | Johnson | 最优解 |
| 等价机器调度 | LPT | $\rho = 4/3 - 1/(3m)$ |