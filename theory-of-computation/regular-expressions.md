# Regular Expressions and Regular Languages

## Regular Expressions (RE)

A regular expression describes a regular language using operators:
- **Union** ($R + S$ or $R \mid S$): $L(R + S) = L(R) \cup L(S)$
- **Concatenation** ($RS$): $L(RS) = \{xy \mid x \in L(R), y \in L(S)\}$
- **Kleene Star** ($R^*$): $L(R^*) = \bigcup_{i \ge 0} L(R)^i = \{\varepsilon\} \cup L(R) \cup L(RR) \cup \cdots$

### Examples
- $L(01) = \{01\}$
- $L(01 + 0) = \{01, 0\}$
- $L(0^*) = \{\varepsilon, 0, 00, 000, \ldots\}$
- $L(0^*1^*) = \{0^i 1^j \mid i, j \ge 0\}$

---

## Converting RE to $\varepsilon$-NFA

**Theorem**: For every regular expression, there is an $\varepsilon$-NFA that accepts the same language.

**Proof by induction** on the number of operators in the RE. Each constructed $\varepsilon$-NFA has exactly:
- One start state (no incoming arcs)
- One accepting state (no outgoing arcs)

### Basis ($0$ operators)
- **Symbol $a$**: Two states connected by a transition on $a$

### Induction

**Union** ($R + S$):
- Take $\varepsilon$-NFAs for $R$ and $S$
- Add new start and final states
- $\varepsilon$-transitions from new start to $R$ and $S$ start states
- $\varepsilon$-transitions from $R$ and $S$ final states to new final state

**Concatenation** ($RS$):
- Take $\varepsilon$-NFAs for $R$ and $S$
- Merge $R$'s final state with $S$'s start state (via $\varepsilon$-transition)

**Kleene Star** ($R^*$):
- Add new start and final states
- $\varepsilon$-transition from new start to $R$ start, from $R$ final to new final
- $\varepsilon$-transition from new start to new final (for $\varepsilon$ in $R^*$)
- $\varepsilon$-transition from $R$ final back to $R$ start (for repetition)

---

## Converting DFA to Regular Expression

### $k$-Path Method

States of the DFA are named $1, 2, \ldots, n$. A **$k$-path** is a path through the transition graph that goes through no intermediate state numbered higher than $k$.

Let $R_{ij}^{(k)}$ = regular expression for the set of strings that take the DFA from state $i$ to state $j$ using only $k$-paths.

### Recursive Construction
- **Base** ($k = 0$): $R_{ij}^{(0)}$ is:
  - The union of labels of arcs from $i$ to $j$, or $\emptyset$ if none
  - Plus $\varepsilon$ if $i = j$

- **Induction**: $R_{ij}^{(k)} = R_{ij}^{(k-1)} + R_{ik}^{(k-1)} (R_{kk}^{(k-1)})^* R_{kj}^{(k-1)}$

  Intuitively: go from $i$ to $j$ either without using state $k$, or go to $k$, loop at $k$ zero or more times, then go from $k$ to $j$.

### Final RE
The language of the DFA = $\bigcup_{q_j \in F} R_{1j}^{(n)}$, where $n$ is the number of states and 1 is the start state.

---

## Equivalence of RE and Finite Automata

We now have a complete cycle:
$$\text{RE} \xrightarrow{\text{induction}} \varepsilon\text{-NFA} \xrightarrow{\text{$\varepsilon$-removal}} \text{NFA} \xrightarrow{\text{subset construction}} \text{DFA} \xrightarrow{\text{$k$-path}} \text{RE}$$

All four representations define exactly the same class — **regular languages**.

---

## Closure Properties of Regular Languages

Regular languages are closed under:
- **Union**: Take RE $R$ for $L_1$, $S$ for $L_2$, then $R + S$ for $L_1 \cup L_2$
- **Concatenation**: $RS$ for $L_1 L_2$
- **Kleene Star**: $R^*$ for $L_1^*$
- **Intersection**: Product construction of DFAs
- **Complement**: Swap final/non-final states in DFA
- **Difference**: $L_1 - L_2 = L_1 \cap \overline{L_2}$
- **Reversal**: Reverse all transitions, swap start/final, convert NFA to DFA
- **Homomorphism**: Replace each symbol $a$ by the RE for $h(a)$
- **Inverse Homomorphism**: Modify DFA transition function

---

## Proving Non-Regularity: Pumping Lemma for Regular Languages

**Statement**: If $L$ is regular, then there exists $n \ge 1$ (pumping length) such that for all $w \in L$ with $|w| \ge n$, we can write $w = xyz$ where:
1. $|xy| \le n$
2. $|y| > 0$ (non-empty pumpable portion)
3. For all $k \ge 0$, $xy^kz \in L$

**Intuition**: A DFA with $n$ states, when processing a string of length $\ge n$, must repeat a state (pigeonhole principle). The substring between occurrences can be pumped.

### Strategy for Proving Non-Regularity
1. **Assume** $L$ is regular. Let $n$ be the PL constant.
2. **Choose** $w \in L$ with $|w| \ge n$ (carefully — must work for ALL legal decompositions)
3. **Consider** any decomposition $w = xyz$ with $|xy| \le n$ and $|y| > 0$
4. **Find** $k$ such that $xy^kz \notin L$
5. **Contradiction** — $L$ is not regular

### Classic Non-Regular Examples
- $L = \{0^n 1^n \mid n \ge 1\}$: Pick $w = 0^n 1^n$. Since $|xy| \le n$, $y$ consists of only 0's. Pumping gives $0^{n+|y|(k-1)}1^n \notin L$ for $k \neq 1$.
- $L = \{w \mid w \text{ has equal number of } 0 \text{ and } 1\}$: Same idea, $y$ is all 0's.
- $L = \{0^i 1^j \mid i > j\}$: Pick $w = 0^{n+1} 1^n$. Pumping down ($k = 0$) removes 0's, giving at most $n$ zeros and $n$ ones — contradiction.
