# Out-of-Order Processors

> In an in-order pipeline, a true data dependence stalls the dependent instruction *and all younger independent ones*. Out-of-order (OoO) execution moves dependents out of the way of independents → **latency tolerance**. This chapter covers Tomasulo's algorithm, register renaming, the Reorder Buffer, issue queues, and memory disambiguation.

## Motivation: the in-order stall problem

In an in-order pipeline, when an instruction cannot dispatch (e.g., waiting for a cache miss or a long-latency multiply), *every younger instruction* is blocked behind it — even independent ones.

```
In-order:  F D [STALL...] E   ...   E W     (whole pipe stalls)
OoO:       independent instrs pass the blocked one and execute
```

Two example fragments both stall the whole pipeline at the `ADD` (source not ready). In one, the latency is *fixed* (multiply); in the other, it is *variable* (load miss) — the latter is unknowable at compile time, which is exactly why **hardware** (microarchitecture) must handle it, not just the compiler.

### Three already-seen ways to avoid dispatch stalls

1. Fine-grained multithreading (switch to another thread).
2. Value prediction.
3. Compile-time scheduling/reordering (Chapter 5).

Each has downsides (thread switching overhead, misprediction recovery, limited static info). OoO execution is the general microarchitectural answer: **fetch and "fire" an instruction when its inputs are ready** — i.e., dataflow execution within an instruction window.

## Enabling OoO execution

Four mechanisms:

1. **Link consumer to producer** → **register renaming** (tag each value with a unique ID).
2. **Buffer instructions** until ready → **reservation stations** (after renaming).
3. **Track source readiness** → when a value is produced, **broadcast its tag** on a common bus; instructions compare their source tags to the broadcast.
4. **Dispatch** when all sources ready → **wakeup + select** (pick one instruction per functional unit).

## Tomasulo's Algorithm (IBM 360/91, 1967)

Robert Tomasulo's algorithm (IBM Journal of R&D, 1967) introduced OoO with register renaming. Variants appear in Pentium Pro, AMD K5, Alpha 21264, MIPS R10000, POWER5, etc. (Original 360/91 had **no precise exceptions** — that was added later by Patt/Hwu's HPS work, 1985.)

Operation:

- Instruction + renamed operands inserted into a **reservation station** after rename (only if a station is free; else stall).
- Each station **watches the Common Data Bus (CDB)** for its source tags; grabs the value when seen.
- When both operands available, the instruction is **ready to dispatch**.
- On completion, the instruction arbitrates for the CDB, broadcasts its `(tag, value)`. The register file updates if its tag matches (and sets a valid bit).
- Eliminates **WAW/WAR via renaming**; only **RAW** remains.

### The "two humps"

A modern OoO pipeline has two structural bottlenecks:

1. **Reservation stations / scheduling window** (hump 1) — where instructions wait for operands.
2. **Reorder buffer / instruction window** (hump 2) — where instructions wait to commit in order.

```
F D [RS / scheduling window] E W [ROB / reorder]
        out-of-order            in-order
```

## Register renaming

Output (WAW) and anti (WAR) dependences are **not true dependences** — they exist only because the ISA has too few register *names*. Renaming maps the architectural register ID to a **physical/rename ID** (e.g., `R1 → T1`):

- Architectural register ID → physical register ID (RS entry / rename register).
- After renaming, the physical ID refers to the value; WAW/WAR vanish because each write gets a fresh name.
- **Approximates a huge register file** with a small ISA.

**Worked — Problem 1** (4 rename regs T1–T4):

```mips
R1 <- R2+R3          T1 <- R2+R3
R3 <- R4+R5          T2 <- R4+R5
BEQZ R1              BEQZ T1
R1 <- R1+R3          T4 <- T1+T2
R1 <- R1+R3          T1 <- T4+T2
R3 <- R1+R3          T2 <- T1+R3
```

Note all writes get distinct physical names, so no WAW/WAR can stall dispatch.

## Reorder Buffer (ROB) — precise exceptions

Instructions **enter and commit in program order**, but **execute out of order**.

- On completion, the result goes to a temporary (ROB/rename) register.
- It is written to the **architectural register file only at commit** — when it and all older instructions have finished *without exception*.
- On an exception: wait until the faulting instruction reaches the ROB head, then save state (PC, registers) and service it. Younger instructions are discarded.
- On a branch mispredict: flush everything after the branch (they haven't committed, so registers are untouched).

This gives **precise exceptions** even with OoO execution — the programmer sees a clean, in-order state at every fault.

### Commit & physical registers

- **Speculative** vs **committed** register map tables. On commit, update the map (no data copy needed — just repoint the architectural name to the new physical register); release the old physical register to a free pool.
- One instruction commits per new instruction that enters → in-flight count = **#rename registers (constant)**.
- Example: R1–R32 start in P1–P32; `R1<-R1+R2` becomes `P33<-P1+P2`; on commit, `R1` permanently maps to `P33`, and `P1` returns to the free pool.

### Problem 3 (rename + issue times)

```mips
R1 <- R2+R3     P33 <- P2+P3      cycle i
R1 <- R1+R5     P34 <- P33+P5      i+1
BEQZ R1         BEQZ P34           i+2
R1 <- R4+R5     P35 <- P4+P5       i
R4 <- R1+R7     P36 <- P35+P7      i+1
R1 <- R6+R8     P1  <- P6+P8       j
R4 <- R3+R1     P33 <- P3+P1       j+1
R1 <- R5+R9     P34 <- P5+P9       j+2
```

Width = 4. `j` depends on the number of stages between issue and commit. InQ and Commit columns **monotonically increase**; Issue and Complete can be OoO.

## Detailed OoO example (issue/complete/commit)

Assumptions: perfect branch prediction, caches, ADD→dep no stall, LD→dep 1 stall; an instr is placed in the IQ at the end of its 5th stage and takes 5 more stages (ld/st take 6) after leaving IQ.

```mips
ADD  R1,R2,R3     -> ADD  P33,P2,P3     InQ i   Iss i+1  Comp i+6  Comm i+6
LD   R2,8(R1)     -> LD   P34,8(P33)    InQ i   Iss i+2  Comp i+8  Comm i+8
ADD  R2,R2,8      -> ADD  P35,P34,8     InQ i   Iss i+4  Comp i+9  Comm i+9
ST   R1,(R3)      -> ST   P33,(P3)      InQ i   Iss i+2  Comp i+8  Comm i+9
SUB  R1,R1,R5     -> SUB  P36,P33,P5    InQ i+1 Iss i+2  Comp i+7  Comm i+9
LD   R1,8(R2)     -> LD   P1,8(P35)     InQ i+7 Iss i+8  Comp i+14 Comm i+14
ADD  R1,R1,R2     -> ADD  P2,P1,P35     InQ i+9 Iss i+10 Comp i+15 Comm i+15
```

Key observations:
- The `LD R2,8(R1)` depends on `ADD R1` → issues 1 cycle later (RAW through rename tag P33).
- `ST R1,(R3)` can issue early (its data P33 ready at i+1) but **commits only at i+9** (in order).
- The final `LD/ADD` pair waits for P35, issued much later — independent work in between executed freely.

### Constraints worth remembering

- Don't exceed **rename width, issue width, commit width**.
- Note each register's **previous mapping** (to release it on commit).
- **Stall when out of registers / ROB / IQ entries.**
- Delay instructions with data dependences.
- Factor in 5/6 stages for completion by instr type.
- InQ and Commit times monotonically increase; Issue/Complete can be OoO.

### Decode-stage stall

Decode stalls when we run out of registers, ROB entries, or IQ entries. **Issue width** = instructions handled per stage per cycle (high → high peak ILP). **Window size** = in-flight instructions (large → high ILP). Renaming removes WAW/WAR, so only **RAW** hazards remain to worry about.

## Branch mispredict recovery

On a mispredict:
- Throw away IFQ, ROB, and IQ contents after the branch.
- The **committed** map table is correct and untouched.
- The **speculative** map table must roll back → it is **checkpointed at every branch** for fast restore.

## Waking up a dependent

In an in-order pipe, an instruction leaves decode when it is *known* inputs can be received correctly, not when computed. Similarly, an instruction leaves the IQ **before** its inputs are known — wakeup is **speculative** based on the producer's expected latency. This lets the scheduler pre-position dependents, then they "fire" the moment the broadcast tag arrives.

## Memory dependence handling

### Why it is hard

- Register dependences are known *statically*; memory dependences are determined *dynamically* (address unknown until execution).
- Register state is small; memory state is large.
- Register state is private to a thread; memory is *shared* across threads/processors (coherence!).

Corollary: renaming memory addresses is hard; load/store dependence must be checked *after* addresses are computed, when younger/older addresses may still be unknown.

### The memory disambiguation problem

A younger load can have its address ready *before* an older store's address is known. Approaches:

| Approach | Pro | Con |
|---|---|---|
| **Conservative**: stall load until older stores' addresses known (or retired) | No recovery needed | Too slow; delays independent loads |
| **Aggressive**: assume independent, schedule immediately | Fast common case | Needs recovery + re-execution on mispredict |
| **Intelligent**: predict load–store dependence (store sets) | More accurate; dependence persists over time | Still needs recovery |

- **Alpha 21264**: initially assume load independent; delay loads found dependent.
- **Store Sets** (Chrysos & Emer, ISCA 1998): predict which stores a load depends on from history.

### LSQ (Load/Store Queue)

- Loads/stores keep addresses in **program order** in the LSQ.
- Loads issue if guaranteed independent of *all* older stores.
- Stores commit to memory **only at commit** (cannot recover after an exception) → they issue to cache only when ready to modify memory.

**Worked — Problem 2** (no dependence prediction). Given address-operand availability, address values, and four accesses:

| Access | Ad.Op | St.Op | Ad.Val | Ad.Cal | Mem.Acc |
|---|---|---|---|---|---|
| LD R1←[R2] | 3 | — | abcd | 4 | 5 |
| LD R3←[R4] | 6 | — | adde | 7 | 8 |
| ST R5→[R6] | 4 | 7 | abba | 5 | commit |
| LD R7←[R8] | 2 | — | abce | 3 | 6 |
| ST R9→[R10] | 8 | 3 | abba | 9 | commit |
| LD R11←[R12] | 1 | — | abba | 2 | 10 |

Loads issue as soon as their address is computed and no older store can conflict; stores wait until commit. With dependence prediction (Problem 4), independent loads can issue even earlier (e.g., LD R11 at cycle 3/10 instead of 10) because the predictor asserts no conflict with the pending store.

## Restricted dataflow

An OoO core is a **restricted dataflow machine** at the microarchitecture level:

- It dynamically builds the **dataflow graph** of the program, but only within the **instruction window** (decoded-but-not-retired instructions).
- The ISA stays von Neumann (sequential, with a PC); the microarchitecture executes dataflow-style.
- A true dataflow ISA has no PC and fires instructions purely on operand readiness — OoO approximates this *inside* the window.

### Questions to ponder

- If all ops take 1 cycle, OoO buys little — latency tolerance is the whole point.
- If an op takes 500 cycles, how big must the window be to keep decoding? Latency tolerance scales with window size (register file + scheduling window + ROB).
- Tomasulo's scalability limit: broadcast/tag-compare overhead grows with window size.

## Design choices (food for thought)

- Centralized vs distributed reservation stations (tradeoff: broadcast cost vs latency).
- RS/ROB store values, or a centralized physical register file holds all values (RS only holds tags)?
- Exactly when does an instruction broadcast its tag?
- How to combine superscalar + OoO + branch prediction (concurrent rename + concurrent tag broadcast)?

## Reading recommendations

- Kessler, "The Alpha 21264 Microprocessor," IEEE Micro 1999.
- Boggs et al., "The Microarchitecture of the Pentium 4 Processor," Intel TJ 2001.
- Yeager, "The MIPS R10000 Superscalar Microprocessor," IEEE Micro 1996.
- Tendler et al., "POWER4 system microarchitecture," IBM JRD 2002.

## Summary

- OoO = move dependents out of the way of independents → latency tolerance.
- Register renaming kills WAW/WAR; only RAW remains. Tomasulo's algorithm (RS + CDB + tag broadcast) implements it.
- ROB provides precise exceptions via in-order commit.
- Memory disambiguation (conservative/aggressive/predictive) handles unknown addresses via the LSQ.
- Next: the memory hierarchy that feeds all this — caches (Chapter 8).
