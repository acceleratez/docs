# Query Optimization

## Introduction

The **query optimizer** selects the best execution strategy based on available information. Most RDBMSs represent a query internally as a **tree**.

Three steps:
1. Scanner + parser produce the initial query representation.
2. Heuristically optimize that representation.
3. Develop the **query execution plan** using available access paths and files.

## 19.1 Query Trees and Heuristics

- **Query tree**: represents a relational-algebra expression — specifies an explicit order of operations. Preferred over the query graph for execution.
- **Query graph**: represents a calculus expression (relation nodes = circles; constants = double circles/ovals; selection/join conditions = edges; projected attributes = square brackets).

Many trees yield the same result; the initial (canonical) tree is usually inefficient and is transformed into an equivalent final tree.

### Heuristic rules (algebraic optimization)
1. **Apply SELECT and PROJECT as early as possible** — shrink intermediate tuples/attributes before joining.
2. Execute the **most restrictive** SELECT/JOIN first (the ones that reduce size most).
3. **Replace CARTESIAN PRODUCT + SELECT with JOIN** wherever possible (cartesian product is far costlier).
4. Move PROJECT down the tree to drop unneeded columns early.

### Transformations (illustrative Q)
- (a) Canonical tree: `PROJECT(... (SELECT(... (R × S × T))))`.
- (b) Push SELECTs down to their base relations.
- (c) Apply the more restrictive SELECT first.
- (d) Replace `×` + `σ` with `⋈`.
- (e) Push PROJECTs down to keep only needed attributes.

### General transformation rules
Standard algebraic equivalences: selection cascading (`σ_c1(σ_c2(R)) = σ_c1∧c2(R)`), selection commutation, projection pushdown over joins when attributes are preserved, join commutativity/associativity, distributivity of selection over union/difference, etc.

### Evaluation: materialized vs. pipelined
- **Materialized**: each operator's result stored as a temporary relation (disk).
- **Pipelined**: results forwarded directly to the next operator (faster, fewer temp files) — see Ch. 18.7.

## 19.2 Choice of Query Execution Plans

### Unnesting subqueries
Convert a nested subquery + `IN` / `ANY` into a single block (often a join or semi-join). Alternative: materialize the subquery result as a temporary table and join it.

### View merging
- **Inline view** (FROM-subquery): the optimizer **merges** view tables with outer tables. Simple SPJ (select-project-join) views can always be merged.
- **Group-By view merging**: decide whether to delay GROUP BY (better if subsequent joins have low selectivity) or perform it early (reduces data for joins). Chosen by estimated cost.

### Materialized views
A view whose result is stored (temporarily or permanently). The optimizer can **rewrite a query to use a materialized view** instead of recomputing.

### Incremental view maintenance
Update the view by accounting only for changes since the last refresh (propagating join/selection/projection/intersection/aggregation deltas), rather than full recomputation.

## 19.3–19.4 Cost-Based Optimization

The optimizer **estimates and compares costs** of strategies and picks the lowest. Cost = quantitative metric over space + time.

### Cost components
- Access cost to secondary storage (disk I/O) — usually dominant.
- Disk storage cost.
- Computation cost (CPU).
- Memory usage cost.
- Communication cost (distributed/parallel).

### Catalog statistics used
- File size (number of blocks $b$, number of records $n$).
- File organization; number of index levels.
- **Number of distinct values (NDV)** of each attribute.
- **Attribute selectivity** → **selection cardinality** = average # records satisfying an equality on that attribute.
- **Histograms** of important attributes (e.g., salary) capture data distribution beyond simple averages.

### Cost formulas for SELECT (notation: $b$ = # blocks)
| Method | Cost |
|---|---|
| **S1a** Linear search | $C_{S1a} = b$ |
| **S1b** Linear, key equality (avg) | $C_{S1b} = b/2$ |
| **S2** Binary search (key) | $C_{S2} = \lceil \log_2 b \rceil$ |
| **S3a** Primary index, single record | $C_{S3a} = x + 1$ ($x$ = index levels) |
| **S3b** Hash key, single record | $C_{S3b} = 1$ |
| **S4** Ordering index, multiple records | index levels + # blocks in range |

### Cost formulas for JOIN
Let $n_R, n_S$ = # tuples, $b_R, b_S$ = # blocks, buffer blocks $n_B$.

- **J1 Nested-loop**: roughly $b_R + (b_R / (n_B - 2)) \cdot b_S$ block accesses (scan S once per chunk of R). Use the smaller file as outer.
- **J2 Index-based nested-loop**: for each R tuple, probe S's index (selection cardinality $S_B$): cost scales with $n_R \cdot (\text{index probe cost})$.
- **J3 Sort-merge**: cost of sorting both (if not already sorted) + $b_R + b_S$ merge; add sort cost when needed.
- **J4 Partition-hash**: partition both on the join attribute ($O(b_R + b_S)$) then join per partition pair.

### Join selectivity and cardinality
- **Join selectivity**: $js = \dfrac{1}{\max(\text{NDV}(A,R), \text{NDV}(B,S))}$ — ratio of result size to the size of the cartesian product.
- **Join cardinality**: $jc = js \cdot |R| \cdot |S|$.
- **Semi-join**: $js = \min(1, \text{NDV}(Y,T_2)/\text{NDV}(X,T_1))$.
- **Anti-join**: $js = 1 - \min(1, \text{NDV}(T_2.y)/\text{NDV}(T_1.x))$.

### Join tree shapes (multi-relation queries)
- **Left-deep**: right child is always a base relation. Generally preferred — works well with common join algorithms and supports fully pipelined plans.
- **Right-deep**: left child is always a base relation.
- **Bushy**: both children can be intermediate results. Most permutations (expensive to search) but flexible.

| Tree type | # permutations (n relations) |
|---|---|
| Left-deep | $(n-1)!$ |
| Bushy | $\dfrac{(2n-2)!}{(n-1)!\,n!}$ (Catalan-related) |

### Dynamic programming
Subproblems solved once and reused; builds the optimal plan bottom-up. Optimal substructure + overlapping subproblems ⇒ efficient exhaustive search over join orders.

### Physical optimization
Top-down or bottom-up cost-based search; heuristics (e.g., "use index scan for selections when possible") prune the space. **Left-deep trees** are usually favored.

## 19.6 Example (Cost-Based)

Given Q2 and statistics (column/table/index info), assume only left-deep trees. Candidate join orders:
```
PROJECT ⋈ DEPARTMENT ⋈ EMPLOYEE
DEPARTMENT ⋈ PROJECT ⋈ EMPLOYEE
EMPLOYEE ⋈ DEPARTMENT ⋈ PROJECT   (etc.)
```
The optimizer computes each order's cost (using join selectivity/cardinality) and keeps the cheapest.

## 19.7 Additional Issues

- **Size estimation** for projection, set operations, aggregation, outer join.
- **Plan caching**: store a plan for reuse by the same query with different parameters.
- **Top-k optimization**: stop generating once $k$ results satisfy `LIMIT k`.

### Star transformation (data warehouses)
Fact table + dimension tables. Goal: avoid a full fact-table scan by rewriting the query to access a reduced fact-table set (often via **bitmap indexes**), then join back. Variants: classic star transformation, bitmap-index star transformation.

## 19.9–19.10 Oracle Overview & Semantic Optimization

- Oracle's physical optimizer is cost-based, scoped per query block, using object statistics + estimated resources/memory. The **global** optimizer integrates logical transformation + physical optimization; **adaptive optimization** uses a feedback loop.
- Developer **hints** (`/*+ ... */`) can force access path, join order/method, or enable/disable a transformation; **outlines / SQL plan management** preserve plans.
- **Semantic query optimization**: uses schema constraints to rewrite a query into a more efficient equivalent (e.g., exploit known constraints to eliminate conditions).

## Worked SELECT Cost Comparison

Given a file of $b=1000$ blocks, an equality on a **key** attribute:
- **S1 linear**: $C = 1000$ block reads.
- **S1b linear (key, avg)**: $C = 500$.
- **S2 binary** (file ordered on key): $C = \lceil \log_2 1000 \rceil = 10$.
- **S3a primary index** (say $x=3$ levels): $C = 3 + 1 = 4$.
- **S3b hash key**: $C = 1$.

The optimizer picks the cheapest available method given existing indexes and whether the condition is an equality/range on a key.

## Worked JOIN Order (left-deep)

For $R \bowtie S \bowtie T$ with `DEPARTMENT ⋈ PROJECT ⋈ EMPLOYEE`, candidate left-deep orders each placed in the optimizer's cost model:
```
DEPARTMENT ⋈ PROJECT ⋈ EMPLOYEE
DEPARTMENT ⋈ EMPLOYEE ⋈ PROJECT
EMPLOYEE   ⋈ DEPARTMENT ⋈ PROJECT   (etc.)
```
Each is costed using join cardinality $jc = js \cdot |R| \cdot |S|$, $js = 1/\max(\text{NDV})$. The order with the smallest intermediate (lowest $jc$ first) wins. Dynamic programming guarantees the optimal left-deep tree is found.

## EXPLAIN PLAN (inspecting the chosen plan)

```sql
-- Oracle
EXPLAIN PLAN FOR SELECT ... ;
-- DB2
EXPLAIN PLAN SELECTION FOR <sql>;
-- SQL Server
SET SHOWPLAN_TEXT ON; <sql>;
```
The plan shows access paths (full scan vs index), join methods (nested-loop / merge / hash), and join order — essential for tuning.

## Plan Caching and Top-k

- **Plan caching**: the optimizer stores the plan for a query shape so repeated invocations (with different bind parameters) skip re-optimization.
- **Top-k optimization**: for `... ORDER BY x LIMIT k`, the optimizer stops producing tuples once $k$ are found, limiting work.

## Chapter Summary

- Optimization: heuristic (push SELECT/PROJECT early, most-restrictive first, replace ×+σ with ⋈) and cost-based (estimate I/O/CPU/memory via catalog stats, NDV, histograms).
- SELECT cost: linear $b$, binary $\log_2 b$, primary index $x+1$, hash $1$. JOIN cost: nested-loop, index-based, sort-merge, partition-hash; join selectivity $js = 1/\max(\text{NDV})$, cardinality $jc = js\cdot|R|\cdot|S|$.
- Join orders: left-deep (preferred, pipelinable), right-deep, bushy; search via dynamic programming.
- Unnesting, view merging, materialized views + incremental maintenance reduce work. `EXPLAIN PLAN` shows the chosen plan; star transformation and semantic optimization handle warehouses/constraints.
