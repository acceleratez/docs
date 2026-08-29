# Basic SQL

## SQL Overview

- SQL (Structured Query Language) is a major reason for the commercial success of relational databases.
- Origin: relational predicate calculus / **tuple calculus** (Ch. 8); originally called **SQUARE**, then **SEQUEL** (Chamberlin & Boyce), shortened to **SQL** because "SEQUEL" could not be trademarked.
- SQL is the *practical* rendering of the relational model (it differs from the formal model: SQL tables may contain duplicate rows — "multiset/bag" semantics — unless `DISTINCT` is used).
- Terminology mapping: table = relation, row = tuple, column = attribute.
- One statement per command, terminated by a **semicolon `;`**.

### Standards
- SQL-86 / SQL-89 (SQL-1), **SQL-92 (SQL-2)**, then **SQL:1999 (SQL-3)** which split into a *core* spec + specialized extensions (data mining, warehousing, multimedia, XML, O-O). SQL-3 is the current standard but not fully implemented by any RDBMS.

### Schema and catalog concepts
- A **schema** is identified by a name and an authorization identifier; it contains tables, constraints, views, domains, etc.
- A **catalog** is a named collection of schemas; a cluster is a collection of catalogs.

```sql
CREATE SCHEMA COMPANY AUTHORIZATION 'Jsmith';
```

## SQL Data Definition and Data Types

### CREATE TABLE
- **Base tables** are physically stored by the DBMS; **views** (virtual relations, `CREATE VIEW`) are not.
- Optionally qualify with the schema name: `CREATE TABLE COMPANY.EMPLOYEE (...)`.

### Data types
| Category | Types |
|---|---|
| Numeric (integer) | `INTEGER`, `INT`, `SMALLINT` |
| Numeric (float) | `FLOAT`, `REAL`, `DOUBLE PRECISION` |
| Character (fixed) | `CHAR(n)`, `CHARACTER(n)` |
| Character (varying) | `VARCHAR(n)`, `CHARACTER VARYING(n)` |
| Bit-string | `BIT(n)`, `BIT VARYING(n)` |
| Boolean | `TRUE` / `FALSE` / `NULL` |
| Date | `DATE` — `YYYY-MM-DD` |
| Time | `TIME` — `HH:MM:SS` |
| Timestamp | `TIMESTAMP` (date + time + ≥6 fractional sec), optional `WITH TIME ZONE` |
| Interval | `INTERVAL` — relative value to increment/decrement dates/times |

- **Domains** improve readability and ease type changes:
  ```sql
  CREATE DOMAIN SSN_TYPE AS CHAR(9);
  ```
- **User-defined types (UDTs)** for O-O apps: `CREATE TYPE ...` (Ch. 12).

## Specifying Constraints in SQL

### Attribute-level constraints
- `DEFAULT <value>` — a default when no value supplied.
- `NOT NULL` — disallow NULL for that attribute.
- `CHECK` — restrict values:
  ```sql
  Dnumber INT NOT NULL CHECK (Dnumber > 0 AND Dnumber < 21);
  ```

### Key and referential integrity
- `PRIMARY KEY` — attribute(s) forming the primary key (entity integrity: cannot be NULL/duplicated).
- `UNIQUE` — alternate (candidate) keys.
- `FOREIGN KEY ... REFERENCES` — referential integrity.

```sql
Dnumber INT PRIMARY KEY;
Dname   VARCHAR(15) UNIQUE;
```

### Referential triggered actions
Default on violation = **reject**. Options: `SET NULL`, `CASCADE`, `SET DEFAULT` (same behavior on `ON DELETE` and `ON UPDATE`). `CASCADE` suits "relationship" relations.

```sql
FOREIGN KEY (Dno) REFERENCES DEPARTMENT(Dnumber)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
```

### Naming constraints & tuple-level CHECK
- `CONSTRAINT <name> ...` lets you alter/drop later.
- Table-level `CHECK` applies to each tuple:
  ```sql
  CHECK (Dept_create_date <= Mgr_start_date);
  ```

### COMPANY schema DDL (example)
```sql
CREATE TABLE EMPLOYEE (
    Fname    VARCHAR(15) NOT NULL,
    Minit    CHAR(1),
    Lname    VARCHAR(15) NOT NULL,
    Ssn      CHAR(9) PRIMARY KEY,
    Bdate    DATE,
    Address  VARCHAR(30),
    Sex      CHAR(1),
    Salary   DECIMAL(10,2),
    Super_ssn CHAR(9),
    Dno      INT NOT NULL,
    FOREIGN KEY (Super_ssn) REFERENCES EMPLOYEE(Ssn),
    FOREIGN KEY (Dno) REFERENCES DEPARTMENT(Dnumber)
);

CREATE TABLE DEPARTMENT (
    Dname    VARCHAR(15) NOT NULL UNIQUE,
    Dnumber  INT PRIMARY KEY,
    Mgr_ssn  CHAR(9),
    Mgr_start_date DATE,
    FOREIGN KEY (Mgr_ssn) REFERENCES EMPLOYEE(Ssn)
);

CREATE TABLE PROJECT (
    Pname    VARCHAR(15) NOT NULL UNIQUE,
    Pnumber  INT PRIMARY KEY,
    Plocation VARCHAR(15),
    Dnum     INT,
    FOREIGN KEY (Dnum) REFERENCES DEPARTMENT(Dnumber)
);

CREATE TABLE WORKS_ON (
    Essn  CHAR(9),
    Pno   INT,
    Hours DECIMAL(3,1),
    PRIMARY KEY (Essn, Pno),
    FOREIGN KEY (Essn) REFERENCES EMPLOYEE(Ssn),
    FOREIGN KEY (Pno)  REFERENCES PROJECT(Pnumber)
);
```

## Basic Retrieval: SELECT-FROM-WHERE

```
SELECT   <projection list>
FROM     <relation list>
WHERE    <selection condition>;
```

- Projection attributes: columns to retrieve.
- Selection condition: Boolean condition each retrieved tuple must satisfy (may include join conditions when multiple relations are involved).
- Comparison operators: `=, <, <=, >, >=, <>` (not equal).

```sql
-- Q1: All employees in department 5 with salary > 30000
SELECT Fname, Lname, Salary
FROM   EMPLOYEE
WHERE  Dno = 5 AND Salary > 30000;
```

### Ambiguous / qualified names, aliases
- Same attribute name in different relations → qualify with relation name.
- Aliases (tuple variables) let you refer to a relation twice (e.g., self-join for supervisor):

```sql
-- Q8: employee and his/her immediate supervisor names
SELECT E.Fname, E.Lname, S.Fname, S.Lname
FROM   EMPLOYEE AS E, EMPLOYEE AS S
WHERE  E.Super_ssn = S.Ssn;
```

- Renaming attributes:
  ```sql
  EMPLOYEE AS E(Fn, Mi, Ln, Ssn, Bd, Addr, Sex, Sal, Sssn, Dno)
  ```
  (`AS` is often optional.)

### Missing WHERE / Asterisk / Cross product
- Omitting `WHERE` ⇒ no selection ⇒ **CARTESIAN PRODUCT** of the FROM relations (often a mistake).
- `*` retrieves all attributes: `SELECT * FROM EMPLOYEE;` or `EMPLOYEE.*`.

### Duplicate handling
- SQL keeps duplicates by default (bag semantics). Use **`DISTINCT`** to remove them:
  ```sql
  SELECT DISTINCT Dno FROM EMPLOYEE;
  ```

### Set operations
Require **type compatibility** (same number of attributes, compatible types):
- `UNION`, `EXCEPT` (difference), `INTERSECT`.
- Multiset versions: `UNION ALL`, `EXCEPT ALL`, `INTERSECT ALL`.

```sql
(SELECT Ssn FROM EMPLOYEE WHERE Dno = 5)
UNION
(SELECT Ssn FROM EMPLOYEE WHERE Salary > 60000);
```

### Pattern matching & range
- `LIKE` with `%` (any 0+ chars) and `_` (single char):
  ```sql
  WHERE Address LIKE '%Houston,TX%';
  WHERE Ssn    LIKE '__1__8901';
  ```
- `BETWEEN ... AND ...` for inclusive ranges:
  ```sql
  WHERE (Salary BETWEEN 30000 AND 40000) AND Dno = 5;
  ```

### Arithmetic & computed columns
```sql
-- Q13: 10% raise for employees on ProductX
SELECT E.Fname, E.Lname, 1.1 * E.Salary AS Increased_sal
FROM   EMPLOYEE AS E, WORKS_ON AS W, PROJECT AS P
WHERE  E.Ssn = W.Essn AND W.Pno = P.Pnumber
  AND  P.Pname = 'ProductX';
```

### Ordering results
```sql
ORDER BY D.Dname DESC, E.Lname ASC, E.Fname ASC;
```

## INSERT, DELETE, UPDATE

### INSERT
- Add one tuple (values in the `CREATE TABLE` order; integrity constraints auto-enforced):
  ```sql
  INSERT INTO EMPLOYEE
    (Fname, Minit, Lname, Ssn, Bdate, Sex, Salary, Dno)
  VALUES ('John','B','Smith','123456789','1965-01-09','M',30000,5);
  ```
- Insert from a query result:
  ```sql
  INSERT INTO D5EMPS
  SELECT * FROM EMPLOYEE WHERE Dno = 5;
  ```
- Bulk load with `CREATE TABLE ... LIKE ... WITH DATA`:
  ```sql
  CREATE TABLE D5EMPS LIKE EMPLOYEE
  (SELECT * FROM EMPLOYEE WHERE Dno = 5) WITH DATA;
  ```

### DELETE
- Removes tuples satisfying `WHERE`; deletes from **one table at a time** (unless `CASCADE`).
- Omitting `WHERE` deletes **all** tuples (empty table).

```sql
DELETE FROM EMPLOYEE WHERE Dno = 5;
```

### UPDATE
- `SET` clause gives new attribute values; `WHERE` selects tuples. Right side of `=` = old value, left side = new value.
```sql
-- U5: move project 10 to Bellaire, dept 5
UPDATE PROJECT
SET    Plocation = 'Bellaire', Dnum = 5
WHERE  Pnumber = 10;

-- U6: 10% raise for Research dept employees
UPDATE EMPLOYEE
SET    Salary = Salary * 1.1
WHERE  Dno IN (SELECT Dnumber FROM DEPARTMENT WHERE Dname = 'Research');
```

## Additional SQL Features (preview)
- Transaction control (`COMMIT`, `ROLLBACK` — Ch. 20).
- Privileges (`GRANT`, `REVOKE` — Ch. 30).
- Triggers (`CREATE TRIGGER` — Ch. 26).
- Physical design (`CREATE INDEX` — Ch. 17).
- Complex queries: nested/subquery, EXISTS, outer joins, grouping/aggregation (Ch. 7).

## Chapter Summary

- SQL = DDL + DML + constraint + view + transaction language; bag semantics by default.
- `CREATE TABLE` defines base tables with data types; constraints: `NOT NULL`, `DEFAULT`, `CHECK`, `PRIMARY KEY`, `UNIQUE`, `FOREIGN KEY ... REFERENCES` with `ON DELETE/UPDATE` actions.
- Queries use `SELECT-FROM-WHERE`; qualify/alias ambiguous attributes; `*`, `DISTINCT`, `LIKE`, `BETWEEN`, arithmetic, `ORDER BY`, set ops (`UNION/EXCEPT/INTERSECT`).
- `INSERT` (single/query/bulk), `DELETE` (one table, all if no WHERE), `UPDATE` (SET + WHERE, old vs new value).
