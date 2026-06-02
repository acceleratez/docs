# Chapter 5: Duality

Duality is a central concept in optimization theory. It associates with every optimization problem (the *primal*) a companion *dual problem* whose optimal value provides a lower bound on the primal optimal value. Under convexity and suitable regularity conditions, the two optimal values coincide (strong duality), giving rise to powerful optimality conditions known as the KKT conditions.

---

## 5.1 Motivation: From Constrained to Unconstrained

Consider the single-inequality problem

$$p^* = \min_x \; f(x) \quad \text{s.t.} \quad g(x) \le 0.$$

Constrained problems are difficult to optimize directly. The key idea is to absorb the constraint into the objective using an indicator function:

$$I_{g\le 0}(x) = \begin{cases} 0, & g(x) \le 0, \\ +\infty, & g(x) > 0. \end{cases}$$

Then the problem becomes unconstrained:

$$p^* = \min_x \; \bigl( f(x) + I_{g\le 0}(x) \bigr).$$

### 5.1.1 Linearizing the Indicator

> **Key Claim**
>
> $$I_{g\le 0}(x) = \max_{\lambda \ge 0} \; \lambda g(x).$$

*Explanation:* If $g(x) \le 0$, then $\lambda g(x) \le 0$ for all $\lambda \ge 0$, so the supremum is $0$. If $g(x) > 0$, then $\lambda g(x) \to +\infty$ as $\lambda \to \infty$, so the supremum is $+\infty$.

Thus the indicator function can be expressed as a linear supremum.

### 5.1.2 Min–Max Reformulation

Substituting, we obtain

$$f(x) + I_{g\le 0}(x) = f(x) + \max_{\lambda \ge 0} \lambda g(x) = \max_{\lambda \ge 0} \bigl( f(x) + \lambda g(x) \bigr).$$

Hence the original problem becomes an unconstrained **min–max** problem:

$$p^* = \min_x \, \max_{\lambda \ge 0} \; \bigl( f(x) + \lambda g(x) \bigr).$$

**Game interpretation:** Player A (the minimizer) chooses $x$; Player B (the maximizer) chooses $\lambda \ge 0$. The quantity being optimized is

$$L(x,\lambda) = f(x) + \lambda g(x).$$

The order of play matters—this motivates the fundamental inequality of duality.

---

## 5.2 The Weak Max–Min Inequality

> **Theorem (Weak Max–Min Inequality)**
>
> For any function $\varphi(x,y)$,
>
> $$\max_y \min_x \varphi(x,y) \;\le\; \min_x \max_y \varphi(x,y).$$

*Proof sketch:* For any fixed $y_0$ and $x_0$,

$$\min_x \varphi(x, y_0) \le \varphi(x_0, y_0) \le \max_y \varphi(x_0, y).$$

Taking $\max_{y_0}$ on the left and then $\min_{x_0}$ on the right establishes the inequality.

Applying this inequality to the Lagrangian $L(x,\lambda) = f(x) + \lambda g(x)$ yields:

$$\max_{\lambda \ge 0} \min_x L(x,\lambda) \;\le\; \min_x \max_{\lambda \ge 0} L(x,\lambda) = p^*.$$

---

## 5.3 Definitions: Lagrangian, Dual Function, Dual Problem

For the single-inequality problem, we define:

> **Definition (Lagrangian, Single-Inequality Case)**
>
> $$L(x, \lambda) = f(x) + \lambda g(x), \qquad \lambda \ge 0.$$
>
> $\lambda$ is called the **Lagrange multiplier** (or dual variable).

> **Definition (Dual Function)**
>
> $$q(\lambda) = \min_x L(x, \lambda).$$

> **Definition (Dual Problem)**
>
> $$d^* = \max_{\lambda \ge 0} \; q(\lambda).$$

> **Definition (Weak Duality)**
>
> $$d^* \le p^*.$$
>
> The difference $p^* - d^*$ is called the **duality gap** (always $\ge 0$).

> **Definition (Strong Duality)**
>
> $p^* = d^*$. This holds for convex problems under appropriate regularity conditions (e.g., Slater's condition).

### Example: Unit Circle Constraint

Consider

$$\min_{x_1, x_2} \; x_1 + x_2 \quad \text{s.t.} \quad x_1^2 + x_2^2 \le 1.$$

* **Lagrangian:** $L(x,\lambda) = x_1 + x_2 + \lambda(x_1^2 + x_2^2 - 1), \;\lambda \ge 0.$

* **Dual function:** For $\lambda > 0$,
  $$g(\lambda) = \min_x L(x,\lambda) = -\frac{1}{2\lambda} - \lambda, \qquad \bigl(x_1^* = x_2^* = -\tfrac{1}{2\lambda}\bigr).$$

* **Dual problem:**
  $$\max_{\lambda \ge 0} \; g(\lambda) = \max_{\lambda \ge 0} \left(-\frac{1}{2\lambda} - \lambda\right) = -\sqrt{2}, \qquad \left(\lambda^* = \tfrac{1}{\sqrt{2}}\right).$$

* **Verification:** The primal solution is $x^* = (-\frac{1}{\sqrt{2}}, -\frac{1}{\sqrt{2}})$ on the unit circle, giving $p^* = -\sqrt{2} = d^*$. **Strong duality holds.**

---

## 5.4 The General Optimization Problem

Extend the idea to the standard form:

$$\begin{aligned}
\min_x \quad & f(x) \\
\text{s.t.} \quad & g_i(x) \le 0, \quad i = 1,\dots,m, \\
& h_j(x) = 0, \quad j = 1,\dots,p.
\end{aligned}$$

* Inequality constraints require $\lambda_i \ge 0$ (nonnegative multipliers).
* Equality constraints require no sign restriction on $\nu_j \in \mathbb{R}$.

> **Definition (Lagrangian, General Case)**
>
> Let $\lambda \in \mathbb{R}^m_+$ and $\nu \in \mathbb{R}^p$. The Lagrangian is
>
> $$L(x, \lambda, \nu) = f(x) + \sum_{i=1}^{m} \lambda_i g_i(x) + \sum_{j=1}^{p} \nu_j h_j(x) = f(x) + \lambda^\top g(x) + \nu^\top h(x).$$

> **Definition (Lagrange Dual Function)**
>
> $$g(\lambda, \nu) = \inf_{x \in \mathcal{D}} L(x, \lambda, \nu) = \inf_{x \in \mathcal{D}} \left( f(x) + \sum_{i=1}^{m} \lambda_i g_i(x) + \sum_{j=1}^{p} \nu_j h_j(x) \right),$$
>
> where $\mathcal{D}$ is the domain of the primal problem.
>
> **Properties:**
> - $g(\lambda, \nu)$ is a **concave** function of $(\lambda, \nu)$.
> - $g$ can be $-\infty$ for some $(\lambda, \nu)$, which defines its effective domain.
> - **Lower bound property:** If $\lambda \succeq 0$, then $g(\lambda, \nu) \le p^*$.

**Proof of lower bound property:** If $\tilde{x}$ is feasible and $\lambda \succeq 0$, then

$$f(\tilde{x}) \ge L(\tilde{x}, \lambda, \nu) \ge \inf_{x \in \mathcal{D}} L(x, \lambda, \nu) = g(\lambda, \nu).$$

Minimizing over all feasible $\tilde{x}$ gives $p^* \ge g(\lambda, \nu)$.

> **Definition (Lagrange Dual Problem)**
>
> $$\begin{aligned}
> \max_{\lambda, \nu} \quad & g(\lambda, \nu) \\
> \text{s.t.} \quad & \lambda \succeq 0.
> \end{aligned}$$
>
> * Always a convex optimization problem (maximization of a concave function), even when the primal is nonconvex.
> * Optimal value denoted $d^*$.
> * $(\lambda, \nu)$ is **dual feasible** if $\lambda \succeq 0$ and $(\lambda, \nu) \in \operatorname{dom} g$.
> * $d^* = -\infty$ if the problem is infeasible; $d^* = +\infty$ if unbounded above.

### Why the Dual Problem is Always Convex

$$g(\lambda, \nu) = \min_x \left( f(x) + \sum_{i=1}^m \lambda_i g_i(x) + \sum_{j=1}^p \nu_j h_j(x) \right) = -\max_x \left( -f(x) - \sum_{i=1}^m \lambda_i g_i(x) - \sum_{j=1}^p \nu_j h_j(x) \right).$$

This is the (negative) pointwise supremum of affine functions in $(\lambda, \nu)$, hence concave. The constraint $\lambda \succeq 0$ is convex. Thus the dual is a concave maximization—i.e., a convex optimization problem.

---

## 5.5 Weak and Strong Duality

> **Theorem (Weak Duality)**
>
> $$d^* \le p^*.$$
>
> This holds **always**—for convex and nonconvex problems alike. It can be used to find nontrivial lower bounds for difficult problems.

For example, solving the SDP dual of the two-way partitioning problem provides a lower bound on its (NP-hard) primal.

> **Theorem (Strong Duality)**
>
> $d^* = p^*$ does **not** hold in general, but **(usually) holds for convex problems**. Sufficient conditions that guarantee strong duality in convex problems are called **constraint qualifications**.

---

## 5.6 Slater's Constraint Qualification

Consider a convex problem:

$$\begin{aligned}
\min_x \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1,\dots,m, \\
& Ax = b.
\end{aligned}$$

> **Definition (Slater's Condition)**
>
> The problem is **strictly feasible**, i.e., there exists $x \in \operatorname{int} \mathcal{D}$ such that
>
> $$f_i(x) < 0, \quad i = 1,\dots,m, \qquad Ax = b.$$

> **Theorem (Slater's Theorem)**
>
> If the primal is convex and Slater's condition holds, then:
> 1. **Strong duality** holds: $p^* = d^*$.
> 2. If $p^* > -\infty$, the **dual optimum is attained**: there exist dual optimal $\lambda^*, \nu^*$.

**Refinements:**
- $\operatorname{int} \mathcal{D}$ can be replaced with $\operatorname{relint} \mathcal{D}$ (relative interior).
- Linear inequalities do not need to hold with strict inequality.
- Many other constraint qualifications exist.

---

## 5.7 Complementary Slackness

Assume $x$ satisfies the primal constraints and $\lambda \succeq 0$. Then

$$\begin{aligned}
g(\lambda, \nu) &= \inf_{\tilde{x} \in \mathcal{D}} \left( f_0(\tilde{x}) + \sum_{i=1}^m \lambda_i f_i(\tilde{x}) + \sum_{i=1}^p \nu_i h_i(\tilde{x}) \right) \\
&\le f_0(x) + \sum_{i=1}^m \lambda_i f_i(x) + \sum_{i=1}^p \nu_i h_i(x) \\
&\le f_0(x).
\end{aligned}$$

Equality $f_0(x) = g(\lambda, \nu)$ holds if and only if **both** inequalities hold with equality:

1. **First inequality:** $x$ minimizes $L(\tilde{x}, \lambda, \nu)$ over $\tilde{x} \in \mathcal{D}$.
2. **Second inequality:** $\lambda_i f_i(x) = 0$ for $i = 1,\dots,m$.

> **Definition (Complementary Slackness)**
>
> $$\lambda_i > 0 \;\Longrightarrow\; f_i(x) = 0, \qquad f_i(x) < 0 \;\Longrightarrow\; \lambda_i = 0.$$
>
> Equivalently, $\lambda_i f_i(x) = 0$ for all $i = 1,\dots,m$.

The name reflects that at least one of $\lambda_i$ and $f_i(x)$ is "slack" (zero) while the other may be tight.

---

## 5.8 KKT (Karush–Kuhn–Tucker) Conditions

Assume strong duality holds, $x^*$ is primal optimal, and $(\lambda^*, \nu^*)$ is dual optimal. Then the following **necessary conditions** hold:

1. **Primal feasibility:** $f_i(x^*) \le 0$ for $i = 1,\dots,m$ and $h_i(x^*) = 0$ for $i = 1,\dots,p$.
2. **Dual feasibility:** $\lambda^* \succeq 0$.
3. **Complementary slackness:** $\lambda_i^* f_i(x^*) = 0$ for $i = 1,\dots,m$.
4. **Stationarity:** $x^*$ is a minimizer of $L(\cdot, \lambda^*, \nu^*)$.

Conversely, these four conditions imply optimality of $x^*$ and $(\lambda^*, \nu^*)$, and strong duality.

If the problem is convex and the functions $f_i$, $h_i$ are differentiable, condition 4 can be written as:

> **Definition (KKT Conditions for Differentiable Problems)**
>
> A point $(x^*, \lambda^*, \nu^*)$ satisfies the **KKT conditions** if:
>
> 1. **Primal feasibility:** $g_i(x^*) \le 0,\; h_j(x^*) = 0$
> 2. **Dual feasibility:** $\lambda_i^* \ge 0$
> 3. **Complementary slackness:** $\lambda_i^* g_i(x^*) = 0$
> 4. **Stationarity:**
>    $$\nabla f(x^*) + \sum_{i=1}^{m} \lambda_i^* \nabla g_i(x^*) + \sum_{j=1}^{p} \nu_j^* \nabla h_j(x^*) = 0$$

### Role of the KKT Conditions

> **Theorem (KKT Necessity and Sufficiency)**
>
> **Necessity:** If $x^*$ is a primal optimal solution and Slater's condition holds, then there exist $(\lambda^*, \nu^*)$ such that $(x^*, \lambda^*, \nu^*)$ satisfies all KKT conditions.
>
> **Sufficiency:** If the problem is convex and $(x^*, \lambda^*, \nu^*)$ satisfies the KKT conditions, then $x^*$ is a globally optimal solution.

In summary: for a convex problem satisfying Slater's condition,

> $$x^* \text{ is optimal} \;\Longleftrightarrow\; \exists\, \lambda^*, \nu^* \text{ satisfying KKT conditions 1–4 (or 1,2,3,4')}.$$

---

## 5.9 Dual of Standard Problem Classes

### 5.9.1 Linear Program (LP) — Standard Form

**Primal:**

$$\begin{aligned}
\min_x \quad & c^\top x \\
\text{s.t.} \quad & Ax = b, \quad x \succeq 0.
\end{aligned}$$

**Lagrangian:** $L(x, \lambda, \nu) = c^\top x + \nu^\top(Ax - b) - \lambda^\top x = -b^\top \nu + (c + A^\top \nu - \lambda)^\top x.$

Since $L$ is affine in $x$, the dual function is finite only when $c + A^\top \nu - \lambda = 0$:

$$g(\lambda, \nu) = \begin{cases} -b^\top \nu, & A^\top \nu - \lambda + c = 0, \\ -\infty, & \text{otherwise.} \end{cases}$$

**Dual problem:**

$$\begin{aligned}
\max_{\nu} \quad & -b^\top \nu \\
\text{s.t.} \quad & A^\top \nu + c \succeq 0.
\end{aligned}$$

From Slater's condition: $p^* = d^*$ if there exists $\tilde{x} \succ 0$ with $A\tilde{x} = b$. In fact, $p^* = d^*$ except when both primal and dual are infeasible.

### 5.9.2 Linear Program (LP) — Inequality Form

**Primal:**

$$\begin{aligned}
\min_x \quad & c^\top x \\
\text{s.t.} \quad & Ax \preceq b.
\end{aligned}$$

**Lagrangian:** $L(x, \lambda) = c^\top x + \lambda^\top(Ax - b) = (c + A^\top \lambda)^\top x - b^\top \lambda, \quad \lambda \succeq 0.$

**Dual function:** $g(\lambda) = \inf_x \bigl((c + A^\top \lambda)^\top x - b^\top \lambda\bigr) = \begin{cases} -b^\top \lambda, & A^\top \lambda + c = 0, \\ -\infty, & \text{otherwise.} \end{cases}$

**Dual problem:**

$$\begin{aligned}
\max_{\lambda} \quad & -b^\top \lambda \\
\text{s.t.} \quad & A^\top \lambda + c = 0, \quad \lambda \succeq 0.
\end{aligned}$$

From Slater's condition: $p^* = d^*$ if $A\tilde{x} \prec b$ for some $\tilde{x}$.

### 5.9.3 Quadratic Program (QP)

Assume $P \in \mathbb{S}^n_{++}$ (positive definite).

**Primal:**

$$\begin{aligned}
\min_x \quad & x^\top P x \\
\text{s.t.} \quad & Ax \preceq b.
\end{aligned}$$

**Lagrangian:** $L(x, \lambda) = x^\top P x + \lambda^\top(Ax - b), \quad \lambda \succeq 0.$

**Dual function:** Minimizing over $x$ (set gradient to zero: $2Px + A^\top \lambda = 0 \implies x = -\frac{1}{2}P^{-1}A^\top \lambda$) gives

$$g(\lambda) = -\frac{1}{4} \lambda^\top A P^{-1} A^\top \lambda - b^\top \lambda.$$

**Dual problem:**

$$\begin{aligned}
\max_{\lambda} \quad & -\frac{1}{4} \lambda^\top A P^{-1} A^\top \lambda - b^\top \lambda \\
\text{s.t.} \quad & \lambda \succeq 0.
\end{aligned}$$

From Slater's condition: $p^* = d^*$ if $A\tilde{x} \prec b$ for some $\tilde{x}$. In fact, for QP, $p^* = d^*$ always.

### 5.9.4 Equality-Constrained QP

**Primal:**

$$\begin{aligned}
\min_x \quad & \frac{1}{2} x^\top Q x + c^\top x \\
\text{s.t.} \quad & Ax = b,
\end{aligned}$$

where $Q \succeq 0$ and $A$ has full row rank ($m \le n$).

**KKT system:**

$$\begin{bmatrix} Q & A^\top \\ A & 0 \end{bmatrix} \begin{bmatrix} x^* \\ \nu^* \end{bmatrix} = \begin{bmatrix} -c \\ b \end{bmatrix}.$$

Since the problem is convex, the KKT solution $(x^*, \nu^*)$ is globally optimal.

### 5.9.5 SDP Connection (Two-Way Partitioning)

**Primal (nonconvex):**

$$\begin{aligned}
\min_x \quad & x^\top W x \\
\text{s.t.} \quad & x_i^2 = 1, \quad i = 1,\dots,n.
\end{aligned}$$

The feasible set is $\{-1, 1\}^n$ ($2^n$ discrete points). The cost can be written as $x^\top W x = \sum_i W_{ii} + 2\sum_{i>j} W_{ij} x_i x_j$, where the cost of assigning $i$ and $j$ to different sets is $-4W_{ij}$.

**Lagrangian:** $L(x, \nu) = x^\top W x + \sum_{i=1}^n \nu_i(x_i^2 - 1) = x^\top (W + \operatorname{diag}(\nu)) x - \mathbf{1}^\top \nu.$

**Dual function:**

$$g(\nu) = \begin{cases} -\mathbf{1}^\top \nu, & W + \operatorname{diag}(\nu) \succeq 0, \\ -\infty, & \text{otherwise.} \end{cases}$$

**Dual problem (SDP):**

$$\begin{aligned}
\max_{\nu} \quad & -\mathbf{1}^\top \nu \\
\text{s.t.} \quad & W + \operatorname{diag}(\nu) \succeq 0.
\end{aligned}$$

Lower bound: $p^* \ge -\mathbf{1}^\top \nu$ if $W + \operatorname{diag}(\nu) \succeq 0$. For example, choosing $\nu = -\lambda_{\min}(W)\mathbf{1}$ yields $p^* \ge n\lambda_{\min}(W)$.

---

## 5.10 Geometric Interpretation of Duality

The relationship between the primal and dual problems can be understood geometrically as a min–max exchange. The primal problem minimizes over $x$ the pointwise maximum (over $\lambda \ge 0$) of the Lagrangian; the dual maximizes over $\lambda \ge 0$ the pointwise minimum (over $x$) of the Lagrangian:

$$\underbrace{\max_{\lambda \ge 0} \min_x L(x,\lambda)}_{d^*} \;\le\; \underbrace{\min_x \max_{\lambda \ge 0} L(x,\lambda)}_{p^*}.$$

The duality gap $p^* - d^* \ge 0$ measures the "wedge" between these two saddle-point problems. Strong duality ($p^* = d^*$) occurs precisely when a saddle point of $L(x,\lambda)$ exists—i.e., there is a pair $(x^*, \lambda^*)$ such that

$$L(x^*, \lambda) \le L(x^*, \lambda^*) \le L(x, \lambda^*)$$

for all $x$ and $\lambda \ge 0$. This is the essence of the KKT conditions.

### Epigraph Interpretation

Define the set

$$\mathcal{A} = \bigl\{ (u, t) \in \mathbb{R}^{m+1} \;\big|\; \exists x : f_i(x) \le u_i \;(i=1,\dots,m),\; f_0(x) \le t \bigr\}.$$

The primal optimal value is $p^* = \inf\{ t \mid (0, t) \in \mathcal{A} \}$. The dual problem can be viewed as finding the best affine support (hyperplane) to $\mathcal{A}$ from below, parametrized by $\lambda \succeq 0$:

$$g(\lambda) = \inf_{(u,t) \in \mathcal{A}} \bigl( t + \lambda^\top u \bigr).$$

When $\mathcal{A}$ is convex (as in convex problems), supporting hyperplane theorems explain why strong duality tends to hold under mild regularity conditions.

---

## 5.11 Sensitivity Analysis

Dual variables carry economic meaning: they measure the sensitivity of the optimal value to perturbations in the constraints.

### 5.11.1 Single Perturbation

Consider perturbing a single inequality constraint $g(x) \le 0$ to $g(x) \le u$:

$$p^*(u) = \min_x \bigl\{ f(x) \mid g(x) \le u \bigr\}.$$

> **Global Lower Bound**
>
> $$p^*(u) \ge p^* - \lambda^* u,$$
>
> where $\lambda^*$ is the optimal dual variable for the original ($u=0$) problem, assuming strong duality holds.

- If $\lambda^*$ is **large** and $u < 0$ (tightening the constraint): $p^*(u)$ increases greatly.
- If $\lambda^*$ is **small** and $u > 0$ (loosening the constraint): $p^*(u)$ does not decrease much.

> **Local Sensitivity**
>
> $$\frac{d p^*(u)}{d u} = -\lambda^*.$$
>
> For small $|u|$, $p^*(u) \approx p^* - \lambda^* u$.

**Economic interpretation:** $\lambda^*$ is the **shadow price** of the constraint. If the market price for relaxing this resource is less than $\lambda^*$, it pays to buy more. If the price exceeds $\lambda^*$, it is advantageous to sell (violate) the constraint.

### 5.11.2 General Case (Multiple Perturbations)

Perturb both inequality and equality constraints:

$$\begin{aligned}
p^*(u, \ell) = \min_x \quad & f(x) \\
\text{s.t.} \quad & g_i(x) \le u_i, \quad i = 1,\dots,m, \\
& h_i(x) = \ell_i, \quad i = 1,\dots,p.
\end{aligned}$$

> **Global Lower Bound**
>
> $$p^*(u, \ell) \ge q(\lambda^*, \nu^*) - u^\top \lambda^* - \ell^\top \nu^* = p^*(0,0) - u^\top \lambda^* - \ell^\top \nu^*.$$

**Interpretation of dual variables:**

| Sign of $\lambda_i^*$, $\nu_i^*$ | Effect of perturbation |
|:---|:---|
| Large $\lambda_i^*$ | $p^*$ increases greatly if $u_i < 0$ (tighten) |
| Small $\lambda_i^*$ | $p^*$ decreases little if $u_i > 0$ (loosen) |
| Large positive $\nu_i^*$ | $p^*$ increases greatly if $\ell_i < 0$ |
| Large negative $\nu_i^*$ | $p^*$ increases greatly if $\ell_i > 0$ |
| Small $|\nu_i^*|$ | $p^*$ changes little for either sign |

> **Local Sensitivity (General Case)**
>
> $$\frac{\partial p^*(u, \ell)}{\partial u_i} = -\lambda_i^*, \qquad \frac{\partial p^*(u, \ell)}{\partial \ell_i} = -\nu_i^*.$$

---

## 5.12 Worked Examples

### 5.12.1 Least-Norm Solution of Linear Equations

**Primal:**

$$\begin{aligned}
\min_x \quad & x^\top x \\
\text{s.t.} \quad & Ax = b.
\end{aligned}$$

**Lagrangian:** $L(x, \nu) = x^\top x + \nu^\top(Ax - b).$

Set gradient to zero: $\nabla_x L = 2x + A^\top \nu = 0 \implies x = -\frac{1}{2}A^\top \nu.$

Plug into $L$:

$$g(\nu) = L\!\left(-\tfrac{1}{2}A^\top \nu, \nu\right) = -\frac{1}{4} \nu^\top A A^\top \nu - b^\top \nu.$$

This is a concave function of $\nu$. By the lower bound property:

$$p^* \ge -\frac{1}{4} \nu^\top A A^\top \nu - b^\top \nu \quad \text{for all } \nu.$$

### 5.12.2 Water-Filling (Power Allocation)

**Primal (reformulated):**

$$\begin{aligned}
\min_x \quad & -\sum_{i=1}^n \ln(x_i + \alpha_i) \\
\text{s.t.} \quad & x \succeq 0, \quad \mathbf{1}^\top x = 1,
\end{aligned}$$

where $\alpha_i > 0$.

**Lagrangian:** $L(x, \lambda, \nu) = -\sum_i \ln(x_i + \alpha_i) - \lambda^\top x + \nu(\mathbf{1}^\top x - 1).$

**KKT conditions:** $x^*$ is optimal iff there exist $\lambda \in \mathbb{R}^n$, $\nu \in \mathbb{R}$ such that:

1. $x^* \succeq 0$, $\mathbf{1}^\top x^* = 1$
2. $\lambda \succeq 0$
3. $\lambda_i x_i^* = 0$, $i = 1,\dots,n$
4. Stationarity: $-\frac{1}{x_i^* + \alpha_i} - \lambda_i + \nu = 0$, $i = 1,\dots,n$.

**Solution:**

- If $\nu \le 1/\alpha_i$: $\lambda_i = 0$ and $x_i^* = 1/\nu - \alpha_i$.
- If $\nu \ge 1/\alpha_i$: $x_i^* = 0$ and $\lambda_i = \nu - 1/\alpha_i$.

These combine to

$$x_i^* = \max\left\{0, \frac{1}{\nu} - \alpha_i\right\}, \qquad \lambda_i = \max\left\{0, \nu - \frac{1}{\alpha_i}\right\}.$$

Determine $\nu$ from $\mathbf{1}^\top x^* = 1$:

$$\sum_{i=1}^n \max\left\{0, \frac{1}{\nu} - \alpha_i\right\} = 1.$$

**Interpretation:** Think of $n$ patches at heights $\alpha_i$. Flood the area with a unit amount of water. The resulting water level is $1/\nu^*$; patch $i$ receives $x_i^*$ water.

### 5.12.3 Projection onto the 1-Norm Ball

**Primal:**

$$\begin{aligned}
\min_x \quad & \frac{1}{2} \|x - a\|_2^2 \\
\text{s.t.} \quad & \|x\|_1 \le 1.
\end{aligned}$$

**KKT conditions:**

1. $\|x\|_1 \le 1$
2. $\lambda \ge 0$
3. $\lambda(1 - \|x\|_1) = 0$
4. $x$ minimizes $L(\tilde{x}, \lambda) = \frac{1}{2}\|\tilde{x} - a\|_2^2 + \lambda(\|\tilde{x}\|_1 - 1) = \sum_{k=1}^n \bigl(\frac{1}{2}(\tilde{x}_k - a_k)^2 + \lambda|\tilde{x}_k|\bigr) - \lambda.$

The problem is separable. For $\lambda \ge 0$, the minimizer is the soft-thresholding operator:

$$x_k = \begin{cases}
a_k - \lambda, & a_k \ge \lambda, \\
0, & -\lambda \le a_k \le \lambda, \\
a_k + \lambda, & a_k \le -\lambda.
\end{cases}$$

Hence $\|x\|_1 = \sum_k |x_k| = \sum_k \max\{0, |a_k| - \lambda\}.$

- If $\|a\|_1 \le 1$, solution is $\lambda = 0$, $x = a$.
- Otherwise, solve the piecewise-linear equation in $\lambda$:

$$\sum_{k=1}^n \max\{0, |a_k| - \lambda\} = 1.$$

---

## 5.13 Summary

| Concept | Key Idea |
|:---|---|
| **Lagrangian** | Weighted sum of objective and constraints |
| **Dual function** | Infimum of Lagrangian over primal variables; always concave |
| **Dual problem** | Maximize dual function over $\lambda \succeq 0$; always convex |
| **Weak duality** | $d^* \le p^*$ (always holds) |
| **Strong duality** | $d^* = p^*$ (holds for convex problems under constraint qualifications) |
| **Slater's condition** | Existence of a strictly feasible point guarantees strong duality |
| **Complementary slackness** | $\lambda_i^* g_i(x^*) = 0$ — at optimum, at least one of $\lambda_i$, $g_i(x)$ is zero |
| **KKT conditions** | Necessary and sufficient optimality conditions for convex problems under Slater |
| **Sensitivity** | $\partial p^* / \partial u_i = -\lambda_i^*$ — dual variables as shadow prices |
