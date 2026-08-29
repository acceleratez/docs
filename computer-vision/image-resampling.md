# Image Resampling

> Source: CS1674 Ch.3 Image Resampling. Why does a lower-resolution image still make sense? What do we lose? Answer: aliasing — and how to avoid it with prefiltering and interpolation.

## 1. The Problem: Downsampling

**Simple downsampling**: throw away every other row and column to create a 1/2-size image (2× zoom-out). Repeating gives 1/4 size (4× zoom-out).

The result looks "crufty" — jagged, with false patterns. The reason is **aliasing**.

---

## 2. Aliasing

Aliasing occurs when the **sampling rate is too low** to capture the detail in the image, producing a *wrong* signal (an "alias").

### 2D / 1D intuition
- A 1D sinewave sampled too coarsely can be mistaken for a lower-frequency sinewave.
- Classic example: the **wagon-wheel effect** — a rotating wheel appears to spin backward on film because the frame rate undersamples the rotation.

Aliasing can only be understood by analyzing the **frequency structure** of the signal.

---

## 3. Nyquist–Shannon Sampling Theorem

When sampling a continuous signal at discrete intervals, the sampling frequency $f_s$ must satisfy:

$$f_s \ge 2\, f_{\max}$$

where $f_{\max}$ is the maximum frequency present in the signal. Sampling at exactly $2f_{\max}$ is the **Nyquist rate**.

- If $f_s \ge 2f_{\max}$: the original can be **perfectly reconstructed** from samples.
- If $f_s < 2f_{\max}$: aliases appear and reconstruction is impossible without prior knowledge.

> **Implication for images:** an image with high-frequency detail (sharp edges, fine texture) must be *low-pass filtered* before downsampling, otherwise those frequencies fold back as artifacts.

---

## 4. Anti-Aliasing

Two strategies:
1. **Sample more often** (increase resolution) — not always possible.
2. **Remove high frequencies before sampling** — apply a smoothing (low-pass) filter first. You lose some information, but it is better than aliasing.

### 4.1 Gaussian prefiltering pipeline

```
Start with image  →  Apply Gaussian low-pass filter  →  Downsample
        f                  (blur high frequencies)         (keep low)
```

Compare:
- **Without** prefiltering: 1/2 and 1/4 images show moiré/jaggies.
- **With** Gaussian prefiltering: smoother, faithful low-frequency content preserved.

A pixel whose neighbors vary a lot (high local frequency) is exactly where prefiltering helps most.

---

## 5. Image Pyramids

### 5.1 Gaussian pyramid $\{f_0, f_1, \dots, f_n\}$

- $f_0$ = original image.
- $f_{k+1}$ = low-pass filter $f_k$ with a Gaussian, then downsample by 2.
- Each level is half the resolution (and quarter the pixels) of the previous → a "pyramid."

### 5.2 Laplacian pyramid $\{h_0, h_1, \dots, h_n\}$

The **detail** (high-pass) at each level:

$$h_k = f_k - \text{upsample}(f_{k+1})$$

so that $f_k - l_k = h_k$ where $l_k$ is the upsampled coarser level. The Laplacian pyramid stores *what was lost* at each scale.

> **Reconstruction:** because $f_k = h_k + \text{upsample}(f_{k+1})$, starting from the top of the Gaussian pyramid and adding Laplacian detail bottom-up perfectly reconstructs the original. This is the basis of **image blending** (Burt–Adelson).

---

## 6. Upsampling

### 6.1 The naive approach

"Image too small — make it 10× bigger by repeating each row and column 10 times" = **nearest-neighbor** replication. Result is blocky and poor.

### 6.2 Why interpolation works

Recall: a digital image is a **discrete point-sampling** of a continuous function $f(x,y)$. If we could reconstruct the continuous $f$, we could resample it at *any* resolution.

1. Treat the discrete samples as samples of $f$.
2. Reconstruct a continuous approximation $\hat f$ by convolution with a **reconstruction filter** $\hat h$:

$$\hat f(x,y) = \sum_{i,j} f[i,j]\, \hat h(x - i,\, y - j)$$

3. Sample $\hat f$ at the new, denser grid.

### 6.3 Interpolation filters (1D hat → 2D)

| Filter | Kernel | Quality |
|---|---|---|
| **Nearest-neighbor** | Box (replicate) | Blocky; cheap |
| **Linear / Bilinear** | Tent function (triangle) | Smooth; standard |
| **Cubic / Bicubic** | Cubic polynomial | Sharp, high quality |
| **Gaussian / Lanczos** | Smooth bell / sinc window | Best fidelity |

- **Bilinear interpolation**: perform linear interpolation along rows, then along columns (the 2D version of the 1D "tent" function). For a point $(x,y)$ with corner values $f_{00},f_{01},f_{10},f_{11}$ and fractional parts $t_x,t_y$:

$$f(x,y) = (1-t_y)\big[(1-t_x)f_{00} + t_x f_{10}\big] + t_y\big[(1-t_x)f_{01} + t_x f_{11}\big]$$

- **Bicubic**: uses 16 neighbors and cubic weights → less blurring than bilinear.
- Upsampling is also called **super-resolution** when the goal is to recover fine detail.

---

## 7. Super-Resolution with Multiple Images

If you have several images of the same scene with **sub-pixel shifts** (e.g., a burst from a handheld phone with natural hand tremor), you can align and merge them to recover detail beyond a single frame's Nyquist limit.

- Google Pixel "Super Res Zoom" (Wronski et al., *Handheld Multi-Frame Super-Resolution*, TOG 2019) captures a burst, globally aligns, and merges sub-pixel offsets to synthesize a higher-resolution image.

---

## 8. Summary

| Operation | Key idea | Pitfall avoided |
|---|---|---|
| Downsample | Drop rows/cols | — (naive) |
| Anti-alias downsample | Gaussian prefilter then drop | Aliasing |
| Gaussian pyramid | Repeated blur+subsample | Multi-scale analysis |
| Laplacian pyramid | Difference of levels | Stores lost detail |
| Upsample (NN) | Replicate | — (blocky) |
| Upsample (bilinear/cubic) | Reconstruct continuous $f$ | Blockiness |

> **Remember:** sample at ≥ 2× the highest frequency (Nyquist), and remove high frequencies *before* downsampling. Reconstruct a continuous function *before* upsampling.

---

## 9. Aliasing Math (Why Nyquist)

Sampling multiplies the signal by a Dirac comb; in frequency domain this **replicates** the spectrum every $f_s$. If $f_{\max} > f_s/2$, replicas overlap → **aliasing** (high frequencies fold into low). The sinc reconstruction $f(t)=\sum f[n]\,\mathrm{sinc}((t-nT)/T)$ is exact only when no overlap (Nyquist holds).

---

## 10. Decimation & Prefiltering

- **Decimation** = downsample after (ideally) low-pass filtering.
- Without prefiltering, you keep high frequencies that alias. Gaussian prefiltering is the standard anti-alias:

$$\text{low-res} = \big(\text{Gaussian}_{\sigma}(I)\big)\downarrow s$$

where $s$ is the downsampling factor and $\sigma$ should scale with $s$ (e.g., $\sigma \approx s/2$).

---

## 11. Pyramid Construction (Formulas)

- **Gaussian pyramid**: $G_k = \mathrm{downsample}(\mathrm{Gaussian}(G_{k-1}))$, kernel $\sigma$ typically 1.0–1.4; each level half size.
- **Laplacian pyramid**: $L_k = G_k - \mathrm{upsample}(G_{k+1})$ (detail at level $k$).
- **Reconstruction**: $G_k = L_k + \mathrm{upsample}(G_{k+1})$, from top down → exact recovery of $G_0$ (Burt–Adelson).

---

## 12. Interpolation Orders

| Method | Polynomial order | Quality / cost |
|---|---|---|
| Nearest-neighbor | 0 | blocky, fastest |
| Bilinear | 1 (linear in 2D) | smooth, standard |
| Bicubic | 3 | sharp, higher cost |
| Lanczos (sinc window) | — | best fidelity |

Cubic convolution (Keys' function) is the bicubic default in OpenCV/PIL.

---

## 13. Learning-Based Super-Resolution

Beyond interpolation, **SRCNN / ESRGAN / SR3** learn a mapping from low-res to high-res using examples, recovering real detail (edges, texture) that interpolation cannot. Multi-image SR (Pixel "Super Res Zoom") uses sub-pixel bursts.

> **Rule of thumb:** always Gaussian-prefilter before shrinking, and interpolate (don't nearest-neighbor) before enlarging — and remember the limit is set by the original sampling rate (Nyquist).
