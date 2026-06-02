# Parallel Algorithm Design

## Decomposition Strategies

### Domain Decomposition
Partition the **data** on which computations are performed.

1. Partition the data into pieces
2. Assign pieces to processors/threads
3. Each processor performs computations primarily on its local data
4. Communicate boundary data as needed

Examples: matrix multiplication, finite difference methods, n-body problems

### Functional Decomposition
Partition the **computation** rather than the data.

1. Identify independent computational tasks
2. Assign tasks to processors/threads
3. Tasks may require data from other tasks (communication)

Examples: signal processing pipelines, producer-consumer patterns

## Case Studies

### Boundary Value Problem
- Decompose the 2D grid into blocks
- Each processor solves its block
- Communicate boundary values with neighbors (ghost cells)

### Finding the Maximum
- Each processor finds local maximum
- Tree-based reduction to find global maximum
- $O(\log p)$ time for $p$ processors

### The N-Body Problem
- Compute forces between all pairs of bodies
- $O(n^2/p)$ computation per processor
- All-to-all communication of updated positions

### Adding Data Input
- Read data on one processor, distribute
- Or parallel I/O: each processor reads its portion

## Parallel Programming Models

### SPMD (Single Program, Multiple Data)
- All processors execute the same program
- Each processor has a unique identifier (rank)
- Uses rank to determine which data to process
- Dominant style for MPI and many OpenMP/CUDA programs

### Master/Worker
- Master thread creates pool of worker threads and bag of tasks
- Workers pull tasks and execute them
- Used by OpenMP, OpenACC, TBB

### Loop Parallelism
- Parallelize loop iterations
- Each thread executes a subset of iterations
- Used by OpenMP, OpenACC, C++AMP

### Fork/Join
- Most general threading model
- Fork: create threads; Join: wait for completion
- POSIX pthreads

## Load Balancing

### Static Load Balancing
- Assign work at compile time
- Works well when computation is predictable

### Dynamic Load Balancing
- Assign work at run time
- Better for irregular or unpredictable computations
- Cost: scheduling overhead
