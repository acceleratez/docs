# 随机化算法（Randomized Algorithms）

## 算法思想

### 基本概念
- 随机化算法在执行过程中使用**随机数**（或伪随机数）来做出决策。
- 与确定性算法的区别：不依赖于输入的固定分布，而是依赖算法本身的随机性。

### 优点
1. **简洁性**：通常比确定性算法更简单
2. **性能保证**：通常能得到较好的**期望复杂度**
3. **处理棘手问题**：对某些NPC问题提供实用近似解

### 分类
1. **Las Vegas算法**：保证得到正确答案，但运行时间不确定（期望多项式）
2. **Monte Carlo算法**：运行时间确定，但不保证一定正确（可能给出错误答案）
3. ** Sherwood算法**：通过随机化使最坏情况概率降低（总是正确）

## 随机数生成

### C++随机数库

```cpp
#include <random>
#include <chrono>

// 方法1：mt19937
mt19937 rng(random_device{}()); // 种子
uniform_int_distribution<int> dist(0, 99);
int x = dist(rng); // [0, 99] 均匀分布

// 方法2：chrono种子
mt19937 rng2(chrono::steady_clock::now().time_since_epoch().count());
uniform_real_distribution<double> distReal(0.0, 1.0);
double y = distReal(rng2);

// 方法3：shuffle
vector<int> v = {1,2,3,4,5};
shuffle(v.begin(), v.end(), rng);
```

## 快速排序（随机化版本）

### 随机化Pivot选择
```cpp
int randomPartition(vector<int>& arr, int l, int r) {
    int i = uniform_int_distribution<int>(l, r)(rng);
    swap(arr[i], arr[r]);
    return partition(arr, l, r);
}

int partition(vector<int>& arr, int l, int r) {
    int pivot = arr[r];
    int i = l - 1;
    for (int j = l; j < r; j++)
        if (arr[j] <= pivot) swap(arr[++i], arr[j]);
    swap(arr[i+1], arr[r]);
    return i + 1;
}

void quickSortRandom(vector<int>& arr, int l, int r) {
    if (l < r) {
        int p = randomPartition(arr, l, r);
        quickSortRandom(arr, l, p - 1);
        quickSortRandom(arr, p + 1, r);
    }
}
```
**分析**：期望时间复杂度 $O(n \log n)$，最坏情况仍为 $O(n^2)$，但出现概率极低。

## 快速选择（Quickselect）

### 期望线性时间选择
```cpp
int quickSelect(vector<int>& arr, int k) {
    int l = 0, r = arr.size() - 1;
    while (r > l) {
        int i = uniform_int_distribution<int>(l, r)(rng);
        swap(arr[i], arr[r]);
        int p = partition(arr, l, r);
        if (k == p) return arr[k];
        else if (k < p) r = p - 1;
        else l = p + 1;
    }
    return arr[l];
}
```
时间复杂度期望：$O(n)$，最坏 $O(n^2)$。

## 随机化快速排序的复杂度分析

### 期望分析
设比较操作数为 $X$：

$$
E[X] = \sum_{i=1}^{n-1} \frac{1}{n-i+1} \cdot 2(n-i+1) = O(n \log n)
$$

### 最好的情况和最坏情况
- 最好情况：$O(n \log n)$
- 最坏情况：$O(n^2)$（几乎不会发生）
- 期望：$O(n \log n)$

## 跳跃表（Skip List）

### 数据结构
```cpp
struct SkipNode {
    int key, val;
    vector<SkipNode*> fwd;
    SkipNode(int k, int v, int level) : key(k), val(v), fwd(level+1, nullptr) {}
};

class SkipList {
    int maxLevel;
    float prob;
    SkipNode* head;
    int level;
    
public:
    SkipList(int maxLvl = 16, float p = 0.5) : maxLevel(maxLvl), prob(p) {
        head = new SkipNode(INT_MIN, 0, maxLevel);
        level = 0;
    }
    
    int randomLevel() {
        int lvl = 0;
        while (uniform_real_distribution<double>(0.0, 1.0)(rng) < prob && lvl < maxLevel)
            lvl++;
        return lvl;
    }
    
    void insert(int key, int val) {
        vector<SkipNode*> update(maxLevel + 1);
        SkipNode* cur = head;
        for (int i = level; i >= 0; i--) {
            while (cur->fwd[i] && cur->fwd[i]->key < key)
                cur = cur->fwd[i];
            update[i] = cur;
        }
        cur = cur->fwd[0];
        if (cur && cur->key == key) cur->val = val;
        else {
            int lvl = randomLevel();
            if (lvl > level) {
                for (int i = level + 1; i <= lvl; i++) update[i] = head;
                level = lvl;
            }
            SkipNode* newNode = new SkipNode(key, val, lvl);
            for (int i = 0; i <= lvl; i++) {
                newNode->fwd[i] = update[i]->fwd[i];
                update[i]->fwd[i] = newNode;
            }
        }
    }
    
    SkipNode* search(int key) {
        SkipNode* cur = head;
        for (int i = level; i >= 0; i--) {
            while (cur->fwd[i] && cur->fwd[i]->key < key)
                cur = cur->fwd[i];
        }
        cur = cur->fwd[0];
        return (cur && cur->key == key) ? cur : nullptr;
    }
};
```
搜索/插入/删除期望时间：$O(\log n)$

## 素性测试（Primality Testing）

### Miller-Rabin素性测试（Monte Carlo）
```cpp
long long modPow(long long a, long long d, long long n) {
    long long res = 1;
    while (d) {
        if (d & 1) res = (__int128)res * a % n;
        a = (__int128)a * a % n;
        d >>= 1;
    }
    return res;
}

bool millerRabin(long long n) {
    if (n < 2) return false;
    for (long long p : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37})
        if (n % p == 0) return n == p;
    
    long long d = n - 1, s = 0;
    while ((d & 1) == 0) { d >>= 1; s++; }
    
    for (long long a : {2, 7, 61}) { // 对64位足够
        if (a % n == 0) continue;
        long long x = modPow(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool composite = true;
        for (long long r = 1; r < s; r++) {
            x = (__int128)x * x % n;
            if (x == n - 1) { composite = false; break; }
        }
        if (composite) return false;
    }
    return true;
}
```
**正确性**：当 $n < 3,825,123,056,546,413,051$ 时只需测试 $a = 2, 7, 61$ 三个基数即可保证正确。

### Fermat素性测试（更简单）
```cpp
bool fermatPrimality(long long n, int k = 5) {
    if (n < 2) return false;
    for (int i = 0; i < k; i++) {
        long long a = uniform_int_distribution<long long>(2, n-2)(rng);
        if (modPow(a, n-1, n) != 1) return false;
    }
    return true;
}
```
**注意**：Carmichael数会导致此算法失效（伪素数）。

## 随机化算法在NP问题中的应用

### 随机化近似算法

#### MAX-3-SAT的随机近似
```cpp
bool randomMAX3SAT(vector<vector<int>>& clauses, int n) {
    // 每个变量以概率0.5设为真
    vector<bool> assignment(n);
    for (int i = 0; i < n; i++)
        assignment[i] = uniform_int_distribution<int>(0, 1)(rng) == 1;
    // 统计满足的子句数...
}
```
期望满足至少 $7/8$ 的子句。

### 矩阵乘法的随机验证（Freivalds算法）
```cpp
// 验证 A * B = C 的Monte Carlo算法
// 错误概率 <= 1/2
bool freivalds(vector<vector<int>>& A, vector<vector<int>>& B, vector<vector<int>>& C, int k = 10) {
    int n = A.size();
    for (int iter = 0; iter < k; iter++) {
        vector<int> r(n);
        for (int i = 0; i < n; i++)
            r[i] = uniform_int_distribution<int>(0, 1)(rng) * 2 - 1;
        
        // 计算 Br
        vector<int> Br(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                Br[i] += B[i][j] * r[j];
        
        // 计算 C r
        vector<int> Cr(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                Cr[i] += C[i][j] * r[j];
        
        // 计算 A(Br) - Cr
        vector<int> diff(n, 0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                diff[i] += A[i][j] * Br[j] - Cr[j];
        
        // 如果 ||diff|| != 0 则一定不相等
        double normSq = 0;
        for (int x : diff) normSq += x * x;
        if (normSq > 1e-9) return false;
    }
    return true;
}
```
每次错误概率 $\leq 1/2$，运行 $k$ 次后 $\leq (1/2)^k$。

## 随机化算法分析

### 期望时间复杂度
随机化算法的期望复杂度通常通过**概率论**计算：

$$
E[T] = \sum_{i} p_i \cdot T_i
$$

### 蒙特卡洛的误差概率
通过重复运行 $k$ 次，错误概率可以从 $p$ 降到 $p^k$ 或 $1-(1-p)^k$。

### 尾绑（Chernoff Bound）
用于分析随机变量和的尾部概率：
$$
P[X \geq (1+\delta)\mu] \leq \left(\frac{e^\delta}{(1+\delta)^{1+\delta}}\right)^\mu
$$

## 常见应用场景

1. **密码学**：素数生成、RSA密钥生成
2. **近似算法**：解决NP难问题的近似解
3. **数值计算**：Monte Carlo积分
4. **数据结构**：Skip List、随机化哈希
5. **分布式算法**：负载均衡、随机选举
