# Introduction to Databases and Database Users

## Basic Definitions

- **Data**: Known facts that can be recorded and have an implicit meaning.
- **Database (DB)**: A collection of *related* data. The "relatedness" is what distinguishes a database from a mere file of facts — the data is integrated and describes a coherent mini-world.
- **Database Management System (DBMS)**: A software package / system to facilitate the creation and maintenance of a computerized database.
- **Database System**: The DBMS software together with the data itself. Sometimes the application programs are also included.
- **Mini-world** (also called *universe of discourse*): The part of the real world about which data is stored in the database. Example: student grades and transcripts at a university. The database must be a faithful model of this mini-world.
- **Metadata**: Data that describes the structure, types, and constraints of other data. Stored in the DBMS **catalog** (also called the *data dictionary* / *system catalog*).
- **Program-object persistence**: The property that program objects survive beyond program termination (e.g., stored in an OODBMS).

> Key distinction: *data* is raw facts; a *database* is organized, related data; a *DBMS* is the software that manages it.

## Types of Databases and Database Applications

### Traditional applications
- Numeric and textual databases.
- Domains: banking, insurance, retail, transportation, healthcare, manufacturing.
- Service industries: financial, real-estate, legal, e-commerce, small businesses.
- Education: content resources and delivery.

### More recent applications
- **Multimedia databases** (image, audio, video).
- **Geographic Information Systems (GIS)** and location-based services.
- **Biological and genome databases**.
- **Data warehouses** and **data mining** (Ch. 28–29).
- **Mobile databases** (data on smart devices, often partially replicated/disconnected).
- **Real-time and active databases** (respond to events automatically).
- **Social networks** (Facebook, Twitter / X, LinkedIn) — posts, tweets, photos, videos, and the communication graph among people.
- **Search engines** (Google, Bing, Yahoo) — their own repositories of web pages.

### Recent developments (Big Data / NOSQL / Cloud)
- **Big Data** storage systems on large clusters of distributed computers (Ch. 25).
- **NOSQL ("Not Only SQL")** systems (Ch. 24) for rapid search, huge social graphs, and flexible/unstructured data models.
- **Cloud storage**: data resides in huge data centers using thousands of machines (e.g., AWS, Azure, GCP).
- **Hadoop** (originated at Yahoo), **MapReduce** (Google), **Google File System (GFS)**, and **Apache Spark** as Big Data technologies.

> The first part of the book (Ch. 1–8, 14, 16–20) focuses on *traditional* relational databases; recent applications appear later (Ch. 24–29).

## Impact of Database Technology

Databases underpin nearly every sector:
- **Businesses**: banking, insurance, retail, transportation, healthcare, manufacturing.
- **Service industries**: finance, real estate, legal, e-commerce.
- **Education**: content and delivery platforms.
- **Science/medicine/genetics**: personalized and research applications.
- **Personalized apps**: driven by smart mobile devices.

## Simplified Database System Environment

A DBMS sits between the **hardware/storage** and the **users/applications**:

```
[ End Users / Application Programs ]
            |
     [ DBMS (query processor,
       storage manager, catalog) ]
            |
   [ Operating System / File System ]
            |
      [ Secondary Storage (disk/SSD) ]
```

Applications interact with a database by generating:
- **Queries**: read/access parts of the data and formulate a result.
- **Transactions**: read some data and *update* values or generate new data to be stored.

## Typical DBMS Functionality

1. **Define** a database: specify data types, structures, and constraints (via DDL).
2. **Construct / Load**: build the initial database and load its contents onto secondary storage.
3. **Manipulate** the database:
   - *Retrieval*: querying and generating reports.
   - *Modification*: insertions, deletions, updates.
4. **Access via Web applications**.
5. **Process and share** among concurrent users and programs while keeping all data valid and consistent.

### Additional DBMS functionality
- **Protection / security** measures to prevent unauthorized access.
- **Active processing**: internal actions triggered automatically on data (via rules/triggers).
- **Presentation and visualization** of data.
- **Maintenance** of the database and its programs over their lifetime (database, software, and system maintenance).

## Example of a Database: UNIVERSITY

A classic mini-world used throughout the book.

### Entities (objects of interest)
- **STUDENT**
- **COURSE**
- **SECTION** (a specific offering / instance of a course)
- **DEPARTMENT** (academic)
- **INSTRUCTOR**

### Relationships among them
- A SECTION is **of** a specific COURSE.
- A STUDENT **takes** SECTIONs.
- A COURSE can have **prerequisite** COURSEs.
- An INSTRUCTOR **teaches** SECTIONs.
- A COURSE is **offered by** a DEPARTMENT.
- A STUDENT **majors in** a DEPARTMENT.

These entities and relationships are expressed in a **conceptual data model**, most commonly the **Entity-Relationship (ER) model** (Ch. 3–4). The conceptual model is then mapped to the relational model (tables).

```
STUDENT ──< takes >── SECTION ──< of >── COURSE
   |                      ^                    |
 majors in            taught by            offered by / has prerequisite
   |                  INSTRUCTOR            DEPARTMENT
DEPARTMENT ───────────────────────────────────────
```

## Main Characteristics of the Database Approach

### Self-describing nature
- The DBMS **catalog** stores the description (schema) of a particular database — its data structures, types, and constraints. This description is the **metadata**.
- Because the DBMS reads the catalog, the same software can work with many different database applications.
- *Note*: Some NOSQL systems need no separate metadata; they embed the schema within the data structure itself.

### Insulation between programs and data (program-data independence)
- **Program-data independence**: applications are insulated from how data is physically stored; changing storage structures or organizations does not require rewriting access programs.
- **Program-operation independence**: adding new operations does not require rewriting existing ones (provided by the data model layer).

### Data abstraction
- A **data model** hides storage details and presents users with a *conceptual view* of the database.
- Programs refer to data-model constructs (e.g., "table", "row") rather than to byte layouts on disk.

### Support of multiple views
- Each user may see a different **view** — a subset/superset presentation of the database describing only the data of interest to that user.

### Sharing of data and multi-user transaction processing
- Concurrent users can retrieve from and update the database.
- **Concurrency control** guarantees each transaction executes correctly or is aborted.
- **Recovery subsystem** ensures every completed transaction's effect is permanently recorded.
- **OLTP (Online Transaction Processing)**: high-throughput workloads, often hundreds of concurrent transactions per second.

## Database Users

Users are divided into **Actors on the Scene** (use/control content, design/develop applications) and **Workers Behind the Scene** (build the DBMS and operate the system).

### Actors on the scene

- **Database Administrators (DBA)**:
  - Authorize access to the database.
  - Coordinate and monitor usage.
  - Acquire software/hardware resources.
  - Monitor operational efficiency.
  - The only ones normally using privileged DBA commands.

- **Database Designers**:
  - Define content, structure, constraints, and functions/transactions.
  - Communicate with end-users to understand needs.

- **End-users** (categories):
  - **Casual**: access occasionally when needed.
  - **Naïve / Parametric** (the largest group): use well-defined "canned transactions" — e.g., bank tellers, reservation clerks, mobile-app users, social-media users.
  - **Sophisticated**: business analysts, scientists, engineers who use tools/packages closely coupled to the database.
  - **Stand-alone**: maintain personal databases with ready-to-use packages (e.g., a tax program, a personal photo/video database).

- **System Analysts and Application Developers**:
  - *System Analysts* translate user requirements into application/canned-transaction designs.
  - *Application Programmers* implement and test those specifications.
  - *Business Analysts* analyze large volumes of business/real-time ("Big") data for decisions on planning, advertising, marketing.

### Workers behind the scene

- **System Designers and Implementors**: design/implement DBMS modules, interfaces; test/debug; interface with OS, language compilers, applications.
- **Tool Developers**: build tools for modeling, design, performance monitoring, prototyping, test-data generation, UI creation, simulation.
- **Operators and Maintenance Personnel**: run and maintain the hardware/software environment.

## Advantages of the Database Approach

- **Controlling redundancy** in data storage *and* in development/maintenance effort.
- **Sharing data** among multiple users.
- **Restricting unauthorized access** (only DBA staff uses privileged facilities).
- **Persistent storage** for program objects (OODBMSs — Ch. 12).
- **Storage structures (indexes)** for efficient query processing (Ch. 17).
- **Query optimization** for efficient processing.
- **Backup and recovery** services.
- **Multiple user interfaces** for different user classes.
- **Representing complex relationships** among data.
- **Enforcing integrity constraints**.
- **Drawing inferences / actions** via deductive and active rules and triggers.

### Additional implications
- **Enforcing standards**: data names, display formats, report structures, metadata, web layouts — crucial for large organizations.
- **Reduced application development time**: incremental cost to add each new application drops.
- **Flexibility** to change data structures as requirements evolve.
- **Availability of current information**: vital for online reservation/shopping systems.
- **Economies of scale**: consolidate data/applications across departments, avoiding wasteful overlap.

## Historical Development of Database Technology

| Era | Model / Technology | Notes |
|---|---|---|
| Mid-1960s | Hierarchical & Network models | Dominated the 1970s; IBM's IMS (hierarchical) still processes huge volumes. |
| 1970 | Relational model proposed (Codd) | Heavily researched at IBM and universities. |
| Early 1980s | Relational DBMS products | Became the mainstream commercial technology. |
| Late 1980s–90s | Object-Oriented (OODBMS) | For complex CAD data; limited commercial takeoff. |
| 1990s+ | Object-Relational (ORDBMS) | RDBMSs absorbed OO concepts; extended types (multimedia, XML). |
| 1990s+ | Web & E-commerce | HTML pages with links; XML; PHP/JavaScript for dynamic DB-driven pages. |
| 2000s+ | Big Data & NOSQL | Hadoop, MapReduce, Spark; social media; cloud storage. |

## Extending Database Capabilities

New functionality added to modern DBMSs:
- Scientific applications (physics, chemistry, biology/genetics, earth/atmospheric sciences, astronomy).
- **XML** (eXtensible Markup Language).
- Image, audio, and video management.
- **Data warehousing and data mining** (Ch. 28–29) — a major growth area.
- Spatial data management and location-based services.
- Time-series and historical data management.
- 21st-century growth: user-generated and automatically collected data (social media → millions of transactions/day), cloud backup/storage.

## When NOT to Use a DBMS

### Main inhibitors (costs)
- High initial investment and possible need for extra hardware.
- Overhead for generality, security, concurrency control, recovery, and integrity.

### When a DBMS may be unnecessary
- The database and applications are **simple, well defined, and not expected to change**.
- **No multi-user access** is required.

### When a DBMS may be infeasible
- **Embedded systems** where a general-purpose DBMS will not fit in available storage.

### When no DBMS may suffice
- **Stringent real-time requirements** not met because of DBMS overhead (e.g., telephone switching).
- **Modeling limitations** for extremely complex data (e.g., complex genome/protein databases).
- Need for **special operations** unsupported by the DBMS (e.g., advanced GIS / location-based services).

## Key Terms

- **Transaction**: A unit of work that may read and update data; must execute completely or not at all (atomic).
- **OLTP**: Online Transaction Processing — high-throughput concurrent transactions.
- **Query**: A read request that accesses data and formulates a result.
- **Metadata / Catalog**: The self-describing schema stored by the DBMS.
- **Data model**: The abstraction used to hide storage details (relational, ER, network, hierarchical, object-oriented, object-relational).

## Chapter Summary

- A database is *related* data; a DBMS is the software that creates/maintains it; the database system = DBMS + data (+ applications).
- The database approach offers self-description, program-data independence, abstraction, multiple views, and concurrent transaction processing.
- Users range from DBA and designers (actors on the scene) to implementors and operators (behind the scene).
- Advantages include reduced redundancy, sharing, security, persistence, indexing, optimization, recovery, and integrity enforcement.
- DBMSs are not always appropriate — especially for simple, single-user, embedded, or hard real-time scenarios.
