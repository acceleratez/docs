# Chapter 4: Convex Optimization Problems

## 4.1 Optimization Problem in Standard Form

An optimization problem in **standard form** is written as

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1, \dots, m \\
& h_j(x) = 0, \quad j = 1, \dots, p
\end{aligned}
$$

where:

- $x \in \mathbb{R}^n$ is the **optimization variable**.
- $f_0 : \mathbb{R}^n \to \mathbb{R}$ is the **objective (cost) function**.
- $f_i$ are **inequality constraint** functions.
- $h_j$ are **equality constraint** functions.

### Optimal Value

The **optimal value** $p^\star$ of the problem is defined as

$$
p^\star = \inf\{\, f_0(x) \mid f_i(x) \le 0,\; h_j(x) = 0 \,\}
$$

- $p^\star = \infty$: the problem is **infeasible**.
- $p^\star = -\infty$: the problem is **unbounded below**.

### Feasible, Optimal, and Locally Optimal Points

- $x$ is **feasible** if it satisfies all constraints.
- $x$ is **optimal** if $x$ is feasible and $f_0(x) = p^\star$.
- $x$ is **locally optimal** if $x$ is optimal for (for any $R > 0$)

  $$
  \begin{aligned}
  \min_{z} \quad & f_0(z) \\
  \text{s.t.} \quad & f_i(z) \le 0, \quad i = 1, \dots, m \\
  & h_i(z) = 0, \quad i = 1, \dots, p \\
  & \|z - x\|_2 \le R
  \end{aligned}
  $$

- If $x$ is feasible and $f_0(x) - p^\star \le \varepsilon$, then $x$ is called **$\varepsilon$-suboptimal**.

**Examples** (with $n = 1$, $m = p = 0$):

- $f_0(x) = -\log x$, $\operatorname{dom} f_0 = \mathbb{R}_{++}$: $p^\star = -\infty$
- $f_0(x) = x\log x$, $\operatorname{dom} f_0 = \mathbb{R}_{++}$: $p^\star = -1/e$, $x^\star = 1/e$
- $f_0(x) = x^3 - 3x$, $\operatorname{dom} f_0 = \mathbb{R}$: $p^\star = -\infty$, local optimum at $x = 1$

### Implicit Constraints and Domain

The **implicit domain constraint** is

$$
x \in \mathcal{D} = \bigcap_{i=0}^{m} \operatorname{dom} f_i \; \cap \; \bigcap_{j=1}^{p} \operatorname{dom} h_j
$$

- $\mathcal{D}$ is the **domain** of the problem.
- **Explicit constraints**: $f_i(x) \le 0$, $h_j(x) = 0$.
- The problem is **unconstrained** if $m = p = 0$.

**Example:**

$$
\min_{x} \; f_0(x) = -\sum_{i=1}^{k} \log(b_i - a_i^\top x)
$$

is an unconstrained problem with implicit constraints $a_i^\top x < b_i$.

### Feasibility Problem

A **feasibility problem** asks whether any feasible point exists:

$$
\begin{aligned}
\text{find} \quad & x \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1, \dots, m \\
& h_j(x) = 0, \quad j = 1, \dots, p
\end{aligned}
$$

This can be considered a special case of the general problem with $f_0(x) \equiv 0$:

- $p^\star = 0$ if constraints are feasible (any feasible $x$ is optimal).
- $p^\star = \infty$ if infeasible.

---

## 4.2 Convex Optimization Problem

A problem is a **convex optimization problem** if it is of the form

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1, \dots, m \\
& a_i^\top x = b_i, \quad i = 1, \dots, p
\end{aligned}
$$

> **Definition.** An optimization problem is **convex** if:
> 1. $f_0$ is convex.
> 2. $f_1, \dots, f_m$ are convex.
> 3. $h_1, \dots, h_p$ are affine: $h_i(x) = a_i^\top x - b_i$.

> **Key Property.** The feasible set of a convex optimization problem is convex: it is the intersection of $m$ sublevel sets (of convex functions) and $p$ hyperplanes, which is convex.

---

## 4.3 Local and Global Optima

> **Theorem (Local = Global).** For a convex optimization problem, every locally optimal point is also globally optimal.

**Proof.** Suppose $x$ is locally optimal and there exists a feasible $y$ with $f_0(y) < f_0(x)$. For $z = \theta y + (1 - \theta)x$ with small $\theta > 0$, convexity gives

$$
f_0(z) \le \theta f_0(y) + (1 - \theta) f_0(x) < f_0(x)
$$

But local optimality requires $f_0(x) \le f_0(z)$ for all feasible $z$ sufficiently near $x$ — a contradiction.

> **Uniqueness.** If $f_0$ is **strictly convex**, then a convex optimization problem has at most one global minimizer (uniqueness).

---

## 4.4 First-Order Optimality Condition

For a convex problem

$$
\min_{x} \; f(x) \quad \text{s.t.} \quad x \in C
$$

> **Theorem (First-Order Optimality).** A feasible point $x^\star$ is optimal if and only if
> $$
> \langle \nabla f(x^\star),\, y - x^\star \rangle \ge 0 \quad \forall\, y \in C
> $$

Geometric interpretation:
- $\nabla f(x^\star)$ makes an acute ($\le 90^\circ$) angle with all feasible directions at an optimal $x^\star$.
- $\nabla f(x^\star)$ defines a supporting hyperplane to the feasible set $C$ at $x^\star$.
- $-\nabla f(x^\star)$ is normal to the tangent plane of the feasible set.

### Special Cases

**Unconstrained optimization:**

$$
\nabla f_0(x^\star) = 0
$$

**Equality-constrained minimization:**

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & Ax = b
\end{aligned}
\quad\Longrightarrow\quad \exists\, z : \nabla f_0(x^\star) + A^\top z = 0
$$

**Minimization over the nonnegative orthant:**

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & x \succeq 0
\end{aligned}
\quad\Longrightarrow\quad \nabla f_0(x^\star) \succeq 0,\quad x_i^\star (\nabla f_0(x^\star))_i = 0,\; i = 1, \dots, n
$$

### Example: Unconstrained Quadratic Minimization

Consider minimizing the quadratic function:

$$
f(x) = \frac{1}{2} x^\top Q x + b^\top x + c
$$

where $Q \succeq 0$. The first-order condition yields

$$
\nabla f(x) = Qx + b = 0
$$

- If $Q \succ 0$, there is a **unique solution**: $x = -Q^{-1} b$.
- If $Q$ is singular and $b \notin \mathcal{R}(Q)$, there is **no solution** ($\min_x f(x) = -\infty$).
- If $Q$ is singular and $b \in \mathcal{R}(Q)$, there are **infinitely many solutions**: $x = -Q^+ b + z$, $z \in \mathcal{N}(Q)$, where $Q^+$ is the pseudoinverse of $Q$.

---

## 4.5 Equivalent Transformations

Two problems are (informally) **equivalent** if their solutions can be readily converted into each other. Common transformations that preserve equivalence:

### Transformations and Change of Variables

If $h : \mathbb{R} \to \mathbb{R}$ is a monotone increasing transformation, then

$$
\min_{x \in C} f(x) \quad\Longleftrightarrow\quad \min_{x \in C} h(f(x))
$$

This can be used to reveal "hidden convexity" of a problem.

If $\varphi : \mathbb{R}^n \to \mathbb{R}^m$ is one-to-one and its image covers the feasible set $C$, then we can change variables:

$$
\min_{x} \; f(x) \;\; \text{s.t.} \;\; x \in C \quad\Longleftrightarrow\quad \min_{y} \; f(\varphi(y)) \;\; \text{s.t.} \;\; \varphi(y) \in C
$$

**Example: Log-likelihood transformation.** In maximum likelihood estimation (MLE), given independent samples $x_1, \dots, x_n$ with likelihood

$$
L(\theta) = \prod_{i=1}^{n} p(x_i \mid \theta)
$$

applying the strictly increasing $\log(\cdot)$ transformation yields

$$
\ell(\theta) = \log L(\theta) = \sum_{i=1}^{n} \log p(x_i \mid \theta)
$$

with the key property: $\operatorname{argmax}_\theta L(\theta) = \operatorname{argmax}_\theta \ell(\theta)$.

### Eliminating Equality Constraints

Given:

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1, \dots, m \\
& Ax = b
\end{aligned}
$$

Any feasible point can be expressed as $x = My + x_0$, where $Ax_0 = b$ and $\mathcal{R}(M) = \mathcal{N}(A)$. The problem is equivalent to

$$
\begin{aligned}
\min_{y} \quad & f_0(My + x_0) \\
\text{s.t.} \quad & f_i(My + x_0) \le 0, \quad i = 1, \dots, m
\end{aligned}
$$

### Introducing Slack Variables

Given:

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1, \dots, m \\
& Ax = b
\end{aligned}
$$

inequality constraints can be transformed via slack variables $s_i \ge 0$:

$$
\begin{aligned}
\min_{x, s} \quad & f_0(x) \\
\text{s.t.} \quad & s_i \ge 0, \quad i = 1, \dots, m \\
& f_i(x) + s_i = 0, \quad i = 1, \dots, m \\
& Ax = b
\end{aligned}
$$

> **Note.** This transformation is no longer convex unless $f_i$ are affine.

### Epigraph Formulation

The standard form problem

$$
\begin{aligned}
\min_{x} \quad & f_0(x) \\
\text{s.t.} \quad & f_i(x) \le 0, \quad i = 1, \dots, m \\
& Ax = b
\end{aligned}
$$

is equivalent to its **epigraph form**:

$$
\begin{aligned}
\min_{x, t} \quad & t \\
\text{s.t.} \quad & f_0(x) - t \le 0, \\
& f_i(x) \le 0, \quad i = 1, \dots, m \\
& Ax = b
\end{aligned}
$$

### Relaxation

Given an optimization problem

$$
\min_{x} \; f(x) \quad \text{s.t.} \quad x \in C
$$

we can always take an enlarged constraint set $\widetilde{C} \supseteq C$ and consider

$$
\min_{x} \; f(x) \quad \text{s.t.} \quad x \in \widetilde{C}
$$

This is called a **relaxation** and its optimal value is always smaller or equal to that of the original problem (for minimization).

**Example: Continuous relaxation of integer constraints.**

$$
\begin{aligned}
\min_{x} \quad & c^\top x \\
\text{s.t.} \quad & Ax \preceq b, \\
& x \in \{0, 1\}^n
\end{aligned}
\quad\Longrightarrow\quad
x \in [0, 1]^n
$$

- Feasible set becomes convex (a polytope).
- The problem reduces to a linear program (LP).
- Provides a lower bound on the integer optimum.

**Example: Relaxing nonconvex sets.** $x^2 + y^2 = 1$ (unit circle) $\;\Longrightarrow\;$ $x^2 + y^2 \le 1$ (unit disk). For non-affine equality constraints $h_j(x) = 0$ where $h_j$ are convex, replace with $h_j(x) \le 0$.

### Converting a Nonconvex Problem to a Convex One

**Via observation:**

Nonconvex problem:

$$
\begin{aligned}
\min_{x_1, x_2} \quad & f_0(x) = x_1^2 + x_2^2 \\
\text{s.t.} \quad & f_1(x) = \frac{x_1}{1 + x_2^2} \le 0, \\
& h_1(x) = (x_1 + x_2)^2 = 0
\end{aligned}
$$

$f_0$ is convex, but $f_1$ is not convex and $h_1$ is not affine. The equivalent convex formulation is:

$$
\begin{aligned}
\min_{x_1, x_2} \quad & x_1^2 + x_2^2 \\
\text{s.t.} \quad & x_1 \le 0, \\
& x_1 + x_2 = 0
\end{aligned}
$$

**Via substitution:**

Nonconvex problem: $\min_x (|x| - 1)^2$. Let $t = |x|$ where $t \ge 0$. The equivalent convex problem is $\min_t (t - 1)^2$ subject to $t \ge 0$.

**Example: Geometric program (monomial case).** The original nonconvex problem

$$
\begin{aligned}
\min_{x \succ 0} \quad & f_0(x) = c_0 \, x_1^{a_{01}} x_2^{a_{02}} \cdots x_n^{a_{0n}} \\
\text{s.t.} \quad & f_i(x) = c_i \, x_1^{a_{i1}} x_2^{a_{i2}} \cdots x_n^{a_{in}} \le 1, \quad i = 1, \dots, m
\end{aligned}
$$

where $c_i > 0$, becomes convex via the monotone transformation $y_i = \log x_i$ ($x_i = e^{y_i}$):

$$
\begin{aligned}
\min_{y \in \mathbb{R}^n} \quad & \log c_0 + a_{01} y_1 + \cdots + a_{0n} y_n \\
\text{s.t.} \quad & \log c_i + a_{i1} y_1 + \cdots + a_{in} y_n \le 0, \quad i = 1, \dots, m
\end{aligned}
$$

---

## 4.6 Linear Programming (LP)

> **Definition (Linear Program).** An LP minimizes a linear objective subject to linear inequality and equality constraints:
> $$
> \begin{aligned}
> \min_{x} \quad & c^\top x \\
> \text{s.t.} \quad & Dx \preceq d, \\
> & Ax = b
> \end{aligned}
> $$
> An LP is a convex problem with affine objective and constraint functions. It is the most fundamental problem class in convex optimization.

### Inequality and Standard Forms

**Inequality form:**

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad Ax \preceq b
$$

**Standard form:**

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad Ax = b,\; x \succeq 0
$$

**Conversion between forms:**
- Replace $a_i^\top x \le b_i$ with $a_i^\top x + s_i = b_i$, $s_i \ge 0$ (slack variables).
- Replace a free variable $x_j$ with $x_j = x_j^+ - x_j^-$, where $x_j^+, x_j^- \ge 0$.

### Example: Diet Problem

Find the cheapest combination of foods that satisfies certain nutritional requirements:

$$
\begin{aligned}
\min_{x} \quad & c^\top x \\
\text{s.t.} \quad & Dx \succeq d \\
& x \succeq 0
\end{aligned}
$$

where $c_j$ is the per-unit cost of food $j$, $d_i$ is the minimum required intake of nutrient $i$, $D_{ij}$ is the content of nutrient $i$ per unit of food $j$, and $x_j$ is the units of food $j$ in the diet.

### Example: Piecewise-linear Minimization

Consider minimizing the piecewise-linear function:

$$
f(x) = \max_{i=1,\dots,m} \left( a_i^\top x + b_i \right)
$$

This can be transformed to an equivalent LP via its epigraph form:

$$
\begin{aligned}
\min_{t, x} \quad & t \\
\text{s.t.} \quad & a_i^\top x + b_i \le t, \quad i = 1, \dots, m
\end{aligned}
$$

This is an LP (in inequality form) with variables $x$ and $t$.

### Example: Chebyshev Center of a Polyhedron

Given a polyhedron $P = \{ x \in \mathbb{R}^n : Ax \preceq b \}$, find the largest Euclidean ball that fits inside it:

$$
B(x_c, r) = \{ x \in \mathbb{R}^n : \|x - x_c\|_2 \le r \} = \{ x_c + u : \|u\|_2 \le r \}
$$

The problem is formulated as

$$
\begin{aligned}
\max_{x_c, r} \quad & r \\
\text{s.t.} \quad & a_i^\top x_c + \|a_i\|_2 \, r \le b_i, \quad i = 1, \dots, m
\end{aligned}
$$

- $\|a_i\|_2$ is the Euclidean norm of the normal vector of the $i$-th face.
- Each constraint ensures the ball does not cross the corresponding face.
- This is a linear program (LP) in $x_c$ and $r$.
- Applications: emergency facility placement, sensor/Wi-Fi placement, urban planning.

### Example: Basis Pursuit

Consider an underdetermined linear system $Ax = b$, $A \in \mathbb{R}^{m \times n}$, $m < n$. The goal is to find the sparsest solution (minimize the number of nonzero entries).

- Exact sparsity minimization ($\ell_0$-norm) is **NP-hard**.
- **Relaxation**: minimize the $\ell_1$-norm instead: $\min_x \|x\|_1$ s.t. $Ax = b$.
- The $\ell_1$-norm encourages sparsity while remaining convex.

By introducing nonnegative variables $u_i \ge 0$ to represent $|x_i|$ ($-u_i \le x_i \le u_i$), the LP formulation is

$$
\begin{aligned}
\min_{x, u} \quad & \sum_{i=1}^{n} u_i \\
\text{s.t.} \quad & Ax = b, \\
& -u_i \le x_i \le u_i, \quad i = 1, \dots, n, \\
& u_i \ge 0, \quad i = 1, \dots, n
\end{aligned}
$$

---

## 4.7 Quadratic Programming (QP)

> **Definition (Quadratic Program).** A QP minimizes a quadratic objective subject to linear constraints:
> $$
> \begin{aligned}
> \min_{x} \quad & \frac{1}{2} x^\top Q x + c^\top x \\
> \text{s.t.} \quad & Dx \preceq d, \\
> & Ax = b
> \end{aligned}
> $$
> If $Q \succeq 0$ (positive semidefinite), the problem is convex. Convex QPs have globally optimal solutions and can be solved efficiently.

### Example: Least Squares

**Least squares problem:**

$$
\min_{x} \; \|Ax - b\|_2^2
$$

**Least squares with bounds:**

$$
\min_{x} \; \|Ax - b\|_2^2 \quad \text{s.t.} \quad \ell \preceq x \preceq u
$$

**QP formulation:**

$$
\min_{x} \; \frac{1}{2} x^\top (2A^\top A) x - (2A^\top b)^\top x = \frac{1}{2} x^\top Q x + c^\top x
$$

where $Q = 2A^\top A \succeq 0$, $c = -2A^\top b$.

### Example: Distance Between Two Polyhedra

Given polyhedra $P_1 = \{ x \in \mathbb{R}^n : A_1 x \preceq b_1 \}$ and $P_2 = \{ y \in \mathbb{R}^n : A_2 y \preceq b_2 \}$, the distance between them is

$$
\begin{aligned}
\min_{x, y} \quad & \|x - y\|_2^2 \\
\text{s.t.} \quad & A_1 x \preceq b_1, \\
& A_2 y \preceq b_2
\end{aligned}
$$

This is a convex QP.

### Example: Linear Program with Random Cost

Let cost be $c^\top x$ where $c$ is random with mean $\bar{c} = \mathbb{E}[c]$. A risk-averse objective is

$$
\min_{x} \; \bar{c}^\top x + \lambda \operatorname{Var}(c^\top x)
$$

Expanding the variance:

$$
\operatorname{Var}(c^\top x) = \mathbb{E}[(c^\top x - \bar{c}^\top x)^2] = x^\top \mathbb{E}[(c - \bar{c})(c - \bar{c})^\top] x = x^\top \Sigma x
$$

The QP formulation is

$$
\begin{aligned}
\min_{x} \quad & \bar{c}^\top x + \lambda x^\top \Sigma x \\
\text{s.t.} \quad & Dx \succeq d, \; x \succeq 0
\end{aligned}
$$

where $\Sigma$ is the covariance matrix of $c$.

### Example: LASSO (Basis Pursuit with Noise)

LASSO trades off data fidelity and sparsity.

**Penalty formulation:**

$$
\min_{x} \; \frac{1}{2} \|Ax - b\|_2^2 + \lambda \|x\|_1
$$

**Constrained formulation:**

$$
\min_{x} \; \|Ax - b\|_2^2 \quad \text{s.t.} \quad \|x\|_1 \le k
$$

Key characteristics:
- Handles noisy data (LASSO $\Leftrightarrow$ BP when noise-free).
- Sparsity controlled by $\lambda$ (or $k$).
- Can be written as a QP.

---

## 4.8 Quadratically Constrained Quadratic Programming (QCQP)

> **Definition (QCQP).** A QCQP minimizes a quadratic objective subject to quadratic inequality and linear equality constraints:
> $$
> \begin{aligned}
> \min_{x} \quad & \frac{1}{2} x^\top P_0 x + q_0^\top x + r_0 \\
> \text{s.t.} \quad & \frac{1}{2} x^\top P_i x + q_i^\top x + r_i \le 0, \quad i = 1, \dots, m \\
> & Ax = b
> \end{aligned}
> $$
> If $P_0, P_1, \dots, P_m \succeq 0$, the problem is convex.

QCQP generalizes QP by allowing quadratic inequality constraints, and in turn is a special case of SOCP.

---

## 4.9 Second-Order Cone Programming (SOCP)

> **Definition (SOCP).** An SOCP is of the form:
> $$
> \begin{aligned}
> \min_{x} \quad & c^\top x \\
> \text{s.t.} \quad & \|D_i x + d_i\|_2 \le e_i^\top x + f_i, \quad i = 1, \dots, m \\
> & Ax = b
> \end{aligned}
> $$

### Second-Order (Lorentz) Cone

The **second-order cone** (also called the Lorentz cone or ice-cream cone) is

$$
\mathcal{Q} = \{\, (x, t) \in \mathbb{R}^{n+1} : \|x\|_2 \le t \,\}
$$

The constraint $\|D_i x + d_i\|_2 \le e_i^\top x + f_i$ is equivalent to $(D_i x + d_i,\; e_i^\top x + f_i) \in \mathcal{Q}$.

> **Why is $\mathcal{Q}$ convex?** It is the epigraph of the Euclidean norm $\|x\|_2$, which is a convex function.

### QP $\subset$ SOCP

A QP can be reformulated as an SOCP:

$$
\begin{aligned}
\min_{x} \quad & \frac{1}{2} x^\top Q x + c^\top x \\
\text{s.t.} \quad & Dx \preceq d, \\
& Ax = b
\end{aligned}
\quad\Longrightarrow\quad
\begin{aligned}
\min_{x, t} \quad & c^\top x + \frac{1}{2} t \\
\text{s.t.} \quad & Dx \preceq d,\; x^\top Q x \le t,\; Ax = b
\end{aligned}
$$

with $x^\top Q x \le t \;\Longleftrightarrow\; \|Q^{1/2} x\|_2^2 \le \frac{1}{4}(1 + t)^2 - \frac{1}{4}(1 - t)^2$, which is an SOC constraint.

### Example: Robust Linear Program (Deterministic)

In LP, there may be uncertainty in the data $c$, $a_i$, or $b_i$. With uncertainty in $a_i$, two approaches:

**Deterministic (worst-case guarantee):** constraints must hold for all $a_i$ in an ellipsoidal uncertainty set

$$
\mathcal{E}_i = \{\, \bar{a}_i + P_i u : \|u\|_2 \le 1 \,\}, \quad \bar{a}_i \in \mathbb{R}^n,\; P_i \in \mathbb{R}^{n \times n}
$$

Robust LP:

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad a_i^\top x \le b_i \;\; \forall\, a_i \in \mathcal{E}_i, \; i = 1, \dots, m
$$

Equivalent SOCP:

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad \bar{a}_i^\top x + \|P_i^\top x\|_2 \le b_i, \quad i = 1, \dots, m
$$

since $\sup_{\|u\|_2 \le 1} (\bar{a}_i + P_i u)^\top x = \bar{a}_i^\top x + \|P_i^\top x\|_2$.

### Example: Robust Linear Program (Stochastic)

Assume $a_i \sim \mathcal{N}(\bar{a}_i, \Sigma_i)$ is Gaussian. Then $a_i^\top x \sim \mathcal{N}(\bar{a}_i^\top x,\; x^\top \Sigma_i x)$, and

$$
\Pr(a_i^\top x \le b_i) = \Phi\!\left( \frac{b_i - \bar{a}_i^\top x}{\|\Sigma_i^{1/2} x\|_2} \right)
$$

where $\Phi$ is the CDF of $\mathcal{N}(0, 1)$. The robust LP with probability constraint

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad \Pr(a_i^\top x \le b_i) \ge \eta, \quad i = 1, \dots, m
$$

is equivalent to the SOCP (for $\eta \ge \tfrac{1}{2}$):

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad \bar{a}_i^\top x + \Phi^{-1}(\eta) \|\Sigma_i^{1/2} x\|_2 \le b_i, \quad i = 1, \dots, m
$$

The terms $\|P_i^\top x\|_2$ and $\Phi^{-1}(\eta) \|\Sigma_i^{1/2} x\|_2$ are interpreted as the **budget margin** for robustness.

---

## 4.10 Semidefinite Programming (SDP)

> **Definition (SDP).** A semidefinite program is of the form:
> $$
> \begin{aligned}
> \min_{x} \quad & c^\top x \\
> \text{s.t.} \quad & x_1 F_1 + x_2 F_2 + \cdots + x_n F_n + F_0 \preceq 0 \\
> & Ax = b
> \end{aligned}
> $$
> where $F_i \in \mathbb{S}^k$ (symmetric $k \times k$ matrices). The inequality constraint $x_1 F_1 + \cdots + x_n F_n + F_0 \preceq 0$ is called a **linear matrix inequality (LMI)**.

### LP $\subset$ SDP

An LP can be expressed as an SDP by using a diagonal matrix:

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad Ax \preceq b
\quad\Longrightarrow\quad
\min_{x} \; c^\top x \quad \text{s.t.} \quad \operatorname{diag}(Ax - b) \preceq 0
$$

### SOCP $\subset$ SDP

The SOC constraint $\|x\|_2 \le t$ is equivalent to the LMI

$$
\|x\|_2 \le t \quad\Longleftrightarrow\quad
\begin{bmatrix} t I & x \\ x^\top & t \end{bmatrix} \succeq 0
$$

This follows from the **Schur Complement Theorem**: for symmetric $A$, $C$ with $C \succ 0$,

$$
\begin{bmatrix} A & B \\ B^\top & C \end{bmatrix} \succeq 0 \quad\Longleftrightarrow\quad A - B C^{-1} B^\top \succeq 0
$$

Thus an SOCP can be rewritten as an SDP:

$$
\begin{aligned}
\min_{x} \quad & c^\top x \\
\text{s.t.} \quad & \|D_i x + d_i\|_2 \le e_i^\top x + f_i
\end{aligned}
\quad\Longrightarrow\quad
\min_{x} \; c^\top x \quad \text{s.t.} \quad
\begin{bmatrix} (e_i^\top x + f_i) I & D_i x + d_i \\ (D_i x + d_i)^\top & e_i^\top x + f_i \end{bmatrix} \succeq 0
$$

### Example: Eigenvalue Minimization

$$
\min_{x} \; \lambda_{\max}(A(x))
$$

where $A(x) = A_0 + x_1 A_1 + \cdots + x_n A_n$ (with given $A_i \in \mathbb{S}^k$). Equivalent SDP:

$$
\begin{aligned}
\min_{x, t} \quad & t \\
\text{s.t.} \quad & A(x) \preceq tI
\end{aligned}
$$

since $\lambda_{\max}(A) \le t \;\Longleftrightarrow\; A \preceq tI$.

---

## 4.11 Hierarchy of Problem Classes

The canonical convex optimization problem classes form a nested hierarchy:

$$
\boxed{\text{LP} \;\subset\; \text{QP} \;\subset\; \text{QCQP} \;\subset\; \text{SOCP} \;\subset\; \text{SDP} \;\subset\; \text{Conic Program}}
$$

Each class is a special case of the next, with increasing modeling expressiveness and computational cost.

| Class | Objective | Constraints | Key Structure |
|-------|-----------|-------------|---------------|
| **LP** | Linear $c^\top x$ | Linear inequalities $Ax \preceq b$ | Polyhedral feasible set |
| **QP** | Quadratic $\frac{1}{2}x^\top Q x + c^\top x$, $Q \succeq 0$ | Linear inequalities | LP with quadratic objective |
| **QCQP** | Quadratic, $P_0 \succeq 0$ | Quadratic inequalities $P_i \succeq 0$ | Quadratic in both objective and constraints |
| **SOCP** | Linear | $\|D_i x + d_i\|_2 \le e_i^\top x + f_i$ | Second-order cone constraints |
| **SDP** | Linear | Linear matrix inequality $\sum x_i F_i + F_0 \preceq 0$ | Semidefinite constraints |

### Conic Program

At the top of the hierarchy is the **conic program**:

> **Definition (Conic Program).**
> $$
> \begin{aligned}
> \min_{x} \quad & c^\top x \\
> \text{s.t.} \quad & \mathcal{A}(x) \in \mathcal{K} \\
> & Ax = b
> \end{aligned}
> $$
> where $\mathcal{A} : \mathbb{R}^n \to \mathcal{X}$ is an affine map and $\mathcal{K}$ is a convex cone.

All the previous classes are special cases of conic programs, depending on the choice of cone $\mathcal{K}$:

| Problem | Cone $\mathcal{K}$ |
|---------|-------------------|
| LP | $\mathcal{K} = \mathbb{R}^n_+ = \{ x \in \mathbb{R}^n : x_1, \dots, x_n \ge 0 \}$ (nonnegative orthant) |
| SOCP | $\mathcal{K} = \mathcal{Q} = \{ (x, t) \in \mathbb{R}^{n+1} : \|x\|_2 \le t \}$ (second-order cone) |
| SDP | $\mathcal{K} = \mathbb{S}^n_+ = \{ X \in \mathbb{S}^n : X \succeq 0 \}$ (positive semidefinite cone) |

---

## 4.12 Comparison: LP vs. QP in Practice

| Aspect | LP | QP |
|--------|-----|-----|
| Objective | $\min c^\top x$ | $\min \frac{1}{2} x^\top Q x + c^\top x$ |
| Constraints | $Dx \preceq d$, $Ax = b$ | $Dx \preceq d$, $Ax = b$ |

- LP $\subset$ QP (QP recovers LP when $Q = 0$).
- Often, solving an LP in theory amounts to solving a QP in practice.

**Diet problem:**
- In theory: cost $c$ is deterministic $\to$ LP.
- In practice: $c$ is a random vector $\to$ QP.

**Basis pursuit:**
- In theory: samples are noise-free ($Ax = b$) $\to$ LP.
- In practice: samples are noisy ($Ax \neq b$) $\to$ QP (LASSO).

**Deterministic vs. stochastic robustness:**
- In theory: deterministic LP $\to$ LP.
- In practice: robust LP under uncertainty $\to$ SOCP.

---

## 4.13 Practical Methods for Establishing Convexity

### Establishing Convexity of a Set $C$

1. Apply the definition: $x_1, x_2 \in C$, $0 \le \theta \le 1 \implies \theta x_1 + (1 - \theta) x_2 \in C$.
2. Show $C$ is obtained from simple convex sets by operations that preserve convexity:
   - Intersection
   - Affine function
   - Perspective function
   - Linear-fractional function
3. Show $C$ is a sublevel set of a convex function.
4. Show $C$ is the epigraph of a convex function.

### Establishing Convexity of a Function $f$

1. Apply the definition: $f(\theta x + (1 - \theta) y) \le \theta f(x) + (1 - \theta) f(y)$.
2. Use equivalent conditions (e.g., $\nabla^2 f(x) \succeq 0$).
3. Show $f$ is obtained from simple convex functions by operations that preserve convexity:
   - **Nonnegative weighted sum**: $g(x) = \sum_{i=1}^{m} \alpha_i f_i(x)$, $\alpha_i \ge 0$.
   - **Composition with affine function**: $g(x) = f(Ax + b)$.
   - **Pointwise maximum**: $g(x) = \max\{f_1(x), \dots, f_m(x)\}$.
   - **Pointwise supremum**.
   - **Composition with scalar functions**.
   - **Minimization**.
   - **Perspective**.

---

## 4.14 Summary of Key Theorems

1. The feasible set of a convex optimization problem is convex.
2. Every local optimum of a convex problem is a global optimum.
3. For strictly convex $f_0$, the optimal solution (if it exists) is unique.
4. **First-order optimality condition**: $x^\star$ is optimal for $\min_{x \in C} f(x)$ iff $\langle \nabla f(x^\star), y - x^\star \rangle \ge 0$ for all $y \in C$.
5. Problems can be made equivalent through monotone transformations, change of variables, slack variables, epigraph formulation, and relaxation.
6. The hierarchy LP $\subset$ QP $\subset$ QCQP $\subset$ SOCP $\subset$ SDP $\subset$ Conic Program provides progressively richer modeling frameworks, each with convex structure guaranteeing global optimality.
