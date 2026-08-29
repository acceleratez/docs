# Strategies for Query Processing

## Introduction — Steps in Processing a Query

A high-level query (SQL) is processed in stages:
1. **Scanner** → tokenizes the query.
2. **Parser** → checks SQL syntax.
3. **Validation** → verifies all relation/attribute names exist (against the catalog).
4. **Query tree / query graph** built.
5. **Execution strategy (query plan)** devised.
6. **Query optimization** → pick a "good" plan.

The optimizer's output is a **query plan**: a tree of physical operators over the relations.

## 18.1 Translating SQL into Relational Algebra

- SQL is decomposed into **query blocks** — the basic units translatable to algebraic operators. Each block is a single `SELECT-FROM-WHERE` (possibly with `GROUP BY`/`HAVING`).
- The optimizer chooses an execution plan **per query block**; nested subqueries become separate blocks.
- Additional operators beyond basic algebra:
  - **Semi-join** (`T1.X ⋉ T2.Y`): returns a row of T1 as soon as `T1.X` matches any `T2.Y` (no further search). Used to unnest `EXISTS`, `IN`, `ANY`.
  - **Anti-join** (`T1.x ⋈ T2.y`): rejects a T1 row as soon as it matches; returns T1 rows that match **no** T2 row. Used for `NOT EXISTS`, `NOT IN`, `ALL`.

## 18.2 External Sorting

Sorting underlies many algorithms (merge joins, duplicate elimination, grouping). **External sorting** handles files too large for memory using a **sort-merge** strategy:
1. **Create runs**: sort small subfiles in memory, write sorted runs to disk.
2. **Merge passes**: merge sorted runs; the **degree of merging** = number of runs merged per step.

Performance measured by total disk block reads/writes. More buffer space ⇒ larger runs ⇒ fewer passes.

## 18.3 Algorithms for the SELECT Operation

Goal: locate records satisfying a condition, via **file scan** or **index scan**.

| Method | Description |
|---|---|
| **S1** Linear search | Scan every block (brute force) |
| **S2** Binary search | On an ordered (equality/range) file |
| **S3a** Primary index | Use primary index on equality |
| **S3b** Hash key | Use hash on equality |
| **S4** Primary index, multiple | Retrieve a range via primary index |
| **S5** Clustering index | Retrieve multiple records via clustering index |
| **S6** Secondary (B+-tree) index | Equality via secondary index |
| **S7a** Bitmap index | Bitmap on the predicate |
| **S7b** Functional index | Index on the function used |

### Conjunctive (AND) and disjunctive (OR) selection
- **Conjunctive (AND)**: use an individual index on one condition, a composite index, or the **intersection of record pointers** from multiple indexes.
- **Disjunctive (OR)**: harder to optimize; may need to union pointer sets or fall back to scan.

### Selectivity
$$\text{selectivity} = \frac{\text{# tuples satisfying condition}}{\text{total # tuples}}$$
Ranges $0$ (none) to $1$ (all). The optimizer reads **catalog statistics** to estimate selectivity and choose the cheapest method.

## 18.4 Implementing the JOIN Operation

Join (especially EQUIJOIN / NATURAL JOIN) is the most time-consuming operation; it can be two-way or multiway. Main methods:

| Method | Idea | Best when |
|---|---|---|
| **J1 Nested-loop** | For each tuple in outer R, scan all of S | no indexes; small R |
| **J2 Index-based nested-loop** | For each R tuple, probe an index on S's join attr | S has an index on join attr |
| **J3 Sort-merge** | Sort both on join key, then merge | both already sorted / large inputs |
| **J4 Partition-hash** | Hash both on join attr into partitions, join pairs | large, no sort order needed |

### Buffer effects (nested-loop)
Read as many blocks as possible of the **outer-loop file** into memory. Use the **file with fewer blocks as the outer loop** to minimize block accesses.

### Sort-merge join
1. Sort R and S on the join attribute.
2. Merge with pointers; matching key groups produce joined tuples. Also implements PROJECT, UNION, INTERSECTION, SET DIFFERENCE.

### Partition-hash join
Hash both files with the **same** hash function on the join attribute into $M$ partitions; join each corresponding pair $(R_i, S_i)$. Only pairs with the same partition can match.

### Hybrid hash-join
A variant where the joining of one partition is overlapped with the partitioning phase, saving a write-then-reread of those records.

**Join selection factor** = fraction of records in one file joined with another; affects method choice.

## 18.5 PROJECT and Set Operations

- **PROJECT**: keep listed columns; remove duplicates (set semantics) by sorting or hashing. SQL by default **keeps duplicates** unless `DISTINCT` is given.
- **Set operations** (UNION, INTERSECTION, SET DIFFERENCE, CARTESIAN PRODUCT) implemented via **sort-merge** or **hashing**.
- SET DIFFERENCE using anti-join: `DEPARTMENT MINUS EMPLOYEE` ("departments with no employees") becomes an anti-join.

## 18.6 Aggregate Operations and Join Types

### Aggregates (MIN, MAX, COUNT, SUM, AVG)
- Computed by table scan or via an index.
- **MIN/MAX**: with an ascending B+-tree on the attribute, follow the **rightmost** pointer from root to the rightmost leaf.
- **AVG/SUM**: use a **dense** index, or a non-dense index that stores the record count per key (so the sum/count can be derived from the index).
- **COUNT**: number of values derivable from the index.

### Join variations
- **INNER JOIN** (standard): only matching tuples.
- **OUTER JOIN** (LEFT/RIGHT/FULL): keep unmatched tuples, NULL-padded.
- **Semi-join / Anti-join**: see 18.1.
- **Non-equi join**: join on a non-equality condition (e.g., `<`); often requires nested-loop or special handling.

## 18.7 Combining Operations Using Pipelining

- **Materialized evaluation**: compute each operator fully, write a temporary file, pass it on. Goal: minimize temporary files.
- **Pipelining (stream-based)**: operators run concurrently; an operator produces tuples that flow directly into the next, avoiding temp files.

### Iterator model
Each operator implements: `Open()`, `Get_Next()` (returns one tuple), `Close()`. Many iterators can be active simultaneously; some physical operators (e.g., sort) don't fit pipelining and must materialize.

Benefits: avoids disk I/O for intermediates; starts producing results sooner.

## 18.8 Parallel Algorithms for Query Processing

### Architectures
| Architecture | Memory | Disk | Notes |
|---|---|---|---|
| **Shared-memory** | common | shared | multiple CPUs share RAM |
| **Shared-disk** | per-CPU | shared | each CPU has own RAM, all disks visible |
| **Shared-nothing** | per-CPU | per-CPU | most common in parallel DBs |

### Speed-up vs. scale-up
- **Linear speed-up**: time reduces linearly as processors increase (fixed problem size).
- **Linear scale-up**: performance stays constant as both data and processors increase.

### Data partitioning for parallelism
- **Horizontal / round-robin / range / hash partitioning**.
- **Sorting**: if range-partitioned on an attribute, sort each partition in parallel, then concatenate.
- **Selection**: equality on the partition attribute → only that partition.
- **Projection**: parallel, no dup-elim. **Duplicate elimination**: sort then discard.
- **Parallel joins**: split into $n$ smaller joins (equality partitioned, inequality with replication, or parallel partitioned hash join), then union results.
- **Aggregation**: partition on grouping attribute, compute locally per processor.
- **Set operations**: if both inputs hash-partitioned the same way, do in parallel.

### Intra- vs inter-query parallelism
- **Intraquery**: parallelize one query (parallel operators; independent operations in parallel).
- **Interquery**: execute multiple queries concurrently (scale-up; harder on shared-disk/nothing).

## Cost Illustration: Nested-Loop vs Sort-Merge

Suppose $R$ has $b_R$ blocks, $S$ has $b_S$ blocks, and we have $n_B$ memory buffers.

**Nested-loop** (R outer): read R once; for each chunk of R (size $n_B-2$ blocks) scan all of S:
$$\text{cost} \approx b_R + \left\lceil \frac{b_R}{n_B-2} \right\rceil \cdot b_S \text{ block transfers.}$$
Choosing the **smaller relation as outer** minimizes the multiplier.

**Sort-merge** (both sorted): after sorting, a single merged pass reads each block once:
$$\text{cost} \approx \text{sort}(R) + \text{sort}(S) + b_R + b_S.$$
Best when inputs are already sorted or when the result is large (sort-merge avoids quadratic blow-up).

**Index-based nested-loop**: if S has an index on the join attribute with selection cardinality $S_B$, each of R's $n_R$ tuples costs about $\log$ index levels + $S_B$ block reads — often the cheapest when an index exists.

## Pipelining vs Materialization (detail)

- **Materialized**: `σ → temp1; π(temp1) → temp2; ⋈(temp2, S) → result`. Each `→` is a disk write+read.
- **Pipelined**: the iterator for `⋈` calls `Get_Next()` on its child `π`, which calls `Get_Next()` on `σ`, which pulls tuples from the base scan — no temp files. Pipelining shines when the consumer is slower than the producer (tuples are consumed as produced). Operators that need the whole input (sort, aggregation without grouping stream, duplicate elimination) must **materialize** at least partially.

## Parallel Partitioning Choices

| Partitioning | Good for |
|---|---|
| Round-robin | uniform load, scans |
| Hash | equality joins, grouping, set ops |
| Range | range queries, parallel sort |
| Random | general, but poor for locality |

## Chapter Summary

- Query processing: scan → parse → validate → build query tree → optimize → execute.
- SQL → query blocks → relational algebra (+ semi/anti-join for subqueries); external **sort-merge** for large files.
- SELECT methods S1–S7 (linear, binary, primary/hash/clustering/secondary/bitmap/functional); selectivity from catalog stats.
- JOIN methods: nested-loop, index-based, sort-merge, partition-hash (hybrid variant). Buffer space and outer-file choice matter.
- Aggregates via scan or index (B+-tree rightmost for MIN/MAX). Pipelining avoids temp files via iterators (`Open/Get_Next/Close`).
- Parallelism: shared-memory/disk/nothing; speed-up vs scale-up; partitioning strategies; intra- vs inter-query parallelism.
