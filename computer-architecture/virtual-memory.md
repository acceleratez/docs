# Virtual Memory

> Each process sees a huge virtual address space; only part resides in physical RAM (the rest on disk). Hardware + OS translate addresses, protect processes from each other, and exploit locality to make disk access rare. This chapter covers address translation, page tables, the TLB, virtually-indexed caches, superpages, protection, and the longest-latency path.

## Concept

- Each process has the **illusion** of a very large, private address space.
- Physical memory is limited and **shared** by all processes; a process keeps part of its virtual memory in RAM, the rest on disk.
- **Locality** makes disk access uncommon. Hardware enforces **isolation** between processes.

## Address translation

Virtual and physical memory are broken into **pages** (fixed-size blocks).

```
Virtual address  =  virtual page number (VPN)  |  page offset
Physical address =  physical page number (PPN) |  page offset
```

The page offset is unchanged; only the page number is translated. Example: 8 KB page → 13-bit offset; remaining high bits are the VPN.

### Memory-hierarchy properties of pages

- A virtual page can be placed **anywhere** in physical memory → **fully-associative** placement.
- Replacement is usually **LRU** (miss penalty is huge, so investing effort to minimize misses pays off).
- A **page table** (indexed by VPN) maps VPN → PPN; the table itself lives in memory.
- **Dirty bit:** set when a page is written, so the OS knows to write it back on eviction.

## TLB (Translation Lookaside Buffer)

The page table is too large to fit on-chip, so a **TLB** caches recent VPN→PPN translations.

- A **TLB miss** requires walking the page table (possibly another miss) → **two memory look-ups** for one word.
- **Larger page size** → more TLB coverage, smaller page table, but more memory waste and larger fault penalty.

```
Virtual page number --> [ TLB: Valid | PPN ] --> Physical page number
                         (hit)                       |
                                         Physical address = PPN | offset
```

### TLB + cache interaction

- **Index with physical address:** must first translate (TLB), then access cache → longer latency.
- **Index with virtual address:** faster, but multiple virtual addresses can map to the same physical address — they must map to the *same* cache location, else two copies of one physical word exist (coherence bug).

The common design: **Virtually Indexed, Physically Tagged (VIPT)** — index with the virtual address (fast), compare tags physically.

### VIPT constraint

The cache index bits must fit within the **page offset**, else aliasing occurs (two virtual pages with the same index but different physical pages collide). With a 16 KB page, 32 B block: 14 offset bits; 5 for block → 9 index bits → max 512 sets = 16 KB direct-mapped, or 32 KB 2-way.

#### Problem 3 (page 16 KB, block 32 B)

- Page offset = 14 bits; block offset = 5 bits → 9 index bits available.
- Largest **direct-mapped** L1 = $2^9 \times 32\text{B} = \mathbf{16\text{ KB}}$.
- Largest **2-way** = $2^9 \times 2 \times 32\text{B} = \mathbf{32\text{ KB}}$.

#### Virtually indexed cache example (Problem, 24-bit VA, 4 KB page)

12-bit offset + 12-bit VPN. The cache must use ≤ 12 index bits (e.g., make a 64 KB cache 16-way). **Page coloring** ensures some virtual and physical bits match so aliasing is avoided.

## Example toy VM system (Problem 2)

8 virtual pages per program, two programs, 8 physical pages total. Processors run `a–z` (virtual) and `A–Z` (physical):

```
TLB:        a→A  c→C  m→M  z→Z
Memory:     A B C D | M N O Z
Disk:       E' F' G' H' | P' Q' | Other files
Page table (prog1): a→A b→B c→C d→D e→E' f→F' g→G' h→H'
Page table (prog2): m→M n→N o→O p→P' q→Q'
```

This shows: hot pages in RAM (A–D, M–O, Z), cold pages on disk (E',F',...), and the TLB caching the most recent translations. A page fault on `e` would bring `E'` from disk into a free physical page and update the TLB + page table.

## Longest latency path

The worst-case load goes through many levels:

1. **TLB miss** → look up page table for virtual page P.
2. Compute the page-table-entry address for P (say it lives in virtual page Q).
3. **TLB miss for Q** (nested) → walk hierarchical tables (ignored in the simplified slide).
4. Access memory location R (L1/L2/memory) to get the translation.
5. Insert translation into TLB → now a **TLB hit**.
6. Tag compare, check L1; on L1 miss check L2; on L2 miss check memory.
7. If the PTE says the page is on disk → **page fault**; OS fetches it from disk, then hardware resumes.

This chain is why TLB misses and page faults dominate tail latency.

### Page fault handling

- TLB miss in MIPS → software exception fills TLB; in x86 → hardware page-table walker.
- If the page is not in memory → **page fault**; OS selects a victim (approx LRU; write back if dirty) and copies the needed page from disk.
- After the fault, hardware resumes transparently.

## Protection

- Hardware + OS cooperate so processes cannot modify each other's memory.
- Special registers are **readable in user mode, writable only in supervisor mode**.
- Simple scheme: OS divides physical memory into per-process contiguous bounds stored in special registers; hardware checks every access is within bounds.
- **Protection bits** (valid, dirty, permission) are tracked in the TLB on a per-page basis.

## Superpages

- Working set 16 MB, 8 KB pages → 2K frequently-accessed pages; a 128-entry TLB is insufficient.
- Increase page size to **128 KB** → one TLB entry covers more → eliminates TLB misses. Cost: memory waste + larger fault penalty.
- Can we change page size at **run-time**? Yes — **coalesce** contiguous hot virtual pages into a **superpage** (must be contiguous in *physical* memory, requiring copying).

### Superpage implementation

At runtime, detect that virtual pages 64–79 are frequently accessed together → coalesce into a 128 KB superpage with a single TLB entry. The 16 physical pages must be moved to be contiguous.

### Ski-rental analogy

Promoting pages to a superpage saves TLB-miss cost $x$ each time, but copying costs $Nx$.
- If you "rent" (take TLB misses) up to $N$ times, then "buy" (copy, cost $Nx$), you're guaranteed ≤ **2× the optimal** cost.
- Concrete: ski rentals $50, new skis $500 → rent 10 times then buy guarantees ≤ 2× optimal.

## Tiled shared LLC example (Problem 1)

32 MB LLC, 8-way, 64 B blocks, 8 KB pages (13-bit offset), 16 tiles, 40-bit physical address.

- #sets = $32\text{MB}/(8\times 64\text{B}) = 64\text{K}$ → 6 offset bits + 16 index bits + 18 tag bits.
- Page offset = 13 bits; page number = 27 bits.
- Bits 14–22 overlap the page-number and index bits. Any 4 of those (e.g., **bits 19–22**) designate the tile number. Example page number assigned to tile 0: `...xxxx0000xxx...` (bits 19–22 = 0).

This shows how OS page allocation can be co-optimized with cache tiling so that a page's physical location determines which cache bank holds it.

## TLB/cache pipeline (VIPT recap)

```
Virtual addr --> [TLB] --> PPN --+
               --> [VIndex] -----+--> cache index
                                 [P-tag compare]  (physically tagged)
```

Tag array stores **physical** tags; data array is indexed by **virtual** bits that lie within the page offset. This gives single-cycle L1 access while staying physically coherent.

## Multi-level and inverted page tables

- **Multi-level (hierarchical) page tables:** the VPN is split into multiple indices, each indexing a level of tables. This saves space when large virtual address spaces are sparsely used (most second-level tables don't exist). The slide's "TLB miss for v.page Q" scenario assumes a two-level walk.
- **Inverted page tables:** instead of one entry per virtual page, keep one entry per *physical* page, hashed by VPN. Smaller, but a lookup may need hashing + chaining. Common in 64-bit systems with huge address spaces.

## TLB reach

**TLB reach** = number of bytes directly coverable by TLB entries = `(#entries) × (page size)`. With 128 entries × 8 KB = 1 MB of reach. If the working set exceeds TLB reach, the miss rate climbs sharply — which is exactly why superpages (large pages) multiply reach without adding entries (128 × 128 KB = 16 MB).

## Demand paging & dirty/reference bits

- **Demand paging:** pages are brought in only when accessed (on page fault). Locality makes this efficient: once the working set is resident, faults become rare.
- **Reference bit:** set on access; OS periodically clears it to approximate LRU for victim selection.
- **Dirty bit:** set on write; an evicted clean page needs no disk write-back, a dirty one does — so clean pages are cheaper to evict.

## Segmentation vs paging

- **Paging** divides memory into fixed-size pages; the OS/hardware hides fragmentation and gives a flat virtual space. Simple to allocate, but may waste intra-page space.
- **Segmentation** divides memory by logical units (code, heap, stack) of variable size; intuitive but suffers external fragmentation.
- Modern systems mostly use **paging** (sometimes with a segment base for thread-local/code separation). The course focuses on paged virtual memory.

## Software vs hardware page-table walk

- **MIPS-style:** a TLB miss raises an **exception**; the OS walks the page table in software and fills the TLB. Simpler hardware, but the miss penalty includes a full trap.
- **x86-style:** a hardware **page-table walker** traverses the multi-level tables and fills the TLB automatically. Faster misses, more complex hardware.
- In both cases, if the page itself is not resident (page fault), the OS must intervene to fetch it from disk.

## Why translation is "free" in practice

Because (1) TLB hit rate is very high (≥99% for good page sizes), and (2) VIPT caches let the index be computed from the virtual address *in parallel* with the TLB lookup, so a hit adds ~0 extra cycles to an L1 access. Only TLB misses and page faults are expensive — hence the relentless focus on TLB coverage (large pages, superpages) in the chapter.

## Summary

- Virtual memory gives each process a large, protected address space; pages map fully-associatively via a page table.
- TLB caches VPN→PPN; a miss costs two+ memory accesses. Larger pages improve TLB coverage at the cost of waste.
- VIPT caches index virtually, tag physically; index bits must fit in the page offset to avoid aliasing.
- Protection via supervisor-only registers and per-page protection bits.
- Superpages coalesce hot pages (ski-rental decides when to "buy"); page faults are handled by the OS and resumed transparently.
- Next: DRAM organization, scheduling, and speculative-execution attacks (Chapter 10).
