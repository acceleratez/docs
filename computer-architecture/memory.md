# Memory & DRAM

> Virtual memory wraps up; then DRAM organization, scheduling policies, and the Meltdown/Spectre speculative-execution attacks. This chapter connects the memory hierarchy down to the DRAM chip, row buffers, scheduling, and how microarchitectural speculation leaks secrets.

## Virtual memory wrap-up (superpages & ski-rental)

- **Superpages**: coalesce contiguous hot virtual pages into one TLB entry (see Ch9). Cost/benefit via the ski-rental problem: promote after ~$N$ TLB misses where copy cost = $N\times$ miss cost → guarantees ≤ 2× optimal.

## Hardware security & speculative-execution attacks

Software security (key management, buffer overflow) is necessary but not sufficient. **Hardware security** adds permission checks, authentication/encryption. The danger: **side channels** and **timing channels** — including Meltdown, Spectre, and SGX.

### The root cause

Spectre and Meltdown exploit the gap between **what software is supposed to do** (the ISA/permission model) and **what the microarchitecture actually does** (speculative execution). Processors *predict* the next instruction and execute it **speculatively**, committing results only if the prediction was correct. During misspeculation, no change is *directly* observable by a program — but it leaves **timing traces** in caches.

> The insight enabling speculation attacks: during misspeculation, nothing is directly observable, but the *fact that speculation occurred* affects how long later instructions take. Those timing signals can be detected and used to extract secret data.

### Meltdown (Intel)

Intel microprocessors **read the memory location before checking permissions**, committing only when permissions are satisfied. But the speculatively-loaded secret is already in cache, so it leaks via a **cache side channel** (e.g., a probe array whose access time reveals which cache line was touched).

```
secret = memory[addr]       # read BEFORE permission check
probe[secret * 256]         # touches a cache line -> measurable timing
```

### Spectre

#### Variant 1 — bounds-check bypass

```c
if (x < array1_size)
    y = array2[ array1[x] ];   // array1[x] is the SECRET
```

The attacker controls `x` (out of bounds). Thanks to branch prediction, the body speculatively executes with a malicious `x`, fetching `array1[x]` (secret) and using it to index `array2`. The **access pattern of `array2`** betrays the secret. The misprediction is later discarded, but the cache trace remains.

#### Variant 2 — branch target injection

```
R1 <- (from attacker)        # attacker steers an indirect branch
R2 <- some secret
Label1: lw [R2]              # gadget touches secret under victim's privileges
```

The attacker trains the branch predictor so the victim's indirect branch speculatively jumps to a gadget that touches secret data. The gadget executes under the victim's privileges during speculation, leaking via cache.

### Defense implications

These attacks show why the **consistency/coherence and speculation model** is a security boundary, not just a performance detail. Mitigations (speculation barriers, cache partitioning, safer prediction) trade performance for safety — reinforcing the course theme that security is now a first-class architectural metric.

## DRAM organization

- DRAM cells have **high density** but must be **refreshed** (dynamic); long latency, high energy.
- Hierarchy: **Processor → Memory Controller → DIMM → Rank → Bank → Array (mat)**.

| Level | Description |
|---|---|
| DIMM | PCB with DRAM chips on front/back |
| Rank | chips that together fill the data bus (×8 or ×16) for one request |
| Bank | subset busy during one request |
| Row buffer | last row read from a bank (acts as a cache) |
| DDR | double data rate (2 transfers/cycle) |

A 64-bit data bus needs 8 ×8 chips or 4 ×16 chips per rank.

## DRAM array access

A row address (**RAS**) arrives first, then a column address (**CAS**). A wide row (e.g., 8 KB) is read into the **row buffer** (overfetch: a 64 B request pulls 8 KB — exploited by spatial locality and by row-buffer hits).

```
16Mb DRAM array = 4096 x 4096 bits
12 row-address bits arrive first (RAS)
12 column-address bits arrive next (CAS)
4096 bits read into row buffer
```

## Capacity & bandwidth example (Problem 1)

Server: 2 sockets × 4 channels × 2 dual-rank DIMMs × 16 chips (×4) × 4 Gb:

$$
\text{Capacity} = 2 \times 4 \times 2 \times 2 \times 16 \times 4\text{ Gb} = 256\text{ GB}
$$

Bandwidth at 800 MHz, DDR, 64-bit:

$$
\text{BW} = 2 \times 4 \times 800\text{M} \times 2\ (\text{DDR}) \times 64\text{ b} = 102.4\text{ GB/s}
$$

## Chip capacity (Problem 2)

A mat has 512 rows × 512 cols; 512 mats per bank; 8 banks per chip:

$$
\text{chip} = 512 \times 512 \times 512\ \text{mats} \times 8\ \text{banks} = \mathbf{1\ Gb}
$$

## Organizing a rank/bank

- Few DIMMs per bus (electrical constraints); 1–4 ranks per DIMM.
- **Energy efficiency:** wide-output chips (×16) activate fewer chips per request.
- **Capacity:** narrow-output chips (×4) boost rank capacity (more chips per rank).
- A rank splits into many **banks (8–16)** for parallelism (memory-level parallelism).
- Large arrays → wide rows → wide row buffers (overfetch).

## Row buffer & scheduling

Each bank has one row buffer acting as a DRAM-internal cache. Access times:

| Case | Latency | Why |
|---|---|---|
| **Row-buffer hit** | ~20 ns | data already in buffer; just move to pins |
| **Empty** (cold) | ~40 ns | read array, then move to pins |
| **Conflict** | ~60 ns | precharge bitlines, read new row, move to pins |

Plus queueing (tens of ns) and bus transfer (~10 ns).

### Open-page vs closed-page vs oracular

| Policy | Behavior | Best when |
|---|---|---|
| **Open-page** | keep row open; hits cheap, conflict expensive (precharge on critical path) | stream has locality |
| **Closed-page** | precharge immediately; most accesses miss, but precharge off critical path | little locality |
| **Oracular** | knows future → best finish times | impossible, but an upper bound |

Modern controllers pick a policy between open and closed (proprietary).

### Scheduling worked example (Problem 3)

Stream: X, X+1, X+2, X+3 same row; Y, Y+1 another row. Bank precharged at start. Arrivals: X@0, Y@10, X+1@100, X+2@200, Y+1@250, X+3@300.

| Req | Open | Closed | Oracular |
|---|---|---|---|
| X | 40 | 40 | 40 |
| Y | 100 | 100 | 100 |
| X+1 | 160 | 160 | 160 |
| X+2 | 220 | 240 | 220 |
| Y+1 | 310 | 300 | 290 |
| X+3 | 370 | 360 | 350 |

Open-page wins on the same-row hits (X+1, X+2, X+3) but pays on the Y conflict; closed-page spreads the cost; oracular is optimal.

### Scheduling worked example (Problem 4)

X@10, X+1@15, Y@100, Y+1@180, X+2@190, Y+2@205 (same-row grouping as before):

| Req | Open | Closed | Oracular |
|---|---|---|---|
| X | 50 | 50 | 50 |
| X+1 | 70 | 70 | 70 |
| Y | 160 | 140 | 140 |
| Y+1 | 200 | 220 | 200 |
| X+2 | 260 | 300 | 260 |
| Y+2 | 320 | 240 | 320 |

Here closed-page actually beats open on some requests because the interleaved X/Y pattern destroys row-buffer locality — illustrating why the policy must adapt to the access stream.

## Putting it together

- Memory-level parallelism (ranks, banks, row buffers) is the DRAM-side analog of ILP — keep many requests in flight.
- Scheduling policy choice trades row-buffer hits against precharge overhead; real controllers are adaptive.
- DRAM latency (not just cache) is a first-order performance term, especially for bandwidth-bound and irregular workloads.

## DDR generations & bandwidth trend

DDR (Double Data Rate) standards evolve: DDR, DDR2, DDR3, DDR4, DDR5, each raising the effective data rate via higher clock and more prefetch. Bandwidth scales roughly with `channels × frequency × DDR_factor × bus_width`. The worked 102.4 GB/s figure assumes DDR (2 transfers/cycle) at 800 MHz across 8 channels — a modern server with more channels and DDR5 would exceed several hundred GB/s.

## Rank organization tradeoffs (recap)

- **×4 chips:** more chips per rank → higher capacity per rank (good when channel count limits ranks), but more chips to activate per access (worse energy).
- **×16 chips:** fewer chips per rank → better energy per access, but lower capacity per rank.
- The memory controller balances these against the workload's capacity vs bandwidth vs power demands.

## Attack taxonomy summary

| Attack | Leaks via | Requires |
|---|---|---|
| Meltdown | out-of-order/early permission check + cache side channel | speculatively readable secret |
| Spectre v1 | mistrained branch (bounds check) + cache side channel | attacker-controlled index |
| Spectre v2 | branch-target injection → gadget | control of indirect branch |

All three share the same root: **microarchitectural state (cache) is observable even when the ISA says the effect was discarded**. This is why "invisible" misspeculation is never truly invisible, and why architecture now treats the speculation/consistency model as a security surface.

## Summary

- Superpages: runtime coalescing, bounded by ski-rental (≤2× optimal).
- Meltdown/Spectre: speculation leaves cache timing traces → secret leakage; security is now architectural.
- DRAM hierarchy: DIMM → rank → bank → array; wide row buffers overfetch.
- Capacity/bandwidth computed from sockets×channels×DIMMs×ranks×chips×density.
- Row-buffer policies: open (locality), closed (no locality), oracular (ideal); adaptive controllers win.
- Next: multiprocessors — coherence and consistency across many cores (Chapter 11).
