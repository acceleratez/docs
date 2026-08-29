# Mining Web Data

## 1. Introduction

The Web is unique because of its scale, distributed and uncoordinated creation, open platform, and diversity of applications.

### Two primary types of data
- **Web content information**: document data and linkage data (graph).
- **Web usage data**: web transactions, ratings, user feedback, web logs.

### Application classes
| Class | Examples |
|---|---|
| **Content-centric** | Cluster/classify web documents; web crawling & resource discovery; web search (linkage + content); web linkage mining |
| **Usage-centric** | Recommender systems; web-log analysis (anomalies, site design) |

## 2. Web Crawling and Resource Discovery

A **web crawler** (spider/robot) downloads pages to a central location. Motivations: resources are dispersed across globally distributed sites; sometimes all relevant pages must be fetched centrally.

| Crawler type | Description |
|---|---|
| **Universal** | Crawl all pages on the Web (Google, Bing) |
| **Preferential** | Crawl pages on a subject or from a site |

### 2.1 Basic crawler algorithm
A real crawler is complex (selection, parsing, distributed multi-threading). Core loop: maintain a frontier of URLs; fetch a URL; parse out new links; add unseen links to the frontier.

### 2.2 Selection algorithms (frontier ordering)
- **Breadth-first** / **Depth-first**.
- **Frequency-based** — most universal crawlers are *incremental*, refreshing previous crawls.
- **PageRank-based** — prioritize pages with high PageRank.

### 2.3 Preferential crawlers
User-defined criteria decide which pages to fetch: keyword presence, a topical ML classifier, a geographical criterion, or a combination. Modify (a) the selection algorithm and (b) how the frontier is updated so that pointed-to pages also satisfy the criterion.

### 2.4 Multiple threads & distribution
The network is slow — a single crawler idles while waiting for responses. Use **multiple threads** updating shared structures (visited-URL set, page repository) with locking. Crawlers may also be **geographically distributed**, each sub-crawler collecting nearby pages.

### 2.5 Combatting spider traps
The crawler keeps a visited-URL list to avoid repeats. Dynamic URLs (e.g., `.../page1/page2/...`) create infinite traps. Defenses: limit maximum URL length; limit number of URLs taken from a single site.

### 2.6 Near-duplicate detection
Many duplicates of the same page are crawled. A **$k$-shingle** (or $k$-gram) is a string of $k$ consecutively occurring words (e.g., "Mary had", "had a", "a little"). Shingle-based similarity uses the Jaccard coefficient between the shingle sets of two documents $D_1, D_2$:

$$J(D_1,D_2)=\frac{|S_1\cap S_2|}{|S_1\cup S_2|}$$

## 3. Search Engine Indexing and Query Processing

### 3.1 Two-stage process
- **Offline stage**: preprocess crawled documents (tokenize, stem, remove stop words); build an index; compute a quality-based ranking score per page.
- **Online query processing**: access relevant documents, then rank by both query relevance and quality.

### 3.2 Index construction
- **Inverted index**: maps each word ID to a list of document IDs containing it (with document ID, frequency, position).
- **Vocabulary index**: locates the storage of each inverted word list.

### 3.3 Content-based score
A word gets different weights depending on whether it is in the **title, body, URL token, or anchor text**. The number of occurrences matters; font size/color prominence may be leveraged; for multi-keyword queries, relative positions are used.

### 3.4 Limitations of content-based scoring → web spam
Content alone ignores page reputation/quality. Spam techniques:
- **Content-spamming**: fill the page with repeated keywords.
- **Cloaking**: serve different content to crawlers vs. users.
- **SEO**: owners tune pages using search-engine knowledge.

### 3.5 Reputation-based score
- **Citation mechanism**: high-quality pages are pointed to by many others.
- **User feedback / behavioral analysis**: a user clicking a result is evidence of relevance.
- The final score combines content and reputation; spam penalties are always applied.

## 4. Ranking Algorithms

### 4.1 Google's PageRank (random-walk model)
Imagine a **random surfer** who follows random links. The long-term visit frequency of a page depends on (1) how many pages link to it, and (2) whether those linking pages are themselves frequently visited.

**Steady-state formulation**. Let $G=(V,E)$ be the directed web graph (with edges added from dead-ends). Let $x_i$ be the steady-state probability at node $i$, $I_i$ its in-linking nodes, and $O_i$ its out-linking endpoints (with out-degree $\text{Out}(i)$). The transition matrix entry is

$$p_{ij}=\begin{cases}\frac{1}{\text{Out}(i)} & \text{if edge }i\to j\text{ exists}\\ 0 & \text{otherwise}\end{cases}$$

**Teleportation (restart)** handles dead-ends (pages with no out-links): with probability $\alpha$ the surfer jumps to an arbitrary page; with probability $1-\alpha$ follows a link. The power-iteration update is

$$x_i = \alpha\sum_{j\in I_i}\frac{x_j}{\text{Out}(j)} + (1-\alpha)\frac{1}{n}$$

subject to $\sum_i x_i = 1$. Repeated until convergence: $x_i^{(t+1)} = \alpha \sum_{j\in I_i}\frac{x_j^{(t)}}{\text{Out}(j)} + (1-\alpha)/n$.

| Aspect | Detail |
|---|---|
| Dead-end fix | Add edges to all nodes (incl. self-loop) or rely on teleportation |
| Typical $\alpha$ | 0.85 (favors following links) |
| Computation | Power iteration; sparse matrix × vector |

### 4.2 Topic-Sensitive PageRank
Give more weight to certain topics. Fix a list of topics; gather a high-quality sample per topic; restrict teleportation to that topic's sample set (indicator vector $\mathbf{e}_p$).

### 4.3 SimRank (similarity-based ranking)
A limiting case of topic-sensitive PageRank where teleportation goes only to a single target node $i_q$ (vector $\mathbf{e}_q$ of all zeros except a 1 at $i_q$). Given $i_q$ and a subset of nodes, rank nodes by similarity to $i_q$. The **symmetric structural similarity** is defined iteratively:

$$s(a,b)=\frac{C}{|I(a)|\,|I(b)|}\sum_{i\in I(a)}\sum_{j\in I(b)} s(i,j)$$

where $I(\cdot)$ are in-linking nodes and $C$ is a constant; apply iteratively until convergence.

### 4.4 HITS (Hypertext Induced Topic Search)
- **Authority**: a page with many in-links (authoritative content).
- **Hub**: a page with many out-links to authorities.
- **Insight**: good hubs point to many good authorities; good authorities are pointed to by many good hubs.

**Procedure**:
1. Collect top-$r$ relevant results (root set $R$, $r\approx 200$).
2. Expand to the **base set** $S$ = all nodes immediately connected (in or out) to $R$, restricting in-linking nodes per node to $k\approx 50$.
3. On subgraph of $S$, assign each page $i$ a hub score $h_i$ and authority score $a_i$.
4. **Iterate** (normalize after each step):

$$a_i \leftarrow \sum_{j\in I_i} h_j, \qquad h_i \leftarrow \sum_{j\in O_i} a_j$$

The converged vectors are eigenvectors/singular vectors of the adjacency matrix.

| Property | PageRank | HITS |
|---|---|---|
| Computed on | Whole web (offline) | Query-dependent base set (online) |
| Scores | One per page (importance) | Hub + authority per page |
| Needs query? | No | Yes |

## 5. Recommender Systems

### 5.1 Utility matrix
For $n$ users and $d$ items, an $n\times d$ utility matrix $\mathbf{D}$ holds preferences. Typically **extremely sparse** — only a small subset of entries is specified.
- **Positive only**: "like", browse, quantity bought.
- **Positive & negative (ratings)**: explicit like/dislike scores.

### 5.2 Types of recommendation
- **Content-based**: users and items both have feature descriptions; recommend by matching.
- **Collaborative filtering**: use the utility matrix "collaboratively" to find relevant users/items.

### 5.3 Content-based recommendations
- *Without* a utility matrix: represent the user by interest documents; use **tf-idf + cosine k-NN** to find the top-$k$ closest items.
- *With* a utility matrix: train a **classification** model (item descriptions = docs, utility values = labels; remaining items = test docs) or a **regression** model. Limitation: depends on feature quality.

### 5.4 Collaborative filtering algorithms
| Family | Methods |
|---|---|
| Neighborhood-based | User-based similarity (ratings); Item-based similarity (ratings) |
| Graph-based | Bipartite user-item graph; Topic-Sensitive PageRank; SimRank |
| Clustering | Adapted k-means; Adapted co-clustering |
| Latent factor | SVD; Matrix Factorization; Matrix Completion |

**User-based (Pearson correlation)**: for users $X=(x_1,\dots,x_s), Y=(y_1,\dots,y_s)$ over common ratings,

$$r_{XY}=\frac{\sum_{t}(x_t-\bar{x})(y_t-\bar{y})}{\sqrt{\sum_t(x_t-\bar{x})^2}\sqrt{\sum_t(y_t-\bar{y})^2}}$$

Take top-$k$ peers by $r_{XY}$; return the normalized weighted-average rating of target items.

**Item-based**: subtract each row's mean; for columns $U, V$ compute Pearson over co-rated users; take top-$k$ similar items to $j$ that user $i$ rated; return weighted average.

**Graph-based**: bipartite graph $N_u$ (users) × $N_i$ (items); each nonzero utility entry is an edge. Normalize ratings by user-mean → treat as positive/negative edge weights; use random walks / SimRank; return weighted averages.

**Clustering methods**: reduce cost & sparsity.
- *User-user*: cluster users into $n_g$ groups; for user $i$ report the average (normalized) rating of specified items in its cluster.
- *Item-item*: cluster items into $n_g$ groups; proceed as item-based.

**Adapting k-means**: compute centroids by averaging each dimension over *specified* values only; compute distance over specified dimensions, divided by their count (fair comparison). **Adapting co-clustering**: discover user- and item-neighborhoods simultaneously.

### 5.5 Latent factor models
Encode row/column correlations as lower-dimensional **latent factors** (hidden variables) usable even with incomplete data.

**SVD** (truncated) of the (fully observed) utility matrix:

$$\mathbf{D}\approx \mathbf{Q}_k\boldsymbol{\Sigma}_k \mathbf{P}_k^\top$$

where $\mathbf{Q}_k$ ($n\times k$) are user factors and $\mathbf{P}_k$ ($d\times k$) are item factors. Rating $r_{ij}\approx \mathbf{q}_i^\top \mathbf{p}_j$. *Caveat*: SVD is undefined for incomplete matrices; PLSA may be used for nonnegative matrices.

**Matrix Factorization (MF)** — a general form $\mathbf{D}\approx \mathbf{U}\mathbf{V}^\top$ minimizing, over observed indices $\Omega$:

$$J = \sum_{(i,j)\in\Omega}(D_{ij}-(\mathbf{U}\mathbf{V}^\top)_{ij})^2 + \lambda\bigl(\lVert\mathbf{U}\rVert_F^2+\lVert\mathbf{V}\rVert_F^2\bigr)$$

Regularization ($\lambda$) prevents overfitting.

**Matrix Completion** — assume $\mathbf{D}$ is low-rank; recover missing entries by minimizing rank/observed-error under the low-rank assumption.

| Method | Handles missing? | Output |
|---|---|---|
| SVD | No (needs complete) | Orthogonal factors |
| MF | Yes (over $\Omega$) | User/item latent vectors |
| Matrix Completion | Yes | Full low-rank matrix |

## 6. Web Usage Mining

### 6.1 Types of logs
- **Web server logs**: user activity in NCSA common log format (or variants).
- **Query logs**: searches a user posed.

### 6.2 Data preprocessing
Log entries from different users are interleaved. Steps:
- Identify **user sessions** via client-side cookies, IP address, user-agent.
- Extract a subset as **click streams** (page-view sequences) or search-token sequences.

### 6.3 Applications
- **Recommendations**: suggest pages from browsing patterns.
- **Frequent traversal patterns**: reorganize the site.
- **Forecasting & anomaly detection**: predict future clicks; flag unusual patterns.
- **Classification**: label sequences (shopping vs. intrusion).

## 7. Summary

Web data splits into content (documents + linkage graph) and usage (logs). Crawling covers universal/preferential crawlers, multi-threading, spider-trap avoidance, and shingle-based near-duplicate detection. Search engines build inverted indexes and combine content-based with reputation-based scores. Ranking uses PageRank (random walk + teleportation power iteration) and its variants (topic-sensitive, SimRank) plus query-dependent HITS (hub/authority iteration). Recommender systems use content-based and collaborative filtering — neighborhood, graph, clustering, and latent-factor (SVD / MF / matrix completion) methods. Web usage mining preprocesses logs into sessions and supports recommendation, pattern discovery, forecasting, and anomaly detection.
