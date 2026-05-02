# Cheatsheet: Standard Formulations & Transformations

## 1 Standard Formulations

### 1.1 Linear Programming (LP)

The objective and constraints are all affine.

**General Form:**
$$\min_x \; c^T x \quad \text{s.t.} \quad Gx \preceq h, \; Ax = b$$

**Standard Form:**
$$\min_x \; c^T x \quad \text{s.t.} \quad Ax = b, \; x \succeq 0$$

**Inequality Form:**
$$\min_x \; c^T x \quad \text{s.t.} \quad Ax \preceq b$$

### 1.2 Quadratic Programming (QP)

The objective is quadratic (with $P \in \mathbb{S}_+^n$), while constraints remain linear.

$$\min_x \; \frac{1}{2} x^T P x + q^T x + r \quad \text{s.t.} \quad Gx \preceq h, \; Ax = b$$

### 1.3 Quadratically Constrained Quadratic Programming (QCQP)

Both the objective and constraints are quadratic. For convexity, $P_i \in \mathbb{S}_+^n$.

$$\min_x \; \frac{1}{2} x^T P_0 x + q_0^T x + r_0$$
$$\text{s.t.} \quad \frac{1}{2} x^T P_i x + q_i^T x + r_i \leq 0, \quad i = 1, \dots, m$$
$$Ax = b$$

### 1.4 Second-Order Cone Programming (SOCP)

Constraints involve the $\ell_2$-norm (Lorentz cone).

$$\min_x \; f^T x$$
$$\text{s.t.} \quad \|A_i x + b_i\|_2 \leq c_i^T x + d_i, \quad i = 1, \dots, m$$
$$Fx = g$$

### 1.5 Semidefinite Programming (SDP)

The most powerful class, where constraints are Linear Matrix Inequalities (LMI).

$$\min_x \; c^T x$$
$$\text{s.t.} \quad x_1 F_1 + \cdots + x_n F_n + G \preceq 0$$
$$Ax = b$$

### 1.6 Conic Programming (CP)

The most general form, minimizing a linear function over the intersection of an affine set and a convex cone $K$:

$$\min_x \; c^T x$$
$$\text{s.t.} \quad Ax = b, \; x \in K$$

### 1.7 Hierarchy

$$\text{LP} \subset \text{QP} \subset \text{QCQP} \subset \text{SOCP} \subset \text{SDP} \subset \text{CP}$$

---

## 2 Transformations and Reductions

### 2.1 LP to Other Forms

- **General Form → Standard Form:** Introduce slack variables $s \succeq 0$ such that $Gx + s = h$, and replace free variables $x$ with $x^+ - x^-$ where $x^+, x^- \succeq 0$:

  $$\min_{x^+, x^-, s} \; c^T x^+ - c^T x^- + d$$
  $$\text{s.t.} \quad G^T x^+ - G^T x^- + s = h$$
  $$A x^+ - A x^- = b$$
  $$x^+ \succeq 0, \; x^- \succeq 0, \; s \succeq 0$$

- **To QP/QCQP:** Simply set the quadratic matrix $P = 0$.

- **To SOCP:** Rewrite $a_i^T x \leq b_i$ as $\|0\|_2 \leq b_i - a_i^T x$.

- **To SDP:** Represent multiple linear constraints as a diagonal LMI: $\operatorname{diag}(b_i - a_i^T x) \succeq 0$.

### 2.2 QP to SOCP and SDP

For a convex QP, handle the objective $\frac{1}{2} x^T P x$ by introducing a slack variable $t$ such that $\min t + q^T x$.

The constraint is $\frac{1}{2} \|Rx\|_2^2 \leq t$, where $P = R^T R$ (Cholesky decomposition).

- **QP → SOCP:** Using the identity $\|u\|_2^2 \leq v w \iff \left\|\begin{pmatrix} 2u \\ v - w \end{pmatrix}\right\|_2 \leq v + w$: Set $u = Rx$, $v = t$, $w = 1$.

  $$\implies \frac{1}{2}\left\|\begin{pmatrix} 2Rx \\ t - 1 \end{pmatrix}\right\|_2 \leq t + 1$$

- **QP → SDP:** Using the Schur Complement:

  $$\begin{pmatrix} 2I & Rx \\ (Rx)^T & t \end{pmatrix} \succeq 0$$

### 2.3 QCQP to SOCP and SDP

Any quadratic constraint $\frac{1}{2} x^T R^T R x + q^T x + r \leq 0$ can be rewritten:

- **To SOCP:** Rearrange the constraint to $\frac{1}{2} \|Rx\|_2^2 \leq -(q^T x + r)$. Using the identity above with $v = 1$ and $w = -2(q^T x + r)$:

  $$\frac{1}{2}\left\|\begin{pmatrix} 2Rx \\ 1 + 2(q^T x + r) \end{pmatrix}\right\|_2 \leq 1 - 2(q^T x + r)$$

- **To SDP:** Using the Schur Complement:

  $$\begin{pmatrix} I & Rx \\ (Rx)^T & -2(q^T x + r) \end{pmatrix} \succeq 0$$

### 2.4 SOCP to SDP

The $\ell_2$-norm constraint $\|u\|_2 \leq v$ (where $u = Ax + b$) is equivalent to the LMI:

$$\begin{pmatrix} v I & u \\ u^T & v \end{pmatrix} \succeq 0$$

This is a standard application of the Schur complement on the block matrix.
