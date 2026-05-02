# 回溯算法（Backtracking）

## 算法思想

### 基本概念
- 回溯算法是一种**搜索**策略，通过**递归**枚举所有可能的解，并在搜索过程中**剪枝**（pruning）来提高效率。
- 本质是**深度优先搜索（DFS）**加上**选择-撤销选择（choose-unchoose）**的模式。
- 当搜索到某个状态发现不可能达到目标时，就**回溯**（退回上一步），尝试其他选择。

### 适用场景
1. **排列组合问题**：生成所有可能的排列/组合
2. **子集问题**：找到满足条件的所有子集
3. **搜索问题**：在解空间中搜索满足约束的解
4. **约束满足问题（ CSP）**：如八皇后、数独

### 算法模板
```cpp
void backtrack(int idx, State& current) {
    if (idx == n) {
        // 记录答案
        ans.push_back(current);
        return;
    }
    for (choice in choices) {
        if (isValid(current, choice)) {
            makeChoice(current, choice);
            backtrack(idx + 1, current);
            undoChoice(current, choice); // 撤销选择，回溯
        }
    }
}
```

### 核心要素
1. **路径（Path）**：已经做出的选择
2. **选择列表（Choices）**：当前状态下可以做的选择
3. **结束条件（Termination）**：到达决策树底部
4. **剪枝（Pruning）**：排除不可能 leads to 有效解的选择

## 经典问题

### 1. 全排列（Permutations）
Leetcode 46（无重复数字）：
```cpp
vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> path;
    vector<bool> used(nums.size(), false);
    function<void()> dfs = [&]() {
        if (path.size() == nums.size()) {
            res.push_back(path);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            path.push_back(nums[i]);
            used[i] = true;
            dfs();
            path.pop_back();
            used[i] = false;
        }
    };
    dfs();
    return res;
}
```

### 2. 全排列II（Permutations II）
Leetcode 47（有重复数字，去重）：
```cpp
vector<vector<int>> permuteUnique(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> path;
    vector<bool> used(nums.size(), false);
    sort(nums.begin(), nums.end());
    function<void()> dfs = [&]() {
        if (path.size() == nums.size()) {
            res.push_back(path);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            // 剪枝：同层相同数字不能重复选择
            if (i > 0 && nums[i] == nums[i-1] && !used[i-1]) continue;
            path.push_back(nums[i]);
            used[i] = true;
            dfs();
            path.pop_back();
            used[i] = false;
        }
    };
    dfs();
    return res;
}
```

### 3. 组合（Combinations）
Leetcode 77：
```cpp
vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> res;
    vector<int> path;
    function<void(int)> dfs = [&](int start) {
        if (path.size() == k) {
            res.push_back(path);
            return;
        }
        for (int i = start; i <= n; i++) {
            path.push_back(i);
            dfs(i + 1);
            path.pop_back();
        }
    };
    dfs(1);
    return res;
}
```

### 4. 组合总和（Combination Sum）
Leetcode 39（可重复选取）：
```cpp
vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    vector<vector<int>> res;
    vector<int> path;
    function<void(int, int)> dfs = [&](int start, int sum) {
        if (sum > target) return;
        if (sum == target) {
            res.push_back(path);
            return;
        }
        for (int i = start; i < candidates.size(); i++) {
            path.push_back(candidates[i]);
            dfs(i, sum + candidates[i]); // i 而不是 i+1，允许重复选择
            path.pop_back();
        }
    };
    dfs(0, 0);
    return res;
}
```

### 5. 子集（Subsets）
Leetcode 78：
```cpp
vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> path;
    function<void(int)> dfs = [&](int start) {
        res.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);
            dfs(i + 1);
            path.pop_back();
        }
    };
    dfs(0);
    return res;
}
```

### 6. 子集II（Subsets II）
Leetcode 90（有重复元素）：
```cpp
vector<vector<int>> subsetsWithDup(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> path;
    sort(nums.begin(), nums.end());
    function<void(int)> dfs = [&](int start) {
        res.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            if (i > start && nums[i] == nums[i-1]) continue;
            path.push_back(nums[i]);
            dfs(i + 1);
            path.pop_back();
        }
    };
    dfs(0);
    return res;
}
```

### 7. N皇后（N-Queens）
Leetcode 51：
```cpp
vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> res;
    vector<string> board(n, string(n, '.'));
    vector<int> queens(n, -1); // queens[row] = col
    
    function<bool(int,int)> isValid = [&](int row, int col) {
        // 检查列
        for (int i = 0; i < row; i++)
            if (queens[i] == col) return false;
        // 检查主对角线 row-col
        for (int i = 0; i < row; i++)
            if (row - i == abs(col - queens[i])) return false;
        return true;
    };
    
    function<void(int)> dfs = [&](int row) {
        if (row == n) {
            // 转换board为string并加入结果
            vector<string> sol;
            for (int r = 0; r < n; r++) {
                string line;
                for (int c = 0; c < n; c++)
                    line += (c == queens[r]) ? 'Q' : '.';
                sol.push_back(line);
            }
            res.push_back(sol);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (!isValid(row, col)) continue;
            queens[row] = col;
            board[row][col] = 'Q';
            dfs(row + 1);
            queens[row] = -1;
            board[row][col] = '.';
        }
    };
    dfs(0);
    return res;
}
```

### 8. 解数独（Sudoku Solver）
Leetcode 37：
```cpp
bool isValid(vector<vector<char>>& board, int row, int col, char c) {
    for (int i = 0; i < 9; i++)
        if (board[i][col] == c || board[row][i] == c) return false;
    int sr = (row / 3) * 3, sc = (col / 3) * 3;
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            if (board[sr + i][sc + j] == c) return false;
    return true;
}

bool solveSudoku(vector<vector<char>>& board) {
    for (int i = 0; i < 9; i++)
        for (int j = 0; j < 9; j++)
            if (board[i][j] == '.') {
                for (char c = '1'; c <= '9'; c++) {
                    if (isValid(board, i, j, c)) {
                        board[i][j] = c;
                        if (solveSudoku(board)) return true;
                        board[i][j] = '.';
                    }
                }
                return false;
            }
    return true;
}
```

### 9. 括号生成（Generate Parentheses）
Leetcode 22：
```cpp
vector<string> generateParenthesis(int n) {
    vector<string> res;
    function<void(string, int, int)> dfs = [&](string cur, int left, int right) {
        if (cur.size() == 2 * n) {
            res.push_back(cur);
            return;
        }
        if (left < n) dfs(cur + "(", left + 1, right);
        if (right < left) dfs(cur + ")", left, right + 1);
    };
    dfs("", 0, 0);
    return res;
}
```

## 回溯算法的优化

### 1. 剪枝策略

#### 排序后剪枝
```cpp
// 组合总和：先排序，可以在递归中提前终止
function<void(int, int)> dfs = [&](int start, int target) {
    if (target == 0) { res.push_back(path); return; }
    for (int i = start; i < candidates.size() && candidates[i] <= target; i++) {
        // 已排序后，一旦 candidates[i] > target，后面的更大，直接break
        path.push_back(candidates[i]);
        dfs(i, target - candidates[i]);
        path.pop_back();
    }
};
```

#### 可行性剪枝
```cpp
// 数独：利用位运算加速有效性判断
int row[9], col[9], cell[3][3];
// row[i] 是一个9位整数，表示第i行哪些数字已被使用
void initSudoku(vector<vector<char>>& board) {
    for (int i = 0; i < 9; i++) row[i] = 0;
    for (int j = 0; j < 9; j++) col[j] = 0;
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            cell[i][j] = 0;
    for (int i = 0; i < 9; i++)
        for (int j = 0; j < 9; j++) {
            char c = board[i][j];
            if (c != '.') {
                int bit = 1 << (c - '1');
                row[i] |= bit;
                col[j] |= bit;
                cell[i/3][j/3] |= bit;
            }
        }
}
```

### 2. 预选剪枝（MCMR - Most Constraining Variable）
选择**受限最多**的选择先做（如N皇后中选择空格最少的行先放）。

### 3. 记忆化剪枝
如果某个状态之前已经计算过失败，可以记录下来避免重复搜索。

## 经典例题

### 1. 电话号码的字母组合
Leetcode 17：
```cpp
vector<string> letterCombinations(string digits) {
    vector<string> res;
    if (digits.empty()) return res;
    vector<string> mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    function<void(int, string)> dfs = [&](int idx, string cur) {
        if (idx == digits.size()) { res.push_back(cur); return; }
        string letters = mapping[digits[idx] - '0'];
        for (char c : letters) dfs(idx + 1, cur + c);
    };
    dfs(0, "");
    return res;
}
```

### 2. 单词搜索（Word Search）
Leetcode 79：
```cpp
bool exist(vector<vector<char>>& board, string word) {
    int m = board.size(), n = board[0].size();
    vector<vector<bool>> visited(m, vector<bool>(n, false));
    function<bool(int,int,int)> dfs = [&](int i, int j, int idx) {
        if (idx == word.size()) return true;
        if (i < 0 || i >= m || j < 0 || j >= n || visited[i][j] || board[i][j] != word[idx]) return false;
        visited[i][j] = true;
        bool res = dfs(i+1, j, idx+1) || dfs(i-1, j, idx+1) ||
                   dfs(i, j+1, idx+1) || dfs(i, j-1, idx+1);
        visited[i][j] = false;
        return res;
    };
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (dfs(i, j, 0)) return true;
    return false;
}
```

### 3. 分割回文串
Leetcode 131：
```cpp
vector<vector<string>> partition(string s) {
    vector<vector<string>> res;
    vector<string> path;
    function<bool(int,int)> isPalindrome = [&](int l, int r) {
        while (l < r) if (s[l++] != s[r--]) return false;
        return true;
    };
    function<void(int)> dfs = [&](int start) {
        if (start == s.size()) { res.push_back(path); return; }
        for (int i = start; i < s.size(); i++) {
            if (isPalindrome(start, i)) {
                path.push_back(s.substr(start, i - start + 1));
                dfs(i + 1);
                path.pop_back();
            }
        }
    };
    dfs(0);
    return res;
}
```
