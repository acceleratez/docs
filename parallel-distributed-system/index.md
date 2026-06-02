# Parallel and Distributed System

Notes based on lectures by Yong Zhao (Sichuan University).

Parallel and distributed computing leverages multiple processors to solve problems faster and at larger scale. From multicore CPUs to GPU clusters and cloud infrastructure, parallelism is fundamental to modern computing.

## Chapters

- [**Chapter 1: Introduction to Parallel Computing**](./introduction-parallel-computing) — What/Why/How, technology trends, application pull, task vs data parallelism
- [**Chapter 2: Parallel Programming Platforms**](./parallel-programming-platforms) — von Neumann modifications, Flynn taxonomy, shared vs distributed memory, cache coherence, interconnects
- [**Chapter 3: Parallel Algorithm Design**](./parallel-algorithm-design) — Decomposition strategies, domain decomposition, functional decomposition, case studies
- [**Chapter 4: Performance Evaluation**](./performance-evaluation) — Speedup, Amdahl's law, efficiency, scalability, performance models
- [**Chapter 5: MPI — Message Passing Interface**](./mpi-message-passing) — MPI basics, point-to-point communication, collective operations, derived datatypes
- [**Chapter 6: GPU Architecture and CUDA Programming**](./gpu-cuda-programming) — GPU architecture, CUDA model, memory hierarchy, tiling, convolution, optimization
- [**Chapter 7: Synchronization and Concurrency**](./synchronization) — Barriers, locks, atomic operations, memory consistency, concurrency control
- [**Chapter 8: Advanced Topics**](./advanced-topics) — MapReduce, cloud computing, fault tolerance, distributed machine learning
