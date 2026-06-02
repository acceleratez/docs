# Undecidability

Not all problems can be solved by algorithms. Some are **undecidable** — no Turing machine exists that always halts and correctly answers the question.

---

## Diagonalization

Cantor's diagonalization showed: **The set of all languages over $\{0,1\}$ is uncountable, but the set of all Turing machines is countable.**

### Countability of TMs
Every TM can be encoded as a finite binary string $\langle M \rangle$. The set of all finite strings over $\{0,1\}$ is countable (lexicographic order). Therefore, TMs are countable — but the powerset of $\{0,1\}^*$ (all languages) is uncountable.

**Conclusion**: There exist languages that are not RE (most languages, in fact).

---

## $A_{TM}$ is Undecidable

$$A_{TM} = \{ \langle M, w \rangle \mid M \text{ is a TM and } M \text{ accepts } w \}$$

**Theorem**: $A_{TM}$ is RE but **not recursive** (not decidable).

**Proof by diagonalization**: Suppose there is a decider $H$ for $A_{TM}$:

$$H(\langle M, w \rangle) = \begin{cases} \text{accept} & \text{if } M \text{ accepts } w \\ \text{reject} & \text{if } M \text{ does not accept } w \end{cases}$$

Construct the "diagonal" TM $D$:

```
D(<M>):
    Run H(<M, <M>>)
    If H accepts, reject
    If H rejects, accept
```

Now, what does $D$ do on input $\langle D \rangle$?

- If $D$ accepts $\langle D \rangle$, then $H(\langle D, \langle D \rangle \rangle)$ accepts, meaning $D$ rejects $\langle D \rangle$ — contradiction
- If $D$ rejects $\langle D \rangle$, then $H$ rejects, meaning $D$ accepts $\langle D \rangle$ — contradiction

Therefore, $H$ cannot exist. $A_{TM}$ is undecidable.

---

## The Halting Problem

$$HALT_{TM} = \{ \langle M, w \rangle \mid M \text{ halts on input } w \}$$

**Theorem**: $HALT_{TM}$ is undecidable.

**Proof by reduction from $A_{TM}$**: Assume $R$ decides $HALT_{TM}$. Construct $S$ to decide $A_{TM}$:

```
S(<M, w>):
    Run R(<M, w>)
    If R rejects, reject   (M doesn't halt, so can't accept)
    If R accepts, simulate M on w until it halts
        If M accepts, accept
        If M rejects, reject
```

$S$ would be a decider for $A_{TM}$ — but we just proved $A_{TM}$ is undecidable. **Contradiction**. So $HALT_{TM}$ is undecidable.

---

## Proving Undecidability by Reduction

To prove problem $P$ is undecidable, reduce a known undecidable problem to $P$:

$$A \leq_m B \text{ (mapping reduction) and } A \text{ undecidable } \implies B \text{ undecidable}$$

A **mapping reduction** from $A$ to $B$ is a computable function $f$ such that:
$$w \in A \iff f(w) \in B$$

---

## Notable Undecidable Problems

### $E_{TM}$: Emptiness of TM Language
$$E_{TM} = \{ \langle M \rangle \mid L(M) = \emptyset \}$$

**Undecidable** (not even RE). Reduction from $A_{TM}$.

### $EQ_{TM}$: Equivalence of TMs
$$EQ_{TM} = \{ \langle M_1, M_2 \rangle \mid L(M_1) = L(M_2) \}$$

**Undecidable** (not RE). Reduction from $E_{TM}$: fix $M_2$ as a TM that rejects everything.

### $REGULAR_{TM}$: Is $L(M)$ Regular?
$$REGULAR_{TM} = \{ \langle M \rangle \mid L(M) \text{ is regular} \}$$

**Undecidable** (not RE). Rice's Theorem applies.

### $CFL_{TM}$: Is $L(M)$ Context-Free?
Similarly undecidable.

---

## Rice's Theorem

**Any nontrivial property of the RE languages is undecidable.**

A property $P$ of RE languages is **nontrivial** if:
- There exists a TM $M_1$ such that $L(M_1) \in P$
- There exists a TM $M_2$ such that $L(M_2) \notin P$

### Formal Statement
Let $P$ be any nontrivial subset of RE languages. Then:
$$L_P = \{ \langle M \rangle \mid L(M) \in P \}$$

is undecidable.

### Consequences
Almost every semantic question about programs is undecidable:
- Does the program halt on all inputs?
- Does the program compute $f(x) = x^2$?
- Is the program's output always positive?
- Are two programs equivalent?
- Does the program contain a virus?

**Rice's Theorem says: you cannot algorithmically determine any nontrivial behavioral property of programs by inspecting their code.**

---

## Post's Correspondence Problem (PCP)

Given two lists of strings $A = (a_1, \ldots, a_k)$ and $B = (b_1, \ldots, b_k)$, does there exist a sequence of indices $i_1, i_2, \ldots, i_m$ ($m \ge 1$) such that:
$$a_{i_1} a_{i_2} \ldots a_{i_m} = b_{i_1} b_{i_2} \ldots b_{i_m}$$

**Theorem**: PCP is undecidable.

PCP is a powerful tool for proving undecidability — many problems (ambiguity of CFGs, emptiness of intersection of CFLs, etc.) reduce to PCP.

---

## The Recursion Theorem

For any computable function $f$ that transforms TM descriptions, there exists a TM $M$ such that:
$$L(M) = L(f(\langle M \rangle))$$

In other words: TMs can obtain and use their own description.

**Consequences**:
- There exists a TM that prints its own description (a "quine")
- Used to prove Rice's Theorem elegantly
- Underpins self-referential constructions in computability theory

---

## Hierarchy of Undecidability

$$\text{Decidable} \subsetneq \text{RE} \subsetneq \text{co-RE} \subsetneq \Sigma_2 \subsetneq \Pi_2 \subsetneq \cdots$$

- **RE ($\Sigma_1$)**: Semi-decidable — TM halts and accepts on YES instances
- **co-RE ($\Pi_1$)**: Complement is RE — TM halts and accepts on NO instances
- **$\Delta_1$** = Recursive = RE $\cap$ co-RE
- Higher levels correspond to problems with alternating quantifiers

$A_{TM}$ is RE-complete. $E_{TM}$ is co-RE-complete. $EQ_{TM}$ is $\Pi_2$-complete.
