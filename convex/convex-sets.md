# Chapter 2: Convex Sets

## 2.1 Mathematical Background

### 2.1.1 Inner Product of Vectors

> **Definition (Inner Product).** For vectors $x, y \in \mathbb{R}^n$, the inner product (dot product) is
>
> $$\langle x, y \rangle = x^\top y = \sum_{i=1}^{n} x_i y_i$$

**Geometric Interpretation:** The inner product measures the alignment between two vectors:
- $\theta = 0^\circ \Rightarrow$ vectors are in the same direction.
- $\theta = 90^\circ \Rightarrow$ vectors are orthogonal (perpendicular).

**Example:**

$$
x = \begin{bmatrix} 1 \\ 2 \end{bmatrix}, \quad
y = \begin{bmatrix} 3 \\ 1 \end{bmatrix}
\quad\Rightarrow\quad
\langle x, y \rangle = 1 \cdot 3 + 2 \cdot 1 = 5
$$

### 2.1.2 Angle Between Vectors

The angle $\theta$ between $x$ and $y$ is defined by:

$$
\cos \theta = \frac{\langle x, y \rangle}{\|x\| \|y\|}, \qquad
\|x\| = \sqrt{\langle x, x \rangle}
$$

**Example:**

$$
x = \begin{bmatrix} 1 \\ 2 \end{bmatrix}, \quad
y = \begin{bmatrix} 3 \\ 1 \end{bmatrix}
\quad\Rightarrow\quad
\theta = \cos^{-1}\!\left(\frac{5}{\sqrt{5}\sqrt{10}}\right)
$$

### 2.1.3 Inner Product of Matrices

> **Definition (Frobenius Inner Product).** For matrices $A, B \in \mathbb{R}^{m \times n}$, the Frobenius inner product is
>
> $$\langle A, B \rangle_F = \sum_{i=1}^{m} \sum_{j=1}^{n} A_{ij} B_{ij} = \operatorname{trace}(A^\top B)$$

**Frobenius Norm:**

$$
\|A\|_F = \sqrt{\langle A, A \rangle_F} = \sqrt{\sum_{i,j} A_{ij}^2}
$$

**Angle Between Matrices:**

$$
\cos \theta = \frac{\langle A, B \rangle_F}{\|A\|_F \|B\|_F}
$$

**Example:**

$$
A = \begin{bmatrix} 1 & 2 \\ 0 & 3 \end{bmatrix}, \quad
B = \begin{bmatrix} 2 & 1 \\ 1 & 0 \end{bmatrix}
\quad\Rightarrow\quad
\langle A, B \rangle_F = 1 \cdot 2 + 2 \cdot 1 + 0 \cdot 1 + 3 \cdot 0 = 4
$$

### 2.1.4 Common Vector Norms

1. **Euclidean Norm ($\ell_2$ norm):**
   $$
   \|x\|_2 = \sqrt{\sum_{i=1}^{n} x_i^2}
   $$

2. **1-Norm ($\ell_1$ norm):**
   $$
   \|x\|_1 = \sum_{i=1}^{n} |x_i|
   $$

3. **Chebyshev Norm ($\ell_\infty$ norm):**
   $$
   \|x\|_\infty = \max_i |x_i|
   $$

4. **$p$-Norm (general $\ell_p$ norm, $p \ge 1$):**
   $$
   \|x\|_p = \left( \sum_{i=1}^{n} |x_i|^p \right)^{1/p}
   $$

### 2.1.5 Symmetric Matrices

> **Definition.** A square matrix $A \in \mathbb{R}^{n \times n}$ is symmetric if
>
> $$A = A^\top \quad \text{or equivalently} \quad A_{ij} = A_{ji} \text{ for all } i, j$$

**Key Properties:**
- All eigenvalues are real.
- Eigenvectors corresponding to distinct eigenvalues are orthogonal.
- Symmetric matrices are diagonalizable by an orthogonal matrix.

### 2.1.6 Eigenvalue Decomposition

> **Theorem (Eigenvalue Decomposition).** If $A$ is symmetric, it admits
>
> $$A = Q \Lambda Q^\top = \sum_{i=1}^{n} \lambda_i \, q_i q_i^\top$$
>
> where:
> - $Q = [q_1 \; \cdots \; q_n]$ is orthonormal: $Q^\top Q = I$
> - $\Lambda = \operatorname{diag}(\lambda_1, \ldots, \lambda_n)$ with $\lambda_i \in \mathbb{R}$
> - Each term $\lambda_i q_i q_i^\top$ is a rank-1 symmetric matrix.

### 2.1.7 Positive Semidefinite (PSD) Matrices

> **Definition.** A symmetric matrix $A \in \mathbb{R}^{n \times n}$ is **positive semidefinite (PSD)** if
>
> $$x^\top A x \ge 0 \quad \forall\, x \in \mathbb{R}^n$$
>
> (denoted as $A \succeq 0$)

**Key Properties:**
- All eigenvalues of $A$ are nonnegative: $\lambda_i \ge 0$.
- PSD matrices are symmetric, hence diagonalizable by orthogonal matrices.
- If $A \succeq 0$, then $A = B B^\top$ for some $B \in \mathbb{R}^{n \times n}$ (Cholesky factorization or matrix square root).
- The set of PSD matrices forms a convex cone.

### 2.1.8 Gradient and Hessian of Multivariate Functions

**Gradient:** For $f : \mathbb{R}^n \to \mathbb{R}$, the gradient (direction of steepest increase) is

$$
\nabla f(x) =
\begin{bmatrix}
\frac{\partial f}{\partial x_1} \\
\vdots \\
\frac{\partial f}{\partial x_n}
\end{bmatrix} \in \mathbb{R}^n
$$

**Hessian:** The Hessian (local curvature) is the matrix of second-order partial derivatives:

$$
\nabla^2 f(x) =
\begin{bmatrix}
\frac{\partial^2 f}{\partial x_1^2} & \cdots & \frac{\partial^2 f}{\partial x_1 \partial x_n} \\
\vdots & \ddots & \vdots \\
\frac{\partial^2 f}{\partial x_n \partial x_1} & \cdots & \frac{\partial^2 f}{\partial x_n^2}
\end{bmatrix} \in \mathbb{R}^{n \times n}
$$

**Quadratic Example:** Let $f(x) = x^\top A x + b^\top x + c$, with $A \in \mathbb{R}^{n \times n}$ symmetric, $b \in \mathbb{R}^n$, $c \in \mathbb{R}$. Then

$$
\nabla f(x) = 2Ax + b, \qquad \nabla^2 f(x) = 2A
$$

---

## 2.2 Lines, Line Segments, and Rays

Let $x, y \in \mathbb{R}^n$ and define the direction vector $d := y - x$.

> **Line through $x$ and $y$:**
> $$\ell_{x,y} = \{ x + \theta d \mid \theta \in \mathbb{R} \}$$

> **Line segment from $x$ to $y$:**
> $$[x, y] = \{ x + \theta d \mid \theta \in [0, 1] \} = \{ (1 - \theta)x + \theta y \mid \theta \in [0, 1] \}$$

> **Ray starting at $x$ going through $y$:**
> $$\overrightarrow{xy} = \{ x + \theta d \mid \theta \ge 0 \}$$

---

## 2.3 Definition of Convex Sets

> **Definition (Convex Set).** A set $C \subseteq \mathbb{R}^n$ is **convex** if for any $x, y \in C$ and any $\theta \in [0, 1]$,
>
> $$z = (1 - \theta)x + \theta y \in C$$
>
> $z$ is called a **convex combination** of $x$ and $y$.

**Intuition:** Every line segment between two points in $C$ lies entirely inside $C$.

**Examples of convex sets:** line, line segment, ray, single point, empty set, subspace, affine space, hyperplane, halfspace, convex cone, positive semidefinite cone, Euclidean balls and ellipsoids, norm balls and norm cones, polyhedra.

**Why convex sets are important:** In convex optimization, the feasible region of a convex optimization problem is a convex set. This property guarantees that any local optimum is also a global optimum.

---

## 2.4 Subspaces and Affine Sets

### 2.4.1 Subspace

> **Definition (Subspace).** A subset $W \subseteq \mathbb{R}^n$ is a **subspace** if:
> 1. $0 \in W$ (contains the zero vector)
> 2. $x, y \in W \;\Rightarrow\; x + y \in W$ (closed under addition)
> 3. $x \in W,\; \alpha \in \mathbb{R} \;\Rightarrow\; \alpha x \in W$ (closed under scaling)

**Examples:**
- $\operatorname{span}\{v_1, \ldots, v_k\} = \left\{ \sum_{i=1}^{k} \alpha_i v_i \;\middle|\; \alpha_i \in \mathbb{R} \right\}$ for $v_1, \ldots, v_k \in \mathbb{R}^n$
- $\operatorname{null}(M) = \{ x \in \mathbb{R}^n \mid Mx = 0 \}$ for $M \in \mathbb{R}^{m \times n}$
- Any line through the origin in $\mathbb{R}^n$

### 2.4.2 Affine Space

> **Definition (Affine Space).** A subset $A \subseteq \mathbb{R}^n$ is an **affine space** if for any $x, y \in A$ and any $\theta \in \mathbb{R}$,
>
> $$(1 - \theta)x + \theta y \in A$$

**Intuition:** Affine spaces are like subspaces, but they need not pass through the origin. They are "shifted subspaces."

**Examples:**
- Any line in $\mathbb{R}^2$ (not necessarily through the origin)
- Any plane in $\mathbb{R}^3$ (not necessarily through the origin)
- More generally: $A = x_0 + W$, where $x_0 \in \mathbb{R}^n$ and $W$ is a subspace

### 2.4.3 Affine Space vs. Hyperplane

- A hyperplane in $\mathbb{R}^n$ has dimension $n - 1$.
- Affine spaces can have any dimension $0, 1, \ldots, n$.

**Examples:**
1. A line in $\mathbb{R}^3$: $A = \{ (\theta, 1, 0) \mid \theta \in \mathbb{R} \}$, $\dim(A) = 1$. Not a hyperplane (hyperplanes in $\mathbb{R}^3$ have dimension 2).
2. A plane in $\mathbb{R}^4$: $A = \{ x_0 + \theta_1 v_1 + \theta_2 v_2 \mid \theta_1, \theta_2 \in \mathbb{R} \}$, $\dim(A) = 2$. Not a hyperplane (hyperplanes in $\mathbb{R}^4$ have dimension 3).

---

## 2.5 Hyperplanes and Halfspaces

> **Definition (Hyperplane).** A hyperplane in $\mathbb{R}^n$ is a set of the form
>
> $$H = \{ x \in \mathbb{R}^n \mid a^\top x = b \}$$
>
> where $a \in \mathbb{R}^n \setminus \{0\}$ and $b \in \mathbb{R}$.

**Intuition:**
- $a$ is a normal vector to the hyperplane.
- $b$ shifts the hyperplane; if $b = 0$, $H$ is a subspace.
- Hyperplanes have dimension $n - 1$.

**Examples:**
- In $\mathbb{R}^2$: a line (e.g., $x_1 + 2x_2 = 3$)
- In $\mathbb{R}^3$: a plane (e.g., $2x_1 - x_2 + x_3 = 5$)

> **Definition (Halfspace).** A closed halfspace is defined by
>
> $$H_{a,b}^{-} = \{ x \in \mathbb{R}^n \mid a^\top x \le b \}, \quad a \neq 0$$
>
> It contains all points on one side of the hyperplane $H$.

A hyperplane divides $\mathbb{R}^n$ into two halfspaces.

---

## 2.6 Convex Cones and Polar Cones

> **Definition (Cone).** A set $K \subseteq \mathbb{R}^n$ is a **cone** if
>
> $$x \in K,\; \alpha \ge 0 \;\Rightarrow\; \alpha x \in K$$

> **Definition (Convex Cone).** A set $K \subseteq \mathbb{R}^n$ is a **convex cone** if it is a cone and is convex, equivalently:
>
> $$x, y \in K,\; \alpha, \beta \ge 0 \;\Rightarrow\; \alpha x + \beta y \in K$$
>
> $\alpha x + \beta y$ is called a **conic combination** of $x, y$ with $\alpha, \beta \ge 0$.

**Example:** $K = \{ (x_1, x_2) \in \mathbb{R}^2 \mid x_1 \ge 0, \; x_2 \ge 0 \}$ (the first quadrant).

> **Definition (Polar Cone).** The polar cone of $K$ is
>
> $$K^\circ = \{ y \in \mathbb{R}^n \mid y^\top x \le 0 \;\; \forall\, x \in K \}$$
>
> It contains all vectors forming a nonpositive inner product with all elements of $K$.

**Example:** The polar of the first quadrant ($\mathbb{R}^2_+$) is the third quadrant ($\mathbb{R}^2_-$).

> **Properties of Polar Cones:**
> - $K^\circ$ is always a closed, convex cone, even if $K$ is not convex.
> - If $K$ is closed and convex, $(K^\circ)^\circ = K$ (bipolar property).
> - $K_1 \subseteq K_2 \;\Rightarrow\; K_2^\circ \subseteq K_1^\circ$.

**Examples:**
- If $K = \mathbb{R}^n_+$, then $K^\circ = \mathbb{R}^n_-$.
- If $K$ is a subspace $L$, then $K^\circ = L^\perp$ (the orthogonal complement).

### Types of Combinations

| Type | Form | Coefficient constraints | Resulting set |
|------|------|------------------------|---------------|
| Linear combination | $\sum_{i=1}^{k} \theta_i x_i$ | $\theta_i \in \mathbb{R}$ | Subspace ($\operatorname{span}\{x_i\}$) |
| Conic combination | $\sum_{i=1}^{k} \theta_i x_i$ | $\theta_i \ge 0$ | Convex cone |
| Affine combination | $\sum_{i=1}^{k} \theta_i x_i$ | $\sum_{i=1}^{k} \theta_i = 1$ | Affine space |
| Convex combination | $\sum_{i=1}^{k} \theta_i x_i$ | $\theta_i \ge 0,\; \sum_{i=1}^{k} \theta_i = 1$ | Convex set |

---

## 2.7 Tangent Cone and Normal Cone

Let $C \subseteq \mathbb{R}^n$ be a set and $x \in C$.

> **Definition (Tangent Cone).** The tangent cone of $C$ at $x$ is
>
> $$T_C(x) = \{ d \in \mathbb{R}^n \mid \exists\, t_k \downarrow 0,\; d_k \to d \text{ with } x + t_k d_k \in C \}$$

- Represents directions in which you can "leave $x$ while staying in $C$ infinitesimally."
- Describes feasible directions from $x$.

> **Definition (Normal Cone).** The normal cone of $C$ at $x$ is
>
> $$N_C(x) = \{ y \in \mathbb{R}^n \mid y^\top d \le 0 \;\; \forall\, d \in T_C(x) \}$$

- Contains vectors/directions perpendicular (obtuse) to the tangent cone at $x$.
- Often used in optimality conditions and convex analysis.

---

## 2.8 Separating Hyperplane Theorem

> **Theorem (Separating Hyperplane).** Let $C, D \subseteq \mathbb{R}^n$ be two nonempty, disjoint, convex sets. Then there exists a nonzero vector $a \in \mathbb{R}^n$ and a scalar $b \in \mathbb{R}$ such that
>
> $$a^\top x \le b \le a^\top y \quad \text{for all } x \in C,\; y \in D$$
>
> This means there exists a hyperplane $\{ x \mid a^\top x = b \}$ that separates $C$ and $D$ (i.e., $C \subseteq H_{a,b}^-$, $D \subseteq H_{a,b}^+$).

**Simple interpretation:** There is a hyperplane that can separate any point outside a convex set from the set itself.

**Examples:**
1. **The nonnegative orthant in $\mathbb{R}^n$:** $\mathbb{R}^n_+ = \{ x \in \mathbb{R}^n \mid x_i \ge 0, \; i = 1, \ldots, n \}$
   - Separating hyperplane: $a = e_1$, $b = 0$

2. **Positive semidefinite matrices $\mathbb{S}^n_+$:**
   - Separating hyperplane: $a = q_1 q_1^\top$, $b = 0$

> **Note:** Convexity is required; non-convex sets may not be separable.

---

## 2.9 Generalized Inequalities

Let $K \subseteq \mathbb{R}^n$ be a proper cone (a convex cone that is closed, pointed, and has nonempty interior).

> **Definition (Generalized Inequality).** For $x, y \in \mathbb{R}^n$:
>
> $$x \preceq_K y \;\Longleftrightarrow\; y - x \in K$$

> **Strict version:**
> $$x \prec_K y \;\Longleftrightarrow\; y - x \in \operatorname{int}(K)$$

**Examples:**
- $K = \mathbb{R}^n_+$: $x \preceq_K y \;\Longleftrightarrow\; x_i \le y_i$ for all $i$ (componentwise inequality).
- $K = \mathbb{S}^n_+$ (PSD cone): $X \preceq_K Y \;\Longleftrightarrow\; Y - X \succeq 0$.

> **Note:** We can have $x \npreceq_K y$ and $y \npreceq_K x$ at the same time (incomparable). Generalized inequalities are partial orders in general.

---

## 2.10 Minimum and Minimal Elements

Let $X \subseteq \mathbb{R}^n$ and $K$ be a proper cone.

> **Definition (Minimum Element).** $x^* \in X$ is the **minimum** if
>
> $$x^* \preceq_K x \quad \forall\, x \in X$$
>
> It is the smallest element; unique if it exists. Equivalently, $X \subseteq x^* + K$.

> **Definition (Minimal Element).** $x \in X$ is a **minimal** if there is no $y \in X$ such that
>
> $$y \preceq_K x \quad \text{and} \quad y \neq x$$
>
> There may be multiple minimal elements. Equivalently, $(x - K) \cap X = \{ x \}$.

---

## 2.11 Dual Cone

> **Definition (Dual Cone).** Let $K \subseteq \mathbb{R}^n$ be a cone. The dual cone of $K$ is defined as
>
> $$K^* = \{ y \in \mathbb{R}^n \mid y^\top x \ge 0 \;\; \forall\, x \in K \}$$

> **Properties:**
> - $K^*$ is always a closed, convex cone.
> - If $K$ is closed and convex, $(K^*)^* = K$ (bipolar property).
> - $K_1 \subseteq K_2 \;\Rightarrow\; K_2^* \subseteq K_1^*$.
> - **Relation to polar cone:** $K^* = -K^\circ$.

**Examples:**
- $K = \mathbb{R}^n_+ \;\Rightarrow\; K^* = \mathbb{R}^n_+$ (self-dual).
- $K = \mathbb{S}^n_+$ (PSD cone) $\;\Rightarrow\; K^* = \mathbb{S}^n_+$ (self-dual).

---

## 2.12 Positive Semidefinite (PSD) Cone

- $\mathbb{S}^n = \{ X \in \mathbb{R}^{n \times n} \mid X^\top = X \}$ is the set of $n \times n$ symmetric matrices.
- $\mathbb{S}^n_+ = \{ X \in \mathbb{S}^n \mid X \succeq 0 \}$ is the **positive semidefinite cone**.
  - $z^\top X z \ge 0$ for all $z \in \mathbb{R}^n$.
  - Equivalently, all eigenvalues $\ge 0$.
- $\mathbb{S}^n_{++} = \{ X \in \mathbb{S}^n \mid X \succ 0 \}$ is the **positive definite cone**.

---

## 2.13 Operations That Preserve Convexity

Practical methods for establishing convexity of a set $C$:

1. **Apply the definition of convexity:**
   $$x_1, x_2 \in C, \; 0 \le \theta \le 1 \;\Rightarrow\; \theta x_1 + (1 - \theta) x_2 \in C$$

2. **Show that $C$ is obtained from simple convex sets** (hyperplanes, halfspaces, norm balls, etc.) by operations that preserve convexity:
   - Intersection
   - Affine function
   - Perspective function
   - Linear-fractional function

### 2.13.1 Intersection of Convex Sets

> **Property.** The intersection of any (finite or infinite) collection of convex sets is convex:
>
> $$C = \bigcap_{i \in \mathcal{I}} C_i \text{ is convex if each } C_i \text{ is convex.}$$

**Example:**
$$
C_1 = \{ x \mid x_1 \ge 0 \}, \quad
C_2 = \{ x \mid x_2 \ge 0 \}
\quad\Rightarrow\quad
C_1 \cap C_2 = \mathbb{R}^2_+
$$

**Interpretation:** Adding constraints (intersections) preserves convexity.

### 2.13.2 Affine Mapping

> **Property.** If $C$ is convex and $A$ is a matrix, $b$ a vector, then the image under an affine map is convex:
>
> $$\{ y \mid y = Ax + b, \; x \in C \} \text{ is convex.}$$

**Example:** Scaling and translating a convex set preserves convexity:

$$
C = \{ x \mid \|x\|_2 \le 1 \}
\quad\Rightarrow\quad
A C + b = \{ y \mid y = Ax + b, \; \|x\|_2 \le 1 \} \text{ is convex.}
$$

**Interpretation:** Linear transformations and translations do not "bend" the set — they preserve convexity.
