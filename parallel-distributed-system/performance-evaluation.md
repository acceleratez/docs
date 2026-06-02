# Performance Evaluation

## Metrics

### Speedup
$$S(p) = \frac{T_{serial}}{T_{parallel}(p)}$$

Measures how much faster the parallel program runs compared to serial.

### Efficiency
$$E(p) = \frac{S(p)}{p} = \frac{T_{serial}}{p \cdot T_{parallel}(p)}$$

Measures how effectively processor resources are utilized. $0 \leq E \leq 1$.

## Amdahl's Law

If a fraction $f$ of the computation is inherently sequential:

$$S_{\max} = \frac{1}{(1-f) + \frac{f}{p}} \leq \frac{1}{1-f}$$

**Key insight**: Even with infinite processors, speedup is limited by the sequential fraction.

Example: If 10% is sequential ($f = 0.9$), maximum speedup is 10×.

## Gustafson's Law

If the problem size scales with the number of processors:

$$S(p) = p - \alpha(p - 1)$$

where $\alpha$ is the serial fraction.

**Key insight**: With scaled problem size, near-linear speedup is achievable.

## Scalability

### Strong Scaling
- Fixed problem size, increasing processors
- Speedup should be near-linear
- Limited by Amdahl's Law

### Weak Scaling
- Problem size per processor remains constant
- Total work grows with processor count
- Limited by communication overhead

### Isoefficiency
The rate at which problem size must grow to maintain constant efficiency as processors increase.

## Performance Models

### PRAM Model
- Parallel Random Access Machine
- Idealized model: unlimited processors, unit-time shared memory access
- Variants: EREW, CREW, CRCW (based on concurrent access policies)

### BSP (Bulk Synchronous Parallel)
- Computation proceeds in supersteps
- Each superstep: local computation → global communication → barrier synchronization
- Cost model: $W + Hg + L$ (computation + communication + synchronization)

### LogP Model
- Parameters: $L$ (latency), $o$ (overhead), $g$ (gap), $P$ (processors)
- More realistic than PRAM for distributed memory systems
