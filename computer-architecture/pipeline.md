# Basic Pipelining

> Pipelining overlaps instruction execution like an assembly line, raising IPC toward 1 and clock speed by breaking work into stages. This chapter covers the 5-stage MIPS pipeline, the ideal speedup math, the three hazard classes, forwarding/bypassing, and control-hazard handling.

## Concept: the assembly line

An **unpipelined** processor finishes one instruction before starting the next. A **pipelined** processor breaks execution into stages separated by latches and overlaps many instructions: while instruction *i* is in stage 2, instruction *i+1* is in stage 1, etc.

- Unpipelined time per instruction $= T + T_{\text{ovh}}$ (where $T$ = logic delay, $T_{\text{ovh}}$ = latch/register overhead).
- For an $N$-stage pipeline, stage time $= T/N + T_{\text{ovh}}$.
- Clock cycle time $= T/N + T_{\text{ovh}}$; clock speed $= 1/(T/N + T_{\text{ovh}})$.
- **Ideal speedup** $= (T + T_{\text{ovh}})/(T/N + T_{\text{ovh}})$, approaching $N$ as stages grow.
- Cycles to complete one instruction $= N$; **average CPI ≈ 1**.

### Worked example — Problem 1 (equal stages)

> Unpipelined: 5 ns work + 0.2 ns latch. Convert to 5 equal pipeline stages, no stalls.

- Unpipelined cycle = 5.2 ns; pipelined stage = $5/5 + 0.2 = 1.2$ ns.
- Clock speeds: 192 MHz vs **833 MHz**. IPC = 1 for both.
- Time to finish one instruction: 5.2 ns vs 6 ns (a single instr takes *longer* in the pipeline!).
- Speedup = $833/192 = \mathbf{4.34}$.

The key insight: **individual instructions take longer, but throughput (instr/second) rises sharply** because completions are staggered.

### Worked example — Problem 2 (unequal stages)

> Same, but stage lengths 1, 0.6, 1.2, 1.4, 0.8 ns.

- Cycle time = slowest stage + latch = $1.4 + 0.2 = 1.6$ ns → **625 MHz**. IPC = 1.
- Time for one instr = 8 ns. Speedup = $625/192 = 3.26$.
- **Max possible speedup** = $T_{\text{total}} / T_{\text{ovh}} = 5.2 / 0.2 = 26$ (if stages could be infinitesimally small, limited only by latch overhead).

The slowest stage bounds the clock — this is why balanced stage design matters.

### Worked example — Problem 2 (deeper pipelines, stalls)

> Unpipelined 5 ns + 0.1 ns latch. Throughput for 1-, 20-, 50-stage pipelines. Half of instructions have a data hazard (dependent on predecessor), half don't. P.O.P/P.O.C separated by 2 ns in the unpipelined design.

- 1-stage: 1 instr / 5.1 ns.
- 20-stage: first instr 0.35 ns, second (dependent) 2.8 ns.
- 50-stage: first 0.2 ns, second 4 ns.
- **Throughputs:** 0.20 BIPS, 0.63 BIPS, 0.48 BIPS.

Counter-intuitive: the **50-stage pipeline is *slower* than the 20-stage** here. Deeper pipelines raise the gap between dependent instructions (more latch overhead stacks up), so if many instructions are dependent, excessive depth hurts. This is the central tension of deep pipelines.

## Conflicts/problems in a real 5-stage design

- **I-cache and D-cache accessed same cycle** → implement them *separately*.
- **Registers read and written same cycle** → easy if register read/write time = cycle/2 (split-phase).
- **Branch target known only at end of stage 2** → what do you fetch in the meantime? (control hazard).

## The 5-stage pipeline (MIPS-like)

| Stage | Name | Action |
|---|---|---|
| IF | Instruction Fetch | Read I-cache using PC; compute PC + 4 |
| ID/DR | Decode / Register Read | Read registers; compare for branches; compute target |
| EX/ALU | Execute | ALU op, address calculation for load/store |
| MEM/DM | Memory | Cache load/store access (stores finish in 4 cycles) |
| WB/RW | Write-back | Write result into register file |

```
      IF       ID       EX       MEM      WB
ADD   PC→I$   Rd Rs,Rt  R1+R2    --       Wr Rd
LD    PC→I$   Rd Rbase  Rbase+8  GetData  Wr Rt
ST    PC→I$   Rd Rbase  Rbase+8  WrData  --
BEQ   PC→I$   Rd Rs,Rt  Compare  --       Set PC
```

**CISC vs RISC loads/stores.** CISC instructions (e.g., M68000 `MOVE.W (A0)+,$8(A0,D1)`) perform several ALU and memory ops per instruction — multiple uses of ALU and memory make pipelining hard. **MIPS/RISC** was designed with pipelining in mind: one memory access, simple decoding.

### From C to RISC assembly — Problem 3

```mips
# a[i] = b[i] + c[i];   R1 holds &i
LD  R2, [R1]           # load i
MUL R3, R2, 8          # offset = i*8
ADD R7, R3, R4         # &a[i]  (R4 = &a[0])
ADD R8, R3, R5         # &b[i]  (R5 = &b[0])
ADD R9, R3, R6         # &c[i]  (R6 = &c[0])
LD  R10, [R8]          # b[i]
LD  R11, [R9]          # c[i]
ADD R12, R11, R10      # a[i] = b[i] + c[i]
ST  R12, [R7]          # store
```

## Hazards

A hazard is a situation that prevents the next instruction from executing in its designated clock cycle. Three classes:

| Hazard | Cause | Fix |
|---|---|---|
| **Structural** | Two instructions need the same resource (e.g., unified I/D cache) in the same cycle | More resources (separate I$ and D$) |
| **Data** | An instruction needs a value not yet produced by an earlier instruction | Forwarding (bypass) or stalls |
| **Control** | Next fetch unknown until a branch resolves | Prediction, delay slots, flushing |

> Control hazards are formally a special case of data hazards (the "data" is the next PC), but they are treated separately because the mechanisms differ.

### Structural hazards

Example: a **unified** instruction + data cache → stage 1 (IF) and stage 4 (MEM) can never coincide. The later instruction and all successors are delayed until the resource is free → **pipeline bubbles**. Easy to eliminate by adding resources (separate I$ and D$).

### Data hazards

An instruction *produces* a value in some stage; a later instruction *consumes* it in some stage. The consumer may have to be delayed so consumption happens *after* production. (Detailed treatment in Chapter 4.)

### Control hazards

A branch's direction + target are known only at end of EX (or ID if a comparator is added). Until then, the next instruction to fetch is unknown.

#### Simple handling techniques

| Technique | Avg stalls (branch taken 80%) |
|---|---|
| Stall fetch until outcome known | 1.0 |
| Assume not-taken, squash if taken | 0.8 |
| Delay slot, nothing useful | 1.0 |
| Delay slot, instr from *before* branch | 0.0 |
| Delay slot, instr from *taken* side | 0.2 |
| Delay slot, instr from *not-taken* side | 0.8 |

Longer pipelines flush more instructions on a misprediction → higher penalty (motivates Chapter 6, branch prediction).

## Forwarding (bypassing)

**Forwarding (bypass)** feeds an ALU result directly from a pipeline register to a later instruction's ALU input, avoiding the wait for WB. Two muxes (controlled by `ForwardA`, `ForwardB`) select between register-file values and forwarded values.

```
sub $2, $1, $3     IF  DR  AL  DM  RW
and $12, $2, $5        IF  DR  AL  DM  RW   <- gets $2 from AL/DM reg
or  $13, $6, $2            IF  DR  AL  DM  RW <- gets $2 from DM/RW reg
```

- `sub` produces its result in its **AL** stage (cycle 3). `and`/`or` need the new `$2` in their **AL** stages (cycles 4–5). The result is already sitting in the AL/DM pipeline register → forward it. **0 stalls.**
- Without forwarding, `sub→and` would need 2 stall cycles.

### Load hazards still need a stall

If the producer is a `lw`, the data comes from memory only at the **end of MEM** (cycle 4). But the consumer needs it at the **start of its EX** (cycle 4). Too late even for forwarding → **1 stall** is required, then forward from DM/RW.

```mips
lw  $2, 20($3)
and $12, $2, $5    # needs 1 stall, then forward from DM/RW
```

### Store cases

- `add $1,$2,$3` → `sw $1,0($4)`: value ready in AL/DM; forward to store address/data. 0 stalls.
- `add $1,$2,$3` → `sw $4,0($1)`: store *address* `$1` ready in time; 0 stalls.
- `lw $2,...` → `sw $1,0($2)`: store *address* `$2` ready only after load's MEM; 1 stall then forward.

## Worked pipeline traces — Problem 5 (no bypassing vs bypassing)

Sequence `I1: R1+R2→R3`, `I2: R3+R4→R5`, `I3: R7+R8→R9` (RAW chain I1→I2, I2→I3).

- **No bypassing:** each consumer waits 2 cycles for the producer to reach WB. Instructions march through IF→DR→ALU→DM→RW strictly staggered with bubbles.
- **With bypassing:** I2 reads `$3` from I1's AL/DM register; I3 reads `$5` from I2's DM/RW register. Identified input latches: L3 (AL/DM) for the first operand, L4/L5 (DM/RW) for the second — no bubbles.

The pipeline diagram fills every cycle once forwarding is enabled.

## Stalls and slowdown math

- Perfect pipelining (no hazards): an instruction completes every cycle → speedup = number of stages = clock-speed increase.
- With hazards/stalls: some cycles pass with **no completion**.

$$
\text{Total cycles} = \text{#instructions} + \text{stall cycles}
$$

$$
\text{Slowdown} = \frac{1}{1 + \text{stall cycles per instruction}}
$$

### Pipelining limits (why deeper isn't always better)

For an independent pair: gap between successive instructions shrinks with more stages ($T/N + T_{\text{ovh}}$).
For a *dependent* pair: the gap *grows* — the dependent instruction must wait for production, and production is pushed later by stacked latch overhead. So:

- More stages → faster independent instructions.
- More stages → *slower* resolution of dependent instructions (bigger stall).

This is the fundamental reason out-of-order execution (Chapter 7) exists: it lets independent instructions pass dependent ones.

## Precise exceptions

A pipeline must provide **precise exceptions** so that, on a fault:

1. Save the PC of the instruction where execution must resume.
2. Convert all *later* instructions in the pipeline to NOPs (older ones may still raise their own exceptions).
3. Store temporary (register) state to memory.
4. Avoid problems if a later instruction already modified memory/registers.

This is hard in deeply pipelined/out-of-order machines — handled via the Reorder Buffer (Chapter 7).

### Other pipeline-side fixes (preview)

- **Multiple register-file writes per cycle** → more ports, or stall one writer during ID/WB.
- **WAW hazards** (write-after-write) → detect in ID and stall the later instruction.
- **Imprecise exceptions** → buffer results or save more pipeline state.

## Performance improvements — recap

- Per-instruction *time* (ns) goes **up**; per-instruction *cycle count* goes up; but **average CPI stays ~1**, clock speed goes up, and **total execution time goes down**.
- Ideal speedup = ratio of elapsed times between successive completions = number of stages = increase in clock speed.

## Summary

- 5-stage MIPS pipeline; ideal CPI ≈ 1; speedup ≤ number of stages (limited by slowest stage + latch overhead).
- Hazards: structural (add resources), data (forward/stall), control (predict/delay/flush).
- Forwarding removes most ALU→ALU stalls; `lw`→dependent still needs 1 stall.
- Deeper pipelines help independent code but worsen dependent-code stalls — motivating out-of-order execution.
- Next: data hazards in depth (Chapter 4).
