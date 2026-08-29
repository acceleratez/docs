# Classification (Advanced)

Beyond decision trees, Bayes, and k-NN, several powerful classifiers handle complex, non-linear, and high-dimensional boundaries.

## 1. Support Vector Machines (SVM)

### Margin and Linear Separability
- Given two classes, an SVM finds the **optimal separating hyperplane** that maximizes the **margin** (distance to the nearest points of each class, the **support vectors**).
- Decision function: $f(x) = \mathbf{w}\cdot x + b$; predict class by $\mathrm{sign}(f(x))$.

### Hard vs Soft Margin
- **Hard margin**: requires perfect linear separation (rare in practice).
- **Soft margin (C-SVM)**: allows some misclassified/in-margin points via **slack variables** $\xi_i \ge 0$:
  $$\min_{\mathbf{w},b,\xi} \frac{1}{2}\|\mathbf{w}\|^2 + C\sum_i \xi_i$$
  subject to $y_i(\mathbf{w}\cdot x_i + b) \ge 1 - \xi_i$.
  - **$C$** trades off margin width vs. training errors: large $C$ ⇒ less tolerance (risk overfitting); small $C$ ⇒ wider margin (risk underfitting).

### The Kernel Trick
- Map data into a higher-dimensional **feature space** $\phi(x)$ where it is linearly separable, without computing $\phi$ explicitly — use a **kernel** $K(x_i,x_j)=\phi(x_i)\cdot\phi(x_j)$.
- Common kernels:
  - **Linear**: $K(x,z)=x\cdot z$
  - **Polynomial**: $K(x,z)=(x\cdot z + 1)^d$
  - **RBF / Gaussian**: $K(x,z)=\exp(-\gamma\|x-z\|^2)$, $\gamma>0$
  - **Sigmoid**: $K(x,z)=\tanh(\kappa x\cdot z + c)$
- Decision is expressed via **dual variables** $\alpha_i$ (only support vectors have $\alpha_i>0$):
  $$f(x) = \sum_i \alpha_i y_i K(x_i, x) + b$$

| Pros | Cons |
|---|---|
| effective in high-D, robust to overfitting (margin) | choice of kernel & $C/\gamma$ needs tuning |
| works well with clear margin | slow on very large data ($O(n^2)$–$O(n^3)$) |
| memory efficient (only SVs) | less interpretable |

## 2. Artificial Neural Networks (Backpropagation)

### Perceptron & Multi-Layer Network
- A **neuron**: $o = \sigma(\sum_j w_j x_j + b)$, where $\sigma$ is an activation (sigmoid, tanh, ReLU).
- **MLP (multi-layer perceptron)**: input → hidden layer(s) → output; can approximate any continuous function (universal approximation).

### Backpropagation (Training)
Goal: minimize **error** $E = \frac{1}{2}\sum_k (t_k - o_k)^2$ over weights via **gradient descent**.
```
initialize weights randomly (small);
repeat:
  for each training example:
     forward pass: compute outputs o;
     compute error δ at output: δ_out = (t - o)·σ'(net);
     backpropagate: δ_h = σ'(net_h)·Σ w·δ_out;
     update weights: w ← w + η·δ·x;   (η = learning rate)
until convergence;
```
- **Learning rate $\eta$**: too large ⇒ oscillate/diverge; too small ⇒ slow.
- **Momentum** adds a fraction of the previous update to smooth.
- **Overfitting**: use early stopping (watch validation error), weight decay ($L_2$ regularization), dropout.

| Pros | Cons |
|---|---|
| learns complex non-linear boundaries | "black box", hard to interpret |
| good for high-dim, noisy data | many hyperparameters, slow training |
| scales with GPU | needs lots of data |

## 3. Ensemble Methods

**Idea**: combine multiple **base learners** ("weak learners") to get a **strong learner** with lower variance/bias and better generalization.

### Bagging (Bootstrap Aggregating) — Breiman
- Generate $T$ bootstrap samples from training data; train a base model (e.g., decision tree) on each; **aggregate** predictions:
  - classification: **majority vote**; regression: **average**.
- Reduces **variance**; models are independently trained.
- **Out-of-bag (OOB)** estimate: each model is tested on samples not in its bootstrap ⇒ free validation.
- **Random Forest** = bagging of **deep, randomized decision trees** (at each split choose best among a random subset of $m$ features, typically $m=\sqrt{d}$). Robust, accurate, handles high-D.

### Boosting — turns weak into strong
- Sequentially train models; each new model focuses on examples the previous ones got **wrong** (re-weight misclassified examples).
- **AdaBoost** (Freund & Schapire):
  ```
  initialize weights w_i = 1/n;
  for t = 1..T:
     train weak learner h_t using weights;
     compute error ε_t = Σ_{misclassified} w_i / Σ w_i;
     set α_t = 0.5·ln((1-ε_t)/ε_t);        // weight of this learner
     update w_i ← w_i·exp(α_t·I(y_i≠h_t(x_i)));  // up-weight mistakes
     renormalize w_i;
  final: H(x) = sign( Σ_t α_t h_t(x) );
  ```
  - $\alpha_t$ large when $\varepsilon_t$ small (good learner trusted more).
  - Boosting reduces **bias**; sensitive to **noisy/outlier** labels.
- **Gradient Boosting / GBM, XGBoost, LightGBM**: fit new model to the **residual** (negative gradient) of current ensemble; powerful on tabular data.

| Method | Combines | Reduces | Train | Sensitivity |
|---|---|---|---|---|
| Bagging | parallel | variance | parallel | robust to noise |
| Boosting | sequential | bias | sequential | sensitive to noise |
| Random Forest | bagging + feature rand. | variance | parallel | robust |

## 4. Rule-Based Classification

### Sequential Covering (Learn-One-Rule)
- Build a set of IF-THEN rules covering training examples:
  ```
  Rules = ∅;
  while training examples remain uncovered:
     learn the "best" rule (greedy, using FOIL gain);
     add rule; remove covered examples;
  ```
- **FOIL gain** for adding a literal: $Gain = m\cdot(\log_2 p' - \log_2 p)$, where $m$ = new positives covered, $p/p'$ = precision before/after.

### Rule Quality
- **Coverage** (support) and **accuracy** (confidence). Prune rules to avoid overfitting (e.g., reduced-error pruning).
- **Direct methods** (e.g., from decision trees: C4.5rules) convert a tree into rules then prune each rule independently — often more accurate and compact.

### Advantages
- Highly interpretable ("IF age>30 AND income>50k THEN buy=yes").
- Can be more compact than a tree; easy to present to domain experts.

## Other Advanced Classifiers (Brief)
- **Logistic regression**: linear model with sigmoid; outputs class probability; trained by MLE.
- **Discriminant analysis** (LDA/QDA): model class-conditional Gaussians.
- **Nearest centroid / SVM ensembles / stacking**: combiner learns how to blend base models.

## SVM Margin (Geometric View)

The **functional margin** of example $i$ is $\hat{\gamma}_i = y_i(\mathbf{w}\cdot x_i + b)$; the **geometric margin** (true distance) is $\gamma_i = \hat{\gamma}_i/\|\mathbf{w}\|$. SVM maximizes the minimum geometric margin:

$$\max_{\mathbf{w},b} \frac{1}{\|\mathbf{w}\|} \min_i y_i(\mathbf{w}\cdot x_i + b)$$

which is equivalent to the soft-margin primal above. Only points achieving the margin ($\gamma_i = 1/\|\mathbf{w}\|$, the **support vectors**) appear in the solution — hence the name.

## Kernel Trick — Worked Intuition

XOR-like data not linearly separable in 2-D; map $(x_1,x_2)\to(x_1,x_2,x_1^2,x_2^2,x_1x_2)$ (feature space). A polynomial kernel $K(x,z)=(x\cdot z+1)^2$ computes that dot product without ever forming the 5-D vector explicitly. RBF $K=\exp(-\gamma\|x-z\|2)$ can separate arbitrarily shaped boundaries given enough support vectors.

## AdaBoost — Worked Sketch

Start weights $w=(1/4,1/4,1/4,1/4)$.
- Round 1: weak rule $h_1$ errs on 1 example ⇒ $\varepsilon_1=0.25$, $\alpha_1=0.5\ln(0.75/0.25)=0.55$. Up-weight the mistake; renormalize.
- Round 2: next weak rule focuses on the up-weighted example; suppose $\varepsilon_2=0.2$, $\alpha_2=0.5\ln(0.8/0.2)=0.69$.
- Final $H(x)=sign(0.55\,h_1(x)+0.69\,h_2(x)+\dots)$. Misclassified examples keep getting heavier weights until a later weak learner corrects them.

## Comparison: When to Use Which

| Method | Interpretable? | Handles non-linear | Scales to big data | Needs labeled? |
|---|---|---|---|---|
| SVM | low | yes (kernel) | moderate | yes |
| Neural net | no | yes (deep) | yes (GPU) | yes (lots) |
| Bagging/RF | medium (RF) | yes | yes | yes |
| Boosting | low | yes | moderate | yes |
| Rule-based | high | limited | yes | yes |

## Cost-Sensitive & Imbalanced Learning
- Fraud/disease are rare ⇒ accuracy misleads. Use **class weights** (higher penalty for minority errors), **resampling** (SMOTE/undersample), and evaluate by **AUC / F1 / recall** rather than accuracy.
- SVM/decision trees/boosting all accept instance or class weights.

## SVM Dual Form (Compact)
The primal is solved via its **dual** (only dot products appear, enabling kernels):
$$\max_{\alpha} \sum_i \alpha_i - \frac{1}{2}\sum_{i,j}\alpha_i\alpha_j y_i y_j K(x_i,x_j)$$
subject to $0\le\alpha_i\le C,\ \sum_i \alpha_i y_i = 0$. The classifier becomes $f(x)=\sum_i \alpha_i y_i K(x_i,x)+b$; only support vectors ($\alpha_i>0$) matter — sparse and elegant.

## Activation Functions (Neural Nets)
| Function | Range | Notes |
|---|---|---|
| Sigmoid | (0,1) | saturates, vanishing gradients |
| Tanh | (−1,1) | zero-centered, still saturates |
| ReLU | [0,∞) | fast, avoids saturation, needs care with dead units |
| Leaky/ELU | varies | mitigates dead ReLU |

## Stacking (Meta Ensemble)
- Level-0 models (SVM, RF, NN) make predictions; a **level-1 meta-learner** (often logistic regression / linear model) learns how to combine them using cross-validated predictions as training input. Often the most accurate, but easy to overfit without careful CV.

## Summary

Advanced classifiers extend beyond trees. **SVM** maximizes the margin and uses kernels to separate non-linearly via the dual/feature space, controlled by $C$ and kernel params. **Neural nets** learn via **backpropagation** (gradient descent on weights) and need regularization to avoid overfitting. **Ensembles** dominate practice: **bagging/Random Forest** reduce variance through bootstrap aggregation and feature randomness; **boosting/AdaBoost** and gradient boosting reduce bias by sequentially focusing on hard examples. **Rule-based** methods (sequential covering, FOIL, tree-to-rules) offer interpretable IF-THEN models. Choosing among them depends on interpretability needs, data size, noise, and dimensionality.
