# The Relational Algebra and The Relational Calculus

## Relational Algebra Overview

- Relational algebra is the **basic set of operations** for the relational model; it specifies retrieval requests.
- Each operation takes one or more **relations** as input and produces a **new relation** as output → the algebra is **closed** (all objects are relations).
- A sequence of operations is a **relational algebra expression**; its result is a relation (the query answer).

### Groups of operations
| Group | Operations |
|---|---|
| Unary | SELECT $\sigma$, PROJECT $\pi$, RENAME $\rho$ |
| Set theory | UNION $\cup$, INTERSECTION $\cap$, DIFFERENCE $-$, CARTESIAN PRODUCT $\times$ |
| Binary | JOIN (variants), DIVISION $\div$ |
| Additional | OUTER JOIN, OUTER UNION, AGGREGATE functions $\mathcal{F}$, recursive closure |

A **complete set** is $\{\sigma, \pi, \cup, -, \rho, \times\}$ — every other operation can be expressed from these (e.g., $R \bowtie_{cond} S = \sigma_{cond}(R \times S)$; $R \cap S = (R \cup S) - ((R - S) \cup (S - R))$).

## Unary Operations

### SELECT — $\sigma$
Selects a subset of **tuples** satisfying a Boolean condition (horizontal filter); schema unchanged.
- General: $\sigma_{<condition>}(R)$.
- Commutative: $\sigma_{c1}(\sigma_{c2}(R)) = \sigma_{c2}(\sigma_{c1}(R))$.
- Cascaded SELECTs collapse into one with AND of conditions.
- Result cardinality $\le |R|$.

```text
σ DNO = 4 (EMPLOYEE)              -- dept 4 employees
σ SALARY > 30000 (EMPLOYEE)      -- salary filter
```

### PROJECT — $\pi$
Keeps specified **columns** (vertical partition); discards the rest. **Duplicate tuples are removed** (result is a set).
- General: $\pi_{<attribute\ list>}(R)$.
- Not commutative (generally); if `list2` contains `list1`, then $\pi_{list1}(\pi_{list2}(R)) = \pi_{list1}(R)$.
- If the list includes a key, result cardinality $= |R|$.

```text
π LNAME, FNAME, SALARY (EMPLOYEE)
```

### RENAME — $\rho$
Renames relation and/or attributes (needed for self-joins and multi-step queries).
```text
ρ S (B1, B2, …, Bn) (R)   -- rename relation to S and attributes to B1..Bn
ρ S (R)                   -- rename relation only
ρ (B1, B2, …, Bn) (R)     -- rename attributes only
```
Shorthand assignment `←` (e.g., `DEP5_EMPS ← σ DNO=5 (EMPLOYEE)`); can also rename inline: `RESULT(F,M,L,…) ← ρ RESULT(F,M,L,…) (DEP5_EMPS)`.

### Composing operations
Single expression vs. step-by-step (intermediate names):
```text
π FNAME,LNAME,SALARY (σ DNO=5 (EMPLOYEE))

-- equivalently:
DEP5_EMPS  ← σ DNO=5 (EMPLOYEE)
RESULT     ← π FNAME,LNAME,SALARY (DEP5_EMPS)
```

## Set-Theoretic Operations (require type compatibility)

Two relations $R_1(A_1,..,A_n)$ and $R_2(B_1,..,B_n)$ are **union-compatible** if they have the same number of attributes and $\text{dom}(A_i) = \text{dom}(B_i)$. Result keeps $R_1$'s attribute names.

| Op | Notation | Meaning |
|---|---|---|
| UNION | $R \cup S$ | tuples in R or S or both (duplicates removed) |
| INTERSECTION | $R \cap S$ | tuples in both |
| SET DIFFERENCE | $R - S$ | tuples in R but not in S |

- UNION and INTERSECTION are **commutative** and **associative**.
- DIFFERENCE is **not** commutative ($R - S \ne S - R$).

```text
DEP5_EMPS  ← σ DNO=5 (EMPLOYEE)
RESULT1    ← π SSN (DEP5_EMPS)
RESULT2(SSN) ← π SUPERSSN (DEP5_EMPS)
RESULT     ← RESULT1 ∪ RESULT2
```

### CARTESIAN PRODUCT — $\times$
$R(A_1..A_n) \times S(B_1..B_m)$ → relation of degree $n+m$; one tuple per combination. $|R \times S| = |R| \times |S|$. Operands need **not** be type compatible.

```text
-- not meaningful alone:
EMP_DEPENDENTS ← EMPNAMES × DEPENDENT
-- make it meaningful by selecting the matching pairs:
ACTUAL_DEPS ← σ SSN=ESSN (EMP_DEPENDENTS)
```

## Binary Operations: JOIN and DIVISION

### JOIN — $\bowtie$
Combines CARTESIAN PRODUCT + SELECT. General: $R \bowtie_{<cond>} S$. Result degree $= n+m$; generally $|result| < |R|\times|S|$ (only matching tuples kept).

- **Theta-join**: join condition $\theta$ is any Boolean expression (e.g., $R.A_i < S.B_j\ \text{AND}\ (R.A_k = S.B_l\ \text{OR}\ \dots)$).
- **Equijoin**: condition uses only equality comparisons; leaves two identical join columns.
- **Natural join** $\bowtie$ (or $*$): implicit equijoin on **all attributes with the same name**; one copy of each join attribute is kept. If names differ, apply $\rho$ first.

```text
-- EQUIJOIN: manager of each department
DEPT_MGR ← DEPARTMENT ⋈ MGRSSN=SSN EMPLOYEE

-- NATURAL JOIN: one shared attribute DNUMBER
DEPT_LOCS ← DEPARTMENT ⋈ DEPT_LOCATIONS
-- general: Q ← R(A,B,C,D) ⋈ S(C,D,E)  ⇒  Q(A,B,C,D,E)
```

### DIVISION — $\div$
$R(Z) \div S(X)$, with $X \subseteq Z$, $Y = Z - X$. Result $T(Y)$ contains tuple $t$ iff for **every** tuple $t_s$ in $S$, there is a tuple in $R$ with $t_R[Y] = t$ and $t_R[X] = t_s$.

Intuition: "find entities associated with *all* values in S." Used for "for all" queries (complement of the double-negation EXISTS pattern in SQL).

### OUTER JOIN
In (natural/equi) join, unmatched tuples are **discarded** (information loss). Outer joins keep them, padding missing attributes with NULL:
- **LEFT OUTER**: keep all tuples of the left relation.
- **RIGHT OUTER**: keep all of the right.
- **FULL OUTER**: keep all of both, padding as needed.

### OUTER UNION
For **partially type-compatible** relations $R(X,Y)$ and $S(X,Z)$ (only $X$ shared): keeps shared attributes once and also keeps $Y$ and $Z$ (NULL where not applicable). Example: `STUDENT(Name,SSN,Dept,Advisor)` OUTER UNION `INSTRUCTOR(Name,SSN,Dept,Rank)` → `STUDENT_OR_INSTRUCTOR(Name,SSN,Dept,Advisor,Rank)`.

## Aggregate Functions and Grouping — $\mathcal{F}$

Basic algebra cannot express statistics; add $\mathcal{F}$:
- $\mathcal{F}_{MAX\ Salary}(EMPLOYEE)$, $\mathcal{F}_{MIN\ Salary}$, $\mathcal{F}_{SUM\ Salary}$, $\mathcal{F}_{COUNT\ SSN, AVERAGE\ Salary}(EMPLOYEE)$.
- `COUNT` counts rows **without** removing duplicates.

**Grouping**: place the grouping attribute(s) to the **left** of $\mathcal{F}$, aggregates to the **right**:
```text
DNO  ℱ COUNT SSN, AVERAGE Salary (EMPLOYEE)
```
This groups employees by `DNO` and computes count + average salary per department. Rename to give result schema:
```text
ρ R(Dno, No_of_emps, Avg_sal) ( DNO ℱ COUNT Ssn, AVERAGE Salary (EMPLOYEE) )
```

### Recursive closure
Not expressible in basic algebra without looping. Retrieves all supervisees of an employee at **all levels** (e.g., CEO → everyone). SQL:3 provides `WITH RECURSIVE`.

## Query Trees

- An internal structure: **leaf nodes** = base relations; internal nodes = operations ($\sigma, \pi, \bowtie, \rho, \div, \dots$).
- Gives a visual sense of complexity and intermediate results.
- **Algebraic query optimization** rewrites the tree into an equivalent (cheaper) tree (Ch. 15 / 19).

## Worked Examples (procedural form)

**Q1**: name & address of employees in the 'Research' department.
```text
RESEARCH_DEPT ← σ DNAME='Research' (DEPARTMENT)
RESEARCH_EMPS ← RESEARCH_DEPT ⋈ DNUMBER=DNO EMPLOYEE
RESULT       ← π FNAME,LNAME,ADDRESS (RESEARCH_EMPS)

-- single expression:
π Fname,Lname,Address ( σ Dname='Research' (DEPARTMENT ⋈ Dnumber=Dno EMPLOYEE) )
```

**Q6**: names of employees with no dependents.
```text
ALL_EMPS            ← π SSN (EMPLOYEE)
EMPS_WITH_DEPS(SSN) ← π ESSN (DEPENDENT)
EMPS_WITHOUT_DEPS   ← ALL_EMPS - EMPS_WITH_DEPS
RESULT              ← π Lname,Fname (EMPS_WITHOUT_DEPS ⋈ EMPLOYEE)
```

## Relational Calculus (declarative)

- Calculus specifies **what** to retrieve, not **how** (non-procedural); algebra is procedural (sequence of operations).
- Two forms, both equivalent to algebra: **tuple relational calculus** and **domain relational calculus**.

### Tuple Relational Calculus
Query form: $\{t \mid COND(t)\}$ — set of tuples $t$ satisfying $COND$. Variables range over **tuples**.
- **Quantifiers**: $\exists t$ (exists), $\forall t$ (for all). A variable is *bound* if quantified, *free* otherwise. Only free variables appear left of `|`.
- Q (salary > 50000):
  $\{t.FNAME, t.LNAME \mid EMPLOYEE(t)\ \text{AND}\ t.SALARY > 50000\}$
- With existential quantifier (Research employees):
  $\{t.FNAME, t.LNAME, t.ADDRESS \mid EMPLOYEE(t)\ \text{AND}\ (\exists d)(DEPARTMENT(d)\ \text{AND}\ d.DNAME='Research'\ \text{AND}\ d.DNUMBER=t.DNO)\}$
- "For all" (works on all projects controlled by dept 5) uses $\forall$ with exclusions:
  $\{e.LNAME, e.FNAME \mid EMPLOYEE(e)\ \text{AND}\ ((\forall x)(\text{NOT}(PROJECT(x))\ \text{OR}\ \text{NOT}(x.DNUM=5)\ \text{OR}\ (\exists w)(WORKS_ON(w)\ \text{AND}\ w.ESSN=e.SSN\ \text{AND}\ x.PNUMBER=w.PNO)))\}$
  (Exclude tuples not in PROJECT, then those not in dept 5, then require participation in all remaining projects.)

### Domain Relational Calculus
Variables range over **single domain values**; an $n$-attribute result needs $n$ domain variables.
$\{x_1,..,x_n \mid COND(x_1,..,x_{n+m})\}$. Example: birthdate & address of 'John B. Smith' — only the `BDATE` and `ADDRESS` domain variables are free.

### QBE (Query-By-Example)
A domain-calculus-based, form-filling language: example elements (`_value`), `P.` (print), condition boxes, joins via shared example elements, `.CNT/.MAX/.MIN/.AVG` aggregates, `.G` grouping. Equivalent to SQL; available in IBM DB2 QMF, MS Access, Paradox.

## Chapter Summary

- Algebra: unary ($\sigma,\pi,\rho$), set ($\cup,\cap,-,\times$ — type compatibility required), binary ($\bowtie$ theta/equi/natural, $\div$), additional (outer join/union, $\mathcal{F}$ aggregates with grouping, recursive closure).
- $\{\sigma,\pi,\cup,-,\rho,\times\}$ is complete. OUTER JOIN keeps unmatched tuples (NULL-padded).
- Query trees represent plans; optimization rewrites trees.
- Calculus is declarative (tuple/domain); SQL derives from tuple calculus. "For all" needs $\forall$ (calculus) or double-negation/`DIVISION` (algebra/SQL).
