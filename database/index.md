# Database Management Systems (CS1555)

Study notes based on Elmasri & Navathe lecture slides (Ch.1-3, 5-8, 14, 16-20). Exam-oriented knowledge points covering database concepts, modeling, SQL, relational theory, normalization, storage, indexing, query processing, and transactions.

## Chapters

- [**Chapter 1: Introduction to Databases and Database Users**](./introduction) — Data/DB/DBMS definitions, functionality, characteristics, users, when not to use a DBMS
- [**Chapter 2: Database System Concepts and Architecture**](./database-architecture) — Data models, schemas vs instances, three-schema architecture, data independence, DDL/DML, client-server
- [**Chapter 3: Entity-Relationship Model**](./entity-relationship) — Entities, attributes, relationships, cardinality, weak entities, ER notation, COMPANY example
- [**Chapter 5: Relational Data Model and Constraints**](./relational-model) — Relation/table terms, keys, entity & referential integrity, update violations
- [**Chapter 6: Basic SQL**](./sql) — CREATE TABLE, constraints, SELECT-FROM-WHERE, joins, INSERT/DELETE/UPDATE, set operations
- [**Chapter 7: More SQL**](./advanced-sql) — Nested/EXISTS queries, outer joins, aggregates, grouping, triggers, views, schema modification
- [**Chapter 8: Relational Algebra and Calculus**](./relational-algebra) — SELECT/PROJECT/JOIN/DIVISION, tuple & domain calculus, query trees
- [**Chapter 14: Functional Dependencies and Normalization**](./normalization) — FDs, 1NF/2NF/3NF, BCNF, 4NF/5NF, lossless decomposition
- [**Chapter 16: Disk Storage, File Structures, Hashing**](./storage) — Storage hierarchy, disk/SSD, file organizations, hashing, RAID, modern storage
- [**Chapter 17: Indexing Structures and Physical Design**](./indexing) — Primary/clustering/secondary indexes, B+/B-trees, bitmap, hash, physical design
- [**Chapter 18: Query Processing**](./query-processing) — Query blocks, SELECT/JOIN algorithms, sort-merge, hash join, pipelining, parallelism
- [**Chapter 19: Query Optimization**](./query-optimization) — Heuristics, cost functions, selectivity, join ordering, materialized vs pipelined
- [**Chapter 20: Transaction Processing**](./transactions) — ACID, concurrency problems, schedules, serializability, isolation levels, SQL support
