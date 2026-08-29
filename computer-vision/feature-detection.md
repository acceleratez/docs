# Feature Detection

> Source: CS1674 Ch.4 Feature Detection. Topics: edges (Sobel, Canny), line/circle fitting (least squares, Hough), RANSAC, local interest points, and the Harris corner detector.

## 1. Edge Detection

An **edge** is a place of rapid change in the image intensity function. Edges are caused by:
- **Depth discontinuity** (object boundary / occlusion)
- **Surface color discontinuity**
- **Illumination discontinuity** (shadow, lighting change)
- **Surface normal discontinuity** (fold, crease)

Edges look like "steep cliffs" in the intensity profile. They correspond to **extrema of the first derivative** (or zero-crossings of the second derivative).

### 1.1 Image derivatives

For a discrete image $F[x,y]$, approximate the derivative by finite differences:

$$\frac{\partial f}{\partial x} \approx F[x+1,y] - F[x,y] \quad \xrightarrow{\text{filter}} \begin{bmatrix}-1 & 1\end{bmatrix}$$

- **Option 1**: reconstruct a continuous image $f$, then differentiate.
- **Option 2**: take the discrete derivative directly (filter form above).

### 1.2 Gradient

The **gradient** points in the direction of most rapid intensity increase:

$$\nabla f = \begin{bmatrix} f_x \\ f_y \end{bmatrix}, \qquad |\nabla f| = \sqrt{f_x^2 + f_y^2}, \qquad \theta = \mathrm{atan2}(f_y, f_x)$$

- **Edge strength** = gradient magnitude $|\nabla f|$.
- **Edge direction** = perpendicular to $\nabla f$, given by $\theta$.

### 1.3 Smooth first!

On a noisy image, the derivative is dominated by noise. **Smooth before differentiating**:

$$f * (h * g) = (f * h) * g$$

By associativity, we can convolve the derivative kernel with the smoothing kernel *once* (a "derivative of Gaussian" filter) and apply it directly — saving a pass.

### 1.4 Derivative of Gaussian (DoG)

1D Gaussian $G(x;\sigma)$ and its derivative $G'(x;\sigma)$:

$$G'(x) = -\frac{x}{\sigma^2} G(x)$$

The 2D DoG is separable: $G_x = G'(x)G(y)$, $G_y = G(x)G'(y)$.

### 1.5 The Sobel filter

A common discrete approximation of the derivative of Gaussian:

$$G_x = \begin{bmatrix}-1&0&1\\-2&0&2\\-1&0&1\end{bmatrix}, \qquad G_y = \begin{bmatrix}-1&-2&-1\\0&0&0\\1&2&1\end{bmatrix}$$

- The $1/8$ normalization is omitted in the standard Sobel; it does not change edge *detection* (only the magnitude scale).
- Interpretation: blur (1D Gaussian on rows/cols) × 1D central difference.

---

## 2. Canny Edge Detector (Canny 1986, TPAMI)

Still the most widely used edge detector 35+ years later. Four steps:

### Step 1 — Filter with derivative of Gaussian
Compute $f_x, f_y$ via DoG; form magnitude $M = \sqrt{f_x^2+f_y^2}$ and orientation $\theta = \mathrm{atan2}(f_y, f_x)$.

### Step 2 — Non-maximum suppression (NMS)
Thin the edges: a pixel $q$ is kept only if its magnitude is a **local maximum** along the gradient direction. Compare $q$ with two neighbors $p, r$ interpolated along $\theta$; if $q$ is not the max, suppress it. This converts thick edges into thin 1-pixel ridges.

### Step 3 — Thresholding (double threshold)
With low threshold $t$ and high threshold $T$:
- $M > T$ → **strong edge**
- $M < t$ → **no edge**
- $t \le M \le T$ → **weak edge**

### Step 4 — Hysteresis linking
- Strong edges are definitely edges.
- A weak edge is kept **only if it connects to a strong edge** within a local neighborhood (typically 8-connected).

**Parameters**: $\sigma$ of the Gaussian (scale) and the two thresholds. Effect of $\sigma$:
- Large $\sigma$ → detects large-scale (coarse) edges.
- Small $\sigma$ → detects fine details (but more noise).

---

## 3. Line Fitting

### 3.1 Least squares line fit

Given points $(x_i, y_i)$, fit $y = mx + b$ by minimizing the sum of squared residuals:

$$E(m,b) = \sum_{i=1}^n (y_i - (m x_i + b))^2$$

Closed-form solution via the normal equations:

$$\begin{bmatrix}\sum x_i^2 & \sum x_i \\ \sum x_i & n\end{bmatrix}\begin{bmatrix}m\\b\end{bmatrix} = \begin{bmatrix}\sum x_i y_i \\ \sum y_i\end{bmatrix}$$

**Problem:** least squares is *not robust to outliers* — a single bad point can ruin the fit.

### 3.2 The Hough Transform (Duda & Hart 1976)

**Idea — voting**: let each feature vote for every model compatible with it; look for parameter bins that receive many consistent votes.

**$(m,b)$ parameterization:**
- A line $y = mx + b$ in image space = a **point** $(m,b)$ in Hough space.
- A single image point $(x_0,y_0)$ maps to the line $b = -x_0 m + y_0$ in Hough space.
- Two image points map to two Hough lines whose **intersection** is the $(m,b)$ of the line through both.

**Polar parameterization** (avoids unbounded $m$, handles vertical lines):

$$\rho = x\cos\theta + y\sin\theta$$

- Each edge point adds a sinusoid in $(\theta, \rho)$ space.
- Algorithm:
  1. Initialize accumulator $H(\theta,\rho) = 0$.
  2. For each edge point $(x,y)$ with gradient orientation $\theta$: $\rho = x\cos\theta + y\sin\theta$; $H(\theta,\rho){+}{+}$.
  3. Find local maxima $(\theta^*,\rho^*)$; the line is $\rho^* = x\cos\theta^* + y\sin\theta^*$.

**Pros / Cons:**
| Pros | Cons |
|---|---|
| Points processed independently → robust to occlusion/gaps | Search time grows exponentially with #params (O($10^3$) for 3 params) |
| Noise unlikely to vote consistently | Hard to choose bin size (quantization) |
| Detects multiple instances in one pass | Memory for high-dim accumulator |

### 3.3 Circle detection by Hough

Circle of radius $r$ and center $(a,b)$: $(x-a)^2 + (y-b)^2 = r^2$. For fixed $r$, each edge point votes into a 2D $(a,b)$ accumulator; for unknown $r$, use a 3D $(a,b,r)$ accumulator:

$$a = x - r\cos\theta, \qquad b = y - r\sin\theta$$

---

## 4. RANSAC — RANdom SAmple Consensus (Fischler & Bolles 1981)

**Goal**: fit a model in the presence of outliers by finding **inliers** only.

**Loop:**
1. Randomly select the minimal sample size $s$ (e.g., $s=2$ for a line).
2. Fit the model to those points.
3. Find inliers: points within distance $< t$ of the model.
4. Repeat $N$ times; keep the model with the most inliers.
5. (Optionally) refit with all inliers via least squares.

**Number of iterations** to guarantee with confidence $p$ that at least one sample is all-inlier, given inlier ratio $w$:

$$N = \frac{\log(1-p)}{\log(1 - w^s)}$$

**Pros / Cons:**
| Pros | Cons |
|---|---|
| General (stitching, 2-view relations) | Needs parameter tuning ($t$, $N$) |
| Works well in practice | Fails at low inlier ratio (too many iters) |

**Hough vs. RANSAC**: Hough votes globally (good for many instances, high-dim cost); RANSAC hypothesizes-then-verify (good for single best model with outliers).

---

## 5. Local Features / Interest Points

### 5.1 Why local features?

Pixel representation is not invariant to translation, illumination, scale, or viewpoint. Local features are:
- **Locality** — small image region; robust to clutter/occlusion.
- **Repeatability** — same feature found across transformed images.
- **Distinctiveness** — unique descriptor; minimizes wrong matches.
- **Compactness/efficiency** — far fewer than pixels.

Applications: recognition, image search, 3D reconstruction, tracking, panorama stitching.

### 5.2 What makes a good keypoint?

If you had to click a point, leave, and find it again after the image is deformed, you'd pick a **corner**, not a flat region or an edge (edges are ambiguous along their length).

| Region | Shift response |
|---|---|
| **Flat** | little change in any direction |
| **Edge** | change along one direction only (none along the edge) |
| **Corner** | large change in *all* directions |

Corners are the distinctive interest points we want.

---

## 6. Harris Corner Detector (Harris & Stephens 1988)

### 6.1 The math — SSD error

Shift a window $W$ by $(u,v)$. The intensity change (Sum of Squared Differences):

$$E(u,v) = \sum_{(x,y)\in W} \big(I(x+u, y+v) - I(x,y)\big)^2$$

We want $E(u,v)$ **large for small shifts in all directions**.

### 6.2 Small-motion (first-order Taylor)

For small $(u,v)$:

$$I(x+u, y+v) \approx I(x,y) + u\,I_x + v\,I_y$$

So

$$E(u,v) \approx \sum_{W} \big(u I_x + v I_y\big)^2 = \begin{bmatrix}u & v\end{bmatrix} H \begin{bmatrix}u \\ v\end{bmatrix}$$

where the **second-moment matrix** (structure tensor) is:

$$H = \sum_{W} w(x,y) \begin{bmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{bmatrix}$$

($w$ is a window weight, e.g., Gaussian, so center pixels count more — "weighting the derivatives".)

### 6.3 Interpreting $H$ via its eigenvalues

$H$ is visualized as an ellipse: axis lengths $\propto 1/\sqrt{\lambda_{\min}}, 1/\sqrt{\lambda_{\max}}$, orientation = eigenvectors. $\lambda_{\max}$ = change in fastest direction $x_{\max}$; $\lambda_{\min}$ = change in slowest direction $x_{\min}$. The minimum of $E$ over unit shifts equals $\lambda_{\min}$.

Classification by eigenvalues:
| Case | Meaning |
|---|---|
| $\lambda_{\min}$ small, $\lambda_{\max}$ small | **Flat** region |
| $\lambda_{\max} \gg \lambda_{\min}$ | **Edge** |
| $\lambda_{\min}$ large, $\lambda_{\max} \approx \lambda_{\min}$ | **Corner** |

### 6.4 Cornerness (response) function

Instead of eigen-decomposition, Harris uses:

$$R = \det(H) - \alpha\, \mathrm{trace}(H)^2 = \lambda_1\lambda_2 - \alpha(\lambda_1+\lambda_2)^2$$

with $\alpha \in [0.04, 0.06]$.

| $R$ | Classification |
|---|---|
| $R > 0$ (large) | **Corner** |
| $R < 0$ | **Edge** |
| $|R|$ small | **Flat** |

This avoids computing eigenvalues (faster) while preserving the classification.

### 6.5 Harris algorithm

1. Compute image derivatives $I_x, I_y$.
2. Compute squares and products: $I_x^2, I_y^2, I_x I_y$.
3. Apply Gaussian filter (smooth the products).
4. Compute corner response $R$; keep pixels with $R > \text{threshold}$.
5. **Non-maximum suppression**: keep only local maxima of $R$.

> **Note**: Harris corners are **translation-invariant** and partly illumination/rotation robust, but **not scale-invariant** — that is fixed later by the Harris-Laplace / SIFT scale-selection step (next chapter).

---

## 7. Chapter Summary

- Edges = extrema of gradient; use **Sobel/DoG** then **Canny** (NMS + hysteresis).
- Fit lines/circles via **least squares** (non-robust) or **Hough** (voting, multi-instance).
- **RANSAC** robustly fits a single model under heavy outliers.
- **Harris** detects repeatable, distinctive corners via the second-moment matrix $H$ and response $R$, followed by NMS.
