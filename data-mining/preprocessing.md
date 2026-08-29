# Data Preprocessing

Data preprocessing is often the most time-consuming phase of a real data-mining project — dirty, incomplete, and inconsistent data are the norm, not the exception. The major tasks are:

1. **Data cleaning** — fill missing values, smooth noise, identify/remove outliers, resolve inconsistencies.
2. **Data integration** — combine multiple sources; resolve redundancies and conflicts.
3. **Data reduction** — obtain a reduced representation that is much smaller but yields similar results.
4. **Data transformation & discretization** — normalize, aggregate, and discretize.

## 1. Data Cleaning

### 1.1 Missing Values
Strategies:
1. **Ignore the tuple** (listwise deletion) — only if few tuples have missing values.
2. **Fill manually** — costly, rarely feasible at scale.
3. **Global constant** (e.g., "Unknown"/"N/A") — may mislead; creates an artificial category.
4. **Attribute mean / mode** — simple, but reduces variance and may bias.
5. **Most probable value** — infer via regression, decision tree, or Bayesian method.

### 1.2 Noisy Data (Smoothing)
- **Binning**: sort values, partition into equal-width or equal-depth bins, then replace each value by bin **mean**, **median**, or **boundaries** (smoothing by bin boundaries snaps to nearest edge).
- **Regression**: fit a linear/multiple-regression function to "smooth" via expected value.
- **Clustering**: group similar values; values far from cluster centers treated as outliers/noise.
- **Human/ML inspection**: correct obvious errors.

### 1.3 Outliers and Inconsistencies
- Detect with boxplots (IQR rule), clustering, or deviation-based methods (see Ch. 11).
- Resolve inconsistencies (e.g., "NY" vs "New York") via domain knowledge or dictionary.

## 2. Data Integration

### Why Integrate?
Combine data from multiple DBs, files, OLTP systems, or the web. Problems to handle:

| Issue | Description | Remedy |
|---|---|---|
| **Entity resolution** | same real-world object, different IDs | match & merge keys |
| **Redundant attributes** | same info under different names | correlation analysis, remove |
| **Inconsistent naming/units** | "kg" vs "lb", "M"/"F" vs "1"/"0" | standardize |
| **Schema/value conflicts** | different representation | reconciliation |

### Correlation Detects Redundancy
- For **numeric** attributes use **$\chi^2$ test** or **covariance/correlation**:
  $$\mathrm{Cov}(A,B)=\frac{1}{n}\sum_{i=1}^{n}(a_i-\bar a)(b_i-\bar b)$$
  High absolute correlation $\Rightarrow$ one attribute may be redundant.
- For **nominal** attributes use the **$\chi^2$ statistic**:
  $$\chi^2 = \sum_{i}\sum_{j} \frac{(O_{ij}-E_{ij})^2}{E_{ij}}$$
  Large $\chi^2$ ⇒ attributes are (statistically) associated ⇒ possible redundancy.

### Tuple Duplication
Detect and remove duplicate / "dangling" records produced during integration.

## 3. Data Reduction

Goal: reduce volume while preserving analytic quality. Strategies:

### 3.1 Dimensionality Reduction
- **PCA (Principal Component Analysis)**: find orthogonal axes (principal components) of maximal variance; project onto top-$k$ components. Removes correlated dimensions.
  - Eigenvectors of covariance matrix = directions; eigenvalues = variance explained.
- **SVD (Singular Value Decomposition)**: $X = U\Sigma V^T$; keep largest singular values.
- **Feature subset selection**: choose a representative subset of $d$ original attributes.
  - **Forward selection**: start empty, add best attribute.
  - **Backward elimination**: start full, remove worst.
  - **Combine forward & backward**.
  - **Decision-tree / entropy-based** pruning can also rank features.
- **Wavelet transforms**: multi-resolution representation (useful for signals/streams).

### 3.2 Numerosity Reduction
Replace data by smaller representation:
- **Parametric**: fit a model (regression, log-linear) and store only parameters.
- **Non-parametric**:
  - **Histogram**: equal-width / equal-frequency / V-Optimal bins.
  - **Clustering**: store cluster prototypes instead of points.
  - **Sampling**:
    - **Simple random** (with/without replacement)
    - **Cluster sampling**: sample whole clusters.
    - **Stratified sampling**: sample within strata (proportions preserved) — usually best representation.

### 3.3 Data Compression
- **Lossless**: string compression, etc. (exact reconstruction).
- **Lossy**: wavelets, PCA, quantization — acceptable when small info loss ok.

## 4. Data Transformation & Discretization

### 4.1 Normalization (Feature Scaling)
Critical when attributes have different ranges/scales (distance/ML sensitive).

| Method | Formula | Notes |
|---|---|---|
| **Min-max** | $v' = \frac{v-\min}{\max-\min}(newMax-newMin)+newMin$ (usually → $[0,1]$) | preserves distribution; fails if new data outside $[min,max]$ |
| **Z-score (standardization)** | $v' = \frac{v-\mu}{\sigma}$ | mean 0, std 1; robust to outliers if $\sigma$ is |
| **Decimal scaling** | $v' = v/10^j$ where $j=\lceil\log_{10}(\max|v|)\rceil$ | maps into $[-1,1]$ |

### 4.2 Aggregation
Sum/avg/count over groups (e.g., daily → monthly). Reduces data, stabilizes, and provides a higher abstraction level (cube-friendly).

### 4.3 Discretization (Binning / Binning of Continuous)
Convert continuous attribute into intervals (categorical ordinals).

- **Equal-width binning**: each bin has same interval length $\frac{max-min}{k}$. Sensitive to outliers; may create empty bins.
- **Equal-frequency (equidepth) binning**: each bin has ~same number of tuples. Robust to outliers.
- **Cluster-based**: bins = clusters from k-means.
- **Supervised / top-down split**: use class labels to choose split points that maximize **entropy gain** / minimize impurity.
  - **Chi-merge**: bottom-up merge of adjacent intervals while $\chi^2$ < threshold.

### 4.4 Concept Hierarchy Generation
Map low-level values to higher conceptual levels automatically, e.g.,
`street → city → province → country`, or `22 → "young adult"`.
- Methods: by explicit schema, by data aggregation (group-by counts), or by (semi-)automatic clustering of values.

## Comparison of Reduction Techniques

| Technique | Type | Pros | Cons |
|---|---|---|---|
| PCA / SVD | dimensionality | removes correlation, small error | components hard to interpret |
| Feature selection | dimensionality | keeps original semantics | may miss interactions |
| Histogram | numerosity | fast, simple | coarse |
| Sampling | numerosity | very scalable | sampling error |
| Clustering prototype | numerosity | preserves shape | needs good clustering |

## Worked Normalization Example

Attribute `income` over 4 records: $\{40k, 60k, 80k, 100k\}$ (min=40k, max=100k, mean=70k, std≈24.5k).

- **Min-max → [0,1]**: $40k→0,\ 60k→0.33,\ 80k→0.67,\ 100k→1$.
- **Z-score**: $40k→-1.22,\ 60k→-0.41,\ 80k→0.41,\ 100k→1.22$ (mean 0, std 1).
- **Decimal scaling** (max=100k): divide by $10^5$ ⇒ $\{0.4,0.6,0.8,1.0\}$.

Always normalize **before** distance-based methods and classifiers sensitive to scale (k-NN, SVM, neural nets, k-means).

## Feature Subset Selection Detail

- **Wrapper**: use the target learner's accuracy to score subsets (accurate but costly).
- **Filter**: use intrinsic measures (information gain, correlation, $\chi^2$) independent of the learner (fast, scalable).
- **Embedded**: selection happens inside training (decision-tree splitting, L1/LASSO regularization).
- **CFS (Correlation-based Feature Selection)**: prefers subsets highly correlated with class but mutually uncorrelated.

## Discretization Example (Entropy-Based)

To split `temperature` for a binary class, try cut points; pick the cut that yields the largest **information gain** $Gain = Entropy(parent) - \sum_j \frac{|D_j|}{|D|}Entropy(D_j)$. **Chi-merge** then iteratively merges adjacent intervals while the $\chi^2$ test says they are not significantly different — producing interpretable, class-aware bins.

## Typical Preprocessing Pipeline (Order)

1. Integrate sources → resolve keys/units.
2. Clean missing & noisy values.
3. Remove duplicates & inconsistencies.
4. Normalize / transform attributes.
5. Reduce dimensions (PCA / feature selection) & numerosity (sampling / clustering).
6. Discretize & build concept hierarchies as needed by the miner.

Skipping steps 1–3 corrupts everything downstream; skipping 4–6 hurts speed/quality at scale.

## PCA — Formal Steps
1. Center data (subtract the mean per attribute).
2. Compute the covariance matrix $\Sigma = \frac{1}{n}X^TX$.
3. Eigen-decompose $\Sigma = V\Lambda V^T$; eigenvalues = variance along each eigenvector.
4. Keep the top-$k$ eigenvectors (largest eigenvalues) ⇒ projection $X_{proj}=XV_k$.
Fraction of variance retained = $\sum_{j=1}^{k}\lambda_j / \sum_j \lambda_j$ (choose $k$ to exceed ~90%).

## Duplicate & Conflict Detection
- **Record linkage**: block candidates by a cheap key, then score pairs by similarity (Jaccard on identifiers/attributes).
- **Conflict resolution**: prefer the source with higher authority, or the latest timestamp; standardize units/codes during integration.

## When to Apply Which Reduction
| Goal | Technique |
|---|---|
| remove correlation, compress | PCA / SVD |
| keep original features, drop useless | feature selection (filter/wrapper) |
| very large data, fast | sampling (stratified) |
| preserve shape | clustering prototypes |
| signals / streams | wavelets |

## Summary

Preprocessing = clean → integrate → reduce → transform. Clean missing/noisy/inconsistent data; integrate sources while removing redundancy (use $\chi^2$/correlation); reduce via dimensionality (PCA, feature selection), numerosity (histograms, sampling, clustering), or compression; transform via normalization (min-max, z-score, decimal scaling), aggregation, and discretization (equal-width, equidepth, entropy/chi-merge). Good preprocessing is decisive for the quality and speed of all downstream mining.
