# Homography and Projective Transformation

> Source: CS1674 Ch.6. A single view is ambiguous in depth; multiple views resolve 3D. This chapter covers 2D transformations, homogeneous coordinates, the **homography** (projective warp), panorama stitching, and how to estimate $H$ from correspondences (2D-DLT) with RANSAC.

## 1. Why Multiple Views?

Structure and depth are inherently ambiguous from a single image. Two (or more) views of the same object let us recover geometry. The alignment problem: given matched feature pairs $\mathbf{x}_i \leftrightarrow \mathbf{x}_i'$, **what transformation $T$ relates them?** We fit $T$'s parameters to the correspondences. The canonical application is **image mosaics / panorama stitching**.

## 2. 2D Transformations

A transformation is a coordinate-changing machine $\mathbf{p}' = T(\mathbf{p})$, global (same for every point) and described by few parameters. As a matrix: $\mathbf{p}' = M\mathbf{p}$.

### 2.1 Linear 2D transformations (2×2)

These are combinations of scale, rotation, shear, mirror — **but not translation**.

| Transform | Matrix | Effect |
|---|---|---|
| Scaling (uniform) | $\mathrm{diag}(a,a)$ | Multiply both axes by $a$ |
| Scaling (non-uniform) | $\begin{bmatrix}a&0\\0&b\end{bmatrix}$ | Different scale per axis |
| Rotation | $\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}$ | Rotate about origin; $\theta=90^\circ\!\Rightarrow\! x'=-y, y'=x$ |
| Shear | $\begin{bmatrix}1&sh_x\\sh_y&1\end{bmatrix}$ | Slant |
| Mirror (Y-axis) | $\begin{bmatrix}-1&0\\0&1\end{bmatrix}$ | Flip |
| Mirror (origin) | $\begin{bmatrix}-1&0\\0&-1\end{bmatrix}$ | Rotate 180° |

### 2.2 Translation needs homogeneous coordinates

Translation $\mathbf{p}' = \mathbf{p} + \mathbf{t}$ is **non-linear in 2D** — it cannot be written as a 2×2 matrix multiply. Solution: **homogeneous coordinates** $(x, y) \to (x, y, 1)$, with the rule:

$$(x, y, w) \equiv \left(\frac{x}{w}, \frac{y}{w}, 1\right)$$

So a 2D point is represented by a 3-vector; to recover image coords divide by $w$.

### 2.3 2D Affine transformations (3×3)

Affine = linear transform + translation. Written in homogeneous form with last row $[0\ 0\ 1]$:

$$
\begin{bmatrix}x'\\y'\\1\end{bmatrix}
=
\begin{bmatrix}
a & b & t_x\\
c & d & t_y\\
0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}x\\y\\1\end{bmatrix}
$$

Properties: maps lines to lines; **parallel lines stay parallel**.

### 2.4 2D Projective transformations — Homography (3×3)

Projective = affine + projective warp. General 3×3 matrix:

$$
\begin{bmatrix}x'\\y'\\w'\end{bmatrix}
=
\underbrace{
\begin{bmatrix}
h_1 & h_2 & h_3\\
h_4 & h_5 & h_6\\
h_7 & h_8 & h_9
\end{bmatrix}}_{H}
\begin{bmatrix}x\\y\\1\end{bmatrix}
\quad\Rightarrow\quad
(x', y') = \left(\frac{h_1x+h_2y+h_3}{h_7x+h_8y+h_9},\ \frac{h_4x+h_5y+h_6}{h_7x+h_8y+h_9}\right)
$$

A **homography** is a mapping between two projective planes with the same center of projection. **Parallel lines need NOT remain parallel** (they meet at a vanishing point). Also called a **projective transformation**.

> Hierarchy: Linear ⊂ Affine ⊂ Projective. Degrees of freedom — Linear 4, Affine 6, Projective (homography) 8 (after fixing scale).

---

## 3. Panorama Stitching — Motivation

When the camera rotates about its **optical center** (no translation), the images are related by a homography. Stitching them reprojects all images onto a **common plane**, forming a synthetic wide-angle view (mosaic).

### Basic procedure
1. Capture a sequence from the same position, rotating about the optical center.
2. Compute the homography between consecutive images.
3. Warp/compose images onto a common canvas.
4. Blend to create the mosaic.
5. Repeat for more images.

---

## 4. Computing the Homography (2D-DLT)

Given $n \ge 4$ matched point pairs $(\mathbf{x}_i, \mathbf{x}_i')$, set up equations with $H$'s entries as unknowns. Because $H$ is defined up to scale, **fix $h_9 = 1$** → 8 unknowns, needing ≥ 8 linear equations (i.e., **at least 4 point correspondences**).

For one correspondence $(x,y)\leftrightarrow(x',y')$:

$$
\begin{aligned}
x' &= \frac{h_1x+h_2y+h_3}{h_7x+h_8y+1}, &
y' &= \frac{h_4x+h_5y+h_6}{h_7x+h_8y+1}
\end{aligned}
$$

Cross-multiplying gives two linear equations in the 8 unknowns:

$$
\begin{bmatrix}
x & y & 1 & 0 & 0 & 0 & -x'x & -x'y\\
0 & 0 & 0 & x & y & 1 & -y'x & -y'y
\end{bmatrix}
\begin{bmatrix}h_1\\h_2\\h_3\\h_4\\h_5\\h_6\\h_7\\h_8\end{bmatrix}
=
\begin{bmatrix}x'\\y'\end{bmatrix}
$$

Stack all $n$ pairs into $A\mathbf{h} = \mathbf{b}$ with $A \in \mathbb{R}^{2n\times 8}$.

### Solving
- **Overdetermined** ($n>4$): least squares $\mathbf{h}^* = (A^\top A)^{-1} A^\top \mathbf{b}$.
- **Homogeneous form** (don't fix $h_9$, use $A\mathbf{h}=0$): the solution is the **unit-norm eigenvector of $A^\top A$ with the smallest eigenvalue**:

$$\min_{\|\mathbf{h}\|=1} \|\!A\mathbf{h}\|^2 \;\Rightarrow\; \mathbf{h} = \mathbf{v}_1,\ \lambda_1 = \min \lambda$$

This is the classic **Direct Linear Transform (DLT)**.

---

## 5. Applying a Homography (Image Warping)

Given $H$ and image 1, produce image 2 on a shared canvas.

### 5.1 Forward warping
Send each pixel $\mathbf{p}$ of image 1 to $\mathbf{p}' = H\mathbf{p}$ in image 2's canvas. Problem: pixels may land *between* integer locations → round or distribute (splat) the color. Can leave holes.

### 5.2 Inverse warping (preferred)
For each output pixel $\mathbf{p}'$ in image 2, fetch its source by $(x,y) = H^{-1}\mathbf{p}'$. If it falls between pixels in image 1, **interpolate** (bilinear). Avoids holes; standard for mosaics.

---

## 6. Dealing with Outliers: RANSAC for Homography

Matched points always contain errors/outliers. RANSAC:
1. Sample 4 matched pairs, compute $H$.
2. Warp image 1 by $H$; measure reprojection error for every point.
3. Count inliers (error < threshold).
4. Repeat; keep $H$ with most inliers; refit with all inliers.
(Hough voting on translation is the simpler special case when only $\mathbf{t}$ is unknown.)

---

## 7. Assembling the Panorama

- **Chain stitching**: img1 $\xrightarrow{H_{12}}$ img2 $\xrightarrow{H_{23}}$ img3 … Each $H_{i,i+1}$ is a pairwise homography. Simple but error accumulates (**drift**).
- **Drift correction**: add a copy of the first image at the end and optimize global homographies $H_i$ (to the plane of the first image) so the loop closes. This removes accumulated misalignment.
- **Blending**: seamlessly combine overlapping regions. Simple method — **feathering**:

$$\text{output} = (1-\alpha)\,\text{img}_1 + \alpha\,\text{img}_2, \qquad \alpha \in [0,1]$$

(a linear cross-dissolve across the overlap). More advanced: Laplacian pyramid blending (Ch.3).

---

## 8. Summary

| Concept | Key point |
|---|---|
| Homogeneous coords | Encode translation as matrix mult via $(x,y,1)$ |
| Affine | 3×3, last row $[0\ 0\ 1]$; preserves parallelism |
| Homography | 3×3 general; 8 DOF; relates views from same center |
| Estimation | 2D-DLT, ≥4 correspondences, least squares / smallest eigenvector |
| Warping | Prefer inverse warping + interpolation |
| Robustness | RANSAC to reject outlier matches |
| Mosaic | chain + drift correction + feathering blend |

> **Bottom line:** write 2D transformations as matrix–vector multiplies in homogeneous coordinates; fit them from correspondences; use RANSAC; stitch via homography + inverse warping + blending.
