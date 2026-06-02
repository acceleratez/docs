# Finite Automata

## Why Study Automata Theory

Automata are the mathematical model of computers and computing systems. They are essential for studying:
- **Computability (Decidability)**: What can a computer do at all?
- **Complexity (Intractability)**: What can a computer do efficiently?

Other applications:
- Design and verification of circuits and communication protocols
- Text-processing applications (lexical analysis, pattern matching)
- Important component of compilers
- Describing simple patterns of events

## Central Concepts

### Alphabets
An alphabet is any finite set of symbols. Examples: ASCII, Unicode, $\{0, 1\}$ (binary), $\{a, b, c\}$, $\{s, o\}$ (tennis), set of signals used by a protocol.

### Strings
A string over alphabet $\Sigma$ is a list of elements from $\Sigma$.
- $\Sigma^*$ = set of all strings over alphabet $\Sigma$.
- The length of a string is its number of positions.
- $\varepsilon$ denotes the empty string (length 0).

### Languages
A language is a subset of $\Sigma^*$ for some alphabet $\Sigma$.

Example: $L = \{\varepsilon, 0, 1, 00, 01, 10, 000, 001, 010, 100, 101, ...\}$ — set of strings of 0's and 1's with no two consecutive 1's.

### Problems
A problem is the question of deciding whether a given string is a member of some particular language. **Languages and problems are really the same thing.** When we assign semantics to strings (e.g., strings coding graphs, logical expressions, or integers), we tend to think of a set of strings as a problem.

---

## Deterministic Finite Automata (DFA)

A DFA consists of:
1. A finite set of states ($Q$)
2. An input alphabet ($\Sigma$)
3. A transition function ($\delta: Q \times \Sigma \to Q$)
4. A start state ($q_0 \in Q$)
5. A set of final/accepting states ($F \subseteq Q$)

### The Transition Function
$\delta(q, a)$ = the state that the DFA goes to when it is in state $q$ and input $a$ is received. Always a next state — add a dead state if no transition exists.

### Graph Representation of DFA
- Nodes = states.
- Arcs represent transition function — arc from state $p$ to state $q$ labeled by all input symbols with transitions from $p$ to $q$.
- Arrow labeled "Start" points to the start state.
- Final states indicated by double circles.

### Examples

**Recognizing Strings Ending in "ing"**:
- State "nothing" → "saw i" → "saw in" → "saw ing" (accepting)
- On 'i': transition from nothing to "saw i". On 'n': "saw i" to "saw in". On 'g': "saw in" to "saw ing".

**Strings with No 11** (3 states):
- State A: string so far has no 11, does not end in 1 (start + accept state)
- State B: string so far has no 11, but ends in a single 1 (accept state)
- State C: consecutive 1's have been seen (dead state)

### Transition Table Representation

An alternative to the graph: rows = states, columns = input symbols, each entry is $\delta(\text{row}, \text{column})$. Final states starred, start state marked with arrow.

For the "No 11" example:

| State | 0 | 1 |
|---|---|---|
| $\to$*A | A | B |
| *B | A | C |
| C | C | C |

### Extended Transition Function $\hat{\delta}$

We extend $\delta$ to handle strings:
- Basis: $\hat{\delta}(q, \varepsilon) = q$
- Induction: $\hat{\delta}(q, wa) = \delta(\hat{\delta}(q, w), a)$

### Language of a DFA

$L(A) = \{ w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F \}$

### Proving Set Equivalence

To prove that the language of a DFA equals a given description, we prove two directions:
1. $S \subseteq T$: Every string accepted by the DFA satisfies the description (induction on state reached)
2. $T \subseteq S$: Every string satisfying the description is accepted by the DFA (often via contrapositive)

Example proof for "No 11" language:
- **Part 1** ($S \subseteq T$): Induction on string length — show $\hat{\delta}(A, w) = A$ or $B$ implies $w$ has no 11 and is in the correct ending state
- **Part 2** ($T \subseteq S$): Contrapositive — if a string is NOT accepted, then it has consecutive 1's. Induction on the first violation.

---

## Nondeterministic Finite Automata (NFA)

A nondeterministic finite automaton has the ability to be in several states at once. You may think of it as "branching" computation.

### Formal NFA
- Finite set of states $Q$
- Input alphabet $\Sigma$
- **Transition function** $\delta(q, a)$ returns a **set** of states (not a single state)
- Start state $q_0$
- Final states $F$

### Language of an NFA
$L(N) = \{ w \mid \hat{\delta}(q_0, w) \cap F \neq \emptyset \}$

A string $w$ is accepted if at least one path leads to a final state.

### Example: Chessboard NFA
States = squares. Input $\{r, b\}$ (red, black). The NFA accepts sequences of moves that reach certain squares (accepting states). An accepted sequence: $rbb$.

---

## Equivalence of DFA and NFA

**Surprising result**: For any NFA, there is a DFA that accepts the same language.

### Subset Construction (Rabin-Scott)

Given NFA with states $Q$, we construct DFA where:
- **States**: subsets of $Q$ ($2^{|Q|}$ possible states)
- **Start state**: $\{q_0\}$
- **Final states**: any subset containing at least one NFA final state
- **Transition**: $\delta_D(S, a) = \bigcup_{q \in S} \delta_N(q, a)$

**Critical point**: DFA state names are sets of NFA states. But the DFA is a real DFA — its transition function takes one state and one symbol to exactly one state.

### Proof of Equivalence
We prove by induction on $|w|$:
$$\hat{\delta}_D(\{q_0\}, w) = \hat{\delta}_N(q_0, w)$$

So $w$ is accepted by the DFA iff the set of states reached is a final state iff it contains an NFA final state iff $w$ is accepted by the NFA.

---

## NFA with $\varepsilon$-Transitions ($\varepsilon$-NFA)

We can allow state-to-state transitions on **$\varepsilon$** (empty input). These are "spontaneous" moves — no input symbol consumed.

### $\varepsilon$-Closure
$ECLOSE(q)$ = set of states reachable from $q$ using only $\varepsilon$-transitions (including $q$ itself).

### Extended $\hat{\delta}$ for $\varepsilon$-NFA
- Basis: $\hat{\delta}(q, \varepsilon) = ECLOSE(q)$
- Induction: $\hat{\delta}(q, w a) = ECLOSE\left(\bigcup_{p \in \hat{\delta}(q, w)} \delta(p, a)\right)$

### Removing $\varepsilon$-Transitions
For every pair of states, if there is a path with $\varepsilon$ then a symbol $a$, add a direct transition on $a$. Every $\varepsilon$-NFA can be converted to an equivalent NFA.

### Full Equivalence
$$\text{DFA} \equiv \text{NFA} \equiv \varepsilon\text{-NFA} \equiv \text{RE}$$

All three FA models accept exactly the same class of languages: **regular languages**.

---

## Regular Languages

A language $L$ is **regular** if it is the language of some DFA (equivalently, some NFA, some $\varepsilon$-NFA, some RE).

### Examples of Nonregular Languages
- $L_1 = \{0^n 1^n \mid n \ge 1\}$ — equal number of 0's and 1's (requires "memory")
- $L_2 = \{w \mid w \text{ is balanced parentheses}\}$ — nested structure

### Examples of Regular Languages
- $L_3 = \{w \in \{0,1\}^* \mid w \text{ viewed as binary integer is divisible by } 5\}$ — 5-state DFA (remainders 0–4)
- $L_4 = \{w \mid w \text{ has no two consecutive 1's}\}$ — 3-state DFA
- $L_5 = \{w \mid w \text{ contains substring "ing"}\}$ — 4-state DFA
