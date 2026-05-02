# Chapter 3: Convex Functions

Convex functions are the fundamental objects of study in convex optimization. This chapter develops the definition of convex functions, their properties, various characterizations (first-order, second-order, and gradient monotonicity), as well as operations that preserve convexity and related geometric concepts.

---

## 3.1 Operations That Preserve Convexity of Sets

Before studying convex functions per se, it is useful to review how convexity of sets can be established through operations that preserve it. Given a set $C \subseteq \mathbb{R}^n$, there are three practical approaches to verifying convexity:

1. Apply the definition directly:
   $$x_1, x_2 \in C,\; 0 \leq \theta \leq 1 \quad\Longrightarrow\quad \theta x_1 + (1-\theta)x_2 \in C$$

2. Show that $C$ is obtained from simple convex sets (hyperplanes, halfspaces, norm balls, etc.) by operations that preserve convexity:
   - Intersection
   - Affine function
   - Perspective function
   - Linear-fractional function

3. Show that $C$ is a sublevel set of a convex function (discussed later).

### 3.1.1 Intersection

> **Property (Intersection of Convex Sets).** The intersection of any number (including infinite) of convex sets is convex: if each $C_i$ is convex, then $\bigcap_{i \in I} C_i$ is convex.

**Examples:**

- **Affine space:** An affine space defined by linear equalities can be expressed as an intersection of hyperplanes:
  $$\{x : Ax = b\} = \bigcap_{i=1}^{m} \{x : a_i^{\top} x = b_i\}$$
  Each equality constraint is the intersection of two halfspaces $\{x : a_i^{\top} x \leq b_i\}$ and $\{x : a_i^{\top} x \geq b_i\}$.

- **$\ell_{\infty}$-ball:**
  $$B_{\infty} = \{x : \|x\|_{\infty} \leq 1\} = \bigcap_{i=1}^{n} \{x : -1 \leq x_i \leq 1\}$$
  Each constraint is a halfspace, so the intersection is convex.

- **PSD cone:** The cone of positive semidefinite matrices
  $$\mathbb{S}_+^n = \{X \succeq 0\} = \bigcap_{v \in \mathbb{R}^n} \{X : v^{\top} X v \geq 0\}$$
  is the intersection of infinitely many halfspaces.

### 3.1.2 Affine Mapping

> **Property (Affine Image).** If $C$ is convex and $A \in \mathbb{R}^{m \times n}$, $b \in \mathbb{R}^m$, then the image under an affine map
> $$\{y = Ax + b : x \in C\}$$
> is convex.

**Example (Scaling and Translation):** Scaling and translating a convex set preserves convexity:
$$C = \{x : \|x\|_2 \leq 1\} \quad\Longrightarrow\quad AC + b = \{y : y = Ax + b,\; \|x\|_2 \leq 1\}$$

**Interpretation:** Linear transformations do not "bend" the set.

### 3.1.3 Inverse Affine Mapping

> **Property (Affine Preimage).** If $S \subset \mathbb{R}^n$ is convex and $f : \mathbb{R}^m \to \mathbb{R}^n$ is affine, the preimage is also convex:
> $$f^{-1}(S) = \{x \in \mathbb{R}^m : f(x) \in S\}$$

**Application: Linear Matrix Inequality (LMI).** Consider
$$F(x) = F_0 + \sum_{i=1}^{n} x_i F_i \succeq 0$$
The set of positive semidefinite matrices $\mathbb{S}_+^m = \{X \in \mathbb{S}^m : X \succeq 0\}$ is convex. The mapping $x \mapsto F(x)$ is affine. Therefore, the solution set
$$\{x : F(x) \succeq 0\} = F^{-1}(\mathbb{S}_+^m)$$
is convex by the affine preimage property.

---

## 3.2 Fundamental Concepts in Set Topology

We briefly review essential topological concepts that are foundational in convex analysis.

- A point $x \in \mathbb{R}^n$ is an $n$-tuple $(x_1, \dots, x_n)$.
- A set $S \subseteq \mathbb{R}^n$ is a collection of points.
- The **open ball** (neighborhood) centered at $x$ with radius $\epsilon$:
  $$B_{\epsilon}(x) = \{y \in \mathbb{R}^n : \|y - x\| < \epsilon\}$$

### 3.2.1 Open and Closed Sets

> **Open Set.** Every point has a neighborhood contained in the set:
> $$\forall x \in S,\; \exists \epsilon > 0 : B_{\epsilon}(x) \subset S$$
> Example: $(0, 1)$.

> **Closed Set.** Contains all its limit points; its complement is open.
> Example: $[0, 1]$.

### 3.2.2 Interior and Relative Interior

> **Interior.** $\operatorname{int}(S) = \{x \in S : \exists \epsilon > 0,\; B_{\epsilon}(x) \subset S\}$
> Points with a neighborhood contained in $S$. Example: $\operatorname{int}([0,1]) = (0,1)$.

> **Relative Interior (relint).** If $S$ lies in an affine subspace $A$, then $x \in S$ is a relative interior point if
> $$B_{\epsilon}(x) \cap A \subseteq S$$
> for some $\epsilon > 0$. The set of all such points is $\operatorname{relint}(S)$.
>
> Example: The line segment $[0,1]$ in $\mathbb{R}^2$ has empty interior, but its relative interior is $(0,1)$ within the line it spans.

### 3.2.3 Limit Points and Closure

> **Limit Point.** Every neighborhood contains other points from the set:
> $$\forall \epsilon > 0: B_{\epsilon}(x) \cap (S \setminus \{x\}) \neq \varnothing$$
> Points arbitrarily close to $x$ are in $S$.

> **Closure.** $\operatorname{cl}(S)$ is $S$ together with all its limit points; it is the smallest closed set containing $S$.
> $$\operatorname{cl}((0,1)) = [0,1]$$

### 3.2.4 Boundary

> **Boundary.** $\partial S = \operatorname{cl}(S) \setminus \operatorname{int}(S)$
>
> Every neighborhood contains points from both $S$ and its complement.

**Example:** $S = (0, 1]$
- $\operatorname{cl}(S) = [0, 1]$, $\operatorname{int}(S) = (0, 1)$, $\partial S = \{0, 1\}$

**Key Relationships:**
- $\operatorname{cl}(S) = \operatorname{int}(S) \cup \partial S$
- $\operatorname{int}(S) \cap \partial S = \varnothing$
- $\operatorname{int}(S) \subseteq S \subseteq \operatorname{cl}(S)$

---

## 3.3 Definition of Convex Functions

> **Definition (Convex Function).** A function $f : C \to \mathbb{R}$ defined on a convex set $C \subseteq \mathbb{R}^n$ is called **convex** if
> $$f(\theta x + (1-\theta)y) \leq \theta f(x) + (1-\theta) f(y) \tag{3.1}$$
> for all $x, y \in C$ and all $\theta \in [0, 1]$.

> **Definition (Strictly Convex).** $f$ is **strictly convex** if the inequality is strict whenever $x \neq y$ and $\theta \in (0, 1)$:
> $$f(\theta x + (1-\theta)y) < \theta f(x) + (1-\theta) f(y) \tag{3.2}$$

> **Definition (Concave Function).** $f$ is **concave** if $-f$ is convex, i.e.,
> $$f(\theta x + (1-\theta)y) \geq \theta f(x) + (1-\theta) f(y) \tag{3.3}$$

**Geometric meaning:** For a convex function $f$, the graph lies *below* the chord connecting any two points. For a concave function, the graph lies *above* the chord.

**Note:** Linear (affine) functions are both convex and concave, but neither strictly convex nor strictly concave.

---

## 3.4 Common Examples of Convex Functions

**Univariate examples:**
- $f(x) = ax + b$ (affine)
- $f(x) = x^2$, $f(x) = e^{ax}$, $f(x) = |x|^p$ for $p \geq 1$
- $f(x) = -\log x$ on $(0, \infty)$

**Multivariate examples:**
- $f(x) = a^{\top} x + b$ (affine)
- $f(x) = x^{\top} P x$ with $P \succeq 0$ (quadratic)
- $f(x) = \|x\|$ (any norm)
- $f(x) = \max\{x_1, \dots, x_n\}$
- $f(x) = \log\left(\sum_{i} e^{x_i}\right)$ (log-sum-exp)

---

## 3.5 Convexity via Restriction to Lines

> **Theorem (Restriction to Lines).** A function $f : C \to \mathbb{R}$ with $\operatorname{dom} f = C \subseteq \mathbb{R}^n$ is convex if and only if for every $z, v \in \mathbb{R}^n$ with $\{z + t v : t \in \mathbb{R}\} \cap C \neq \varnothing$, the one-dimensional function
> $$\phi(t) = f(z + t v)$$
> is convex on its domain $\{t : z + t v \in C\}$.

**Intuition:** This theorem reduces multivariate convexity to one-dimensional verification.

**Examples:**
- $f(x, y) = x^2 + y^2 \;\longrightarrow\; g(t) = (z_1 + t v_1)^2 + (z_2 + t v_2)^2$ (quadratic in $t$)
- $f(X) = -\log \det X$ with $\operatorname{dom} f = \mathbb{S}_{++}^n$

---

> **Proposition.** Let $C \subset \mathbb{R}^n$ be convex and $f : C \to \mathbb{R}$. Then $f$ is convex if and only if for every line $L = \{x + t v : t \in \mathbb{R}\}$ meeting $C$, the restriction $\phi(t) = f(x + t v)$ is convex on $\{t : x + t v \in C\}$.

**Proof.**

$(\Rightarrow)$ If $f$ is convex, then for any $t_1, t_2$ with $x + t_1 v, x + t_2 v \in C$ and $\lambda \in [0, 1]$,
$$f\big(\lambda(x + t_1 v) + (1-\lambda)(x + t_2 v)\big) \leq \lambda f(x + t_1 v) + (1-\lambda) f(x + t_2 v),$$
which is the same as
$$\phi(\lambda t_1 + (1-\lambda) t_2) \leq \lambda \phi(t_1) + (1-\lambda) \phi(t_2),$$
so $\phi$ is convex.

$(\Leftarrow)$ Conversely, let $x, y \in C$ and $\theta \in [0, 1]$. Define $\phi(t) = f(y + t(x - y))$. Then
$$f(\theta x + (1-\theta)y) = \phi(\theta) \leq \theta \phi(1) + (1-\theta) \phi(0) = \theta f(x) + (1-\theta) f(y),$$
so $f$ is convex. $\square$

---

## 3.6 Epigraph and Sublevel Sets

### 3.6.1 Epigraph

> **Definition (Epigraph).** For a function $f : \mathbb{R}^n \to \mathbb{R}$, the **epigraph** of $f$ is the set
> $$\operatorname{epi} f = \{(x, t) \in \mathbb{R}^{n+1} : f(x) \leq t\}$$

**Geometric meaning:** The epigraph is the region on or above the graph of $f$.

> **Key Property.** $f$ is convex $\Longleftrightarrow$ $\operatorname{epi} f$ is a convex set.

> **Proposition.** Let $f : \mathbb{R}^n \to \mathbb{R} \cup \{+\infty\}$ and $\operatorname{epi} f = \{(x, t) \in \mathbb{R}^{n+1} : f(x) \leq t\}$. Then $f$ is convex on its domain if and only if $\operatorname{epi} f$ is a convex set.

**Proof.**

$(\Rightarrow)$ Assume $f$ is convex. Take $(x_1, t_1), (x_2, t_2) \in \operatorname{epi} f$ so $f(x_i) \leq t_i$. For any $\theta \in [0, 1]$, set $\bar{x} = \theta x_1 + (1-\theta) x_2$ and $\bar{t} = \theta t_1 + (1-\theta) t_2$. By convexity of $f$,
$$f(\bar{x}) \leq \theta f(x_1) + (1-\theta) f(x_2) \leq \theta t_1 + (1-\theta) t_2 = \bar{t},$$
hence $(\bar{x}, \bar{t}) \in \operatorname{epi} f$. Thus $\operatorname{epi} f$ is convex.

$(\Leftarrow)$ Conversely, assume $\operatorname{epi} f$ is convex. For any $x_1, x_2 \in \operatorname{dom} f$ and $\theta \in [0, 1]$, the points $(x_i, f(x_i)) \in \operatorname{epi} f$, so their convex combination $(\bar{x}, \bar{t})$ with $\bar{x} = \theta x_1 + (1-\theta) x_2$ and $\bar{t} = \theta f(x_1) + (1-\theta) f(x_2)$ lies in $\operatorname{epi} f$. Therefore $f(\bar{x}) \leq \bar{t}$, i.e.
$$f(\theta x_1 + (1-\theta) x_2) \leq \theta f(x_1) + (1-\theta) f(x_2),$$
so $f$ is convex. $\square$

### 3.6.2 Sublevel Sets

> **Definition (Sublevel Set).** For $f : \mathbb{R}^n \to \mathbb{R}$ and $\alpha \in \mathbb{R}$, the **$\alpha$-sublevel set** is
> $$S_{\alpha} = \{x \in \operatorname{dom}(f) : f(x) \leq \alpha\}$$
> the set of points where $f$ takes values $\leq \alpha$.

> **Key Property.** If $f$ is convex, then all sublevel sets $S_{\alpha}$ are convex.
>
> **Warning:** The converse is **not** true. For example, $f(x) = x^3$ has convex sublevel sets but is not convex.

**Examples:**
- $f(x) = x^2$: $S_{\alpha} = [-\sqrt{\alpha}, \sqrt{\alpha}]$ (convex intervals)
- $f(x) = x^3$: $S_{\alpha} = (-\infty, \sqrt[3]{\alpha}]$ (convex intervals, but $f$ is not convex)

---

## 3.7 Jensen's Inequality

> **Theorem (Jensen's Inequality — Discrete Form).** If $f$ is convex and $\theta_i \geq 0$ with $\sum_{i=1}^{k} \theta_i = 1$, then
> $$f\!\left(\sum_{i=1}^{k} \theta_i x_i\right) \leq \sum_{i=1}^{k} \theta_i f(x_i) \tag{3.4}$$

> **Integral Form.** For convex $f$ and a probability measure $p$:
> $$f\!\left(\int x \, p(x) \, dx\right) \leq \int f(x) \, p(x) \, dx$$

> **Expectation Form.** For convex $f$ and a random variable $X$:
> $$f(\mathbb{E}[X]) \leq \mathbb{E}[f(X)]$$

---

## 3.8 First-Order Condition for Convexity

### 3.8.1 Gradient and Differentiability

**Precondition:** $f$ is differentiable if the gradient
$$\nabla f(x) = \left(\frac{\partial f(x)}{\partial x_1}, \frac{\partial f(x)}{\partial x_2}, \dots, \frac{\partial f(x)}{\partial x_n}\right)^{\top}$$
exists at each $x \in \operatorname{dom} f$.

> **Theorem (First-Order Condition).** A differentiable function $f : \mathbb{R}^n \to \mathbb{R}$ is convex if and only if for all $x, y \in \operatorname{dom} f$:
> $$f(y) \geq f(x) + \nabla f(x)^{\top} (y - x) \tag{3.5}$$

**Implication:** If $\nabla f(x^*) = 0$, then $x^*$ is a global minimum.

**Example:** $f(x) = x^2$, $\nabla f(x) = 2x$:
$$f(y) = y^2 \geq x^2 + 2x(y - x)$$

### 3.8.2 Proof of Equivalence

**Direction 1: Basic convexity $\Rightarrow$ first-order condition.**

Assume $f : \mathbb{R}^n \to \mathbb{R}$ is convex and differentiable. For any $x, y$ and $\theta \in (0, 1]$:
$$f(x + \theta(y - x)) \leq (1 - \theta) f(x) + \theta f(y).$$
Subtract $f(x)$ and divide by $\theta > 0$:
$$\frac{f(x + \theta(y - x)) - f(x)}{\theta} \leq f(y) - f(x).$$
Take $\theta \to 0$. Differentiability implies:
$$\lim_{\theta \to 0} \frac{f(x + \theta(y - x)) - f(x)}{\theta} = \nabla f(x)^{\top} (y - x).$$
Hence:
$$f(y) \geq f(x) + \nabla f(x)^{\top} (y - x).$$

**Direction 2: First-order condition $\Rightarrow$ basic convexity.**

Assume for all $x, y$:
$$f(y) \geq f(x) + \nabla f(x)^{\top} (y - x).$$
Let $z = \theta x + (1-\theta) y$ with $\theta \in [0, 1]$. Apply the condition twice:
$$f(x) \geq f(z) + \nabla f(z)^{\top} (x - z),$$
$$f(y) \geq f(z) + \nabla f(z)^{\top} (y - z).$$
Multiply the two inequalities by $\theta$ and $1 - \theta$ respectively and add:
$$\theta f(x) + (1-\theta) f(y) \geq f(z) + \nabla f(z)^{\top} \big(\theta x + (1-\theta) y - z\big).$$
Since $z = \theta x + (1-\theta) y$, we have:
$$f(\theta x + (1-\theta) y) \leq \theta f(x) + (1-\theta) f(y).$$

---

## 3.9 Gradient Monotonicity

> **Definition (Monotone Gradient).** A differentiable function $f : \mathbb{R}^n \to \mathbb{R}$ has a **monotone gradient** if for all $x, y \in \operatorname{dom} f$:
> $$\langle \nabla f(x) - \nabla f(y), x - y \rangle \geq 0 \tag{3.6}$$

**Connection to Convexity:**
- If $f$ is convex, its gradient is monotone.
- Conversely, if $\nabla f$ is monotone, $f$ is convex.

**Example:** $f(x) = x^{\top} Q x$ with $Q \succeq 0$:
$$\nabla f(x) = 2Qx, \quad \langle \nabla f(x) - \nabla f(y), x - y \rangle = 2(x - y)^{\top} Q (x - y) \geq 0$$

### 3.9.1 Proof of Equivalence between First-Order Condition and Gradient Monotonicity

**Direction 1: First-order condition $\Rightarrow$ Gradient Monotonicity.**

Assume $f : D \to \mathbb{R}$ is differentiable and satisfies the first-order condition:
$$f(y) \geq f(x) + \nabla f(x)^{\top} (y - x), \quad \forall x, y \in D.$$
Write this inequality twice, swapping $x$ and $y$:
$$f(y) \geq f(x) + \nabla f(x)^{\top} (y - x),$$
$$f(x) \geq f(y) + \nabla f(y)^{\top} (x - y).$$
Adding the two inequalities yields:
$$0 \geq \nabla f(x)^{\top} (y - x) + \nabla f(y)^{\top} (x - y),$$
which simplifies to
$$\langle \nabla f(x) - \nabla f(y), x - y \rangle \geq 0.$$

**Direction 2: Gradient Monotonicity $\Rightarrow$ First-order condition.**

Assume $f$ is differentiable and satisfies gradient monotonicity:
$$(\nabla f(y) - \nabla f(x))^{\top} (y - x) \geq 0.$$
For any $x, y \in D$, by the Fundamental Theorem of Calculus along the line segment:
$$f(y) - f(x) = \int_{0}^{1} \frac{d}{dt} f(x + t(y - x)) \, dt = \int_{0}^{1} \nabla f(x + t(y - x))^{\top} (y - x) \, dt.$$
Subtract the tangent at $x$:
$$f(y) - f(x) - \nabla f(x)^{\top} (y - x) = \int_{0}^{1} \big(\nabla f(x + t(y - x)) - \nabla f(x)\big)^{\top} (y - x) \, dt \geq 0.$$
This gives the first-order condition:
$$f(y) \geq f(x) + \nabla f(x)^{\top} (y - x).$$

---

## 3.10 Second-Order Condition for Convexity

**Precondition:** $f$ is twice-differentiable if $\operatorname{dom} f$ is open and the Hessian
$$\nabla^2 f(x)_{ij} = \frac{\partial^2 f(x)}{\partial x_i \partial x_j}, \quad i, j = 1, \dots, n,$$
exists at each $x \in \operatorname{dom} f$.

> **Theorem (Second-Order Condition).** A twice-differentiable function $f : \mathbb{R}^n \to \mathbb{R}$ is convex if and only if its Hessian is positive semidefinite for all $x \in \operatorname{dom} f$:
> $$\nabla^2 f(x) \succeq 0 \tag{3.7}$$

**Example:** $f(x) = x^{\top} Q x$ with $Q \succeq 0$:
$$\nabla f(x) = 2Qx, \quad \nabla^2 f(x) = 2Q \succeq 0$$

### 3.10.1 Proof of Equivalence between Gradient Monotonicity and Second-Order Condition

**Direction 1: Gradient Monotonicity $\Rightarrow$ Hessian PSD.**

Assume $(\nabla f(y) - \nabla f(x))^{\top} (y - x) \geq 0$ for all $x, y \in D$. Consider an infinitesimal perturbation along direction $d$: $y = x + \epsilon d$, $\epsilon > 0$. Gradient monotonicity implies:
$$(\nabla f(x + \epsilon d) - \nabla f(x))^{\top} (\epsilon d) \geq 0 \;\Longrightarrow\; \frac{(\nabla f(x + \epsilon d) - \nabla f(x))^{\top} d}{\epsilon} \geq 0.$$
Take the limit as $\epsilon \to 0$:
$$d^{\top} \nabla^2 f(x) d \geq 0 \quad \forall d \in \mathbb{R}^n.$$

**Direction 2: Hessian PSD $\Rightarrow$ Gradient Monotonicity.**

Assume $f : D \to \mathbb{R}$ is twice differentiable and $\nabla^2 f(x) \succeq 0$ for all $x \in D$. For any $x, y \in D$, consider the line segment $x + t(y - x)$, $t \in [0, 1]$:
$$\nabla f(y) - \nabla f(x) = \int_{0}^{1} \frac{d}{dt} \nabla f(x + t(y - x)) \, dt = \int_{0}^{1} \nabla^2 f(x + t(y - x)) (y - x) \, dt.$$
Take inner product with $y - x$:
$$(\nabla f(y) - \nabla f(x))^{\top} (y - x) = \int_{0}^{1} (y - x)^{\top} \nabla^2 f(x + t(y - x)) (y - x) \, dt \geq 0.$$

---

## 3.11 Chain of Equivalences

For twice-differentiable functions, the following four statements are **equivalent** characterizations of convexity:

```
   Convexity
f(θx + (1−θ)y) ≤ θf(x) + (1−θ)f(y)
        ⇕
 First-order Condition                  Gradient Monotonicity
f(y) ≥ f(x) + ∇f(x)ᵀ(y−x)    ⇔    ⟨∇f(x)−∇f(y), x−y⟩ ≥ 0
        ⇕
 Second-order Condition
    ∇²f(x) ⪰ 0
```

In summary:

1. **Convexity** (Definition): $f(\theta x + (1-\theta)y) \leq \theta f(x) + (1-\theta) f(y)$
2. **First-order Condition**: $f(y) \geq f(x) + \nabla f(x)^{\top} (y - x)$
3. **Gradient Monotonicity**: $\langle \nabla f(x) - \nabla f(y), x - y \rangle \geq 0$
4. **Second-order Condition**: $\nabla^2 f(x) \succeq 0$

Each provides a different practical tool for verifying or exploiting convexity in analysis and algorithm design.

---

## 3.12 Smooth and Strongly Convex Functions

Beyond mere convexity, many optimization algorithms rely on stronger structural assumptions—*smoothness* and *strong convexity*—to obtain quantitative convergence guarantees.  This section develops L-smoothness (Lipschitz gradient) and m-strong convexity, their equivalent characterizations, and the convergence rates of gradient descent under these conditions.

### 3.12.1 L-Smooth Functions

> **Definition (L-smooth function).** A differentiable function $f : \mathbb{R}^n \to \mathbb{R}$ is called **L-smooth** (or has an **L-Lipschitz continuous gradient**) for some $L > 0$ if for all $x, y \in \mathbb{R}^n$,
> $$\|\nabla f(x) - \nabla f(y)\| \leq L \|x - y\|. \tag{3.8}$$

Smoothness bounds how fast the gradient can change.  Unlike convexity, it does *not* guarantee that stationary points are global minima; it only guarantees a quadratic upper bound on the function.

---

**Chain of Equivalences.**  For a twice-differentiable function $f$, the following four statements are equivalent characterizations of L-smoothness:

$$
\begin{aligned}
\text{(I)}\quad &\|\nabla f(x) - \nabla f(y)\| \leq L\|x-y\| \quad \text{(Lipschitz gradient)} \\[4pt]
\text{(II)}\quad &g(x) = \frac{L}{2}\|x\|^2 - f(x) \text{ is convex} \\[4pt]
\text{(III)}\quad &f(y) \leq f(x) + \langle\nabla f(x),\, y-x\rangle + \frac{L}{2}\|y-x\|^2 \quad \text{(Descent Lemma)} \\[4pt]
\text{(IV)}\quad &\nabla^2 f(x) \preceq L I \quad \text{(Hessian bound)}
\end{aligned}
$$

We now prove the full cycle of equivalences.

---

**Proof: (I) $\Rightarrow$ (III) (Lipschitz gradient $\Rightarrow$ Descent Lemma).**

Using the Fundamental Theorem of Calculus along the line segment $x + t(y-x)$:

$$
f(y) - f(x) = \int_0^1 \langle\nabla f(x + t(y-x)),\, y-x\rangle \, dt.
$$

Subtract the linear approximation at $x$:

$$
\begin{aligned}
f(y) - f(x) - \langle\nabla f(x), y-x\rangle
&= \int_0^1 \langle\nabla f(x + t(y-x)) - \nabla f(x),\, y-x\rangle \, dt \\[4pt]
&\leq \int_0^1 \|\nabla f(x + t(y-x)) - \nabla f(x)\| \cdot \|y-x\| \, dt \\[4pt]
&\leq \int_0^1 L \cdot t \|y-x\| \cdot \|y-x\| \, dt \\[4pt]
&= L \|y-x\|^2 \int_0^1 t \, dt = \frac{L}{2} \|y-x\|^2.
\end{aligned}
$$

Thus $f(y) \leq f(x) + \langle\nabla f(x), y-x\rangle + \frac{L}{2}\|y-x\|^2$.  $\square$

---

**Proof: (III) $\Rightarrow$ (II) (Descent Lemma $\Rightarrow$ $g$ convex).**

Define $g(x) = \frac{L}{2}\|x\|^2 - f(x)$.  To show $g$ is convex, we verify the first-order condition.  For any $x, y$:

$$
\begin{aligned}
g(y) - g(x) - \langle\nabla g(x), y-x\rangle
&= \Big[\frac{L}{2}\|y\|^2 - f(y)\Big] - \Big[\frac{L}{2}\|x\|^2 - f(x)\Big] - \langle L x - \nabla f(x), y-x\rangle \\[4pt]
&= \frac{L}{2}\|y\|^2 - \frac{L}{2}\|x\|^2 - L\langle x, y-x\rangle - \Big[f(y) - f(x) - \langle\nabla f(x), y-x\rangle\Big] \\[4pt]
&= \frac{L}{2}\|y - x\|^2 - \Big[f(y) - f(x) - \langle\nabla f(x), y-x\rangle\Big] \\[4pt]
&\geq \frac{L}{2}\|y - x\|^2 - \frac{L}{2}\|y - x\|^2 = 0,
\end{aligned}
$$

where the inequality uses condition (III).  Hence $g(y) \geq g(x) + \langle\nabla g(x), y-x\rangle$, so $g$ is convex.  $\square$

---

**Proof: (II) $\Rightarrow$ (IV) (Convexity of $g$ $\Rightarrow$ Hessian bound).**

If $g(x) = \frac{L}{2}\|x\|^2 - f(x)$ is convex and twice differentiable, then $\nabla^2 g(x) \succeq 0$ for all $x$.  Computing the Hessian:

$$
\nabla^2 g(x) = L I - \nabla^2 f(x).
$$

Thus $L I - \nabla^2 f(x) \succeq 0$, i.e., $\nabla^2 f(x) \preceq L I$.  $\square$

---

**Proof: (IV) $\Rightarrow$ (I) (Hessian bound $\Rightarrow$ Lipschitz gradient).**

Assume $\nabla^2 f(x) \preceq L I$ for all $x$.  For any $x, y$, use the integral representation:

$$
\|\nabla f(y) - \nabla f(x)\| = \left\| \int_0^1 \nabla^2 f(x + t(y-x)) (y-x) \, dt \right\|.
$$

Since for any vector $v$, $\|\nabla^2 f(z) v\| \leq \|\nabla^2 f(z)\|_{\text{op}} \cdot \|v\|$ and $\nabla^2 f(z) \preceq L I$ implies $\|\nabla^2 f(z)\|_{\text{op}} \leq L$, we have:

$$
\|\nabla f(y) - \nabla f(x)\| \leq \int_0^1 \|\nabla^2 f(x + t(y-x))\|_{\text{op}} \cdot \|y-x\| \, dt \leq L \|y-x\|.
$$

Thus condition (I) holds.  $\square$

This completes the chain of equivalences for L-smoothness.

---

### 3.12.2 Gradient Descent Convergence under Smoothness

Gradient descent updates:

$$
x_{t+1} = x_t - \eta \nabla f(x_t). \tag{3.9}
$$

Under L-smoothness alone, we can guarantee that the gradient norm converges to zero.

> **Lemma (Descent Lemma for gradient descent).** If $f$ is L-smooth and we take $\eta = \frac{1}{L}$, then for each iteration:
> $$f(x_{t+1}) - f(x_t) \leq -\frac{1}{2L} \|\nabla f(x_t)\|^2. \tag{3.10}$$

**Proof.**  Applying the Descent Lemma (condition III) with $y = x_{t+1} = x_t - \frac{1}{L} \nabla f(x_t)$:

$$
\begin{aligned}
f(x_{t+1}) &\leq f(x_t) + \langle\nabla f(x_t), x_{t+1} - x_t\rangle + \frac{L}{2}\|x_{t+1} - x_t\|^2 \\[4pt]
&= f(x_t) - \frac{1}{L}\|\nabla f(x_t)\|^2 + \frac{L}{2} \cdot \frac{1}{L^2}\|\nabla f(x_t)\|^2 \\[4pt]
&= f(x_t) - \frac{1}{2L}\|\nabla f(x_t)\|^2.
\end{aligned}
$$

Rearranging gives the claimed bound.  $\square$

---

> **Theorem (Convergence to stationary point).** Let $f$ be L-smooth and $f^* = \inf_x f(x) > -\infty$.  After $T$ iterations of gradient descent with $\eta = \frac{1}{L}$:
> $$\min_{0 \leq t \leq T-1} \|\nabla f(x_t)\|^2 \leq \frac{2L\big(f(x_0) - f^*\big)}{T}. \tag{3.11}$$
> Consequently, $\min_{t < T} \|\nabla f(x_t)\| \to 0$ at a rate $O(1/\sqrt{T})$.

**Proof.**  Summing the Descent Lemma over $t = 0, 1, \dots, T-1$:

$$
\begin{aligned}
\sum_{t=0}^{T-1} \big(f(x_t) - f(x_{t+1})\big) &\geq \frac{1}{2L} \sum_{t=0}^{T-1} \|\nabla f(x_t)\|^2.
\end{aligned}
$$

The left-hand side telescopes:

$$
f(x_0) - f(x_T) \geq \frac{1}{2L} \sum_{t=0}^{T-1} \|\nabla f(x_t)\|^2 \geq \frac{T}{2L} \min_{0 \leq t \leq T-1} \|\nabla f(x_t)\|^2.
$$

Since $f(x_T) \geq f^*$,

$$
\frac{T}{2L} \min_{t < T} \|\nabla f(x_t)\|^2 \leq f(x_0) - f^*,
$$

which rearranges to the stated bound.  $\square$

This shows gradient descent converges to a stationary point (where $\nabla f \approx 0$) at a rate $O(1/T)$.

---

### 3.12.3 Smooth + Convex Convergence

If $f$ is not only L-smooth but also convex, we obtain convergence to a *global minimum* (not just a stationary point).

> **Theorem (Convergence under smoothness + convexity).** Let $f$ be L-smooth and convex, and let $x^*$ be a global minimizer of $f$.  After $T$ iterations of gradient descent with $\eta = \frac{1}{L}$:
> $$f(x_T) - f(x^*) \leq \frac{L}{2T} \|x_0 - x^*\|^2. \tag{3.12}$$

**Proof.**  Write $\eta = \frac{1}{L}$.  For each iteration:

$$
\begin{aligned}
\|x_{t+1} - x^*\|^2 &= \|x_t - \eta \nabla f(x_t) - x^*\|^2 \\
&= \|x_t - x^*\|^2 - 2\eta \langle\nabla f(x_t), x_t - x^*\rangle + \eta^2 \|\nabla f(x_t)\|^2.
\end{aligned}
$$

By convexity (first-order condition), $f(x_t) - f(x^*) \leq \langle\nabla f(x_t), x_t - x^*\rangle$.  Hence:

$$
-2\eta \langle\nabla f(x_t), x_t - x^*\rangle \leq -2\eta \big(f(x_t) - f(x^*)\big).
$$

Using the Descent Lemma (3.10), $\eta^2 \|\nabla f(x_t)\|^2 = \frac{1}{L^2} \|\nabla f(x_t)\|^2 \leq \frac{2}{L}\big(f(x_t) - f(x_{t+1})\big)$.  Substituting:

$$
\begin{aligned}
\|x_{t+1} - x^*\|^2 &\leq \|x_t - x^*\|^2 - \frac{2}{L}\big(f(x_t) - f(x^*)\big) + \frac{2}{L}\big(f(x_t) - f(x_{t+1})\big) \\[4pt]
&= \|x_t - x^*\|^2 - \frac{2}{L}\big(f(x_{t+1}) - f(x^*)\big).
\end{aligned}
$$

Let $\Delta_t = f(x_t) - f(x^*)$.  Then $\|x_{t+1} - x^*\|^2 \leq \|x_t - x^*\|^2 - \frac{2}{L} \Delta_{t+1}$, which implies:

$$
\Delta_{t+1} \leq \frac{L}{2} \big(\|x_t - x^*\|^2 - \|x_{t+1} - x^*\|^2\big).
$$

Summing this inequality from $t = 0$ to $T-1$ telescopes:

$$
\sum_{t=1}^{T} \Delta_t \leq \frac{L}{2} \big(\|x_0 - x^*\|^2 - \|x_T - x^*\|^2\big) \leq \frac{L}{2} \|x_0 - x^*\|^2.
$$

Since $\Delta_t$ is non-increasing (the Descent Lemma guarantees $f(x_{t+1}) \leq f(x_t)$), we have $T \cdot \Delta_T \leq \sum_{t=0}^{T-1} \Delta_t \leq \frac{L}{2} \|x_0 - x^*\|^2$.  Therefore:

$$
f(x_T) - f(x^*) \leq \frac{L}{2T} \|x_0 - x^*\|^2.
\qquad\square
$$

This is the $O(1/T)$ rate for smooth convex optimization.

---

### 3.12.4 m-Strongly Convex Functions

> **Definition (m-strongly convex function).** A differentiable function $f : \mathbb{R}^n \to \mathbb{R}$ is called **m-strongly convex** for some $m > 0$ if for all $x, y \in \mathbb{R}^n$,
> $$f(y) \geq f(x) + \langle\nabla f(x),\, y-x\rangle + \frac{m}{2}\|y-x\|^2. \tag{3.13}$$

Strong convexity is a strengthened form of convexity that guarantees the function grows at least quadratically away from any point, ensuring a *unique* global minimum.

> **Remark.**  $m$ is often denoted $\mu$ in many texts.  We keep $m$ for consistency with the lecture notation.

---

**Chain of Equivalences.**  For a twice-differentiable function $f$, the following four statements are equivalent:

$$
\begin{aligned}
\text{(I)}\quad &f(y) \geq f(x) + \langle\nabla f(x), y-x\rangle + \frac{m}{2}\|y-x\|^2 \quad \text{(Strong FOC)} \\[4pt]
\text{(II)}\quad &h(x) = f(x) - \frac{m}{2}\|x\|^2 \text{ is convex} \\[4pt]
\text{(III)}\quad &\langle\nabla f(x) - \nabla f(y),\, x-y\rangle \geq m\|x-y\|^2 \quad \text{(Strong Gradient Monotonicity)} \\[4pt]
\text{(IV)}\quad &\nabla^2 f(x) \succeq m I \quad \text{(Hessian bound)}
\end{aligned}
$$

---

**Proof: (I) $\Rightarrow$ (II) (Strong FOC $\Rightarrow$ $h$ convex).**

Define $h(x) = f(x) - \frac{m}{2}\|x\|^2$.  For any $x, y$,

$$
\begin{aligned}
h(y) - h(x) - \langle\nabla h(x), y-x\rangle
&= \Big[f(y) - \frac{m}{2}\|y\|^2\Big] - \Big[f(x) - \frac{m}{2}\|x\|^2\Big] - \langle\nabla f(x) - m x, y-x\rangle \\[4pt]
&= f(y) - f(x) - \langle\nabla f(x), y-x\rangle - \frac{m}{2}\big(\|y\|^2 - \|x\|^2 - 2\langle x, y-x\rangle\big) \\[4pt]
&= f(y) - f(x) - \langle\nabla f(x), y-x\rangle - \frac{m}{2}\|y-x\|^2 \\[4pt]
&\geq 0,
\end{aligned}
$$

where the last line uses condition (I).  Hence $h(y) \geq h(x) + \langle\nabla h(x), y-x\rangle$, so $h$ is convex by the first-order condition.  $\square$

---

**Proof: (II) $\Rightarrow$ (IV) (Convexity of $h$ $\Rightarrow$ Hessian bound).**

If $h(x) = f(x) - \frac{m}{2}\|x\|^2$ is convex and twice differentiable, then $\nabla^2 h(x) \succeq 0$ for all $x$.  Computing the Hessian:

$$
\nabla^2 h(x) = \nabla^2 f(x) - m I.
$$

Thus $\nabla^2 f(x) - m I \succeq 0$, i.e., $\nabla^2 f(x) \succeq m I$.  $\square$

---

**Proof: (IV) $\Rightarrow$ (III) (Hessian bound $\Rightarrow$ Strong Gradient Monotonicity).**

Assume $\nabla^2 f(x) \succeq m I$ for all $x$.  For any $x, y$, use the integral representation:

$$
\begin{aligned}
\langle\nabla f(y) - \nabla f(x),\, y-x\rangle
&= \left\langle \int_0^1 \nabla^2 f(x + t(y-x)) (y-x) \, dt,\; y-x \right\rangle \\[4pt]
&= \int_0^1 (y-x)^{\top} \nabla^2 f(x + t(y-x)) (y-x) \, dt \\[4pt]
&\geq \int_0^1 m \|y-x\|^2 \, dt = m \|y-x\|^2.
\end{aligned}
$$

This establishes condition (III).  $\square$

---

**Proof: (III) $\Rightarrow$ (I) (Strong Gradient Monotonicity $\Rightarrow$ Strong FOC).**

Assume $\langle\nabla f(x) - \nabla f(y), x-y\rangle \geq m\|x-y\|^2$.  Using the Fundamental Theorem of Calculus:

$$
\begin{aligned}
f(y) - f(x) - \langle\nabla f(x), y-x\rangle
&= \int_0^1 \langle\nabla f(x + t(y-x)) - \nabla f(x),\, y-x\rangle \, dt.
\end{aligned}
$$

Let $s = \|y-x\|$.  Apply the strong monotonicity condition along the segment; for $z_t = x + t(y-x)$, evaluate with $x$ and $z_t$:

$$
\langle\nabla f(z_t) - \nabla f(x),\, z_t - x\rangle \geq m\|z_t - x\|^2 = m t^2 s^2.
$$

Note that $z_t - x = t(y-x)$, so:

$$
t \cdot \langle\nabla f(z_t) - \nabla f(x),\, y-x\rangle \geq m t^2 s^2 \;\Longrightarrow\; \langle\nabla f(z_t) - \nabla f(x),\, y-x\rangle \geq m t s^2.
$$

Integrating over $t \in [0, 1]$:

$$
\int_0^1 \langle\nabla f(x + t(y-x)) - \nabla f(x),\, y-x\rangle \, dt \geq \int_0^1 m t s^2 \, dt = \frac{m}{2} s^2 = \frac{m}{2} \|y-x\|^2.
$$

Thus $f(y) \geq f(x) + \langle\nabla f(x), y-x\rangle + \frac{m}{2}\|y-x\|^2$.  $\square$

This completes the chain of equivalences for m-strong convexity.

---

### 3.12.5 Linear Convergence under Smooth + Strong Convexity

When a function is both L-smooth and m-strongly convex, gradient descent achieves *linear* (exponential) convergence to the unique global minimizer.

> **Theorem (Linear convergence).** Let $f$ be L-smooth and m-strongly convex.  Let $x^*$ be the unique global minimizer.  Gradient descent with step size $\eta = \frac{1}{L}$ satisfies:
> $$f(x_T) - f(x^*) \leq \left(1 - \frac{m}{L}\right)^T \big(f(x_0) - f(x^*)\big). \tag{3.14}$$

**Proof.**  From the Descent Lemma with $\eta = \frac{1}{L}$:

$$
f(x_{t+1}) \leq f(x_t) - \frac{1}{2L}\|\nabla f(x_t)\|^2.
$$

By m-strong convexity, we have a lower bound relating the gradient norm to the optimality gap.  For any $x$,

$$
f(x^*) \geq f(x) + \langle\nabla f(x), x^* - x\rangle + \frac{m}{2}\|x^* - x\|^2.
$$

Minimizing the right-hand side over $y$ (a quadratic in $y$) gives:

$$
f(x^*) \geq f(x) - \frac{1}{2m}\|\nabla f(x)\|^2,
$$

since $\min_y \big\{f(x) + \langle\nabla f(x), y-x\rangle + \frac{m}{2}\|y-x\|^2\big\} = f(x) - \frac{1}{2m}\|\nabla f(x)\|^2$.

Rearranging yields the **Polyak–Łojasiewicz (PL) inequality**:

$$
\|\nabla f(x)\|^2 \geq 2m\big(f(x) - f(x^*)\big). \tag{3.15}
$$

Plug this into the Descent Lemma:

$$
\begin{aligned}
f(x_{t+1}) - f(x^*) &\leq f(x_t) - f(x^*) - \frac{1}{2L} \cdot 2m\big(f(x_t) - f(x^*)\big) \\[4pt]
&= \left(1 - \frac{m}{L}\right) \big(f(x_t) - f(x^*)\big).
\end{aligned}
$$

Unrolling this inequality over $T$ iterations gives:

$$
f(x_T) - f(x^*) \leq \left(1 - \frac{m}{L}\right)^T \big(f(x_0) - f(x^*)\big).
\qquad\square
$$

---

> **Definition (Condition number).** The ratio
> $$\kappa = \frac{L}{m} \geq 1$$
> is called the **condition number** of $f$.  It measures how "elongated" the sublevel sets of $f$ are.

Since $0 < m \leq L$, we have $\kappa \geq 1$.  The convergence rate can be rewritten as:

$$
f(x_T) - f(x^*) \leq \left(1 - \frac{1}{\kappa}\right)^T \big(f(x_0) - f(x^*)\big).
$$

Using the inequality $1 - x \leq e^{-x}$, we obtain the more intuitive bound:

$$
f(x_T) - f(x^*) \leq \exp\!\left(-\frac{T}{\kappa}\right) \big(f(x_0) - f(x^*)\big).
$$

To achieve $f(x_T) - f(x^*) \leq \varepsilon$, it suffices to take

$$
T \geq \kappa \log\frac{f(x_0) - f(x^*)}{\varepsilon},
$$

which is linear in the condition number $\kappa$.  When the function is well-conditioned (small $\kappa$), gradient descent converges rapidly.  For ill-conditioned problems (large $\kappa$), convergence can be slow.

---

**Summary.**  The interplay between smoothness and strong convexity is fundamental to first-order optimization:

| Property | Guarantee | Rate |
|---|---|---|
| L-smooth only | $\min_{t<T} \|\nabla f(x_t)\|^2 \leq O(1/T)$ | Sublinear to stationary point |
| L-smooth + convex | $f(x_T) - f(x^*) \leq O(1/T)$ | Sublinear to global minimum |
| L-smooth + m-strongly convex | $f(x_T) - f(x^*) \leq (1 - m/L)^T \Delta_0$ | Linear (exponential) |

Strong convexity is what transforms the sublinear rate of gradient descent into a linear (geometric) rate, with the condition number $\kappa = L/m$ governing the constant.
