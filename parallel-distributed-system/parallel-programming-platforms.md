# Parallel Programming Platforms

## Modifications to the von Neumann Model

Three key improvements to address the von Neumann bottleneck:

### 1. Caching
A collection of memory locations that can be accessed faster than main memory.

- **Principle of locality**: After accessing one memory location, a program tends to access nearby locations (spatial locality) in the near future (temporal locality)
- **Cache levels**: L1 (smallest, fastest) → L2 → L3 (largest, slowest)
- **Cache hit/miss**: Hit serves data from cache; miss fetches from lower level
- **Write policy**: Write-through (update memory immediately) vs. write-back (mark dirty, write on eviction)

### 2. Virtual Memory
- Extends physical memory using disk storage
- Provides each process with its own address space
- Page tables manage mapping between virtual and physical addresses

### 3. Low-Level Parallelism
- Instruction-level parallelism (ILP): pipelining, superscalar execution
- SIMD instructions: same operation on multiple data elements

## Flynn's Taxonomy

| Category | Description |
|---|---|
| **SISD** | Single Instruction, Single Data — classic von Neumann |
| **SIMD** | Single Instruction, Multiple Data — GPU, vector processors |
| **MISD** | Multiple Instruction, Single Data — rare (fault-tolerant systems) |
| **MIMD** | Multiple Instruction, Multiple Data — most common parallel architecture |

## Memory Architectures

### Shared Memory Systems
- All processors share a single global address space
- Communication via shared variables
- UMA (Uniform Memory Access) vs. NUMA (Non-Uniform Memory Access)

### Distributed Memory Systems
- Each processor has its own private memory
- Communication via message passing
- Clusters, MPP (Massively Parallel Processors)

## Cache Coherence

When multiple processors cache the same memory location, changes must be propagated.

### Protocols
- **Write-invalidate**: Invalidate other copies on write (more common)
- **Write-update**: Broadcast new value to all copies

### False Sharing
When two processors access different variables that happen to reside on the same cache line — causes unnecessary coherence traffic.

## Interconnection Networks

- **Bus**: Simple, shared, limited bandwidth
- **Mesh/Torus**: Scalable, good for nearest-neighbor communication
- **Tree**: Hierarchical, good for reduction operations
- **Hypercube**: Logarithmic diameter, rich connectivity
- **Crossbar**: Non-blocking but expensive ($O(n^2)$ switches)
