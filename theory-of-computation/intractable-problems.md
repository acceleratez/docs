# Intractable Problems

Not all decidable problems are practically solvable. Some require time exponential in input size — they are **intractable**.

---

## Time Complexity Classes

### P (Polynomial Time)
$$P = \bigcup_{k \ge 0} DTIME(n^k)$$

Problems solvable by a deterministic TM in polynomial time. These are generally considered **tractable**.

Examples: sorting ($O(n \log n)$), shortest paths, minimum spanning tree, matrix multiplication, linear programming.

### NP (Nondeterministic Polynomial Time)
$$NP = \bigcup_{k \ge 0} NTIME(n^k)$$

Problems solvable by a nondeterministic TM in polynomial time. Equivalently: problems whose solutions can be **verified** in polynomial time.

Examples: SAT, CLIQUE, Hamiltonian Cycle, Subset Sum, Graph Coloring.

### The Big Question: P = NP?
$$P \subseteq NP \subseteq PSPACE \subseteq EXP$$

Whether $P = NP$ is the most famous open problem in computer science (one of the Clay Millennium Prize problems).

---

## NP-Completeness

A problem $L$ is **NP-complete** if:
1. $L \in NP$
2. For every $L' \in NP$, $L' \leq_P L$ ($L'$ is polynomial-time reducible to $L$)

### Polynomial-Time Reduction
$A \leq_P B$: There exists a polynomial-time computable function $f$ such that:
$$w \in A \iff f(w) \in B$$

If $B$ is in $P$ and $A \leq_P B$, then $A \in P$.  
If $A$ is NP-complete and $A \in P$, then $P = NP$.

---

## Cook-Levin Theorem

**Theorem**: SAT (Boolean Satisfiability) is NP-complete.

This was the first problem proven NP-complete (Cook 1971, Levin 1973).

### Proof Idea
Given a nondeterministic TM $M$ and input $w$, construct a boolean formula $\phi$ that is satisfiable iff $M$ accepts $w$ within $n^k$ steps.

The formula encodes the TM's computation tableau:
- Cell variables: $T_{i,j,s}$ — at time $i$, tape cell $j$ contains symbol $s$
- State variables: $H_{i,j}$ — at time $i$, head is at position $j$
- State variables: $Q_{i,q}$ — at time $i$, TM is in state $q$

The formula asserts:
1. The initial configuration is correct (input $w$ on tape, start state)
2. Each configuration legally follows from the previous one (transition function)
3. At some time step, an accepting state is reached

Since the TM runs in polynomial time, the tableau is polynomial-sized, and the formula can be constructed in polynomial time.

---

## Common NP-Complete Problems

### SAT and Variants
- **SAT**: Given a boolean formula, is it satisfiable?
- **3-SAT**: SAT with exactly 3 literals per clause
- **NAE-3-SAT**: Not-All-Equal 3-SAT

### Graph Problems
- **CLIQUE**: Does $G$ have a clique of size $k$?
- **Vertex Cover**: Does $G$ have a vertex cover of size $k$?
- **Hamiltonian Cycle**: Does $G$ have a cycle visiting every vertex exactly once?
- **TSP** (Traveling Salesman): Visit all cities with total cost $\le B$
- **Graph Coloring**: Can $G$ be colored with $k$ colors?

### Number/Set Problems
- **Subset Sum**: Given numbers, is there a subset summing to target $t$?
- **Partition**: Can a set be partitioned into two equal-sum subsets?
- **Knapsack** (decision version): Can we pack items with total value $\ge V$ under weight limit $W$?
- **Set Cover**: Can we cover all elements with $\le k$ sets?

---

## Proving NP-Completeness

### Standard Recipe
1. Show $L \in NP$: Give a polynomial-time verifier (certificate + checking algorithm)
2. Select a known NP-complete problem $L'$ "close" to $L$
3. Construct a polynomial-time reduction $f$ from $L'$ to $L$
4. Prove correctness: $x \in L' \iff f(x) \in L$

### Reduction Example: 3-SAT $\leq_P$ CLIQUE

Given a 3-CNF formula $\phi = C_1 \land C_2 \land \ldots \land C_k$, construct graph $G$:
- For each literal in each clause, create a vertex
- Connect vertices from different clauses unless they represent contradictory literals ($x$ and $\bar{x}$)
- $G$ has a $k$-clique iff $\phi$ is satisfiable (select one true literal per clause)

---

## Beyond NP

### PSPACE
Problems solvable using polynomial space (no time bound). $NP \subseteq PSPACE$.

**PSPACE-complete** examples:
- TQBF (True Quantified Boolean Formula)
- Generalized Geography
- Equivalence of regular expressions
- Equivalence of NFA

### EXP
Problems requiring exponential time. $PSPACE \subseteq EXP$.

**EXP-complete** examples:
- Generalized Chess, Checkers, Go
- Equivalence of regular expressions with exponentiation

### NEXP
Nondeterministic exponential time.

### The Hierarchy
$$P \subseteq NP \subseteq PSPACE \subseteq EXP \subseteq NEXP$$

We know $P \subsetneq EXP$ (by time hierarchy theorem), so at least one of the inclusions above is strict — but we don't know which one(s).

---

## Coping with Intractability

Since many important problems are NP-complete, we need practical approaches:

### 1. Approximation Algorithms
Find solutions within a guaranteed factor of optimal.
- Vertex Cover: 2-approximation (greedy matching)
- TSP with triangle inequality: 1.5-approximation (Christofides)
- Set Cover: $\ln n$-approximation (greedy)

### 2. Fixed-Parameter Tractability (FPT)
If the "hard" parameter $k$ is small, algorithms like $O(2^k \cdot n)$ may be practical.
- Vertex Cover: $O(1.27^k + kn)$
- Parameterized complexity: FPT $\subseteq$ W[1] $\subseteq$ W[2]...

### 3. Heuristics and Local Search
No guarantees, but often work in practice: genetic algorithms, simulated annealing, tabu search, SAT solvers (DPLL, CDCL).

### 4. Special Cases
Many NP-complete problems become polynomial on restricted inputs:
- 2-SAT (P), Horn-SAT (P)
- Graph coloring on trees (2 colors), bipartite graphs
- TSP on a line, on a tree
