# Chapter 11: Interior-Point Methods

Interior-point methods solve convex optimization problems by reducing them to a sequence of unconstrained (or equality-constrained) problems via barrier functions. They are powerful alternatives to the simplex method for linear programming and extend naturally to general convex optimization.

---

## 11.1 Single-Inequality Optimization Problem

Consider the simplest constrained convex problem:

$$\min_x \; f(x) \quad \text{s.t.} \quad g(x) \le 0$$

where $f$ and $g$ are convex and twice continuously differentiable.

### 11.1.1 Standard KKT Conditions

Let $x^*$ be the optimal solution. Under Slater's condition, there exists a Lagrange multiplier $\lambda^*$ satisfying the **KKT conditions**:

> **KKT Conditions (Single Inequality)**
>
> 1. **Primal feasibility:** $g(x^*) \le 0$
> 2. **Dual feasibility:** $\lambda^* \ge 0$
> 3. **Complementary slackness:** $\lambda^* g(x^*) = 0$
> 4. **Stationarity:** $\nabla f(x^*) + \lambda^* \nabla g(x^*) = 0$

### 11.1.2 The KKT(t) Conditions — A Modified System

To derive the barrier method, we introduce a parameter $t > 0$ and consider the **modified KKT system**, denoted KKT($t$):

> **KKT($t$) Conditions**
>
> 1. $g(x_t) \le 0$
> 2. $\lambda_t \ge 0$
> 3. $\lambda_t \, g(x_t) = -t$ &nbsp;&nbsp; *(perturbed complementary slackness)*
> 4. $\nabla f(x_t) + \lambda_t \nabla g(x_t) = 0$

From condition 3, we see that $\lambda_t = -\dfrac{t}{g(x_t)}$ (note $g(x_t) < 0$ when $t > 0$ and $x_t$ is strictly feasible). Substituting into the stationarity condition yields:

$$\nabla f(x_t) - \frac{t}{g(x_t)} \nabla g(x_t) = 0$$

We solve for $x_t$ using Newton's method. The key bound is:

> **Duality Gap Bound (Single Inequality)**
>
> $$f(x_t) - p^* \le t$$

As $t \to 0$, the solution $x_t$ converges to the true optimum $x^*$, and the KKT($t$) conditions converge to the standard KKT conditions.

---

## 11.2 Logarithmic Barrier Function: An Alternative Interpretation

### 11.2.1 Indicator Function Approximation

The original constrained problem

$$\min_x \; f(x) \quad \text{s.t.} \quad g(x) \le 0$$

is equivalent to the unconstrained problem

$$\min_x \; \bigl( f(x) + I_{g \le 0}(x) \bigr)$$

where the indicator function is

$$I_{g \le 0}(x) = \begin{cases} 0, & g(x) \le 0, \\ +\infty, & g(x) > 0. \end{cases}$$

The interior-point approach approximates the non-smooth indicator with a smooth function. For $t > 0$, we define:

> **Logarithmic Barrier Approximation**
>
> $$I_{g \le 0}(x) \approx -t \ln(-g(x))$$

This yields the approximate problem:

$$\min_x \; f(x) - t \ln(-g(x))$$

### 11.2.2 Properties of the Barrier

- The term $-t\ln(-g(x))$ acts as a **barrier**: it approaches $+\infty$ as $g(x) \to 0$ from below, keeping iterates strictly inside the feasible region ($g(x) < 0$).
- As $t \to 0$, the barrier effect diminishes, and the solution approaches the true optimum.
- The optimality condition for the barrier problem is precisely the KKT($t$) stationarity condition:

$$\nabla f(x_t) - \frac{t}{g(x_t)} \nabla g(x_t) = 0$$

- The duality gap bound is $f(x_t) - p^* \le t$.

> **Key Insight**
>
> The barrier method can be viewed as solving a **sequence** of modified KKT systems. Each subproblem (the "centering step") is solved by Newton's method. When $t$ is small enough, the solution is near-optimal for the original problem.

---

## 11.3 General Barrier Problem

### 11.3.1 Problem Statement

Consider the general convex optimization problem:

$$\begin{aligned} \min_x \quad & f(x) \\ \text{s.t.} \quad & g_i(x) \le 0, \quad i = 1, \dots, m \\ & Ax = b \end{aligned}$$

We assume $f, g_1, \dots, g_m$ are convex and twice continuously differentiable, and Slater's condition holds.

> **Definition (Logarithmic Barrier Function)**
>
> $$\phi(x) = -\sum_{i=1}^{m} \ln(-g_i(x))$$
>
> The domain of $\phi$ is $\{ x \mid g_i(x) < 0,\; i = 1, \dots, m \}$.

> **Definition (Barrier Problem / Centering Problem)**
>
> For a given parameter $t > 0$, solve:
>
> $$\begin{aligned} \min_x \quad & f(x) + t \, \phi(x) \\ \text{s.t.} \quad & Ax = b \end{aligned}$$
>
> Equivalently:
>
> $$\min_x \; f(x) - t \sum_{i=1}^{m} \ln(-g_i(x)) \quad \text{s.t.} \quad Ax = b$$

### 11.3.2 Duality Gap Bound

Let $x_t$ be the solution of the barrier problem (the minimizer for a given $t$).

> **Theorem (Duality Gap for $m$ Inequalities)**
>
> $$f(x_t) - p^* \le m t$$
>
> *Proof sketch:* The KKT($t$) conditions give $\lambda_{t,i} = -t / g_i(x_t)$ so $\lambda_{t,i} \ge 0$ (dual feasible). The Lagrangian is
>
> $$L(x_t, \lambda_t) = f(x_t) + \sum_i \lambda_{t,i} g_i(x_t) = f(x_t) - m t$$
>
> By weak duality, $p^* \ge \min_x L(x, \lambda_t) \ge L(x_t, \lambda_t)$ (since the barrier problem returns the exact minimizer under equality constraints), yielding
>
> $$p^* \ge f(x_t) - m t \quad\Longrightarrow\quad f(x_t) - p^* \le m t.$$

> **Interpretation**
>
> When $m t < \epsilon$, the solution $x_t$ is guaranteed to be $\epsilon$-suboptimal for the original problem. This is the stopping criterion for the barrier method.

---

## 11.4 The Barrier Method Algorithm

### 11.4.1 Algorithm

> **Algorithm: Barrier Method**
>
> **Input:** strictly feasible $x^{(0)}$, $t^{(0)} > 0$, $\mu \in (0, 1)$, tolerance $\epsilon > 0$.
>
> **Repeat:**
>
> 1. **Centering Step:** Compute $x_t$ by solving the barrier problem
>
>    $$\min_x \; f(x) - t \sum_{i=1}^{m} \ln(-g_i(x)) \quad \text{s.t.} \quad Ax = b$$
>
>    using Newton's method, initialized at $x^{(0)}$.
>
> 2. **Update:** $x^{(0)} := x_t$
>
> 3. **Stopping Criterion:** Quit if $m t < \epsilon$.
>
> 4. **Parameter Update:** $t := \mu t$

### 11.4.2 Key Parameters

- **Initial $t^{(0)}$:** Chosen to balance the influence of the objective and the barrier. Typically $t^{(0)} \approx f(x^{(0)}) - p^*$ if an estimate of $p^*$ is available, or a moderate value like $t^{(0)} = 1$ is used.
- **$\mu$:** The decreasing factor for $t$. Typical values: $\mu \in [10, 20]$ for linear programming (aggressive), $\mu \in [2, 5]$ for general nonlinear problems (conservative).
- **Centering tolerance:** Each centering step is solved to sufficient accuracy (not full convergence). A typical Newton method stops when the Newton decrement $\lambda(x)^2 / 2 \le 10^{-5}$.

### 11.4.3 Convergence Properties

- **Outer iterations:** Each iteration reduces $t$ by factor $\mu$, so $O(\log(1/\epsilon))$ outer iterations are needed.
- **Inner iterations (Newton):** Since each centering step is warm-started from the previous solution, only a few Newton steps per outer iteration are required in practice.
- The method is **polynomial-time** for linear programming and converges **superlinearly** or **quadratically** in practice.

### 11.4.4 Relation to KKT Conditions

As $t \to 0$, the barrier problem solution $x_t$ approaches a KKT point of the original problem:

- The modified complementary slackness $\lambda_{t,i} \, g_i(x_t) = -t$ becomes $\lambda_i^* \, g_i(x^*) = 0$.
- The central path $\{ x_t \mid t > 0 \}$ converges to the optimal solution $x^*$.
- Each centering step computes a point on the **central path**, which is a smooth trajectory of solutions parameterized by $t$.

---

## 11.5 Exercises

### Exercise 1 — Barrier Formulation

Consider the problem

$$\min_{x} \; x_1^2 + x_2^2 \quad \text{s.t.} \quad x_1 > 0,\; x_2 > 0,\; x_1 + x_2 < 1.$$

**1. Logarithmic barrier function $\phi(x)$:**

Rewrite each strict inequality into the standard form $g_i(x) \le 0$:

$$\begin{aligned} g_1(x) &= -x_1 \le 0 \\ g_2(x) &= -x_2 \le 0 \\ g_3(x) &= x_1 + x_2 - 1 \le 0 \end{aligned}$$

> **Barrier Function**
>
> $$\phi(x) = -\ln(x_1) - \ln(x_2) - \ln(1 - x_1 - x_2)$$

**2. Barrier problem for parameter $t > 0$:**

$$\min_{x} \; x_1^2 + x_2^2 - t\Bigl( \ln(x_1) + \ln(x_2) + \ln(1 - x_1 - x_2) \Bigr)$$

**3. Behavior of the minimizer as $t$ decreases:**

As $t \to 0$, the barrier term weakens, and the minimizer approaches the unconstrained minimum of $x_1^2 + x_2^2$ within the simplex. The unconstrained minimizer of $f(x) = \|x\|^2$ within the feasible polytope is the origin projected onto the simplex, i.e., the point closest to the origin inside the triangle. By symmetry, this is $(1/3, 1/3)$. As $t$ decreases, the minimizer $x_t$ moves along the central path toward $x^* = (1/3, 1/3)$.

### Exercise 2 — Centering Step with Equality Constraint

Consider

$$\min_{x} \; x_1^2 + x_2^2 \quad \text{s.t.} \quad x_1 + x_2 = 1,\; x_1 > 0,\; x_2 > 0.$$

**1. Barrier problem for parameter $t$:**

Rewrite inequalities: $g_1(x) = -x_1$, $g_2(x) = -x_2$. The barrier problem is:

$$\min_{x} \; x_1^2 + x_2^2 - t\bigl( \ln(x_1) + \ln(x_2) \bigr) \quad \text{s.t.} \quad x_1 + x_2 = 1.$$

**2. KKT conditions of the centering step:**

The Lagrangian for the barrier problem is

$$L(x, \nu) = x_1^2 + x_2^2 - t\ln(x_1) - t\ln(x_2) + \nu (x_1 + x_2 - 1).$$

> **KKT Conditions**
>
> $$\begin{aligned} \frac{\partial L}{\partial x_1} &= 2x_1 - \frac{t}{x_1} + \nu = 0 \\ \frac{\partial L}{\partial x_2} &= 2x_2 - \frac{t}{x_2} + \nu = 0 \\ x_1 + x_2 &= 1 \end{aligned}$$

**3. Analytical solution for $x_t$:**

From symmetry ($x_1 = x_2$), and the equality constraint $x_1 + x_2 = 1$, we obtain:

$$x_{t,1} = x_{t,2} = \frac{1}{2}$$

This solution is independent of $t$, because the problem is symmetric and the barrier respects that symmetry. (For non-symmetric problems, $x_t$ depends on $t$ and converges to the constrained optimum as $t \to 0$.)

### Exercise 3 — Barrier Method for Linear Programs

Consider the linear program in inequality form:

$$\min_x \; c^\top x \quad \text{s.t.} \quad a_i^\top x \le b_i, \quad i = 1, \dots, m.$$

(Write $A x \preceq b$ for the vector of inequalities.)

**1. Logarithmic barrier objective:**

> **Barrier Objective**
>
> $$B_t(x) = c^\top x - t \sum_{i=1}^{m} \ln(b_i - a_i^\top x)$$

The barrier problem is an unconstrained minimization: $\min_x \; B_t(x)$.

**2. Gradient and Hessian:**

Define the slack variables $s_i = b_i - a_i^\top x$ (strictly positive in the barrier domain). Then:

> **Gradient**
>
> $$\nabla B_t(x) = c + t \sum_{i=1}^{m} \frac{a_i}{s_i} = c + t A^\top S^{-1} \mathbf{1}$$
>
> where $S = \operatorname{diag}(s_1, \dots, s_m)$ and $\mathbf{1} = (1, \dots, 1)^\top$.

> **Hessian**
>
> $$\nabla^2 B_t(x) = t \sum_{i=1}^{m} \frac{a_i a_i^\top}{s_i^2} = t A^\top S^{-2} A$$

Note that the Hessian is positive definite when $A$ has full column rank (or more generally when the $a_i$ span $\mathbb{R}^n$), guaranteeing that the barrier objective is strictly convex.

**3. Newton step:**

The Newton direction $\Delta x_{\text{nt}}$ is obtained by solving the linear system:

$$\nabla^2 B_t(x) \, \Delta x_{\text{nt}} = -\nabla B_t(x)$$

Substituting the gradient and Hessian:

$$t A^\top S^{-2} A \, \Delta x_{\text{nt}} = -c - t A^\top S^{-1} \mathbf{1}$$

This is a symmetric positive definite system that can be solved efficiently.

### Exercise 4 — Duality Gap and Stopping Rule

Let $x_t$ be the solution of the barrier problem with $m$ inequality constraints.

**1. Show that the duality gap is bounded by $m t$:**

From the KKT($t$) conditions, set $\lambda_{t,i} = -\dfrac{t}{g_i(x_t)}$. Since $g_i(x_t) < 0$, we have $\lambda_{t,i} > 0$ (dual feasible). Define the dual function:

$$q(\lambda_t) = \min_x \; L(x, \lambda_t) = \min_x \left( f(x) + \sum_{i=1}^{m} \lambda_{t,i} \, g_i(x_t) \right)$$

By weak duality, $p^* \ge q(\lambda_t)$. The barrier solution satisfies the stationarity condition $\nabla f(x_t) + \sum_i \lambda_{t,i} \nabla g_i(x_t) = 0$, so $x_t$ minimizes the Lagrangian. Hence $q(\lambda_t) = f(x_t) + \sum_i \lambda_{t,i} \, g_i(x_t) = f(x_t) - m t$.

Therefore $p^* \ge f(x_t) - m t$, which implies:

$$f(x_t) - p^* \le m t$$

**2. Explain the stopping criterion $m t < \epsilon$:**

When $m t < \epsilon$, the duality gap bound guarantees that $f(x_t) - p^* \le \epsilon$. The current iterate $x_t$ is $\epsilon$-suboptimal, and the algorithm can terminate.

**3. Theoretical interpretation:**

This bound provides a **certificate** of near-optimality: the algorithm always maintains a provably feasible dual solution, and the duality gap shrinks geometrically (by factor $\mu$ per outer iteration). The number of outer iterations to achieve $\epsilon$-suboptimality is:

$$K = \left\lceil \frac{\log(m t^{(0)} / \epsilon)}{\log(1/\mu)} \right\rceil$$

---

## 11.6 Summary: The Central Path

The sequence of minimizers $\{ x_t \mid t > 0 \}$ of the barrier problems forms a smooth curve called the **central path**. Key properties:

- Every point on the central path is **strictly feasible** ($g_i(x_t) < 0$).
- As $t \to \infty$, $x_t$ converges to the **analytic center** of the feasible set (the minimizer of $-\sum \ln(-g_i(x))$).
- As $t \to 0$, $x_t$ converges to the **optimal solution** $x^*$.

> **Central Path Equations**
>
> $$\begin{aligned} \nabla f(x_t) + \sum_{i=1}^{m} \lambda_{t,i} \nabla g_i(x_t) + A^\top \nu_t &= 0 \\ \lambda_{t,i} \, g_i(x_t) &= -t, \quad i = 1, \dots, m \\ Ax_t &= b \end{aligned}$$

The barrier method follows this central path approximately, using Newton's method within each centering step and decreasing $t$ to march toward optimality. The relationship between the barrier method, KKT conditions, and duality theory provides a unified framework for understanding interior-point methods in convex optimization.
