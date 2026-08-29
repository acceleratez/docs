# Motion Estimation

> Source: CS1674 Ch.8. Motion arises whenever light, object, or camera changes. We estimate it via **optical flow**, primarily the **Lucas–Kanade** method, and handle large motion with a **coarse-to-fine** pyramid.

## 1. Causes of Motion

Motion = change across frames, caused by varying one of three imaging factors: **Light**, **Object**, **Camera**.

| Scenario | Camera | Scene | Light |
|---|---|---|---|
| Surveillance | static | moving | static |
| 3D capture / mapping | moving | static | static |
| Sports / movie | moving | moving | static |
| Time-lapse | static | moving | moving |

Recovering motion can be done by:
- **Feature matching** (sparse) — match corners/textured regions across frames.
- **Tracking / optical flow** (dense) — estimate motion at every pixel from spatio-temporal brightness.

---

## 2. What is Optical Flow?

**Optical flow** is the dense motion field: a 2D vector $(u,v)$ per pixel giving how each point moved between two frames. Uses: motion estimation, object tracking, visual odometry (robot pose).

### Feature matching vs. optical flow
| Method | Pros | Cons |
|---|---|---|
| Feature matching | scale/rotation (≈) invariant, lighting (≈) invariant, handles large motion | sparse, alignment not exact, low accuracy |
| Optical flow | dense, accurate locally | assumes small motion, brightness constancy |

Feature matching alone "doesn't work very well to compute the flow" densely → we use Lucas–Kanade.

---

## 3. Lucas–Kanade Optical Flow

### 3.1 Key assumptions
1. **Brightness constancy**: a projected point has the same intensity in every frame.
2. **Small motion**: points move less than ~1 pixel (so linearization is valid).
3. **Spatial coherence**: neighboring pixels have (approximately) the same $(u,v)$.

### 3.2 Brightness constancy constraint

$$I(x, y, t) = I(x+u, y+v, t+1)$$

Taylor-expand the RHS about $(x,y,t)$:

$$I(x+u, y+v, t+1) \approx I(x,y,t) + I_x u + I_y v + I_t$$

Subtracting $I(x,y,t)$ and using constancy ($0 = I_x u + I_y v + I_t$):

$$\boxed{I_x u + I_y v = -I_t}$$

or in vector form: $\nabla I^\top \mathbf{d} = -I_t$, where $\mathbf{d} = (u, v)^\top$, $\nabla I = (I_x, I_y)$, and $I_t$ is the frame difference.

### 3.3 The aperture problem

Per pixel we have **one equation, two unknowns** $(u,v)$. The component of motion *parallel to an edge* (perpendicular to the gradient) is unobservable — the **aperture problem** (e.g., barber-pole illusion: vertical stripes appear to move up-right while actually moving right).

### 3.4 Resolving the ambiguity — spatial coherence → least squares

Assume the $K\times K$ neighborhood shares $(u,v)$. Stack equations for all pixels in the window:

$$\begin{bmatrix}I_x^1 & I_y^1\\ \vdots & \vdots\\ I_x^{K^2} & I_y^{K^2}\end{bmatrix}
\begin{bmatrix}u\\v\end{bmatrix}
=
\begin{bmatrix}-I_t^1\\ \vdots\\ -I_t^{K^2}\end{bmatrix}
\quad\Rightarrow\quad A\mathbf{d} = \mathbf{b}$$

Least-squares solution:

$$\boxed{\mathbf{d}^* = (A^\top A)^{-1} A^\top \mathbf{b}}$$

where

$$A^\top A = \sum_{(x,y)\in W}
\begin{bmatrix}I_x^2 & I_x I_y\\ I_x I_y & I_y^2\end{bmatrix}
= \begin{bmatrix}\sum I_x^2 & \sum I_x I_y\\ \sum I_x I_y & \sum I_y^2\end{bmatrix}$$

This $A^\top A$ is the same **second-moment matrix** as in the Harris detector!

### 3.5 Conditions for solvability (good features to track)

- $A^\top A$ must be invertible.
- Its eigenvalues $\lambda_1, \lambda_2$ must **not be too small** (enough gradient).
- The ratio $\lambda_1/\lambda_2$ must **not be too large** (well-conditioned; both directions have gradient).

⇒ **Corners are good to track**; flat regions (no gradient) and edges (one dominant eigenvalue) are bad. This is exactly the Harris cornerness criterion — Tomasi & Kanade's "good features to track."

### 3.6 When LK fails
Lighting changes, large movement (>1px), specularities, no good features, aperture problem. "Estimating motion is very challenging, even today."

---

## 4. Coarse-to-Fine (Pyramid) Optical Flow

Large motion breaks the small-motion assumption. Fix by working on a **Gaussian pyramid**:

1. Build Gaussian pyramids of frame $t$ and $t+1$.
2. At the **top (coarsest)** level, run LK → a coarse flow field.
3. **Warp** frame $t$ toward frame $t+1$ by that flow; re-run LK on the warped pair; iterate to convergence.
4. **Upsample** the flow to the next-finer level as the initial guess; repeat down to full resolution.

This propagates a rough large displacement from coarse levels down to refine at fine levels — LK **with pyramids** succeeds where plain LK fails on large motion.

---

## 5. Evaluating Optical Flow

- **Middlebury flow** (vision.middlebury.edu/flow) — standard benchmark with ground truth.
- **KITTI 2015** scene flow.
- **MPI Sintel** dataset.

Compare predicted flow to ground-truth flow (e.g., average endpoint error).

---

## 6. Summary

- Optical flow = per-pixel motion; computed by LK from brightness constancy + spatial coherence.
- Single pixel is ambiguous (aperture problem); solve over a window via least squares with $A^\top A$ (the Harris structure tensor).
- Track **corners** (good features); handle large motion with **coarse-to-fine** pyramids.
- Major contributors: Lucas, Tomasi, Kanade (KLT tracker).

> **Core equation:** $I_x u + I_y v = -I_t$, solved as $\mathbf{d} = (A^\top A)^{-1}A^\top\mathbf{b}$ over a window.

---

## 7. Horn–Schunck: Global Optical Flow

Lucas–Kanade is **local** (per window). **Horn–Schunck** (1981) is **global**: it assumes the flow is smooth everywhere and minimizes an energy combining a data term and a smoothness term:

$$E = \iint \big(I_x u + I_y v + I_t\big)^2 + \lambda\big((\nabla u)^2 + (\nabla v)^2\big)\,dx\,dy$$

- The first term enforces brightness constancy; the second penalizes large spatial derivatives of the flow (smoothness).
- Solved iteratively (e.g., via Jacobi/Gauss–Seidel). Fills **dense** flow even in textureless regions (at the cost of oversmoothing boundaries).

| | Lucas–Kanade | Horn–Schunck |
|---|---|---|
| Scope | local window | global |
| Output | sparse/dense (per window) | dense |
| Needs | good features (corners) | smoothness prior |

---

## 8. The Aperture Problem (Formal)

Along an edge, the gradient is perpendicular to the edge; brightness constancy only constrains the flow component **along the gradient**:

$$I_x u + I_y v = -I_t \quad\Rightarrow\quad \text{only } (u,v)\cdot\frac{(I_x,I_y)}{\|(I_x,I_y)\|} \text{ is determined}$$

The component parallel to the edge is unconstrained → the true motion is ambiguous through a small aperture. Resolving it requires integrating over a neighborhood (LK) or multiple orientations.

---

## 9. Multi-Scale Refinement

Plain LK fails when motion exceeds ~1 px. Coarse-to-fine pyramids (§5) estimate a rough flow at low resolution, warp, then refine at higher resolution — effectively handling large displacements while keeping each LK step small.

---

## 10. Evaluation & Modern Methods

- **Metrics**: **EPE** (endpoint error, mean $\|\text{flow}_{\text{pred}}-\text{flow}_{\text{gt}}\|$); **Fl-all** (percentage of pixels with EPE > 3 or > 5%).
- **Benchmarks**: Middlebury, KITTI (driving), MPI Sintel (synthetic, large motion/occlusion).
- **Deep methods**: FlowNet (CNN regressor), **RAFT** (recurrent all-pairs + iterative refinement) now surpass classical LK by large margins — but LK remains the conceptual foundation and is still used for feature tracking (KLT).

> Optical flow = dense motion field from brightness constancy + spatial coherence; classical (LK/HS) vs. modern (RAFT) — the math in §3 is where both begin.
