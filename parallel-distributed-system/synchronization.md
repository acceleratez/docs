# Synchronization and Concurrency

## Why Synchronization?

Cores work at their own pace. Without synchronization, race conditions occur when multiple threads access shared data without coordination.

## Barrier Synchronization

A barrier ensures all threads reach a certain point before any proceed.

### CUDA
```c
__syncthreads();  // All threads in the block must reach this point
```

### MPI
```c
MPI_Barrier(MPI_COMM_WORLD);  // All MPI processes must reach this point
```

## Mutual Exclusion

### Locks (Mutex)
```c
pthread_mutex_lock(&mutex);
// critical section
pthread_mutex_unlock(&mutex);
```

### Atomic Operations (CUDA)
```c
atomicAdd(&sum, value);   // Atomic addition
atomicExch(&ptr, value);  // Atomic exchange
atomicCAS(&ptr, old, new); // Compare-and-swap
```

Atomic operations serialize access to shared variables — use sparingly.

## Memory Consistency Models

### Sequential Consistency
The simplest model: memory operations appear to execute in program order. All processors see a single interleaving of operations.

### Relaxed Consistency
Weaker guarantees for better performance:
- **Total Store Ordering (TSO)**: Writes may be buffered, reads can bypass earlier writes
- **Release Consistency**: Distinguishes acquire (read) and release (write) operations; synchronization between them ensures visibility

### False Sharing
When two threads modify different variables that happen to be on the same cache line:
1. Thread 1 writes to variable A
2. Cache coherence invalidates Thread 2's copy of the cache line
3. Thread 2 writes to variable B, invalidating Thread 1's cache line
4. ...ping-pong effect degrades performance

**Solution**: Pad data structures to align variables to cache line boundaries, or use thread-local storage.

## Concurrency Control Patterns

### Producer-Consumer
```c
// Producer
produce(data);
signal(empty_slot);

// Consumer
wait(full_slot);
consume(data);
```

### Read-Write Lock
- Multiple readers can hold lock simultaneously
- Writer requires exclusive access
- Useful when reads vastly outnumber writes

## Deadlock

Four necessary conditions:
1. Mutual exclusion
2. Hold and wait
3. No preemption
4. Circular wait

**Prevention**: Break any one condition (e.g., always acquire locks in a fixed order).

## Practical Guidelines

- Minimize the critical section (keep it short)
- Avoid nesting locks with different orders
- Use lock-free data structures when possible
- Profile before optimizing — synchronization bottlenecks may not be where you expect
