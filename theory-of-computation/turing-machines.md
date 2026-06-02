# Turing Machines

The Turing machine (TM) is the most powerful model of computation. It captures everything that can be computed algorithmically. Unlike finite automata and PDAs, a TM has unlimited memory in the form of an infinite tape.

---

## Formal Definition

A Turing machine is a 7-tuple $M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)$:
- $Q$: finite set of states
- $\Sigma$: input alphabet (does not contain the blank symbol)
- $\Gamma$: tape alphabet ($\Sigma \subset \Gamma$)
- $\delta$: transition function $Q \times \Gamma \to Q \times \Gamma \times \{L, R\}$
- $q_0 \in Q$: start state
- $B \in \Gamma \setminus \Sigma$: blank symbol
- $F \subseteq Q$: halting/final states

### Transition Interpretation
$\delta(q, X) = (p, Y, D)$ means:
> In state $q$, reading symbol $X$ on the tape, write $Y$, move the head in direction $D$ (Left or Right), and go to state $p$.

### Computation Model
- **Infinite tape** divided into cells, each holding one symbol from $\Gamma$
- Initially, the input string $w$ is written at the left end of the tape, preceded and followed by blanks ($B$)
- The tape head starts at the leftmost symbol of the input
- The TM can read, write, and move the head at each step
- The TM halts when it enters a state $q \in F$ (accept) or when $\delta(q, X)$ is undefined (reject)

---

## Instantaneous Description (ID)

An ID is a string $X_1 X_2 \ldots X_{i-1} q X_i X_{i+1} \ldots X_n$ where:
- $q$ is the current state
- The tape head is scanning $X_i$
- Everything to the left and right (up to first infinite blank) is shown

### Moves
$X_1 \ldots X_{i-1} q X_i \ldots X_n \vdash X_1 \ldots X_{i-1} Y p X_{i+1} \ldots X_n$ if $\delta(q, X_i) = (p, Y, R)$

$\vdash^*$ = zero or more moves.

---

## Acceptance and Language

A TM $M$ **accepts** input $w$ if:
$$q_0 w \vdash^* \alpha p \beta \text{ for some } p \in F$$

$L(M)$ = set of strings accepted by $M$.

### Recursive vs. Recursively Enumerable (RE)

- **$L$ is recursively enumerable (RE)**: There exists a TM that accepts $L$. If $w \notin L$, the TM may run forever (not halt).
- **$L$ is recursive (decidable)**: There exists a TM that accepts $L$ AND halts on **all** inputs (both $w \in L$ and $w \notin L$).

$$\text{Recursive} \subsetneq \text{RE} \subsetneq \text{All languages}$$

---

## Variations of Turing Machines (All Equivalent)

### Multi-Tape TM
Has $k$ tapes, each with its own head. Transition: $\delta(q, X_1, \ldots, X_k) = (p, Y_1, D_1, \ldots, Y_k, D_k)$.

**Equivalence**: Can be simulated by a single-tape TM using tracks or interleaving. $k$ tapes → $k$ tracks on one tape, with markers for head positions. Simulation overhead: $O(n^2)$.

### Nondeterministic TM (NTM)
$\delta$ returns a SET of choices: $\delta(q, X) = \{(p_1, Y_1, D_1), (p_2, Y_2, D_2), \ldots\}$.

$w$ is accepted if SOME sequence of choices leads to acceptance.

**Equivalence**: Simulated by a deterministic TM using breadth-first search (dovetailing) of the nondeterministic computation tree — exponential time in worst case.

### Semi-Infinite Tape
Tape infinite only to the right. Simulated by two-track tape: one track for the right half, another for the left half (with reversed addressing).

### Multi-Track Tape
Each cell holds a tuple of symbols. Equivalent to expanding the tape alphabet ($\Gamma^k$).

### Enumerator
A TM with a printer that outputs strings. A language is RE iff some enumerator enumerates it.

---

## The Church-Turing Thesis

> **Every effectively computable function can be computed by a Turing machine.**

This is a **thesis**, not a theorem — it connects the intuitive notion of "algorithm" to the formal TM model. All other formal models of computation (lambda calculus, recursive functions, register machines, Post systems, etc.) have been proven equivalent to TMs.

No one has found a computational model more powerful than the TM (that is physically realizable).

---

## Universal Turing Machine

A **universal TM** $U$ takes an encoding $\langle M, w \rangle$ of a TM $M$ and input $w$, and simulates $M$ on $w$.

$$L(U) = \{ \langle M, w \rangle \mid M \text{ accepts } w \}$$

The existence of $U$ is fundamental — it's the theoretical basis for stored-program computers: one machine can simulate any other.

### Encoding
- States: $q_0, q_1, q_2, \ldots$ represented as $q$ followed by binary
- Symbols: $X_0, X_1, X_2, \ldots$ (binary)
- Transitions: Encoded as $q_i X_j q_k X_l D_m$ (binary)
- Separator: Use special delimiter

### Decoding the Language $A_{TM}$
$$A_{TM} = \{ \langle M, w \rangle \mid M \text{ accepts } w \}$$

$A_{TM}$ is **recursively enumerable** (recognizable by $U$) but **NOT recursive** (not decidable).

---

## Decidable Problems About Turing Machines

Some problems about TMs are decidable:
- Does a TM have exactly $k$ states? (just count)
- Given a TM and $k$, does the TM use more than $k$ tape cells on a particular input of length $n$? (simulate for up to $k$ steps)

Most interesting questions, however, are **undecidable**.

---

## The Halting Problem

$$HALT_{TM} = \{ \langle M, w \rangle \mid M \text{ halts on input } w \}$$

**Theorem**: $HALT_{TM}$ is undecidable.

If a decider for $HALT_{TM}$ existed, we could decide $A_{TM}$: run the halting decider on $\langle M, w \rangle$; if it says "does not halt", reject; if "halts", simulate $M$ on $w$ to see if it accepts.
