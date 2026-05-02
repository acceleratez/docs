# Cheatsheet: Convexity, Smoothness & Strong Convexity Equivalences

---

## 1 Convexity Equivalences

For a twice-differentiable $f: D \to \mathbb{R}$ on convex $D \subseteq \mathbb{R}^n$, the following are equivalent:

1. **Basic Convexity:** $f(\theta x + (1 - \theta) y) \leq \theta f(x) + (1 - \theta) f(y)$, $\forall \theta \in [0, 1]$.
2. **First-Order Condition (FOC):** $f(y) \geq f(x) + \nabla f(x)^\top (y - x)$, $\forall x, y \in D$.
3. **Gradient Monotonicity (GM):** $\langle \nabla f(x) - \nabla f(y), x - y \rangle \geq 0$, $\forall x, y \in D$.
4. **Second-Order Condition (SOC):** $\nabla^2 f(x) \succeq 0$ (Hessian PSD).

### Convexity $\iff$ FOC

**($\Rightarrow$)** Assume $f$ convex. For $\theta \in (0, 1]$:
$$f(x + \theta(y - x)) \leq (1 - \theta) f(x) + \theta f(y)$$
$$\implies \frac{f(x + \theta(y - x)) - f(x)}{\theta} \leq f(y) - f(x)$$
Take $\theta \to 0$: $\nabla f(x)^\top (y - x) \leq f(y) - f(x)$.

**($\Leftarrow$)** Assume FOC holds. Let $z = \theta x + (1 - \theta) y$:
$$f(x) \geq f(z) + \nabla f(z)^\top (x - z)$$
$$f(y) \geq f(z) + \nabla f(z)^\top (y - z)$$
Multiply by $\theta$ and $(1 - \theta)$ respectively and add:
$$\theta f(x) + (1 - \theta) f(y) \geq f(z) + \nabla f(z)^\top(\underbrace{\theta x + (1 - \theta) y - z}_{=0}) = f(z)$$

### FOC $\iff$ GM

**($\Rightarrow$)** Write FOC twice swapping $x, y$ and add:
$$f(y) \geq f(x) + \nabla f(x)^\top (y - x)$$
$$f(x) \geq f(y) + \nabla f(y)^\top (x - y)$$
$$\implies 0 \geq \nabla f(x)^\top (y - x) + \nabla f(y)^\top (x - y) \implies \langle \nabla f(x) - \nabla f(y), x - y \rangle \geq 0$$

**($\Leftarrow$)** By FTC along $x + t(y - x)$:
$$f(y) - f(x) = \int_0^1 \nabla f(x + t(y - x))^\top (y - x) \, dt$$
Subtract the tangent at $x$:
$$f(y) - f(x) - \nabla f(x)^\top (y - x) = \int_0^1 (\nabla f(x_t) - \nabla f(x))^\top (y - x) \, dt$$
By GM, integrand is $\geq 0$. Thus $f(y) \geq f(x) + \nabla f(x)^\top (y - x)$.

### GM $\iff$ SOC

**($\Rightarrow$)** For $y = x + \epsilon d$, GM implies $\frac{(\nabla f(x + \epsilon d) - \nabla f(x))^\top d}{\epsilon} \geq 0$. Take $\epsilon \to 0$: $d^\top \nabla^2 f(x) d \geq 0$.

**($\Leftarrow$)** By FTC:
$$\nabla f(y) - \nabla f(x) = \int_0^1 \nabla^2 f(x + t(y - x)) (y - x) \, dt$$
$$\implies (\nabla f(y) - \nabla f(x))^\top (y - x) = \int_0^1 (y - x)^\top \nabla^2 f(x_t) (y - x) \, dt \geq 0$$

---

## 2 L-Smoothness Equivalences

For a twice-differentiable $f$, the following are equivalent definitions of $L$-smoothness:

1. **Lipschitz Continuous Gradient:** $\|\nabla f(x) - \nabla f(y)\| \leq L \|x - y\|$, $\forall x, y \in D$.
2. **Alternative (Convexity):** $g(x) = \frac{L}{2} \|x\|^2 - f(x)$ is convex.
3. **Descent Lemma:** $f(y) \leq f(x) + \nabla f(x)^\top (y - x) + \frac{L}{2} \|y - x\|^2$.
4. **Hessian Bound:** $\nabla^2 f(x) \preceq L \cdot I$, $\forall x \in D$.

### Lipschitz Gradient $\iff$ Hessian Bound

**($\Rightarrow$)** Let $v$ be a unit vector. By definition of Hessian:
$$\nabla^2 f(x) v = \lim_{h \to 0} \frac{\nabla f(x + h v) - \nabla f(x)}{h}$$
Taking norms and using Lipschitz:
$$\|\nabla^2 f(x) v\| \leq \lim_{h \to 0} \frac{L \|h v\|}{h} = L \implies \nabla^2 f(x) \preceq L \cdot I$$

**($\Leftarrow$)** By FTC on gradient:
$$\|\nabla f(y) - \nabla f(x)\| = \left\| \int_0^1 \nabla^2 f(x + t(y - x)) (y - x) \, dt \right\|$$
$$\leq \int_0^1 \|\nabla^2 f(x_t)\|_2 \cdot \|y - x\| \, dt \leq L \|y - x\|$$

### Hessian Bound $\iff$ Alternative Definition

$g(x) = \frac{L}{2} \|x\|^2 - f(x)$. Compute Hessian:
$$\nabla^2 g(x) = L \cdot I - \nabla^2 f(x)$$
$g$ is convex $\iff \nabla^2 g(x) \succeq 0 \iff \nabla^2 f(x) \preceq L \cdot I$.

### Alternative $\iff$ Descent Lemma

If $g$ is convex, by standard FOC: $g(y) \geq g(x) + \nabla g(x)^\top (y - x)$.
Substitute $g(x) = \frac{L}{2} \|x\|^2 - f(x)$, $\nabla g(x) = L x - \nabla f(x)$:
$$\frac{L}{2} \|y\|^2 - f(y) \geq \frac{L}{2} \|x\|^2 - f(x) + (L x - \nabla f(x))^\top (y - x)$$
Rearrange:
$$f(y) \leq f(x) + \nabla f(x)^\top (y - x) + \frac{L}{2} (\|y\|^2 - \|x\|^2 - 2x^\top(y - x))$$
$$= f(x) + \nabla f(x)^\top (y - x) + \frac{L}{2} \|y - x\|^2$$

### Direct: Lipschitz Gradient $\Rightarrow$ Descent Lemma

By FTC:
$$f(y) - f(x) - \nabla f(x)^\top (y - x) = \int_0^1 (\nabla f(x_t) - \nabla f(x))^\top (y - x) \, dt$$
Apply Cauchy-Schwarz and Lipschitz:
$$\leq \int_0^1 \|\nabla f(x_t) - \nabla f(x)\| \cdot \|y - x\| \, dt \leq \int_0^1 L \cdot t \|y - x\| \cdot \|y - x\| \, dt = \frac{L}{2} \|y - x\|^2$$

---

## 3 Gradient Descent Convergence

Gradient descent update: $x_{t+1} = x_t - \eta \nabla f(x_t)$.

### 3.1 Smooth Functions (L-smooth, step size $\eta = 1/L$)

**Descent Lemma:**
$$f(x_{t+1}) \leq f(x_t) - \frac{1}{2L} \|\nabla f(x_t)\|^2$$

**Convergence to stationary point ($O(1/T)$):**
$$\min_{0 \leq t \leq T-1} \|\nabla f(x_t)\|^2 \leq \frac{2L (f(x_0) - f(x^*))}{T}$$

### 3.2 Smooth & Convex Functions ($\eta = 1/L$)

**Convergence rate ($O(1/T)$):**
$$f(x_T) - f(x^*) \leq \frac{L}{2T} \|x_0 - x^*\|^2$$

**Derivation sketch:** From convexity FOC, $\nabla f(x_t)^\top (x_t - x^*) \geq f(x_t) - f(x^*)$. Combined with distance contraction:
$$\|x_{t+1} - x^*\|^2 \leq \|x_t - x^*\|^2 - \frac{2}{L} (f(x_{t+1}) - f(x^*))$$
Telescoping sum yields the bound.

### 3.3 Smooth & Strongly Convex Functions ($\eta = 1/L$, $m > 0$)

**Linear convergence:**
$$f(x_T) - f(x^*) \leq \left(1 - \frac{m}{L}\right)^T \big[ f(x_0) - f(x^*) \big]$$

**Key inequalities:**
- Descent Lemma: $f(x_{t+1}) \leq f(x_t) - \frac{1}{2L} \|\nabla f(x_t)\|^2$
- Gradient Lower Bound (from $m$-strong convexity): $\|\nabla f(x)\|^2 \geq 2m (f(x) - f(x^*))$
- Substitute: $f(x_{t+1}) - f(x^*) \leq (f(x_t) - f(x^*)) - \frac{m}{L} (f(x_t) - f(x^*))$
- Condition number $\kappa = L/m$; smaller $\kappa$ gives faster convergence.

---

## 4 Strong Convexity Equivalences

For a twice-differentiable $f: D \to \mathbb{R}$ on convex $D \subseteq \mathbb{R}^n$, the following are equivalent ($m > 0$):

1. **Alternative Definition:** $h(x) = f(x) - \frac{m}{2} \|x\|^2$ is convex.
2. **Strong FOC:** $f(y) \geq f(x) + \nabla f(x)^\top (y - x) + \frac{m}{2} \|y - x\|^2$.
3. **Strong GM:** $\langle \nabla f(x) - \nabla f(y), x - y \rangle \geq m \|x - y\|^2$.
4. **Strong SOC:** $\nabla^2 f(x) \succeq m \cdot I$, $\forall x \in D$.

### Alternative $\iff$ Strong SOC

Define $h(x) = f(x) - \frac{m}{2} \|x\|^2$. Then:
$$\nabla h(x) = \nabla f(x) - m x$$
$$\nabla^2 h(x) = \nabla^2 f(x) - m I$$
$h$ convex $\iff \nabla^2 h(x) \succeq 0 \iff \nabla^2 f(x) \succeq m I$.

### Alternative $\iff$ Strong FOC

**($\Rightarrow$)** $h$ convex $\implies$ standard FOC for $h$:
$$h(y) \geq h(x) + \nabla h(x)^\top (y - x)$$
Substitute $h(x) = f(x) - \frac{m}{2} \|x\|^2$, $\nabla h(x) = \nabla f(x) - m x$:
$$f(y) - \frac{m}{2} \|y\|^2 \geq f(x) - \frac{m}{2} \|x\|^2 + (\nabla f(x) - m x)^\top (y - x)$$
Rearrange quadratic terms:
$$\frac{m}{2} \|y\|^2 - \frac{m}{2} \|x\|^2 - m x^\top (y - x) = \frac{m}{2} \|y - x\|^2$$
$$\implies f(y) \geq f(x) + \nabla f(x)^\top (y - x) + \frac{m}{2} \|y - x\|^2$$

**($\Leftarrow$)** Assume strong FOC holds. Compute:
$$h(y) - h(x) - \nabla h(x)^\top (y - x) = \big[f(y) - f(x) - \nabla f(x)^\top (y - x)\big] - \frac{m}{2} \|y - x\|^2$$
By strong FOC, the bracket $\geq \frac{m}{2} \|y - x\|^2$. Thus:
$$h(y) - h(x) - \nabla h(x)^\top (y - x) \geq 0 \implies h \text{ convex}$$

### Strong FOC $\iff$ Strong GM

**($\Rightarrow$)** Write strong FOC twice:
$$f(y) \geq f(x) + \nabla f(x)^\top (y - x) + \frac{m}{2} \|y - x\|^2$$
$$f(x) \geq f(y) + \nabla f(y)^\top (x - y) + \frac{m}{2} \|x - y\|^2$$
Add and cancel $f(x) + f(y)$:
$$0 \geq \nabla f(x)^\top (y - x) + \nabla f(y)^\top (x - y) + m \|x - y\|^2$$
$$\implies \langle \nabla f(x) - \nabla f(y), x - y \rangle \geq m \|x - y\|^2$$

**($\Leftarrow$)** Fix $x, y$, define $x_t = x + t(y - x)$. By FTC:
$$f(y) - f(x) = \int_0^1 \nabla f(x_t)^\top (y - x) \, dt$$
Add/subtract $\nabla f(x)$:
$$= \nabla f(x)^\top (y - x) + \int_0^1 (\nabla f(x_t) - \nabla f(x))^\top (y - x) \, dt$$
Apply strong GM with $u = x_t$, $v = x$:
$$(\nabla f(x_t) - \nabla f(x))^\top (t(y - x)) \geq m \|t(y - x)\|^2 = m t^2 \|y - x\|^2$$
Divide by $t$, integrate:
$$\int_0^1 (\nabla f(x_t) - \nabla f(x))^\top (y - x) \, dt \geq \int_0^1 m t \|y - x\|^2 \, dt = \frac{m}{2} \|y - x\|^2$$
$$\implies f(y) \geq f(x) + \nabla f(x)^\top (y - x) + \frac{m}{2} \|y - x\|^2$$
