# Recurrent Neural Networks

> Source: CS1674 Ch.15 (Part B). RNNs process **sequences** with shared weights across time, maintaining a **hidden state (memory)**. Vanilla RNNs suffer vanishing/exploding gradients → **LSTM / GRU** fix this. Key CV application: **image captioning**.

## 1. Why Sequences?

In CV, data associated with time = **video**. More generally, RNNs handle sequential prediction:

| Task | Example |
|---|---|
| Text classification | Sentiment ("The food was really good" → positive) |
| Text generation | Language modeling — sample next token |
| Image captioning | "A cat sitting on a suitcase" (neuraltalk2) |
| Machine translation | Sequence-to-sequence (many→many) |

### Input–output scenarios
- **One-to-one**: feedforward network.
- **One-to-many**: sequence generation (captioning).
- **Many-to-one**: sequence classification (sentiment).
- **Many-to-many**: translation, captioning.

---

## 2. The Recurrent Unit (Vanilla RNN, Elman 1990)

Recurrence:

$$\mathbf{h}_t = f_W(\mathbf{x}_t, \mathbf{h}_{t-1})$$

The hidden state $\mathbf{h}_t$ is the "memory"/"context" carried across time.

### 2.1 Cell equations
$$
\begin{aligned}
\mathbf{h}_t &= \tanh\big(W_x \mathbf{x}_t + W_h \mathbf{h}_{t-1}\big) \\
\mathbf{y}_t &= \mathrm{softmax}(W_y \mathbf{h}_t) \\
e_t &= -\log \mathbf{y}_t(y^*_t) \quad\text{(cross-entropy with ground-truth token)}
\end{aligned}
$$

Weights $W_x, W_h, W_y$ are **shared** across all time steps.

### 2.2 Forward pass
Unroll in time; at each step compute $\mathbf{h}_t$ from $\mathbf{x}_t$ and $\mathbf{h}_{t-1}$, then $\mathbf{y}_t$. (tanh derivative: $\frac{d}{da}\tanh a = 1-\tanh^2 a$.)

---

## 3. Training: Backpropagation Through Time (BPTT)

- Treat the **unfolded** network as one big feed-forward net taking the whole sequence.
- Compute weight gradients at each copy, then **sum (or average)** and apply to the shared RNN weights.
- **Problem**: long sequences → huge memory.

### Truncated BPTT
- Run forward over chunks of $k$ steps; backprop within each chunk.
- Carry hidden states forward in time, but only backpropagate for a smaller number of steps.

### 3.1 Backward pass (vanilla RNN)
$$
\begin{aligned}
\frac{\partial e}{\partial \mathbf{h}_t} &= \frac{\partial e}{\partial \mathbf{y}_t}\frac{\partial \mathbf{y}_t}{\partial \mathbf{h}_t} \\
\frac{\partial e}{\partial W_x} &= \frac{\partial e}{\partial \mathbf{h}_t} \odot \big(1-\tanh^2(\cdot)\big)\, \mathbf{x}_t^\top \\
\frac{\partial e}{\partial \mathbf{h}_{t-1}} &= W_h^\top\big(1-\tanh^2(\cdot)\big) \odot \frac{\partial e}{\partial \mathbf{h}_t}
\end{aligned}
$$

### 3.2 Vanishing / exploding gradients
$$\frac{\partial e}{\partial \mathbf{h}_{t-1}} = W_h^\top\big(1-\tanh^2(\cdot)\big) \odot \frac{\partial e}{\partial \mathbf{h}_t}$$

Computing the gradient for step $t-k$ involves **many repeated multiplications** by $W_h^\top$ and rescalings in $[0,1]$:
- If the largest singular value of $W_h$ < 1 → gradients **vanish**.
- If > 1 → gradients **explode**.

This is why vanilla RNNs struggle with long-range dependencies.

---

## 4. LSTM — Long Short-Term Memory (Hochreiter & Schmidhuber 1997)

Adds a **memory cell** $c_t$ that is *not* subject to matrix multiplication or squishing at every step → avoids gradient decay.

### Gates and equations
$$
\begin{aligned}
\begin{bmatrix} g_t \\ i_t \\ f_t \\ o_t \end{bmatrix}
&=
\begin{bmatrix} \tanh \\ \sigma \\ \sigma \\ \sigma \end{bmatrix}
\begin{bmatrix} W_g \\ W_i \\ W_f \\ W_o \end{bmatrix}
\begin{bmatrix} \mathbf{x}_t \\ \mathbf{h}_{t-1} \end{bmatrix} \\
\mathbf{c}_t &= f_t \odot \mathbf{c}_{t-1} + i_t \odot g_t \\
\mathbf{h}_t &= o_t \odot \tanh(\mathbf{c}_t)
\end{aligned}
$$

- $g_t$ = new candidate content, $i_t$ = input gate, $f_t$ = forget gate, $o_t$ = output gate.
- **Key**: the gradient path from $\mathbf{c}_t$ to $\mathbf{c}_{t-1}$ involves only **addition and element-wise multiplication** (no matrix multiply / activation), so error can flow many steps without vanishing.

---

## 5. GRU — Gated Recurrent Unit (Cho et al. 2014)

Simpler than LSTM: merges forget + output into an **update gate**, drops the separate cell state.

$$
\begin{aligned}
r_t &= \sigma(W_r[\mathbf{x}_t, \mathbf{h}_{t-1}] + b_r) \quad\text{(reset)}\\
\tilde{\mathbf{h}}_t &= \tanh(W[\mathbf{x}_t, r_t \odot \mathbf{h}_{t-1}]) \quad\text{(candidate)}\\
z_t &= \sigma(W_z[\mathbf{x}_t, \mathbf{h}_{t-1}] + b_z) \quad\text{(update)}\\
\mathbf{h}_t &= (1 - z_t) \odot \mathbf{h}_{t-1} + z_t \odot \tilde{\mathbf{h}}_t
\end{aligned}
$$

More efficient than LSTM, often comparable performance.

---

## 6. RNN Variants

- **Multi-layer RNNs**: stack hidden layers; skip connections across layers/time allowed.
- **Bi-directional RNNs**: process forward **and** backward (common in speech recognition) → each state sees past and future context.

---

## 7. Application: Image Captioning (Show and Tell, Vinyals et al. CVPR 2015)

- **Encoder**: CNN extracts image features $I$.
- **Decoder**: RNN/LSTM generates words one at a time, conditioned on $I$ and previous words.
- **Training**: maximize likelihood of reference caption $Y^* = (Y_1^*,\dots,Y_N^*)$:

$$L(I, Y^*) = -\sum_{i=1}^N \log P_W(Y_i^* \mid Y_1^*,\dots,Y_{i-1}^*, I)$$

- **Test time**: avoid always picking the max-likelihood word (greedy can be poor). Use **beam search** with beam width $k$: keep the $k$ top-scoring candidate sentences by sum of per-word log-likelihoods; expand successors and keep best $k$ each step.

> Pipeline: one-hot word → **word embedding** → LSTM → softmax over vocabulary → (next word).

---

## 8. Summary

- RNNs share weights over time and keep a hidden state; trained by **BPTT** (truncated in practice).
- Vanilla RNNs vanish/explode because gradients multiply by $W_h$ repeatedly.
- **LSTM** (cell + gates) and **GRU** (update/reset gates) enable long-range memory.
- Use **bi-directional** and **multi-layer** RNNs; apply to captioning via encoder–decoder + beam search.

---

## 9. Seq2seq with Additive Attention (Recap)

For machine translation (Bahdanau), the decoder hidden state $\mathbf{s}_{t-1}$ produces a query; alignment scores with encoder states $\mathbf{h}_i$:

$$e_{t,i} = v^\top \tanh(W_a[\mathbf{s}_{t-1}; \mathbf{h}_i]), \qquad a_{t,i} = \frac{e^{e_{t,i}}}{\sum_j e^{e_{t,j}}}, \qquad \mathbf{c}_t = \sum_i a_{t,i}\mathbf{h}_i$$

The context $\mathbf{c}_t$ replaces the fixed bottleneck vector → each output word attends to relevant source words (fixes the information bottleneck).

---

## 10. Beam Search & Teacher Forcing

- **Beam search**: keep the top-$k$ partial sequences by cumulative log-likelihood $\sum_i \log P(y_i\mid y_{<i}, I)$; expand and prune each step. Better than greedy ($k=1$).
- **Length normalization**: divide score by $(T)^\alpha$ to avoid favoring short sequences.
- **Teacher forcing**: during training, feed the **ground-truth** previous word (not the model's own prediction) — stabilizes training but can cause exposure bias; mitigated by scheduled sampling.

---

## 11. Representations: Character vs. Word

- **Word-level**: embeddings per word (large vocab, needs unknown-word handling).
- **Character-level**: smaller vocab, handles misspellings/NEs, longer sequences (harder for RNNs).
- **Subword (BPE)**: the common compromise (used in Transformers).

---

## 12. Beyond Captioning

- **Video**: extend RNN over frames; combine with CNN features per frame.
- **Handwriting / speech recognition**: bi-directional RNNs over time steps.
- **Video captioning / VQA**: encode frames + language, decode answer/caption.

---

## 13. LSTM/GRU Gradient Flow

The cell-state path in LSTM, $\mathbf{c}_t = f_t\odot\mathbf{c}_{t-1} + i_t\odot g_t$, gives a **constant** (additive, gated) path for gradients → they flow across many timesteps without vanishing. GRU's $z_t$ gate plays a similar role with fewer parameters. This is *why* they train on long sequences where vanilla RNNs fail.

> RNNs = weight-shared, time-unrolled networks; LSTMs/GRUs fix the gradient problem; attention + beam search unlock strong sequence generation (and paved the way for Transformers in Ch.16).
