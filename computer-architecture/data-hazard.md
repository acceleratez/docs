# Data Hazards

> A **dependence** is a property of the program; a **hazard** is a property of the pipeline implementation. This chapter distinguishes the three dependence types, explains why a 5-stage pipeline only suffers RAW, and details the hardware/software fixes (HDU, forwarding, load delay slots, compiler scheduling).

## Dependence vs hazard

| Type | Name | Meaning | Example |
|---|---|---|---|
| RAW | Read-After-Write | Consumer reads before producer writes | `ADD R5,R2,R3` then `ADD R4,R5,R6` |
| WAR | Write-After-Read | Writer writes before reader finishes reading | `ADD R1,R2,R3` then `LD R2,100(R5)` |
| WAW | Write-After-Write | Two writes to same location, order matters | `ADD R1,R2,R3` then `LD R1,100(R5)` |

- **RAW (true dependence):** the consumer needs the producer's *new* value. Cannot be eliminated — it is real.
- **WAR / WAW (name/anti/output dependences):** not true data flow; they exist only because the ISA has too few register names. They can be eliminated by **register renaming** (Chapter 7).

### Why a 5-stage pipeline only has RAW

In a 5-stage pipeline, **register reads happen in ID (early) and writes happen in WB (late)**. A later instruction's read occurs *before* an earlier instruction's write would land — so:

- **RAW can occur** (consumer reads stale value before producer writes).
- **WAR cannot occur** (consumer can't write before producer reads — reads are earlier than all writes).
- **WAW cannot occur** (only one write per instruction, at the very end; order of writes = order of instructions).

Multicycle / out-of-order pipelines introduce WAW and WAR (and require renaming + reordering to fix them).

## RAW hazard resolution

### Correctness (avoid wrong value)

Insert stall cycles so the consumer reads the *updated* register.

**Software:** insert NOPs / independent instructions in the delay slot (compiler scheduling).
**Hardware:** a **Hazard Detection Unit (HDU)** compares the read register of the IF/ID instruction against the write register of the ID/EX and EX/MEM stages; on a match, it freezes PC & IF/ID and inserts a NOP bubble.

### Correctness + performance

- **Forwarding (bypass):** feed the ALU output back to the ALU input — eliminates most RAW stalls between ALU ops.
- **Load delay slot:** a `lw` produces its value only at the *end* of MEM, so a dependent ALU op still needs **1 stall cycle** even with forwarding.

## Hazard Detection Unit (HDU)

The HDU logic (for a 5-stage pipeline):

> If the **read register** of the instruction in IF/ID equals the **write register** of the instruction in either ID/EX or EX/MEM → insert a stall cycle. Freeze PC and IF/ID; insert a NOP into ID/EX.

The comparison uses the actual register fields:

| Instruction | Write reg | Read regs |
|---|---|---|
| R-R (`add`) | `rd` | `rs`, `rt` |
| Load (`lw`) | `rt` | `rs` |
| Store (`sw`) | — | `rs`, `rt` |
| Branch (`beq`) | — | `rs`, `rt` |

A stall (bubble) looks like this on the pipeline:

```
Cycle:  1   2   3   4   5   6
ADD:    IF  DR  ALU DM  RW
B:          IF  DR  DR  ALU DM  RW   <- stalled 1 cycle (NOP inserted)
```

The freeze keeps PC and IF/ID unchanged so the consumer is re-fetched next cycle with the hazard resolved.

## Forwarding cases

### R-R type (ALU → ALU)

```mips
A:  ADD R1, R2, R3      # result computed in ALU (cycle 3)
B:  ADD R4, R1, R5      # needs R1 in its ALU (cycle 4)
```

- B's stale `$1` is read in ID/EX at end of cycle 3; A's result is in the **AL/DM** register at end of cycle 3.
- B forwards from AL/DM in its ALU stage → **0 stalls**.

### Three-instruction chain

`A: ADD R1←R2+R3`, `X: ADD R6←R7+R8` (independent), `B: ADD R4←R1+R5`.

- A's result reaches **DM/RW** at end of cycle 4. B reads stale `$1` from ID/EX at end of cycle 4, forwards from DM/RW in its ALU (cycle 5) → **0 stalls**. The independent X sits between them without干扰.

### Load instructions (the hard case)

```mips
A:  LD  R1, 0(R2)
B:  ADD R3, R1, R4
```

- A obtains the value from memory at **end of cycle 4**. B computes with `$1` *during* cycle 4.
- Forwarding alone is **insufficient** — the data isn't ready when B needs it. **Requires 1 stall** (software NOP or hardware HDU stall), then forward from DM/RW.

This is the **load delay slot**, exposed to the programmer in DLX/MIPS-style ISAs: the instruction immediately after a load must not have a RAW dependence on it (insert NOP or an independent instruction).

## Stall counts (5-stage, RR & RW half-cycle)

| Pair | Without bypass | With bypass |
|---|---|---|
| `add` → `add` | 2 | 0 |
| `lw` → `add` | 2 | 1 |
| `lw` → `sd` (addr) | 2 | 1 |
| `lw` → `sd` (data) | 2 | 0 |

## Stall counts (8-stage, RR & RW full cycle) — Problem 8

An 8-stage pipeline (IF, DE, RR, AL, DM, DM, RW, AL) makes dependences worse because production is pushed later:

| Pair | Without bypass | With bypass |
|---|---|---|
| `add` → `add` | 5 | 1 |
| `lw` → `add` | 5 | 3 |
| `lw` → `sd` (addr) | 5 | 3 |
| `lw` → `sd` (data) | 5 | 1 |

This quantifies the "deeper pipeline = bigger dependent stalls" principle from Chapter 3.

## Compiler optimization (fill the delay slot)

Move an independent instruction into the stall slot instead of a NOP:

```mips
# Original (SUB dependent on ADD's R1, stalls)
ADD R1, R2, R3
SUB R4, R1, R5
XOR R3, R2, R7
AND R8, R7, R7

# Reordered: independent XOR/AND fill the gap
ADD R1, R2, R3
XOR R3, R2, R7
AND R8, R7, R7
SUB R4, R1, R5
```

The compiler restructures code so independent instructions occupy the cycles that would otherwise be bubbles. This is **static scheduling** (vs hardware dynamic scheduling in Chapter 7).

## Multicycle-instruction effects (preview of ILP chapter)

Longer-latency instructions (FP multiply, divide) introduce:

- Potentially **multiple register-file writes per cycle**.
- **Frequent RAW hazards**.
- **WAW hazards** (WAR still not possible in order).
- **Imprecise exceptions** because instructions complete out of program order.

These motivate widerIssue, register renaming, and reorder buffers.

## Worked data-hazard trace (lw → add)

Step-by-step for `lw $t1, 4($s0)` then `add $t5, $t1, $t4` (illustrated in the slides with addresses):

1. `lw` in IF, then ID (reads `$s0`), then EX (computes `4+$s0`), then MEM (fetches `0x60` from `0x10010004`), then WB (writes `$t1`).
2. `add` tries to read `$t1` in its ID stage *before* `lw` reaches WB. Without a stall, `add` would use the **stale** `$t1 = 0x0` instead of `0x60`.
3. HDU detects the match → stalls `add` one cycle; then forward the loaded value from DM/RW into `add`'s ALU.

If the stall is skipped, `add` computes the **wrong sum** — a classic correctness bug that forwarding alone cannot prevent for loads.

## Full HDU timing example

Consider `ADD R1,R2,R3` (I1) followed by `ADD R4,R1,R5` (I2):

```
Cycle:  1       2       3        4       5       6
I1:     IF      DR      ALU      DM      RW
I2:             IF      DR       ALU     DM      RW
                                        ^R1 read here
```

- I1 computes `$1` during its ALU (end of cycle 3); I2 reads `$1` in its DR stage (end of cycle 3, stale) and needs it in ALU (cycle 4).
- **With forwarding:** I2 takes `$1` from I1's AL/DM register at cycle 4 → **0 stalls**.
- **Without forwarding:** I2 must wait until I1's RW (cycle 5) → **2 stalls**.

The HDU's job is precisely this comparison: read-register(I2) == write-register(I1 in DR/ALU or ALU/DM)? If yes → freeze and bubble.

## WAW/WAR preview (out-of-order)

In a deeper or out-of-order machine, the simple "read early / write late" property of the 5-stage pipe breaks:

| Hazard | In 5-stage in-order | In OoO / multicycle |
|---|---|---|
| RAW | possible | possible (true dependence) |
| WAR | impossible | possible (anti-dependence) |
| WAW | impossible | possible (output dependence) |

WAR and WAW are **name conflicts**, not true data flow — they are eliminated by **register renaming** (Chapter 7), which gives every write a fresh physical register name. So once OoO is introduced, the HDU's stall-on-RAW logic is replaced by renaming + a unified wakeup/select scheduler.

## Why the load-delay slot is exposed

In DLX/MIPS, the instruction immediately after a `lw` is in the **load delay slot**. The ISA contract says: software must ensure that instruction does *not* have a RAW dependence on the load (insert a NOP or an independent instruction). Hardware then needs no extra stall logic for the common `lw`→`add` case beyond a single forced bubble — simpler decode, at the cost of a visible pipeline artifact the compiler must respect.

## Summary

- 5-stage pipeline: bypassing removes stalls for `add/sub` → `add/sub/lw/sd` (data), and `lw` → `sw` (data).
- `lw` → `add/sub/lw` or `sw` (addr) still incurs an intermediate stall (load delay slot).
- RAW is the only true hazard in a 5-stage in-order pipeline; WAR/WAW appear only with multicycle/out-of-order execution.
- HDU = hardware stall insertion; compiler scheduling = software fill of delay slots.
- Next: how ILP (loop scheduling, unrolling, software pipelining, superscalar/VLIW) hides these latencies at compile time.
