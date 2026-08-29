# Disk Storage, Basic File Structures, Hashing, and Modern Storage Architectures

## 16.1 Storage Hierarchy

Databases persist on **secondary storage** (magnetic disks, SSDs). Data is accessed via physical file structures.

| Level | Devices | Volatile? |
|---|---|---|
| Primary | CPU cache (SRAM), main memory (DRAM) | Yes |
| Secondary | Magnetic disks, flash memory, SSDs | No (persistent) |
| Tertiary | Removable media: CD-ROM, DVD, tape | No |

**Persistent data** survives program execution; **transient data** exists only during execution. **File organization** determines how records are physically placed on disk and thus how they are accessed.

### Characteristics (capacity / access time / bandwidth / cost)
- Faster storage = more expensive per byte and smaller capacity.
- Main memory: fastest, costly; disk: cheaper, slower; tape: cheapest, slowest (sequential).

## 16.2 Secondary Storage Devices (Disks)

### Magnetic disk geometry
- Bits grouped into **bytes/characters**; capacity measured in bytes.
- Disks may be single- or double-sided.
- **Tracks**: concentric circles; a **cylinder** = the set of tracks at the same position across surfaces of a disk pack.
- Tracks divided into **blocks / sectors**, separated by interblock gaps.
- **Formatting** divides tracks into equal-sized blocks. Data transfers in units of **disk blocks**.
- **Read/write head** reads/writes; **disk controller** interfaces the drive to the system (standard interfaces: **SCSI, SATA, SAS**).
- Hardware address supplied to I/O hardware; blocks moved via a **buffer**.

Efficient access techniques: data buffering, good on-disk organization, **read-ahead**, I/O scheduling, **log disks** for temporary writes, and SSDs/flash for recovery.

### Solid-state / flash storage
- **SSD**: controller + interconnected flash memory cards; no moving parts; data less fragmented; more costly than HDD; faster access. DRAM-based SSDs are even faster.

### Magnetic tape
- **Sequential access**: must scan preceding blocks to reach a target. Used for **backup / archive** (mount, scan, read).

## 16.3 Buffering of Blocks

- Buffering is most useful when processes run concurrently. **Double buffering** lets one buffer fill while the other is processed, enabling a continuous stream of blocks.
- **Buffer management** tracks:
  - **Pin count**: number of active users holding the block (pinned blocks not evicted).
  - **Dirty bit**: block modified in memory but not yet written to disk.
- **Replacement strategies**: LRU (least recently used), Clock, FIFO.

## 16.4 Placing File Records on Disk

- A **record** = collection of related values (fields) with types: numeric, string, Boolean, date/time, **BLOB** (unstructured objects).
- **Variable-length records** arise from variable-length fields, repeating fields, optional fields, or mixed record types.
- **Spanned vs. unspanned**:
  - **Unspanned**: a record cannot cross a block boundary (wastes some space at block end).
  - **Spanned**: a record larger than one block is split across blocks via a pointer to the next block.
- **Blocking factor** = average number of records per block for the file.

### Allocating file blocks
- **Contiguous**: blocks placed adjaciously (fast sequential, poor for growth).
- **Linked**: blocks linked by pointers (good for append, slow random).
- **Indexed**: an index block holds addresses (flexible).
- **File header (descriptor)**: disk addresses, format descriptions, etc.

## 16.5 Operations on Files

- **Retrieval** (no data change): open, find, read, findNext, scan, close.
- **Update**: insertion, deletion, modification; records selected by a selection condition.

### Heap (unordered / pile) files
Records appended in insertion order. Insert = O(1) (append); search = linear scan; deletion via rewriting the block or a **deletion marker**.

### Ordered (sequential) files
Records sorted by an **ordering field** (an **ordering key** if it's a key). Reading in key order is extremely efficient; **binary search** finds a record. Good for range queries but insertion/deletion is costly (may require reorganization).

| Organization | Search | Insert | Delete | Best for |
|---|---|---|---|---|
| Heap | O(n) linear | O(1) | marker/rewrite | append-heavy |
| Ordered | O(log n) binary | slow | slow | sorted scans/ranges |
| Hashed | O(1) | O(1) | O(1) | equality lookups |

## 16.8 Hashing Techniques

A **hash function** (randomizing function) maps a record's **hash field** (usually the key) to the disk-block address. Best when records are accessed exclusively by equality on that field.

### Internal hashing (in memory)
- A **hash table** with buckets; **collision** = two records map to the same address.
- Resolution: **open addressing** (probe next slot), **chaining** (linked overflow), **multiple hashing** (second function).

### External hashing (disk)
- Address space = **buckets**, each a disk block (or contiguous blocks).
- A header table maps bucket number → disk address.
- **Static hashing**: fixed number of buckets (overflow chains handle collisions; performance degrades as the file grows).

### Dynamic hashing (grow/shrink)
- **Extendible hashing**: directory of bucket pointers; doubles as needed; performance does not degrade as file grows.
- **Dynamic hashing**: tree-structured directory.
- **Linear hashing**: expands/shrinks buckets without a directory.

## 16.9 Other Primary File Organizations

- **Files of mixed records**: relationships via logical field references; **physical clustering** keeps related records together.
- **B-tree** data structure used for indexed access (Ch. 17).
- **Column-based storage**: stores columns together (good for analytics/warehousing).

## 16.10 RAID (Parallelizing Disk Access)

**RAID** (Redundant Array of Independent Disks) improves speed and reliability via **data striping** (bit-level or block-level) across multiple disks, plus redundancy.

| Level | Scheme | Redundancy | Notes |
|---|---|---|---|
| 0 | Block striping, no redundancy | None | Highest speed, no fault tolerance |
| 1 | **Mirroring** (duplicate disks) | Full copy | Simplest rebuild; costly |
| 2 | Hamming-code ECC | Memory-style | Rare |
| 3 | Single parity disk | 1 disk | Controller-based parity |
| 4 | Block-level striping + parity disk | 1 disk | Parity bottleneck |
| 5 | Block striping + **distributed parity** | 1 disk | Preferred for large volumes |
| 6 | **P+Q** double redundancy | 2 disks | Tolerates two failures |

- Performance: striping raises transfer rates.
- Reliability: mirroring/shadowing + parity. RAID 3 and 5 preferred for large storage; level 1 rebuilds easiest.

## 16.11 Modern Storage Architectures

- **Storage Area Network (SAN)**: storage peripherals as nodes on a high-speed network.
- **Network-Attached Storage (NAS)**: servers for file sharing; scalable/reliable/flexible.
- **iSCSI**: SCSI commands sent to remote SCSI devices over IP.
- **FCIP / FCoE**: Fibre Channel transported over IP / Ethernet.
- **Automated storage tiering**: moves hot data to SSDs, cold data to cheaper tiers.
- **Object-based storage**: data as objects (with metadata + global ID) rather than blocks — ideal for unstructured, scalable data.

## Disk Access Time Components

Reading one block involves:
1. **Seek time**: arm moves to the target cylinder (dominant for random access).
2. **Rotational delay (latency)**: platter rotates until the sector is under the head (avg = half a rotation).
3. **Transfer time**: block is read/written at the disk's data rate.

Total access time $\approx$ seek + rotational + transfer. **Sequential access** amortizes seek/rotation over many blocks; **random access** pays full cost per block. This is why clustering related records and using indexes (to convert random into sequential-ish access) matters.

### Access-time comparison table
| Organization | Typical access | When best |
|---|---|---|
| Heap (sequential scan) | $b$ block reads | full scans, appends |
| Ordered (binary search) | $\log_2 b$ + range | sorted range queries |
| Hash (equality) | ~1–2 block reads | point lookups |
| B+-tree index | $\log$ levels + leaf | equality + range |

## Record Format Considerations

- **Fixed-length records**: easy to compute offset = slot × length; fast random access.
- **Variable-length records**: need a **length field** or delimiter; an **offset directory** at the start of each block maps field positions. Reclaiming deleted space may use free-space lists or periodic reorganization.
- **Spanned records** require a **pointer** at the end of the first fragment to the continuation block; reading a spanned record may touch multiple blocks (worst case one per fragment).

## File Header (Descriptor) Contents

A file header stores: file name, record format/length, blocking factor, **disk addresses** of the first/last blocks (and index blocks if indexed), free-space information, and the number of current records. The OS/DBMS reads the header before any I/O to locate data.

## Chapter Summary

- Storage hierarchy: primary (volatile) → secondary (disk/SSD, persistent) → tertiary (tape). Disk access is the dominant cost; organize to minimize block reads.
- Disk = tracks/cylinders/sectors/blocks; controller (SCSI/SATA/SAS); buffering (double buffer, LRU/clock/FIFO, pin/dirty).
- Records: variable-length; spanned/unspanned; blocking factor. File block allocation: contiguous/linked/indexed.
- File organizations: heap (insert-fast, search-linear), ordered (binary search, range-friendly), hashed (O(1) equality). Hashing: internal (open addressing/chaining) and external (buckets, static/dynamic/extendible/linear).
- RAID 0–6: striping + mirroring/parity for speed and reliability. Modern: SAN/NAS, iSCSI, tiering, object storage.
