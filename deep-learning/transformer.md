# Transformers

The Transformer architecture, introduced by Vaswani et al. in 2017, represents a paradigm shift in deep learning. By replacing recurrence with attention mechanisms, Transformers enable highly parallelizable sequence processing, effective modeling of long-range dependencies, and scalable pretraining on massive text corpora. This article covers the conceptual foundations, architectural details, training paradigms, and extensions of Transformers.

---

## Word Representations

Before understanding how Transformers process language, we must consider how words are represented as numerical vectors that machines can compute with.

### The Meaning of a Word

> **Denotational semantics:** meaning arises from the relationship between a signifier (symbol) and the signified (idea or thing).

Early attempts to codify word meaning in computers relied on resources like WordNet, a thesaurus containing synonym sets and hypernyms (IS-A relationships). While valuable, such resources suffer from critical limitations:

- Missing nuance. For example, "proficient" is listed as a synonym for "good," but this is only correct in certain contexts.
- Inability to capture new or evolving meanings (e.g., "wicked," "ninja," "genius" used as slang).
- Subjectivity and reliance on human labor to create and adapt.
- No principled way to compute accurate word similarity.

### One-Hot Vectors and Their Limitations

In traditional NLP, words are treated as discrete symbols represented by one-hot vectors:

```
motel = [0 0 0 0 0 0 0 0 0 0 1 0 0 0 0]
hotel = [0 0 0 0 0 0 0 1 0 0 0 0 0 0 0]
```

The vector dimension equals the vocabulary size (potentially 500,000 or more). These vectors are orthogonal: there is no natural notion of similarity between "motel" and "hotel," even though they are semantically related. In applications like web search, a query for "Seattle motel" should match documents containing "Seattle hotel," but one-hot representations provide no mechanism for this.

### Distributional Semantics

> **Distributional semantics:** A word's meaning is given by the words that frequently appear close by. "You shall know a word by the company it keeps" (J. R. Firth, 1957).

When a word $w$ appears in text, its context is the set of words that appear nearby (within a fixed-size window). By aggregating the many contexts in which $w$ appears, we can build a rich representation of its meaning:

```
...government debt problems turning into banking crises as happened in 2009...
...saying that Europe needs unified banking regulation to replace the hodgepodge...
...India has just given its banking system a shot in the arm...
```

These context words collectively represent the meaning of "banking."

### Word Vectors (Embeddings)

Instead of sparse one-hot vectors, we build dense vectors for each word, chosen so that the vector for a word is similar to vectors of words that appear in similar contexts. These are called **word embeddings** or **word representations** — a distributed representation where meaning is encoded across all dimensions:

$$
\text{banking} = \begin{bmatrix} 0.286 \\ 0.792 \\ -0.177 \\ -0.107 \\ 0.109 \\ -0.542 \\ 0.349 \\ 0.271 \end{bmatrix}
$$

### Word2Vec

Word2Vec (Mikolov et al., 2013) is a framework for learning word vectors from large text corpora. The core idea:

- Every word in a fixed vocabulary is represented by a vector.
- For each position $t$ in the text, there is a center word $c$ and context (outside) words $o$ within a window of fixed size $m$.
- Use the similarity of the word vectors for $c$ and $o$ to calculate $P(o \mid c)$ — the probability of a context word given the center word.
- Adjust the word vectors to maximize this probability across all positions.

The objective function minimizes the average negative log likelihood:

$$
J(\theta) = -\frac{1}{T} \sum_{t=1}^{T} \sum_{-m \leq j \leq m, j \neq 0} \log P(w_{t+j} \mid w_t; \theta)
$$

Each word $w$ is associated with two vectors: $v_w$ when $w$ is a center word and $u_w$ when $w$ is a context word. For a center word $c$ and context word $o$, the probability is computed via softmax:

$$
P(o \mid c) = \frac{\exp(u_o^\top v_c)}{\sum_{w \in V} \exp(u_w^\top v_c)}
$$

---

## Limitations of Recurrent Neural Networks

Before Transformers, recurrent neural networks (RNNs) and their variants (LSTMs, GRUs) dominated sequence modeling. Despite their success, RNNs have fundamental limitations that motivated the development of attention-based architectures.

### Linear Interaction Distance

RNNs process sequences one token at a time, meaning that information must travel through $O(\text{sequence length})$ steps for distant word pairs to interact. This creates two problems:

- **Vanishing/exploding gradients** make it difficult to learn long-distance dependencies.
- **Linear word order is baked into the architecture**, which may not be the ideal way to model sentence structure. A modifier at the beginning of a sentence may need to agree with a word at the end, but the RNN must carry that information through many time steps.

### Lack of Parallelizability

Forward and backward passes in RNNs have $O(\text{sequence length})$ unparallelizable operations. Future hidden states cannot be computed before past hidden states, which prevents GPUs from exploiting their massive parallelism. This severely inhibits training on very large datasets.

### Alternative Approaches Considered

**Word window models (1D convolution)** aggregate local contexts and have unparallelizable operations that are not tied to sequence length. However, stacking word window layers allows interaction between farther words only up to a limited range determined by the receptive field. For very long sequences, long-distance context is simply ignored.

**Attention** offers a more promising solution. Unlike recurrence, attention treats each word's representation as a query to access and incorporate information from a set of values. The number of unparallelizable operations is not tied to sequence length, and all words interact at every layer.

---

## Attention Mechanism

Attention provides a way for a model to focus on relevant parts of the input when producing each part of the output. It was originally developed for sequence-to-sequence models to address the bottleneck of encoding an entire input sequence into a single fixed-length vector.

### Sequence-to-Sequence with Attention

In a standard sequence-to-sequence model with attention:

- An encoder RNN processes the source sentence and produces a sequence of hidden states $h_1, h_2, \dots, h_T$.
- At each decoder timestep $t$, the decoder hidden state $s_t$ is used to compute attention scores $e_t$ over all encoder hidden states.
- A softmax is applied to obtain an attention distribution $\alpha_t$, which sums to 1.
- A weighted sum of encoder hidden states produces the attention output $a_t$:

$$
a_t = \sum_i \alpha_{t,i} h_i
$$

- The attention output is concatenated with the decoder hidden state and used to predict the next output token.

### Queries, Keys, and Values

> **Attention** operates on three components:
> - **Queries** ($q$): what we are looking for.
> - **Keys** ($k$): what each input position can offer as a match.
> - **Values** ($v$): the actual information associated with each input position.

Formally, we have:

- Queries $q^1, q^2, \dots, q^T$, where each $q^i \in \mathbb{R}^d$
- Keys $k^1, k^2, \dots, k^T$, where each $k^i \in \mathbb{R}^d$
- Values $v^1, v^2, \dots, v^T$, where each $v^i \in \mathbb{R}^d$

The dot-product attention operation computes:

$$
e_{ij} = q^i \cdot k^j
$$

$$
\alpha_{ij} = \frac{\exp(e_{ij})}{\sum_{j'} \exp(e_{ij'})}
$$

$$
\text{output}^i = \sum_j \alpha_{ij} v^j
$$

The attention scores $e_{ij}$ represent the affinity between query $i$ and key $j$. Softmax converts these into a probability distribution, and the output for each query is a weighted sum of all value vectors.

### Key-Query-Value Attention in Detail

In the Transformer, given input vectors $x^1, \dots, x^T$ where $x^i \in \mathbb{R}^d$, the keys, queries, and values are computed using learned linear projections:

- $k^i = K x^i$, where $K \in \mathbb{R}^{d \times d}$ is the key matrix.
- $q^i = Q x^i$, where $Q \in \mathbb{R}^{d \times d}$ is the query matrix.
- $v^i = V x^i$, where $V \in \mathbb{R}^{d \times d}$ is the value matrix.

These matrices allow different aspects of the input vectors to be used and emphasized in each of the three roles.

In matrix form, let $X = [x^1; \dots; x^T] \in \mathbb{R}^{T \times d}$ be the concatenation of input vectors. The output is:

$$
\text{output} = \text{softmax}\left(\frac{XQ (XK)^\top}{\sqrt{d}}\right) \times XV
$$

The product $XQ(XK)^\top \in \mathbb{R}^{T \times T}$ contains all pairwise attention scores.

---

## Self-Attention

> **Self-attention** is a special case of attention where the queries, keys, and values all come from the same source (the same sequence).

In a self-attention layer, each position in the input sequence attends to every position (including itself), allowing the model to capture dependencies regardless of distance. The key operations are:

- Key vectors: $k^i = x^i K$
- Query vectors: $q^i = x^i Q$
- Value vectors: $v^i = x^i V$
- Alignment scores: $e_{ij} = q^j \cdot k^i / \sqrt{D}$
- Attention weights: $\alpha_{ij} = \text{softmax}(e_{ij})$
- Output: $y^j = \sum_i \alpha_{ij} v^i$

### Multi-Headed Attention

A single attention head can only focus on one type of relationship at a time. However, language involves many simultaneous relationships: subject-verb agreement, object reference, modifier attachment, and more. Multi-headed attention addresses this by running multiple attention operations in parallel.

Let $h$ be the number of attention heads. Each head $\ell$ has its own projection matrices $Q^\ell, K^\ell, V^\ell \in \mathbb{R}^{d \times d/h}$:

- For each head $\ell$: $\text{output}^\ell = \text{softmax}\left(\frac{XQ^\ell (K^\ell X)^\top}{\sqrt{d/h}}\right) \times XV^\ell$, where $\text{output}^\ell \in \mathbb{R}^{T \times d/h}$
- The outputs of all heads are concatenated and projected: $\text{output} = Y[\text{output}^1; \dots; \text{output}^h]$ where $Y \in \mathbb{R}^{d \times d}$

Each head can attend to different patterns, construct value vectors differently, and the total computation is the same as single-head self-attention.

### Scaled Dot-Product Attention

When the dimensionality $d$ becomes large, dot products between vectors grow large in magnitude. This pushes softmax inputs into regions where gradients become extremely small, hindering training. The solution is to scale the dot products by $\sqrt{d}$:

$$
\text{output} = \text{softmax}\left(\frac{QK^\top}{\sqrt{d}}\right) V
$$

This scaling keeps the variance of the dot products stable regardless of dimensionality, ensuring healthy gradients during training.

---

## Positional Encoding

Self-attention is inherently permutation-invariant: it treats the input as an unordered set. Since word order is crucial for understanding language, we must inject position information into the model.

### Concatenating Position Representations

Each sequence index $i \in \{1, \dots, T\}$ is represented as a position vector $p^i \in \mathbb{R}^d$. These position vectors are added to the input embeddings before they enter the self-attention layers:

$$
\tilde{v}^i = v^i + p^i \quad \tilde{q}^i = q^i + p^i \quad \tilde{k}^i = k^i + p^i
$$

In deep self-attention networks, this is typically done at the first layer. The position vectors can either be learned or constructed from a fixed function.

### Sinusoidal Positional Encoding

The original Transformer uses sinusoidal functions of varying frequencies:

$$
p^i = \begin{bmatrix} \sin(i / 10000^{0/d}) \\ \cos(i / 10000^{0/d}) \\ \sin(i / 10000^{2/d}) \\ \cos(i / 10000^{2/d}) \\ \vdots \\ \sin(i / 10000^{(d-2)/d}) \\ \cos(i / 10000^{(d-2)/d}) \end{bmatrix}
$$

**Advantages:**
- Periodicity suggests that absolute position may not be as important as relative position.
- May extrapolate to longer sequences than seen during training, as the periodic patterns restart.
- Deterministic and bounded.

**Disadvantage:** Not learnable — the encoding function is fixed.

### Learned Positional Encoding

An alternative is to learn a lookup table containing $T \times d$ parameters, where each row corresponds to a position's embedding vector. This is simple and can adapt to the specific data distribution, but cannot extrapolate to sequence lengths beyond those seen during training.

**Desiderata for positional encoding functions:**
1. Output a unique encoding for each time-step (word position in a sentence).
2. Distance between any two time-steps should be consistent across sentences with different lengths.
3. The model should generalize to longer sentences without extra effort; values should be bounded.
4. The encoding must be deterministic.

---

## Transformer Architecture

The Transformer is a non-recurrent sequence-to-sequence encoder-decoder model. The original application was machine translation, where the model predicts each translated word given a parallel corpus, with standard cross-entropy loss on top of a softmax classifier.

### Architecture Overview

At the top level, the Transformer consists of:

- **Input processing:** Word embeddings plus positional encodings for the source sequence.
- **Encoder stack:** $N$ identical encoder layers that process the source.
- **Decoder stack:** $N$ identical decoder layers that generate the target, attending both to previous decoder outputs (self-attention) and to encoder outputs (cross-attention).
- **Output layer:** A linear projection followed by softmax over the target vocabulary.

### Essential Building Blocks

A self-attention building block requires four components:

1. **Self-attention:** The core mechanism enabling each position to attend to all positions.
2. **Position representations:** Encoding sequence order, since self-attention is permutation-invariant.
3. **Nonlinearities:** Applied at the output of each self-attention block, typically as a feed-forward network, since stacking pure self-attention layers would just re-average value vectors without introducing nonlinearity.
4. **Masking:** In decoders, future positions are masked to prevent information leakage, enabling parallelized training while respecting the autoregressive property.

---

## Transformer Encoder

Each encoder layer consists of two sub-layers:

1. **Multi-head self-attention**
2. **Feed-forward network**

Both sub-layers are wrapped with residual connections and layer normalization.

### Residual Connections

Instead of a standard transformation $X^{(i)} = \text{Layer}(X^{(i-1)})$, residual connections use:

$$
X^{(i)} = X^{(i-1)} + \text{Layer}(X^{(i-1)})
$$

This means the layer only needs to learn the residual (difference) from the previous representation. Residual connections are thought to make the loss landscape considerably smoother, enabling easier optimization of deep networks.

### Layer Normalization

Layer normalization normalizes across the feature dimension for each individual vector, cutting down on uninformative variation in hidden vector values. For a vector $x \in \mathbb{R}^d$:

$$
\mu = \frac{1}{d} \sum_{j=1}^d x_j \qquad \sigma = \sqrt{\frac{1}{d} \sum_{j=1}^d (x_j - \mu)^2}
$$

$$
\text{output} = \frac{x - \mu}{\sigma + \epsilon} \odot \gamma + \beta
$$

Where $\gamma \in \mathbb{R}^d$ and $\beta \in \mathbb{R}^d$ are learned gain and bias parameters. LayerNorm's success may be partly due to its effect on normalizing gradients.

### Feed-Forward Network

After self-attention, a position-wise feed-forward network is applied independently to each position:

$$
\text{FFN}(x) = W_2 \cdot \text{ReLU}(W_1 \cdot x + b_1) + b_2
$$

This introduces elementwise nonlinearity, since self-attention alone only performs weighted averages. The FFN processes the result of attention aggregation, allowing the model to transform the gathered information.

### Encoder Block Diagram

The data flow through a single encoder layer follows:

1. Input vectors enter multi-head self-attention.
2. A residual connection adds the input to the attention output, followed by layer normalization.
3. The normalized result passes through a feed-forward network.
4. A second residual connection adds the pre-FFN value, followed by layer normalization.
5. The output feeds into the next encoder layer.

---

## Transformer Decoder

Each decoder layer consists of three sub-layers:

1. **Masked multi-head self-attention** (over previous decoder outputs)
2. **Multi-head cross-attention** (attending to encoder outputs)
3. **Feed-forward network**

All three are wrapped with residual connections and layer normalization.

### Masked Self-Attention

In the decoder, predictions should depend only on previously generated tokens, not on future tokens. To enable parallelized training while respecting this constraint, future positions are masked by setting their attention scores to $-\infty$ before softmax:

$$
e_{ij} = \begin{cases} q^i \cdot k^j, & j < i \\ -\infty, & j \geq i \end{cases}
$$

This ensures that position $i$ cannot attend to positions $j \geq i$, and the softmax over $-\infty$ values yields zero attention weights for future positions.

### Cross-Attention

The decoder's cross-attention layer allows it to attend to the encoder's output. Given:

- Encoder output vectors $h^1, \dots, h^T$ (acting as keys and values)
- Decoder input vectors $z^1, \dots, z^T$ (acting as queries)

The keys and values come from the encoder (like a memory bank), while the queries come from the decoder:

- $k^i = K h^i$, $v^i = V h^i$ (from encoder)
- $q^i = Q z^i$ (from decoder)

In matrix form, with $H$ as the concatenation of encoder vectors and $Z$ as the concatenation of decoder vectors:

$$
\text{output} = \text{softmax}\left(\frac{ZQ (HK)^\top}{\sqrt{d}}\right) \times HV
$$

This is essentially the same operation as self-attention, but the queries originate from the decoder while keys and values come from the encoder.

---

## Quadratic Complexity and Solutions

### The Quadratic Cost Problem

One of the benefits of self-attention over recurrence is high parallelizability. However, the total number of operations grows as $O(T^2 \cdot d)$, where $T$ is the sequence length and $d$ is the dimensionality. This is because all $T \times T$ pairs of interactions must be computed:

$$
\text{attention scores} = XQ(XK)^\top \in \mathbb{R}^{T \times T}
$$

For a single short sentence, $T \leq 30$ (or bounded to roughly 512). But for long documents where $T \geq 10{,}000$, the $O(T^2)$ cost becomes prohibitive. In contrast, recurrent models scale as $O(T)$.

### Approaches to Reducing Complexity

**Linformer** (Wang et al., 2020): Maps the sequence length dimension to a lower-dimensional space for keys and values, reducing complexity to $O(T)$.

> Key idea: project the $T \times d$ key and value matrices down to $k \times d$ where $k \ll T$, so that the attention computation becomes $O(T \cdot k)$ instead of $O(T^2)$.

**BigBird** (Zaheer et al., 2020): Replaces all-pairs interactions with a family of sparse interaction patterns, including local windows, global tokens that attend to everything, and random interactions. This reduces the quadratic cost while maintaining the ability to capture long-range dependencies.

Both of these approaches, and many others, demonstrate that the quadratic cost of standard self-attention can be substantially mitigated, enabling Transformers to scale to much longer sequences.

---

## Pretraining Paradigm

In modern NLP, most or all parameters of neural networks are initialized via pretraining. Pretraining methods hide parts of the input from the model and train the model to reconstruct those parts. This has proven exceptionally effective at building strong representations of language and providing parameter initializations for downstream NLP tasks.

### Language Modeling as Pretraining

Language modeling is the task of modeling $P(w_t \mid w_{1:t-1})$, the probability distribution over words given their past context. Since text data is abundant (especially in English), language modeling provides an ideal self-supervised pretraining objective:

- Train a neural network to perform language modeling on a large amount of text.
- Save the network parameters.
- Finetune the parameters on a downstream task with limited labeled data.

### The Pretraining / Finetuning Paradigm

- **Step 1 — Pretraining:** Train on a large corpus using a self-supervised objective (e.g., language modeling). The model learns general linguistic knowledge — syntax, semantics, world knowledge, and reasoning patterns.
- **Step 2 — Finetuning:** Adapt the pretrained model to a specific downstream task using task-specific labeled data. Gradients backpropagate through the entire network, but starting from a strong initialization dramatically reduces the amount of labeled data required.

### Pretraining Strategies by Architecture

The neural architecture influences both the pretraining objective and the natural use cases:

- **Encoders:** Get bidirectional context — can condition on both past and future. Cannot use standard language modeling. Use masked language modeling instead.
- **Decoders:** Naturally suited for language modeling, as they predict the next token given previous ones. Can be used as generators and can also be finetuned with a classifier on the last token for classification tasks.
- **Encoder-Decoders (e.g., T5):** Combine the strengths of both. Use span corruption pretraining, where spans of the input are replaced with placeholders and the decoder must reconstruct them.

### What Pretraining Learns

Pretrained models acquire a wide range of linguistic and world knowledge:

- **Trivia:** "Stanford University is located in ___, California."
- **Syntax:** "I put ___ fork down on the table."
- **Coreference:** "The woman walked across the street, checking for traffic over ___ shoulder."
- **Lexical semantics / topic:** "I went to the ocean to see the fish, turtles, seals, and ___."
- **Sentiment:** "The movie was ___."
- **Basic reasoning:** "Iroh went into the kitchen to make some tea. Standing next to Iroh, Zuko pondered his destiny. Zuko left the ___."

Models also learn and can amplify biases present in the training data, including racism, sexism, and other harmful stereotypes.

---

## BERT

**B**idirectional **E**ncoder **R**epresentations from **T**ransformers (Devlin et al., 2018) introduced the Masked Language Model (MLM) objective and released pretrained Transformer encoder weights that achieved state-of-the-art results across a wide range of NLP tasks.

### Masked Language Modeling

Since encoders have bidirectional context, standard left-to-right language modeling is not applicable. The solution is to mask out a random subset of input tokens and train the model to predict them:

1. Randomly select 15% of (sub)word tokens for prediction.
2. For each selected token:
   - 80% of the time: replace with the special `[MASK]` token.
   - 10% of the time: replace with a random token.
   - 10% of the time: leave unchanged (but still predict it).
3. The encoder processes the modified input, and only the masked positions contribute to the loss.

The 10% random replacement and 10% unchanged cases prevent the model from becoming complacent. Since no `[MASK]` tokens appear during finetuning, the model must learn to build strong representations of all words, not just masked ones.

> **Too little masking (e.g., <15%):** Too expensive to train — not enough learning signal per example.
> **Too much masking (e.g., >15%):** Not enough context remains for accurate prediction.

### Next Sentence Prediction

BERT was additionally trained on a Next Sentence Prediction (NSP) task: given two text segments A and B, predict whether B actually follows A in the original corpus. This was designed to teach the model about relationships between sentences. Later work (e.g., RoBERTa) found NSP to be unnecessary and removed it without hurting performance.

### BERT Specifications

Two model sizes were released:

| Model | Layers | Hidden Size | Attention Heads | Parameters |
|-------|--------|-------------|-----------------|------------|
| BERT-base | 12 | 768 | 12 | 110M |
| BERT-large | 24 | 1024 | 16 | 340M |

Trained on BooksCorpus (800M words) and English Wikipedia (2,500M words). Pretraining used 64 TPU chips for 4 days. Finetuning is practical on a single GPU — "pretrain once, finetune many times."

### BERT's Impact and Extensions

BERT achieved new state-of-the-art results on diverse benchmarks including question paraphrase detection (QQP), sentiment analysis (SST-2), natural language inference (QNLI, RTE, MNLI), semantic textual similarity (STS-B), and linguistic acceptability (CoLA).

**RoBERTa** (Liu et al., 2019): Demonstrated that training BERT for longer, on more data, with larger batches, and removing the NSP objective yields significant improvements — more compute and more data alone can improve pretraining.

**SpanBERT** (Joshi et al., 2020): Masks contiguous spans of words rather than individual tokens, creating a harder and more useful pretraining task. For example, "It's irresponsibly good" might become "It's [MASK] good" rather than masking individual subwords.

---

## GPT

**G**enerative **P**retrained **T**ransformer (Radford et al., 2018) demonstrated the power of pretraining Transformer decoders as language models.

### GPT Architecture and Training

- 12-layer Transformer decoder.
- 768-dimensional hidden states, 3072-dimensional feed-forward hidden layers.
- Byte-pair encoding with 40,000 merges.
- Trained on BooksCorpus: over 7,000 unique books containing long spans of contiguous text, suitable for learning long-distance dependencies.

### Finetuning GPT

For finetuning on tasks like natural language inference, inputs are formatted as a single sequence of tokens for the decoder. For example, to classify a premise-hypothesis pair:

```
[START] The man is in the doorway [DELIM] The person is near the door [EXTRACT]
```

A linear classifier is applied to the representation of the `[EXTRACT]` token.

GPT can be finetuned in two modes:

- **As a generator:** Finetune the language modeling head for tasks where the output is a sequence (e.g., dialogue generation, summarization). The pretrained linear layer $A, b$ is reused.
- **As a classifier:** Attach a randomly initialized classifier on the last token's hidden state and finetune for classification tasks (e.g., sentiment analysis, natural language inference).

### GPT-2 and Convincing Generation

GPT-2, a larger version trained on more data, demonstrated that pretrained language model decoders can produce relatively convincing samples of natural language. The ability to generate coherent, contextually relevant text captured widespread attention and highlighted the potential of scaling up pretrained language models.

---

## GPT-3 and In-Context Learning

### The Scale Shift

While earlier models relied on finetuning for task-specific performance, extremely large language models exhibit a new capability: **in-context learning**. GPT-3, with 175 billion parameters (compared to T5's 11 billion), performs some form of learning without any gradient updates, simply from examples provided within its context window.

### How In-Context Learning Works

The user provides a prompt that includes a few input-output examples demonstrating the desired task. The model then produces the output for a new input, all within a single forward pass:

```
thanks -> merci
hello -> bonjour
mint -> menthe
otter ->
```

GPT-3 completes this with "loutre," having inferred the translation task from the provided examples alone. The in-context examples specify the task, and the model's conditional distribution mimics performing that task — all without any parameter updates.

### Implications

In-context learning blurs the line between training and inference. It suggests that at sufficient scale, language models internalize a wide range of task-solving behaviors that can be activated through prompting. This has led to the development of prompt engineering as a discipline and has inspired few-shot and zero-shot evaluation paradigms.

---

## Transformers Beyond Language

### Vision Transformer (ViT)

Dosovitskiy et al. (2021) demonstrated that a pure Transformer architecture can be applied directly to images with minimal modifications, achieving competitive results with convolutional neural networks. The key idea:

- Split an image into fixed-size patches (e.g., 16×16 pixels).
- Linearly embed each patch into a vector (analogous to word embeddings).
- Add positional encodings to retain spatial information.
- Feed the sequence of patch embeddings into a standard Transformer encoder.
- Classify using the representation of a special `[CLS]` token or via global average pooling.

When pretrained on sufficiently large datasets and transferred to smaller benchmarks, ViT matches or exceeds state-of-the-art convolutional networks while requiring substantially fewer computational resources.

### Cross-Modal Transformers

Cross-modal Transformers extend the architecture to jointly model multiple modalities, such as text and images. Models like **UNITER** (Chen et al., 2019) and **LXMERT** (Tan and Bansal, 2019) learn universal image-text representations by applying self-attention and cross-attention over features from both modalities.

These models are typically pretrained on large image-text paired datasets with objectives that include:

- Masked language modeling over text tokens.
- Masked region prediction over image regions.
- Image-text matching (predicting whether an image-caption pair is aligned).

The result is a powerful multimodal representation that transfers effectively to tasks like visual question answering, image captioning, and visual reasoning.

---

## Cost of Training

The scale of pretraining has grown dramatically, reflecting both the increasing model sizes and the computational resources required:

| Model | Date | Training Cost |
|-------|------|---------------|
| ULMFiT | Jan 2018 | 1 GPU day |
| GPT | Jun 2018 | ~240 GPU days |
| BERT | Oct 2018 | ~320–560 GPU days (or 64 TPU × 4 days) |
| GPT-2 | Feb 2019 | ~2048 TPU v3 days |

This rapid escalation has driven the development of specialized hardware (TPUs, GPU clusters) and has made large-scale pretraining the dominant paradigm in NLP and beyond.

---

## Summary

The Transformer architecture replaced recurrence with attention, enabling:

- **Parallel computation** across sequence positions during training.
- **Direct modeling of long-range dependencies** without gradient attenuation over many time steps.
- **Scalable pretraining** on massive corpora using self-supervised objectives.
- **Transfer learning** via the pretraining-finetuning paradigm, where a single pretrained model can be adapted to many downstream tasks.
- **Cross-domain applicability**, extending from NLP to vision and multimodal learning.

The innovations introduced with Transformers — self-attention, multi-headed attention, positional encoding, residual connections, layer normalization, and scaled dot-product attention — have become foundational building blocks for modern deep learning systems.
