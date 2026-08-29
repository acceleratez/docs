# Data Warehousing and OLAP

## What Is a Data Warehouse?

**Definition (Inmon)**: a **subject-oriented, integrated, time-variant, and non-volatile** collection of data in support of management's decision-making process.

- **Subject-oriented**: organized around major subjects (customer, product) not transaction apps.
- **Integrated**: consistent naming, units, encoding across sources.
- **Time-variant**: explicitly stores time history (e.g., 5–10 yrs).
- **Non-volatile**: data loaded, then read-only (no on-line update/delete).

### Operational DB vs Data Warehouse
| Aspect | Operational DB | Data Warehouse |
|---|---|---|
| Purpose | day-to-day operations | decision support / analysis |
| Data | current, up-to-date | historical, summarized |
| Model | ER, application-specific | star/snowflake, subject-oriented |
| Access | many short transactions | few long analytical queries |
| Update | frequent insert/update | periodic load, read-only |

### Why Not Just Query the DB?
- OLTP systems are tuned for transactions, not multi-dimensional aggregate scans.
- Separate warehouse avoids hurting production performance and provides a cleaner, integrated, historical view.

## Data Warehouse Architecture (Conceptual)
```
Data sources → Extraction-Transformation-Loading (ETL) → Data Warehouse
   (internal, external,     (clean, integrate,         → Data Marts
    operational)             aggregate)                      → OLAP server
                                                         → Front-end / BI tools
```
- **ETL**: extraction, transformation (cleaning, integration), loading.
- **Data marts**: department-specific subsets of the warehouse.
- **OLAP server**: consolidates, aggregates, answers multidimensional queries.

## From Tables to Cubes: Multidimensional Data Model

- A **data cube** models data along **dimensions** with **measures** (metrics).
  - **Dimension**: perspective for analysis (time, location, product). Has **members / levels** forming a **concept hierarchy** (day→month→year).
  - **Measure (fact)**: numeric value being analyzed (sales, profit), aggregated by sum/avg/count.
- A **base cuboid** = all dimensions at finest granularity; **apex cuboid** = total aggregate (0 dimension).
- A cube = lattice of cuboids from apex to base; **lattice size** = $\prod_i (L_i+1)$ where $L_i$ = #levels of dimension $i$.

### Star Schema, Snowflake Schema, Fact Constellation
- **Star schema**: one central **fact table** (foreign keys + measures) joined to **dimension tables** (denormalized, flat). Simple & fast.
  ```
  Fact_Sales(salesKey, timeKey, itemKey, locKey, dollar_sold, units_sold)
  Time(timeKey, day, month, quarter, year)
  Item(itemKey, name, brand, category)
  Location(locKey, city, state, country)
  ```
- **Snowflake schema**: dimension tables **normalized** into multiple related tables (saves space, more joins).
- **Fact constellation (galaxy)**: multiple fact tables sharing dimension tables; supports complex multi-subject analysis.

| Schema | Space | Join cost | Readability |
|---|---|---|---|
| Star | larger (redundant) | low | high |
|---|---|---|---|
| Snowflake | smaller | higher | medium |
| Constellation | varies | varies | complex |

## OLAP Operations on the Cube

Let a cube with dimensions: time, item, location; measure: dollars_sold.

- **Roll-up (drill-up)**: summarize data by climbing a concept hierarchy or reducing dimensions (e.g., city → country; or dropping a dimension). **Aggregation**.
- **Drill-down (roll-down)**: reverse — descend hierarchy or add a dimension for finer detail (year → quarter → month). **Specialization**.
- **Slice**: select one value of a dimension, producing a sub-cube (e.g., `time = "Q1"`). Reduces dimensionality by 1.
- **Dice**: select a sub-cube by restricting values on **multiple** dimensions with a Boolean condition (e.g., `time in {Q1,Q2} AND loc in {NY,LA}`).
- **Pivot (rotate)**: reorient the cube (e.g., swap axes) for alternative 2-D presentation.
- **Drill-across / drill-through**: query detail records behind an aggregate (via SQL to operational DB).

## Cube Materialization

- **Full materialization**: store all $N = \prod(L_i+1)$ cuboids — fast query but huge storage.
- **No materialization**: compute on the fly from base — minimal storage, slow.
- **Partial materialization (selected cuboids)**: choose a subset to precompute, optimizing **query cost − storage cost**. This is the practical approach.

### Lattice of Cuboids (example: 3 dims each 2 levels)
With dimensions $A(L_0,L_1)$, etc., cuboids form a lattice ordered by specialization. An **ancestor** cuboid can answer queries of a **descendant** by further aggregation. Materialization picks medoids of this lattice (e.g., keep cuboids of size up to $n$ dimensions).

## Indexing OLAP Data

- **Bitmap indexing**: one bitmap per distinct value of a low-cardinality attribute; very fast AND/OR for OLAP filters.
- **Join indexing**: records (RID, RID) pairs linking fact row to dimension rows, speeding star joins.
- **Bitmap join indexing**: combines both for star schemas.

## Efficient Cube Computation

- **ROLAP (relational OLAP)**: store cubes in relational tables (e.g., as a **star net** of materialized views). Scales to big data.
- **MOLAP (multidimensional OLAP)**: native multidimensional storage (arrays). Fast but sparse/large.
- **HOLAP**: hybrid — aggregates in MOLAP, detail in ROLAP.
- **MultiWay array aggregation**: compute cuboids simultaneously by partitioning the array; exploits **ordering to keep planes in memory** and reduces sorting.
- **BUC (Bottom-Up Cube)**: partition-based, computes from base, pruning with **Apriori-like** minimum support to skip less frequent group-bys.
- **PipeSort / Star-Cubing**: integrate grouping and aggregation with shared sorts / prefix sharing.

## Data Warehouse Usage

- **Information processing**: querying, reporting, table/spreadsheet, drill-down/slice/dice via GUI.
- **Analytical processing (OLAP)**: multidimensional analysis, trend/comparison.
- **Data mining**: confident knowledge discovery (characterization, association, classification, prediction, clustering) on the cube.

## Cube Lattice Size (Worked)

For dimensions with levels (including the apex/all level):
- `time` has 3 levels (day, month, year) → 4 choices including "all".
- `item` has 2 levels (product, category) → 3 choices.
- `location` has 3 levels (city, state, country) → 4 choices.

Number of cuboids in the full lattice = $4 \times 3 \times 4 = 48$. With all dimensions at base it is the **base cuboid**; with none it is the **apex (grand total)** cuboid. A query at any grouping can be answered by aggregating from the smallest stored ancestor cuboid.

## OLAP Operation Examples (SQL-like)

- **Roll-up**: `GROUP BY time.year, location.country` (coarser than `time.month`).
- **Drill-down**: add `time.month` or a new dimension `customer`.
- **Slice**: `WHERE time = 'Q1'` → a 2-D sub-cube.
- **Dice**: `WHERE time IN ('Q1','Q2') AND location IN ('NY','LA')`.
- **Pivot**: rotate axes so `item` is on rows, `location` on columns.

## Data Marts and the Cube

- A **data mart** is a departmental slice of the warehouse (e.g., sales mart, HR mart) — cheaper to build and faster for local users.
- Dependent marts are sourced from the central warehouse; independent marts are built separately (risk of inconsistency — prefer a warehouse-first design).

## Indexing OLAP Data (Detail)

- **Bitmap index**: for a low-cardinality attribute with values $\{v_1..v_m\}$, store $m$ bitmaps of length $n$; a query `gender='F' AND region='West'` is a fast bitwise AND. Space ≈ $n \times m$ bits; ideal when few distinct values.
- **Join index**: maps each fact row to its dimension row RIDs, so star-join filters need no fact scan.
- **Bitmap join index**: pre-joins the bitmap into the dimension, accelerating slice/dice directly.

## Efficient Cube Computation (Detail)

- **MultiWay array aggregation**: stores a cuboid as a multidimensional array, processes cells in an order that keeps "planes" of the array in memory, and computes several cuboids in one pass (shared aggregation).
- **BUC (Bottom-Up Computation)**: recursively partitions the base table by group-bys; uses an **Apriori-like** minimum support to skip rare group-bys early (shared with Ch. 5).
- **Star-Cubing**: integrates sorting (PipeSort), shared dimensions (Star), and iceberg conditions (only frequent aggregates) — good for "iceberg cubes" (with `HAVING count ≥ minsup`).

## ROLAP vs MOLAP vs HOLAP

| Style | Storage | Pros | Cons |
|---|---|---|---|
| ROLAP | relational tables/views | scales, leverages DBMS | slower for heavy aggreg. |
| MOLAP | multidimensional arrays | fastest queries | sparse, big, load cost |
| HOLAP | hybrid | best of both | more complex |

## SQL Cube / Grouping Sets
Modern SQL expresses cuboids directly:
```sql
SELECT time, item, SUM(dollars)
FROM sales
GROUP BY CUBE(time, item);   -- all group-bys including grand total
```
`ROLLUP` gives a hierarchy (year→month→day); `GROUPING SETS` lets you pick exactly which cuboids to materialize (ties to partial materialization).

## Drill-Through & Drill-Across
- **Drill-through**: click an aggregate cell to see the underlying detail rows (SQL to the operational DB).
- **Drill-across**: combine measures from two fact tables that share dimensions.

## Slowly Changing Dimensions (SCD)
- **Type 1**: overwrite (no history).
- **Type 2**: add a new row with effective dates (full history).
- **Type 3**: add a column for previous value (limited history).

## Warehousing Challenges
- Late-arriving / dirty data; ETL performance & monitoring; schema evolution; balancing load frequency against query freshness.

## Iceberg Cubes & Compression
- **Iceberg cube**: materialize only cells whose aggregate satisfies a **HAVING** condition (e.g., `SUM(dollars) ≥ threshold`) — drastically cuts storage for sparse cubes.
- **Closed cube**: skip cuboids implied by others via closure (analogous to closed itemsets) — avoids redundant aggregations.
- **Shell / compressed cubes**: store aggregates at coarse levels plus exceptions, trading some precision for huge space savings.

## Cost of OLAP Operations
- **Roll-up / drill-down** are cheap if the target cuboid is materialized (a lookup); expensive otherwise (must aggregate from a finer stored cuboid or the base).
- **Slice / dice** are selections on materialized cuboids (fast with bitmap/join indexes).
- Materialization policy (which cuboids to precompute) minimizes `query cost − storage cost` over expected workloads.

## Summary

A data warehouse is a subject-oriented, integrated, time-variant, non-volatile repository for decision support, fed by ETL from operational sources and often exposed through data marts. Data is modeled as a **cube** of dimensions and measures, stored in star/snowflake/constellation schemas. **OLAP** lets analysts roll-up, drill-down, slice, dice, and pivot. Because full cube materialization is infeasible, partial materialization plus indexing (bitmap/join) and efficient algorithms (MultiWay, BUC, Star-Cubing, HOLAP) balance query speed against storage.
