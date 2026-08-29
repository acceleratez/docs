# Feature Description and Matching

> Source: CS1674 Ch.5. After detecting interest points, we must *describe* them with a vector and *match* those vectors across images. Core method: SIFT. Plus efficient matching via visual words (bag-of-words).

## 1. The Detection → Description → Matching Pipeline

1. **Detection**: identify interest points (e.g., Harris corners, DoG extrema).
2. **Description**: extract a vector descriptor around each interest point.
3. **Matching**: determine correspondences between descriptors in two views.

$$
\mathbf{x}_1^{(1)} = [x_1, y_1, \dots] \xrightarrow{\text{detect+describe}} \mathbf{f}_1 \in \mathbb{R}^D, \qquad \mathbf{x}_1^{(2)} \xrightarrow{} \mathbf{f}_2
$$

The descriptor must balance two competing goals:

| Goal | Meaning |
|---|---|
| **Invariance** | The descriptor should *not* change when the image undergoes a transformation. |
| **Discriminability** | The descriptor should be *unique* to its interest point (avoid false matches). |

### 1.1 Transformations we want to handle

- **Geometric**: translation, rotation, scale, affine, viewpoint (up to ~60° out-of-plane).
- **Photometric**: brightness, contrast, color changes.

---

## 2. SIFT Descriptor (Lowe 2004)

**Scale-Invariant Feature Transform** uses a **Histogram of Oriented Gradients (HoG)** — it captures texture and is robust to small translations / affine deformations.

### 2.1 Step 1 — gradient at each pixel

For a pixel, compute magnitude and orientation:

$$m(x,y) = \sqrt{I_x^2 + I_y^2}, \qquad \theta(x,y) = \mathrm{atan2}(I_y, I_x)$$

Worked examples:
- $I_x=-1, I_y=0 \Rightarrow m=1, \theta=0^\circ$
- $I_x=0, I_y=1 \Rightarrow m=1, \theta=90^\circ$
- $I_x=-1, I_y=-1 \Rightarrow m=\sqrt{2}\approx1.41, \theta=45^\circ$

### 2.2 Step 2 — window and cells

- Take a **16×16** square window around the detected feature.
- Divide it into a **4×4 grid of cells** (16 cells).
- Quantize each pixel's gradient orientation into one of **8 bins** ($0^\circ, 45^\circ, \dots, 315^\circ$).

### 2.3 Step 3 — weighted orientation histograms

For each cell, build an 8-bin histogram of gradient orientations, where each gradient **contributes its magnitude** (stronger edges weigh more).

- 16 cells × 8 orientations = **128-dimensional** descriptor.

### 2.4 Step 4 — normalization (critical for illumination invariance)

1. Normalize the 128-vector to **unit length**.
2. **Clip** (threshold) each component to a max of $0.2$, then **renormalize** to unit length.

The clipping reduces the influence of large gradients caused by illumination changes / non-linear contrast, while keeping the dominant structure — giving robustness to brightness/contrast shifts.

### 2.5 SIFT properties

- Handles viewpoint changes up to ~60° out-of-plane rotation.
- Handles large illumination changes (even day vs. night).
- Fast enough for moderate image sizes (<1s), though not trivially real-time on large sets.
- Extremely robust matching; lots of available implementations.
- Typically yields hundreds of features per image (e.g., 868 SIFT features shown in lecture).

---

## 3. Feature Matching

### 3.1 Nearest-neighbor matching

To match a query feature $\mathbf{f}_1$ in image 1 to image 2:
- Compute a distance (usually **SSD / Euclidean**) to every descriptor in image 2.
- Take the closest, or the closest-$k$, or those within a threshold.

### 3.2 Lowe's Ratio Test

The plain nearest neighbor is unreliable when the best match is only slightly better than the second. Define:

$$\text{ratio} = \frac{\|\mathbf{f}_1 - \mathbf{f}_2\|}{\|\mathbf{f}_1 - \mathbf{f}_2'\|}$$

where $\mathbf{f}_2$ = best SSD match and $\mathbf{f}_2'$ = second-best SSD match in image 2.

- **Large ratio** ⇒ the best match is ambiguous (many similar descriptors) → reject.
- **Small ratio** ⇒ the best match is clearly separated → accept.

Thresholding by ratio score (e.g., ratio < 0.8) dramatically cuts false matches, though some outliers remain and must be pruned later (e.g., by RANSAC + homography, Ch.6).

### 3.3 Evaluating a matcher

- Plot matches and inspect; measure false-positive / false-negative rates.
- **AUROC** (area under the ROC curve) is a principled metric: sweep the distance/ratio threshold, plot true-positive rate vs. false-positive rate.

---

## 4. Efficient Matching at Scale

Matching one image to *all frames in a video* or a *giant database* is expensive: potentially thousands of features per image × millions of images. Naive pairwise comparison is infeasible.

**Key idea**: descriptors live in a high-dimensional feature space (e.g., SIFT $\mathbb{R}^{128}$); nearby points in that space = similar local content. We can **cluster** descriptors and use distance/ANN search.

---

## 5. Visual Words / Bag-of-Words (BoW)

### 5.1 Main idea (Nistér & Stewénius 2006)

Map each high-dimensional descriptor to a discrete **visual word** by quantizing the descriptor space:

1. Cluster all training descriptors (e.g., with k-means) → $V$ cluster centers = a **visual vocabulary** of $V$ words.
2. Each local descriptor is assigned to its **nearest cluster center** → a word ID.
3. To compare images, compare word IDs instead of raw descriptors.

### 5.2 Indexing

- **Inverted index**: map each word → list of database image IDs containing it.
- For a query image, find database images that share words with it; retrieve/rank those.

### 5.3 Image representation: BoW histogram

Summarize an entire image by the **histogram of its visual-word occurrences**:

$$\mathbf{d} = [c_1, c_2, \dots, c_V], \qquad c_i = \text{count of word } i \text{ in the image}$$

This is the image analog of text "bag of words": order/geometry ignored, only word frequencies kept.

### 5.4 Similarity / ranking (Csurka et al. 2004)

Similarity between a database image $\mathbf{d}_j$ and query $\mathbf{q}$ (vocabulary size $V$):

$$\mathrm{sim}(\mathbf{d}_j, \mathbf{q}) = \frac{\sum_{i=1}^{V} d_{ji}\, q_i}{\sqrt{\sum_{i=1}^{V} d_{ji}^2}\,\sqrt{\sum_{i=1}^{V} q_i^2}}$$

i.e., the **cosine similarity** (normalized dot product) of the two word-count histograms. Rank database images by this score.

### 5.5 Pros & Cons of BoW

| Pros | Cons |
|---|---|
| Flexible to geometry / deformation / viewpoint | Ignores spatial geometry (no layout) |
| Compact summary of content | Optimal vocabulary size is unclear |
| Enables fast inverted-index search | Background/foreground mixed in whole-image bag |

> A **vocabulary tree** (hierarchical k-means) extends BoW to millions of images (Nistér & Stewénius, CVPR 2006).

---

## 6. Chapter Summary

- Describe each keypoint with a **SIFT** 128-D HoG vector; normalize + clip for photometric invariance.
- Match by nearest neighbor, but use **Lowe's ratio test** to reject ambiguous matches.
- Evaluate with **AUROC**.
- For large databases, quantize descriptors into **visual words** and represent images as **bag-of-words** histograms; rank by cosine similarity with an inverted index for speed.
