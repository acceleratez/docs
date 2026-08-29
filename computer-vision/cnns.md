# Convolutional Neural Networks

> Source: CS1674 Ch.14 (Part A). CNNs replace fully-connected layers for images with **local receptive fields + weight sharing** (convolution), add **pooling**, and stack into deep architectures (AlexNet, VGG, GoogLeNet/Inception, ResNet).

## 1. Backstory & Motivation

- **Biological inspiration**: Hubel & Wiesel (Nobel 1981) — visual cortex has a hierarchy of simple → complex → hyper-complex cells with local receptive fields.
- **Neocognitron** (Fukushima 1980): self-organizing model invariant to shift.
- **LeNet-5** (LeCun et al. 1998): gradient-based document recognition.

### Why not an MLP for images?
A multi-layer perceptron takes the whole image as a flat vector → fully connected to the next layer. Problems:
- **Too many parameters** (e.g., 224×224×3 → millions of weights for one FC layer).
- **No spatial prior**; treats pixels as independent; not translation-equivariant.

### Convolutional architecture
Limit each unit's **receptive field**, slide it across the input, and use **shared weights** (the same filter everywhere). This is equivalent to sliding a learned filter and computing dot products at every location → a **feature map**.

---

## 2. The Convolution (Cross-Correlation) Layer

For an input patch and a $3\times3$ filter $w$:

$$y_{11} = x_{11}w_1 + x_{12}w_2 + x_{13}w_3 + x_{21}w_4 + \cdots + x_{33}w_9$$

For an $H\times W$ input, filter size $F$, padding $P$, stride $S$, the output size is:

$$\text{out} = \left\lfloor \frac{N + 2P - F}{S} \right\rfloor + 1$$

Examples (input $7\times7$, filter $3$, padding varies):
- No padding, stride 1 → $(7-3)/1+1 = 5$
- With padding 1, stride 1 → 7
- With padding, stride 2 → $(7-3)/2+1 = 3$

> (In DL practice this is cross-correlation, not true convolution — the filter is not flipped; consistent with Ch.2 convention.)

### Channels / feature maps
- One input image has $K$ input feature maps (e.g., RGB → $K=3$); produce $L$ output feature maps.
- Each output map uses an $F\times F\times K$ filter (3D filter).
- **Computational cost** (MAC units) to compute the full output volume:

$$\text{cost} \approx F^2 K L \cdot H W$$

### Receptive field growth
Stacking conv layers grows the receptive field: three $3\times3$ stride-1 convs → a $7\times7$ receptive field; stride-2 convs downsample while growing the field.

---

## 3. Why 1×1 Convolutions?

With $F=1$, a filter is $1\times1\times K$ → mixes information **across channels** at each spatial position, with cost $F^2 K L H W$ (no $K^2$ factor).

**Example** (256-channel I/O):
- **Structure A**: one $3\times3$ conv, 256→256 → $256\times256\times3\times3 \approx 590{,}000$ weights/MAC.
- **Structure B** (bottleneck): $1\times1$ (256→64) + $3\times3$ (64→64) + $1\times1$ (64→256) → $16\text{k}+36\text{k}+16\text{k} \approx 68{,}000$.

⇒ 1×1 convs **reduce parameters and compute** while preserving representational power (the Inception trick).

---

## 4. Depthwise Separable & Groupwise Convolutions

### Depthwise + 1×1 (MobileNet, Howard et al. 2017)
- **Depthwise**: apply a $3\times3$ filter *per input channel separately* ($F^2 K$ per position).
- **1×1 (pointwise)**: mix across channels.
- Example: regular $3\times3$, 256→256 ≈ 590,000 MAC; depthwise+1×1 ≈ 7,800 MAC → **~8.7× speedup**.

### Groupwise
Split the $K$ feature maps into $G$ groups, convolve within each group, concatenate. Reduces cost by factor $G$ (used in ResNeXt).

---

## 5. Pooling

$$F\times F \text{ pooling window, stride } S$$

- **Max pooling**: take the max in each window (most common; preserves strong activations).
- **Average pooling**: take the mean.

Example: $2\times2$ max pool, stride 2, on a single channel → halves spatial resolution, gives **translation (small-shift) invariance** and reduces computation/memory. Pooling trades some spatial precision for robustness.

---

## 6. Backpropagation Through a Conv Layer

Forward (1D for clarity): $z_i = w_1 x_{i-1} + w_2 x_i + w_3 x_{i+1}$.
Backward (gradient w.r.t. input), by chain rule:

$$\frac{\partial L}{\partial x_i} = \frac{\partial L}{\partial z_{i-1}}\frac{\partial z_{i-1}}{\partial x_i} + \frac{\partial L}{\partial z_i}\frac{\partial z_i}{\partial x_i} + \frac{\partial L}{\partial z_{i+1}}\frac{\partial z_{i+1}}{\partial x_i}$$

The gradients distribute back through the **same shared weights** $w_1,w_2,w_3$ to the input positions — this is how weight sharing is accounted for in learning (the backward pass is itself a convolution with the flipped filter).

---

## 7. Landmark Architectures (ImageNet ILSVRC)

| Year | Model | Key idea | Top-5 err. |
|---|---|---|---|
| 2012 | **AlexNet** (SuperVision, 7 layers) | First deep CNN winner; ReLU, dropout, GPU | 15.3% |
| 2014 | **VGG-16** (Oxford) | Stack of $3\times3$ convs, deeper (16 layers) | 7.32% |
| 2014 | **GoogLeNet** (Inception) | Inception modules, global avg pool | winner |
| 2015 | **ResNet** (152 layers) | Residual blocks; won localization/detection | best |

### AlexNet vs. VGG-16
- AlexNet: ~61M params, 0.7 GFLOP, 1.9 MB.
- VGG-16: ~138M params (2.3×), 13.6 GFLOP (19.4×), 48.6 MB (25×). VGG shows **depth helps**, but cost grows.

### GoogLeNet (Inception)
- **Aggressive stem**: rapidly downsamples at the start (cheap memory: 7.5 MB vs VGG-16's 42.9 MB).
- **Inception module**: parallel paths with different receptive-field sizes/operations capture sparse correlation patterns; uses 1×1 convs for dimensionality reduction before expensive convs.
- **Global average pooling** instead of huge FC layers (most VGG params were in FC) → far fewer parameters.
- **Auxiliary classifiers** help train very deep nets.

### ResNet — why residuals?
A series of products in backprop causes **vanishing gradients** (extremely slow/no learning). The **residual block** adds a skip connection:

$$\mathbf{h}_k = f_k(\mathbf{h}_{k-1}, w_k) + \mathbf{h}_{k-1}$$

So the gradient includes:

$$\frac{\partial (\mathbf{h}_{k-1} + F(\mathbf{h}_{k-1}))}{\partial \mathbf{h}_{k-1}} = \frac{\partial F}{\partial \mathbf{h}_{k-1}} + I$$

Even if $\partial F/\partial x$ is small, the $+I$ term prevents the gradient from vanishing. This lets nets reach **152 layers** (and beyond).

### Beyond ResNet
- **Wide ResNet (WRN)**: fewer, wider blocks; a 16-layer WRN beats 1000-layer ResNets.
- **ResNeXt**: groupwise convolutions (cardinality).
- **DenseNet**: each layer connects to all subsequent layers (dense shortcuts).

---

## 8. Summary

- CNNs use **local receptive fields + weight sharing + pooling** → few params, translation equivariance/invariance.
- Output size: $(N+2P-F)/S+1$; cost $\approx F^2 K L H W$.
- **1×1** convs mix channels cheaply; **depthwise/separable** convs (MobileNet) give huge speedups; **groupwise** (ResNeXt) for efficiency.
- **Backprop** through conv reuses shared weights.
- Architectures evolved: AlexNet → VGG (depth) → GoogLeNet (Inception, global pool) → ResNet (residuals fix vanishing gradients).

---

## 9. Receptive Field & Modern Training Tricks

### Receptive field growth
The receptive field of a unit in layer $l$:
$$\text{RF}_l = \text{RF}_{l-1} + (k_l - 1)\prod_{i=1}^{l-1} s_i$$
So strides compound multiplicatively; stacking $3\times3$ stride-1 convs is the standard way to grow the field cheaply.

### Batch Normalization (Batchnorm)
Normalize each feature across the mini-batch: $\hat x = (x-\mu_B)/\sqrt{\sigma_B^2+\epsilon}$, then scale/shift. Stabilizes training, allows higher LR, acts as mild regularizer. (GroupNorm/Layernorm are batch-free alternatives.)

### Dropout
Randomly zero a fraction of activations during training → prevents co-adaptation, improves generalization (common in FC parts; less used inside conv stacks).

### Weight initialization
With ReLU, use **He/Kaiming** init: $W \sim \mathcal{N}(0, 2/n_{\text{in}})$, keeping variances stable through the network.

### Data augmentation
Flips, crops, color jitter, mixup/cutmix — cheap regularization that matters a lot for CNN generalization.

---

## 10. ResNet Bottleneck Block

A deeper residual building block uses the $1\times1$ trick (see §3):

$$\text{bottleneck} = \text{Conv}_{1\times1}(256\to64) \to \text{Conv}_{3\times3}(64\to64) \to \text{Conv}_{1\times1}(64\to256) + \text{skip}$$

The $1\times1$ layers shrink then expand channels around the expensive $3\times3$, cutting compute ~3× vs. a straight $3\times3$ residual. This is how ResNet-50/101/152 stay efficient.

---

## 11. The Modern CNN Recipe

1. Stack $3\times3$ convs (sometimes depthwise-separable) with BN + ReLU.
2. Downsample via stride-2 convs (or pooling) to build a pyramid.
3. Use shortcuts (ResNet) for deep training.
4. End with global average pooling + a linear classifier (GoogLeNet style) instead of huge FCs.
5. Regularize with augmentation + dropout; optimize with SGD/Adam.

> CNNs remain the efficient, inductive-bias-rich backbone; even ViTs often use a light CNN stem.
