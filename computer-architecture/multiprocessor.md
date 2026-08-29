# Multiprocessors

> When one core isn't enough, we use many. This chapter covers Flynn's taxonomy, shared vs distributed memory (UMA/NUMA), cache coherence (MSI/MESI snooping and directories), synchronization primitives (locks), and the crucial distinction between coherence and consistency.

## Taxonomy (Flynn)

| Class | Meaning | Status |
|---|---|---|
| **SISD** | single instruction, single data | uniprocessor |
| **SIMD** | single instruction, multiple data | vector architectures (less flexible) |
| **MISD** | multiple instruction, single data | no commercial multiprocessor |
| **MIMD** | multiple instruction, multiple data | most modern multiprocessors (most flexible) |

MIMD dominates because off-the-shelf cores are easy to replicate and it adapts to any workload.

## Memory organization

### Centralized shared memory (SMP / UMA)

- Multiple processors attached to a **single centralized memory**.
- All processors see the same memory organization → **Uniform Memory Access (UMA)**.
- "Shared-memory" = all processors can address the full address space.
- **Bandwidth bottleneck?** Only if caches are small and you exceed ~a dozen processors. Large caches make SMP practical.

### Distributed memory (NUMA)

- Each node has its own memory → **Non-Uniform Memory Access (NUMA)**: local memory is fast, remote memory is slow.
- Scales to many more nodes than a centralized bus allows.

```
SMP:   P1..Pn -- bus -- Memory        (UMA)
NUMA:  Node(P,M)--net--Node(P,M)       (local fast, remote slow)
```

## Cache coherence

**Problem:** with private caches, a block can have multiple copies that diverge. Protocols keep caches consistent so a processor reading a location sees the latest write.

### Snooping-based (MSI / MESI)

Each block has a state; a write goes on the bus and sharers **invalidate** their copies.

| State | Meaning |
|---|---|
| **I** (Invalid) | not present / stale |
| **S** (Shared) | clean copy(ies), read-only permission |
| **M** (Modified) | dirty, only valid copy, memory stale |
| **E** (Exclusive, MESI) | clean, only copy, can write without broadcast |

- **MSI**: Invalid, Shared, Modified.
- **MESI** adds **Exclusive** — a clean sole copy, so a write doesn't need a bus upgrade (avoids a broadcast for the common write-to-private-block case).

#### Worked example (MSI flow)

- **P1 Rd X:** miss → bus → memory responds → X in cache-1 **S**.
- **P2 Rd X:** miss → bus → memory responds → X in cache-2 **S** (cache-1 does nothing on a read).
- **P1 Wr X:** has **S** (read-only) → bus upgrade → cache-2 invalidates → cache-1 → **M**.
- **P2 Rd X:** cache-2 **I** → bus → cache-1 snoops, downgrades to **S**, supplies data, memory updated → cache-2 **S**.

A full 4-processor trace (Problem from slides) shows the state machine evolving across `Rd X`, `Rd X`, `Wr X`, `Wr X` (P3 responds since it holds M), `Rd X` (P3 responds + mem writeback), `Rd X` (P3 + P4 both S). The protocol guarantees every read eventually sees the latest write.

### Directory-based

A **directory** tracks each block's sharers (a **presence bit-vector**), avoiding broadcast.

- **States:** Uncached, Shared (≥1 have it, memory up-to-date), Exclusive (one owner, memory stale).
- **Read by processor i:** if dirty=0, read from memory, set p[i]=1; if dirty=1, recall from owner, set SHARED, update memory, dirty=0, set p[i]=1, supply data.
- **Write by processor i:** if dirty=0, supply data, send invalidations to all sharers, dirty=1, p[i]=1.
- Scales better than snooping (no broadcast bus); used in large NUMA systems.

### Write policies

- **Write-invalidate:** gain exclusive access, invalidate others (common; used above).
- **Write-update:** broadcast the new value to sharers (more bandwidth, fewer subsequent misses for readers).

## Synchronization

Critical sections must execute **atomically**. The hardware provides a basic primitive: **atomic read-modify-write**.

- **Atomic exchange:** swap register ↔ memory.
- **Test & set:** read location into register, write 1 (lock free if was 0).
- **Lock / unlock** pattern:

```mips
lock:  t&s  register, location   # atomic: reg = mem; mem = 1
       bnz  register, lock       # spin until we got the 0
       # ---- critical section ----
       st   location, #0         # release
```

When multiple threads run this, only one observes the 0 and enters the critical section; the rest spin until the owner stores 0.

### Why locks matter (bank example)

Two parallel transactions on a $1000 balance, each `Rd; Add $100/$200; Wr`, without a lock → both read 1000, both write 1100/1200 → lost update. A lock serializes them → correct $1300.

## Coherence vs consistency

- **Coherence** guarantees:
  1. **Write propagation** — a write eventually becomes visible to other processors.
  2. **Write serialization** — all processors see writes to *one* location in the *same* order.
- **Consistency** defines the ordering of accesses to **different** locations. It tells the programmer what reorderings the hardware may perform, so they can write correct parallel code.

### Consistency example (the race)

```
Initially A = B = 0
P1:                P2:
  A <- 1             B <- 1
  if (B == 0)        if (A == 0)
    Crit.Sect.         Crit.Sect.
```

The programmer hoped this implements a lock: if both `if`s passed, both would have written before reading the other's flag. But with out-of-order execution and weak consistency, **both** processors can enter the critical section. Coherent caches don't save you — coherence only orders accesses to *the same* location, not the *cross-variable* ordering the algorithm needs. The **consistency model** defines what reorderings are allowed, and disciplined mutual exclusion (real locks) is what makes such code safe.

### Sequential consistency

A multiprocessor is **sequentially consistent** if the result is achievable by:
- maintaining **program order** within each processor, and
- interleaving accesses across processors in an arbitrary fashion.

The example above is *not* sequentially consistent. To implement it you need: program order + write serialization + everyone sees an update before a read. This is **intuitive but extremely slow** (blocks many performance optimizations).

### Relaxed consistency

Sequential consistency is too slow for high performance. The complication arises only with **race conditions** (two threads on shared data, ≥1 writing). If programmers enforce **mutual exclusion** around shared data, the hardware can safely allow some reorderings → **relaxed consistency** balances performance and programming effort. Examples: allowing store→load reordering, or reads to pass writes, with explicit fence/barrier instructions where ordering matters.

## Summary table

| Topic | Key idea |
|---|---|
| Flynn | MIMD is the practical multiprocessor class |
| SMP/NUMA | UMA (shared bus) vs NUMA (distributed, non-uniform) |
| Coherence | MSI/MESI snooping or directory; keep copies consistent |
| MESI | adds Exclusive to avoid write-upgrade broadcast |
| Directory | presence vector; scales without broadcast |
| Sync | atomic RMW (exchange, test&set) builds locks |
| Coherence vs consistency | same-location order vs cross-location order |
| SC vs relaxed | intuitive but slow vs fast but needs disciplined locking |

## MESI state transitions (explicit)

The four MESI states and their key transitions:

| From → To | Trigger |
|---|---|
| I → E | processor reads a block no one else has → gets exclusive clean copy |
| I → S | processor reads a block others also have → shared |
| E → M | processor writes its sole clean copy → becomes dirty (no broadcast needed) |
| S → M | processor writes a shared block → broadcasts invalidate, becomes M |
| M → S | another processor reads → owner downgrades to S, supplies data, memory updated |
| M → I | another processor writes → owner invalidates (its dirty data may be written back) |
| S → I | a write by another processor invalidates my shared copy |

The **Exclusive** state is the key optimization: a write to an E block needs no bus transaction, whereas an S block must broadcast an upgrade.

## Consistency model spectrum

Beyond sequential vs relaxed, real ISAs define specific orderings:

| Model | Allows | Notes |
|---|---|---|
| Sequential (SC) | nothing reordered across processors | intuitive, slow |
| Total Store Order (TSO) | store→load reordering | common on x86 |
| Release Consistency | acquire/release fences separate sync from ordinary accesses | needs explicit locks/barriers |

Programmers reason about these via **fences/barriers**: a lock acquire is a one-way barrier, a release another; ordinary loads/stores between them may be freely reordered by the hardware, which is what delivers the performance.

## False sharing

Two processors write *different* variables that happen to sit in the *same* cache block. Coherence forces the block to bounce between caches (M→I→M) even though no true sharing occurs → severe slowdown. Fix: pad/align frequently-written per-thread data to separate cache lines (typically 64 B).

## Key takeaways

- Coherence keeps one location's copies consistent (propagation + serialization).
- MESI's Exclusive state avoids needless broadcasts; directories scale via presence vectors.
- Locks built from atomic primitives; out-of-order + weak consistency can break naive "locks" → use real mutual exclusion.
- Sequential consistency is the easy-to-reason model but slow; relaxed models win performance when programmers use locks/barriers correctly.

This is the final chapter — together with Chapters 1–10 it covers the full CS1541 arc: from why architecture matters, through pipelining/ILP/OoO, caches/virtual memory/DRAM, to multiprocessor coherence and security.
