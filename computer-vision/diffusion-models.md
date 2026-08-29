# Diffusion Models

> Source: CS1674 Ch.18 (Part B). **DDPMs** (Ho et al. 2020) learn to reverse a gradual noising process; they now rival/exceed GANs in image synthesis. Covers forward/reverse math, conditional & classifier-free guidance, latent diffusion (Stable Diffusion), DDIM, SDXL/SD3, progressive distillation, LCM.

## 1. DDPM Basics

A diffusion model has two processes:
- **Forward (diffusion)**: gradually add Gaussian noise to a clean image $x_0$ over $T$ steps until it becomes pure noise.
- **Reverse (denoising)**: train a network to iteratively remove noise, recovering a sample from the data distribution.

### 1.1 Forward process (fixed, no learning)
Each step adds a small amount of noise:
$$q(x_t \mid x_{t-1}) = \mathcal{N}\big(x_t;\ \sqrt{1-\beta_t}\,x_{t-1},\ \beta_t I\big)$$
where $\beta_t$ is a (typically linearly increasing) variance schedule. Define $\alpha_t = 1-\beta_t$ and $\bar\alpha_t = \prod_{s=1}^t \alpha_s$. By reparameterization, any step is available in closed form:
$$q(x_t \mid x_0) = \mathcal{N}\big(x_t;\ \sqrt{\bar\alpha_t}\,x_0,\ (1-\bar\alpha_t) I\big)$$
$$x_t = \sqrt{\bar\alpha_t}\,x_0 + \sqrt{1-\bar\alpha_t}\,\epsilon, \qquad \epsilon \sim \mathcal{N}(0, I)$$

### 1.2 Reverse process (learned)
$$p_\theta(x_{t-1}\mid x_t) = \mathcal{N}\big(x_{t-1};\ \mu_\theta(x_t, t),\ \Sigma_\theta(x_t,t)\big)$$
A U-Net $\epsilon_\theta$ predicts the noise added at step $t$.

### 1.3 Training loss (simplified)
The variational bound reduces to a simple noise-prediction objective:
$$\mathcal{L}_{\text{simple}} = \mathbb{E}_{t,\,x_0,\,\epsilon}\Big[\big\|\epsilon - \epsilon_\theta(\sqrt{\bar\alpha_t}\,x_0 + \sqrt{1-\bar\alpha_t}\,\epsilon,\ t)\big\|^2\Big]$$
i.e., given a noisy image and its step $t$, predict the noise $\epsilon$ that was added.

### 1.4 Sampling (reverse iteration)
Start from $x_T \sim \mathcal{N}(0,I)$; for $t=T,\dots,1$:
$$x_{t-1} = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{1-\alpha_t}{\sqrt{1-\bar\alpha_t}}\,\epsilon_\theta(x_t, t)\right) + \sigma_t z, \qquad z\sim\mathcal{N}(0,I)$$
Setting $z=0$ gives a more deterministic path.

### 1.5 Score-based view (Song & Ermon 2019)
The gradient of the log-density, $\nabla_x \log p(x)$ (the **score**), points toward higher-density regions. Diffusion training learns a score network $s_\theta(x_t, t) \approx \nabla_{x_t}\log q(x_t)$. Denoising = moving along the score.

### 1.6 Implementation details
- **Time encoding**: sinusoidal positional embeddings or random Fourier features, injected into the U-Net via **addition** or **adaptive (AdaGN) normalization**.
- **U-Net predicts the noise** $\epsilon_\theta$ (not the image directly).

### 1.7 GAN vs. Diffusion
| | GAN | Diffusion |
|---|---|---|
| Training | adversarial, unstable, mode collapse | stable, mode-covering |
| Sampling | one forward pass (fast) | many iterative steps (slow) |
| Quality | can be excellent | now matches/exceeds GANs |

Dhariwal & Nichol (2021): class-conditioned DDPMs **beat GANs** on ImageNet; can sample in as few as 25 steps with FID comparable to BigGAN.

---

## 2. Conditional Diffusion

### 2.1 Classifier guidance
Combine unconditional and conditional scores:
$$\nabla \log p(x\mid y) = \nabla \log p(x) + \nabla \log p(y\mid x)$$
The classifier gradient $\nabla\log p(y\mid x)$ steers generation toward class $y$.

### 2.2 Classifier-free guidance (Ho & Salimans 2021)
Train the model to handle **both** conditional and unconditional cases (randomly drop the condition with some probability). At sampling, steer between them:
$$\tilde\epsilon_\theta(x_t, t, y) = (1+w)\,\epsilon_\theta(x_t, t, y) - w\,\epsilon_\theta(x_t, t)$$
where **guidance weight $w$** controls how strongly the condition is enforced (higher $w$ → more on-distribution-w.r.t.-condition but less diversity).

### 2.3 Text-guided diffusion
Condition on text $c$ and time $t$. A **cross-attention** module fuses modalities: Query comes from the text branch, Key/Value from the image (U-Net) branch.

### 2.4 CLIP (Radford et al. ICML 2021)
Contrastive language–image pre-training: in a batch of $N$ image–text pairs, classify each text to its correct image and vice versa (contrastive objective). Provides a shared embedding space used to condition generation.

---

## 3. Large-Scale Text-to-Image Models

### DALL·E 2 (Ramesh et al. 2022)
- CLIP text encoding → generative model produces a **CLIP image embedding** → diffusion model (GLIDE) conditioned on that embedding + text.
- Cascade: generate 64×64 → upsample to 256×256 → upsample to 1024×1024.

### Latent Diffusion Model / Stable Diffusion (Rombach et al. CVPR 2022)
**Key idea**: train a separate autoencoder to map images to/from a lower-dimensional **latent space**; run the diffusion model **in latent space** (far cheaper than pixel space). Conditioning (text, layout, etc.) is incorporated via **cross-attention** in the U-Net.

### Google Imagen (Saharia et al. NeurIPS 2022)
- Text encoder is a large **language model** (4.6B params, text-only trained).
- Efficient U-Net (2B params); cascade 64→256→1024.
- **Classifier-free guidance with dynamic thresholding** enables high guidance weights without artifacts.
- Trained on 460M internal + 400M LAION pairs. Outperforms DALL·E 2 on DrawBench for correct attribute binding.

---

## 4. Recent Advances (Speed & Quality)

### 4.1 DDIM — Denoising Diffusion Implicit Models
- DDPM follows a **stochastic** reverse process; DDIM uses a **deterministic** one.
- Allows **far fewer sampling steps** (e.g., 20–50 instead of 1000) with minimal quality loss.

### 4.2 Stable Diffusion XL (SDXL)
- Separate **refiner** model; **two text encoders**; bigger U-Net with more attention blocks and parameters.
- Strongly preferred by users over SD v1.4/1.5/2.1.

### 4.3 Stable Diffusion 3 (SD3)
- Further architecture improvements for prompt adherence and quality.

### 4.4 Progressive Distillation (Salimans et al.)
- Distill a multi-step teacher into a student that needs **half the steps**; repeat to amortize sampling cost.

### 4.5 Latent Consistency Models (LCM)
- Combine **consistency models** (Song et al.) with **latent diffusion** (Luo et al.) → **few-step (even 1–4 step)** high-resolution generation.

---

## 5. Implementation & Ethics

- Fast-moving area; start from **HuggingFace `diffusers`**; popular open models: Stable Diffusion, SDXL, SD3, DeepFloyd IF.
- **Ethical/legal**: deepfakes & misinformation; dataset image rights; artists' rights; the nature of creativity. (See Getty Images lawsuit, NYer/Verge/BBC coverage.)

---

## 6. Summary

| Topic | Key formula / idea |
|---|---|
| Forward | $x_t = \sqrt{\bar\alpha_t}x_0 + \sqrt{1-\bar\alpha_t}\,\epsilon$ |
| Training | $\mathcal{L} = \|\epsilon - \epsilon_\theta(x_t,t)\|^2$ |
| Sampling | $x_{t-1} = \frac{1}{\sqrt{\alpha_t}}(x_t - \frac{1-\alpha_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta) + \sigma z$ |
| Guidance | classifier-free: $\tilde\epsilon = (1+w)\epsilon_\theta(x,t,y) - w\epsilon_\theta(x,t)$ |
| Latent diffusion | run DDPM in autoencoder latent space (Stable Diffusion) |
| Speedups | DDIM, progressive distillation, LCM |

> **Takeaway:** diffusion = learn to reverse gradual noising; predict noise, iterate; condition via cross-attention/CLIP; Stable Diffusion runs it in latent space; DDIM/distillation/LCM make sampling fast.

---

## 7. More on the Math

### ELBO sketch
The training objective is a variational lower bound on log-likelihood; after reparameterization it simplifies to the noise-prediction loss $\mathcal{L}_{\text{simple}}$ plus a weighting. Predicting the noise $\epsilon$ is mathematically equivalent to predicting the mean of the reverse step.

### Reverse-step parameterization
The reverse mean is parameterized as:
$$\mu_\theta(x_t,t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{1-\alpha_t}{\sqrt{1-\bar\alpha_t}}\,\epsilon_\theta(x_t,t)\right)$$
and the score is recovered as $\nabla_{x_t}\log q(x_t) \approx -\frac{\epsilon_\theta(x_t,t)}{\sqrt{1-\bar\alpha_t}}$, linking DDPMs to score-based models.

### Variance schedules
$\beta_t$ can be linear, cosine (Nichol & Dhariwal), or learned. Cosine schedules improve sample quality by keeping signal preserved longer at low $t$.

---

## 8. Latent Diffusion Math

Let encoder $E$ map image $x\to z=E(x)$ and decoder $D$ map back. The diffusion operates on $z$:
$$\mathcal{L}_{\text{LDM}} = \mathbb{E}_{t,E(x),\epsilon}\big[\|\epsilon - \epsilon_\theta(z_t, t, c)\|^2\big], \quad z_t = \sqrt{\bar\alpha_t}\,z_0 + \sqrt{1-\bar\alpha_t}\,\epsilon$$
This makes training ~an order of magnitude cheaper (lower spatial resolution in latent space) — the basis of Stable Diffusion.

### Classifier guidance (math)
$$\nabla_x\log p(x\mid y) = \nabla_x\log p(x) + \nabla_x\log p(y\mid x)$$
The second term is the gradient of a classifier; it pulls samples toward class $y$. Classifier-free guidance avoids needing a separate classifier.

---

## 9. Consistency Models & Fast Sampling

**Consistency models** (Song et al.) learn a function $f_\theta(x_t,t)$ that maps any noisy sample at any $t$ to the same clean $x_0$: $f_\theta(x_t,t)=f_\theta(x_{t'},t')$. **LCM** applies this within latent diffusion → generate in 1–4 steps. **Progressive distillation** is an alternative that halves required steps each stage.

---

## 10. SDXL / SD3 Details

- **SDXL**: base model + a separate **refiner**; two text encoders (CLIP + OpenCLIP); larger U-Net with more attention; strong user-preference gains over SD v1.5/2.1.
- **SD3**: improves text rendering and prompt adherence via a better architecture (MM-DiT style) and longer prompts.

> Diffusion quality now leads on FID/human preference, with the main drawback being **sampling cost** — addressed by DDIM, distillation, and LCM.
