# Mining Text Data

## 1. Introduction

Text data is ubiquitous in modern applications:

- **Digital libraries**: digitized books and academic papers.
- **Web and Web-enabled applications**: hypertext (with rich *side information* via hyperlinks), social networks, microblogs (e.g., Weibo, WeChat).
- **Newswire services**: Sina, NetEase, Reuters.

### Modeling choices
A document can be modeled in two fundamentally different ways:

| Model | Description | Pros | Cons |
|---|---|---|---|
| **Sequence (string)** | Treat text as an ordered string of tokens | Preserves word order; enables sequence mining | Vast token space; huge string length; rarely used |
| **Bag-of-words (frequency-annotated)** | Multidimensional record of word frequencies | Compact; supports standard vector methods | Loses ordering information; the **popular choice** |

### Terminology
- **Document** = a single data point.
- **Corpus** = the collection (data set) of documents.
- **Word / term** = a feature (attribute).
- **Lexicon** = the set of all features (the vocabulary).

### Vector-space representation
A preprocessing pipeline converts raw text into a feature vector:
1. **Remove** common (non-discriminative) words.
2. **Consolidate** variations of the same word (e.g., via stemming).
3. **Attach normalized frequencies** to individual words.

### Three special characteristics of text
1. **Sparsity** — a document uses only a few hundred words, so most attributes are zero. This affects distance computation (most terms never co-occur).
2. **Nonnegativity** — frequencies are $\ge 0$; the *presence* of a word is statistically more significant than its *absence*.
3. **Side information** — hyperlinks, metadata, social-network friendships, and anchor text provide additional signal beyond the raw text.

## 2. Document Preparation (Feature Extraction)

### 2.1 Stop-word removal
Drop words that are not discriminative for mining: articles, prepositions, conjunctions (e.g., "the", "of", "and").

### 2.2 Stemming
Consolidate morphological variants of the same root:
- singular / plural ("connect" ↔ "connects")
- tenses ("connect", "connected", "connecting")

### 2.3 Punctuation removal
Eliminate commas, semicolons, digits, hyphens, and other non-alphabetic tokens.

### 2.4 TF-IDF weighting
Two components combine into the final weight $w_i$ of term $i$ in a document.

**Term Frequency (TF)** — raw count $tf_i$ of term $i$. Because frequency saturates (a word appearing 50 vs 100 times is not twice as important), TF is usually *damped*:

$$tf_i^{\text{damped}} = 1 + \log(tf_i) \quad \text{or} \quad \sqrt{tf_i}$$

**Inverse Document Frequency (IDF)** — measures how rare/discriminative a term is:

$$idf_i = \log\frac{n}{n_i}$$

where $n$ = total number of documents and $n_i$ = number of documents containing term $i$. Rare terms get high IDF.

**TF-IDF** combines them:

$$w_i = tf_i^{\text{damped}} \times idf_i$$

The document vector is typically **normalized** so that $\lVert \mathbf{d} \rVert = 1$, preventing long documents from dominating purely by length.

| Scheme | Formula | Best for |
|---|---|---|
| Raw count | $w_i = tf_i$ | Rarely used alone |
| Log-damped TF-IDF | $(1+\log tf_i)\cdot\log\frac{n}{n_i}$ | General-purpose |
| Boolean presence | $w_i \in \{0,1\}$ | Very short docs |

### 2.5 Similarity measures
- **Cosine similarity** (the workhorse for sparse TF-IDF vectors):

$$\cos(\mathbf{d}_1,\mathbf{d}_2)=\frac{\mathbf{d}_1\cdot \mathbf{d}_2}{\lVert \mathbf{d}_1\rVert\,\lVert \mathbf{d}_2\rVert}$$

- **Jaccard coefficient** (for binary/sparse *sets*, e.g., market baskets):

$$J(A,B)=\frac{|A\cap B|}{|A\cup B|}$$

Cosine is preferred for weighted vectors; Jaccard for unweighted sets.

### 2.6 Web-specific preprocessing
- **Leverage structure**: the title is more important than the body; add **anchor text** (a summary description that points to a target page) into that target document's representation.
- **Remove noise**: strip tags, ads, disclaimers, notices. Identify the main content block via:
  - *Block labeling as classification* — extract visual features, label manually, train a classifier.
  - *Tree matching* — extract tag trees, determine the page template.

## 3. Specialized Clustering Methods

### 3.1 Representative-based algorithms (k-means variants)
- **Similarity function**: use **cosine similarity** instead of Euclidean distance.
- **Centroid computation**: project out low-frequency words; maintain a **cluster digest** — the top 200–400 topical words of the cluster. This gives significant effectiveness gains.
- **k-means step**: assign each document to the nearest of $k$ centroids; recompute each centroid as the concatenation of its member documents, then prune its low-frequency words.

### 3.2 Scatter/Gather seeding
k-means is efficient but sensitive to seed choice; hierarchical methods are robust but scale poorly. A **two-phase** approach:
1. Use **buckshot** or **fractionation** (hierarchical) to create robust initial seeds.
2. Run k-means on those seeds.

**Buckshot**: select a seed superset of size $\sqrt{k\cdot n}$ ($k$ clusters, $n$ docs); agglomerate bottom-up to $k$ seeds.

**Fractionation**:
1. Break the corpus into $n/m$ buckets, each of size $m>k$ documents.
2. Apply agglomerative clustering to each bucket, reducing it by factor $v\in(0,1)$ (now $vm$ docs per bucket).
3. Across all buckets obtain $vn$ agglomerated documents.
4. Repeat until exactly $k$ agglomerated documents remain.

*Fractionation refinement*: sort documents by the index of the $j$-th most common word; map contiguous groups of $m$ to clusters, ensuring each group shares common words (better than pure random partitioning).

### 3.3 Enhancements
- **Split**: identify incoherent clusters (low self-similarity = average similarity of docs to centroid/each other); re-run buckshot with $k=2$ and re-cluster.
- **Join**: merge similar clusters — compute each cluster's topical words; merge those with significant topical-word overlap.

### 3.4 Probabilistic text clustering (unsupervised Naïve Bayes)
Model assumptions:
1. Each document is generated from a **single** topic (hard clustering).
2. Each topic = a distribution over words.
3. Words in a document are generated **independently** given the topic (Naïve Bayes assumption).

**Algorithm steps**:
1. Randomly assign documents to $k$ clusters.
2. Train NB models (Bernoulli or Multinomial): estimate prior $P(C_j)$ from cluster proportions; estimate $P(w_i\mid C_j)$.
3. Reassign each document to the cluster maximizing posterior $P(C_j\mid D)\propto P(D\mid C_j)P(C_j)$.
4. Repeat until convergence (EM).

**E-step** — compute likelihood under cluster $C_j$:
- Bernoulli: $P(D\mid C_j)=\prod_{w_i\in D}P(w_i\mid C_j)\prod_{w_i\notin D}(1-P(w_i\mid C_j))$
- Multinomial ($f_i$ = frequency of $w_i$ in $D$): $P(D\mid C_j)=\prod_{w_i\in D}P(w_i\mid C_j)^{f_i}$

**M-step** — re-estimate parameters:

$$P(C_j)=\frac{\sum_D P(C_j\mid D)}{\text{total number of documents}}$$

- Bernoulli: $P(w_i\mid C_j)=\dfrac{\sum_D P(C_j\mid D)\cdot \mathbb{I}(w_i\in D)}{\sum_D P(C_j\mid D)}$
- Multinomial: $P(w_i\mid C_j)=\dfrac{\sum_D P(C_j\mid D)\cdot\text{Count}(w_i\text{ in }D)}{\sum_D P(C_j\mid D)\cdot\text{Total words in }D}$

**Zero-probability problem** (Laplace correction):
- Bernoulli: $P(w_i\mid C_j)=\dfrac{\text{docs with }w_i\text{ in }C_j+1}{\text{total docs in }C_j+2}$
- Multinomial: $P(w_i\mid C_j)=\dfrac{\text{count of }w_i\text{ in }C_j+1}{\sum_k\text{count of }w_k\text{ in }C_j+1}$

### 3.5 Co-clustering (simultaneous document & word clusters)
Reorder the document-term matrix so nonzeros block-diagonalize. Cluster $i$ is associated with a disjoint set of document-rows $i$ and a disjoint set of word-columns $i$; the words in column-set $i$ are the cluster's topical words.

Modeled as a **bipartite graph**:
- Node set $N_d$ (documents) and node set $N_w$ (words).
- Edge $(i,j)\in A$ ↔ nonzero entry; weight = term frequency.

A **$k$-way cut** partitions both sides; edges crossing partitions correspond to nonzeros outside shaded blocks. Solved via graph partitioning / **spectral clustering** (see Ch.19.3).

## 4. Topic Modeling

### 4.1 PLSA (Probabilistic Latent Semantic Analysis)
A probabilistic variant of LSA (SVD). Each document is a **mixture of latent topics**; each topic is a distribution over terms. Documents and words are **conditionally independent given the topic**. PLSA is **soft clustering** (a doc/term can belong to multiple topics with probabilities) and is inherently for *dimensionality reduction*.

**Generative view**: pick latent component $z_m$ (prob. $P(z_m)$); generate document index $i$ with $P(d_i\mid z_m)$ and word index $j$ with $P(w_j\mid z_m)$; increment entry $(i,j)$.

**EM algorithm**:
- Initialize $P(z_m)$, $P(d_i\mid z_m)$, $P(w_j\mid z_m)$ to $1/k$, $1/n$, $1/d$.
- **E-step**: estimate posterior

$$P(z_m\mid d_i,w_j)=\frac{P(d_i\mid z_m)P(w_j\mid z_m)P(z_m)}{\sum_{m'}P(d_i\mid z_m')P(w_j\mid z_m')P(z_m')}$$

- **M-step**: re-estimate $P(w_j\mid z_m)$, $P(d_i\mid z_m)$, $P(z_m)$.

**Dimensionality reduction**: Let scaled document-term matrix $\mathbf{D}$ sum to 1. Then $\mathbf{D}\approx \mathbf{D}_k\mathbf{T}_k^\top$ where $\mathbf{D}_k$ ($n\times k$) gives $k$-dim document representations and $\mathbf{T}_k$ ($k\times d$) gives $k$-dim term representations; columns sum to 1.

**Benefits**:
- *Synonymy* — "cat" and "kitten" get positive loadings on the same aspect ("cats").
- *Polysemy* — a word with multiple meanings gets positive components in different aspects; other words in the doc reinforce one.

**PLSA vs EM-clustering**: In EM-clustering a doc comes from one hidden component; in PLSA different parts of a doc come from different aspects (mixture at the generative level).

**Clustering with PLSA**: (1) compute $k$-dim coords then cluster; or (2) apply k-means to the $n\times k$ matrix $\mathbf{D}_k$.

**Limitations**: overfitting (too many parameters); poor out-of-sample extension (cannot score unseen docs).

### 4.2 LDA (Latent Dirichlet Allocation)
Adds **Dirichlet priors** on the topic distributions, which regularizes parameters and **generalizes to new documents** — the standard fix for PLSA's weaknesses.

| Model | Clustering | Out-of-sample | Handles synonymy/polysemy |
|---|---|---|---|
| LSA (SVD) | via post-hoc clustering | Yes (projection) | Yes |
| PLSA | Soft, generative | No | Yes |
| LDA | Soft, generative + prior | Yes | Yes |

## 5. Specialized Classification Methods

### 5.1 Instance-based (k-NN)
Find the top-$k$ nearest neighbors by cosine similarity; return the dominant (similarity-weighted) class label.

**Modifications for sparsity / high dimensionality**:
- **Leverage LSA/PLSA**: removing small-eigenvalue dimensions reduces synonymy/polysemy noise in cosine.
- **Centroid-based classification**: cluster each class proportionally to its size; keep cluster digests; run k-NN against the smaller set of centroids.
  - *Advantages*: efficient (few centroids); robust (centroids reduce noise); handles imbalance; improves generalization; interpretable digests.

### 5.2 Rocchio classification
Aggregate all docs of a class into a **single centroid**; report the closest centroid's label. Extremely fast, but relies on the **class-contiguity assumption** (same-class docs form one contiguous region). Fails when a class is multi-modal (separated into distinct clusters).

### 5.3 Bayes classifiers
Predict $\hat{c}=\arg\max_c P(C=c\mid \mathbf{x})$ via Bayes rule.

**Bernoulli model** — each term is 0/1; does not use frequencies.

$$P(\mathbf{x}\mid C=c)=\prod_i \bigl[p(i,c)^{x_i}\,(1-p(i,c))^{1-x_i}\bigr], \quad p(i,c)=P(x_i=1\mid C=c)$$

Explicitly **penalizes non-occurrence**; best for short documents (where absence is informative).

**Multinomial model** — terms sampled from a multinomial over the document of length $L=\sum_i a_i$:

$$P(\mathbf{x}\mid C=c)\propto \prod_i \left(\frac{n(i,c)}{\sum_k n(k,c)}\right)^{a_i}$$

Ignores non-occurrence ($a_i>0$); best for longer documents where word frequencies matter.

| Model | Term value | Uses frequency? | Best for |
|---|---|---|---|
| Bernoulli | 0 / 1 | No | Short docs, absence informative |
| Multinomial | raw count | Yes | Long docs |

### 5.4 SVM classifiers
Linear classifiers work well for high-dimensional sparse text. The **SVMPerf** formulation uses a **single slack variable** $\xi$ (average margin violation) rather than $2n$ constraints:

$$\min_{\mathbf{w},\xi}\; \frac{1}{2}\lVert\mathbf{w}\rVert^2 + C\xi \quad \text{s.t. average violation }\le \xi$$

It never enumerates all (exponentially many) constraints explicitly — it maintains a small constant-size working set, so time complexity depends on $n$ (training examples) and $s$ (avg nonzero attributes/doc), terminating in few iterations.

### 5.5 Decision boundary summary
| Method | Type | Key assumption | Strength | Weakness |
|---|---|---|---|---|
| k-NN | Lazy/instance | Local similarity | Simple, no training | Slow at query, sensitive to noise |
| Centroid (Rocchio) | Prototype | Class contiguity | Very fast | Fails multi-modal classes |
| Naïve Bayes | Generative | Feature independence | Fast, robust | Independence unrealistic |
| Linear SVM | Discriminative | Linear separability | Strong on sparse text | Needs tuning $C$ |

## 6. Novelty and First-Story Detection

In news streams, detect the **first story** on a new topic as soon as possible.

**Simple approach**: for the current document compute its maximum similarity to all previous docs; very low max similarity ⇒ novelty. Problems: (1) high computational cost; (2) unstable pairwise similarity (synonymy/polysemy).

**Reservoir sampling**: maintain a fixed-size uniform sample of a stream of unknown/large size.
- Initialize reservoir with first $k$ items.
- For item $i>k$, generate random $j\in[1,i]$; if $j\le k$, replace reservoir[$j$].
- Every item has equal inclusion probability $k/n$.

**Micro-clustering method** (simultaneously finds clusters *and* novelties):
- Maintain $r$ cluster centroids (keep only the top ~200–400 frequent words, updated additively).
- For an incoming document, compute similarity to all centroids:
  - if $>$ threshold → add to cluster, update centroid frequencies;
  - else → report as novelty, create a new cluster, and **delete the stalest** cluster (by last-update time).

## 7. Summary

Text mining represents documents as sparse, non-negative bag-of-words vectors. Preprocessing removes stop words/stems/punctuation; TF-IDF plus cosine/Jaccard measure similarity (web docs add anchor text and block labeling). Clustering adapts k-means (cosine + cluster digest, buckshot/fractionation seeds), probabilistic NB/EM, and co-clustering (bipartite graph cuts). Topic modeling uses PLSA (and LDA for generalization). Classification uses cosine k-NN (with LSA/centroid speedups), Rocchio, Naïve Bayes (Bernoulli/Multinomial), and linear SVM. Novelty detection uses reservoir sampling and micro-clustering to find first stories in streams.
