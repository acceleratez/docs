# Encoder-Decoder for Latent Analysis

> Source: CS1674 Ch.13. Neural networks learn a mapping $\hat y = f(x)$. **Representation learning** learns a useful feature transformation $\phi(x)$ automatically; the **autoencoder** is the canonical unsupervised version (encode → latent → decode, minimize reconstruction loss).

## 1. Neural Networks as Function Approximation

Given input $x$ and output $y$, there is a mapping $y = f(x)$. We seek an estimate $\hat f(x)$. Statistical / representation learning is the process of finding $\hat f$; neural networks are one such method.

---

## 2. Why Representation Matters

A bad representation makes the task hard; a good one makes it trivial.

- **With labels**: fit logistic/linear regression directly on $x$ → maybe a bad fit.
- **Learn a representation** $\phi(x)$ first (e.g., polar coords $r=\sqrt{x_1^2+x_2^2},\ \theta=\mathrm{atan2}(x_2,x_1)$), then a simple linear model on $\phi(x)$ fits perfectly.

So: choose/learn $\phi(x)$ such that the *task* (classification, regression) becomes easy on $\phi(x)$.

### With labels
Train two networks minimizing **cross-entropy**:
$$\min\ \mathrm{CE}\big(y,\ \text{Classifier}(\phi(x))\big)$$
$\phi(x)$ = "feature discovery network."

### Without labels (the autoencoder)
Train two networks minimizing **reconstruction loss**:
$$L = \sum_i (x_i - \hat x_i)^2, \qquad \hat x = \text{Decoder}(\phi(x))$$
This is an **autoencoder**: it automatically finds the best encoding so the decoded version is as close as possible to the input.

---

## 3. A Brief History (why encode/decode?)

- **MP3** compresses audio ~10× → digital music distribution.
- **JPG** compresses images ~10–20× → the image-rich web.
Both **encode** input → compressed form → **decode** to a (lower-quality) original. The bigger the difference between original and decompressed, the bigger the **loss**.

**Lossy vs. lossless**: a transformation is lossless only if it is *invertible* (you can recover the original). Autoencoders are typically **lossy** — measured by the reconstruction loss $L=\sum(x_i-\hat x_i)^2$. (Analogy: texting "HH, HBD, LY, D" compresses 40→14 chars but "D" is ambiguous — lossy.)

---

## 4. Autoencoder Architecture

A particular learning architecture that **compresses inputs into a form that can later be decompressed**. Typical uses: dimensionality reduction, blending, denoising, infilling.

### 4.1 The simplest autoencoder
- **Encoder**: a small fully-connected network (FCN) $z = \phi(x) = g(W_e x + b_e)$.
- **Latent space** $Z$ (bottleneck).
- **Decoder**: another FCN $\hat x = \psi(z) = W_d z + b_d$.

Train by comparing input and output pixel-by-pixel (residuals = $x - \hat x$).

### 4.2 The bottleneck
Example: 100×100 input (10,000 elements) → 20 in the middle → 10,000 again. The narrow latent forces the network to capture the *essence*.

MNIST experiments (28×28 = 784 inputs):
- 20 latent vars: decent reconstruction.
- 10 latent vars: blurrier.
- 2 latent vars: very lossy but shows structure.
- **Deeper** encoder/decoder (e.g., 784→512→256→20→256→512→784) with the *same* latent size learns better representations than a shallow one.

---

## 5. Exploring the Latent Space

**Is there information in $Z$?** Test by perturbing $z$:
- Add random noise ±10 to $z$ → output changes slightly.
- Add ±100 → output changes a lot.
- Pure noise in $z$ → garbage output.

⇒ The latent space *does* encode meaningful structure.

**Separability**: set latent dim = 2 and plot the codes of different classes. A well-trained AE places similar inputs close together → latent captures the data's "essence."

---

## 6. Applications of Autoencoders

### 6.1 Blending
- **Content blending**: directly overlay two inputs (e.g., cow + zebra images) and decode.
- **Representation / parametric blending**: blend in *parameter space* (latent $z$). E.g., on MNIST, start at one latent point, move along an arrow to another in 7 steps, decode each intermediate $z$ → a smooth **morph** between digits.

### 6.2 Denoising
Train the AE to reconstruct a *clean* input from a *noisy* one → it learns contextual structure, enabling noise removal.

### 6.3 Infilling
If part of the image is missing, the AE (having learned context) can fill it in.

---

## 7. Undercomplete vs. Overcomplete

| Type | Bottleneck size vs. input | Behavior |
|---|---|---|
| **Undercomplete** | smaller than input | Classic AE; compresses |
| **Overcomplete** | ≥ input | May just **copy input→output** and learn nothing useful |

The ideal AE balances: sensitive enough to reconstruct accurately, yet insensitive enough not to memorize/overfit.

---

## 8. Regularized Autoencoders

To prevent trivial copying, add a penalty. Regularization is on the **encoder output (latent)**, not on network parameters.

### 8.1 Sparse autoencoder
Limit capacity so the network must keep only the variations needed to reconstruct, dropping redundancies. Loss:
$$L(x, \psi(\phi(x))) + \lambda\sum_i |z_i|$$
Individual hidden nodes become selectively activated for specific attributes → sparse activations.

### 8.2 Contractive autoencoder
For similar inputs, encodings should be similar. Force the encoder to be **insensitive to small input changes** by penalizing the Jacobian:
$$L(x, \psi(\phi(x))) + \lambda\sum_i \|\nabla_x z_i\|^2$$
This forces the model to learn features capturing the training distribution, not to over-react to perturbations.

---

## 9. Problems with (Standard) Autoencoders

1. **Gaps in latent space**: large regions have no meaningful representation; decoding a random point between two known codes may yield garbage.
2. **Poor separability**: latent features may not separate classes well, hurting downstream classification/clustering.
3. **Discrete data vs. continuous latent**: real data (digits 0–9) is discrete, but standard AEs use a continuous latent → mismatch.

> These limitations motivate later models: VAEs (regularize latent with a prior + KL term), GANs, and diffusion models (Ch.17–18).

---

## 10. Summary

- Representation learning $\phi(x)$ makes downstream tasks easy; autoencoders learn $\phi$ **without labels** via reconstruction.
- Architecture: encoder → narrow **bottleneck** → decoder; depth helps.
- Use for dimensionality reduction, blending (latent morphs), denoising, infilling.
- Prevent copying with **sparse / contractive** regularization; beware latent gaps and poor separability.

---

## 10. Variational Autoencoder (VAE)

The VAE makes the latent **probabilistic** so it is well-behaved and continuous:
- Encoder outputs parameters of a Gaussian: $q_\phi(z\mid x) = \mathcal{N}(\mu_\phi(x), \mathrm{diag}(\sigma_\phi^2(x)))$.
- Sample $z = \mu + \sigma\odot\epsilon$, $\epsilon\sim\mathcal{N}(0,I)$ (**reparameterization trick** — makes sampling differentiable).
- Decoder $p_\theta(x\mid z)$ reconstructs.
- Loss = **reconstruction** + **KL divergence** to a prior $\mathcal{N}(0,I)$:

$$\mathcal{L} = \mathbb{E}_{q_\phi}[\log p_\theta(x\mid z)] - \beta\, \mathrm{KL}\big(q_\phi(z\mid x)\,\|\,\mathcal{N}(0,I)\big)$$

The KL term regularizes the latent into a smooth, continuous space → enables **interpolation** (walk between digits) and generation by sampling $z\sim\mathcal{N}(0,I)$. **β-VAE** increases $\beta$ to enforce disentangled factors.

### VQ-VAE
Quantizes $z$ to a discrete **codebook** vector → discrete latent space (used in DALL·E, SoundStream). Avoids the "blurry" continuous-VAE outputs.

---

## 11. Denoising Autoencoder (DAE)

Explicitly train to reconstruct $x$ from a corrupted version $\tilde x = \text{Corrupt}(x)$. This forces the model to learn the data manifold's structure — the conceptual bridge to **diffusion models** (which repeatedly denoise).

---

## 12. Relation to Other Generative Models

| Model | Latent | Training signal |
|---|---|---|
| AE | deterministic, often discontinuous | reconstruction only |
| VAE | probabilistic (KL-regularized) | reconstruction + KL |
| GAN | implicit | adversarial |
| Diffusion | (noisy) iterative | noise prediction |

> AEs/VAEs/DAEs are **representation learners**; GANs/diffusion are **samplers**. Modern systems often combine them (e.g., latent diffusion = VAE encoder + diffusion in latent + decoder).

---

## 13. Concrete Intuition (MNIST)

- 784 input → bottleneck of size 2 → 784 output. Reconstructions are blurry but recognizable.
- The 2-D latent, when plotted, **clusters by digit** — proof the AE learned "essence."
- Adding ±10 noise to $z$ slightly changes the output; ±100 changes it a lot; pure noise → garbage → confirms $z$ is meaningful.
