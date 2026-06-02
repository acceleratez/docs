# Pushdown Automata

A pushdown automaton (PDA) is essentially an $\varepsilon$-NFA with a stack. The stack provides unlimited memory, making PDAs more powerful than finite automata.

---

## Formal Definition

A PDA is a 7-tuple $P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$:
- $Q$: finite set of states
- $\Sigma$: input alphabet
- $\Gamma$: stack alphabet
- $\delta$: transition function $Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to$ finite subsets of $Q \times \Gamma^*$
- $q_0 \in Q$: start state
- $Z_0 \in \Gamma$: initial stack symbol
- $F \subseteq Q$: accepting states

### Transition Meaning
$\delta(q, a, X) = \{(p, \gamma)\}$ means:
> In state $q$, reading input $a$, with $X$ on top of stack, go to state $p$ and replace $X$ by $\gamma$ on the stack.

- If $a = \varepsilon$: move allowed without consuming input (spontaneous)
- If $\gamma = \varepsilon$: pop $X$ (push nothing)
- If $\gamma = YZ$: push $Z$, then $Y$ (convention: leftmost symbol goes on top)

---

## Instantaneous Descriptions (ID)

$(q, w, \alpha)$ represents:
- State $q$
- Remaining input $w$
- Stack contents $\alpha$ (top at left)

### Moves
$(q, aw, X\beta) \vdash (p, w, \gamma\beta)$ if $(p, \gamma) \in \delta(q, a, X)$

$\vdash^*$ = zero or more moves.

---

## Two Notions of Acceptance

### Acceptance by Final State
$$L(P) = \{ w \mid (q_0, w, Z_0) \vdash^* (q, \varepsilon, \alpha) \text{ for some } q \in F, \alpha \in \Gamma^* \}$$

The PDA accepts if, after reading all input, it reaches a final state (stack contents irrelevant).

### Acceptance by Empty Stack
$$N(P) = \{ w \mid (q_0, w, Z_0) \vdash^* (q, \varepsilon, \varepsilon) \}$$

The PDA accepts if, after reading all input, the stack is empty (final state irrelevant).

### Equivalence
These two notions are equivalent. Given a PDA accepting by final state, we can construct one accepting by empty stack (and vice versa).

---

## Equivalence of PDA and CFG

**Theorem**: A language is context-free **iff** it is accepted by some PDA.

### Direction 1: CFG $\to$ PDA

Let $L = L(G)$ for some CFG $G$. Construct PDA $P$ that simulates **leftmost derivations**.

**Intuition**: At each step, $P$ represents some left-sentential form (LSF) that has already been partially matched against the input. The stack stores the unmatched suffix of the LSF (variables and terminals, with leftmost at top).

**Transition function**:
1. **Type 1**: $\delta(q, a, a) = \{(q, \varepsilon)\}$ for $a \in \Sigma$
   - Match input symbol with terminal on top of stack
2. **Type 2**: For each production $A \to \alpha$:
   $\delta(q, \varepsilon, A) = \{(q, \alpha)\}$
   - Expand variable by its production body (replace $A$ with $\alpha$ on stack)

**Proof of correctness**: We prove $(q, wx, S) \vdash^* (q, x, \alpha)$ iff $S \Rightarrow^*_{lm} w\alpha$ (leftmost derivation).

This ensures $L(P) = L(G)$.

### Direction 2: PDA $\to$ CFG

Given PDA $P$ accepting by empty stack, construct CFG $G$.

**Key idea**: Variables of $G$ are of the form $[pXq]$, representing:
> Starting in state $p$ with $X$ on top of stack, eventually pop $X$ and reach state $q$ (with empty stack relative to $X$).

**Productions**:
- **Basis**: If $(r, \varepsilon) \in \delta(p, a, X)$, then $[pXr] \to a$ (pop $X$ in one move)
- **One intermediate**: If $(r, Y) \in \delta(p, a, X)$, then $[pXq] \to a[rYq]$ for all states $q$
- **Two intermediate**: If $(r, YZ) \in \delta(p, a, X)$, then $[pXq] \to a[rYs][sZq]$ for all states $s, q$
- **General**: If $(r, Y_1Y_2\ldots Y_k) \in \delta(p, a, X)$, we need variables for each intermediate state

**Start symbol**: $S$ with productions $S \to [q_0 Z_0 q]$ for all states $q$.

**Proof**: $(q_0, w, Z_0) \vdash^* (p, \varepsilon, \varepsilon)$ iff $[q_0 Z_0 p] \Rightarrow^* w$.

---

## Properties of Context-Free Languages

### Decision Properties

Given a CFG (or PDA), we can decide:
1. **Emptiness**: Is $L(G) = \emptyset$? — Check if start symbol is a "useful" variable (derives some terminal string). Solved during useless-variable elimination.
2. **Membership**: Is $w \in L(G)$? — Use the **CYK algorithm**, $O(n^3)$ where $n = |w|$.
3. **Infiniteness**: Is $L(G)$ infinite? — Similar to regular languages: find if there is a cycle in the variable dependency graph that generates non-empty strings.

#### Non-Decision Properties (Undecidable)
Questions that **cannot** be decided for CFLs (but can for regular languages):
- Are two CFLs equal? ($L(G_1) = L(G_2)$)
- Are two CFLs disjoint? ($L(G_1) \cap L(G_2) = \emptyset$)
- Is a CFL equal to $\Sigma^*$?
- Is the complement of a CFL also context-free?

These require Turing machine theory to prove.

### CYK Algorithm (Cocke-Younger-Kasami)

**Input**: A CFG $G$ in CNF and string $w = a_1 a_2 \ldots a_n$.
**Output**: Whether $w \in L(G)$.

**Dynamic Programming approach**: Let $X_{ij}$ be the set of variables that derive $a_i a_{i+1} \ldots a_j$.

- **Basis** ($j = i$): $X_{ii} = \{ A \mid A \to a_i \text{ is a production} \}$
- **Induction** ($i < j$): $X_{ij} = \{ A \mid A \to BC, \text{ and } \exists k, i \le k < j: B \in X_{ik}, C \in X_{k+1,j} \}$
- **Accept**: $w \in L(G)$ iff $S \in X_{1n}$

The algorithm fills an $n \times n$ table bottom-up. Time complexity: $O(n^3)$.

### Closure Properties

CFLs are **closed** under:
- **Union** ($L \cup M$): Add $S \to S_L \mid S_M$ to combined grammar
- **Concatenation** ($LM$): Add $S \to S_L S_M$ to combined grammar
- **Kleene Star** ($L^*$): Add $S \to S_L S \mid \varepsilon$
- **Reversal** ($L^R$): Reverse all right sides in productions
- **Homomorphism** ($h(L)$): Replace each terminal $a$ by $h(a)$
- **Substitution**: Replace each terminal $a$ by $L_a$ (a CFL)
- **Inverse Homomorphism** ($h^{-1}(L)$): Use PDA construction — buffer $h(a)$ in finite control

CFLs are **NOT closed** under:
- **Intersection**: $\{0^n 1^n 2^n\}$ is intersection of two CFLs ($\{0^n 1^n 2^i\}$ and $\{0^i 1^n 2^n\}$), but is not context-free
- **Complement**: If closed, intersection would be closed ($L_1 \cap L_2 = \overline{\overline{L_1} \cup \overline{L_2}}$)
- **Difference**: Similar argument

However, the intersection of a CFL with a **regular language** IS a CFL (simulate DFA and PDA in parallel — product construction with stack from PDA).

---

## Deterministic PDA (DPDA)

A PDA is **deterministic** if for every configuration, at most one move is possible:
1. For each $q, a, X$, at most one choice (including $\varepsilon$-moves)
2. If $\delta(q, \varepsilon, X) \neq \emptyset$, then $\delta(q, a, X) = \emptyset$ for all $a \in \Sigma$

DPDAs accept a proper subclass of CFLs called **deterministic CFLs** (DCFLs). DCFLs are important because they can be parsed efficiently (LR parsers). DCFLs are closed under complement.
