# Introduction

## Why Data Mining?

- The **explosive growth of data**: from terabytes to petabytes, driven by automated data collection tools, database systems, the Web, and a computerized society. Major sources:
  - **Business**: e-commerce, transactions, stocks, loyalty cards.
  - **Science**: remote sensing, bioinformatics, scientific simulation, high-energy physics.
  - **Society**: news, digital photos, video, social media.
- The core paradox: *"We are drowning in data, but starving for knowledge!"*
- **Necessity is the mother of invention** — data mining automates the analysis of massive data sets.

### Evolution of Sciences
1. **Before 1600** — empirical science (observation only).
2. **1600–1950s** — theoretical science (models generalize understanding).
3. **1950s–1990s** — computational science (simulation; grew from inability to find closed-form solutions).
4. **1990s–now** — **data science / data-intensive discovery**: floods of data, cheap petabyte storage, the Internet/Grid making archives universally accessible. Scientific tasks (acquisition, organization, query, visualization) now scale almost linearly with data volume.

### Evolution of Database Technology
- **1960s**: data collection, IMS, network DBMS.
- **1970s**: relational model, relational DBMS.
- **1980s**: RDBMS, extended-relational/OO/deductive DBMS, application-oriented DBMS.
- **1990s**: data mining, data warehousing, multimedia & web databases.
- **2000s**: stream data management, web tech (XML, data integration), global information systems.

## What Is Data Mining?

- **Data mining (knowledge discovery from data)**: the extraction of interesting (non-trivial, implicit, previously unknown, and potentially useful) patterns or knowledge from huge amounts of data.
- **Misnomer warning**: not everything called "data mining" is mining. Simple search/query processing and deductive expert systems are *not* data mining.
- Alternative names: knowledge discovery (mining) in databases (KDD), knowledge extraction, data/pattern analysis, data archeology, data dredging, information harvesting, business intelligence.

### Knowledge Discovery (KDD) Process
The database/warehouse community view — an iterative pipeline:

```
Data Cleaning → Data Integration → Selection → Transformation
      → Data Mining → Pattern Evaluation → Knowledge Presentation
```

- **Data cleaning**: remove noise and inconsistent data.
- **Data integration**: combine multiple sources (and resolve redundancies).
- **Data selection**: retrieve relevant data for the analysis task.
- **Data transformation**: consolidate into forms suitable for mining (e.g., aggregation, normalization).
- **Data mining**: search for patterns of interest.
- **Pattern evaluation**: identify truly interesting patterns using interestingness measures.
- **Knowledge presentation**: visualize and present knowledge to the user.

The **ML/statistics community view** — a two-stage view:

```
Input Data → Pre-processing (integration, normalization, feature selection,
             dimension reduction)
         → Pattern discovery (association, classification, clustering, outlier)
         → Post-processing (selection, interpretation, visualization)
```

Both views agree mining sits between preprocessing and post-processing. **Data mining is one essential step** within the broader KDD process; it does *not* by itself include cleaning/integration, but in practice is wrapped by them.

### Data Mining in Business Intelligence
Increasing potential to support business decisions (bottom-up):
- **Data sources** (files, web docs, experiments, DBMS) →
- **Data warehousing / preprocessing** →
- **Data exploration** (statistical summary, querying, reporting) →
- **Data mining** →
- **Data presentation / visualization** → **decision making** (end user, business analyst, DBA).

Note: business intelligence often stops at warehousing/cubes/reporting ("data exploration") without true mining; mining tools go further.

## A Multi-Dimensional View of Data Mining

| Dimension | Notes |
|---|---|
| **Data to be mined** | relational, extended-relational, OO, heterogeneous, legacy; data warehouse; transactional; stream; spatiotemporal, time-series, sequence; text & web; multimedia; graphs & social/information networks |
| **Knowledge to be mined** (functions) | characterization, discrimination, association, classification, clustering, trend/deviation, outlier analysis |
| **Techniques utilized** | data-intensive / OLAP, machine learning, statistics, pattern recognition, visualization, high-performance computing |
| **Applications adapted** | retail, telecommunication, banking, fraud, bio-data, stock market, text mining, web mining |

- **Descriptive vs. predictive** mining: descriptive summarizes characteristics of the data (e.g., characterization, clustering, association); predictive models future behavior or unknown labels (e.g., classification, regression, outlier detection).
- Multiple/integrated functions and mining at multiple levels of abstraction.

### What Kinds of Data Can Be Mined?
Database-oriented (relational, warehouse, transactional) plus advanced data sets: data streams/sensor, time-series/temporal/sequence (incl. bio-sequences), graphs/social networks/multi-linked data, object-relational, heterogeneous/legacy, spatial & spatiotemporal, multimedia, text, and the World-Wide Web.

## Data Mining Functions

### (1) Generalization
- Information integration & data warehouse construction (cleaning, transformation, multidimensional model).
- Data cube technology; scalable methods for materializing multidimensional aggregates.
- OLAP; multidimensional concept description (characterization & discrimination) — generalize, summarize, contrast data (e.g., dry vs. wet region).

### (2) Association and Correlation Analysis
- **Frequent patterns / frequent itemsets**: items often purchased together (or subsequences / substructures in sequences/graphs).
- Association vs. causality: strongly associated $\neq$ causal.
- Typical rule: `Diaper → Beer [0.5%, 75%]` (support = 0.5%, confidence = 75%).
- Correlation measures (e.g., lift, $\chi^2$) capture whether $A$ and $B$ are independent.
- Open questions: how to mine efficiently at scale; how to use patterns for classification/clustering.

### (3) Classification
- Construct a model (function) from training examples to predict unknown **class labels** (discrete target).
- Methods: decision trees, naïve Bayes, SVM, neural networks, rule-based, pattern-based, logistic regression, k-NN, ensemble.
- Applications: credit-card fraud, direct marketing, classifying stars/diseases/web-pages.

### (4) Cluster Analysis
- **Unsupervised**: class labels unknown. Group data into new categories (clusters).
- Partitioning criterion: maximize intra-cluster similarity & minimize inter-cluster similarity.
- Many methods (partitional, hierarchical, density-based) and applications (e.g., cluster houses to find distribution patterns).

### (5) Outlier Analysis
- **Outlier**: a data object that does not comply with the general behavior of the data.
- "One person's garbage could be another person's treasure" — outliers may be noise *or* the most interesting finding (fraud, rare events, intrusions).
- Methods: by-product of clustering/regression (distance/deviation), or dedicated statistical/density/angle techniques.

### Time, Ordering: Sequential Pattern, Trend & Evolution
- Trend and deviation analysis (regression, value prediction).
- Sequential pattern mining (`buy digital camera → buy SD cards`); periodicity; motifs (approximate/consecutive) in bio-sequences; data-stream mining (ordered, time-varying, potentially infinite).

### Structure and Network Analysis
- **Graph mining**: frequent subgraphs (chemical compounds), trees (XML), web fragments.
- **Information network analysis**: actors (nodes) and relationships (edges) — author networks, terrorist networks; links carry semantic info (link mining).
- **Web mining**: PageRank → Google; community discovery, opinion mining, usage mining.

## Evaluation of Knowledge (Interestingness)

Not all mined patterns are interesting. Some only fit a particular dimension/time/location; some are not representative or are transient.

- **Descriptive interestingness**: simplicity, conciseness, coverage, typicality.
- **Predictive interestingness**: accuracy, precision, recall, lift on test data.
- **Typicality vs. novelty**, **accuracy**, **timeliness**, **potential usefulness**, **certainty**.
- Goal: directly mine only interesting knowledge (pattern- or constraint-guided mining) to avoid drowning users in irrelevant rules.

## Confluence of Multiple Disciplines

Data mining sits at the intersection of:

```
        Machine Learning ──┐
        Statistics ────────┼──► Data Mining ◄── Applications
        Pattern Recognition │      ▲
        Visualization ──────┤      │
        High-Performance    │   Algorithm
        Computing ─────────┤
        Database Technology┘
```

**Why confluence?** Tremendous data volume (terabytes), high dimensionality (microarrays: tens of thousands of dims), and high complexity (streams, sequences, graphs, heterogeneous/legacy, spatial, multimedia, text/web, software/simulation). New sophisticated applications demand scalable, robust methods.

## Applications of Data Mining

- Web page analysis: classification → clustering → PageRank/HITS.
- Collaborative analysis & recommender systems.
- Basket-data analysis for targeted marketing.
- Biological/medical: classification, microarray clustering, sequence & network analysis.
- Data mining in software engineering (fault prediction, clone detection).
- From dedicated tools (SAS, MS SQL Server Analysis Manager, Oracle Data Mining) to *invisible* data mining.

## Major Issues in Data Mining

### Mining Methodology
- Mine various and new kinds of knowledge.
- Mine in multi-dimensional space; handle noise, uncertainty, incompleteness.
- Pattern evaluation and pattern-/constraint-guided mining.
- Boost discovery power in networked environments.

### User Interaction
- Interactive mining; incorporation of background knowledge; clear presentation & visualization.
- Query languages for data mining (e.g., DMQL).

### Efficiency and Scalability
- Algorithms must scale to terabytes: parallel, distributed, stream, incremental mining.
- Complexity matters: time $O(\cdot)$ and space $O(\cdot)$, and sensitivity to dimensionality.

### Diversity of Data Types
- Complex types (streams, sequences, graphs, multimedia); dynamic, networked, global repositories.

### Data Mining and Society
- Social impacts; **privacy-preserving data mining**; invisible data mining; fairness and bias.

## Brief History & Community

- 1989 IJCAI Workshop on KDD; KDD book (Piatetsky-Shapiro & Frawley, 1991).
- 1995–98 KDD conferences; *Journal of Data Mining and Knowledge Discovery* (1997).
- ACM SIGKDD conferences since 1998; SIGKDD Explorations; ACM TKDD (2007).
- Related conferences: PAKDD, PKDD, SIAM SDM, IEEE ICDM, ECML-PKDD, WSDM.
- Reference venues: SIGMOD/VLDB/ICDE (DB), SIGIR/WWW (Web/IR), ICML/NIPS (ML), CVPR (PR), DMKD, IEEE TKDE.

## Summary

Data mining = discovering interesting patterns and knowledge from massive data; a natural evolution of database technology with wide demand and applications. The KDD process includes cleaning, integration, selection, transformation, mining, pattern evaluation, and knowledge presentation. It operates on many data types; functions span characterization, discrimination, association, classification, clustering, outlier and trend analysis. It is inherently interdisciplinary and raises methodological, interactive, scalability, data-diversity, and societal issues.
