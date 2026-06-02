# Normal Forms for Context-Free Grammars

A CFG can be transformed into equivalent but structurally simpler forms. These normal forms are essential for parsing algorithms (like CYK) and theoretical proofs.

---

## Eliminating Useless Variables

A symbol is **useful** if it appears in some derivation $S \Rightarrow^* \alpha X \beta \Rightarrow^* w$ (from start to terminal string). Otherwise it is **useless**.

### Two Kinds of Uselessness

#### 1. Variables That Derive Nothing
Example: $S \to AB,\; A \to aA \mid a,\; B \to AB$

$B$ can never derive a terminal string (every production for $B$ contains $B$ itself). $S$ also derives nothing because it depends on $B$.

**Discovery Algorithm**:
- **Basis**: If $A \to w$ where $w \in \Sigma^*$, then $A$ derives something
- **Induction**: If $A \to X_1X_2\ldots X_k$ and all $X_i$ either are terminals or already discovered variables, then $A$ derives something
- **Elimination**: Remove all undiscovered variables and all productions containing them

**Proof**: Induction on parse tree height — if $A \Rightarrow^* w$, then $A$ will be discovered in at most $h$ rounds where $h$ is the tree height.

#### 2. Unreachable Symbols

A symbol is **reachable** if it appears in some sentential form derived from $S$.

**Discovery Algorithm**:
- **Basis**: $S$ is reachable
- **Induction**: If $A$ is reachable and $A \to \alpha$, then all symbols in $\alpha$ are reachable
- **Elimination**: Remove unreachable symbols and their productions

### Correct Two-Step Elimination
**Important**: Eliminate non-deriving variables FIRST, then unreachable symbols. Doing it in reverse order can leave useless symbols.

Why: Eliminating non-deriving variables may make previously reachable symbols unreachable.

---

## Eliminating $\varepsilon$-Productions

A production of the form $A \to \varepsilon$ is called an $\varepsilon$-production.

Goal: Eliminate all $\varepsilon$-productions (except possibly $S \to \varepsilon$ if $\varepsilon \in L(G)$).

### Nullable Symbols
$A$ is **nullable** if $A \Rightarrow^* \varepsilon$.

**Discovery Algorithm**:
- **Basis**: If $A \to \varepsilon$, $A$ is nullable
- **Induction**: If $A \to X_1X_2\ldots X_k$ and ALL $X_i$ are nullable, then $A$ is nullable

### Elimination Method

**Key idea**: Turn each production $A \to X_1X_2\ldots X_k$ into a family of productions — for each subset of nullable $X_i$, create a version where those symbols are omitted.

Example: $S \to AB,\; A \to aA \mid \varepsilon,\; B \to bB \mid A$

- Nullable: $A$ (because of $A \to \varepsilon$), then $B$ (because $B \to A$), then $S$ (because $S \to AB$)
- New productions for $S$: $S \to AB \mid A \mid B$ (omit $A$, omit $B$, omit both — but $S \to \varepsilon$ removed)
- $A$: $A \to aA \mid a$ (omit nullable $A$ in body)
- $B$: $B \to bB \mid b \mid A$

### Handling $\varepsilon \in L(G)$

If $\varepsilon$ is in the language, we introduce a new start symbol $S_0$ with productions $S_0 \to S \mid \varepsilon$. The rest of the grammar has no $\varepsilon$-productions.

---

## Eliminating Unit Productions

A **unit production** is one whose body consists of a single variable: $A \to B$.

### Finding Unit Pairs
Compute all pairs $(A, B)$ such that $A \Rightarrow^* B$ using only unit productions.

**Algorithm**: Find all such pairs by transitive closure.
- **Basis**: $(A, A)$ is a unit pair for all $A$
- **Induction**: If $(A, B)$ is a unit pair and $B \to C$, then $(A, C)$ is a unit pair

### Elimination
For each unit pair $(A, B)$, add all non-unit productions of $B$ to $A$:
- If $B \to \alpha$ (where $\alpha$ is not a single variable), add $A \to \alpha$

Remove all unit productions.

---

## Chomsky Normal Form (CNF)

A CFG is in **Chomsky Normal Form** if every production is of the form:
1. $A \to BC$ (two variables)
2. $A \to a$ (single terminal)

(Plus $S \to \varepsilon$ allowed if $\varepsilon \in L(G)$)

### CNF Theorem
**Every CFL** (without $\varepsilon$) **has a grammar in CNF.**

### Proof (Construction)

**Step 0** ($\varepsilon$ handling): If $\varepsilon$ is in the language, handle with $S_0 \to S \mid \varepsilon$.

**Step 1** (Clean grammar): Eliminate useless variables, $\varepsilon$-productions, and unit productions. Now every production body is either a single terminal or a string of $\ge 2$ symbols.

**Step 2**: For every terminal $a$ that appears in a body of length $> 1$, create a new variable $A$ with production $A \to a$, and replace $a$ by $A$ in all longer bodies.

Example: $A \to BcDe$ → create $C \to c$, $E \to e$, then $A \to BC DE$

**Step 3**: Break right sides longer than 2 into a chain of productions, each with two variables.

Example: $A \to BCDE$ → $A \to B C_1,\; C_1 \to C D_1,\; D_1 \to DE$

### Significance of CNF
- Every derivation of a string of length $n$ uses exactly $2n - 1$ steps
- Parse trees are binary — every interior node has exactly 2 children
- Enables the CYK parsing algorithm ($O(n^3)$)
