# Pumping Lemma for Context-Free Languages

The Pumping Lemma for CFLs is a tool for proving that certain languages are **not** context-free. Like the pumping lemma for regular languages, it's a necessary but not sufficient condition.

---

## Statement

If $L$ is a context-free language, then there exists a constant $n \ge 1$ (the **pumping length**) such that for all strings $z \in L$ with $|z| \ge n$, we can write $z = uvwxy$ such that:

1. $|vwx| \le n$ (the "pumped" portion plus context is bounded)
2. $|vx| \ge 1$ (at least one of $v$ or $x$ is non-empty)
3. For all $i \ge 0$, $uv^i w x^i y \in L$ (both $v$ and $x$ can be pumped simultaneously)

---

## Intuition

Consider a parse tree for a string in a CNF grammar. If the string is long enough, some path from root to leaf must be longer than the number of variables — by the pigeonhole principle, some variable must repeat.

The repeated variable corresponds to a recursive structure: the subtree rooted at the upper occurrence can be "pumped" by repeating (or removing) the lower occurrence.

- $v$ and $x$ are the terminal strings generated from the two occurrences of the repeated variable
- $w$ is what's between them
- $u$ and $y$ are the prefix and suffix

---

## Proof of the Pumping Lemma

1. Let $G$ be a CFG in CNF for $L - \{\varepsilon\}$.
2. Let $m = |V|$ be the number of variables.
3. Choose $n = 2^m$.
4. Consider a parse tree for string $z$ with $|z| \ge n$. In a binary tree, the longest path has length $\ge m+1$, so it contains $m+1$ variables — by pigeonhole, some variable $A$ appears twice on this path.

5. Let the upper $A$ generate $v A x$ (eventually) and the lower $A$ generate $w$.

6. From the derivation chain:
   $$S \Rightarrow^* uAy \Rightarrow^* uvAxy \Rightarrow^* uvwxy = z$$
7. We can pump:
   - $i = 0$: $S \Rightarrow^* uAy \Rightarrow^* uwy$ (remove the $A \to vAx$ step)
   - $i = 2$: Insert the $A \to vAx$ step twice
   - $i = k$: Insert $k$ times

8. $|vwx| \le n$ because the subtree rooted at the upper $A$ has depth $\le m$, so its yield length $\le 2^m = n$.
9. $|vx| \ge 1$ because CNF has no unit productions — at least one leaf must be generated.

---

## Proving Non-Context-Free

### Strategy
1. **Assume** $L$ is context-free, let $n$ be the PL constant
2. **Choose** $z \in L$ with $|z| \ge n$ — critically, must consider ALL legal decompositions
3. **Consider** any decomposition $z = uvwxy$ with $|vwx| \le n$ and $|vx| \ge 1$
4. **Find** some $i$ such that $uv^i w x^i y \notin L$
5. **Contradiction** — $L$ is not context-free

---

## Classic Non-CFL Examples

### 1. $L = \{a^n b^n c^n \mid n \ge 1\}$

**Choice of $z$**: $z = a^n b^n c^n$ (where $n$ is the PL constant).

Since $|vwx| \le n$, the substring $vwx$ can span at most two of the three blocks ($a$'s, $b$'s, $c$'s).

**Case analysis**:
- If $v$ or $x$ contains $a$ and $b$: $uv^2 w x^2 y$ has $a$'s and $b$'s interleaved — not in $L$
- If $v$ or $x$ contains $b$ and $c$: $uv^2 w x^2 y$ has $b$'s and $c$'s interleaved — not in $L$
- If $v$ and $x$ are all from one or two symbols: pumping changes the count of one or two symbols but not all three, breaking the equal-count property

In all cases, $uv^2 w x^2 y \notin L$ — **contradiction**. $L$ is not context-free.

### 2. $L = \{ww \mid w \in \{0,1\}^*\}$

**Choice of $z$**: $z = 0^n 1^n 0^n 1^n$ (palindromic-like choice exploits the bounded window).

Since $|vwx| \le n$, $vwx$ falls entirely within one of the four quarters. Pumping changes only that quarter, breaking the $ww$ pattern.

**Alternative choice**: $z = 0^n 1 0^n 1$ — simpler, similar argument.

### 3. $L = \{0^i 1^j 2^k \mid i \lt j \lt k\}$

**Choice of $z$**: $z = 0^n 1^{n+1} 2^{n+2}$

Since $|vwx| \le n$, $vwx$ spans at most two symbols.

- If $vx$ contains no 2's: pumping up adds 0's or 1's, can make $i \ge j$ or $j \ge k$
- If $vx$ contains 2's but no 0's: pumping down removes 2's, can make $k \le j$

Each case leads to a string violating $i \lt j \lt k$ — **contradiction**.

---

## Ogden's Lemma (Extension)

A stronger version of the Pumping Lemma that allows marking distinguished positions. Useful for proving languages like $\{a^i b^j c^k \mid i \neq j \text{ or } j \neq k\}$ are inherently ambiguous.

### Statement
If $L$ is context-free, there exists $n$ such that for any $z \in L$, if we mark at least $n$ positions in $z$ as distinguished, we can write $z = uvwxy$ such that:
1. $vwx$ contains at most $n$ distinguished positions
2. $vx$ contains at least one distinguished position
3. $uv^i w x^i y \in L$ for all $i \ge 0$

---

## Comparison: Regular vs. Context-Free Pumping Lemma

| Feature | Regular PL | CFL PL |
|---|---|---|
| Pumped portions | One substring $y$ | Two substrings $v, x$ (pumped in tandem) |
| Bound | $\|xy\| \le n$ | $\|vwx\| \le n$ |
| Non-empty | $\|y\| > 0$ | $\|vx\| \ge 1$ |
| Derives from | State repetition (cycle) | Variable repetition (recursion) |
| Recognizes | Finite memory | Stack memory (nested structure) |
