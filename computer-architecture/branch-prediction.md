# Branch Prediction

> Control hazards stall the pipeline because the next PC is unknown until a branch resolves. This chapter covers static vs dynamic prediction, 1/2-bit bimodal predictors, correlating/global/local predictors, tournament predictors, and branch-target prediction — with storage-cost math.

## Control hazard recap

In the 5-stage pipeline, most branch work happens in the **ALU (EX) stage**: the target address is computed and the source registers are compared (Zero flag set). So the branch *decision* is known only at the **end of EX**. But we must fetch the next instruction every cycle to keep the pipeline full — hence a **control hazard**.

- Stalling until resolved wastes a cycle per branch. Since ~1 in 6 instructions is a branch, that is a large penalty.
- Assume **not taken**: fetch PC+4; if taken, flush the wrong-path instructions (1 cycle lost in a 5-stage pipe, more in deeper pipes).
- **Branch delay slot**: execute the delay-slot instruction anyway; place useful work there if possible.
- **Predict the target**: fetch from the expected target; flush on misprediction.

Deeper pipelines flush *more* instructions on a mispredict → higher penalty. This is why accurate prediction is critical.

### Flushing mechanics

On a misprediction, the wrongly-fetched instructions (in IF stage) are replaced with a NOP (`sll $0,$0,0`, all-zero encoding in MIPS) — a bubble. One cycle is lost per incorrect branch in the basic 5-stage design. Adding a comparator in **ID** lets us decide one stage earlier (flush only 1 instruction instead of 2).

## Static vs dynamic prediction

- **Static (compiler):** predication, speculation, delay slots. Works for simple in-order cores but **cannot react to runtime cache misses** — scheduling "goes haywire" if a load misses.
- **Dynamic (hardware):** keeps runtime statistics; most effective for top performance. The compiler still helps (e.g., hint bits, block layout).
- Highest performance needs dynamic; static retains value for very simple/embedded in-order processors.

## Principle of locality (for branches)

- **Temporal:** a branch's outcome now predicts its outcome soon (loops repeat).
- **Spatial:** the pattern of nearby branches predicts this one.
- **90-10 rule:** 90% of time in 10% of code — predict the hot paths well.

## 1-bit bimodal predictor

- One bit per branch: predict what happened **last time**. Indexed by (e.g.) 10 PC bits → 1K entries.
- **Problem:** a loop-exit branch mispredicts **twice per loop** — once at exit (predict taken, actually not) and once on re-entry (predict not-taken, actually taken). A single bit over-reacts to the last outcome.

## 2-bit bimodal predictor

Maintain a 2-bit saturating counter per entry:

$$
\text{if taken: } c = \min(3,\; c+1); \qquad \text{if not taken: } c = \max(0,\; c-1)
$$

Predict **taken if $c \ge 2$**; else not taken.

- **Advantage:** a few atypical branches won't flip the prediction — it captures the *common case*. Especially useful when multiple branches share a counter (some PC bits index in).
- Can extend to N bits; in most processors **N = 2**.
- A 1K-entry table (10 PC bits) of 2-bit counters is just 2 Kb.

## Correlating / global / local predictors

Basic bimodal captures each branch's own common case. We can do better by exploiting the *pattern* of recent branches.

### Correlating (global) predictor

Use recent branch **history** (e.g., last 12 branches) XOR-ed with PC bits to index a table of 2-bit counters. If the surrounding pattern differs, a *separate* counter applies.

- **Global history:** the shared history of *all* recent branches → "if the previous branches went 01, expect 0; if 11, expect 1."
- Example structure: 12-bit global history XOR 10-bit PC → 16K entries of 2-bit counters.

### Local predictor

Maintain **per-branch history** (e.g., 10–14 bits) XOR-ed with PC → finer pattern for that specific branch. Two-level: a local-history table (per branch) feeds an index into a counter table.

- Example: 6-bit PC index → 64-entry table of 10/14-bit histories; 14-bit history indexes a 2^14 counter table.

### Terminology

- **Local:** surrounding pattern = this branch's own history.
- **Global:** surrounding pattern includes *neighboring* branches' history.

## Tournament predictor

A local predictor wins for some branches; a global for others. A **tournament** combines both with a **selector** that picks the better one per branch (e.g., Alpha 21264).

- Local predictor + Global predictor + Selector (2-bit saturating, picks which to trust).
- Alpha 21264: 1K L1 entries, 1K L2 entries, 4K global (12-bit history), 4K selector.

### Storage calculation — Problem 1 (global)

> Global predictor: 3-bit counters, index = PC[12] XOR history[12].

Index is 12 bits → $2^{12} = 4096$ counters × 3 b = 12,288 b = **12 Kb = 1.5 KB**.

### Storage calculation — Problem 2 (tournament)

> Selector 4K×2b; global XORs 14 PC + 14 history bits, 3-bit counters; local uses 8-bit L1 index and 12-bit L2 (2-bit counters) from XOR of PC + local history.

- Selector = $4\text{K} \times 2 = 8$ Kb.
- Global = $3\text{ b} \times 2^{14} = 48$ Kb.
- Local = $(12\text{ b} \times 2^8) + (2\text{ b} \times 2^{12}) = 3\text{ Kb} + 8\text{ Kb} = 11$ Kb.
- **Total = 8 + 48 + 11 = 67 Kb.**

## Branch target prediction

Direction (taken/not) is only half the problem — we must also predict the **target address**.

- A **BTB (Branch Target Buffer)** is indexed by the branch PC and returns the predicted target.
- **Indirect branches** (especially returns) are handled by a **return-address stack** — a small hardware stack of return PCs pushed on CALL, popped on RET. This is very accurate because calls/returns are balanced.

## Accuracy example — Problem 3

Code: `do { for i<4 {...} for j<8 {...} } while (k<large)`. Steady-state accuracies:

| Predictor | Accuracy |
|---|---|
| PC+4 (assume not taken) | 2/13 = **15%** |
| 1-bit bimodal | (2+6+1)/13 = **69%** |
| 2-bit bimodal | (3+7+1)/13 = **85%** |
| Global / Local (5-bit history) | (4+7+1)/13 = **92%** |

The loop-exit branch (taken 1/4 or 1/8 of the time) kills simple predictors; history-aware predictors nail the repeating pattern.

## Pipeline without vs with a predictor

With a branch completing in 2 cycles (5-stage):

- **No prediction, correct path:** IF DR AL / IF DR AL → no cycle lost.
- **No prediction, mispredict:** 1 cycle lost (flush).
- **With prediction, correct:** no cycle lost.
- **With prediction, mispredict:** 1 cycle lost (flush).

Prediction only *helps* when accuracy > 0; even modest accuracy beats always-stalling, because a mispredict costs the same 1 cycle as a stall but correct predictions cost 0.

## Static techniques worth knowing

- **Predication:** turn control dependence into data dependence (execute both paths, select with a flag) — avoids branches entirely for small regions.
- **Branch delay slots:** fill with useful work (from before the branch = 0 stall; from taken side = 0.2; from not-taken side = 0.8; nothing = 1.0, for an 80%-taken branch).

## Summary table — predictor comparison

| Predictor | State per branch | Captures | Storage (typical) |
|---|---|---|---|
| 1-bit bimodal | 1 bit | last outcome | 1 Kb (1K entries) |
| 2-bit bimodal | 2 bits | common case | 2 Kb |
| Global (correlating) | 2-bit × history | cross-branch pattern | ~48 Kb (14b) |
| Local | 2-bit × per-branch history | intra-branch pattern | ~11 Kb |
| Tournament | local+global+selector | best of both | ~67 Kb |

## 2-bit counter state diagram

The 2-bit saturating counter is a small finite-state machine with four states (00, 01, 10, 11). Transitions:

```
taken:   00 -> 01 -> 10 -> 11 -> 11 (saturates at predict-taken)
not-tk:  11 -> 10 -> 01 -> 00 -> 00 (saturates at predict-not-taken)
```

- States 10 and 11 predict **taken**; 00 and 01 predict **not taken**.
- The two middle states (01, 10) are "weak" predictions; a single opposite outcome flips them. This hysteresis is exactly what prevents the loop-exit double-mispredict that plagues 1-bit predictors.

## Return-address stack (RAS)

Most indirect branches are **procedure returns** (`ret`). Calls push the return address onto a small hardware **RAS**; returns pop it. Because calls and returns are perfectly balanced and nested, the RAS predicts return targets with near-100% accuracy — far better than a BTB, which would see many different return sites mapping to one `ret` instruction.

## Predictor accuracy vs cost

| Predictor | Typical accuracy | Storage | Hardware cost |
|---|---|---|---|
| Always not-taken | ~60–85% (loops hurt) | 0 | trivial |
| 1-bit bimodal | ~69% | 1 Kb | low |
| 2-bit bimodal | ~85% | 2 Kb | low |
| Global (correlating) | ~92% | ~48 Kb | medium |
| Local | ~92% | ~11 Kb | medium |
| Tournament | ~92–95% | ~67 Kb | high |

Diminishing returns: moving from 2-bit to history-aware gains ~7 points but ~30× the storage. Real designs choose based on the chip's area/power budget.

## Hybrid static+dynamic note

Compilers still help dynamic predictors: branch hint bits, hot/cold code layout (put the likely-taken target adjacent to the branch to help the BTB and I-cache), and predication for very short branches. Dynamic prediction dominates, but static support improves its accuracy and reduces warm-up.

## Key takeaways

- Control hazards cost 1+ cycles; deeper pipelines multiply the cost → predict.
- 2-bit saturating counters resist noise; 1-bit over-reacts at loop exits.
- History (global = other branches, local = this branch's past) boosts accuracy to ~92%.
- Tournament picks the right predictor per branch; BTB + return stack handle targets.
- Next: out-of-order execution (Chapter 7) — tolerating *all* latencies, not just branches.
