# 栈与队列（Stack and Queue）

## 栈（Stack）

**栈**是一种遵循**后进先出**（LIFO, Last In First Out）原则的线性数据结构。就像叠盘子一样，最后放上去的盘子最先被拿走。

### 栈的抽象数据类型（ADT）

栈支持以下基本操作：

| 操作 | 说明 | 时间复杂度 |
|------|------|------------|
| `push(x)` | 将元素 $x$ 压入栈顶 | $O(1)$ |
| `pop()` | 弹出栈顶元素并返回 | $O(1)$ |
| `top()` | 返回栈顶元素（不弹出） | $O(1)$ |
| `empty()` | 判断栈是否为空 | $O(1)$ |
| `size()` | 返回栈中元素个数 | $O(1)$ |

### 栈的数组实现

```cpp
template <typename T>
class Stack {
    T* elem;
    int capacity;
    int top; // stack pointer, -1 means empty
public:
    Stack(int cap = 100) : capacity(cap), top(-1) {
        elem = new T[capacity];
    }
    ~Stack() { delete[] elem; }
    bool empty() const { return top == -1; }
    int size() const { return top + 1; }
    void push(const T& x) {
        if (top + 1 >= capacity) throw "overflow";
        elem[++top] = x;
    }
    T pop() {
        if (empty()) throw "underflow";
        return elem[top--];
    }
    T& topElem() const {
        if (empty()) throw "underflow";
        return elem[top];
    }
};
```

### 单调栈（Monotonic Stack）

单调栈是一种特殊栈，它维护了栈中元素的单调性（递增或递减）。在插入新元素时，会弹出比新元素小（或大）的元素，从而保持栈的单调性。

**核心思想**：对于每个元素，寻找其**下一个更大元素**时，如果当前元素比栈顶元素大，则栈顶元素不会再被需要了。

#### 经典问题：下一个更大元素（Next Greater Element）

给定一个数组，找到每个元素右侧第一个比它大的元素。

```cpp
vector<int> nextGreaterElement(vector<int>& nums) {
    vector<int> res(nums.size(), -1);
    stack<int> s; // stores indices
    for (int i = 0; i < nums.size(); i++) {
        while (!s.empty() && nums[i] > nums[s.top()]) {
            res[s.top()] = nums[i];
            s.pop();
        }
        s.push(i);
    }
    return res;
}
```

**时间复杂度**：$O(n)$，每个元素最多被push和pop一次。

### 栈的应用

1. **表达式求值**：中缀转后缀，后缀表达式求值
2. **括号匹配**：检验表达式中括号是否匹配
3. **函数调用栈**：程序运行时维护函数调用关系
4. **深度优先搜索（DFS）**：用栈实现递归的迭代版本

---

## 队列（Queue）

**队列**是一种遵循**先进先出**（FIFO, First In First Out）原则的线性数据结构。就像排队买票一样，最先排队的人最先买到票。

### 队列的抽象数据类型（ADT）

| 操作 | 说明 | 时间复杂度 |
|------|------|------------|
| `enqueue(x)` | 将元素 $x$ 加入队尾 | $O(1)$ |
| `dequeue()` | 移除队首元素并返回 | $O(1)$ |
| `front()` | 返回队首元素（不移除） | $O(1)$ |
| `rear()` | 返回队尾元素 | $O(1)$ |
| `empty()` | 判断队列是否为空 | $O(1)$ |
| `size()` | 返回队列中元素个数 | $O(1)$ |

### 队列的循环数组实现

普通数组实现队列时，出队操作需要移动所有元素，导致 $O(n)$ 复杂度。使用**循环数组**（Circular Buffer）可以做到 $O(1)$ 的出队操作。

```cpp
template <typename T>
class Queue {
    T* elem;
    int capacity;
    int front, rear; // front = first element, rear = next position
    int size;
public:
    Queue(int cap = 100) : capacity(cap), front(0), rear(0), size(0) {
        elem = new T[capacity];
    }
    ~Queue() { delete[] elem; }
    bool empty() const { return size == 0; }
    int size() const { return size; }
    void enqueue(const T& x) {
        if (size >= capacity) throw "overflow";
        elem[rear] = x;
        rear = (rear + 1) % capacity;
        size++;
    }
    T dequeue() {
        if (empty()) throw "underflow";
        T x = elem[front];
        front = (front + 1) % capacity;
        size--;
        return x;
    }
    T& frontElem() const {
        if (empty()) throw "underflow";
        return elem[front];
    }
};
```

**关键点**：
- `front` 指向队首元素
- `rear` 指向下一个可入队的位置
- 通过取模运算实现循环：`(index + 1) % capacity`

### 双端队列（Deque）

双端队列是一种同时支持在两端进行插入和删除操作的数据结构。

```
        head                      tail
    [   ] <-- insert/remove from front
    [   ] <-- insert/remove from rear
```

**时间复杂度**：所有操作均为 $O(1)$

```cpp
// C++ STL deque
deque<int> dq;
dq.push_front(x);  // O(1)
dq.push_back(x);   // O(1)
dq.pop_front();    // O(1)
dq.pop_back();     // O(1)
```

### 单调队列（Monotonic Queue）

单调队列维护队列中元素的单调性（通常用于滑动窗口问题）。

#### 经典问题：滑动窗口最大值（Sliding Window Maximum）

给定数组和窗口大小 $k$，找出每个滑动窗口中的最大值。

```cpp
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq; // stores indices, decreasing order
    vector<int> res;
    for (int i = 0; i < nums.size(); i++) {
        // 移除超出窗口范围的元素
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        // 移除比当前元素小的元素（它们永远不会成为最大值）
        while (!dq.empty() && nums[i] >= nums[dq.back()]) dq.pop_back();
        dq.push_back(i);
        // 记录窗口最大值
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    return res;
}
```

**时间复杂度**：$O(n)$，每个元素最多入队和出队各一次。

---

## 用栈实现队列 / 用队列实现栈

栈和队列可以相互实现，利用逆序的特性。

### 用两个栈实现队列

**核心思想**：一个栈用于入队，另一个栈用于出队。出队时如果出队栈为空，则将入队栈的所有元素倒入出队栈。

```cpp
class QueueByTwoStacks {
    stack<int> s1, s2; // s1 for enqueue, s2 for dequeue
    void transfer() {
        while (!s1.empty()) {
            s2.push(s1.top());
            s1.pop();
        }
    }
public:
    void enqueue(int x) { s1.push(x); }
    int dequeue() {
        if (s2.empty()) transfer();
        if (s2.empty()) throw "empty";
        int x = s2.top(); s2.pop(); return x;
    }
    bool empty() const { return s1.empty() && s2.empty(); }
};
```

**复杂度分析**：
- `enqueue`: $O(1)$
- `dequeue`: 均摊 $O(1)$（每次transfer后可以出队 $n$ 个元素）

### 用两个队列实现栈

**核心思想**：入栈时加入非空队列，出栈时将 $n-1$ 个元素移到另一个队列，弹出最后一个。

```cpp
class StackByTwoQueues {
    queue<int> q1, q2;
    bool useq1 = true;
    void transfer(int n) {
        queue<int>& src = useq1 ? q1 : q2;
        queue<int>& dst = useq1 ? q2 : q1;
        for (int i = 0; i < n - 1; i++) {
            dst.push(src.front());
            src.pop();
        }
        src.pop();
        useq1 = !useq1;
    }
public:
    void push(int x) {
        (useq1 ? q1 : q2).push(x);
    }
    int pop() {
        int n = useq1 ? q1.size() : q2.size();
        transfer(n);
        return 0; // 已在transfer中弹出了
    }
};
```

**复杂度分析**：
- `push`: $O(1)$
- `pop`: 均摊 $O(1)$

---

## 应用实例

### 1. 表达式求值（Expression Evaluation）

#### 中缀转后缀（Shunting Yard 算法）

利用栈将中缀表达式转为后缀（逆波兰）表示。

**规则**：
- 操作数：直接输出
- 左括号：压入栈
- 右括号：弹出栈直到遇到左括号
- 操作符：如果栈顶操作符优先级 $\geq$ 当前操作符，弹出栈顶；否则压入栈

```cpp
int precedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

string infixToPostfix(const string& infix) {
    stack<char> st;
    string result;
    for (char c : infix) {
        if (isdigit(c)) {
            result += c;
        } else if (c == '(') {
            st.push(c);
        } else if (c == ')') {
            while (!st.empty() && st.top() != '(') {
                result += st.top();
                st.pop();
            }
            st.pop();
        } else {
            while (!st.empty() && precedence(st.top()) >= precedence(c)) {
                result += st.top();
                st.pop();
            }
            st.push(c);
        }
    }
    while (!st.empty()) {
        result += st.top();
        st.pop();
    }
    return result;
}
```

#### 后缀表达式求值

```cpp
int evaluatePostfix(const string& expr) {
    stack<int> st;
    for (char c : expr) {
        if (isdigit(c)) {
            st.push(c - '0');
        } else {
            int b = st.top(); st.pop();
            int a = st.top(); st.pop();
            switch (c) {
                case '+': st.push(a + b); break;
                case '-': st.push(a - b); break;
                case '*': st.push(a * b); break;
                case '/': st.push(a / b); break;
            }
        }
    }
    return st.top();
}
```

**示例**：中缀表达式 `3 + 4 * 2` 的后缀表示为 `3 4 2 * +`

### 2. 括号匹配（Parentheses Matching）

利用栈检查括号是否匹配。遇到左括号入栈，遇到右括号检查栈顶是否是对应的左括号。

```cpp
bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            if (c == ')' && st.top() != '(') return false;
            if (c == '}' && st.top() != '{') return false;
            if (c == ']' && st.top() != '[') return false;
            st.pop();
        }
    }
    return st.empty();
}
```

**复杂度**：$O(n)$ 时间，$O(n)$ 空间

### 3. 迷宫问题（BFS with Queue）

使用队列实现广度优先搜索（BFS），可以找到从起点到终点的最短路径。

```cpp
struct Pos { int x, y; };

vector<string> directions = {"up", "down", "left", "right"};

int bfsMaze(vector<vector<int>>& maze, Pos start, Pos end) {
    int m = maze.size(), n = maze[0].size();
    vector<vector<bool>> visited(m, vector<bool>(n, false));
    queue<pair<Pos, int>> q; // position and distance
    q.push({start, 0});
    visited[start.x][start.y] = true;

    while (!q.empty()) {
        auto [pos, dist] = q.front();
        q.pop();
        if (pos.x == end.x && pos.y == end.y) return dist;

        for (int i = 0; i < 4; i++) {
            int nx = pos.x + dx[i];
            int ny = pos.y + dy[i];
            if (nx >= 0 && nx < m && ny >= 0 && ny < n &&
                !visited[nx][ny] && maze[nx][ny] == 0) {
                visited[nx][ny] = true;
                q.push({{nx, ny}, dist + 1});
            }
        }
    }
    return -1; // cannot reach
}
```

---

## 总结

| 数据结构 | 特性 | 经典应用 |
|----------|------|----------|
| 栈 (Stack) | LIFO | 表达式求值、括号匹配、DFS |
| 单调栈 | 找下一个更大/更小元素 | Next Greater Element |
| 队列 (Queue) | FIFO | BFS、层次遍历 |
| 双端队列 (Deque) | 两端操作 $O(1)$ | 滑动窗口最大值 |
| 单调队列 | 维护滑动窗口最值 | Sliding Window Maximum |

**核心思想**：栈和队列本质上是对插入和删除操作的限制，利用这些限制可以解决特定类型的问题。单调栈/队列通过维护单调性，将 $O(n^2)$ 的问题优化到 $O(n)$。