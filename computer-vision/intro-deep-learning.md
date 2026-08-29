# Introduction to Deep Learning

> Source: CS1674 Ch.10. Deep learning stacks feature extraction and analysis into multiple trainable layers (end-to-end), using **nonlinearities** (ReLU and friends) to learn complex decision boundaries. A two-layer network is a **universal function approximator**.

## 1. From Shallow to Deep

- **Shallow (historical)** approach: a hand-crafted (nonlinear, *non-trainable*) feature transform followed by a simple trainable classifier.
- **Deep learning** approach: stack feature extraction and analysis into multiple layers, trained **end-to-end**.

A single **linear layer** computes $\mathbf{y} = W\mathbf{x}$ (rows of $W$ are the output-unit weight vectors $\mathbf{w}^{(k)}$). Stacking more *linear* layers does **not** help:

$$\mathbf{z} = U(W\mathbf{x}) = (UW)\mathbf{x}$$

still linear. To get a nonlinear solution we must insert a **nonlinearity** between linear layers:

$$\mathbf{y} = W\mathbf{x}, \qquad \mathbf{z} = g(\mathbf{y})$$

---

## 2. Activation Functions (Element-wise Nonlinearities)

| Activation | Definition | Notes |
|---|---|---|
| **ReLU** | $g(y)=\max(0,y)$ | Most common; sparse, avoids vanishing gradient |
| **Leaky ReLU** | $g(y)=\max(0.1y, y)$ | Small slope for $y<0$ (no dead units) |
| **tanh** | $g(y)=\tanh(y)$ | Zero-centered, saturates at ±1 |
| **ELU** | $g(y)=y\ (y>0);\ \alpha(e^y-1)\ (y\le 0)$ | Smooth negative side |

Brain analogy: impulses arrive at **dendrites** → **cell body** → **axon** → presynaptic terminals; the nonlinearity is like a firing threshold.

---

## 3. The Power of ReLU

Consider points **not linearly separable** in the original $(x_1,x_2)$ space.

1. Linear transform $\tilde{\mathbf{x}} = W\mathbf{x} + \mathbf{b}$ — still not linearly separable.
2. Apply ReLU: $\tilde{\mathbf{x}} = \mathrm{ReLU}(W\mathbf{x} + \mathbf{b})$ — the piecewise-linear folding **makes the classes linearly separable in feature space**.
3. Tracing the resulting boundary back to the original space gives a non-linear decision boundary.

> ReLU "folds" space; with enough hidden units, arbitrarily complex boundaries can be formed.

---

## 4. Two-Layer Neural Network

- **Input layer**: $\mathbf{x}$
- **Hidden layer**: $\mathbf{h} = g_1(W_1\mathbf{x})$  (nonlinear activation $g_1$)
- **Output layer**: $\mathbf{y} = g_2(W_2 \mathbf{h})$  (nonlinear activation $g_2$)

Full forward expression: $\mathbf{y} = g_2\!\big(W_2\, g_1(W_1\mathbf{x})\big)$.

### Expressiveness
- The **bigger the hidden layer, the more complex** the model (more "folds").
- A two-layer network is a **universal function approximator** (Cybenko/Hornik): it can approximate any continuous function, but the hidden layer may need to be *very* large.
- Going beyond two layers ("deep" learning): $g_L(W_L \cdots g_2(W_2\, g_1(W_1\mathbf{x})))$ — deep networks are more parameter-efficient than a single huge hidden layer.

> Try it yourself: [TensorFlow Playground](http://playground.tensorflow.org/).

---

## 5. Summary

- Linear layers alone = linear model; insert **nonlinearities** to learn nonlinear boundaries.
- **ReLU** is the workhorse; it makes non-separable data separable via piecewise folding.
- A two-layer net is a universal approximator; depth (more layers) gives efficiency and hierarchy.

> **Key takeaway:** deep = many linear+nonlinear layers trained end-to-end; ReLU's piecewise folding is what gives neural nets their expressive power.

---

## 6. Historical Context: The Perceptron and XOR

- The **perceptron** (Rosenblatt 1958) is a single linear threshold unit: $y = \mathbb{1}[w^\top x + b > 0]$. It can only learn **linearly separable** problems.
- The classic **XOR** problem is not linearly separable → a single perceptron fails. A two-layer network with a hidden layer + nonlinear activation solves XOR, illustrating why **depth + nonlinearity** matter.

---

## 7. Universal Approximation Theorem

- A two-layer network with a **single hidden layer** of sufficient width and any non-linear activation (e.g., sigmoid, ReLU) can approximate any continuous function on a compact set to arbitrary accuracy.
- **But**: the required width may be exponentially large. **Depth** is more parameter-efficient: deep networks can represent compositional functions (e.g., hierarchies) with far fewer parameters than a shallow one of equal capacity.

### Depth vs. Width
| | Shallow (wide) | Deep (narrow) |
|---|---|---|
| Parameters for same capacity | huge | much smaller |
| Inductive bias | none | hierarchical/compositional |
| Training | prone to overfit, hard to optimize | easier to train, generalizes better |

---

## 8. Training Recap

- **Loss**: e.g., MSE for regression, cross-entropy for classification.
- **Optimization**: gradient descent / SGD minimizes the loss over $W$ (see training-dl-models.md).
- **Backpropagation**: chain rule computes $\partial L/\partial W_k$ for every layer.

---

## 9. Practical Considerations

### Initialization
- **Xavier/Glorot**: scales weights by $1/\sqrt{n_{\text{in}}}$ to keep variances stable across layers.
- **He/Kaiming**: for ReLU, scale by $\sqrt{2/n_{\text{in}}}$ (accounts for ReLU zeroing half the units).

### Regularization & normalization
- **Dropout**: randomly zero activations during training → ensemble-like robustness.
- **Batch/Layer/Group Norm**: stabilize and accelerate training by normalizing activations.
- **Bias–variance trade-off**: too simple → underfit (high bias); too complex → overfit (high variance); use validation to tune capacity/regularization.

### Data augmentation
- For images: flips, crops, color jitter, rotation — artificially enlarge the training set and improve generalization.

---

## 10. From This Chapter to the Rest

- **training-dl-models.md**: how to actually optimize these networks (gradient descent, backprop, optimizers, regularization).
- **cnns.md / rnns.md**: specialized architectures for images / sequences.
- **vision-transformer.md / gans.md / diffusion-models.md**: modern backbones and generative models built on these fundamentals.

> A neural network is just a **differentiable composition of linear maps and nonlinearities**; everything else (architectures, optimizers, regularizers) is engineering on top of that core.

---

## 11. Worked Example: Learning XOR

A single linear layer cannot separate XOR (output $y = w_1x_1 + w_2x_2 + b$ is a line; XOR needs two lines). Add one hidden layer with ReLU:

$$\mathbf{h} = \mathrm{ReLU}(W_1\mathbf{x} + \mathbf{b}_1), \qquad y = W_2\mathbf{h} + b_2$$

The hidden units learn two half-space features (e.g., "is $x_1$ high" and "is $x_2$ high"); the output linearly combines them to produce the XOR response. This is the simplest demonstration of **why nonlinearity + hidden layer = power**.

---

## 12. Activation Gradients (Why ReLU Helps)

- Sigmoid/tanh saturate: $\sigma'(z) = \sigma(z)(1-\sigma(z)) \in (0, 0.25]$, so gradients shrink multiplicatively across layers → **vanishing gradients** in deep nets.
- ReLU: $g'(z)=1$ for $z>0$ → gradients flow unchanged through active units (but dead units can appear; Leaky/ELU fix that).
- This is the practical reason ReLU-family activations dominate deep networks.

---

## 13. Capacity, Underfit, Overfit

- **Underfit**: model too simple / trained too little → high train **and** test error. Fix: bigger model, more training, better features.
- **Overfit**: model memorizes training set → low train error, high test error. Fix: regularization (L2/dropout/augmentation), early stopping, smaller model.
- The **validation set** (Ch.12) tells you which regime you are in before touching the test set.

> Depth + ReLU turn a linear classifier into a universal approximator; the rest of deep learning is about **training** that approximator stably and generalizing it (Ch.11–12).
