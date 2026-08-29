# Getting to Know Your Data

## Data Objects and Attribute Types

### Basic Terminology
- **Data set**: a collection of data objects (records, points, examples, instances).
- **Data object**: described by a set of **attributes** (features, variables, dimensions, fields).
- **Attribute (feature, variable)**: a data field representing a characteristic of an object. A value of an attribute can be numerical or symbolic.

### Attribute Types by Scale
| Scale | Meaning | Operations | Examples |
|---|---|---|---|
| **Nominal** | categories/names, no order | $=, \neq$, mode | color, gender, zip code |
| **Binary** (nominal with 2 states) | symmetric (both equally important) or **asymmetric** (one state rarer/more important) | $=, \neq$ | gender (symmetric), medical test +/− (asymmetric) |
| **Ordinal** | meaningful order but unknown spacing | $<, >, $ median, percentile | rank, grade, size (S/M/L) |
| **Numeric** | | | |
| &nbsp;&nbsp;— **Interval** | equal-spaced, no true zero | $+, -, $ mean, std | temperature (°C), calendar |
| &nbsp;&nbsp;— **Ratio** | true zero, ratios meaningful | $\times, \div, $ geometric mean | weight, length, counts |

- **Discrete** vs **continuous**: discrete attributes have finite/countable domains; continuous (numeric) take real values (often represented as floating-point).
- Many attributes can be of **mixed type**; type determines which similarity/distance and statistics apply.

## Describing Data: Central Tendency

- **Mean** (average): $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$. Sensitive to outliers.
- **Trimmed mean**: drop highest/lowest $k$% then average — robust to outliers.
- **Weighted mean**: $\bar{x}_w = \frac{\sum w_i x_i}{\sum w_i}$.
- **Median**: the middle value when sorted. Robust to outliers. For $n$ ordered values, position $\approx (n+1)/2$. More robust than mean for skewed data.
- **Mode**: the most frequent value. A data set can be **unimodal**, **bimodal**, or **multimodal**.
- **Midrange**: $(\max + \min)/2$.
- **Skewness** measures asymmetry:
  - **Negative skew** (left): tail to the left, mean $<$ median.
  - **Positive skew** (right): tail to the right, mean $>$ median.

## Describing Data: Dispersion

- **Range**: $\max - \min$.
- **Interquartile range (IQR)**: $IQR = Q_3 - Q_1$ (spread of middle 50%). Outlier rule: $< Q_1 - 1.5\,IQR$ or $> Q_3 + 1.5\,IQR$.
- **Variance** (population): $\sigma^2 = \frac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2$.
- **Variance** (sample): $s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$.
- **Standard deviation**: $\sigma = \sqrt{\sigma^2}$. Same units as data.
- **Mean absolute deviation (MAD)**: $\frac{1}{n}\sum |x_i - \bar{x}|$.
- **Five-number summary**: $\min,\ Q_1,\ \text{median},\ Q_3,\ \max$; visualized by a **boxplot**.
- **Data visualization**: histograms, boxplots, scatter plots, quantile plots, q-q plots, Lorenz curve (for unequal distribution / Gini).

## Graphic Displays

- **Histogram**: bar chart of value frequencies; bin width matters.
- **Boxplot**: compactly shows median, IQR, whiskers, and outliers.
- **Scatter plot**: shows correlation/relationship between two numeric attributes.
- **Loess / smoothed curve**: local regression to reveal trend.
- **Quantile plot (q-q plot)**: compare empirical distribution to a theoretical one.
- **Parallel coordinates**: each object is a polyline across axes — good for high-dimensional numeric data.

## Data Quality

| Problem | Description | Example |
|---|---|---|
| **Noise** | random error / distortion in a measured value | sensor jitter, typos |
| **Outliers** | data objects that deviate markedly from the rest | fraud, sensor fault |
| **Missing values** | not recorded / unavailable / "not applicable" | blank field |
| **Duplicate data** | repeated records (data integration) | same person twice |
| **Inconsistent** | conflicting values from different sources | units differ |

### Handling Missing Values
1. Ignore the tuple (if many attributes missing) — risks losing data.
2. Fill manually (expensive).
3. Use a global constant (e.g., "Unknown").
4. Use the attribute mean / mode.
5. Use the most probable value (e.g., regression / Bayesian inference).

### Handling Noisy Data
- **Binning**: sort and partition into bins; smooth by bin mean/median/boundaries.
- **Regression**: fit a function to smooth (linear/ multiple regression).
- **Clustering**: detect and remove outliers, smooth within clusters.
- **Machine learning / human inspection** for correction.

## Similarity and Dissimilarity

### Definitions
- **Similarity**: numerical measure of how alike two objects are. Usually in $[0,1]$, higher = more similar.
- **Dissimilarity (distance)**: numerical measure of how different. Often in $[0,\infty)$; 0 = identical.
- **Proximity** = similarity or dissimilarity.

### Distance for Numeric (Interval/Ratio) Data
For data vectors $p=(p_1,\dots,p_n)$, $q=(q_1,\dots,q_n)$:

- **Minkowski distance** (metric family):
  $$d(p,q) = \left(\sum_{i=1}^{n}|p_i - q_i|^h\right)^{1/h}$$
- **$L_1$ Manhattan** ($h=1$): $d = \sum |p_i - q_i|$.
- **$L_2$ Euclidean** ($h=2$): $d = \sqrt{\sum (p_i-q_i)^2}$. Most common.
- **$L_\infty$ Supremum / Chebyshev** ($h\to\infty$): $d = \max_i |p_i-q_i|$.

Properties of a metric distance: non-negativity, identity ($d(p,q)=0 \iff p=q$), symmetry, **triangle inequality** $d(p,r)\le d(p,q)+d(q,r)$.

### Weighted and Other Distances
- **Weighted Euclidean**: $d = \sqrt{\sum w_i (p_i-q_i)^2}$, $w_i \ge 0$.
- **Mahalanobis distance**: $d = \sqrt{(p-q)^T \Sigma^{-1}(p-q)}$, where $\Sigma$ is the covariance matrix — accounts for correlation & scale.

### Similarity for Binary / Nominal Data
- **Binary (asymmetric) similarity — Jaccard coefficient**:
  $$J = \frac{f_{11}}{f_{01}+f_{10}+f_{11}}$$
  where $f_{11}$ = both 1, $f_{01},f_{10}$ = one 1; ignore $f_{00}$ (both 0). Used for market-basket / asymmetric binary.
- **Simple matching coefficient (symmetric)** includes $f_{00}$: $SMC=\frac{f_{11}+f_{00}}{f_{11}+f_{00}+f_{10}+f_{01}}$.
- **Nominal with $M$ states**: similarity $=\frac{\text{# matches}}{M}$.
- **Ordinal**: map to ranks $1..M$ then treat as interval/ratio (often normalize to $[0,1]$ by $(r-1)/(M-1)$) and apply numeric distances.
- **Cosine similarity** (for high-dimensional sparse, e.g., text/doc vectors):
  $$sim(p,q) = \frac{p\cdot q}{\|p\|\|q\|} = \frac{\sum p_i q_i}{\sqrt{\sum p_i^2}\sqrt{\sum q_i^2}} \in [-1,1]$$
  Useful for TF-IDF document vectors; angle-based, ignores magnitude.

### Correlation
- **Pearson correlation** for numeric $p,q$:
  $$r_{pq} = \frac{\sum (p_i-\bar p)(q_i-\bar q)}{\sqrt{\sum(p_i-\bar p)^2}\sqrt{\sum(q_i-\bar q)^2}} \in [-1,1]$$
  $+1$ perfect positive, $-1$ perfect negative, $0$ no linear correlation.

## Data Matrix vs Dissimilarity Matrix

- **Data matrix** ($n \times p$): rows = objects, columns = attributes — the raw data we usually start with.
- **Dissimilarity matrix** ($n \times n$, symmetric, zero diagonal): $d(i,j)$ = proximity of objects $i$ and $j$. Many algorithms (clustering, MDS, some classifiers) consume only this matrix.
- Converting data → dissimilarity is the first step for distance-based methods; the **choice of measure defines what "similar" means** and can dominate results.

## Proximity for Mixed-Type Data

When a record mixes attribute types (numeric + nominal + binary), combine per-attribute normalized contributions:

$$d(x,y) = \frac{\sum_{f=1}^{p} \delta_f^{(x,y)}\, d_f(x_f,y_f)}{\sum_{f=1}^{p} \delta_f^{(x,y)}}$$

- $\delta_f = 0$ if $x_f$ or $y_f$ is missing/incomparable, else $1$.
- numeric: $d_f = |x_f-y_f|/(max_f-min_f)$.
- binary/nominal: $d_f = 0$ if equal, $1$ if different.
- ordinal: map to ranks then treat as numeric.

## Worked Example

Two customers $p=(age=25,\ math=yes,\ sports=no)$, $q=(age=30,\ math=no,\ sports=yes)$, ages in $[20,40]$:
- numeric age: $d = (30-25)/20 = 0.25$.
- math (binary): differ ⇒ $1$; sports (binary): differ ⇒ $1$.
- mixed distance $\approx (0.25+1+1)/3 = 0.75$ (higher = more different).

## Choosing a Statistic — When to Use Which

| Statistic | Outlier-sensitive? | Use when |
|---|---|---|
| Mean | yes | symmetric, clean data |
| Median | no | skewed / noisy data |
| Mode | no (categorical) | nominal data |
| Std / variance | yes | scale matters, near-normal |
| IQR / MAD | no | robust spread |

## Noise vs Outlier (Reminder)
Noise = random error in a recorded value (handled by smoothing); an outlier is a genuine, often *meaningful* deviation. Not all outliers are noise and not all noise is an outlier — deciding which is a modeling choice that precedes cleaning.

## Text & High-Dimensional Similarity (TF-IDF + Cosine)

For documents, represent each as a vector over terms with **TF-IDF** weights:
$$w_{t,d} = tf_{t,d} \cdot \log\frac{N}{df_t}$$
where $tf$ = term frequency in the doc, $df_t$ = number of docs containing the term, $N$ = total docs. Compare docs by **cosine similarity** (angle between vectors) — magnitude-invariant and ideal for sparse bag-of-words.

## Data Quality Dimensions (Summary)
| Dimension | Meaning |
|---|---|
| Accuracy | close to the true value |
| Completeness | no missing values |
| Consistency | agrees across sources |
| Timeliness | up to date |
| Validity | conforms to schema/type |
| Uniqueness | no duplicates |

## Choosing the Right Proximity (Guide)
- Numeric, same scale → Euclidean / Manhattan.
- Numeric, different scales → z-score first, then Euclidean; or Mahalanobis.
- Asymmetric binary (market basket) → Jaccard.
- Sparse high-D (text) → cosine.
- Mixed types → per-attribute weighted formula.
- Correlation question → Pearson $r$.

## Summary

Understanding your data is the prerequisite for every later step. Know attribute scales (nominal/binary/ordinal/interval/ratio; discrete vs continuous) because they dictate valid statistics and proximity measures. Summarize central tendency (mean/median/mode) and dispersion (range/IQR/variance). Recognize and treat data-quality problems (noise, outliers, missing, duplicate, inconsistent). Choose proximity carefully: Minkowski/Euclidean for numeric, Jaccard for asymmetric binary, cosine for sparse high-dimensional vectors, Pearson for correlation.
