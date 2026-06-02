# GPU Architecture and CUDA Programming

## GPU Architecture

GPUs are massively parallel processors optimized for throughput.

### Key Characteristics
- Thousands of lightweight threads
- SIMT (Single Instruction, Multiple Thread) execution model
- Warps: groups of 32 threads executing in lockstep
- High memory bandwidth (hundreds of GB/s)

### Memory Hierarchy

| Memory Type | Scope | Size | Speed |
|---|---|---|---|
| **Registers** | Per thread | Limited | Fastest |
| **Shared Memory** | Per thread block | ~48-96 KB | ~Register speed |
| **L1/L2 Cache** | Per SM / Device | KB-MB | Fast |
| **Global Memory** | All threads | GB | Slow (~600 cycles) |
| **Constant Memory** | All threads (read-only) | ~64 KB | Cached, fast for uniform access |
| **Texture Memory** | All threads (read-only) | Cached | Optimized for spatial locality |

## CUDA Programming Model

### Kernel Launch
```c
kernel<<<numBlocks, threadsPerBlock>>>(args);
```

### Thread Indexing
```c
int i = blockIdx.x * blockDim.x + threadIdx.x;  // 1D
int row = blockIdx.y * blockDim.y + threadIdx.y;  // 2D
int col = blockIdx.x * blockDim.x + threadIdx.x;
```

### Memory Operations
```c
// Allocate device memory
cudaMalloc((void **)&d_A, size);

// Copy host to device
cudaMemcpy(d_A, h_A, size, cudaMemcpyHostToDevice);

// Copy device to host
cudaMemcpy(h_A, d_A, size, cudaMemcpyDeviceToHost);

// Free
cudaFree(d_A);
```

### Pinned (Page-Locked) Memory
```c
cudaHostAlloc((void **)&h_A, size, cudaHostAllocDefault);
cudaFreeHost(h_A);
```

## Tiling and Shared Memory Optimization

### Tiled Matrix Multiplication

Each thread block computes an output tile. Input tiles are loaded into shared memory to reduce global memory accesses.

$$
\text{Reduction factor} = \frac{O\_TILE\_WIDTH^2 \times MASK\_WIDTH^2}{(O\_TILE\_WIDTH + MASK\_WIDTH - 1)^2}
$$

### Tiled Convolution
1. Load input tile with halo into shared memory
2. `__syncthreads()` barrier
3. Compute output using shared memory
4. Write result to global memory

### Design Tradeoffs
- **Option 1**: Thread block size = output tile size (some threads load extra input)
- **Option 2**: Thread block size = input tile size (some threads idle during computation)

Larger shared memory usage → better effective memory bandwidth, but fewer thread blocks can be resident on each SM.

## Key Optimization Principles

1. **Maximize thread occupancy** (more warps can hide memory latency)
2. **Coalesce global memory accesses** (consecutive threads access consecutive addresses)
3. **Minimize host-device transfers** (keep data on GPU as long as possible)
4. **Use shared memory** for data reuse within a block
5. **Avoid thread divergence** within warps (different execution paths serialize)
6. **Use constant memory** for read-only data uniformly accessed by all threads
