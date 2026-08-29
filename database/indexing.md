# Indexing Structures for Files and Physical Database Design

## Introduction

- An **index** speeds up retrieval for certain search conditions; it provides a **secondary access path** (independent of the file's physical order).
- Any field can be indexed; multiple indexes can coexist. Most are built on **ordered files** using tree structures.
- Trade-off: indexes accelerate queries but slow down updates (every update must also update the index) and consume storage.

## 17.1 Single-Level Ordered Indexes

An ordered index stores each value of the **indexing field** with a list of pointers to the disk blocks holding records with that value; index entries are ordered by the field.

### Primary index
- Built on the **ordering key field** of an ordered file.
- One index entry per **block** of the data file: `(K(i), P(i))` where `K(i)` is the key and `P(i)` points to the block.

### Clustering index
- Used when the ordering field is **non-key** (many records share the same value). Records physically ordered on that clustering field; one index entry per distinct value points to the first block of that group.

### Secondary index
- Built on **any non-ordering field**; a data file may have several. Usually needs more space and longer search than a primary index, but improves access for arbitrary records.

### Dense vs. sparse
| Type | Definition |
|---|---|
| **Dense** | An index entry for **every** search-key value in the data file |
| **Sparse** | Index entries for **only some** search-key values (typically one per block); requires the file to be ordered on the key |

### Handling insertion/deletion in primary indexes
Moving records changes key positions. Solutions: unordered **overflow file**, or a **linked list of overflow records** chained from the index entry.

| Index | Field | Dense/Sparse | Notes |
|---|---|---|---|
| Primary | ordering key | sparse (per block) | one per ordered file |
| Clustering | non-key ordering | per distinct value | groups records physically |
| Secondary | any field | usually dense | many allowed per file |

## 17.2 Multilevel Indexes

To shrink the remaining search space, build the index itself as an index:
- **First (base) level**: the index file.
- **Second level**: a primary index *on* the first level.
- **Third level**: a primary index on the second, etc.

This yields a **two-level (or multi-level)** structure resembling **ISAM** (Indexed Sequential Access Method). Each level cuts the search space, at the cost of extra storage and update complexity.

## 17.3 Dynamic Multilevel Indexes: B-Trees and B+-Trees

### Tree terminology
- Node (except root) has one parent and ≥0 children; **leaf** = no children; **internal (nonleaf)** node guides search. **Unbalanced** if leaves sit at different levels (bad).

### B-Tree (order $p$)
- Always **balanced**; each node at least half full; search space never wastes excessively.
- A node holds at most $p-1$ search values with $p$ child pointers.
- Search values and **data pointers** can appear in internal nodes.

### B+-Tree (the dominant index structure)
- **Data pointers only at leaf nodes**; each leaf has an entry for every search-field value, with a data pointer to the record (key field) or to a block of pointers (non-key field).
- **Internal nodes** store copies of search values solely to route the search (repeated from leaves).
- Leaves are typically linked for efficient **range scans** and sequential access.

**Node structure (B+ of order $q$):**
- Internal node: $q-1$ search values + $q$ pointers.
- Leaf node: $q-1$ search values + $q-1$ data pointers (+ sibling pointer).

**Search algorithm (key $K$):**
1. Start at the root; compare $K$ with values in the node to choose the correct child pointer.
2. Descend until reaching a leaf.
3. Within the leaf, locate $K$ and follow its data pointer.

**Insertion/deletion** maintain balance: nodes split when overflowing and merge/redistribute when underfull (≥ half full), possibly growing/shrinking the tree height at the root.

| Feature | B-Tree | B+-Tree |
|---|---|---|
| Data pointers location | internal + leaf | leaf only |
| Leaf linkage | no | yes (range scans) |
| Redundant keys in internal nodes | no | yes (routing only) |
| Typical use | rare | standard DB index |

## 17.4 Indexes on Multiple Keys

- **Composite (multi-attribute) keys**: ordering on a concatenated key value.
- **Partitioned hashing**: hash on combined attributes; good for equality on all parts.
- **Grid files**: an array with one dimension per search attribute; a cell points to blocks satisfying the combined predicate (good for multi-dimensional range/equality).

## 17.5 Other Types of Indexes

### Hash indexes
Secondary structure; index entries `(K, Pr)` or `(K, P)` where `Pr` points to the record and `P` to the block. Uses hashing on a field other than the primary organization's.

### Bitmap indexes
- For columns with few distinct values over many rows.
- One **bit array** per distinct value; bit $i$ is set if row $i$ has that value. Efficient for `AND/OR` combinations and aggregation. Also used as bitmaps attached to B+-tree leaf entries.

### Function-based indexes
The index key is the result of a function on field(s). Example: `UPPER(Lname)` so case-insensitive searches use the index. (Introduced in Oracle.)

### Logical vs. physical indexes
- **Physical index**: pointer is the physical record address; must change if the record moves.
- **Logical index**: entries `(K, Kp)` use a logical key, robust to physical relocation.

## 17.6 General Issues; Index Creation; Tuning

### Creating indexes (SQL)
```sql
CREATE [UNIQUE] INDEX idx_emp_dno
  ON EMPLOYEE(Dno ASC, Salary DESC);   -- clustered/unique optional; multi-attribute allowed
```
Secondary indexes complement the primary access method and can be built on any primary record organization.

### Indexing of strings
Variable-length strings limit fan-out; **prefix compression** stores only the prefix needed to distinguish keys directed to subtrees.

### Tuning
Re-evaluate dynamically; revise initial choices when:
- A query is slow due to a missing index.
- An index is never used.
- An index is updated too often (built on a frequently changing attribute).

### Additional issues
- **Key constraint enforcement**: a `UNIQUE` index rejects duplicates; non-key indexes permit duplicates.
- **Fully inverted file**: secondary index on every field.
- **Indexing hints** in queries suggest which index to use.
- **Column-based storage**: stores columns together (vs. row), freeing index placement and helping read-only/analytical queries.

## 17.7 Physical Database Design

Goals: choose structures that guarantee good performance; requires knowing the **job mix** (queries + transactions).

### What to analyze
- Expected frequency of each query/transaction; **80-20 rule** (20% of queries cause 80% of load).
- Time constraints → selection attributes with deadlines are candidates for primary access structures.
- Update frequency → minimize access paths on frequently updated files (updating indexes slows writes).
- Uniqueness → put access paths on all candidate keys / unique attributes.

### Design decisions
- **Whether to index** an attribute (is it a key? used in a query/join?).
- **What to index** (single vs. composite).
- **Clustered index**: at most **one per table** (it dictates physical row order).
- **Hash vs. tree**: hash indexes are O(1) but **do not support range queries**; B+-trees support both equality and ranges.
- **Dynamic hashing**: appropriate for very volatile files.

## ISAM (Indexed Sequential Access Method)

A classic **multi-level primary index** organization:
- The data file is **ordered** on the primary key.
- A **cylindrical index** (one entry per cylinder) points to a **track index** (one entry per track), which points to the data blocks.
- Overflow area handles insertions; over time overflow chains degrade performance, requiring periodic reorganization.
- ISAM is static (pre-allocated levels); B+-trees are the dynamic successor.

## Worked B+-Tree Example

Insert keys into an order-$p$ B+-tree: keys are placed in leaves; internal nodes hold separator copies to route searches; when a node exceeds $p-1$ values it **splits** (median moves up), possibly growing the root (increasing tree height by 1). Deletions **merge/redistribute** when a node falls below the half-full minimum.

Example (order 3, values inserted 8, 5, 1, 7, 3, 12, 9, 6): nodes never exceed 2 search values; splits push medians upward, keeping all leaves at the same depth — the defining B+-tree property.

## When to Use Which Index

| Need | Recommended index |
|---|---|
| Equality + range on a key | B+-tree (primary or secondary) |
| Equality-only, very fast | Hash index |
| Low-cardinality column + AND/OR filters | Bitmap index |
| Case-insensitive / derived lookup | Function-based index |
| Physical row order should match access order | One **clustered** index (per table) |
| Multi-dimensional range | Grid file / partitioned hashing |

**Rule of thumb**: create indexes on candidate keys (uniqueness) and on attributes heavily used in `WHERE`/`JOIN`/`ORDER BY`; avoid indexing frequently updated or low-selectivity columns.

## Chapter Summary

- Indexes = secondary access paths; ordered single-level types: primary (ordering key), clustering (non-key ordering), secondary (any field); dense (every key) vs sparse (per block).
- Multilevel indexes (ISAM-like) reduce search space; dynamic versions use **B-trees** and **B+-trees** (leaf-only data pointers, linked leaves, balanced, half-full minimum).
- Multi-key: composite keys, partitioned hashing, grid files. Other indexes: hash, bitmap (low-cardinality columns), function-based, logical vs physical.
- Physical design picks indexes by query/update frequency, uniqueness, clustering (one/table), and hash-vs-tree (range support). Indexes boost reads but cost writes.
