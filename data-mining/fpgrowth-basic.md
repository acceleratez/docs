# Frequent Pattern Mining (Basic)

## Motivation and Definitions

**Frequent patterns**: itemsets, subsequences, or substructures that appear together (or in sequence) frequently in a data set.

- **Market basket analysis**: find items bought together to design placement, promotions, and recommendation.
- Interesting not only in retail — also web logs, bio-sequences, program flows.

### Basic Concepts (Itemset)
- **Itemset**: a set of items, e.g., $\{milk, bread, diaper\}$.
- **$k$-itemset**: an itemset containing $k$ items.
- **Support count ($\sigma$) / absolute support**: number of transactions containing the itemset.
- **Support (relative)**: 
  $$supp(X) = \frac{\sigma(X)}{|T|}$$
  fraction of transactions containing $X$.
- **Frequent itemset**: an itemset whose support $\ge$ user-specified **minimum support** threshold, $minsup$.
- **$k$-frequent**: frequent $k$-itemset.

### Association Rules
A rule $X \Rightarrow Y$ where $X,Y$ are itemsets, $X\cap Y = \emptyset$.

- **Support**:
  $$supp(X \Rightarrow Y) = supp(X \cup Y) = \frac{\sigma(X\cup Y)}{|T|}$$
- **Confidence**:
  $$conf(X \Rightarrow Y) = \frac{supp(X \cup Y)}{supp(X)} = P(Y|X)$$
- **Frequent rule**: support $\ge minsup$ (both $X$ and $Y$ frequent).
- **Confident rule**: confidence $\ge minconf$.

**Example**: `{milk, diaper} → {beer}` with $supp=0.5\%$, $conf=75\%$ means "in 0.5% of all baskets both groups co-occur; among baskets with milk&diaper, 75% also have beer."

### Correlation / Lift
Support & confidence alone can be misleading (a rule can have high confidence simply because $Y$ is very frequent). Use **lift**:
$$lift(X \Rightarrow Y) = \frac{supp(X\cup Y)}{supp(X)\,supp(Y)} = \frac{conf(X\Rightarrow Y)}{supp(Y)}$$
- $lift = 1$: $X$ and $Y$ independent (no correlation).
- $lift > 1$: positively correlated (co-occur more than chance).
- $lift < 1$: negatively correlated.
Also **$\chi^2$** and **all_confidence / cosine** can measure correlation.

## The Apriori Algorithm (Itemset Mining)

**Downward closure / Apriori property**: *any subset of a frequent itemset must itself be frequent.* Equivalently, **any superset of an infrequent itemset is infrequent** — used for pruning.

### Intuition
- Enumerate itemsets level-by-level: $L_1 \to C_2 \to L_2 \to C_3 \to \dots$
- Use frequent $(k-1)$-itemsets to generate candidate $k$-itemsets, then prune candidates whose $(k-1)$-subsets are not frequent.

### Algorithm Steps
```
L1 = { frequent 1-itemsets };
for (k = 2; L_{k-1} ≠ ∅; k++) {
    Ck = apriori_gen(L_{k-1}, minsup);   // candidate generation + pruning
    for each transaction t in DB {
        Ct = subset(Ck, t);              // candidates contained in t
        for each c in Ct: c.count++;
    }
    Lk = { c in Ck | c.count/|T| ≥ minsup };
}
return ∪k  Lk;
```

### apriori_gen (Candidate Generation + Pruning)
1. **Join step**: for each pair $l_1, l_2 \in L_{k-1}$ that agree on first $k-2$ items, differ only in the last item, produce candidate $l_1[1..k-1] \cup l_2[k-1]$.
2. **Prune step**: delete any candidate $c$ if any $(k-1)$-subset of $c$ is **not** in $L_{k-1}$.

### Example (minsup = 50%, |T|=4)
Suppose transactions yield $L_1=\{A,B,C,D\}$ all frequent, and join gives $C_2=\{AB,AC,AD,BC,BD,CD\}$. After counting, $L_2=\{AB,AC,BC, BD\}$. Then $C_3$ from joins of $L_2$ (only $ABC$ and $BCD$ share prefixes), and prune: $ABC$ subsets $AB,AC,BC$ all in $L_2$ ✓; $BCD$ subsets $BC,BD,CD$ — **$CD\notin L_2$** ⇒ prune $BCD$. Final $L_3=\{ABC\}$.

### Rule Generation from Frequent Itemsets
For each frequent itemset $f$, generate all non-empty proper subsets $X\subset f$; output $X \Rightarrow f\backslash X$ if:
$$conf = \frac{supp(f)}{supp(X)} \ge minconf$$
Can also prune using the rule **anti-monotone** property: if $X\Rightarrow Y$ has low confidence, then any **specialized** rule (smaller antecedent) also has low confidence.

## Complexity and Bottlenecks of Apriori
- **Bottleneck 1**: candidate generation — huge number of candidates (esp. $C_2$). Number of maximal candidates $\approx$ combinations.
- **Bottleneck 2**: multiple DB scans (one per $k$). For dense / long patterns this is expensive.
- **Bottleneck 3**: support counting for each candidate against each transaction.

Worst-case itemset count $\sum_{i=1}^{n}\binom{n}{i} = 2^n-1$ if all frequent; $O(2^n)$ search space (mitigated heavily by pruning).

## Improvements / Variations
- **PCY (Park-Chen-Yu)**: hash candidate pairs into buckets during $L_1$ pass; mark frequent buckets to prune $C_2$.
- **Multistage / Multihash**: multiple hash passes to better prune.
- **Partition**: two scans — any globally frequent itemset must be frequent in at least one partition ⇒ prune candidates early.
- **Sampling**: mine a sample, verify on full DB; risky (false positives/negatives).
- **DIC (Dynamic Itemset Counting)**: count candidates earlier as soon as supported.
- **Trade (vertical format / tid-lists)**: represent items by transaction-id lists; intersect lists to count — avoids candidate explosion for some data.

## Closed and Maximal Patterns (preview, see Ch.6)
- Many frequent itemsets are redundant ($\{A,B\}$ frequent implies $\{A\},\{B\}$ frequent). We often want **closed** and **maximal** frequent itemsets to compress representation.

## Worked Apriori Example (Concrete Counts)

Transactions (minsup = 50%, so min count = 2 with |T|=4):

| TID | Items |
|---|---|
| T1 | A, B, C |
| T2 | A, B, D |
| T3 | B, C, D |
| T4 | A, C, D |

- **$L_1$** (count ≥ 2): A(3), B(3), C(3), D(3).
- **$C_2$** from joins: AB(2), AC(3), AD(3), BC(2), BD(2), CD(3) → **$L_2$** = all (each ≥ 2).
- **$C_3$** (join $L_2$ pairs sharing 2 prefix items): ABC, ABD, ACD, BCD. Prune by apriori property: all 3-subsets of each are in $L_2$, so none pruned.
- Counts: ABC(1), ABD(2), ACD(2), BCD(2). With min count 2 ⇒ **$L_3$ = {ABD, ACD, BCD}**.
- **$C_4$** = ABCD? Its 3-subsets include ABC (count 1 ∉ $L_3$) ⇒ pruned. Stop.

Frequent itemsets = all of $L_1\cup L_2\cup L_3$. Note ABC is infrequent even though A,B,C each are — the apriori pruning avoids counting ABCD.

## Rule Generation Example

From frequent $ABD$ (supp 2/4 = 50%): candidate rules and confidence:
- $AB \Rightarrow D$: $conf = supp(ABD)/supp(AB) = 2/2 = 100\%$.
- $A \Rightarrow BD$: $conf = 2/3 = 66.7\%$.
- $D \Rightarrow AB$: $conf = 2/2 = 100\%$.
- $B \Rightarrow AD$: $conf = 2/3 = 66.7\%$.
Keep rules with $conf \ge minconf$ (say 60%). Anti-monotone pruning: if $AB\Rightarrow D$ fails, then any rule with antecedent $\subset \{A,B\}$ (e.g., $A\Rightarrow BD$) also fails — prune without counting.

## Support, Confidence, Lift — Full Example

For $A\Rightarrow D$: $supp=3/4=75\%$, $conf=3/3=100\%$, $lift = supp(AD)/(supp(A)supp(D)) = 0.75/(0.75\times0.75)=1.33$ (positively correlated). If $lift=1$, buying A tells us nothing about D.

## More on Improvements

- **DIC (Dynamic Itemset Counting)**: begins counting a candidate as soon as all its subsets can possibly be frequent (before fully finishing earlier levels) — reduces passes over the DB.
- **Sampling**: pick a sample, find frequent itemsets there, then verify on full data; adds a "negative border" check to catch false negatives. Risk: may miss some frequent sets (acceptable for approximate mining).
- **Vertical (tid-list) format**: store for each item the list of TIDs containing it; support of a set = size of the **intersection** of tid-lists. Avoids repeated transaction scans (leads to ECLAT, Ch. 6).

## Beyond Lift: Other Interestingness Measures
- **Conviction**: $conv(A\Rightarrow B)=\dfrac{1-supp(B)}{1-conf(A\Rightarrow B)}$; $\infty$ when perfectly confident, 1 when independent.
- **Leverage (Piatetsky)**: $P(A,B)-P(A)P(B)$ — absolute deviation from independence.
- **Collective strength / J-measure**: information-theoretic surprise of the rule.
These rank rules when support/confidence alone mislead (a rule can be confident merely because the consequent is frequent).

## Parallel & Scalable Apriori
- **Count distribution**: each processor scans a data partition and ships local counts; master sums (uses the partitioning idea).
- **Data distribution**: broadcast candidates, each node counts its shard.
- **MapReduce**: mappers emit candidate subsets per transaction, reducers aggregate — natural fit for the $C_k$ counting step.

## Why the Support Threshold Matters
- Too high → miss rare but interesting patterns (e.g., fraud combos).
- Too low → combinatorial explosion of candidates (the Apriori bottleneck).
- Practical fixes: **top-$k$** frequent patterns (specify $k$ instead of $minsup$) or **constraint-based** mining (only items of interest).

## Limitations of Association Rules
- They capture correlation, not causation.
- Redundant rules explode as itemsets grow (mitigated by closed/maximal, Ch. 6).
- Sensitive to the choice of $minsup$/$minconf$ and data skew.

## Apriori Candidate Generation — Detail
The join step enumerates $L_{k-1}\Join L_{k-1}$: for itemsets stored as sorted lists, join $l_1,l_2$ if they share the first $k-2$ items and differ only in the last. The prune step then checks every $(k-1)$-subset of the candidate against $L_{k-1}$; if any subset is absent it is discarded (it cannot be frequent by the apriori property). This single property is what makes Apriori feasible.

## Apriori vs FP-Growth (Comparison)
| Aspect | Apriori | FP-Growth |
|---|---|---|
| Candidate generation | yes (huge $C_2$) | no |
| DB scans | one per $k$ | 2 (build + mine) |
| Memory | low | tree (can be large) |
| Best for | short / sparse patterns | long / dense patterns |
| Output | all frequent itemsets | all frequent itemsets |

## Rule Templates & Constraints (Practical)
Real miners rarely want *all* rules. Use **constraints** to focus:
- **Item constraints**: only rules containing `milk` (monotone w.r.t. supersets containing it).
- **Aggregate constraints**: `avg(price) < 10`.
- **Class-based / meta-rule**: `buys(X, "camera") → buys(X, "SD-card")`.
Pushing constraints into candidate generation prunes the search early (see Ch.6 constrained mining).

## Summary

Frequent pattern mining finds itemsets whose support exceeds $minsup$; association rules add confidence and lift. The **Apriori** algorithm exploits the **downward-closure (apriori) property** to prune the exponential search space level-by-level, generating candidates from $(k-1)$-frequent itemsets, pruning non-frequent subsets, counting supports, and retaining frequent $k$-itemsets. Rules are then extracted from frequent itemsets, with the **anti-monotone confidence** property pruning rule generation. Apriori's cost is candidate explosion and repeated DB scans — motivating the FP-growth family (Ch. 6).
