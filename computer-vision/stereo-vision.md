# Stereo Vision

> Source: CS1674 Ch.7. Homography relates views from the *same* camera center (rotation only). **Stereo vision** uses *different* camera centers to recover depth from disparity, governed by **epipolar geometry**.

## 1. Homography vs. Stereo

| | Camera centers | Transform | Goal |
|---|---|---|---|
| Homography | Same (rotation only) | Projective warp | Mosaic/stitching |
| Stereo | Different | Epipolar geometry | Depth recovery |

Stereo = two (or more) cameras with a **baseline** $B$ between centers; depth is recovered from the shift (disparity) between corresponding points.

---

## 2. Depth from Stereo

Two cameras capture the same 3D point $X$ from slightly different viewpoints. Goal: given a point $x$ in the left image, find its match $x'$ in the right image, then recover depth $Z$.

### Sub-problems
1. **Calibration** — recover the relative camera poses (if unknown).
2. **Correspondence** — find the matching point $x'$.
3. **Depth estimation** — convert the match into depth.

---

## 3. Epipolar Geometry

- **Baseline**: line connecting the two camera centers $C, C'$.
- **Epipoles $e, e'$**: projections of one camera center into the *other* image (intersections of the baseline with the image planes).
- **Epipolar plane**: the plane containing the baseline and the 3D point $X$.
- **Epipolar lines**: intersections of the epipolar plane with the two image planes; they come in corresponding pairs.

### The epipolar constraint
The match $x'$ for a point $x$ **must lie on the epipolar line** $l'$ in the second image. This reduces the correspondence search from 2D (whole image) to **1D (along a line)**.

For calibrated cameras this constraint is encoded by the **fundamental matrix** $F$ (and essential matrix $E$ for calibrated):

$$x'^\top F x = 0$$

(The 8-point algorithm estimates $F$ from ≥8 correspondences, analogous to the homography DLT.)

---

## 4. Rectified Stereo (Parallel Cameras)

If the cameras are **calibrated and their optical axes are parallel** (rectified), the epipolar lines are **horizontal scanlines** — the match for $(x,y)$ lies on the same row $y$ in the other image.

### 4.1 Disparity and depth

Using similar triangles for the two camera projection centers ($O_l, O_r$) and point $P$:

$$\frac{T}{Z} = \frac{x - x'}{f} \quad\Rightarrow\quad Z = \frac{f\,T}{x - x'}$$

Define **disparity** $d = x - x'$ (also $d = x_l - x_r$). Then:

$$\boxed{Z = \frac{f\,T}{d}}$$

- **Depth is inversely proportional to disparity**: nearby objects have large disparity; far objects have small disparity.
- Disparity map $D(x,y)$: $D(x,y) = x - x'$, and $(x', y') = (x + D(x,y),\, y)$ for rectified stereo.

---

## 5. Basic Stereo Matching Algorithm

For each pixel $(x,y)$ in the left image:
1. Find the corresponding **epipolar scanline** in the right image.
2. Slide a window along that line; compute a matching cost (e.g., **Euclidean/SSD** distance) between the window contents.
3. Pick the position with the minimum cost → match $x'$.
4. Compute disparity $d = x - x'$ and set $\text{depth}(x,y) = fT/d$.

> This window-based matching yields a **disparity map**, from which a depth map is derived. Ground-truth depth is used to evaluate.

---

## 6. Summary (Rectified Stereo)

- Epipoles are where the baseline meets the image planes; the matching point lies on the line through its epipole.
- Epipolar constraint makes correspondence a **1D search** along the epipolar line (horizontal for rectified/parallel cameras).
- Find corresponding points along the epipolar scanline → disparity → **depth = $fT/d$** (inverse relationship).

> **Key formula to memorize:** $Z = fT/d$. Stereo is essentially "depth from disparity," and disparity is found by 1D search constrained by epipolar geometry.

---

## 7. Stereo Matching Costs

For each pixel in the left image, search along the epipolar line in the right image. The match minimizes a **cost** between windows:

- **SSD** (sum of squared differences): $C(d) = \sum_{(x,y)\in W} (I_L(x,y) - I_R(x+d,y))^2$
- **SAD** (sum of absolute differences): $C(d) = \sum |I_L - I_R|$
- **NCC** (normalized cross-correlation): invariant to affine brightness changes:

$$\text{NCC}(d) = \frac{\sum (I_L-\bar I_L)(I_R(d)-\bar I_R)}{\sqrt{\sum(I_L-\bar I_L)^2\sum(I_R(d)-\bar I_R)^2}}$$

Pick $d^* = \arg\min C(d)$ (or $\arg\max$ NCC).

### Occlusions & ordering
- **Occlusion**: a point visible in one view may be hidden in the other → no valid match. Handle with left-right consistency checks.
- **Ordering constraint**: along a scanline, matches preserve order (mostly); violations signal occlusions/discretization errors.

---

## 8. Rectification

To make the epipolar lines horizontal scanlines, **rectify** the pair:
1. Estimate the camera matrices (calibration) or the fundamental matrix.
2. Rotate both cameras so their image planes are coplanar and parallel → epipolar lines align horizontally.
Rectification turns a 2D search into a 1D search, drastically speeding up matching.

---

## 9. Calibration & the Epipolar Matrix

Given calibrated cameras with projection $P = K[R\mid t]$, the **essential matrix** $E$ (metric) and **fundamental matrix** $F$ (pixel) relate corresponding points:

$$x'^\top F x = 0, \qquad E = K'^\top F K, \qquad E \sim t_\times R$$

$F$ (8-point algorithm, DLT) fully encodes the epipolar geometry: its epipoles and epipolar lines. Stereo depth can also be recovered from $F/E$ + known intrinsics.

---

## 10. Beyond Two Views: Multi-View Stereo (MVS)

- **MVS**: fuse many images from different viewpoints into a dense 3D point cloud / mesh (used in photogrammetry, SLAM, NeRF pipelines).
- **Active stereo / structured light**: project known patterns (e.g., Kinect dot pattern) to resolve ambiguities and handle textureless surfaces.
- **Time-of-flight / LiDAR**: directly measure depth (complementary to passive stereo).

---

## 11. Real Systems & Limitations

- **Datasets**: KITTI (driving), Middlebury, Scene Flow — benchmark disparity estimation.
- **Limitations**: fails on textureless regions, repetitive patterns, specular surfaces, and large untextured areas; needs calibration/rectification; disparity is bounded by image resolution (far objects → tiny disparity → noisy depth).

| Method | Pros | Cons |
|---|---|---|
| Passive stereo | cheap, passive | needs texture, calibration |
| Structured light | works on textureless | limited range, ambient light |
| ToF/LiDAR | direct depth | cost, sparsity, power |

> Stereo gives **dense depth from passive cameras**, but every step (rectification, matching, disparity→depth) introduces error — the final depth quality is only as good as the weakest link.

---

## 12. From Disparity to 3D Point Cloud

Once disparity $d(x,y)$ is known, back-project each pixel to 3D (using the camera intrinsics and baseline). A pixel at image coordinate $(x,y)$ with disparity $d$ has:

$$Z = \frac{fT}{d}, \quad X = \frac{(x - c_x)Z}{f}, \quad Y = \frac{(y - c_y)Z}{f}$$

where $(c_x,c_y)$ is the principal point. Stacking these gives a **point cloud** — the basis of stereo reconstruction, SLAM, and 3D mapping.

---

## 13. Depth Sensors Compared

| Sensor | Principle | Range / notes |
|---|---|---|
| Passive stereo | two cameras + matching | unlimited range, needs texture |
| Active stereo / structured light | projected pattern | short–mid range, textureless OK |
| ToF | round-trip light time | mid range, ambient-light sensitive |
| LiDAR | scanning laser | long range, sparse, expensive |

> Stereo is the **cheapest passive** route to dense depth, but it is fundamentally a matching problem — its accuracy is bounded by texture, calibration, and the resolution of the disparity map.
