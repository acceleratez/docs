# Introduction to Parallel Computing

## What is Parallel Computing?

**Parallel computing**: The use of two or more processors (computers), usually within a single system, working simultaneously to solve a single problem.

**Distributed computing**: Computing that involves multiple computers remote from each other that each have a role in a computation problem or information processing.

### Parallel vs. Distributed Systems

| Aspect | Parallel Systems | Distributed Systems |
|---|---|---|
| Memory | Tightly coupled shared memory (UMA, NUMA) | Distributed memory (message passing, RPC) |
| Control | Global clock control (SIMD, MIMD) | No global clock; synchronization algorithms needed |
| Interconnect | Bus, mesh, tree, hypercube (Tbps) | Ethernet, token ring, switching network (Gbps) |
| Granularity | Fine | Coarse |
| Reliability | Assumed | Not assumed |
| Main Focus | Performance (time and scale) | Performance (cost, scalability), reliability, resource sharing |

## Why Parallel Computing?

### Technology Trends
- **Moore's Law**: Transistor density doubles every ~18 months
- **Clock speed scaling has hit physical limits** (power density, ILP tapped out)
- **Chip yield** favors many smaller, simpler processors
- **Memory is not keeping pace** with processor logic

### Application Pull
- Scientific computing: climate modeling, genomics, astrophysics, CFD
- Engineering: semiconductor design, structural modeling, crash simulation
- Business: financial modeling, web services, search engines
- Simulation is the "third pillar of science" alongside theory and experiment

## How to Write Parallel Programs

### Task Parallelism
Partition various **tasks** carried out in solving the problem among cores.
- Example: TA#1 grades questions 1-5, TA#2 grades questions 6-10

### Data Parallelism
Partition the **data** used in solving the problem among cores. Each core carries out similar operations on its part of the data.
- Example: Each TA grades 100 exam papers

### Coordination
Cores need to coordinate:
- **Communication**: Sending partial results between cores
- **Load balancing**: Distributing work evenly
- **Synchronization**: Ensuring cores don't get too far ahead

## Key Insight

Sometimes the best parallel solution requires devising an **entirely new algorithm**, not just parallelizing a serial one. Example: tree-based global sum vs. master-slave global sum — factor of 100 improvement with 1000 cores.
