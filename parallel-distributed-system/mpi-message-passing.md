# MPI — Message Passing Interface

## Overview

MPI is the standard for message-passing parallel programming on distributed memory systems. Each process has its own address space and communicates explicitly via messages.

### Basic Concepts
- **MPI_COMM_WORLD**: Default communicator containing all processes
- **Rank**: Integer identifier of a process within a communicator
- **Size**: Total number of processes in a communicator

### Initialization and Finalization

```c
#include <mpi.h>

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);
    // ... application code ...
    MPI_Finalize();
    return 0;
}
```

### Querying Process Information

```c
int rank, size;
MPI_Comm_rank(MPI_COMM_WORLD, &rank);
MPI_Comm_size(MPI_COMM_WORLD, &size);
```

## Point-to-Point Communication

### Blocking Send and Receive

```c
MPI_Send(buf, count, datatype, dest, tag, MPI_COMM_WORLD);
MPI_Recv(buf, count, datatype, source, tag, MPI_COMM_WORLD, &status);
```

### Basic Datatypes

| MPI Type | C Type |
|---|---|
| `MPI_INT` | `int` |
| `MPI_FLOAT` | `float` |
| `MPI_DOUBLE` | `double` |
| `MPI_CHAR` | `char` |
| `MPI_BYTE` | raw bytes |

## Collective Communication

### Broadcast (one-to-all)
```c
MPI_Bcast(data, count, datatype, root, MPI_COMM_WORLD);
```

### Gather (all-to-one)
```c
MPI_Gather(sendbuf, sendcnt, sendtype, recvbuf, recvcnt, recvtype, root, comm);
```

### Scatter (one-to-all)
```c
MPI_Scatter(sendbuf, sendcnt, sendtype, recvbuf, recvcnt, recvtype, root, comm);
```

### Reduce (all-to-one with operation)
```c
MPI_Reduce(sendbuf, recvbuf, count, datatype, MPI_SUM, root, MPI_COMM_WORLD);
```

### All-Reduce (all-to-all with operation)
```c
MPI_Allreduce(sendbuf, recvbuf, count, datatype, MPI_SUM, MPI_COMM_WORLD);
```

## Synchronization

### Barrier
```c
MPI_Barrier(MPI_COMM_WORLD);  // All processes wait until all reach this point
```

## Derived Datatypes

MPI allows constructing custom types for non-contiguous data (strided arrays, structures, etc.) using `MPI_Type_vector`, `MPI_Type_struct`, etc.

## MPI + CUDA Integration

- Use `cudaHostAlloc` for pinned host memory (faster PCIe transfers)
- MPI processes can each control their own GPU
- Communication pattern: MPI handles inter-node communication, CUDA handles intra-node computation
