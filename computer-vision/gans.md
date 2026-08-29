# GANs

> Source: CS1674 Ch.17 (Part A). **Generative Adversarial Networks** (Goodfellow 2014) train a generator and discriminator in a minimax game; the optimum equals matching the data distribution (JS divergence). Covers DCGAN, evaluation (IS/FID), pix2pix, CycleGAN.

## 1. Generative Modeling Tasks

- **Unconditional generation**: learn to sample from $p_{\text{data}}$ (e.g., MNIST digits, faces).
- **Conditional generation**: condition on class label or text prompt.
- **Image-to-image translation**: condition on an image (e.g., edges→photo, day→night, maps↔aerial).

We need (1) an architecture that can **generate** an image, and (2) the right **loss/training framework**.

---

## 2. Original GAN Formulation (Goodfellow et al. 2014)

Two networks with opposing objectives:
- **Generator $G$**: maps noise $z \sim p_z$ (Gaussian/uniform) → fake sample $G(z)$.
- **Discriminator $D$**: outputs $D(x) \in [0,1]$, the probability $x$ is real.

### 2.1 Minimax objective
$$V(G,D) = \mathbb{E}_{x\sim p_{\text{data}}}[\log D(x)] + \mathbb{E}_{z\sim p_z}[\log(1 - D(G(z)))]$$

- Discriminator wants to maximize: $D^* = \arg\max_D V(G,D)$ (push $D(x)\to1$, $D(G(z))\to0$).
- Generator wants to minimize: $G^* = \arg\min_G V(G,D)$ (fool $D$).

With unlimited capacity/data, $\min_G \max_D V(G,D)$ equals the **Jensen–Shannon (JS) divergence** between $p_{\text{data}}$ and $p_{\text{gen}}$, and the global optimum (Nash equilibrium) is $p_{\text{data}} = p_{\text{gen}}$.

### 2.2 Non-saturating GAN loss (NSGAN)
The generator's $\min \mathbb{E}[\log(1-D(G(z)))]$ gives **tiny gradients** for already-good samples (where $D(G(z))$ is high). Instead, maximize the probability of being classified real:

$$\max_G \mathbb{E}_{z\sim p_z}[\log D(G(z))]$$

This provides large gradients for low-quality samples (still rejected) and avoids saturation — the standard practical generator update.

### 2.3 Training in practice
1. **Update discriminator** (repeat $k$ steps): sample real $x$ and noise $z$; SGA on
   $$\frac{1}{m}\sum_i \big[\log D(x_i) + \log(1 - D(G(z_i)))\big]$$
2. **Update generator**: sample noise $z$; SGA on
   $$\frac{1}{m}\sum_i \log D(G(z_i))$$
3. Repeat until satisfied. **At test time, discard $D$** — only $G$ is used to generate.

The discriminator sees real data directly; the generator only receives gradients **through** $D$ (must backprop through the composed $D\circ G$).

---

## 3. DCGAN (Radford et al. 2016)

Early influential **convolutional** GAN.
- **Generator**: input uniform noise → linear → four **transposed convolutions** (stride 2) for upsampling + ReLU; **Tanh** in the last layer.
- **Discriminator**: **strided convolutions** (no pooling), **Leaky ReLU**, **batch normalization** after most layers, one FC before softmax.
- Results:卧室 generation, smooth interpolation in $z$, and **vector arithmetic** in $z$-space (e.g., "man with glasses" − "man" + "woman" ≈ "woman with glasses"; pose turns by adding a "turn" vector).

---

## 4. Problems with GAN Training

| Problem | Description |
|---|---|
| **Instability** | Parameters oscillate/diverge; generator loss poorly correlates with sample quality; very sensitive to hyperparameters |
| **Mode collapse** | Generator models only a small subset of data (a "shortcut" that fools $D$) → lack of diversity |

---

## 5. Evaluating GANs

We can't directly compute likelihoods of high-dimensional samples.

### 5.1 Inception Score (IS) (Salimans et al. 2016)
Pass generated $x$ through InceptionNet; let $p(y|x)$ = class posterior, $p(y)$ = marginal.
$$IS(G) = \exp\Big(\mathbb{E}_{x\sim G}\big[\mathrm{KL}(p(y|x)\,\|\,p(y))\big]\Big)$$
High IS when: (a) each sample is recognizable → low entropy of $p(y|x)$; (b) samples are diverse → high entropy of $p(y)$.
- **Disadvantages**: a memorizing GAN or one output per class (mode dropping) can still score well; sensitive to weights; can be gamed.

### 5.2 Fréchet Inception Distance (FID) (Heusel et al. 2017)
Fit Gaussians to Inception activations of real and generated sets; compute **Fréchet (Wasserstein-2) distance** between them.
- **Advantages**: correlates with visual quality / human judgment; detects mode dropping (unlike IS).
- **Disadvantages**: can't detect overfitting; sensitive to resampling/compression.

> Lucic et al. (2018, "Are GANs Created Equal?"): with enough tuning/restarts, most models reach similar scores — improvements often come from compute, not algorithmic leaps beyond NSGAN.

---

## 6. Image-to-Image Translation

### 6.1 pix2pix — Paired (Isola et al. CVPR 2017)
Generate $y$ conditioned on input $x$; generator takes $x$ as input.
- **Generator**: **U-Net** (encoder–decoder with skip connections); no noise input.
- **Discriminator**: **PatchGAN** — a fully-convolutional network outputting a $30\times30$ map of local real/fake scores (averaged); effective patch size grows with depth.
- **Loss**: GAN loss + **L1** reconstruction penalty:
  $$\min_G \max_D \mathcal{L}_{\text{GAN}}(G,D) + \lambda \sum_i \|y_i - G(x_i)\|_1$$
- Applications: maps↔aerial, semantic labels→scenes/facades, day→night, edges→photos.
- **Limitations**: needs $(x,y)$ pairs; returns a single mode (doesn't model $P(y|x)$).

### 6.2 CycleGAN — Unpaired (Zhu et al. ICCV 2017)
Given unordered collections $X, Y$, learn translators both ways.
- Two generators $G: X\to Y$, $F: Y\to X$; two discriminators $D_X, D_Y$.
- **Cycle-consistency loss** enforces $F(G(x))\approx x$ and $G(F(y))\approx y$:
  $$\mathcal{L}_{\text{cyc}}(G,F) = \mathbb{E}_x[\|F(G(x))-x\|_1] + \mathbb{E}_y[\|G(F(y))-y\|_1]$$
- Discriminator losses (LSGAN-style, squared):
  $$\mathcal{L}_{\text{GAN}}(D_Y) = \mathbb{E}_y[(D_Y(y)-1)^2] + \mathbb{E}_x[D_Y(G(x))^2]$$
  (and symmetrically for $D_X$).
- Enables horse↔zebra, summer↔winter, without paired data.

---

## 7. Summary

- GAN = minimax game; optimum matches data distribution (JS divergence); use **NSGAN** loss for stable generator gradients.
- **DCGAN** gives the standard Conv/Transposed-Conv + BN + LeakyReLU recipe; beware instability & mode collapse.
- Evaluate with **IS** (diversity+recognizability) and **FID** (distribution distance, mode-aware).
- **pix2pix** (paired, U-Net + PatchGAN + L1); **CycleGAN** (unpaired, cycle-consistency).

---

## 8. Why JS Divergence Is Problematic → Wasserstein (WGAN)

The original GAN minimizes JS divergence, which **saturates** when the real and generated distributions have disjoint supports (common early in training) → gradients to the generator vanish. **WGAN** (Arjovsky et al. 2017) instead minimizes the **Earth-Mover (Wasserstein-1)** distance:

$$W(p_{\text{data}}, p_g) = \inf_{\gamma\in\Pi(p_{\text{data}},p_g)} \mathbb{E}_{(x,y)\sim\gamma}[\|x-y\|]$$

Practically, a **critic** (not discriminator) approximates the Wasserstein distance, trained with a Lipschitz constraint (weight clipping or **gradient penalty**, WGAN-GP). The generator loss becomes simply $-\mathbb{E}[D(G(z))]$, giving meaningful gradients even when distributions don't overlap → much more stable training.

### f-GANs
More generally, GANs can minimize **f-divergences** (KL, reverse-KL, JS, …) via variational lower bounds — the original GAN is the JS case.

---

## 9. Conditional GANs (cGAN)

The minimax objective conditions on $y$ (class, text, image):

$$\min_G \max_D V(D,G) = \mathbb{E}_{x,y}[\log D(x,y)] + \mathbb{E}_{z,y}[\log(1 - D(G(z,y), y))]$$

This generalizes pix2pix/CycleGAN and class-conditioned generation. **StyleGAN** (Karras et al.) later introduced style mixing and progressive growing for high-fidelity faces.

---

## 10. Training Dynamics & Failure Modes (Deeper)

- **Vanishing generator gradient** (original JS): fixed by NSGAN loss or WGAN.
- **Mode collapse**: generator produces limited variety; mitigated by minibatch discrimination, unrolled GANs, WGAN.
- **Saddle-point optimization**: GAN training is a game, not a simple minimization — delicate balance; too-strong $D$ or $G$ stalls the other.
- **Hyperparameter sensitivity**: learning rates, architecture balance, batch size all matter (Lucic et al. showed tuning often beats algorithmic novelty).

---

## 11. Evaluation (More)

- **Precision/Recall for distributions** (Sajjadi et al.): separately measures fidelity (precision) and diversity (recall), unlike IS/FID which mix both.
- **KID** (Kernel Inception Distance): like FID but unbiased for small sample counts.
- **Human evaluation**: still the gold standard for generative quality.

### Practical tips
- Balance $G$/$D$ capacity; update $D$ more often early; use spectral normalization / gradient penalty for stability; label smoothing can help $D$.

> **Summary of variants:** original (JS, NSGAN) → WGAN/WGAN-GP (Wasserstein, stable) → cGAN/pix2pix/CycleGAN (conditioned) → StyleGAN (fidelity). Always evaluate with FID (and ideally precision/recall), not just pretty samples.
