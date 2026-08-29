# Introduction to Transaction Processing Concepts and Theory

## 20.1 Introduction

A **transaction** is a logical unit of database processing — an executing program that accesses/updates the DB, bounded by **begin** and **end transaction** statements. Types: **read-only** and **read-write**.

- **Single-user DBMS**: at most one user at a time (e.g., home computer).
- **Multiuser DBMS**: many users access concurrently (e.g., airline reservations) — requires high availability and fast response.
- **Multiprogramming** interleaves processes; **interleaved** (time-sliced) vs **parallel** (truly simultaneous on multiple CPUs) execution.

## Database Items, Reads, and Writes

- The database is a collection of named **data items**; the size of an item is its **granularity** (attribute value, record, or disk block). Transaction concepts are independent of granularity.
- **`read_item(X)`**: copies item X from disk block → memory buffer → program variable X.
- **`write_item(X)`**: copies program variable X → buffer → writes the disk block back.
- **Read set** = all items a transaction reads; **Write set** = all items it writes.

The DBMS keeps several main-memory **buffers** (database cache); a **buffer replacement policy** (e.g., LRU) chooses which to evict when full.

## Concurrency Problems (uncontrolled execution)

When concurrent transactions interleave on shared items without control:

| Problem | Description |
|---|---|
| **Lost update** | Two transactions read then write the same item; one update overwrites the other, losing it. |
| **Temporary update** | T1 writes X, then fails; T2 reads X (the uncommitted value) before T1's rollback. |
| **Incorrect summary** | T1 computes a sum over items while T2 updates some of them → sum is inconsistent. |
| **Unrepeatable read** | T reads X, then another transaction changes X; T's second read of X differs from the first. |

Some form of **concurrency control** is required to avoid these.

## ACID Properties

A correct transaction must satisfy **ACID**:
- **Atomicity**: executed entirely or not at all (all-or-nothing).
- **Consistency preservation**: takes the DB from one consistent state to another.
- **Isolation**: appears uninterrupted by other transactions.
- **Durability (permanency)**: once committed, changes persist despite failures.

## Recovery and the System Log

### Why recovery?
Failures: system crash, transaction/local errors, concurrency-control abort, disk failure, catastrophe. The system must keep enough info to recover quickly.

### Transaction states
`Active → Partially committed → Committed / Aborted`, with `BEGIN_TRANSACTION`, `READ/WRITE`, `END_TRANSACTION`, `COMMIT_TRANSACTION`, `ROLLBACK (ABORT)`.

### System log
- A sequential, append-only file (backed up periodically) used for **undo/redo**.
- **Commit point**: reached when the transaction has finished all DB operations *and* written its commit record to the log. Before commit, the log buffer is **force-written** to disk so recovery can find/redo committed work.
- On failure, transactions with a start but no commit record are undone.

## Isolation Levels

### The text's levels (0–3)
- **Level 0**: does not overwrite dirty reads of higher levels.
- **Level 1**: no lost updates.
- **Level 2**: no lost updates, no dirty reads.
- **Level 3 (true isolation)**: repeatable reads (in addition to level 2).

### SQL standard isolation levels (Table 20.1)
| Isolation level | Dirty read | Nonrepeatable read | Phantom |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | prevented | possible | possible |
| REPEATABLE READ | prevented | prevented | possible |
| SERIALIZABLE | prevented | prevented | prevented |

**Snapshot isolation**: a transaction sees only the committed values as of the snapshot when it started — prevents dirty reads, nonrepeatable reads, and phantoms; used in several commercial DBMSs.

## Schedules and Serializability

A **schedule (history)** is the order of execution of operations from all transactions; operations from different transactions may be interleaved.

### Conflicting operations
Two operations conflict if they belong to different transactions, access the **same item X**, and **at least one is `write_item(X)`**. Conflict types: **read-write** and **write-write**. Changing their order changes the result.

### Recoverability
- **Recoverable schedule**: no committed transaction ever needs rollback. Nonrecoverable schedules must be disallowed.
- **Cascading rollback**: an uncommitted transaction must be rolled back because a transaction it read from aborts.
- **Cascadeless schedule**: avoids cascading rollback — a transaction may not read/write X until the last transaction that wrote X has committed/aborted.
- **Strict schedule**: may neither read nor write X until the last writer of X has committed/aborted (simplest recovery: restore the before-image).

### Serializability
- A **serial schedule** runs transactions one after another (T1 then T2, or T2 then T1) — correct but limits concurrency.
- A **serializable schedule** is **equivalent to some serial schedule** — it gives the benefit of concurrency without sacrificing correctness. This is the gold standard for concurrent execution.

### Conflict serializability
Two schedules are **conflict equivalent** if the relative order of every pair of conflicting operations is the same. A schedule is **conflict serializable** iff it is conflict equivalent to a serial schedule.

### Testing conflict serializability (precedence graph + Algorithm 20.1)
1. For each transaction $T_i$, create a node.
2. For each conflicting pair $O_i$ (in $T_i$) before $O_j$ (in $T_j$), draw a directed edge $T_i \to T_j$.
3. The schedule is conflict serializable **iff the precedence graph is acyclic**. A cycle means non-serializable.

### View serializability
Two schedules are **view equivalent** if each read sees the same write, and final writes are the same. A schedule **view serializable** iff view equivalent to a serial schedule. With the **constrained write assumption** (no blind writes), view and conflict serializability coincide. **Debit-credit** transactions (unconstrained writes) can be serializable under less-stringent conditions.

## Concurrency Control Protocols (locking & 2PL)

To guarantee serializability without testing every schedule, the DBMS enforces **protocols** (sets of rules).

### Locking
- A **lock** restricts access to an item. Two common modes:
  - **Shared (S) lock**: multiple transactions may read; no writing.
  - **Exclusive (X) lock**: only the holder may read/write.
- Compatibility: S/S compatible; S/X and X/X conflict.

### Two-Phase Locking (2PL)
A transaction acquires locks in two phases:
1. **Growing phase**: locks are acquired, none released.
2. **Shrinking phase**: locks are released, none acquired.
- **Theorem**: every schedule obeying 2PL is conflict serializable.
- **Variants**:
  - **Basic 2PL**: as above.
  - **Strict 2PL**: hold all exclusive locks until after commit/abort (aids recovery, avoids cascading rollback).
  - **Rigorous 2PL**: hold all locks (shared and exclusive) until after commit/abort.

### Deadlock handling
A **deadlock** = cycle of transactions each waiting on a lock held by the next. Handling:
- **Deadlock prevention**: impose an order on resource requests (e.g., request locks in a global order), or use **wait-die / wound-wait** (timestamp-based) so only one "younger" transaction waits.
- **Deadlock detection**: build a **wait-for graph**; if a cycle exists, pick a **victim** transaction to **rollback** (abort/restart).
- **Timeout**: abort a transaction if it waits longer than a threshold.

### Starvation
A transaction repeatedly blocked/rolled back. Avoid by fairness policies (e.g., prioritize by timestamp, lift locks in FIFO).

## Transaction Support in SQL

- No explicit `BEGIN_TRANSACTION` in standard SQL; every transaction must have an explicit end: `COMMIT` or `ROLLBACK`.
- `SET TRANSACTION` sets access mode (`READ ONLY` / `READ WRITE`) and **isolation level** (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`).
- Diagnostic area size option indicates how many conditions can be held simultaneously.

```sql
SET TRANSACTION READ WRITE ISOLATION LEVEL REPEATABLE READ;
-- ... SQL statements ...
COMMIT;          -- or ROLLBACK;
```

## Recovery Algorithms: Undo, Redo, and WAL

- **Write-Ahead Logging (WAL)**: the log record for an update must be written to stable storage **before** the modified database block is written to disk. This guarantees that, after a crash, the log contains enough information to redo committed work and undo uncommitted work.
- **Undo**: using the log's **before-image**, restore items changed by aborted/uncommitted transactions to their old values.
- **Redo**: using the **after-image**, reapply changes of committed transactions that had not yet reached disk.
- **Checkpointing**: periodically flush all committed updates to disk and record a checkpoint in the log, so recovery only processes transactions active since the last checkpoint (speeds restart).
- **Transaction types of failures**: computer/system crash, transaction or system error, local exception, concurrency-control abort, disk/catastrophic failure (longer recovery).

### ACID ↔ failure mapping
| Property | Mechanism |
|---|---|
| Atomicity | undo of partial work via log |
| Durability | redo of committed work (WAL + force log at commit) |
| Consistency | constraints + transaction logic |
| Isolation | concurrency control (locking/2PL, serializability) |

## 2PL Example and a Non-Serializable Schedule

A schedule violating 2PL can be non-serializable. Consider T1: `Xlock(A); read A; Xlock(B); write B; unlock(A); unlock(B)` and T2 interleaved taking locks out of phase — if a transaction releases a lock then acquires another, the growing/shrinking phases overlap, and a cycle may appear in the precedence graph ⇒ non-serializable. 2PL forbids that by enforcing the two phases, which is why it guarantees conflict serializability.

## Conflict Serializability Test (worked)

Given schedule S with T1: `r1(X) w1(X)` and T2: `r2(X) w2(X)` interleaved as `r1(X) r2(X) w1(X) w2(X)`:
- T1 reads X before T2; T2 writes X after T1's write ⇒ conflicting `w1(X)` vs `r2(X)` and `w1(X)` vs `w2(X)` ⇒ edges T1→T2 (and the later write conflict). Graph acyclic ⇒ serializable, equivalent to T1 then T2.

If instead we had `w1(X) w2(X) r1(X)`, the conflicting pair `w2(X)` before `r1(X)` adds edge T2→T1, while `w1` before `w2` adds T1→T2 ⇒ **cycle** ⇒ not conflict serializable.

## Chapter Summary

- A transaction is an atomic unit of DB work; ACID (Atomicity, Consistency, Isolation, Durability) is mandatory.
- Uncontrolled concurrency causes lost updates, temporary updates, incorrect summaries, unrepeatable reads.
- The system log (force-written at commit) enables undo/redo recovery; schedules must be recoverable, cascadeless, or strict.
- Serializable schedules ≈ a serial schedule; test conflict serializability via an **acyclic precedence graph**.
- Concurrency protocols: **locking** with **2PL** (growing/shrinking phases) guarantees serializability; **strict 2PL** simplifies recovery. Deadlocks handled by prevention, detection+rollback, or timeout. SQL sets isolation via `SET TRANSACTION`/`COMMIT`/`ROLLBACK`.
