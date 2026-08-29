# Cluster Analysis (Basic)

## What Is Clustering?

- **Clustering** (unsupervised): group objects so that objects in the **same cluster** are more similar to each other than to those in **other clusters**.
- No class labels are given; it is exploratory structure discovery.
- Criterion: **maximize intra-cluster similarity, minimize inter-cluster similarity**.

### Applications
- Understanding (group similar documents, genes, customers), preprocessing for classification, outlier detection, compression.

## Requirements of Clustering Algorithms
- Scalability (to large $n$ and $d$).
- Ability to deal with different types (numeric, binary, categorical, graphs).
- Handle noisy/incomplete data and arbitrary shapes.
- Determine the "right" number of clusters $k$.
- Usable, interpretable, incremental.

## Categories of Clustering Methods
| Type | Idea | Examples |
|---|---|---|
| **Partitioning** | iterate to refine $k$ partitions | k-means, k-medoids |
| **Hierarchical** | build tree of nested clusters | AGNES, DIANA, BIRCH |
| **Density-based** | grow dense regions | DBSCAN, OPTICS |
| **Grid-based** | quantize space into grid | STING, CLIQUE |
| **Model-based** | fit statistical models | EM, COBWEB |

## Partitional: k-Means

### Algorithm (Lloyd's)
```
1. Choose k initial centroids (randomly / k-means++).
2. repeat:
   a. Assignment: assign each point to nearest centroid (Euclidean).
   b. Update: recompute each centroid = mean of its cluster.
3. until centroids converge (no/≤ change) or max iterations.
```

### Objective
Minimize **within-cluster sum of squares (SSE / distortion)**:
$$SSE = \sum_{i=1}^{k}\sum_{x\in C_i} \|x - \mu_i\|^2, \qquad \mu_i = \frac{1}{|C_i|}\sum_{x\in C_i} x$$

### Properties
- Converges to a **local optimum** (depends on initialization).
- **k-means++** picks initial centroids spread out (probabilistically farthest) → better & faster convergence.
- Time: $O(n\cdot k\cdot d\cdot I)$ (I iterations); scales well.

| Pros | Cons |
|---|---|
| simple, fast, scalable | must choose $k$ |
| works on numeric data | only spherical/convex clusters |
| | sensitive to outliers & initialization |
| | assumes similar variance per cluster |

- Empty clusters, outliers pulled into means ⇒ variants (k-means with medoid init, trimming).

## Partitional: k-Medoids (PAM)

- Uses **actual data points** as centers (medoids) instead of means — **robust to outliers and noise**.
- **PAM (Partitioning Around Medoids)** algorithm:
  ```
  1. Select k initial medoids randomly.
  2. assign each non-medoid to nearest medoid.
  3. for each medoid m and each non-medoid o:
        swap(m,o); compute total cost change of reassignments;
     keep swap if it reduces cost;
  4. repeat until no improving swap.
  ```
- **Cost** = sum of dissimilarities to medoid (works with arbitrary distance, including non-Euclidean).
- **CLARA**: sample-based PAM for large data. **CLARANS**: randomized search.

| k-means | k-medoids |
|---|---|
| center = mean | center = medoid (real point) |
| sensitive to outliers | robust to outliers |
| only Euclidean | any dissimilarity |
| faster | slower (O(n²k)) |

## Hierarchical Clustering

Builds a tree (**dendrogram**) of clusters — no need to pre-specify $k$ (cut at desired level).

### Distance Between Clusters (Linkage)
| Linkage | Definition | Shape tendency |
|---|---|---|
| **Single (MIN)** | $\min$ distance between points in two clusters | finds elongated/chaining clusters |
| **Complete (MAX)** | $\max$ distance between points | compact, spherical; sensitive to outliers |
| **Average (UPGMA)** | average pairwise distance | balanced compromise |
| **Centroid** | distance between cluster centroids | may be non-monotone (inversions) |
| **Ward's** | increase in SSE if merged | similar to k-means objective |

### Agglomerative (AGNES) — bottom-up
```
start: each point = one cluster (n clusters);
repeat:
   find the two closest clusters by chosen linkage;
   merge them;
until one cluster remains (or k clusters);
```
- Produces dendrogram; cut at height ⇒ number of clusters.

### Divisive (DIANA) — top-down
```
start: all points in one cluster;
repeat:
   split the cluster that increases the separation most
   (typically along the longest diameter / using a criteria);
until each point alone (or k clusters);
```
- Computationally heavier than agglomerative (must decide split).

### Strengths / Weaknesses
- ✅ no $k$ needed, gives full hierarchy, deterministic (given linkage).
- ❌ $O(n^2)$ or $O(n^3)$ time, cannot undo merges (no correction), sensitive to noise & linkage choice (single → chaining).

| Method | Time | Shape | $k$ needed? | Outlier robust? |
|---|---|---|---|---|
| k-means | $O(nkdi)$ | spherical | yes | no |
| k-medoids | $O(n^2k)$ | any (distance) | yes | yes |
| AGNES | $O(n^2)$–$O(n^3)$ | depends on linkage | no | no |
| DIANA | $O(n^2)$ | depends | no | no |

## Choosing k
- **Elbow method**: plot SSE vs $k$; pick the "elbow" (diminishing returns).
- **Silhouette** (see Ch.10), **gap statistic**, domain knowledge.

## k-Means — Worked 2-D Example

Points: $p_1(1,1),\ p_2(1,2),\ p_3(9,8),\ p_4(8,9)$, $k=2$, init centroids $c_1=p_1=(1,1),\ c_2=p_3=(9,8)$.

- **Iter 1 assignment** (nearest): $\{p_1,p_2\}\to c_1$, $\{p_3,p_4\}\to c_2$.
- **Iter 1 update**: $c_1=(1,1.5)$, $c_2=(8.5,8.5)$.
- **Iter 2 assignment**: unchanged (still two tight groups). Converged.
- **SSE** = $\|p_1-c_1\|^2+\|p_2-c_1\|^2+\|p_3-c_2\|^2+\|p_4-c_2\|^2 = 0.25+0.25+0.5+0.5 = 1.5$. Clean separation.

If init were unlucky (both centroids in one cluster), assignment splits differently and SSE higher — illustrating local-optimum dependence (k-means++ fixes most cases).

## BIRCH (Brief — Hierarchical, Scalable)
- Builds a **CF-tree** (Clustering Feature: `(n, LS, SS)` per subcluster: count, linear sum, squared sum) incrementally — only keeps summaries, not all points.
- Two phases: build CF-tree, then (optionally) refine with k-means on the leaf CFs. Handles very large / streaming data.

## Linkage Effect — Worked

Three points A,B close (dist 1), C far from both (dist 10).
- **Single linkage** merges A,B first (min dist 1); C joins later at dist 10 ⇒ elongated chain.
- **Complete linkage** would delay merging any pair involving C (max dist 10) ⇒ more balanced/compact clusters, but may split natural chains.
- **Average / Ward** sit between; Ward minimizes SSE increase and behaves like k-means.

## How Many Clusters? (Recap)
Elbow (SSE vs k), silhouette (Ch.10), gap statistic, or domain requirement. Hierarchical methods sidestep $k$ by cutting the dendrogram. A wrong $k$ either merges distinct groups (too small) or splits natural ones (too large).

## Cluster Tendency (Is Clustering Even Valid?)
Before clustering, check the data actually has clusters:
- **Hopkins statistic**: samples random points vs random perturbations; values near 0.5 ⇒ no clustering structure (uniform), near 1 ⇒ clustered. Avoid forcing clusters on uniform noise.

## k-Means Limitations (Recap)
- Assumes **spherical, equal-variance** clusters of similar size; fails on crescents, rings, varying density.
- Sensitive to **initialization** and **outliers** (mean pulled).
- Must choose $k$; scales with $k$ and dimensions.
Mitigations: k-means++, outlier removal, then optionally DBSCAN/spectral for non-convex shapes (Ch.10).

## AGNES vs DIANA Trade-offs
- AGNES (bottom-up) is straightforward and produces a full dendrogram; cannot undo merges (a bad early merge lingers).
- DIANA (top-down) can be more efficient for few final clusters but choosing the best split is harder. Both are $O(n^2)$–$O(n^3)$; BIRCH/CLIQUE make them scale.

## k-Medoids (PAM) — Worked Sketch
Points {1,2,3,8,9,30}, $k=2$, choose medoids 2 and 9. Assign each to nearest medoid; swapping 2↔30 would raise total cost (30 is far from the others) ⇒ rejected. PAM settles on medoids representing tight groups while a lone extreme stays isolated. Unlike k-means, medoids are real points, so a single extreme value cannot drag a center.

## Cutting the Dendrogram
- AGNES yields a dendrogram; cutting at height $h$ produces clusters whose merges all occurred below $h$. Different $h$ ⇒ different $k$ — explore several and validate (silhouette, Ch.10).
- **Cophenetic correlation**: compares dendrogram distances to original distances to judge linkage quality.

## Limitations Recap
k-means/k-medoids need $k$ and assume compact clusters; agglomerative cannot undo merges and is $O(n^2)$–$O(n^3)$; single-linkage chains, complete-linkage splits natural chains. Match the method to the expected cluster shape.

## Summary

Clustering partitions unlabeled data by similarity. **k-means** iteratively assigns points to the nearest mean centroid, minimizing SSE — fast but assumes spherical clusters and is outlier-sensitive; **k-means++** improves initialization. **k-medoids (PAM)** uses real points as centers, robust to outliers and usable with arbitrary distances, at higher cost. **Hierarchical** methods (AGNES bottom-up, DIANA top-down) build a dendrogram via linkage rules (single/complete/average/ward) without fixing $k$ in advance, but cannot correct merges and scale worse. The choice of method depends on cluster shape, noise, scale, and whether $k$ is known.
