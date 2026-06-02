# Advanced Topics

## Cloud Computing

### Service Models
- **IaaS** (Infrastructure as a Service): Virtual machines, storage, networking (AWS EC2, Google Compute Engine)
- **PaaS** (Platform as a Service): Managed runtime environments (Google App Engine, Heroku)
- **SaaS** (Software as a Service): Fully managed applications (Gmail, Office 365)

### Key Concepts
- **Virtualization**: Hypervisors enable multiple VMs on one physical machine
- **Containers**: Lightweight isolation (Docker, Kubernetes) — share kernel, faster startup
- **Elasticity**: Automatic scaling based on demand
- **Multi-tenancy**: Multiple customers share the same infrastructure

## MapReduce

Programming model for processing large datasets on clusters.

### Paradigm
```
Map:    (key1, value1) → [(key2, value2)]
Reduce: (key2, [value2]) → [(key3, value3)]
```

### Key Features
- Automatic parallelization across cluster
- Fault tolerance via data replication and task re-execution
- Locality optimization: move computation to data

### Ecosystem
- **Hadoop**: Open-source MapReduce implementation
- **Spark**: In-memory processing, RDD abstraction, faster than Hadoop for iterative algorithms
- **HDFS**: Distributed filesystem for large-scale data storage

## Fault Tolerance

### Types of Failures
- **Fail-stop**: Processor ceases operation, detectable
- **Byzantine**: Arbitrary (malicious) behavior
- **Transient**: Temporary (e.g., bit flip), may self-correct

### Techniques
- **Checkpoint/Restart**: Periodically save state, restart from last checkpoint on failure
- **Replication**: Keep multiple copies of data/tasks (e.g., 3-way replication in HDFS)
- **Consensus Protocols**: Paxos, Raft — ensure agreement in distributed systems despite failures

## Distributed Machine Learning

### Data Parallelism
Each worker has a copy of the model, trains on a data shard, gradients are aggregated.

### Model Parallelism
Different parts of the model reside on different workers. Used for very large models.

### Parameter Server Architecture
- **Parameter servers**: Store shared model parameters
- **Workers**: Compute gradients on local data
- Communication: Push gradients, pull updated parameters

### Frameworks
- Horovod (MPI-based, ring all-reduce)
- PyTorch Distributed (torch.distributed)
- TensorFlow distributed strategy

## High Performance Computing (HPC)

### TOP500
Lists the 500 most powerful computers in the world, using Rmax of Linpack benchmark.

### Modern Trends
- Heterogeneous computing (CPU + GPU + FPGA)
- Exascale computing ($10^{18}$ flops)
- Convergence of HPC and AI workloads
- Energy efficiency as a primary design constraint

### Key Units
| Prefix | Flop/s | Bytes |
|---|---|---|
| Mega | $10^6$ | $2^{20}$ |
| Giga | $10^9$ | $2^{30}$ |
| Tera | $10^{12}$ | $2^{40}$ |
| Peta | $10^{15}$ | $2^{50}$ |
| Exa | $10^{18}$ | $2^{60}$ |
