# Data Modeling Using the Entity-Relationship (ER) Model

## Overview of the Database Design Process

Two main activities:
- **Database design** — including *conceptual* database design (this chapter's focus: the conceptual schema).
- **Applications design** — programs and interfaces that access the database (generally a software-engineering concern).

Conceptual design uses **ER diagrams** (this chapter) and **EER diagrams** (Ch. 4). Industry often documents designs with **UML class diagrams**. Design tools (ERwin, ER Studio, Rational Rose, Visio, etc.) help model and map to relational schemas.

## ER Model Concepts

### Entities and Attributes
- **Entity**: A specific "thing" or object in the mini-world represented in the DB. Example: the EMPLOYEE *John Smith*, the Research DEPARTMENT, the ProductX PROJECT.
- **Attribute**: A property describing an entity. Example: an EMPLOYEE has `Name`, `SSN`, `Address`, `Sex`, `BirthDate`.
- A specific entity has a **value** for each attribute, drawn from a **value set (domain)** (integer, string, date, enumerated, etc.).

### Types of Attributes
- **Simple (atomic)**: single value, not divisible — e.g., `SSN`, `Sex`.
- **Composite**: composed of components — e.g., `Address(Apt#, House#, Street, City, State, ZipCode, Country)`, `Name(FirstName, MiddleName, LastName)`. Components may themselves be composite (hierarchy).
- **Multi-valued**: an entity may have *multiple* values — e.g., `Color` of a CAR, `PreviousDegrees` of a STUDENT. Denoted `{Color}`.
  - Composite + multi-valued: `{PreviousDegrees(College, Year, Degree, Field)}` — multiple values, each with four subcomponents.
- Composite and multi-valued attributes may be nested arbitrarily (rare in practice).

### Entity Types, Entity Sets, and Key Attributes
- **Entity type**: A grouping of entities with the same attributes — e.g., `EMPLOYEE`, `PROJECT`.
- **Entity set** (collection): the current set of entity instances stored in the DB (the "state" of that type). Same name often used for both type and set.
- **Key attribute**: an attribute whose value is *unique* for each entity of the type — e.g., `SSN` of EMPLOYEE.
  - A key may be **composite**: `VehicleTagNumber(Number, State)` for CAR.
  - An entity type may have **more than one key** — e.g., CAR has `VIN` and `VehicleTagNumber`. In ER notation *every* key is underlined (unlike relational schema where only the primary key is underlined).
- **Value set / domain**: the set of legal values for an attribute, similar to a programming-language type (integer, char(n), real, bit).
  - Formally, attribute $A$ of entity type $E$ with value set $V$ is a function $A: E \to \mathcal{P}(V)$, where $\mathcal{P}(V)$ is the power set of $V$ (this captures multi-valued attributes too). $A(e)$ is the value of $A$ for entity $e$.

## ER Diagram Notation

| Concept | Notation |
|---|---|
| Entity type | Rectangle |
| Attribute | Oval, connected to its entity |
| Composite attribute | Components connected to the composite oval |
| Key attribute | **Underlined** oval |
| Multi-valued attribute | **Double** oval |
| Relationship type | **Diamond**, connected by straight lines to participating entities |
| Weak entity type | **Double** rectangle |
| Identifying relationship | **Double** diamond |
| Total (mandatory) participation | **Double** line from entity to relationship |
| Partial (optional) participation | Single line |
| Cardinality on binary edge | `1`, `N`, `M` on the edge |

## Initial Design: COMPANY Entity Types

From requirements, identify four entity types:

- **DEPARTMENT**: `Name`, `Number`, `Locations` (multi-valued), `Manager` (refined later into MANAGES), `ManagerStartDate`.
- **PROJECT**: `Name`, `Number`, `Location`, `ControllingDepartment` (refined into CONTROLS).
- **EMPLOYEE**: `SSN` (key), `Name` (composite: Fname, Minit, Lname), `Sex`, `Address`, `Salary`, `BirthDate`, `Department` (refined into WORKS_FOR), `Supervisor` (refined into SUPERVISION), `Projects` (refined into WORKS_ON).
- **DEPENDENT**: `Name` (partial key), `Sex`, `BirthDate`, `Relationship` (to employee).

The initial design is *incomplete* — several attributes become relationships during refinement.

## Relationships and Relationship Types

- A **relationship** relates two or more distinct entities with a specific meaning (e.g., EMPLOYEE John Smith *works on* ProductX PROJECT).
- **Relationship type**: the schema description — name + participating entity types + constraints. Example: `WORKS_ON` (EMPLOYEE, PROJECT).
- **Relationship set**: the current instances stored (the state of the type).
- **Degree** of a relationship type = number of participating entity types. Binary = degree 2; ternary = degree 3; n-ary = degree n.

### COMPANY relationship types (all binary)
- `WORKS_FOR` (EMPLOYEE, DEPARTMENT)
- `MANAGES` (EMPLOYEE, DEPARTMENT)
- `CONTROLS` (DEPARTMENT, PROJECT)
- `WORKS_ON` (EMPLOYEE, PROJECT)
- `SUPERVISION` (EMPLOYEE as subordinate, EMPLOYEE as supervisor) — *recursive*
- `DEPENDENTS_OF` (EMPLOYEE, DEPENDENT)

> More than one relationship type can exist between the same pair of entity types: `MANAGES` and `WORKS_FOR` both connect EMPLOYEE and DEPARTMENT but mean different things.

## Constraints on Relationship Types

### Cardinality Ratio (maximum participation)
- **1:1** — one entity on each side.
- **1:N** (one-to-many) or **N:1** (many-to-one).
- **M:N** (many-to-many).

### Participation (Existence Dependency) — minimum participation
- **Partial (optional)**: min = 0; entity need not participate.
- **Total (mandatory)**: min ≥ 1; existence-dependent on the relationship. Shown by a **double line**.

### (min, max) notation
Specified on each participation of entity type $E$ in relationship $R$: each entity $e \in E$ participates in **at least min** and **at most max** instances of $R$.
- Default: `(0, n)` — min = 0, max = n (no limit). Must have $0 \le \text{min} \le \text{max}$, $\text{max} \ge 1$.
- Read the pair next to the entity, looking *away* from the entity.

COMPANY examples:
- `MANAGES`: DEPARTMENT `(1,1)` (every dept has exactly one manager), EMPLOYEE `(0,1)` (an employee manages at most one dept).
- `WORKS_FOR`: EMPLOYEE `(1,1)` (works for exactly one dept), DEPARTMENT `(0,n)` (a dept can have any number of employees).

### Relationship Attributes
A relationship type can carry its own attributes. Example: `HoursPerWeek` on `WORKS_ON` — its value depends on the specific (employee, project) pair.
- Most relationship attributes appear with **M:N** relationships.
- In a **1:N** relationship, such an attribute can usually be *transferred to the entity on the N-side*.

## Recursive (Self-Referencing) Relationships

When the same entity type participates in two distinct **roles**:
- Example: `SUPERVISION` between EMPLOYEE (*supervisor/boss* role) and EMPLOYEE (*subordinate/worker* role).
- Role names must be displayed to distinguish the two participations (labeled e.g. `1` and `2`).

## Weak Entity Types

- A **weak entity** has *no key attribute* of its own and is **identification-dependent** on another (owner/identifying) entity type.
- It must participate in an **identifying relationship** with its owner.
- Identified by the combination of:
  1. its **partial key** (discriminator), and
  2. the particular owner entity it relates to.
- Example: `DEPENDENT` is identified by `Name` (partial key) + the specific `EMPLOYEE` via `DEPENDENTS_OF`. DEPENDENT is a weak entity; EMPLOYEE is its identifying entity type.
- Notation: weak entity = **double rectangle**; identifying relationship = **double diamond**.

## Higher-Degree (n-ary) Relationships

- Binary = degree 2; ternary = degree 3; n-ary = degree n.
- An **n-ary relationship is NOT equivalent to n binary relationships** — they convey different information.
- Constraints are harder to specify for $n > 2$.
- Displaying `1`, `M`, or `N` on edges:
  - `M`/`N` = no constraint.
  - `1` = an entity can participate in at most one instance with a given combination of the *other* participating entities.
  - Both `(min,max)` and `1/M/N` may be needed for a full description; higher-degree constraints can be ambiguous.
- A ternary relationship may sometimes be represented as a **weak entity** if it has multiple identifying relationships (multiple owner types).
- A binary relationship is **redundant** only if it can *always* be derived from a higher-degree relationship (e.g., `TAUGHT_DURING` derivable from ternary `OFFERS`).

## Alternative Notations

### UML Class Diagrams
- Classes (≈ entity types) = large rounded box with three sections: name / attributes / operations (operations not in basic ER).
- Relationships = "associations" drawn as connecting lines.
- Used in both database and O-O software design; terminology differs from ER.

### Other notations
ERwin, S-Designer, ER-Studio, IDEF1X, etc. (Appendix A in the text). Tools generally:
- **Positives**: good documentation of requirements, graphical UI.
- **Negatives**: often lack distinct notation for relationship attributes; tend to show relational designs rather than pure conceptual ER.

## Worked Example (COMPANY) — Summary ER Sketch

```
        DEPARTMENT ──< CONTROLS >── PROJECT
            |  (1,1) MANAGES (0,1)        |
            |                              |
         EMPLOYEE ──< WORKS_ON(Hours) >────┘
            |  (1,1) WORKS_FOR (0,n)
            |                              EMPLOYEE ──< SUPERVISION >── EMPLOYEE
        (0,n) DEPENDENTS_OF (1,1)
            |
         DEPENDENT (weak, partial key = Name)
```

Key points for the exam:
- Strong vs weak entities; partial key + owner.
- Cardinality ratios (1:1, 1:N, M:N) vs participation (total/partial).
- Recursive relationships need role names.
- Multi-valued attributes use double ovals; composite attributes nest.
- n-ary ≠ multiple binaries.

## Chapter Summary

- ER models entities (with attributes), relationships (with constraints), and their sets/states.
- Attributes: simple, composite, multi-valued, key (single or multiple, possibly composite).
- Relationship types have a degree and constraints: cardinality ratio (max) and participation (min/total).
- Weak entities depend on an owner and are identified by a partial key + owner.
- Recursive relationships use role names; n-ary relationships are not reducible to binaries.
- The COMPANY schema illustrates all these concepts; EER (Ch. 4) extends ER with specialization/generalization.
