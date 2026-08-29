# Tracking

> Source: CS1674 Ch.9. Track objects across frames using (1) **KLT** feature tracking, (2) **Mean-Shift** mode-seeking, and (3) **Kalman filtering** for prediction under occlusion.

## 1. KLT Tracking (Kanade–Lucas–Tomasi)

History: Lucas & Kanade (1981, LK optical flow estimator) + Tomasi & Kanade (1991, good features to track). KLT = **K**anade–**L**ucas–**T**omasi.

### 1.1 KLT tracking algorithm
1. Find **corners** inside the object's bounding box / segmentation.
2. For each corner, compute displacement $(u,v)$ to the next frame using the **Lucas–Kanade** estimator; update corner positions.
3. Use **RANSAC** (or similar) to estimate a geometric transformation (translation / affine / homography) from the matched points.
4. Apply that transformation to the object's bounding box / segmentation.
5. (Optional) add more corner points every $m$ frames.
6. Repeat 2–5 to produce trajectories of the bounding box / segmentation over time.

> With enough matched features across two images, tracking becomes accurate; **tracking-by-detection-and-matching** is also valid (detect + match + geometric verification per frame).

---

## 2. Mean-Shift Tracking (Fukunaga & Hostetler 1975)

A **mode-seeking** algorithm: find the region of highest density of a feature distribution.

### 2.1 Intuition
Repeatedly: pick a point → draw a window → compute the (weighted) mean of the data in the window → **shift the window** to that mean → repeat until convergence. The window climbs the density gradient to the nearest mode.

### 2.2 Applied to tracking
When the object moves between frames, the window (placed at the previous location) no longer focuses on the dense region; mean-shift refines it to the best candidate location.

**Algorithm:**
1. **Initialize** — in frame 1, select the target region; compute a **color histogram**, weighting pixels near the center more (via a kernel function, e.g., Epanechnikov/Gaussian).
2. **Start tracking** — in the next frame, place the window at the previous object location.
3. **Compute weights** — compare each pixel's appearance (histogram/descriptor) to the target; assign higher weights to pixels that match the target better.
4. **Shift the window** — compute the **weighted average position** (the mean-shift vector) of matching pixels; move the window there.
5. **Iterate** steps 3–4 until the window position converges (stops moving).

**Why it works:** there is an implicit objective (the density/Bhattacharyya cost); each shift step performs gradient ascent on it. It is robust to small deformations and partial appearance change.

---

## 3. Kalman Filter (Prediction under Occlusion)

When objects are **heavily occluded**, detection-and-matching fails. **Tracking by prediction** takes over: the **Kalman filter** predicts the next state from past motion and corrects it using residuals between prediction and observation.

### 3.1 State-space model (linear, Gaussian)

- **State equation** (prediction): $\mathbf{x}_k = F_k \mathbf{x}_{k-1} + B_k \mathbf{u}_k + \mathbf{w}_k$, $\mathbf{w}_k \sim \mathcal{N}(0, Q_k)$
- **Observation equation** (update): $\mathbf{z}_k = H_k \mathbf{x}_k + \mathbf{v}_k$, $\mathbf{v}_k \sim \mathcal{N}(0, R_k)$

where $\mathbf{x}$ = state (e.g., position + velocity), $F$ = state transition, $H$ = observation matrix, $Q,R$ = process/measurement noise covariances.

### 3.2 Two-step recursion

**Predict:**
$$\hat{\mathbf{x}}_{k|k-1} = F_k \hat{\mathbf{x}}_{k-1|k-1}$$
$$P_{k|k-1} = F_k P_{k-1|k-1} F_k^\top + Q_k$$

**Update (with innovation $\mathbf{y}_k = \mathbf{z}_k - H_k \hat{\mathbf{x}}_{k|k-1}$):**
$$S_k = H_k P_{k|k-1} H_k^\top + R_k$$
$$K_k = P_{k|k-1} H_k^\top S_k^{-1} \qquad\text{(Kalman gain)}$$
$$\hat{\mathbf{x}}_{k|k} = \hat{\mathbf{x}}_{k|k-1} + K_k \mathbf{y}_k$$
$$P_{k|k} = (I - K_k H_k) P_{k|k-1}$$

The Kalman gain $K_k$ optimally trades prediction uncertainty ($P$) against measurement noise ($R$): when measurements are reliable, $K_k\to H^{-1}$ (trust observation); when noisy, $K_k\to 0$ (trust prediction). This lets tracking continue smoothly through brief occlusions.

---

## 4. Summary

| Method | Type | Best when |
|---|---|---|
| **KLT** | Feature-based | Good corners, small motion, need trajectories |
| **Mean-Shift** | Mode-seeking (histogram) | Appearance described by color/descriptor density |
| **Kalman** | Predictive filter | Occlusion / missing detections; smooth motion |

> Track by: detecting good features (KLT), seeking the appearance mode (Mean-Shift), or predicting-through-occlusion (Kalman). Choose by whether you have reliable detections and how noisy the motion is.

---

## 5. Mean-Shift: The Math

The mean-shift vector points toward the **mode** of the density estimated with a kernel $K$:

$$m(x) = \frac{\sum_i K(x_i - x)\, (x_i - x)}{\sum_i K(x_i - x)}$$

Iterate $x \leftarrow x + m(x)$ until convergence. With a profile function $k(\|x\|^2)$ (e.g., Epanechnikov, Gaussian), the kernel weights nearby samples more. In tracking, $x$ is the window center and the samples are pixels weighted by how well they match the target histogram (Bhattacharyya coefficient). Each shift performs gradient ascent on the similarity surface.

### Why it tracks
There is an implicit objective (the density/Bhattacharyya cost); each shift step ascends it. It is robust to small deformations and partial appearance change because it only needs the **mode** of matching pixels, not an exact template.

---

## 6. Kalman Filter: A Concrete 2D Example

Model a point moving with **constant velocity** in 2D. State $\mathbf{x} = [x, y, v_x, v_y]^\top$.

- **Transition**: $F = \begin{bmatrix}1&0&\Delta t&0\\0&1&0&\Delta t\\0&0&1&0\\0&0&0&1\end{bmatrix}$, $\mathbf{x}_k = F\mathbf{x}_{k-1} + \mathbf{w}_k$.
- **Observation**: we only see position, $H = [I_2\ \ 0]$, $\mathbf{z}_k = H\mathbf{x}_k + \mathbf{v}_k$.

Run predict → update each frame. During an occlusion (no detection), skip the update and keep predicting with $F$; when the detection returns, the update corrects the drift. The gain $K_k$ automatically balances trust between prediction and measurement based on their covariances $P, R$.

---

## 7. Comparison & When to Use Each

| Method | Needs | Best for | Failure mode |
|---|---|---|---|
| **KLT** | good corners, small motion | pointwise trajectories, SLAM | drifts, dies on no-feature regions |
| **Mean-Shift** | appearance histogram | single-object, color/texture mode | loses target on fast motion, similar distractors |
| **Kalman** | motion model | smoothing through occlusion | wrong model → divergence |

### Multiple Object Tracking (MOT)
Combine detection + data association (Hungarian assignment / IoU/graph matching) across frames, often with a Kalman filter per track to bridge missed detections.

### Applications
Surveillance, sports analytics, autonomous driving (track cars/pedestrians), AR/VR, robotics manipulation, video editing (rotoscoping).

> **Rule of thumb:** use KLT for sparse feature trajectories, Mean-Shift for single-object appearance tracking, and Kalman (or a particle filter) when you must **predict through missing/occluded observations**.

---

## 8. Particle Filter (Optional Extension)

When the motion/observation model is **non-linear/non-Gaussian**, the Kalman filter's Gaussian assumption breaks. A **particle filter** represents the posterior over states by a set of weighted samples ("particles"):
1. **Predict**: propagate each particle by the motion model + noise.
2. **Update**: weight each particle by how well it matches the observation (likelihood).
3. **Resample**: draw new particles proportional to weights.

This handles multi-modal distributions (e.g., when a target could be in either of two corridors) that a single Gaussian Kalman filter cannot represent.

---

## 9. Evaluating Trackers

- **MOTA / MOTP** (Multiple Object Tracking Accuracy/Precision): aggregate over frames; MOTA counts misses, false positives, and ID switches; MOTP measures bounding-box overlap.
- **Track continuity**: penalize **ID switches** (a track changing its object identity).
- **Robustness**: performance under occlusion, fast motion, and distractors.

> Tracking is fundamentally **state estimation over time**; KLT, Mean-Shift, and Kalman/particle filters are three tools trading off speed, appearance modeling, and robustness to missing data.
