# Training Deep Learning Models

> Source: CS1674 Ch.11–12. Training = minimizing a loss over parameters via **gradient descent** (and its variants), computing gradients with the **chain rule (backprop)**, and controlling overfitting with **regularization**, **learning-rate decay**, and **early stopping**. (Chapters 11 and 12 merged.)

## 1. Optimization: Convex vs. Non-Convex

- A function $f(\theta)$ is **convex** if for any $\theta_1,\theta_2$ and $\lambda\in[0,1]$:
  $$f(\lambda\theta_1 + (1-\lambda)\theta_2) \le \lambda f(\theta_1) + (1-\lambda)f(\theta_2)$$
  The line segment between any two points lies above/on the curve.
- For convex $f$, any **local minimum is a global minimum**. With 1-D $\theta$, solve by $\frac{df}{d\theta}=0$ and check $\frac{d^2f}{d\theta^2}>0$.
- Neural network loss is **non-convex** (many local minima, saddle points) → we use **gradient descent**, the "golden rule" of non-convex optimization.

---

## 2. Gradient Descent

Imagine a ball on the curve; it rolls downhill following the **negative gradient** (the negative slope of the tangent).

Update rule:
$$\theta \leftarrow \theta - \alpha \frac{df(\theta)}{d\theta}$$

- $\alpha$ = **learning rate** (step size).
- Why it decreases the function: $\Delta f \approx \Delta\theta\,\frac{df}{d\theta} = -\alpha\left(\frac{df}{d\theta}\right)^2 \le 0$.

### Learning-rate sanity
- **Too large**: overshoots, may diverge / oscillate.
- **Too small**: extremely slow convergence.

---

## 3. Full-Batch vs. Stochastic Gradient Descent

The objective averages over all samples:

$$f(\theta) = \frac{1}{n}\sum_{i=1}^n f_i(\theta), \qquad \nabla f = \frac{1}{n}\sum_{i=1}^n \frac{df_i}{d\theta}$$

| | Full-Batch (FBGD) | SGD (mini-batch) |
|---|---|---|
| Gradient | True gradient over all $n$ samples | Approximate, over a subset $n_{\text{sub}}$ |
| Update | Accurate, stable | Efficient, may oscillate |
| Cost | High memory / slow | Low memory / fast |
| Sensitivity | Low | Sensitive to $\alpha$, batch size, init |

SGD instability sources: mini-batch may not represent the dataset; estimated gradient deviates from true → oscillation on steep/irregular landscapes. Hyper-parameters (LR, batch size, init) matter more than for FBGD.

---

## 4. Forward and Backward Propagation

A multi-layer network composes layer functions:

$$\mathbf{h}_1 = f_1(\mathbf{x}, w_1),\ \mathbf{h}_2 = f_2(\mathbf{h}_1, w_2),\ \dots,\ \mathbf{h}_K = f_K(\mathbf{h}_{K-1}, w_K)$$

To train, we need $\frac{\partial L}{\partial w_k}$ for **every** layer's parameters; then $w_k \leftarrow w_k - \alpha \frac{\partial L}{\partial w_k}$.

### 4.1 The chain rule

For $z = g(y),\ y = f(x)$:
$$\frac{dz}{dx} = \frac{dz}{dy}\frac{dy}{dx}$$

**Worked example** ($k=1$, $L = (\hat y - y)^2$, $\hat y = w_1^\top x$):

$$\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial \hat y}\frac{\partial \hat y}{\partial w_1} = 2(\hat y - y)\cdot x = 2x(w_1^\top x - y)$$

### 4.2 General backprop (chain rule over layers)

$$\frac{\partial L}{\partial w_k} = \frac{\partial L}{\partial \mathbf{h}_K}\frac{\partial \mathbf{h}_K}{\partial \mathbf{h}_{K-1}}\cdots\frac{\partial \mathbf{h}_{k+1}}{\partial \mathbf{h}_k}\frac{\partial \mathbf{h}_k}{\partial w_k}$$

Interpret the factors as:
- **Upstream gradient** $\frac{\partial L}{\partial \mathbf{h}_{k+1}}$ (already computed, flowing backward).
- **Local gradient** $\frac{\partial \mathbf{h}_{k+1}}{\partial \mathbf{h}_k}$ and $\frac{\partial \mathbf{h}_k}{\partial w_k}$ (from the current layer).

**Backprop summary:**
- **Forward pass**: compute activations $\mathbf{h}_k$ and cache them.
- **Backward pass**: propagate the upstream gradient, multiply by local gradients, to get $\frac{\partial L}{\partial \mathbf{h}_{k-1}}$ and $\frac{\partial L}{\partial w_k}$.
- Update parameters.

> See: *"Yes you should understand backprop"*; matrix calculus at explained.ai.

---

## 5. Optimizers

The optimization landscape for images/video is high-dimensional and complex (trenches, saddle points). History of gradients helps the current step.

### 5.1 Momentum
$$v_t = \gamma v_{t-1} + (1-\gamma)\nabla_\theta f(\theta_{t-1}), \qquad \theta_t = \theta_{t-1} - \alpha v_t$$
- $v_t$ = moving average of gradient history; $\gamma$ = momentum factor.
- $\gamma=0$ → plain SGD. Increasing $\gamma$ → more inertia, escapes local minima, reduces oscillations along steep directions.

### 5.2 RMSProp
$$s_t = \beta s_{t-1} + (1-\beta)(\nabla_\theta f(\theta_{t-1}))^2, \qquad \theta_t = \theta_{t-1} - \frac{\alpha}{\sqrt{s_t+\epsilon}}\nabla_\theta f(\theta_{t-1})$$
- $s_t$ = moving average of **squared** gradients; adapts the **learning rate per parameter**.
- As we approach a minimum we want smaller steps → dividing by $\sqrt{s_t}$ does that. $\beta=0$ → no adaptation.

### 5.3 Adam (Momentum + RMSProp)
$$
\begin{aligned}
m_t &= \beta_1 m_{t-1} + (1-\beta_1)\nabla_\theta f(\theta_{t-1}) & \hat m_t &= \frac{m_t}{1-\beta_1^t} \\
v_t &= \beta_2 v_{t-1} + (1-\beta_2)(\nabla_\theta f(\theta_{t-1}))^2 & \hat v_t &= \frac{v_t}{1-\beta_2^t} \\
\theta_t &= \theta_{t-1} - \frac{\alpha}{\sqrt{\hat v_t}+\epsilon}\,\hat m_t
\end{aligned}
$$
- $m_t$ = first moment (momentum), $v_t$ = second moment (RMSProp-style).
- Defaults: $\beta_1=0.9$, $\beta_2=0.999$, $\epsilon\approx10^{-8}$, $m_0=v_0=0$.
- **Bias correction** $\hat m_t, \hat v_t$ fixes the zero-init bias early in training (otherwise moments are underestimated).
- Adam adapts LR like RMSProp *and* smooths gradients with momentum → robust, widely used.

| Optimizer | Uses | Adapts |
|---|---|---|
| SGD | current gradient | nothing |
| Momentum | gradient history (direction) | direction |
| RMSProp | squared-gradient history | learning rate |
| Adam | both moments | direction + LR |

---

## 6. Regularization

Minimize data loss **plus** a penalty:

$$L(w) = \frac{1}{n}\sum_{i=1}^n \ell(w, x_i, y_i) + \lambda R(w)$$

| Regularizer | $R(w)$ | Gradient effect |
|---|---|---|
| **L2** (weight decay) | $\frac{1}{2}\|w\|_2^2$ | $w \leftarrow w - \alpha\nabla\ell - \alpha\lambda w$ (smooth decay) |
| **L1** | $\|w\|_1$ | $w \leftarrow w - \alpha\nabla\ell - \alpha\lambda\,\mathrm{sgn}(w)$ (constant-magnitude decay) |

- L2 → **weight decay**: shrinks weights → small data fluctuations → less variance → less overfitting, more stable.
- L1 → drives many weights exactly to 0 (**sparsity**); L2 is smoother/more stable.

---

## 7. Learning Rate Decay (Extreme Training)

For hard problems, first aim for **tiny training loss** (extreme training) to validate model capacity before worrying about test performance. Decay schedules:
- **Exponential**: $\eta_t = \eta_0 e^{-kt}$
- **Inverse / inverse-sqrt**: $\eta_t = \eta_0/(1+kt)$ or $\eta_0/\sqrt{t}$
- **Linear**: $\eta_t = \eta_0(1 - t/T)$
- **Cosine**: $\eta_t = \tfrac{1}{2}\eta_0(1+\cos(\pi t/T))$
- **Step decay**: multiply by 0.9 every 100 epochs, etc.
- **Manual / manual-with-validation**: reduce when train/val error stalls.
- **Warmup** (Goyal et al. 2018): start small, increase, then decay.

### Diagnosing learning curves
| Symptom | Cause / fix |
|---|---|
| Loss not decreasing | Underfitting — fix model/capacity first |
| NaNs after some iters | Numerical instability |
| Weird cyclical pattern | Data not shuffled |
| Error increasing | Bug, or LR too large |

> Rule: solve **underfitting** first (get low training loss); only then address overfitting.

---

## 8. Validation Set and Early Stopping

- **Underfitting**: large train *and* test loss.
- **Overfitting**: low train loss, large test loss.
- Split off a **validation set** (small subset of training data) to approximate test loss during training.
- **Early stopping**: monitor validation loss; stop when it stops improving (or when train/val gap grows). Stopping points:
  - epochs without suitable validation reduction,
  - no accuracy/precision/recall improvement,
  - validation loss rising relative to training loss (definite overfitting).

---

## 9. Summary

- Non-convex loss → **gradient descent**; use **SGD** mini-batches for efficiency.
- Gradients via the **chain rule / backprop** (upstream × local).
- Better optimizers: **Momentum → RMSProp → Adam** (adapt direction and/or LR).
- Combat overfitting with **L1/L2 regularization**, **LR decay**, and **early stopping** on a validation set.
