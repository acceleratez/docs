# Image Filtering

> Source: CS1674 Ch.2 Image Filtering. An image is a function; filtering forms a new image whose pixels are combinations of neighboring original pixels.

## 1. Images as Functions

A digital grayscale image is a discrete 2D function:

$$f(x, y) : \mathbb{Z}^2 \to [0, 255]$$

- A pixel value $0$ = black, $255$ = white (one byte per pixel for 8-bit).
- **Filtering** = local operation producing output pixels as a function of a neighborhood of input pixels.

Filtering is the foundation of nearly all low-level vision: smoothing (denoise), sharpening (enhance), and derivative computation (edges).

---

## 2. Linear Filtering: Convolution vs. Correlation

Given an image $f$ and a kernel (filter) $h$, we compute a new image $g$.

### 2.1 Cross-correlation (what "filtering" means here)

The kernel is **not** flipped:

$$g(i, j) = \sum_{u, v} f(i+u, j+v)\, h(u, v)$$

where $(u,v)$ ranges over the kernel support centered at $(0,0)$.

### 2.2 Convolution

The kernel **is flipped** horizontally and vertically:

$$g(i, j) = \sum_{u, v} f(i-u, j-v)\, h(u, v)$$

> **Convention in this course:** unless explicitly stated as "convolution," *filtering means correlation* (no flip). The flip only matters when combining two filters or proving theory; for symmetric kernels (Gaussian, box) the two are identical.

### 2.3 Properties of convolution

| Property | Formula |
|---|---|
| Commutative | $f * g = g * f$ |
| Associative | $(f * g) * h = f * (g * h)$ |
| Distributes over addition | $f * (g + h) = f*g + f*h$ |
| Scalars factor out | $kf * g = f * kg = k(f*g)$ |
| Identity | $f * e = f$, where $e = [\dots,0,1,0,\dots]$ (unit impulse) |

Because of associativity, applying filter $h_1$ then $h_2$ equals applying $h_1*h_2$ once — the basis for separable and cascaded filters.

---

## 3. Common Linear Filters

### 3.1 Box / mean filter

Uniform weights normalized to sum 1:

$$\frac{1}{9}\begin{bmatrix}1&1&1\\1&1&1\\1&1&1\end{bmatrix}, \qquad \text{or 1D: } \frac{1}{5}[1,1,1,1,1]$$

- Replaces each pixel with the **average** of its neighborhood.
- **Effect**: smooths, blurs, removes high-frequency (noise) components → a *low-pass filter*.
- **Drawback**: does not introduce new values; averages across edges → blurs edges; gives a "boxy" appearance due to a non-smooth frequency response.

### 3.2 Weighted (tent / triangular) filter

$$\frac{1}{16}\begin{bmatrix}1&4&6&4&1\end{bmatrix} \quad\text{(1D)}, \qquad \frac{1}{16}\begin{bmatrix}1&4&6&4&1\\4&16&24&16&4\\6&24&36&24&6\\4&16&24&16&4\\1&4&6&4&1\end{bmatrix}$$

- Approximates a Gaussian; nearer neighbors have more influence.

### 3.3 Median filter (non-linear)

- Replaces each pixel with the **median** of values in its window.
- **Non-linear**: more robust to outliers; **preserves edges** (does not blur across boundaries).
- Best for **salt-and-pepper** noise (random black/white pixels).

> **Mean vs. Median**: the mean is linear (new pixel = weighted sum) and blurs edges; the median is order-statistic based, keeps edge sharpness, and is robust to impulse noise.

---

## 4. Image Noise

| Noise type | Description | Best filter |
|---|---|---|
| **Impulse / salt-and-pepper** | Random black/white pixels | Median |
| **Gaussian** | Intensity perturbed by $\mathcal{N}(0,\sigma^2)$ | Mean / Gaussian (averaging many shots reduces it) |
| **Speckle / uniform** | Multiplicative/uniform perturbation | Mean / adaptive |

Averaging many shots reduces Gaussian noise because noise is zero-mean and independent across frames; the mean filter is the canonical low-pass averaging operation.

---

## 5. Gaussian Filter

The 2D isotropic Gaussian:

$$G(x,y) = \frac{1}{2\pi\sigma^2} e^{-(x^2+y^2)/2\sigma^2}$$

### 5.1 Parameters

1. **Variance $\sigma$** — controls the amount of smoothing. Larger $\sigma$ → more blur, removes lower frequencies.
2. **Kernel (mask) size** — must be large enough to hold the Gaussian. A common rule: kernel size $\approx 3\sigma$ to $6\sigma$ (e.g., $\sigma=5$ with a 30×30 kernel vs. a 10×10 kernel gives different effective truncation; size=10px vs 30px matters).

### 5.2 Properties

- **Separable**: $G(x,y) = G(x)\,G(y)$. Apply 1D horizontal pass then 1D vertical pass (or vice-versa) — reduces cost from $O(K^2)$ to $O(2K)$ per pixel.
- **Low-pass**: removes high-frequency detail; used *before* downsampling (anti-aliasing) and *before* taking derivatives (to suppress noise).

### 5.3 Worked intuition

- $\sigma=2$ vs $\sigma=5$ (same 30×30 kernel): larger $\sigma$ → noticeably smoother.
- kernel size 10px vs 30px (same $\sigma=5$): 10px truncates the Gaussian tail, slightly sharper than the 30px version.

---

## 6. Image Gradients (Derivative Filters)

Image gradients capture **intensity change along an axis** — the basis of edge detection.

### 6.1 Horizontal / vertical gradient kernels

Prewitt-style and Sobel-style (3×3) derivative operators:

$$\text{Prewitt } G_x = \begin{bmatrix}-1&0&1\\-1&0&1\\-1&0&1\end{bmatrix}, \quad G_y = \begin{bmatrix}-1&-1&-1\\0&0&0\\1&1&1\end{bmatrix}$$

$$\text{Sobel } G_x = \begin{bmatrix}-1&0&1\\-2&0&2\\-1&0&1\end{bmatrix}, \quad G_y = \begin{bmatrix}-1&-2&-1\\0&0&0\\1&2&1\end{bmatrix}$$

- Sobel weights the center row/column by 2 to be more noise-robust.
- The gradient vector and magnitude: $\nabla f = (f_x, f_y)$, $|\nabla f| = \sqrt{f_x^2 + f_y^2}$, direction $\theta = \mathrm{atan2}(f_y, f_x)$.

### 6.2 Why gradients matter

Edges = regions of large gradient magnitude. Used in Canny, HOG, SIFT, and as features for recognition.

---

## 7. Image Sharpening (High-Pass)

Sharpening accentuates edges:

$$\text{sharpened} = \text{original} + \alpha \cdot \text{detail}, \qquad \text{detail} = \text{original} - \text{blurred}$$

Equivalently, a **sharpen filter** = identity (unit impulse) + (Gaussian − impulse) = a Laplacian-of-Gaussian (LoG) style kernel:

$$\text{sharpen} = \underbrace{\begin{bmatrix}0&0&0\\0&1&0\\0&0&0\end{bmatrix}}_{\text{impulse}} + \lambda\!\left(\underbrace{\begin{bmatrix}0&0&0\\0&1&0\\0&0&0\end{bmatrix}}_{\text{impulse}} - \underbrace{G_{\text{blur}}}_{\text{Gaussian}}\right)$$

- The **detail extraction** is a *high-pass filter* (it keeps high frequencies).
- A common sharpening kernel: $\begin{bmatrix}0&-1&0\\-1&5&-1\\0&-1&0\end{bmatrix}$.

---

## 8. Boundary (Edge) Handling

When the filter window falls off the image edge, choose an extrapolation:

| Method | Behavior |
|---|---|
| **Clip / zero-pad** | Assume black (0) outside — can create dark borders. |
| **Wrap around** | Treat image as periodic (toroidal). |
| **Copy edge** | Repeat the nearest border pixel. |
| **Reflect** | Mirror pixels across the boundary. |

### Output size

- **'full'**: output larger than input (kernel can extend past edges on all sides).
- **'same'**: output same size as input (kernel centered; needs boundary handling).

---

## 9. Filter Separability

A 2D filter $h$ is **separable** if it factors into an outer product of two 1D filters:

$$h = h_{\text{col}}\, h_{\text{row}}^\top \quad \Rightarrow \quad f * h = (f * h_{\text{row}}) * h_{\text{col}}$$

Example: the $K\times K$ box filter = 1D row mean followed by 1D column mean. Cost drops from $O(K^2)$ to $O(2K)$ per pixel. The Gaussian is the canonical separable filter.

---

## 10. Non-linear Filters: Thresholding

Simple non-linear filtering such as **thresholding** ($\hat f = 255$ if $f > t$ else $0$) produces binary masks; useful for segmentation and masking before later processing.

---

## 11. Application: Hybrid Images (Oliva, Torralba & Schyns, SIGGRAPH 2006)

A hybrid image combines:
- a **low-frequency** version of image A (heavy Gaussian blur), and
- a **high-frequency** version of image B (original − blurred, i.e., Laplacian/high-pass).

Because humans perceive coarse (low-frequency) structure at a distance and fine (high-frequency) detail up close, the same image reads as A far away and B up close. This demonstrates that **frequency content drives perception** — a direct application of filtering.

---

## 12. Summary Table

| Filter | Linear? | Effect | Use case |
|---|---|---|---|
| Box / mean | Yes | Blurs, low-pass | Fast smoothing |
| Weighted | Yes | Smooth, low-pass | Gentler blur |
| Median | No | Edge-preserving denoise | Salt-and-pepper noise |
| Gaussian | Yes | Smooth, separable low-pass | Prefiltering, derivatives |
| Sobel/Prewitt | Yes | Gradient / edge | Edge detection |
| Sharpen (LoG) | Yes | High-pass | Edge accentuation |
| Threshold | No | Binarize | Segmentation |

> **Key idea:** filtering is correlation with a kernel; choose kernel+size+boundary handling by the frequency content you want to keep or remove.
