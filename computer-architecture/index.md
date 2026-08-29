# Computer Architecture (CS1541)

Study notes based on lectures by Yong Zhao (Sichuan University), following Patterson & Hennessy, *Computer Architecture: A Quantitative Approach* (6th ed.).

Computer architecture is the hardware–software interface: how instructions are represented, how performance and power are quantified, and how pipelining, caches, and parallelism extract more work per joule and per clock cycle.

## Chapters

- [**Chapter 1: Introduction**](./introduction) — Why architecture matters, Moore's Law, the power wall, classes of computers, assembly vs machine code
- [**Chapter 2: Measuring Performance**](./performance) — CPU time equation, CPI, power/energy, Amdahl's law, benchmarks (SPEC), summary statistics
- [**Chapter 3: Basic Pipelining**](./pipeline) — 5-stage pipeline, speedup, structural/data/control hazards, forwarding and stalls
- [**Chapter 4: Data Hazards**](./data-hazard) — RAW/WAW/WAR dependences, hazard detection unit, load delay slots, forwarding
- [**Chapter 5: Instruction Level Parallelism**](./ilp) — Loop scheduling, loop unrolling, software pipelining, superscalar/VLIW
- [**Chapter 6: Branch Prediction**](./branch-prediction) — Control hazards, 1/2-bit bimodal, correlating, tournament, and target predictors
- [**Chapter 7: Out-of-Order Processors**](./out-of-order) — Tomasulo's algorithm, register renaming, ROB, issue queue, memory disambiguation
- [**Chapter 8: Cache Hierarchy**](./cache) — Locality, hit/miss, direct-mapped/set-assoc, miss classification, replacement, write policies
- [**Chapter 9: Virtual Memory**](./virtual-memory) — Pages, page tables, TLB, virtually-indexed caches, superpages, protection
- [**Chapter 10: Memory & DRAM**](./memory) — DRAM organization, ranks/banks/row buffers, scheduling policies, Meltdown/Spectre
- [**Chapter 11: Multiprocessors**](./multiprocessor) — SMP/NUMA, MSI/MESI snooping, directories, locks, coherence vs consistency
