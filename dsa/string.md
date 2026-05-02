# 字符串（String）

## 字符串基础

字符串是由字符序列组成的数据类型，在计算机科学中应用广泛。

### 字符串作为字符序列

字符串本质上是字符的有序序列。在不同的编程语言中，字符串有着不同的实现方式，但核心概念是相似的。

### 不同编码方式

- **ASCII 编码**：使用 7 位（128 个字符）或 8 位（256 个字符）表示字符，主要用于英文字母和基本符号。
- **Unicode 编码**：支持全球各种语言的字符集，包括 UTF-8、UTF-16、UTF-32 等变体。UTF-8 是目前最常用的 Unicode 编码方式，具有向后兼容 ASCII 的特性。

### C++ 字符串操作

C++ 中提供了丰富的字符串操作接口：

```cpp
#include <string>
#include <iostream>

int main() {
    std::string s1 = "Hello";
    std::string s2 = "World";
    
    // 字符串拼接
    std::string s3 = s1 + " " + s2;
    
    // 子串提取
    std::string sub = s3.substr(0, 5);
    
    // 字符串查找
    size_t pos = s3.find("World");
    
    // 字符串替换
    s3.replace(pos, 5, "C++");
    
    return 0;
}
```

## 模式匹配（Pattern Matching）

模式匹配是字符串处理中的核心问题之一：给定文本串 $T$ 和模式串 $P$，找出 $P$ 在 $T$ 中的所有出现位置。

### 朴素算法（Brute Force）

朴素算法是最直接的模式匹配方法，逐个比较字符。

```cpp
int bruteForce(const string& text, const string& pattern) {
    int n = text.size(), m = pattern.size();
    for (int i = 0; i <= n - m; i++) {
        int j = 0;
        while (j < m && text[i+j] == pattern[j]) j++;
        if (j == m) return i;
    }
    return -1;
}
```

时间复杂度：$O(n \cdot m)$，其中 $n$ 为文本串长度，$m$ 为模式串长度。

该算法在最坏情况下需要比较所有可能的子串，例如文本为 $aaaa...aaa$，模式为 $aaa...ab$ 时。

### KMP算法（Knuth-Morris-Pratt）

KMP 算法的核心思想是：当发生失配时，利用预先计算的信息，跳过不必要的比较。

关键洞察：当文本串和模式串失配时，不需要回退文本串的指针，而是利用已匹配的信息将模式串滑动到合适的位置。

#### 前缀函数 $\pi[i]$

前缀函数 $\pi[i]$ 定义为：子串 $s[0..i]$ 中，既是 **真前缀**（非平凡前缀）又是 **真后缀** 的最长子串长度。

$$
\pi[i] = \max\{k \mid 0 < k < i+1, \text{ 且 } s[0..k-1] = s[i-k+1..i]\}
$$

其中真前缀和真后缀指不能等于原串本身的前缀和后缀。

#### LPS 数组预处理

```cpp
vector<int> computeLPS(const string& pattern) {
    int m = pattern.size();
    vector<int> lps(m, 0);
    for (int i = 1, len = 0; i < m; ) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else if (len > 0) {
            len = lps[len-1];
        } else {
            lps[i++] = 0;
        }
    }
    return lps;
}
```

#### KMP 搜索实现

```cpp
int kmpSearch(const string& text, const string& pattern) {
    vector<int> lps = computeLPS(pattern);
    int i = 0, j = 0;
    while (i < (int)text.size() && j < (int)pattern.size()) {
        if (text[i] == pattern[j]) {
            i++; j++;
        } else if (j > 0) {
            j = lps[j-1];
        } else {
            i++;
        }
    }
    return j == pattern.size() ? i - j : -1;
}
```

时间复杂度：$O(n+m)$，空间复杂度：$O(m)$。

#### KMP 算法正确性理解

考虑模式串 $P = "ABABAC"$ 的匹配过程：

1. 当在位置 $i$ 失配时，若 $j > 0$，则模式串的前 $j$ 个字符已经与文本串匹配。
2. LPS 数组告诉我们下一个应该比较的位置。
3. 这避免了朴素算法中的回退操作。

### Boyer-Moore Algorithm

Boyer-Moore 算法从模式串的末尾向前进行匹配，利用两个启发式策略：

- **坏字符启发式（Bad Character Heuristic）**：当发生失配时，将模式串向右滑动，使得模式串中最右边的该字符与文本串中的字符对齐。
- **好后缀启发式（Good Suffix Heuristic）**：当匹配成功后，利用已匹配的后缀信息来决定滑动距离。

在最坏情况下时间复杂度为 $O(nm)$，但在实际应用中，特别是模式串较长时，往往表现出色，平均时间复杂度接近 $O(n/m)$。

### Sunday Algorithm

Sunday 算法是一种简单高效的算法，每次匹配失败时，关注文本串中与模式串对齐的下一个字符。

```
文本串:    T[0..n-1]
模式串:    P[0..m-1]
```

当发生失配时，检查文本串中位置 $i + m$（即模式串右边界外的字符）：

- 若该字符在模式串中存在，则将模式串向右滑动，使得该字符与模式串中最右边的该字符对齐。
- 若不存在，则直接将模式串跳过该字符。

```cpp
int sundaySearch(const string& text, const string& pattern) {
    int n = text.size(), m = pattern.size();
    if (m > n) return -1;
    
    unordered_map<char, int> shift;
    for (int i = 0; i < m; i++) {
        shift[pattern[i]] = m;
    }
    for (int i = 0; i < m - 1; i++) {
        shift[pattern[i]] = m - 1 - i;
    }
    
    int i = 0;
    while (i <= n - m) {
        int j = 0;
        while (j < m && text[i+j] == pattern[j]) j++;
        if (j == m) return i;
        if (i + m >= n) return -1;
        char next = text[i + m];
        i += (shift.find(next) != shift.end()) ? shift[next] : m + 1;
    }
    return -1;
}
```

时间复杂度在最好情况下为 $O(n/m)$。

## 字符串哈希（String Hashing）

字符串哈希通过将字符串映射到数值来实现快速比较和查找。

### Rabin-Karp Rolling Hash

Rabin-Karp 算法使用滚动哈希，利用多项式哈希函数实现高效的子串比较。

```cpp
const long long BASE = 131;
const long long MOD = 1e9 + 7;

long long hash(const string& s) {
    long long h = 0;
    for (char c : s) h = (h * BASE + c) % MOD;
    return h;
}

int rabinKarp(const string& text, const string& pattern) {
    int n = text.size(), m = pattern.size();
    long long pHash = hash(pattern);
    long long tHash = hash(text.substr(0, m));
    for (int i = 0; i <= n - m; i++) {
        if (pHash == tHash) {
            if (text.substr(i, m) == pattern) return i;
        }
        if (i < n - m) {
            tHash = ((tHash - text[i] * pow(BASE, m-1) % MOD + MOD) * BASE + text[i+m]) % MOD;
        }
    }
    return -1;
}
```

时间复杂度：$O(n+m)$，空间复杂度：$O(1)$。

#### 哈希函数设计要点

良好的哈希函数应满足：

1. **均匀性**：不同字符串产生相同哈希值的概率应尽可能低。
2. **高效性**：计算应尽可能快。
3. **碰撞可控**：通过取模和双哈希可以降低碰撞概率。

常用底数选择：131、13131 等质数，以及大素数模数如 $10^9+7$、$10^9+9$。

## 前缀函数与Z函数

### 前缀函数（Prefix Function）$\pi$

前缀函数与 KMP 算法中的 LPS 数组是同一概念，但在字符串问题的语境下有更广泛的应用。

```cpp
vector<int> prefixFunction(const string& s) {
    int n = s.size();
    vector<int> pi(n, 0);
    for (int i = 1; i < n; i++) {
        int j = pi[i-1];
        while (j > 0 && s[i] != s[j]) j = pi[j-1];
        if (s[i] == s[j]) j++;
        pi[i] = j;
    }
    return pi;
}
```

#### 前缀函数的应用

1. **KMP 模式匹配**：用于在线性时间内完成模式匹配。
2. **字符串周期检测**：若 $n \bmod (n - \pi[n-1]) == 0$，则该字符串具有周期 $(n - \pi[n-1])$。
3. **字符串压缩**：利用最小周期进行压缩表示。

### Z函数（Z Function）

Z 函数定义为 $Z[i]$ 表示以位置 $i$ 开头的子串与整个字符串的最长公共前缀长度。

$$
Z[i] = \max\{k \mid s[0..k-1] = s[i..i+k-1]\}
$$

```cpp
vector<int> zFunction(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i <= r) z[i] = min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
        }
    }
    return z;
}
```

#### Z函数的应用

1. **模式匹配**：将模式串与文本串拼接，利用 Z 函数找出所有匹配位置。
2. **字符串拼接问题**：判断字符串是否由某个子串重复构成。
3. **寻找最长回文子串**：通过字符串与其反转的拼接。

## 字典树（Trie）

字典树（又称前缀树、Trie）是一种树形数据结构，用于高效存储和检索字符串集合。

```cpp
struct TrieNode {
    TrieNode* child[26];
    bool isEnd;
    TrieNode() : isEnd(false) {
        memset(child, 0, sizeof(child));
    }
};

class Trie {
    TrieNode* root;
public:
    Trie() { root = new TrieNode(); }
    
    void insert(const string& word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->child[idx]) node->child[idx] = new TrieNode();
            node = node->child[idx];
        }
        node->isEnd = true;
    }
    
    bool search(const string& word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->child[idx]) return false;
            node = node->child[idx];
        }
        return node->isEnd;
    }
    
    bool startsWith(const string& prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            int idx = c - 'a';
            if (!node->child[idx]) return false;
            node = node->child[idx];
        }
        return true;
    }
};
```

#### 字典树的复杂度

- **时间复杂度**：插入、查找、前缀匹配均为 $O(|s|)$，其中 $|s|$ 为字符串长度。
- **空间复杂度**：最坏情况下为 $O(26^n)$，但实际应用中远小于这个值。

#### 字典树的应用场景

1. **字符串检索**：快速判断字符串是否在集合中。
2. **前缀匹配**：自动补全、搜索引擎提示。
3. **字符串排序**：按字典序遍历字典树即可得到有序结果。
4. **IP 路由表**：最长前缀匹配。

## 经典例题

### 1. 字符串循环移位

**Leetcode 796: Rotate String**

给定两个字符串 $A$ 和 $B$，判断 $B$ 是否可以通过 $A$ 循环移位得到。

```cpp
bool rotateString(string s, string goal) {
    return s.size() == goal.size() && (s + s).find(goal) != string::npos;
}
```

**思路**：若 $B$ 能由 $A$ 循环移位得到，则 $B$ 一定是 $A+A$ 的子串。

### 2. 字符串全排列去重

**Leetcode 47: Permutations II**

给定包含重复字符的字符串，返回所有不重复的全排列。

```cpp
void backtrack(vector<string>& res, string& s, int idx) {
    if (idx == s.size()) {
        res.push_back(s);
        return;
    }
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

**关键点**：使用 `used` 集合确保同一位置不会重复放置相同字符。

### 3. 最长公共前缀

**Leetcode 14: Longest Common Prefix**

```cpp
string longestCommonPrefix(vector<string>& strs) {
    if (strs.empty()) return "";
    string prefix = strs[0];
    for (int i = 1; i < strs.size(); i++) {
        int j = 0;
        while (j < prefix.size() && j < strs[i].size() && prefix[j] == strs[i][j]) {
            j++;
        }
        prefix = prefix.substr(0, j);
        if (prefix.empty()) break;
    }
    return prefix;
}
```

### 4. 字符串异位词判断

**Leetcode 438: Find All Anagrams in a String**

```cpp
vector<int> findAnagrams(string s, string p) {
    vector<int> result;
    vector<int> cnt(26, 0);
    for (char c : p) cnt[c - 'a']++;
    
    int left = 0, right = 0, needed = p.size();
    while (right < s.size()) {
        if (cnt[s[right++] - 'a']-- > 0) needed--;
        if (needed == 0) result.push_back(left);
        if (right - left == p.size() && cnt[s[left++] - 'a']++ >= 0) needed++;
    }
    return result;
}
```

### 5. Z函数应用——找出字符串的所有周期

```cpp
vector<int> findPeriods(const string& s) {
    int n = s.size();
    vector<int> pi = prefixFunction(s);
    vector<int> periods;
    for (int i = 1; i < n; i++) {
        int len = n - pi[n-1];
        if (i == len) periods.push_back(i);
    }
    return periods;
}
```
