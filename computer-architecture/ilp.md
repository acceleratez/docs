# Instruction Level Parallelism (ILP)

> ILP = overlap among instructions via pipelining or multiple-issue. The degree of ILP is limited by **dependences** (program property) and **hazards** (pipeline property). This chapter covers loop scheduling, loop unrolling, software pipelining, and superscalar/VLIW — all *static* (compiler) techniques.

## Definition and limits

**ILP** = the amount of instruction overlap achievable. Two limiters:

1. **Dependences** — property of the *program* (dataflow, anti-, output-).
2. **Hazards** — property of the *pipeline* (structural, data, control).

You cannot exceed the ILP the program's dependences allow, but a bad pipeline/hazard-handling can *waste* available ILP.

### Static vs dynamic scheduling

- **Dynamic (hardware)** scheduling (scoreboards, issue queues, Tomasulo) needs complex structures → high power, lower clock, harder verification.
- **Static (compiler)** scheduling can often compute latencies and dependences "easily" — complex software is frequently *preferred* to complex hardware.
- Argument: the compiler can schedule around known latencies; but it goes haywire under runtime cache misses (which it cannot predict). Hence both are used together in modern CPUs.

### Effects of multicycle instructions

Long-latency ops create: multiple register-file writes/cycle, frequent RAW hazards, WAW hazards, and imprecise exceptions (out-of-order completion). Wider issue (fetch/decode/execute multiple instructions per stage) is one answer — handle two instructions at once.

## Latency assumptions (examples)

The compiler models each producer→consumer latency as a required stall count:

| Producer → Consumer | Stall cycles |
|---|---|
| LD → any | 1 |
| FPALU → any | 3 |
| FPALU → ST | 2 |
| IntALU → BR | 1 |
| FPMUL → any | 5 |
| FPMUL → ST | 4 |

(One branch delay slot assumed.) These numbers drive every schedule below.

## Loop scheduling

**Focus on loops**: they account for most cycles, are easy to analyze, and repeat identically. The compiler's job is to minimize stalls.

### Naive schedule — Problem (x[i] = x[i] + s)

```mips
Loop: L.D   F0, 0(R1)        # load
      stall
      ADD.D F4, F0, F2       # add
      stall; stall
      S.D   F4, 0(R1)        # store
      DADDUI R1, R1, #-8     # decrement ptr
      stall
      BNE R1, R2, Loop
      stall
```

10 cycles/iteration — dominated by stalls for the LD→ADD (1) and ADD→SD (2) and pointer/branch (1 each) latencies.

### Smart schedule

Reorder so independent work fills stalls (move the pointer update and store up):

```mips
Loop: L.D   F0, 0(R1)
      DADDUI R1, R1, #-8
      ADD.D F4, F0, F2
      stall
      BNE R1, R2, Loop
      S.D F4, 8(R1)          # note offset adjusted for early ptr update
```

**6 cycles/iteration.** The anti-dependence (pointer update vs store) was easily broken because an immediate was involved. Loop overhead = 2 instrs (ptr, branch); actual work = 3 instrs (LD, ADD, SD).

### Problem 1 (x[i] = y[i] * s)

Latencies: LD→any 1, FPMUL→any 5, FPMUL→ST 4, IntALU→BR 1.

- **Unoptimized** (12 cycles): `LD s MUL s s s s SD DA DA BNE s`.
- **Optimized** (8 cycles): `LD DA MUL DA s s BNE SD`.

## Loop unrolling

Replicate the loop body to expose independent instructions and hide latencies.

### Scheduled + unrolled (degree 4)

```mips
Loop: L.D   F0, 0(R1)
      L.D   F6, -8(R1)
      L.D   F10, -16(R1)
      L.D   F14, -24(R1)
      ADD.D F4, F0, F2
      ADD.D F8, F6, F2
      ADD.D F12, F10, F2
      ADD.D F16, F14, F2
      S.D   F4, 0(R1)
      S.D   F8, -8(R1)
      DADDUI R1, R1, #-32
      S.D   F12, 16(R1)
      BNE   R1, R2, Loop
      S.D   F16, 8(R1)
```

- Total = **14 cycles for 4 iterations = 3.5 cycles/iteration** (vs 10 naive, 6 smart).
- Loop overhead = 2 instrs; work = 12 instrs.

### Costs and mechanics

- **Increases code size** and **requires more registers** (we used F0–F16).
- To unroll an $n$-iteration loop by $k$: execute $\lfloor n/k\rfloor$ big iterations + $(n \bmod k)$ leftover iterations of the original loop.
- **Automating it:** (1) determine cross-iteration dependences (here loads/stores to different indices don't conflict); (2) decide if unrolling helps (only if iterations are independent); (3) compute address offsets; (4) dependency analysis to schedule without new hazards; (5) eliminate name dependences via extra registers.

### Problem 2 (how many unrolls to avoid stalls?)

For `x[i] = y[i] * s` with FPMUL→any 5, FPMUL→ST 4:
- Degree 2: `LD LD MUL MUL DA DA 1s SD BNE SD` — still some stalls.
- Degree 3: `LD LD LD MUL MUL MUL DA DA SD SD BNE SD` — **12 cyc / 3 iter = 4 cyc/iter**, no stalls.

## Software pipelining

Achieves unrolling's effect **without code expansion**: instructions from different iterations overlap in steady state.

```mips
Loop: S.D   F4, 0(R2)        # store from iter i
      MUL   F4, F0, F2        # mul   from iter i+1
      L.D   F0, 0(R1)         # load  from iter i+2
      DADDUI R2, R2, #-8
      BNE   R1, R3, Loop
      DADDUI R1, R1, #-8
```

- **Advantages:** nearly same throughput as unrolling, **no code-size blowup**, almost always in steady state (unrolled loops waste cycles at start/end). Can also be unrolled further to cut loop overhead.
- **Disadvantages:** does **not** reduce loop overhead; may require **more registers** (different iterations' live values coexist).

### Problem 4 (x[i] = y[i] * s, sw-pipelined)

```mips
Loop: S.D   F4, 0(R2)
      MUL   F4, F0, F2
      L.D   F0, 0(R1)
      DADDUI R2, R2, #-8
      BNE   R1, R3, Loop
      DADDUI R1, R1, #-8      # no stalls
```

Store offset tricks (e.g., `S.D F4, 0(R2)` then `DADDUI R2`) are needed because the store now belongs to an *earlier* iteration than the load/mul. Using more register names avoids artificial dependences.

## Superscalar & VLIW

### Superscalar pipelines

Multiple pipelines issue in parallel; e.g., an integer pipe (LD, SD, ADDUI, BNE) and an FP pipe (ADD.D):

```mips
Loop: L.D  F0, 0(R1)        |  ADD.D F4, F0, F2
      L.D  F6, -8(R1)       |  ADD.D F8, F6, F2
      L.D  F10, -16(R1)      |  ADD.D F12, F10, F2
      L.D  F14, -24(R1)      |  ADD.D F16, F14, F2
      S.D  F4, 0(R1)        |  ADD.D F20, F18, F2
      S.D  F8, -8(R1)
      DADDUI R1, R1, #-40
      S.D  F12, -16(R1)
      BNE R1, R2, Loop
      S.D  F16, 16(R1)
```

- Needs **unroll by degree 5** to eliminate all stalls (fewer if the DADDUI is moved up).
- **Compiler** specifies instructions that can be issued as one *packet*; hardware dispatches to the pipes.

### VLIW

The compiler specifies a **fixed number of instructions per packet** (one long instruction word). Wider issue needs more unrolling to fill both pipes. Less hardware (no dynamic dispatch) but relies entirely on the compiler and loses binary compatibility across widths.

### Problem 3 (superscalar, x[i]=y[i]*s)

With the int/FP split, **7 unrolls** eliminate stalls (or 5 if DADDUI is hoisted). The FP mul latency (5) is the bottleneck: you need enough independent loads queued to keep the FP pipe fed while earlier muls finish.

## ILP summary table

| Technique | Code size | Registers | Loop overhead | Steady-state |
|---|---|---|---|---|
| Naive schedule | small | few | high | poor |
| Smart schedule | small | few | 2 | 6 cyc/iter |
| Loop unrolling | **large** | **many** | 2 | 3.5 cyc/iter |
| Software pipelining | small | many | **not reduced** | ~3.5 cyc/iter |
| Superscalar (deg-5) | large | many | 2 | best |

## Key takeaways

- ILP is limited by program dependences + pipeline hazards; schedule around known latencies.
- Loops are the optimization target: smart scheduling (6) → unrolling (3.5) → software pipelining (3.5, no bloat) → superscalar/VLIW (best, needs width).
- Unrolling trades code size + registers for throughput; software pipelining trades registers for throughput without bloat.
- Next: control hazards and branch prediction (Chapter 6) — the other big ILP limiter.
