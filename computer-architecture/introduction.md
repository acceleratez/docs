# Introduction to Computer Architecture

> Study notes for CS1541 (Yong Zhao, Sichuan University), following Patterson & Hennessy, *Computer Architecture: A Quantitative Approach* (6th ed.).
> Textbook authors John L. Hennessy and David A. Patterson won the 2017 ACM Turing Award for the RISC approach.

## Why Computer Architecture?

Algorithms teach you **Big-O** complexity — how work grows with input size. Computer architecture teaches you the **constant factors** that Big-O hides: cycles, energy, area, bandwidth. A CS/CE graduate who cannot reason about DRAM, pipelining, cache hierarchies, I/O, or virtual memory has a real gap in their education.

Key reasons to study it:

- **Efficiency is the constant.** Two algorithms with the same Big-O can differ 10× in wall-clock time because of memory layout, instruction mix, and parallelism.
- **Buy / design decisions.** Which chip is faster, a 4.4 GHz Intel Core i9 or a 4.7 GHz AMD Ryzen 9? Clock speed alone does not answer it — you must reason about IPC, power, and caches.
- **Better programs.** Knowledge of the hardware helps you reason about program performance, energy, memory placement (so hot data is nearby), threading (so threads interact well), and security (side channels).
- **The AI revolution owes a lot to fast hardware** — from GPUs to TPUs, fast, parallel, energy-efficient silicon made modern ML possible.

### A motivating example: 200× speedup

Matrix–vector multiply is a tiny kernel, yet a complete optimization stack delivers enormous gains:

| Optimization | Speedup |
|---|---|
| Data-level parallelism (vector/SIMD) | **3.8×** |
| Loop unrolling + out-of-order execution | **2.3×** |
| Cache blocking (better locality) | **2.5×** |
| Thread-level parallelism | **14×** |
| **Subtotal** | **~200×** |
| + Accelerators (GPU/TPU) | **+~100×** |

No single trick dominates — performance is a sum of architectural ideas, which is exactly what this course covers.

## Where It Fits: the hardware–software interface

Computer architecture is the **hardware–software interface** — the meeting point of CS and EE. Each layer affects and is affected by the layers above and below it.

| Layer (abstract → concrete) | Role |
|---|---|
| Applications | Problem-domain code |
| Algorithms | Big-O complexity |
| Operating Systems | Resource management, scheduling, protection |
| **ISA** | **Programmer's interface to hardware** |
| Logic design | Turning 0/1 into operations |
| Electrical / Physics | Devices, wires, transistors |

The **Instruction Set Architecture (ISA)** is the contract between software and hardware: it defines registers, instructions, addressing modes, and the memory model. Above it, compilers and OS writers are free to change; below it, hardware designers are free to change — as long as the ISA is honored. Logic design ("how do we make 0s and 1s do stuff, how do we build a CPU") sits just beneath.

### Learning assembly

A large part of understanding the interface means understanding assembly. As the slides put it: *"Learning assembly is like a car mechanic learning how an engine runs."* You become the compiler. You unlearn high-level conveniences:

- Data types and structures? Nope — just bytes and words.
- Infinite variables? Nope-ish — you have a small, fixed register file.
- Control structures? Just branches and jumps.

This is not because you will write everything in assembly (you should not), but because seeing the engine makes you a better systems programmer.

## A (very) brief history

- **Pre-history:** Charles Babbage's Differential Engine (designed 1819-ish), the first programmable calculator concept.
- **1945:** Alan Turing's ACE — first complete specification of an electronic stored-program computer.
- **1946:** ENIAC — 18,000 vacuum tubes, 30 tons, 175 kW, ~5,000 additions/sec; programs were "hardwired."
- **1947–49:** EDVAC (von Neumann, *stored program*), EDSAC (Wilkes, "not to be better, but to be used"), UNIVAC (first commercial computer, 1951).
- **von Neumann model:** data and program share one address space; a single processor fetches and executes sequential instructions.
- **Transistor (1947) → integrated circuit → microprocessors.** Intel 4004 (1971, 4-bit, 2,300 transistors) → Pentium 4 (2004, 125M transistors) → Kaby Lake (2017, >1,000M transistors).

The takeaway: transistor counts exploded, but the *fundamental* programming model (von Neumann) barely changed — architecture is about working within that model more cleverly.

## The three roadblocks

Modern architecture is defined by three bottlenecks. All three are "why" the course emphasizes caches, parallelism, and accelerators.

### 1. The power wall

Dynamic power is set by how often and how hard transistors switch:

$$
P_{\text{dyn}} \propto \text{activity} \times C \times V^2 \times f
$$

Leakage power grows with transistor count and voltage:

$$
P_{\text{leak}} \propto V
$$

- Frequency scaling stalled in the **early 2000s** — raising $f$ raised $P_{\text{dyn}}$ faster than cooling could handle (fancy cooling required beyond ~150 W).
- **Dennard (voltage) scaling ended in the early 2010s** — we could no longer shrink voltage proportionally with size, so per-transistor power stopped falling.
- Result: **dark silicon / dim silicon** — not all transistors can be powered on at once; occasional "turbo" bursts, then back down.

### 2. Running out of ideas

Single-thread performance improvement is plateauing. There are only so many ways to make one instruction stream faster before you hit Amdahl's Law on the sequential fraction. Most recent gains come from **more cores** and **occasional frequency spikes**, not cleverer single-core logic.

### 3. Technology (Moore's Law) scaling

**Moore's Law:** transistor count per chip doubles roughly every 18–24 months. Transistor density improves ~35%/year and die size ~10–20%/year, but wire delays do *not* shrink as fast as logic — and the end of the trend is imminent.

### Consequences

- Multi-core is now the default path to performance.
- Specialized **accelerators** (GPUs, TPUs, crypto engines) do a few kernels far more efficiently than general-purpose cores.
- **Energy efficiency** is the dominant metric, not raw speed.
- New concerns: security, reliability, and reduced data movement.

### Where we are headed

- Clock-speed improvements slowing (power constraints).
- Hard to optimize a single core further.
- More cores per generation; better programming models for multithreading.
- Better memory hierarchies; greater energy efficiency.
- Emergence of new metrics (security, reliability) and new workloads (ML, graphs, genomics).

## Classes of computers

Different machines make radically different design trade-offs. The same ISA concepts apply; the constraints differ.

### Embedded / microcontrollers

- 8/16-bit architectures still common; as little as **32 bytes** of memory.
- Run a single built-in program (your refrigerator, dishwasher, TV).
- Focus: ultra-low power, cost, size. The "Internet of Things" means more of these than ever.

### Consumer-grade (PC / mobile)

- 32/64-bit, MB–GB of RAM, GB–TB of storage.
- Multitasking OS; real-time user interaction (productivity, media, games).
- Energy still matters (battery life for mobile). Example: Apple A15 Bionic SoC.

### Servers / mainframes

- Dozens of cores, 32 GB+ RAM, massive storage, high-speed networking.
- Focus on real-time data delivery from storage or after processing.
- **Redundancy and hot-swappability**; goal is **100% uptime**.
- Power and cooling become huge concerns (warehouse-scale).

### Supercomputers

- Clusters of hundreds–thousands of CPUs.
- Crunch enormous datasets non-interactively: science, simulation, stock trading, crypto.

## Assembly vs machine code vs high-level

```
Machine language  10011101100110011001111101111001   (spoken by the CPU, binary)
Assembly language lw   $t0, x                         (human-readable, no abstraction)
High-level lang.  x = x + 1                           (abstracted, portable)
                  addi $t0, $t0, 1
                  sw   $t0, x
```

- **Machine code** is the binary the CPU actually executes.
- **Assembly** is the human-readable form of machine code. Each CPU has its own ISA, hence its own assembly.
- **High-level languages** heavily abstract the hardware; the *same* C source compiles to *different* assembly per CPU. Machine and assembly differ across CPUs; high-level code does not.

### Why learn assembly today?

Short answer: **yes, it is still useful**, but you should not write everything in it.

- No type-checking, no control structures, few abstractions — large programs would be impractical and CPU-specific.
- But it is excellent for **specialized stuff**: critical paths and boot code in kernels/OS, HPC (simulators), real-time programs, and embedded systems where many devices are programmed largely/entirely in assembly or C.

### The course ISA: MIPS (RISC)

We use **MIPS**, a classic RISC ISA:

- Not the most common today, but found in surprising places (Nintendo 64, PS1/PS2, many FPGAs).
- Very influential; most modern assembly looks like it. **ARM and RISC-V** are similar-ish ISAs seeing much more usage.

Example (increment a variable in memory):

```mips
lw   $t0, x        # load x into register
addi $t0, $t0, 1   # x = x + 1
sw   $t0, x        # store back to memory
```

RISC design philosophy (load/store architecture, fixed instruction length, many registers, simple addressing) is what makes pipelining tractable — a theme we return to in the pipelining chapters.

## Common principles preview

These ideas recur throughout the course and are worth internalizing now:

- **90-10 rule:** 10% of code accounts for 90% of execution time — optimize the hot path.
- **Principle of locality:** *temporal* (recently used data will be re-used) and *spatial* (neighboring data will be used). Caches and prefetchers exploit both.
- **Amdahl's Law:** speedup is limited by the fraction of time an enhancement applies.
- **Energy ≈ performance:** performance improvements usually also reduce energy (less leakage).

## Recap

- Architecture is the hardware–software interface; the ISA is the contract.
- Three roadblocks — power, ideas, technology scaling — push us toward multicore, accelerators, and energy efficiency.
- Know the classes of machines and why assembly/ISA knowledge makes you a better programmer.
- Next: how we *measure* performance (Chapter 2).
