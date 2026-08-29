# Measuring Performance

> How do we * quantify* "fast"? This chapter builds the equations every later chapter relies on: CPU time, CPI/IPC, power/energy, Amdahl's Law, and benchmark summarization.

## Performance metrics

Two complementary measures:

- **Response time** (latency): elapsed time from start to finish of a program — wall-clock time, *including* OS time. What users feel.
- **Throughput**: amount of work done per unit time (jobs/sec, queries/sec).

They are usually linked: a faster processor improves both; *more* processors usually only improve throughput; some policies improve one and worsen the other.

### Performance is the inverse of execution time

$$
\text{Performance}_X = \frac{1}{\text{ExecutionTime}_X}
$$

So comparing two systems:

$$
\text{Speedup} = \frac{\text{ExecTime}_Y}{\text{ExecTime}_X} = \frac{\text{Performance}_X}{\text{Performance}_Y}
$$

$$
\text{Improvement} = \text{Speedup} - 1
$$

**Worked example.** System X runs a program in 10 s, system Y in 15 s.
- Speedup of X over Y = $15/10 = 1.5$.
- Improvement = $1.5 - 1 = 0.5 = 50\%$.
- Execution-time *reduction* for X vs Y = $(15-10)/15 = 33\%$.
- Execution-time *increase* for Y vs X = $(15-10)/10 = 50\%$.

Note the asymmetry: reduction and increase are computed against different denominators.

## The CPU time equation

Execution time decomposes into clock cycles and clock period:

$$
\text{CPU time} = \text{CPU clock cycles} \times \text{Clock cycle time}
$$

$$
\text{Clock cycle time} = \frac{1}{\text{Clock speed}}
$$

And clock cycles decompose by instruction count and average cycles per instruction:

$$
\text{CPU clock cycles} = \text{Instruction count (IC)} \times \text{CPI}
$$

Putting it together — the **central equation of the course**:

$$
\boxed{\text{CPU time} = \text{IC} \times \text{CPI} \times \text{Clock cycle time}}
$$

- **CPI** = average cycles per instruction. **IPC** = instructions per cycle = $1/\text{CPI}$.
- Equivalently, $\text{Performance} \propto \text{Clock speed} \times \text{IPC} / \text{IC}$.

**Quick checks (from the slides):**

- A 3 GHz processor ticks 3 billion times/sec. A program running 2 billion cycles on a 1.5 GHz CPU: exec time = $2\times 10^9 / 1.5\times 10^9 = 1.33$ s.
- A 2 GHz processor graduating one instruction every 3rd cycle: CPI = 3. A 10 s program runs $2\times 10^9 \times 3 = 6\times 10^9$ instructions.

**Worked example — which system is better?**
- System A: 4 billion MIPS instructions, CPI = 1.5, clock = 1 GHz.
  $\text{CPU time}_A = 4\times 10^9 \times 1.5 \times (1/10^9) = 6$ s.
- System B: 2 billion x86 instructions, CPI = 6, clock = 1.5 GHz.
  $\text{CPU time}_B = 2\times 10^9 \times 6 \times (1/1.5\times 10^9) = 8$ s.
- **A is faster** despite more instructions and slower clock, because its CPI is far better.

### Problem 5 (IPC down, clock up)

> New laptop: IPC 20% worse, clock 30% higher, same binaries. Speedup?

$$
\text{Speedup} = \frac{\text{new clock}\times\text{new IPC}}{\text{old clock}\times\text{old IPC}} = 1.3 \times 0.8 = 1.04
$$

Even though IPC fell, the higher clock wins by a hair: **1.04× faster**. This shows why you cannot compare clock speeds in isolation.

### Problem 6 (equal CPU-time share, AM of IPCs)

Given old/new IPC per program and equal CPU-time share, the right summary is the **arithmetic mean of IPCs**. Old AM = 1.6, new AM = 1.6, clock ratio 1.3 → speedup = 1.3.

## Power and energy

- **Total power** = dynamic power + leakage power.
- **Dynamic power**: $\propto \text{activity} \times C \times V^2 \times f$.
- **Leakage power**: $\propto V$ (and transistor count).
- **Energy** = Power × Time (joules = watts × seconds).

Energy is the true "cost" of a *fixed task*; power is the *constraint* (you can only run as fast as your cooling/power delivery allows).

### Example — Turbo mode uses LESS energy?

> A 1 GHz CPU takes 100 s for a CPU-bound program, consuming 70 W dynamic + 30 W leakage. Does Turbo (1.2 GHz) use less energy?

- Normal: $100\text{ W} \times 100\text{ s} = 10{,}000\text{ J}$.
- Turbo: dynamic power scales with $f$: $70\times 1.2 = 84$ W; leakage stays 30 W. Time scales inversely with $f$: $100/1.2$ s.
  $\text{Energy} = (84 + 30) \times (100/1.2) = 114 \times 83.33 = 9{,}500\text{ J}$.

**Turbo uses *less* energy** because frequency only affects dynamic power, and the time savings outweigh the power increase. (Assumes CPI unchanged — exec time varies linearly with cycle time.)

### Reducing power and energy

- **Clock gating:** turn off inactive transistors (reduces leakage).
- **DFS (Dynamic Frequency Scaling):** lower $f$ only → lowers dynamic power but *hurts* energy (runs longer).
- **DVFS (Dynamic Voltage & Frequency Scaling):** lower $V$ and $f$ together. A 10% drop in $V$ and $f$ can: slow the program ~8%, but cut dynamic power ~27%, total power ~23%, total energy ~17% (lower $V$ → slower transistor → lower $f$).

**Worked — Problem 3.** Proc-A at 3 GHz: 80 W dynamic + 20 W static, 20 s program.
- Scale $f$ down 20%: new dynamic = 64 W, static = 20 W, time = 25 s → Energy = $84\times 25 = 2{,}100$ J.
- Scale $V$ and $f$ down 20%: dynamic $\propto V^2 f \Rightarrow 0.8^3 = 0.512$ → $80\times 0.512 = 41$ W; static $\propto V \Rightarrow 20\times 0.8 = 16$ W; time = 25 s → Energy = $57\times 25 = 1{,}425$ J.

### Utilization and leakage — Problem 1

> 100% utilization at 100 W, 20% leakage. Power at 50% utilization?

Dynamic = 80 W scales with activity; leakage = 20 W is constant.
At 50%: $80\times 0.5 + 20 = 60$ W. At 0%: **20 W** (pure leakage).
This is the basis of **server consolidation** in datacenters: pack work onto a few highly-utilized servers so the rest can idle near leakage-only power.

### Problem 2 — pick a processor

> Proc-A uses 1.4× the power of Proc-B but finishes 20% faster.
> (a) Power-delivery constrained → **Proc-B** (uses less power).
> (b) Minimize energy → Proc-A: energy ratio $1.4 \times 0.8 = 1.12$ (12% more than B, but sometimes acceptable).
> (c) Minimize response time → **Proc-A** (faster); or scale up Proc-B's frequency to match while still winning on power/energy.

## Benchmarks

To compare systems we need representative workloads:

- **SPEC CPU** (e.g., SPEC 2017): CPU-oriented programs; the SPEC *rating* says how much faster a system is than a baseline. A system rated 600 is 1.5× a system rated 400.
- **SPECweb / TPC**: throughput-oriented (servers).
- **EEMBC**: embedded processors.

### Summarizing performance across programs

Three ways to compress many execution times into one number:

| Method | Definition | Predicts |
|---|---|---|
| **AM** (arithmetic mean) of weighted exec times | average of (ref-weighted) times | a *specific* workload |
| **GM** (geometric mean) | $\sqrt[N]{\prod t_i}$ of exec times | nothing real, but no reference machine needed |
| **HM** (harmonic mean) | $N / \sum (1/t_i)$ | average *rate* (e.g., IPC) |

**Key relationships:**
- $\text{GM of IPCs} = 1 / \text{GM of CPIs}$.
- $\text{AM of IPCs} = 1 / \text{HM of CPIs}$, and vice versa.
- If programs weighted for equal *cycles*, use AM of IPCs (or HM of CPIs).
- If weighted for equal *instructions*, use AM of CPIs (or HM of IPCs).
- GM of IPCs does **not** represent any real runtime (multiplying instructions is meaningless), but every program's IPC contributes equally.

**GM inconsistency warning (Problem 4 style).** With Sys-A as reference:
- `P1: A=5, B=6, C=7`; `P2: A=10, B=8, C=9`; `P3: A=20, B=18, C=14`.
- Sum of exec times (AM): A=35, B=32, C=30.
- Sum of weighted exec times: A=3.0, B=2.9, C=3.0.
- GM: A=10.0, B=9.5, C=9.6.
- Relative to C, B's speedup is 1.03 (SWET), 1.01 (GM), or 0.94 (SET) — three different answers! The metric matters.

## Amdahl's Law

Architecture is **bottleneck-driven**: make the common case fast; do not waste resources on a component that has little impact.

> Performance improvement from an enhancement is limited by the *fraction of time the enhancement applies*.

Let $P$ = fraction of the program that can be sped up (parallelizable), and $N$ = how many times faster that fraction becomes (or number of units). The overall speedup $S$:

$$
S = \frac{1}{(1 - P) + \dfrac{P}{N}}
$$

- The $(1-P)$ term is the **sequential, un-improvable fraction** — it is the ceiling.
- As $N \to \infty$, $S \to 1/(1-P)$: you can never beat the serial fraction.

**Web-server example.** A server spends 40% in CPU and 60% in I/O. A 10× faster CPU:
- Max speedup $= 1 / (0.6 + 0.4/10) = 1 / 0.64 = 1.56$.
- Max execution-time reduction = $1 - 1/1.56 = 40\%$ (the CPU fraction). Note the slides sometimes phrase the limit as 1.66; both follow the same formula with the right $P$.

**Takeaway:** parallelism helps only the parallelizable part. This is why single-thread stalls, cache misses, and serial phases dominate real speedups.

## Reliability and availability

- Systems toggle between **service accomplishment** (matches spec) and **service interruption** (deviates).
- **Reliability** = continuous service → expressed as **MTTF** (mean time to failure).
- **Availability** = fraction of time service matches spec:

$$
\text{Availability} = \frac{\text{MTTF}}{\text{MTTF} + \text{MTTR}}
$$

## Cost

- Determined by volume, yield, manufacturing maturity, area, etc.
- **Area matters**: smaller die → more chips per wafer → higher yield (a defect discards less area) → roughly, **half the area ≈ one-third the cost**.
- This is why hardware designers obsess over transistor count and die size, not just performance.

## Important trends (historical contributions)

| Source of performance gain | Historical share |
|---|---|
| Better processes (faster devices) | ~20% |
| Better circuits / pipelines | ~15% |
| Better organization / architecture | ~15% |

Going forward, *better processes* will vanish (Moore's Law ending) and *better circuits* help little — leaving **architecture and parallelism** as the only growth path. A programmer today can expect only ~20%/year improvement, and *less* if the program is not multithreaded.

## What this means for a programmer

- Need many threads; threads need efficient synchronization and communication.
- Data placement in the memory hierarchy matters.
- Use accelerators when possible.

## Common principles (summary)

- **Amdahl's Law**: optimize the common case; serial fraction caps speedup.
- **Energy ≈ performance**: efficiency wins usually also save energy (less leakage).
- **90-10 rule**: 10% of code = 90% of execution time.
- **Locality**: temporal (re-use) and spatial (neighbors) — the foundation of caches.

## Recap

- $\text{CPU time} = \text{IC} \times \text{CPI} \times \text{Clock cycle time}$.
- Energy = Power × Time; DVFS cuts both $V$ and $f$; Turbo can *reduce* energy for CPU-bound work.
- Benchmarks need summarization; pick AM (specific workload), GM (no reference), or HM (rates) deliberately.
- Amdahl's Law: speedup ceiling = $1/(1-P)$.
- Next: pipelining — how we raise IPC toward 1 CPI.
