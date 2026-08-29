# Database System Concepts and Architecture

## Data Models and Their Categories

A **data model** is a set of concepts to describe:
1. The **structure** of a database (constructs: elements, their data types, groups such as entity/record/table, and relationships among groups).
2. The **operations** for manipulating these structures.
3. The **constraints** the database must obey (enforced at all times).

### Operations
- **Basic model operations**: generic `insert`, `delete`, `update`.
- **User-defined operations**: application-specific procedures, e.g. `compute_student_gpa`, `update_inventory`.

### Categories of data models

| Category | Purpose | Examples |
|---|---|---|
| **Conceptual (high-level / semantic)** | Concepts close to how users perceive data; entity/object-based. | ER model, ORM. |
| **Physical (low-level / internal)** | Describe how data is stored on disk; access paths. | Specified ad-hoc via DBMS manuals; storage records. |
| **Implementation (representational)** | Between the above two; used by commercial DBMSs. | Relational model, network, hierarchical. |
| **Self-describing** | Combine schema (description) with the data values. | XML, key-value stores, some NOSQL. |

## Schemas, Instances, and States

- **Database Schema**: The *description* of a database — its structure, data types, and constraints.
- **Schema Diagram**: An illustrative display of (most aspects of) the schema.
- **Schema Construct**: A component of the schema (e.g., the `STUDENT` entity, the `COURSE` table).
- **Database State (Instance / Occurrence / Snapshot)**: The actual data stored at a particular moment in time — the collection of *all* current data. "Instance" also applies to components (record instance, table instance, entity instance).
- **Initial Database State**: The state when the database is first loaded.
- **Valid State**: A state that satisfies the structure *and* all constraints of the schema.

### Distinction: Schema vs. State
- **Schema (intension)**: Changes very infrequently.
- **State (extension)**: Changes every time the database is updated.

```
Schema (intension)  ── changes rarely ──►  STUDENT(Ssn, Name, Major)
State  (extension)  ── changes often  ──►  {('1','Amy','CS'), ('2','Bob','EE')}
```

## Three-Schema Architecture

Proposed to support **program-data independence** and **multiple views**. Not always used explicitly by commercial products, but it explains DBMS organization.

### The three levels

1. **Internal schema** (internal level): describes physical storage structures and access paths (e.g., indexes, file organizations). Typically uses a **physical data model**.
2. **Conceptual schema** (conceptual level): describes the structure and constraints for the *whole* database for a community of users. Uses a conceptual or implementation data model.
3. **External schemas** (external level): the various **user views**. Usually use the same data model as the conceptual schema.

```
        [ External Schema 1 ]   [ External Schema 2 ]   ...   (user views)
                          \         |         /
                           \        |        /
                          [ Conceptual Schema ]            (community view)
                                      |
                                      |
                          [ Internal Schema ]             (physical storage)
```

### Mappings among schema levels
- Requests are transformed between levels.
- Programs refer to an **external schema** and are mapped by the DBMS to the **internal schema** for execution.
- Data extracted at the internal level is reformatted to match the user's external view (e.g., formatting an SQL result for a web page).

## Data Independence

- **Logical Data Independence**: The ability to change the **conceptual** schema *without* changing external schemas / application programs (e.g., adding an attribute to a table, splitting a table — as long as views can still be mapped).
- **Physical Data Independence**: The ability to change the **internal** schema *without* changing the conceptual schema (e.g., reorganizing file structures, creating new indexes to improve performance).

When a lower-level schema changes, **only the mappings** between it and higher-level schemas need editing. Higher-level schemas and application programs are unchanged.

> Physical data independence is easier to achieve than logical data independence, because application programs depend on the logical structure.

## DBMS Languages

- **Data Definition Language (DDL)**: specifies the schema — used by DBA / designers for the conceptual schema, and often for internal/external schemas (views). In some systems separate **SDL** (storage definition) and **VDL** (view definition) exist.
- **Data Manipulation Language (DML)**: specifies retrievals and updates.
  - Can be **embedded** in a host language (COBOL, C, C++, Java) via a library of functions.
  - Can be used **stand-alone** as a query language.

### Types of DML

| Type | Description | Example |
|---|---|---|
| **High-level / non-procedural (declarative)** | Set-oriented; specify *what* to retrieve, not *how*. | SQL. |
| **Low-level / procedural** | Record-at-a-time; needs loops and positioning pointers. | Navigational (network/hierarchical) languages. |

### DBMS Interfaces
- **Stand-alone query language**: e.g., interactive SQL (SQL*Plus in Oracle).
- **Programmer interfaces**: embedding DML in programming languages.
- **User-friendly interfaces**: menu-based, forms-based, graphics-based.
- **Mobile interfaces**: transaction via mobile apps.

### Programming-language interfaces
- **Embedded approach**: Embedded SQL (C/C++), SQLJ (Java).
- **Procedure-call approach**: **JDBC** (Java), **ODBC** (Open Database Connectivity, general API).
- **Database programming language**: e.g., Oracle **PL/SQL** (SQL + procedural constructs as integral parts).
- **Scripting languages**: PHP (server-side), Python.

### User-friendly / other interfaces
- Menu-based (web browsing), forms-based (naïve users), graphics-based (point-and-click, drag-and-drop), natural-language, speech I/O, web browser + keyword search, parametric (bank-teller function keys).
- **DBA interfaces**: create accounts, grant authorizations, set parameters, change schemas/access paths.

## Database System Utilities and Tools

- **Utilities**: loading data from files (with conversion tools), backup to tape, reorganizing file structures, performance monitoring, report generation, sorting, user monitoring, data compression.
- **Data dictionary / repository**: stores schema descriptions plus design decisions, application descriptions, user info, usage standards.
  - **Active** data dictionary: accessed by DBMS software *and* users/DBA.
  - **Passive** data dictionary: accessed by users/DBA only.
- **CASE / application-development environments**: PowerBuilder (Sybase), JBuilder (Borland), JDeveloper (Oracle).
- **Typical DBMS component modules**: query processor, DDL compiler, storage manager, buffer manager, transaction manager, recovery manager, concurrency-control manager, catalog manager.

## Centralized and Client-Server Architectures

### Centralized DBMS
- Everything in a single system: DBMS software, hardware, application programs, UI processing.
- Users may connect via remote terminals, but **all processing** happens at the centralized site.

### Two-tier client-server
- **Clients**: PCs / workstations / diskless machines with client software; connect via LAN/wireless.
- **Specialized servers**: print server, file server, DBMS (SQL/query/transaction) server, web server, email server.
- **DBMS server**: provides query/transaction services; accessed via **ODBC** / **JDBC** APIs. A client may connect to several data sources.

### Three-tier client-server (common for web apps)
- **Client tier**: PC/mobile device with web browser / user interface.
- **Middle tier** (Application / Web Server): holds web connectivity software + business logic; conduit for partially processed data.
- **Database server tier**: only reachable via the middle tier → **enhances security** (clients cannot directly access the DB).

```
[ Browser / Mobile ] ──> [ App/Web Server (business logic) ] ──> [ DB Server ]
```

## Classification of DBMSs

- **By data model**:
  - *Legacy*: Network, Hierarchical.
  - *Currently used*: Relational, Object-oriented, Object-relational.
  - *Recent*: Key-value, NOSQL (document-/column-/graph-/key-value-based), native XML.
- **By users**: Single-user (personal computers) vs. multi-user.
- **By distribution**: Centralized (one computer, one DB) vs. distributed (multiple computers, multiple DBs).
- **Distributed variants**:
  - *Homogeneous DDBMS*: same DBMS everywhere.
  - *Heterogeneous DDBMS*.
  - *Federated / Multidatabase*: loosely coupled, high autonomy.
  - Modern "distributed" systems are essentially client-server with DB servers + clients (not fully distributed).
- **Cost**: free/open-source (MySQL, PostgreSQL) to millions; commercial add-on modules ("cartridges"/"blades") for time-series, spatial, document, XML. Licensing: site, seat (concurrent users), single-user.
- **Other**: by access paths (e.g., fully inverted/keyword-indexed); general-purpose vs. special-purpose (airline/hotel/car reservation OLTP).

## History of Data Models

| Model | Origin | Highlights | Pros / Cons |
|---|---|---|---|
| **Network** | Honeywell 1964–65 (IDS); CODASYL DBTG 1971 | Record + set types; navigational (FIND, GET). | Models complex relationships; optimal navigation — but procedural, pointer-laden, little query optimization. |
| **Hierarchical** | IBM + N. American Rockwell ~1965 → IMS | Tree of records; simple (GET UNIQUE, GET NEXT WITHIN PARENT). | Simple, natural for org charts — but procedural/linear, little optimization. |
| **Relational** | E.F. Codd 1970; first commercial 1981–82 | Tables; SQL (SQL-89/92/99/3…). | Dominant today; declarative, optimizable. |
| **Object-oriented** | 1980s–90s | Persistent O-O languages (C++/Smalltalk); ODMG standard. | Good for complex objects — limited commercial takeoff (Ch. 12). |
| **Object-relational** | Informix Universal Server onward | RDBMS + OO concepts; XML/text types. | Trend adopted by Oracle/DB2/SQL Server. |

## Chapter Summary

- A data model defines structure + operations + constraints; categories are conceptual, physical, implementation, and self-describing.
- Schema (intension) = description; state (extension) = data at a time; valid states obey constraints.
- The three-schema architecture (external/conceptual/internal) enables data independence via mappings.
- Logical data independence = change conceptual without touching external; physical = change internal without touching conceptual.
- DBMS languages: DDL (schema) and DML (retrieval/update), declarative (SQL) vs procedural (navigational).
- Architectures range from centralized to two-tier and three-tier client-server; DBMSs classify by data model, users, distribution, and cost.
