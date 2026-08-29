# The Relational Data Model and Relational Database Constraints

## Relational Model Concepts

- The relational model is based on the mathematical concept of a **relation**.
- Proposed by **E.F. Codd** (IBM Research) in 1970 — *"A Relational Model for Large Shared Data Banks," CACM, June 1970* — which earned him the ACM Turing Award.
- Its strength comes from the formal foundation of relation theory. The *formal* model is reviewed here; the *practical* SQL-based model is in Ch. 6–7 (they differ in several ways, e.g., SQL allows duplicate rows and ordered columns).

### Informal definitions
- A **relation** looks like a table of values.
- Each **row** represents facts about a real-world entity or relationship.
- Each **column header** gives the meaning of the values in that column.

| Informal term | Formal term |
|---|---|
| Table | Relation |
| Column header | Attribute |
| All possible column values | Domain |
| Row | Tuple |
| Table definition | Schema of a relation |
| Populated table | State of the relation |

### Formal definitions
- **Schema** of a relation: $R(A_1, A_2, \dots, A_n)$. $R$ is the name; $A_i$ are attributes.
  - Example: `CUSTOMER(Cust-id, Cust-name, Address, Phone#)`.
- **Domain**: the set of valid values for an attribute (with a logical definition and a data type/format). The *attribute name* designates the **role** a domain plays — e.g., the domain `Date` may define both `Invoice-date` and `Payment-date` with different meanings.
- **Tuple**: an ordered set of values, written `<v1, v2, …, vn>` (or `{<name,"John">, <SSN,123456789>}` in a self-describing form). A row in CUSTOMER is a 4-tuple.
- **Relation state** $r(R)$: a **set** of tuples (a subset of the Cartesian product of the domains):
  - $r(R) \subseteq \text{dom}(A_1) \times \text{dom}(A_2) \times \dots \times \text{dom}(A_n)$
  - $r(R) = \{t_1, t_2, \dots, t_m\}$, each $t_i = <v_1,\dots,v_n>$ with $v_j \in \text{dom}(A_j)$.

**Example**: Let $\text{dom}(A_1)=\{0,1\}$, $\text{dom}(A_2)=\{a,b,c\}$.
$\text{dom}(A_1)\times\text{dom}(A_2) = \{<0,a>,<0,b>,<0,c>,<1,a>,<1,b>,<1,c>\}$. A valid state is any subset, e.g. $\{<0,a>,<0,b>,<1,c>\}$.

### Characteristics of relations
- **Tuples are unordered** (a set). The same state can be displayed in any row order.
- **Attributes** $A_1,\dots,A_n$ are considered ordered in the basic definition (a more general definition avoids ordering by pairing name+value).
- **Values are atomic (indivisible)** — no lists/multivalued values allowed (this is an *inherent* constraint of the model; contrast with ER multi-valued attributes, which must be flattened when mapped).
- Each value must come from the domain of its attribute, or be **NULL** (unknown / not available / not applicable).
- Notation: component value $t[A_i]$ (or $t.A_i$); subtuple $t[A_u, A_v, \dots]$.

## Relational Model Constraints

Constraints restrict which values/states are permissible. Three classes:
1. **Inherent/implicit** — follow from the data model itself (e.g., no list-valued attributes).
2. **Schema-based/explicit** — expressed in the schema using model facilities (key, integrity constraints).
3. **Application/semantic** — beyond the model's expressive power; enforced by application code or, in modern SQL, by triggers/assertions.

The relational model's explicit constraints:
- **Domain constraints**
- **Key constraints**
- **Entity integrity constraints**
- **Referential integrity constraints**

## Key Constraints

### Superkey
A set of attributes $SK$ such that **no two tuples** in any valid state have the same value for $SK$:
$\forall t_1 \neq t_2 \in r(R): t_1[SK] \neq t_2[SK]$.

### Key (Candidate key)
A **minimal** superkey — removing any attribute from it destroys the uniqueness property. Every key is a superkey, but not vice versa. Any superset of a key is a superkey but not a key.

**Example** `CAR(State, Reg#, SerialNo, Make, Model, Year)`:
- Key1 = `{State, Reg#}`, Key2 = `{SerialNo}` — both are keys (and superkeys).
- `{SerialNo, Make}` is a superkey but **not** a key.

### Primary key
- If several candidate keys exist, one is chosen arbitrarily as the **primary key** (its attributes are **underlined**).
- Used to identify each tuple and to reference it from other relations.
- Rule of thumb: choose the **smallest** candidate key; sometimes subjective.

## Relational Database Schema and State

- **Relational database schema** $S = \{R_1, R_2, \dots, R_n\} \cup IC$, where $R_i$ are relation schemas and $IC$ is the set of integrity constraints.
- **Relational database state** $DB = \{r_1, \dots, r_m\}$ where each $r_i$ is a state of $R_i$ satisfying $IC$. Called a *snapshot / instance*. A state violating constraints is **invalid**.

### COMPANY relational schema (example)
```
EMPLOYEE(Ssn, Fname, Minit, Lname, Bdate, Address, Sex, Salary, Super_ssn, Dno)
DEPARTMENT(Dnumber, Dname, Mgr_ssn, Mgr_start_date)
PROJECT(Pnumber, Pname, Plocation, Dnum)
WORKS_ON(Essn, Pno, Hours)
DEPT_LOCATIONS(Dnumber, Dlocation)
DEPENDENT(Essn, Dependent_name, Sex, Bdate, Relationship)
```

## Entity Integrity

- The **primary key** attributes $PK$ of each relation cannot be NULL in any tuple:
  $t[PK] \neq \text{null}$ for all $t \in r(R)$.
- Reason: PK values identify individual tuples; NULL would make identification impossible.
- If $PK$ is composite, NULL is disallowed in *any* component.
- Other attributes may also be declared NOT NULL even if not part of the PK.

## Referential Integrity

- A constraint involving **two relations**: a **referencing** relation $R_1$ and a **referenced** relation $R_2$.
- $R_1$ has **foreign key (FK)** attributes that reference the **primary key (PK)** of $R_2$.
- Tuple $t_1 \in R_1$ **references** $t_2 \in R_2$ if $t_1[FK] = t_2[PK]$.
- Displayed as a directed arc from $R_1.FK$ to $R_2.PK$ in a schema diagram.

**Constraint statement**: the value in FK of $R_1$ must be either:
1. an existing PK value in $R_2$, **or**
2. **NULL** — but only if FK is **not** part of $R_1$'s own primary key.

### COMPANY referential integrity arcs
- `EMPLOYEE.Super_ssn → EMPLOYEE.Ssn` (recursive).
- `EMPLOYEE.Dno → DEPARTMENT.Dnumber`.
- `DEPARTMENT.Mgr_ssn → EMPLOYEE.Ssn`.
- `PROJECT.Dnum → DEPARTMENT.Dnumber`.
- `WORKS_ON.Essn → EMPLOYEE.Ssn`, `WORKS_ON.Pno → PROJECT.Pnumber`.
- `DEPT_LOCATIONS.Dnumber → DEPARTMENT.Dnumber`.
- `DEPENDENT.Essn → EMPLOYEE.Ssn`.

### Semantic (application) constraints
Cannot be expressed by keys/integrity alone, e.g., "max 56 hours/week per employee across all projects." SQL-99 provides `CREATE ASSERTION` and `CREATE TRIGGER` for these; keys, candidate keys (`UNIQUE`), NOT NULL, and foreign keys are expressed in `CREATE TABLE`.

## Update Operations and Constraint Violations

Basic operations: **INSERT** a tuple, **DELETE** a tuple, **MODIFY** an attribute. Integrity constraints must not be violated. Updates may propagate (cascade) to maintain integrity.

### INSERT violations
- **Domain**: a value not in the attribute's domain.
- **Key**: a key value already present (duplicate).
- **Referential integrity**: an FK references a non-existent PK.
- **Entity integrity**: PK is NULL.

### DELETE violations
- Only **referential integrity** can be violated: the deleted PK may be referenced by other tuples.
- Remedies (must be chosen at design time per FK):
  - **RESTRICT/REJECT**: refuse the deletion.
  - **CASCADE**: propagate — delete (or update) the referencing tuples too.
  - **SET NULL**: set the referencing FK values to NULL.

### UPDATE violations
- **Domain / NOT NULL**: if the modified attribute violates its domain.
- **Updating PK**: like DELETE + INSERT → same options as DELETE apply.
- **Updating FK**: may violate referential integrity.
- **Updating an ordinary attribute**: can only violate domain constraints.

### Response to a violation
1. Cancel the operation (RESTRICT/REJECT).
2. Perform it but warn the user.
3. Trigger additional updates to fix it (CASCADE, SET NULL).
4. Execute a user-specified error-correction routine.

## In-Class Exercise (worked sketch)

Given:
```
STUDENT(SSN, Name, Major, Bdate)
COURSE(Course#, Cname, Dept)
ENROLL(SSN, Course#, Quarter, Grade)
BOOK_ADOPTION(Course#, Quarter, Book_ISBN)
TEXT(Book_ISBN, Book_Title, Publisher, Author)
```
Foreign keys:
- `ENROLL.SSN → STUDENT.SSN`
- `ENROLL.Course# → COURSE.Course#`
- `BOOK_ADOPTION.Course# → COURSE.Course#`
- `BOOK_ADOPTION.Book_ISBN → TEXT.Book_ISBN`
- (`ENROLL`, `BOOK_ADOPTION` share `(Course#, Quarter)` but are separate relations; a composite FK on `(Course#, Quarter)` would require a matching key in `COURSE` or a combined enrollment table depending on design.)

## Chapter Summary

- A relation is a set of tuples over attributes with domains; tuples are unordered, values atomic.
- Key constraints: superkey ⊇ key ⊇ primary key; PK is a minimal unique identifier.
- Entity integrity: PK cannot be NULL. Referential integrity: FK → existing PK (or NULL if not part of PK).
- Update operations can violate constraints; DELETE/UPDATE on a PK use RESTRICT, CASCADE, or SET NULL.
- Semantic constraints beyond the model need triggers/assertions.
