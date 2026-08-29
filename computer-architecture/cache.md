# Cache Hierarchy

> A cache is a small, fast SRAM that exploits locality to hide DRAM's ~300-cycle latency. This chapter covers why caches work, hit/miss metrics, address decomposition (tag/index/offset), direct-mapped/set-associative/full-associative organization, miss classification, replacement/write policies, prefetching, victim caches, and multi-core cache layout.

## Why caches?

- DRAM is dense but **slow**: a memory access can take **~300 cycles** today.
- **Cache** uses faster **SRAM**, closer to the core. Works because of **locality**.
- Browsers cache web pages by the same principle.

### Memory hierarchy (typical)

| Level | Capacity | Latency |
|---|---|---|
| Registers | 1 KB | 1 cycle |
| L1 (I/D) | 32 KB | ~2 cycles |
| L2 | 2 MB | ~15 cycles |
| Memory | 16 GB | ~300 cycles |
| Disk | 1 TB | ~10M cycles |

As you go further out: **capacity ↑, latency ↑**. The cache lives at the top, small and fast.

## Locality

- **Temporal locality:** if you used data recently, you'll likely use it again (loop variables `sum`, `i` read/written repeatedly).
- **Spatial locality:** if you used data recently, you'll likely access neighbors (arrays stored contiguously).

```c
sum = 0;
for (i = 0; i < MAX; i++)
    sum = sum + a[i];   // temporal: sum,i;  spatial: a[i], a[i+1], ...
```

## Hit / Miss

- **Cache hit:** requested data is in cache → fast return.
- **Cache miss:** not in cache → wait for slower memory.
- **Hit rate** = fraction served by cache. **Miss rate** = 1 − hit rate. Typical hit rate ≥ 95%.
- **Avg access time (AAT):**

$$
\text{AAT} = \text{hit\_rate} \times \text{hit\_time} + \text{miss\_rate} \times \text{miss\_penalty}
$$

Example: no hierarchy = 300 cyc. With a 1-cycle L1 at 95% hit, miss → ~301 cyc:

$$
\text{AAT} = 0.95\times 1 + 0.05\times 301 \approx 16 \text{ cycles}
$$

vs 300 without cache — a **~19× effective speedup** from one small cache.

### Multi-level cache — Problem 1

Access times: L1=1, L2=10, L3=30, Mem=300 cyc. MPKI (misses per kilo-instr): L1=20, L2=10, L3=5.

- **With L3:** $1000 + 10\times20 + 30\times10 + 300\times5 = 1000 + 200 + 300 + 1500 = \mathbf{3000}$ cyc/1K instr.
- **Without L3:** $1000 + 10\times20 + 10\times300 = 1000 + 200 + 3000 = \mathbf{4200}$.

**Keep the L3** — it saves 1200 cycles/1K instr by absorbing the expensive memory references.

## Cache organization: where do we put things?

Address splits into **Tag | Index | Offset**.

- **Offset:** byte/word within a block (line). `offset bits = log2(block size)`.
- **Index:** which set. `index bits = log2(#sets)`.
- **Tag:** leftover bits to identify the block within that set. `tag + index + offset = address width`.

### Mapping schemes

| Scheme | Placement | Conflict behavior | Power |
|---|---|---|---|
| **Direct-mapped** | each address → exactly one set/way | high conflict misses | lowest |
| **Set-associative (N-way)** | block → any of N ways in a set | fewer conflicts | more (read N tags+data) |
| **Fully-associative** | one set, all ways | no conflicts | highest (search all) |

Larger **block/line size** → exploits spatial locality, smaller tag array, but more traffic and more wasted space on a miss.

### Capacity equations

$$
\text{cache size (data)} = \#\text{sets} \times \#\text{ways} \times \text{block size}
$$

$$
\text{tag array size} = \#\text{sets} \times \#\text{ways} \times \text{tag size}
$$

$$
\text{index bits} = \log_2(\#\text{sets});\quad \text{offset bits} = \log_2(\text{block size})
$$

### Worked — Problem 4 (16-way, 64 KB, 64 B, 40-bit addr)

- #sets = $64\text{KB} / (16 \times 64\text{B}) = 64$.
- index bits = 6; offset bits = 6; tag bits = $40 - 6 - 6 = 28$.
- tag array = $64 \times 16 \times 28\text{ b} = 28{,}672\text{ b} = \mathbf{28\text{ Kb}}$ (3.5 KB).

### Worked — Problem 5 (fully-assoc, 8 KB, 64 B, 40-bit)

- #sets = 1; #ways = $8\text{KB}/64\text{B} = 128$.
- index bits = 0; offset bits = 6; tag bits = 34.
- tag array = $1 \times 128 \times 34\text{ b} = 4{,}352\text{ b} = \mathbf{544\text{ bytes}}$.

### Hit/miss trace — Problem 2 (direct-mapped, 4 sets)

Access pattern `A B B E C C A D B F A E G C G A`, blocks map A→0, B→1, C→2, D→3, E→0, F→1, G→2 (repeats mod 4):

`M M H M M H M M H M H M M M M M` (each first touch of a block = miss; repeats that map to the same set evict).

### Worked — Problem 3 (2-way, 2 sets)

Same pattern, A→0, B→1, C→0, D→1, E→0, F→1, G→0: `M M H M M H M M H M H M M M H M`. The extra way absorbs some conflicts that the direct-mapped cache would have missed.

### Example 2 (direct-mapped, 16 sets, 64 B) — address decode

`Offset = addr % 64`; `Index = (addr/64) % 16`; `Tag = addr/1024`. For addresses 8, 96, 32, 480, 976, 1040, 1096: decode tag/index/offset and mark H/M. Multiple addresses sharing an index but different tags conflict; same tag+index = hit.

### Example 4 (2-way, 8-bit addr, 8 B blocks)

Requests `4,7,10,13,16,24,36,4,48,64,4,36,64,4`: `M H M H M M M H M M H M M M M`.

## Types of misses

| Type | Cause | When observed |
|---|---|---|
| **Compulsory** | first access to a block | infinite cache (no capacity limit) |
| **Capacity** | working set > cache; block evicted before reuse | fully-associative cache |
| **Conflict** | two blocks map to same set | moving from fully-assoc → direct-mapped |

Rule of thumb: a **2-way cache of capacity N/2** has about the same miss rate as a **1-way cache of capacity N** (associativity trades for size). A fully-associative cache can *still* have more misses than direct-mapped in pathological cases, but generally conflict misses dominate direct-mapped designs.

## CPI with caches — Example 3

Pipeline CPI = 1 if all ld/st are L1 hits. 40% of instrs are ld/st; 85% hit L1 (1 cyc); 50% of 10-cyc L2 accesses miss; memory = 100 cyc. Start with 1000 instructions:

$$
1000 + (400 \times 0.15 \times 10) + (400 \times 0.15 \times 0.5 \times 100) = 1000 + 600 + 3000 = 4600
$$

$$
\text{CPI} = 4600/1000 = \mathbf{4.6}
$$

A 95%-hit L1 still multiplies CPI by 4.6 because the 15% miss tail is expensive.

## Cache basics & inclusion

- L1 split into I-cache and D-cache; L2/L3 are **unified**.
- Hierarchy can be **inclusive** (L1 ⊂ L2), **exclusive** (no overlap), or non-inclusive.
- On a write: **write-allocate** vs **write-no-allocate**.
- On a write: **write-back** vs **write-through** (write-back reduces traffic; write-through simplifies coherence).
- Reads get higher priority; writes are buffered.
- L1 does parallel tag/data access; L2/L3 serial.

## Tolerating miss penalty

- **Non-blocking cache:** OoO execution does useful work during a miss; multiple outstanding misses tracked.
- **Prefetching** (HW/SW) into prefetch buffers — but aggressive prefetching increases bus contention.

## Reducing miss rate

- **Larger block:** fewer compulsory misses, lower miss penalty via spatial locality — but more traffic, wasted space, more conflict misses.
- **Larger cache:** fewer capacity/conflict misses — but slower access.
- **Higher associativity:** fewer conflict misses — but more energy (rule of thumb above).

## Techniques to reduce misses

- **Victim caches:** a small (4–8 entry) buffer of recently discarded blocks, checked before going to L2. Acts like extra associativity for the few hot conflicting sets.
- **Better replacement:** pseudo-LRU, NRU, DRRIP (insertion/promotion/victim selection).
- **Prefetching & compression.**

### Replacement policies

- **Pseudo-LRU:** maintain a binary tree; track which side touched more recently; simple bit ops.
- **NRU (Not-Recently-Used):** each block has a bit, cleared on touch; if all zero, set all; evict a block with bit = 1.

### Prefetching

- **Stream buffers:** on every miss, bring in multiple consecutive lines; shift the queue as the top is consumed.
- **Stride-based:** track (last address, stride) per load; an FSM detects a consistent stride and issues prefetches.
- Tradeoffs: **coverage** (how many misses avoided) vs **accuracy** (wasted bandwidth) vs **timeliness** (issue early enough to hide latency, late enough to avoid eviction before use). Prefetched data often goes to a **separate buffer** to avoid cache pollution.

## Shared vs private caches (multi-core)

```
Shared L2:                 Private L2:
P1 P2 P3 P4  L1 L1 L1 L1   P1 P2 P3 P4
      \ | /      L2          L1 L1 L1 L1
       L2                       L2 L2 L2 L2
```

- **Shared L2 advantages:** dynamic space allocation, no replication waste, faster/easier coherence, easier to find data on a miss.
- **Private L2 advantages:** smaller → faster access, private bus → less contention.

## UCA and NUCA

- Small caches are **UCA (Uniform Cache Access)** — constant latency regardless of location.
- Large multi-MB caches are **NUCA (Non-Uniform Cache Access)** — a tile (core + L1 + a slice of L2) has lower latency to its local bank. Issues: **mapping, migration, search, replication**. Shared NUCA distributes the LLC across tiles; the controller forwards requests to the right bank and handles coherence.

## Example 1 (4-way, 32 KB, 32 B, 32-bit addr)

- #sets = $32\text{KB}/(4\times 32\text{B}) = 256$.
- index bits = 8; offset bits = 5; tag bits = $32-8-5 = 19$.
- tag array = $256 \times 4 \times 19 = 19{,}456\text{ b} = \mathbf{19\text{ Kb} \approx 2.375\text{ KB}}$.

## Write policies in detail

### Write-through

Every write to cache → also write to memory. Keeps cache and memory consistent; simple. But **every** store hits the memory bus — wasteful if a location is written often.

### Write-back

Mark block **dirty**; write to memory only on **eviction**. Coalesces multiple writes to a block into one memory write. Needs a dirty bit; memory may be stale (must supply data on a later read that maps to the same block, writing back first). Simpler coherence (memory always current) is the write-through advantage; write-back wins on traffic.

### Write-allocate vs write-no-allocate

- **Write-allocate (allocate on write):** on a write miss, load the block into cache, then update. Good if the data will be re-used soon.
- **Write-no-allocate (write-around):** write goes straight to memory; cache untouched. Good when data is written but not immediately re-read (e.g., `for i: a[i]=i;`).
- Reads *always* allocate (spatial/temporal locality).

## Summary

- AAT = hit×hit_time + miss×penalty; keep hit rate high and penalty low via hierarchy.
- Tag/Index/Offset decomposition determines organization and tag-array size.
- Direct-mapped (cheap, conflict-prone) ↔ set-assoc (fewer conflicts, more power) ↔ fully-assoc (no conflicts, costly).
- Misses: compulsory / capacity / conflict. Reduce via size, associativity, block size, victim caches, prefetching, smart replacement.
- Write-back + write-allocate is common; write-through simplifies coherence.
- Multi-core: shared (dynamic) vs private (fast) L2; NUCA for large LLCs.
- Next: virtual memory — the OS/hardware layer that maps pages and protects processes (Chapter 9).
