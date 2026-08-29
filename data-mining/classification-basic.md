# Classification (Basic)

## What Is Classification?

- **Classification** (supervised): build a model from **labeled training data** $(x_i, y_i)$ that assigns a **discrete class label** $y$ to new instances.
- **Prediction/regression** (a sibling task): predict a **continuous** value.
- Typical flow: **training** (induce model) → **testing** (evaluate on hold-out) → **application** (classify new data).

### Terminology
- **Classifier**: the induced function $\hat{y} = f(x)$.
- **Training set**: labeled examples. **Test set**: unseen labeled examples.
- **Attribute**: descriptive feature (predictor). **Class label**: target.

## General Approach
```
1. Model construction (learning): training data → classifier (e.g., tree, rules).
2. Model usage: apply to test data / future data; estimate accuracy.
```
During training we also **evaluate** using accuracy, confusion matrix, etc. (see Evaluation section).

## Decision Tree Induction

A **decision tree**: internal nodes = tests on an attribute; branches = outcomes; leaf = class prediction. Classification = follow root-to-leaf.

### Algorithm (Top-Down, Greedy, Divide-and-Conquer — Hunt / ID3 / C4.5 / CART)
```
DTL(D, attribs):
  if all D same class c: return leaf(c)
  if attribs empty: return leaf(majority class of D)
  choose best attribute A by split criterion;
  for each value v of A:
      Dv = subset of D with A=v;
      child_v = DTL(Dv, attribs \ {A});
  return node(A, {child_v});
```

### 1. ID3 — Information Gain (entropy-based)
- **Entropy** of data $D$ with classes $C_1..C_m$:
  $$Entropy(D) = -\sum_{i=1}^{m} p_i \log_2 p_i, \quad p_i = \frac{|C_i|}{|D|}$$
  $Entropy=0$ when pure; max when uniform.
- **Information gain** of splitting on $A$ with $v$ values:
  $$Gain(D,A) = Entropy(D) - \sum_{j=1}^{v}\frac{|D_j|}{|D|}Entropy(D_j)$$
- ID3 picks the attribute with **maximum gain**.

### 2. C4.5 — Gain Ratio (corrects bias toward many-valued attrs)
$$SplitInfo(D,A) = -\sum_{j}\frac{|D_j|}{|D|}\log_2 \frac{|D_j|}{|D|}$$
$$GainRatio(D,A) = \frac{Gain(D,A)}{SplitInfo(D,A)}$$
- Normalizes by the spread of the split; avoids preferring attributes with many distinct values.

### 3. CART — Gini Index (impurity)
- **Gini** of $D$:
  $$Gini(D) = 1 - \sum_{i=1}^{m} p_i^2$$
  Lower = purer. Gini of a split:
  $$Gini_{split}(D,A) = \sum_{j}\frac{|D_j|}{|D|}Gini(D_j)$$
- CART picks the split minimizing Gini (binary splits). Also used for **regression trees** (minimize variance).

| Criterion | Used by | Bias | Notes |
|---|---|---|---|
| Information gain | ID3 | toward many values | simple, common in teaching |
| Gain ratio | C4.5 | balanced | handles high-cardinality |
| Gini | CART | balanced | faster (no log), binary splits |

### Tree Overfitting & Pruning
- **Overfitting**: tree fits training noise ⇒ poor generalization.
- **Pre-pruning**: stop splitting when gain/sample below threshold, or node too small.
- **Post-pruning** (e.g., error-based, cost-complexity): grow full tree, then **prune** subtrees replacing with leaf; keep if test accuracy doesn't drop. C4.5 uses a pessimistic estimate; CART uses **cost-complexity** $\alpha\,|\text{leaves}|+error$.

### Advantages / Disadvantages
- ✅ interpretable, handles nominal & numeric, fast, insensitive to data scale.
- ❌ greedy (locally optimal), unstable to small changes, bias toward dominant classes.

## Naïve Bayes Classifier

Based on **Bayes' theorem** with the **conditional independence** assumption among attributes given the class.

$$P(C_k|X) = \frac{P(X|C_k)P(C_k)}{P(X)}$$
With $X=(x_1..x_n)$ and independence given class:
$$P(C_k|x_1..x_n) = \frac{P(C_k)\prod_{i=1}^{n}P(x_i|C_k)}{P(X)}$$
Classify as $\hat{y} = \arg\max_k P(C_k)\prod_i P(x_i|C_k)$.

### Estimating Probabilities
- **Categorical** $x_i$: $P(x_i|C_k) = \frac{count(x_i,C_k)+1}{\sum_{x'}count(x',C_k)+|dom(x_i)|}$ (**Laplacian / additive smoothing**) to avoid zero.
- **Numeric** $x_i$: assume Gaussian: $P(x_i|C_k)=\frac{1}{\sqrt{2\pi}\sigma_{k}}\exp\!\left(-\frac{(x_i-\mu_k)^2}{2\sigma_k^2}\right)$.

### Properties
- ✅ simple, fast (linear in attributes), robust with little data, good baseline.
- ❌ independence assumption rarely holds (but often works well enough).
- **Zero-frequency problem** solved by Laplace smoothing.

## k-Nearest Neighbor (k-NN)

- **Lazy learner** (instance-based; no explicit model built at training — just store data).
- To classify $x$: find the **$k$ closest training points** (by distance, e.g., Euclidean), predict the **majority class** (or weighted vote: $w_i=1/d(x,x_i)$).

| Aspect | Notes |
|---|---|
| Distance | Euclidean / Minkowski / cosine (normalize first!) |
| $k$ choice | small $k$ → noisy; large $k$ → smooth; choose via CV |
| Pros | no training cost, adapts, handles complex boundaries |
| Cons | slow query (scan all data), sensitive to scale/irrelevant attrs, needs feature weighting |

- **Curse of dimensionality** degrades distance meaning in high-D; use normalization & feature selection.

## Model Evaluation & Selection

### Train/Test Split
- **Hold-out**: split into training and test (e.g., 70/30).
- **Cross-validation (k-fold)**: partition into $k$ folds; train on $k-1$, test on 1, repeat; report mean accuracy. **Leave-one-out** = $k=n$.
- **Bootstrapping**: resample with replacement; estimate accuracy on out-of-bag.

### Accuracy & Error
- **Accuracy** = correctly classified / total. **Error rate** = 1 − accuracy.

### Confusion Matrix (binary)
| | Actual + | Actual − |
|---|---|---|
| Pred + | TP | FP |
| Pred − | FN | TN |

- **Precision** $= TP/(TP+FP)$
- **Recall (Sensitivity)** $= TP/(TP+FN)$
- **F1** $= 2PR/(P+R)$ (harmonic mean)
- **Specificity** $= TN/(TN+FP)$

### Other Metrics
- **ROC curve**: plot TPR vs FPR at varying thresholds; **AUC** (area under) summarizes discriminative power (1.0 perfect, 0.5 random).
- **Recall-Precision curve**; **stratified/fairness** considerations.
- **Significance test**: compare two classifiers with paired $t$-test / McNemar on the same test set.

### Overfitting vs Underfitting
- **Bias** (underfitting): model too simple. **Variance** (overfitting): model too complex. Aim for the sweet spot (bias-variance trade-off), guided by validation error.

## Comparing the Basic Classifiers

| Classifier | Type | Model | Pros | Cons |
|---|---|---|---|---|
| Decision tree | eager | tree | interpretable, handles mixed types | greedy, unstable |
| Naïve Bayes | eager, generative | probability | fast, robust, good baseline | independence assumption |
| k-NN | lazy | instance-based | no training, adapts | slow query, scale-sensitive |

## Worked Confusion Matrix (binary)

Test set of 100; classifier predicts:

| | Actual + | Actual − |
|---|---|---|
| Pred + | TP=40 | FP=10 |
| Pred − | FN=15 | TN=35 |

- Accuracy = $(40+35)/100 = 75\%$.
- Precision = $40/(40+10) = 80\%$.
- Recall = $40/(40+15) = 72.7\%$.
- F1 = $2\cdot0.8\cdot0.727/(0.8+0.727) \approx 76.2\%$.
- Specificity = $35/(35+10) = 77.8\%$.

## Handling Missing Values at Classify Time
- Decision trees: route down both/weighted branches, or use surrogate splits (C4.5).
- Naïve Bayes: marginalize over the missing attribute.
- k-NN: use only available features (distance over present dims) or impute.

## Bias–Variance Trade-off (Detail)
Total error ≈ **bias² + variance + noise**.
- High bias (underfit): model too simple, misses structure (e.g., linear on non-linear).
- High variance (overfit): model too sensitive to training quirks (deep tree, small k in k-NN).
- Use validation error to pick model complexity; CV selects the sweet spot.

## Multi-Class Classification
Binary learners extend to $>2$ classes via:
- **One-vs-Rest (OvR)**: train one classifier per class vs all others; pick the highest-score class. Simple, $k$ models.
- **One-vs-One (OvO)**: train a classifier for every pair; majority vote among $k(k-1)/2$ models. Often better for SVMs (smaller problems) but more models.
- **Native multi-class**: decision trees, Naïve Bayes, and neural nets classify multiple classes directly.

## Naïve Bayes — Worked Sketch
Test record $x=(\text{outlook=sunny}, \text{humidity=high})$. For classes Play=yes/no:
$$P(yes|x) \propto P(yes)\cdot P(sunny|yes)\cdot P(high|yes)$$
$$P(no|x) \propto P(no)\cdot P(sunny|no)\cdot P(high|no)$$
Predict the larger posterior (after Laplace smoothing to avoid zero factors). Fast and surprisingly accurate on text/spam.

## Common Pitfalls
- Forgetting to normalize before distance/linear models.
- Using accuracy on imbalanced data (use precision/recall/AUC).
- Overfitting a deep tree or small-$k$ k-NN (validate via CV).
- Leakage: using test info during training/preprocessing (e.g., scaling on full data).

## Summary

Classification learns a mapping from features to discrete labels. **Decision trees** (ID3/C4.5/CART) use entropy/gain, gain-ratio, and Gini to greedily split, with pruning to control overfitting. **Naïve Bayes** applies Bayes' theorem under conditional independence, with Laplace smoothing for zeros. **k-NN** is a lazy instance-based method using local majority voting. Evaluation relies on hold-out/CV, accuracy, the confusion matrix (precision/recall/F1), and ROC/AUC — always watch the bias-variance trade-off.
