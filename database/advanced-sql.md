# More SQL: Complex Queries, Triggers, Views, and Schema Modification

## NULL and Three-Valued Logic

A NULL can mean: unknown value, unavailable/withheld value, or not-applicable attribute. Each NULL is treated as distinct from every other NULL.

- SQL uses **three-valued logic**: `TRUE`, `FALSE`, `UNKNOWN`.
- `NULL = NULL` is **not** valid; use `IS NULL` / `IS NOT NULL` instead.
- A comparison with NULL yields `UNKNOWN`; `AND/OR/NOT` propagate three-valued results (e.g., `TRUE AND UNKNOWN = UNKNOWN`, `FALSE OR UNKNOWN = UNKNOWN`, `NOT UNKNOWN = UNKNOWN`).

```sql
SELECT * FROM EMPLOYEE WHERE Super_ssn IS NULL;
```

## Nested Queries (Subqueries)

A subquery is a complete `SELECT-FROM-WHERE` block inside the `WHERE` (or `FROM`/`HAVING`) of another query. The outer query contains the nested subquery.

### IN / NOT IN
`IN` compares a value $v$ against a set/multiset $V$; TRUE if $v$ is an element of $V$.

```sql
SELECT DISTINCT Essn FROM WORKS_ON WHERE Pno IN (1, 2, 3);
```

### ANY (SOME) / ALL
- `= ANY` (or `= SOME`) ≡ `IN`.
- Combine with `>, >=, <, <=, <>`; true if the condition holds for **some** value in the set.
- `ALL`: condition must hold for **every** value in the set.

```sql
SELECT Lname FROM EMPLOYEE
WHERE Salary > ALL (SELECT Salary FROM EMPLOYEE WHERE Dno = 5);
```

### Correlated nested queries
Evaluated **once per tuple** of the outer query (the inner query references an outer alias).

```sql
-- Employees with a dependent sharing their first name and sex
SELECT E.Fname, E.Lname
FROM   EMPLOYEE AS E
WHERE  EXISTS (SELECT * FROM DEPENDENT AS D
               WHERE E.Ssn = D.Essn AND E.Sex = D.Sex
                 AND E.Fname = D.Dependent_name);
```
Some nested `=`/`IN` queries can be "collapsed" into a single block (join).

### EXISTS / NOT EXISTS / UNIQUE
- `EXISTS(Q)` → TRUE if Q returns ≥1 row (typically correlated).
- `UNIQUE(Q)` → TRUE if Q has no duplicate tuples.

```sql
-- Q7: employees who have a dependent AND are a manager
SELECT Fname, Lname FROM EMPLOYEE
WHERE EXISTS (SELECT * FROM DEPENDENT WHERE Ssn = Essn)
  AND EXISTS (SELECT * FROM DEPARTMENT WHERE Ssn = Mgr_ssn);
```

### "For all" via double negation
SQL has no direct universal quantifier; emulate with `NOT EXISTS (... EXCEPT ...)` (or `NOT EXISTS (... NOT EXISTS ...)`).

```sql
-- Employees who work on ALL projects controlled by department 5
SELECT Fname, Lname FROM EMPLOYEE
WHERE NOT EXISTS (
    (SELECT Pnumber FROM PROJECT WHERE Dnum = 5)
    EXCEPT
    (SELECT Pno FROM WORKS_ON WHERE Ssn = Essn)
);
```
Equivalent reading: "there does NOT exist a dept-5 project that this employee does NOT work on."

### Tuple comparisons
Compare tuples of values by placing them in parentheses:
```sql
WHERE (Dno, Sex) = (5, 'F');
```

## Joined Tables in the FROM Clause

The `FROM` clause can build a joined table explicitly.

### INNER JOIN (default)
A tuple appears only if a matching tuple exists in the other relation.
```sql
SELECT Pnumber, Dnum, Lname, Address, Bdate
FROM   ((PROJECT JOIN DEPARTMENT ON Dnum = Dnumber)
        JOIN EMPLOYEE ON Mgr_ssn = Ssn)
WHERE  Plocation = 'Stafford';
```

### NATURAL JOIN
Implicit equi-join on all attributes with the same name in both relations (no join condition needed).
```sql
SELECT Fname, Lname, Address
FROM   EMPLOYEE NATURAL JOIN
       (DEPARTMENT AS DEPT(Dname, Dno, Mssn, Msdate))
WHERE  Dname = 'Research';   -- implicit EMPLOYEE.Dno = DEPT.Dno
```

### OUTER JOINS
- **LEFT OUTER JOIN**: every tuple of the left table appears; unmatched right-side attributes are NULL-padded.
- **RIGHT OUTER JOIN**: every tuple of the right table appears.
- **FULL OUTER JOIN**: union of left and right outer.

```sql
SELECT E.Lname AS Employee_Name, S.Lname AS Supervisor_Name
FROM   EMPLOYEE AS E LEFT OUTER JOIN EMPLOYEE AS S
       ON E.Super_ssn = S.Ssn;
```
(Legacy syntax: `WHERE E.Super_ssn *= S.Ssn` for left outer.)

## Aggregate Functions

Summarize many tuples into one. Built-ins: `COUNT`, `SUM`, `MAX`, `MIN`, `AVG`. **NULLs are discarded** during aggregation (except `COUNT(*)`, which counts rows).

```sql
-- Q19: single summary row
SELECT SUM(Salary), MAX(Salary), MIN(Salary), AVG(Salary) FROM EMPLOYEE;

-- renamed
SELECT SUM(Salary) AS Total_Sal, AVG(Salary) AS Average_Sal FROM EMPLOYEE;
```

### GROUP BY
Partitions tuples into groups by the grouping attribute(s); the aggregate is applied **per group**. The grouping attribute(s) must appear in the `SELECT` list. A NULL grouping value forms its own group.

```sql
-- Q24: per-department headcount and average salary
SELECT Dno, COUNT(*), AVG(Salary)
FROM   EMPLOYEE
GROUP  BY Dno;

-- Q25: per-project headcount
SELECT Pnumber, Pname, COUNT(*)
FROM   PROJECT, WORKS_ON
WHERE  Pnumber = Pno
GROUP  BY Pnumber, Pname;
```

### HAVING
Selects/rejects an **entire group** (applied after grouping). `WHERE` filters individual tuples *before* grouping; `HAVING` filters groups *after*.

```sql
-- Q26: projects with more than 2 employees
SELECT Pnumber, Pname, COUNT(*)
FROM   PROJECT, WORKS_ON
WHERE  Pnumber = Pno
GROUP  BY Pnumber, Pname
HAVING COUNT(*) > 2;
```

### Combining WHERE and HAVING — common mistake
Wrong: `WHERE Salary > 40000 ... GROUP BY Dno HAVING COUNT(*) > 5` counts *only high-salary* employees per dept (not total headcount).
Right: count all employees per dept, but restrict to high-salary ones within qualifying (large) departments:
```sql
WITH BIGDEPTS(Dno) AS (
    SELECT Dno FROM EMPLOYEE GROUP BY Dno HAVING COUNT(*) > 5)
SELECT Dno, COUNT(*)
FROM   EMPLOYEE
WHERE  Salary > 40000 AND Dno IN BIGDEPTS
GROUP  BY Dno;
```

### WITH (Common Table Expression)
Defines a temporary "view" used only in the query; not stored. (Also supports `WITH RECURSIVE` for recursive queries.)

### CASE
Computes different values by condition; usable anywhere a value is expected (query, insert, update).
```sql
UPDATE EMPLOYEE
SET    Salary = CASE
         WHEN Dno = 5 THEN Salary + 2000
         WHEN Dno = 4 THEN Salary + 1500
         WHEN Dno = 1 THEN Salary + 3000
         ELSE Salary END;
```

### Recursive queries
`WITH RECURSIVE` iteratively extends a working table until a fixed point.
```sql
-- Q29: all supervisees (any level) of each supervisor
WITH RECURSIVE SUP_EMP(SupSsn, EmpSsn) AS (
    SELECT Super_ssn, Ssn FROM EMPLOYEE
    UNION
    SELECT E.Super_ssn, S.EmpSsn
    FROM   EMPLOYEE AS E, SUP_EMP AS S
    WHERE  E.Super_ssn = S.EmpSsn)
SELECT * FROM SUP_EMP;
```
The base case seeds immediate supervisees; the recursive case adds deeper levels until none remain.

## Assertions and Triggers

Some constraints exceed the relational model's built-in kinds (keys, checks).

### CREATE ASSERTION
Specifies a query that would return violating tuples; the assertion holds when that query is empty. Use only when a simple per-tuple `CHECK` is insufficient (e.g., cross-table or aggregate constraints).

### CREATE TRIGGER
An active-database rule with three parts: **Event** (INSERT/UPDATE/DELETE), **Condition** (`WHEN`), **Action**. Can be `BEFORE/AFTER` and `FOR EACH ROW` (row-level) or statement-level. `NEW`/`OLD` refer to modified rows.

```sql
CREATE TRIGGER SALARY_VIOLATION
BEFORE INSERT OR UPDATE OF Salary, Super_ssn ON EMPLOYEE
FOR EACH ROW
WHEN (NEW.Salary > (SELECT Salary FROM EMPLOYEE
                    WHERE Ssn = NEW.Super_ssn))
CALL INFORM_SUPERVISOR(NEW.Super_ssn, NEW.Ssn);
```
(Implementations differ — e.g., PostgreSQL uses a `FUNCTION ... RETURNS TRIGGER` body.)

## Views (Virtual Tables)

- A **view** is a single derived table defined by a query over base ("defining") tables; it is not physically populated by default.
- Always up-to-date (computed on reference). Drop with `DROP VIEW`.

```sql
CREATE VIEW DEPT5EMP AS
SELECT * FROM EMPLOYEE WHERE Dno = 5;

-- V2 with renamed columns:
CREATE VIEW DEPT_INFO(Dname, Total_sal, No_of_emps) AS
SELECT Dname, SUM(Salary), COUNT(*)
FROM   DEPARTMENT, EMPLOYEE
WHERE  Dnumber = Dno
GROUP  BY Dname;
```

### View implementation
- **Query modification (Strategy 1)**: rewrite the query on the view into one on base tables; not stored. Inefficient for complex views.
- **View materialization (Strategy 2)**: physically build a temp table on first query, then maintain it. Update strategies:
  - *Immediate*: update view as soon as base tables change.
  - *Lazy*: update when the view is next queried.
  - *Periodic*: update on a schedule (may serve slightly stale data — common in banking/retail).

### View update
- Updatable only if defined on a **single table** with no aggregation and the **primary key preserved** in the view.
- Aggregated views are **not** updatable (`SET Total_sal = ...` fails — computed value).
- Join views are often ambiguous.
- `WITH CHECK OPTION` ensures updates keep the modified tuple inside the view.

### Views as authorization
Hide attributes/tuples from unauthorized users (e.g., `DEPT5EMP` exposes only dept-5 rows).

## Schema Modification

DBA can evolve the schema without recompiling it (`GRANT`/`REVOKE` in Ch. 30).

### DROP
Drops named elements; options `CASCADE` (remove dependents too) or `RESTRICT` (fail if dependents exist).
```sql
DROP SCHEMA COMPANY CASCADE;          -- removes tables, views, constraints
```

### ALTER TABLE
```sql
ALTER TABLE COMPANY.EMPLOYEE ADD COLUMN Job VARCHAR(12);
ALTER TABLE COMPANY.EMPLOYEE DROP COLUMN Address CASCADE;
ALTER TABLE COMPANY.DEPARTMENT ALTER COLUMN Mgr_ssn DROP DEFAULT;
ALTER TABLE COMPANY.DEPARTMENT ALTER COLUMN Mgr_ssn
    SET DEFAULT '333445555';
```
Also add/drop constraints (named constraints help here).

## Chapter Summary

- NULL → three-valued logic; test with `IS NULL`. Subqueries use `IN`, `ANY/ALL`, `EXISTS`, tuple comparisons; "for all" = double `NOT EXISTS`/`EXCEPT`.
- Joined tables: `INNER`, `NATURAL`, `LEFT/RIGHT/FULL OUTER` joins.
- Aggregates (`COUNT/SUM/MAX/MIN/AVG`) with `GROUP BY` and `HAVING`; `WHERE` (tuple) vs `HAVING` (group). `WITH` CTEs; `CASE`; `WITH RECURSIVE`.
- Assertions for general constraints; triggers (event-condition-action) for active behavior.
- Views are virtual; materialization strategies (immediate/lazy/periodic); updatable only if single-table, key-preserving, non-aggregated. `WITH CHECK OPTION`.
- Schema evolution via `DROP` (CASCADE/RESTRICT) and `ALTER TABLE` (add/drop column, defaults, constraints).
