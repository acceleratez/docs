# Chapter 1: Mathematical Background

This chapter establishes all mathematical preliminaries needed throughout the course, from basic linear algebra and calculus to foundational optimization concepts.

---

## 1.1 What Is Optimization?

Optimization is the process of finding the best decision among a set of alternatives, subject to restrictions.

### The Optimization Model

The standard formulation of an optimization problem is:

$$
\begin{aligned}
\operatorname{minimize} \quad & f(x) \\
\operatorname{subject\;to} \quad & x \in X
\end{aligned}
$$

where:

> **Decision variable(s)** $x$: represents some action or choice we control.

> **Objective function** $f(\cdot)$: represents total cost, risk, or negative profit (the quantity we wish to minimize or maximize).

> **Constraint set** $X$: puts restrictions on the permissible choices of $x$.

### Why Optimization Matters

Optimization appears across virtually every domain:

- Applied science, engineering, economics, finance, medicine, statistics, business
- General decision and policy making
- Image inpainting (filling missing regions)
- Recommendation systems (predicting user preferences)
- Linear and logistic regression (predictive modeling)
- Neural networks (deep learning)
- Portfolio design, logistics, diet planning

As Maupertuis (1698–1759) proclaimed:

> "...nothing at all takes place in the Universe in which some rule of maximum or minimum does not appear."

### Key Conceptual Distinctions

> **Global vs. local optimum**: A global optimum is the best among all feasible points; a local optimum is best only within a neighborhood.

> **Feasible vs. infeasible point**: A feasible point satisfies all constraints; an infeasible point violates at least one constraint.

> **Constrained vs. unconstrained optimization**: A constrained problem has $X \subsetneq \mathbb{R}^n$; an unconstrained problem has $X = \mathbb{R}^n$.

> **Linear vs. nonlinear optimization**: A linear problem has a linear objective and linear constraints; a nonlinear problem has at least one nonlinear function.

> **Convex vs. nonconvex optimization**: A convex problem has a convex objective minimized over a convex feasible set; nonconvex problems may have multiple local optima.

---

## 1.2 Inner Products

### Inner Product of Vectors

> **Definition**: For vectors $x, y \in \mathbb{R}^n$, the inner product (dot product) is
>
> $$\langle x, y \rangle = x^{\top} y = \sum_{i=1}^{n} x_i y_i$$

#### Geometric Interpretation

The **angle** $\theta$ between $x$ and $y$ is defined by

$$
\cos \theta = \frac{\langle x, y \rangle}{\|x\|\, \|y\|}, \qquad \|x\| = \sqrt{\langle x, x \rangle}
$$

- $\theta = 0^\circ \;\Rightarrow\;$ vectors point in the same direction
- $\theta = 90^\circ \;\Rightarrow\;$ vectors are **orthogonal** (perpendicular)
- $\theta = 180^\circ \;\Rightarrow\;$ vectors point in opposite directions

**Example**: 

$$
x = \begin{bmatrix} 1 \\ 2 \end{bmatrix},\quad
y = \begin{bmatrix} 3 \\ 1 \end{bmatrix}
\quad\Longrightarrow\quad
\langle x, y \rangle = 1 \cdot 3 + 2 \cdot 1 = 5,\quad
\theta = \cos^{-1}\!\left(\frac{5}{\sqrt{5}\sqrt{10}}\right)
$$

### Frobenius Inner Product of Matrices

> **Definition**: For matrices $A, B \in \mathbb{R}^{m \times n}$, the Frobenius inner product is
>
> $$\langle A, B \rangle_F = \sum_{i=1}^{m}\sum_{j=1}^{n} A_{ij} B_{ij} = \operatorname{trace}(A^{\top} B)$$

The angle between matrices is defined analogously:

$$
\cos \theta = \frac{\langle A, B \rangle_F}{\|A\|_F \,\|B\|_F}
$$

**Example**:

$$
A = \begin{bmatrix} 1 & 2 \\ 0 & 3 \end{bmatrix},\quad
B = \begin{bmatrix} 2 & 1 \\ 1 & 0 \end{bmatrix}
\quad\Longrightarrow\quad
\langle A, B \rangle_F = 1 \cdot 2 + 2 \cdot 1 + 0 \cdot 1 + 3 \cdot 0 = 4
$$

---

## 1.3 Norms

A norm $\|\cdot\|$ measures the length or magnitude of a vector (or matrix). It satisfies:
1. $\|x\| \geq 0$, and $\|x\| = 0 \iff x = 0$
2. $\|\alpha x\| = |\alpha|\, \|x\|$ (homogeneity)
3. $\|x + y\| \leq \|x\| + \|y\|$ (triangle inequality)

### Common Vector Norms

#### Euclidean Norm ($\ell_2$ norm)

> $$\|x\|_2 = \sqrt{\sum_{i=1}^{n} x_i^2}$$

The most familiar norm, corresponding to geometric length.

#### $\ell_1$ Norm

> $$\|x\|_1 = \sum_{i=1}^{n} |x_i|$$

Sum of absolute values. Promotes sparsity in optimization (e.g., LASSO, basis pursuit).

#### Chebyshev Norm ($\ell_\infty$ norm)

> $$\|x\|_\infty = \max_i |x_i|$$

Maximum absolute component. Used in worst-case analysis.

#### $\ell_p$ Norm (general, $p \geq 1$)

> $$\|x\|_p = \left( \sum_{i=1}^{n} |x_i|^p \right)^{\!1/p}$$

Recovers $\ell_1$ when $p=1$, $\ell_2$ when $p=2$, and approaches $\ell_\infty$ as $p \to \infty$.

### Frobenius Norm (Matrix Norm)

> $$\|A\|_F = \sqrt{\langle A, A \rangle_F} = \sqrt{\sum_{i,j} A_{ij}^2}$$

The Frobenius norm treats a matrix as a vector in $\mathbb{R}^{mn}$; it is the $\ell_2$ norm of the vectorized matrix.

---

## 1.4 Symmetric Matrices

> **Definition**: A square matrix $A \in \mathbb{R}^{n \times n}$ is **symmetric** if
>
> $$A = A^{\top} \quad \text{or equivalently} \quad A_{ij} = A_{ji} \text{ for all } i,j$$

### Key Properties

- **All eigenvalues are real.** This is a consequence of symmetry and guarantees that eigenvalue-based analysis is well-defined.
- **Eigenvectors corresponding to distinct eigenvalues are orthogonal.**
- **Symmetric matrices are diagonalizable by an orthogonal matrix.** There exists $Q$ with $Q^{\top}Q = I$ and a diagonal $\Lambda$ such that $A = Q \Lambda Q^{\top}$.

### Eigenvalue Decomposition

If $A$ is symmetric, it admits the decomposition

> $$A = Q \Lambda Q^{\top} = \sum_{i=1}^{n} \lambda_i \, q_i q_i^{\top}$$

where:
- $Q = [q_1 \; q_2 \; \dots \; q_n]$ is **orthonormal**: $Q^{\top}Q = I$
- $\Lambda = \operatorname{diag}(\lambda_1, \lambda_2, \dots, \lambda_n)$ with $\lambda_i \in \mathbb{R}$
- Each term $\lambda_i q_i q_i^{\top}$ is a rank-1 symmetric matrix

---

## 1.5 Positive Semidefinite (PSD) Matrices

> **Definition**: A symmetric matrix $A \in \mathbb{R}^{n \times n}$ is **positive semidefinite (PSD)**, denoted $A \succeq 0$, if
>
> $$x^{\top} A x \geq 0 \quad \forall x \in \mathbb{R}^n$$

### Key Properties

- **Eigenvalue characterization**: All eigenvalues of $A$ are nonnegative: $\lambda_i \geq 0$.
- PSD matrices are symmetric, hence diagonalizable by orthogonal matrices.
- **Cholesky factorization**: If $A \succeq 0$, then $A = B B^{\top}$ for some $B \in \mathbb{R}^{n \times n}$ (matrix square root).
- **The set of PSD matrices forms a convex cone.** That is, if $A, B \succeq 0$ and $\alpha, \beta \geq 0$, then $\alpha A + \beta B \succeq 0$.

### PSD Cone

Denote:
- $\mathbb{S}^n = \{X \in \mathbb{R}^{n \times n} : X^{\top} = X\}$ — the set of $n \times n$ symmetric matrices
- $\mathbb{S}^n_{+} = \{X \in \mathbb{S}^n : X \succeq 0\}$ — the **positive semidefinite cone**
- $\mathbb{S}^n_{++} = \{X \in \mathbb{S}^n : X \succ 0\}$ — the **positive definite cone** (strict inequality, all eigenvalues $> 0$)

---

## 1.6 Gradient and Hessian

For a multivariate function $f: \mathbb{R}^n \to \mathbb{R}$:

### Gradient (First-Order Information)

> **Gradient**: The gradient points in the direction of steepest increase:
>
> $$\nabla f(x) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\[2pt] \frac{\partial f}{\partial x_2} \\[2pt] \vdots \\[2pt] \frac{\partial f}{\partial x_n} \end{bmatrix} \in \mathbb{R}^n$$

### Hessian (Second-Order Information)

> **Hessian**: The matrix of second-order partial derivatives describing local curvature:
>
> $$\nabla^2 f(x) = \begin{bmatrix} \frac{\partial^2 f}{\partial x_1^2} & \frac{\partial^2 f}{\partial x_1 \partial x_2} & \cdots & \frac{\partial^2 f}{\partial x_1 \partial x_n} \\[4pt] \frac{\partial^2 f}{\partial x_2 \partial x_1} & \frac{\partial^2 f}{\partial x_2^2} & \cdots & \frac{\partial^2 f}{\partial x_2 \partial x_n} \\[4pt] \vdots & \vdots & \ddots & \vdots \\[4pt] \frac{\partial^2 f}{\partial x_n \partial x_1} & \frac{\partial^2 f}{\partial x_n \partial x_2} & \cdots & \frac{\partial^2 f}{\partial x_n^2} \end{bmatrix} \in \mathbb{R}^{n \times n}$$

The Hessian is symmetric when $f$ is twice continuously differentiable (by Clairaut's theorem).

### Quadratic Form Example

Let $f(x) = x^{\top} A x + b^{\top} x + c$, with $A \in \mathbb{R}^{n \times n}$ symmetric, $b \in \mathbb{R}^n$, $c \in \mathbb{R}$. Then:

$$
\nabla f(x) = 2 A x + b, \qquad \nabla^2 f(x) = 2A
$$

---

## 1.7 Lines, Line Segments, and Rays

Given two points $x, y \in \mathbb{R}^n$, define the **direction vector** $d := y - x$.

### Parametric Representations

> **Line** through $x$ and $y$:
>
> $$\ell_{x,y} = \{\, x + \theta d \mid \theta \in \mathbb{R} \,\}$$

> **Line segment** from $x$ to $y$:
>
> $$[x, y] = \{\, x + \theta d \mid \theta \in [0,1] \,\} = \{\, (1 - \theta) x + \theta y \mid \theta \in [0,1] \,\}$$

> **Ray** starting at $x$ going through $y$:
>
> $$\overrightarrow{xy} = \{\, x + \theta d \mid \theta \geq 0 \,\}$$

### Geometric Intuition

- The **line** extends infinitely in both directions.
- The **line segment** is the convex combination of $x$ and $y$, bounded between them.
- The **ray** extends infinitely in the direction from $x$ toward $y$.

These primitive sets are the building blocks of convex geometry. The line segment representation

$$
z = (1 - \theta) x + \theta y, \quad \theta \in [0,1]
$$

is called a **convex combination** of $x$ and $y$, and it is the central operation in the definition of convex sets.

---

## 1.8 Summary of Mathematical Preliminaries

| Concept | Key Formula / Property |
|---|---|
| Inner product (vectors) | $\langle x, y \rangle = x^{\top} y = \sum x_i y_i$ |
| Frobenius inner product | $\langle A, B \rangle_F = \operatorname{trace}(A^{\top} B)$ |
| Orthogonality | $\langle x, y \rangle = 0 \;\Leftrightarrow\; \theta = 90^\circ$ |
| $\ell_2$ norm | $\|x\|_2 = \sqrt{\sum x_i^2}$ |
| $\ell_1$ norm | $\|x\|_1 = \sum \|x_i\|$ |
| $\ell_\infty$ norm | $\|x\|_\infty = \max_i \|x_i\|$ |
| $\ell_p$ norm | $\|x\|_p = (\sum \|x_i\|^p)^{1/p}$ |
| Frobenius norm | $\|A\|_F = \sqrt{\sum A_{ij}^2}$ |
| Symmetric matrix | $A = A^{\top}$, eigenvalues real |
| Eigenvalue decomposition | $A = Q \Lambda Q^{\top}$ |
| PSD matrix | $x^{\top} A x \geq 0 \; \forall x$, $\lambda_i \geq 0$ |
| PSD convex cone | $\alpha A + \beta B \succeq 0$ for $\alpha,\beta \geq 0$ |
| Gradient | $\nabla f(x) \in \mathbb{R}^n$, direction of steepest increase |
| Hessian | $\nabla^2 f(x) \in \mathbb{R}^{n \times n}$, local curvature |
| Line through $x, y$ | $\{x + \theta(y - x) \mid \theta \in \mathbb{R}\}$ |
| Line segment $[x, y]$ | $\{(1 - \theta) x + \theta y \mid \theta \in [0,1]\}$ |
| Ray $\overrightarrow{xy}$ | $\{x + \theta(y - x) \mid \theta \geq 0\}$ |

These mathematical tools form the foundation for the study of convex sets, convex functions, and optimization algorithms in the chapters that follow.
