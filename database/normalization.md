# Basics of Functional Dependencies and Normalization for Relational Databases

## What is Relational Database Design?

Design = grouping attributes into "good" relation schemas. We care mainly about **base relations** (storage level), though user views also matter. Criteria for "good" base relations come from both informal guidelines and formal normal forms.

## 1. Informal Design Guidelines

**Guideline 1 — Semantics of attributes:** Each tuple should represent one entity or relationship instance. Do not mix attributes of different entities (EMPLOYEE, DEPARTMENT, PROJECT) in one relation; use foreign keys to refer across entities. The schema should be explainable relation by relation.

**Guideline 2 — Avoid redundancy / update anomalies.** Redundant storage wastes space and causes anomalies:
- **Update anomaly**: changing a value (e.g., project P1's name) requires many changes.
- **Insertion anomaly**: cannot insert a project unless an employee is assigned (and vice versa).
- **Deletion anomaly**: deleting a project deletes all its employees; deleting the sole employee on a project deletes the project.

Example bad schema: `EMP_PROJ(Emp#, Proj#, Ename, Pname, No_hours)` — mixes employee and project facts.

**Guideline 3 — Minimize NULLs:** Place frequently-NULL attributes in separate relations (with the PK). Reasons for NULLs: not applicable, unknown, or known-but-unavailable.

**Guideline 4 — Lossless join / no spurious tuples:** Decompositions must satisfy the **lossless join** property so a natural join never generates spurious (false) tuples. This is **non-negotiable**. Two decomposition properties:
- (a) **Non-additive (lossless) join** — extremely important, cannot be sacrificed.
- (b) **Preservation of functional dependencies** — less stringent, may be sacrificed (Ch. 15).

## 2. Functional Dependencies (FDs)

An FD $X \to Y$ holds on schema $R$ if, for any two tuples $t_1, t_2$ in any legal instance $r(R)$, $t_1[X] = t_2[X] \Rightarrow t_1[Y] = t_2[Y]$. I.e., the value of $X$ uniquely determines the value of $Y$. FDs are derived from the **real-world meaning** of attributes.

Examples:
- `SSN → ENAME`
- `PNUMBER → {PNAME, PLOCATION}`
- `{SSN, PNUMBER} → HOURS`

If $K$ is a key of $R$, then $K \to A$ for every attribute $A$ of $R$. From an instance we can only *rule out* FDs (find violating tuples); an FD is a property of the schema, expected to hold in **all** instances.

### Armstrong's Axioms (for inferring FDs)
Given a set $F$ of FDs, the closure $F^+$ is all FDs implied by $F$. Armstrong's axioms are sound and complete:
- **Reflexivity**: if $Y \subseteq X$, then $X \to Y$.
- **Augmentation**: if $X \to Y$, then $XZ \to YZ$ (equivalently $XW \to YW$).
- **Transitivity**: if $X \to Y$ and $Y \to Z$, then $X \to Z$.

Derived (secondary) rules:
- **Union**: if $X \to Y$ and $X \to Z$, then $X \to YZ$.
- **Decomposition**: if $X \to YZ$, then $X \to Y$ and $X \to Z$.
- **Pseudotransitivity**: if $X \to Y$ and $WY \to Z$, then $WX \to Z$.

Compute attribute closure $X^+$ (attributes determinable from $X$) via these rules; useful for key finding and BCNF testing.

### Key terminology
- **Superkey**: set $S \subseteq R$ with no two tuples sharing $S$-value.
- **Key (candidate)**: a *minimal* superkey.
- **Primary key**: the chosen candidate key; others are **secondary keys**.
- **Prime attribute**: member of *some* candidate key. **Non-prime**: not prime.

## 3. Normal Forms Based on Primary Keys

**Normalization** = decomposing "bad" relations into smaller ones. A **normal form** is a condition (on keys/FDs/dependencies) certifying quality.

### First Normal Form (1NF)
Disallows composite attributes, multivalued attributes, and nested relations (non-atomic values). Every attribute must be atomic. Most RDBMSs require relations to be in 1NF.
- Flatten composite/multivalued by creating a new relation and propagating the primary key (e.g., `EMP_PROJ` with nested `PROJS` → `EMP_PROJ1`, `EMP_PROJ2`).

### Second Normal Form (2NF)
- **Full functional dependency**: $Y \to Z$ where removing any attribute from $Y$ breaks the FD. (e.g., `{SSN,PNUMBER} → HOURS` is full; `{SSN,PNUMBER} → ENAME` is *partial* since `SSN → ENAME`.)
- A relation is in **2NF** if every **non-prime** attribute is **fully** functionally dependent on the primary key.
- Achieved by splitting out attributes determined by part of a composite key.

Example: `EMP_PROJ(Emp#, Proj#, Ename, Pname, No_hours)` with key `{Emp#, Proj#}`:
- `SSN → ENAME` (partial) ⇒ separate `EMP(Emp#, Ename)`; `PNUMBER → PNAME` ⇒ `PROJ(Proj#, Pname)`; keep `WORKS_ON(Emp#, Proj#, No_hours)`.

### Third Normal Form (3NF)
- **Transitive FD**: $X \to Z$ derivable from $X \to Y$ and $Y \to Z$ (e.g., `SSN → DNUMBER → DMGRSSN`, so `SSN → DMGRSSN` transitive).
- A relation is in **3NF** if it is in 2NF and **no non-prime attribute is transitively dependent** on the primary key.
- Caveat: if the intermediate $Y$ is a **candidate key**, the transitive dependency is allowed (e.g., `EMP(SSN, Emp#, Salary)` with `SSN → Emp# → Salary`; `Emp#` is a candidate key, so no violation).

Informal summary:
| NF | Rule |
|---|---|
| 1NF | Atomic values (depend on the key) |
| 2NF | Fully dependent on the *whole* key |
| 3NF | Dependent on *nothing but* the key |

### General (multi-key) definitions
For relations with multiple candidate keys:
- **2NF**: every non-prime attribute is fully dependent on **every** key.
- **3NF**: whenever $X \to A$ holds, then either (a) $X$ is a **superkey**, or (b) $A$ is a **prime attribute**.
  - Condition (a) catches partial + transitive violations; (b) allows allowable transitives through candidate keys.

### Worked: LOTS example
`LOTS(Property_id#, County_name, Lot#, Area, Price)` with FDs including `County_name → Tax_rate` and `Area → Price`.
- 2NF: `County_name → Tax_rate` violates (non-prime determined by part) ⇒ split into `LOTS1(Property_id#, County_name, Lot#, Area, Price)` + `LOTS2(County_name, Tax_rate)`.
- 3NF: `Area → Price` in LOTS1 (Area not a superkey, Price non-prime) ⇒ split into `LOTS1A(Property_id#, County_name, Lot#, Area)` + `LOTS1B(Area, Price)`.

## 5. Boyce-Codd Normal Form (BCNF)

A relation is in **BCNF** if whenever $X \to A$ holds, **$X$ is a superkey**.

- Each normal form is strictly stronger: $BCNF \subset 3NF \subset 2NF \subset 1NF$.
- There exist relations in 3NF but **not** BCNF. Goal: reach BCNF (or 3NF) for every relation.

### TEACH: 3NF but not BCNF
FDs: `{student, course} → instructor` (key), `instructor → course`.
- Candidate key = `{student, course}`; all attributes are prime ⇒ 3NF satisfied.
- But `instructor → course` with `instructor` **not** a superkey ⇒ violates BCNF.

### Achieving BCNF by decomposition
General procedure: if $X \to A$ violates BCNF, decompose $R$ into $(R - A)$ and $(X \cup A)$; repeat until all components are BCNF.
- For TEACH: violating FD `instructor → course` ⇒ decompose to `(instructor, student)` and `(instructor, course)`.

### Lossless-join test for binary decompositions (Property NJB)
Decomposition $D = \{R_1, R_2\}$ is **lossless** iff either
$(R_1 \cap R_2) \to (R_1 - R_2)$ **or** $(R_1 \cap R_2) \to (R_2 - R_1)$ is in $F^+$.

Three candidate decompositions of TEACH:
- D1 `{student,instructor},{student,course}`: intersection `student` → nothing ⇒ **lossy**.
- D2 `{course,instructor},{course,student}`: intersection `course` → nothing ⇒ **lossy**.
- D3 `{instructor,student},{instructor,course}`: intersection `instructor → course` **holds** ⇒ **lossless (good)**.

Note: all three lose FD1 (`{student,course} → instructor`); we sacrifice **dependency preservation** but keep **non-additivity**.

## 6. Multivalued Dependencies and 4NF

### MVD
$X \twoheadrightarrow Y$ on $R$: if two tuples agree on $X$, then for the $Y$- and $Z=(R-(X \cup Y))$-values present, all four combinations exist. **Trivial MVD**: $Y \subseteq X$ or $X \cup Y = R$.
- An FD $X \to Y$ implies the MVD $X \twoheadrightarrow Y$.

### Fourth Normal Form (4NF)
$R$ is in **4NF** if for every nontrivial MVD $X \twoheadrightarrow Y$ in $F^+$, **$X$ is a superkey**.

Example: `EMP(Ename, Pname, Dname)` with `Ename ⇢ Pname` and `Ename ⇢ Dname` (independent multivalues). Decompose into `EMP_PROJECTS(Ename, Pname)` and `EMP_DEPENDENTS(Ename, Dname)` — both 4NF.

4NF rarely used in practice (usually up to 3NF/BCNF; denormalization may store joins for performance).

## 7. Join Dependencies and 5NF

### Join Dependency (JD)
$JD(R_1, R_2, \dots, R_n)$ on $R$: every legal state $r$ equals $\bowtie(\pi_{R_1}(r), \dots, \pi_{R_n}(r))$ — a lossless join decomposition. An MVD is a special case with $n=2$. Trivial JD if some $R_i = R$.

### Fifth Normal Form (5NF) / Project-Join NF (PJNF)
$R$ is in **5NF** if for every nontrivial JD $JD(R_1,\dots,R_n)$ in $F^+$, every $R_i$ is a superkey of $R$.

Example: `SUPPLY(S, P, J)` (supplier, part, project) with JD `(S,P),(P,J),(J,S)` ⇒ decompose into the three binary relations. Discovering JDs in large DBs is impractical, so **5NF is rarely used in practice**.

## Denormalization
Storing the join of higher-NF relations as a lower-NF base relation — done intentionally for performance (read speed) when updates are rare. A conscious trade-off, not a design accident.

## Worked Normalization Example (EMP_DEPT)

Consider `EMP_DEPT(Emp#, Dept#, Ename, Dname, Dmgr#, Salary)` with:
- Key: `{Emp#}` (assume one employee per row).
- FDs: `Emp# → Ename, Salary, Dept#`; `Dept# → Dname, Dmgr#`.

Problems:
1. `Emp# → Dept#` and `Dept# → Dname` ⇒ **transitive** dependency `Emp# → Dname` (3NF violation).
2. `Dept# → Dmgr#` is another transitive dependency.

**Step 1 (2NF):** key is single attribute `Emp#`, so no partial dependency ⇒ already 2NF.
**Step 2 (3NF):** remove transitive dependencies by projecting out the determined attributes:
```text
EMP(Emp#, Ename, Salary, Dept#)      -- Emp# → Ename, Salary, Dept#
DEPT(Dept#, Dname, Dmgr#)            -- Dept# → Dname, Dmgr#
```
Now every non-prime attribute depends only on the key. Check **losslessness**: `EMP ∩ DEPT = {Dept#}`; `Dept# → (Dname, Dmgr#)` holds ⇒ NJB satisfied. Dependencies preserved.

## Summary Comparison of Normal Forms

| NF | Requirement | Eliminates |
|---|---|---|
| 1NF | Atomic attributes | repeating/composite/multivalued attrs |
| 2NF | No partial dependency on key | redundancy when key is composite |
| 3NF | No transitive dependency on key | `X→Y→A` chains (non-prime A) |
| BCNF | Every determinant is a superkey | all FD violations (even prime→non-prime) |
| 4NF | Every nontrivial MVD has superkey LHS | independent multivalued facts |
| 5NF | Every nontrivial JD has superkey component | join anomalies |

Practical guideline: normalize to **3NF/BCNF**; use denormalization only for proven performance needs.

## Chapter Summary

- FD $X \to Y$: equal $X$ ⇒ equal $Y$; derive via Armstrong's axioms (reflexivity, augmentation, transitivity). Superkey/key/prime terminology underpins all NFs.
- 1NF atomic; 2NF full dependence on key; 3NF no transitive dependence; BCNF every determinant is a superkey (stronger than 3NF).
- Decompose to BCNF via $(R-A),(X \cup A)$; verify losslessness with NJB. Dependency preservation may be sacrificed, but losslessness must not.
- 4NF (MVDs) and 5NF (JDs) handle independent multivalues; rarely used. Practice stops at 3NF/BCNF.
