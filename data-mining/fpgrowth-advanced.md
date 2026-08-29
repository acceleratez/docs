# Frequent Pattern Mining (Advanced)

## Limitations of Apriori → FP-Growth

- **Apriori** needs many DB scans and generates a potentially huge set of candidates (especially $C_2$).
- **FP-growth (Frequent Pattern growth, Han et al. 2000)** avoids candidate generation entirely: it compresses the DB into an **FP-tree** and mines it recursively by **conditional pattern bases**.

## FP-Tree Structure

The **FP-tree (Frequent Pattern tree)** is a compact, prefix-tree representation of the (filtered, sorted) transaction DB.

- Each node: `(item-name, count, node-link)`.
- A single **root** labeled "null".
- **Header table** lists frequent items in descending support order, each linking to its occurrences via **node-links** (for fast traversal).
- Items in each transaction are inserted **sorted by descending frequency** (infrequent items removed first). Shared prefixes are merged, counts accumulated.

### FP-tree Construction
```
1. Scan DB once → find frequent 1-itemsets, sort by descending support → header table.
2. For each transaction:
     remove infrequent items, sort remaining by header order.
     insert into FP-tree: follow existing prefix path, increment counts;
     if no matching branch, create new nodes; link via node-links.
3. Result: compact tree + header table.
```
Because frequent items cluster together, the tree is typically far smaller than the raw DB (and is lossless for frequent-pattern mining).

### Conditional Pattern Base & Conditional FP-tree
- **Prefix path** of an item $a$: the path from root to each node of $a$, excluding $a$ itself, with its support = count of that $a$-node.
- **Conditional pattern base** of $a$: the set of all prefix paths of $a$ (with their counts). 
- **Conditional FP-tree** of $a$: build a (small) FP-tree from $a$'s conditional pattern base; the **frequent patterns ending in $a$** are derived by combining $a$ with frequent items in its conditional FP-tree.

## FP-Growth Algorithm (Recursive)

```
FP-Growth(Tree, α):
  if Tree contains a single prefix path P:
     for each combination β of nodes in P:
         output pattern (β ∪ α) with support = min support along β
  else:
     for each frequent item ai (ascending in header):
         β = ai ∪ α; output β (support = ai.support);
         build conditional pattern base of ai;
         build conditional FP-tree Tree_ai from it;
         if Tree_ai ≠ ∅: FP-Growth(Tree_ai, β)
```
- Recursion builds **longer patterns by growing the suffix**; no candidate generation.
- When the tree is a single path, all subsets along the path are frequent combos ⇒ enumerate directly.

### Worked Sketch
Given header order B(6),A(5),... and item D, compute D's conditional pattern base from its prefix paths, build D's conditional FP-tree, then FP-Growth on it yields patterns like `{B,A,D}`, each with support equal to the supporting node counts. Patterns are $\langle suffix$,$ support\rangle$ pairs.

## Complexity of FP-Growth
- **Space**: $O(n \cdot \bar{p})$ worst-case (if no sharing), but typically much smaller than DB; bounded by frequent-item sharing.
- **Time**: one DB scan to build tree + recursive mining. Often faster than Apriori when patterns are long/dense.
- **Worst case**: when all items are frequent and no sharing ⇒ tree ≈ DB (rare in practice).

## Compact Representations: Closed & Maximal

Because frequent itemsets form a **lattice with many redundancies** (if $\{A,B,C\}$ frequent then all its subsets frequent), we compress:

### Maximal Frequent Itemset (MFI)
- An itemset is **maximal frequent** iff it is frequent **and none of its proper supersets is frequent**.
- A **minimum** set of generators: all frequent itemsets can be recovered as subsets of some MFI (but support not directly known — need extra bookkeeping).

### Closed Frequent Itemset (CFI)
- An itemset $X$ is **closed** iff no proper superset $Y\supset X$ has the **same support** as $X$ ($Supp(X)=Supp(Y)$).
- The set of all **closed frequent itemsets** is the **lossless, minimal** representation: every frequent itemset and its exact support can be derived from CFIs. 
- **Property**: $\#CFI \le \#MFI$ is not always true, but both $\ll$ total frequent itemsets, and CFI preserves supports (MFI does not).

| Representation | Size | Lossless support? | Notes |
|---|---|---|---|
| All frequent itemsets | largest | yes | redundant |
| Maximal (MFI) | smallest | no (need extra) | only structure |
| Closed (CFI) | moderate | yes | best practical |

## Mining Frequent Patterns Without Support Threshold (Pattern-Growth Variants)

### ECLAT (Equivalence CLASS Transformation)
- Vertical format: each item → list of TIDs. Support of a set = size of **intersection** of TIDs. Depth-first, set-intersection based — often faster than Apriori for dense data; memory grows with TID lists.

### H-Mine
- Uses an **H-struct** (hash-based) projection; only stores projected hyperlinks for the currently mined item — low memory, good for large/long patterns.

### CLOSET / CHARM
- **CLOSET**: mines closed itemsets via FP-tree-like conditional projection + closure check.
- **CHARM**: uses vertical tid-sets and diffsets to mine closed itemsets efficiently.

## Mining Frequent Itemsets from Horizontal vs Vertical Data
- **Horizontal** (tid, itemset): Apriori, FP-growth.
- **Vertical** (item, tid-list): ECLAT, CHARM — set intersection replaces counting.

## Mining Alternative Patterns
- **Frequent subsequences** (sequential patterns) — GSP, PrefixSpan (SPADE).
- **Frequent substructures** (graphs/trees) — gSpan, FSG, for chemical compounds, XML.
- **Colossal / top-$k$** patterns — avoid minsup tuning (e.g., **MineTopK**).
- **Mining with constraints**: anti-monotone (support), monotone, succinct, convertible constraints pushed deep into the mining.

## Worked FP-Tree Construction

DB (counts in parentheses), minsup = 2:

| TID | Items |
|---|---|
| T1 | A, B, C (1) |
| T2 | A, B, D (1) |
| T3 | B, C, D (1) |
| T4 | A, C, D (1) |

$F_1$ sorted by support: A(3), B(3), C(3), D(3) (all count 3). Remove none (all frequent). Sort each transaction by this order:
- T1: A B C; T2: A B D; T3: B C D; T4: A C D.

Insert into the tree (root → null):
- T1: null→A(1)→B(1)→C(1).
- T2: share A(2)→B(2); new branch D(1) from B.
- T3: new root branch B(1)→C(1)→D(1) (no A prefix).
- T4: A(3)→C(2)→D(1) (shares A, then C).

Header table links all A-nodes, B-nodes, etc. via node-links. The tree is far smaller than re-listing 4 transactions and is lossless for frequent patterns.

## Conditional Pattern Base (Worked)

For item **D** (support 3):
- prefix path from T2 (via B): `A B` with count 1.
- prefix path from T3: `B C` with count 1.
- prefix path from T4 (via C): `A C` with count 1.
- **Conditional pattern base of D** = { (A B : 1), (B C : 1), (A C : 1) }.
Build D's conditional FP-tree, then recursively mine suffixes ending in D ⇒ patterns {A,B,D}, {B,C,D}, {A,C,D} (each count 1, but if minsup were 1 they appear). This matches the Apriori result without candidate generation.

## Closed vs Maximal — Worked

Suppose frequent itemsets and supports: {A}=10, {B}=10, {C}=8, {A,B}=10, {A,C}=8, {B,C}=8, {A,B,C}=8 (minsup=8).
- **Maximal** = those with no frequent superset: {A,B} (since {A,B,C} freq? here {A,B,C}=8 ≥8 is frequent, so {A,B} is NOT maximal; {A,B,C} is maximal). Maximal set = {A,B,C} only.
- **Closed**: {A,B}=10 and its only superset {A,B,C}=8 ≠10 ⇒ {A,B} is closed. {A,C}=8, superset {A,B,C}=8 equal support ⇒ {A,C} is **not** closed (subsumed). Closed set = {A,B}, {A,B,C}, {B,C}? {B,C}=8 superset {A,B,C}=8 equal ⇒ not closed. Final CFI = {A}, {B}, {A,B}, {A,B,C}. All supports recoverable.

Lesson: CFI preserves every support; MFI is smallest but loses supports.

## ECLAT (Worked)

Vertical tid-lists: A={T1,T2,T4}, B={T1,T2,T3}, C={T1,T3,T4}, D={T2,T3,T4}.
- supp(A)=3, supp(B)=3, supp(C)=3, supp(D)=3.
- supp(A∩B) = |{T1,T2,T4} ∩ {T1,T2,T3}| = |{T1,T2}| = 2.
- supp(B∩D) = |{T1,T2,T3} ∩ {T2,T3,T4}| = |{T2,T3}| = 2.
- support = **size of intersection** — no transaction scan needed. Deeper itemsets intersect further.

## CLOSET / CHARM (Detail)
- **CLOSET**: builds a frequent-pattern tree per item, then prunes using the **closure property** (an itemset is closed iff no superset has equal support) — outputs only closed itemsets without materializing all frequent ones.
- **CHARM**: stores items as **tid-sets**; uses **diffsets** (difference of tid-sets between an itemset and its generators) to speed support computation and closure checks.

## Top-k & Constrained Pattern Mining
- **Top-k frequent itemsets**: user supplies $k$ (not $minsup$); algorithm finds the $k$ most frequent itemsets and derives the needed threshold automatically (e.g., **MineTopK**, **TMFP**).
- **Constraint pushing**: monotone / anti-monotone / succinct / convertible constraints (e.g., "contain {milk}", "price < 10") are pushed as early as possible into candidate generation to prune the search space.

## Sequential & Graph Patterns (Preview)
- **Sequential** (GSP, PrefixSpan): mine frequent **subsequences** with time order — e.g., `camera → SD-card`.
- **Graph/substructure** (gSpan, FSG): mine frequent **subgraphs** for molecules/XML; far costlier (subgraph isomorphism is NP-hard) but powerful.

## When to Use Which Representation
- Need exact supports & minimal output → **closed** itemsets (CFI).
- Only need the maximal scopes (e.g., for coverage) → **maximal** (MFI); store an extra support table if supports are needed.
- Huge dense data → vertical (ECLAT) or H-Mine to save memory.
- Streaming / incremental → sliding-window FP or lossy summaries.

## Scalability Notes
FP-growth's memory is bounded by the number of frequent items and their prefix sharing; in the worst case (all items frequent, no sharing) it degrades to storing the whole DB. ECLAT's tid-lists grow with data size, while H-Mine's H-struct is usually smaller. Choose the variant by data density and available RAM.

## Why Closed Patterns Matter in Practice
Mining all frequent itemsets can produce millions of redundant rules (every subset of a long pattern). Closed itemsets give a **lossless, usually orders-of-magnitude smaller** summary from which any frequent itemset and its support can be reconstructed. For very long patterns this compression is essential; maximal itemsets are even smaller but require extra bookkeeping to recover supports.

## Summary

FP-growth removes Apriori's candidate explosion by building a compact **FP-tree** and mining it **recursively via conditional pattern bases** — yielding the same complete set of frequent itemsets, usually faster and with fewer scans. To tame redundancy in the (often huge) output, use **closed** frequent itemsets (lossless, with supports) or **maximal** frequent itemsets (smallest, structure only). Vertical methods (**ECLAT/CHARM**) intersect tid-lists; H-Mine projects with low memory. Sequential and graph patterns extend the same pattern-growth philosophy beyond itemsets.
