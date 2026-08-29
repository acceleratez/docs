# Vision Transformer

> Source: CS1674 Ch.16. Builds from **attention** for seq2seq → the **Transformer** (self-attention, no recurrence) → **ViT** (image = patches of "words") → Swin, DINO, MAE, SAM. The dominant modern CV backbone.

## 1. From RNN seq2seq to Attention

### 1.1 RNN seq2seq bottleneck (Sutskever et al. 2014)
Encoder RNN: $\mathbf{h}_t = f_W(\mathbf{x}_t, \mathbf{h}_{t-1})$; final state $\mathbf{h}_T$ (or a context vector $c$) initializes the decoder. Problem: the decoder must keep *both* input context and its own state in one fixed-size vector → bottleneck.

### 1.2 Attention (Bahdanau et al. 2015)
At each decoder step, compute a **new context vector** that "looks at" the relevant input parts:
1. Alignment scores: $e_{t,i} = f_{\text{att}}(\mathbf{s}_{t-1}, \mathbf{h}_i)$.
2. Attention weights: $a_{t,i} = \mathrm{softmax}_i(e_{t,i})$.
3. Context: $\mathbf{c}_t = \sum_i a_{t,i}\,\mathbf{h}_i$.
4. Decode: $\mathbf{s}_t = g_U(\mathbf{y}_{t-1}, \mathbf{s}_{t-1}, \mathbf{c}_t)$.

Intuition: "estamos" attends to "we are" → $a_{11}\approx a_{12}\approx 0.45$. Attention quantitatively beats no-attention, especially on longer sentences.

### 1.3 Image captioning with attention (Xu et al. "Show, Attend and Tell", ICML 2015)
Use a CNN to extract a **grid of features** $\mathbf{h}_{i,j}$; at each word, compute alignment scores $e_{t,i,j} = f_{\text{att}}(\mathbf{s}_{t-1}, \mathbf{h}_{i,j})$, softmax → weights, context $\mathbf{c}_t = \sum_{i,j} a_{t,i,j}\mathbf{h}_{i,j}$. Each generated word attends to a different image region (e.g., "cat" → cat region, "sitting" → support region) — learned **grounding** without explicit supervision.

---

## 2. The Transformer (Vaswani et al. 2017, "Attention Is All You Need")

Sequence-to-sequence architecture using **only point-wise processing and attention** — no recurrence, no convolution.

- **Encoder**: receives the entire input sequence, outputs an encoded sequence of the same length.
- **Decoder**: predicts the next token conditioned on encoder output + previously predicted tokens.

### 2.1 Key–Value–Query (KVQ) attention
- Key vectors: $K = XW_K$
- Value vectors: $V = XW_V$
- Query vectors: $Q$ (from decoder, or $Q=XW_Q$ in self-attention)

**Scaled dot-product attention**:
$$E_{i,j} = \frac{Q_i \cdot K_j}{\sqrt{D}} \quad\text{or}\quad E = \frac{QK^\top}{\sqrt{D}}$$
$$A = \mathrm{softmax}(E,\ \text{dim}=1), \qquad Y = AV$$

The decoder produces a query describing what to focus on; dot-product with encoder keys gives alignment; values are pooled by the softmax weights. (Note: permuting queries reshuffles outputs; permuting keys/values reshuffles which values align to which query — attention is **order-agnostic**, hence positional encodings are needed.)

### 2.2 Self-attention
Within one sequence, $Q = XW_Q,\ K = XW_K,\ V = XW_V$ (same $X$). Enables each token to gather context from others ("encoding 'it' should focus on 'the animal'"). 

### 2.3 Positional encoding
Transformers have no inherent order sense, so add a function of position (sines/cosines) to each input embedding to encode token ordering.

### 2.4 Multi-head attention
Run $h$ attention heads in parallel on **different linear projections** of $Q,K,V$; concatenate and linearly project. Lets the model attend to different relationships at different positions.

### 2.5 Transformer block
A stack of blocks (Vaswani: $N=12$, dim $=512$, $6$ heads):
- **Multi-head self-attention** (the only interaction between inputs).
- **Add & Norm**: residual connection + layer normalization.
- **Feedforward**: two linear layers with ReLU between, applied per-vector.

### 2.6 Pros/Cons
- **Pros**: parallelizable (no sequential unroll), long-range dependencies, strong scaling.
- **Cons**: $O(n^2)$ in sequence length; needs positional encoding; data-hungry (benefits from huge corpora).

### 2.7 Scaling up
BERT (110M/340M), GPT-2 (1.5B), Megatron-LM (8.3B), Turing-NLG (17B), GPT-3 (175B), PaLM (540B) — scaling laws dominate modern LLMs.

---

## 3. Transformers for Vision

### Idea #1: self-attention inside CNNs
Add self-attention layers to a CNN (e.g., SAGAN, Zhang et al. 2019):
$$s_{ij} = f(\mathbf{x}_i)^\top g(\mathbf{x}_j), \quad \beta_{j,i}=\frac{e^{s_{ij}}}{\sum_i e^{s_{ij}}}, \quad \mathbf{o}_j = \sum_i \beta_{j,i}\, h(\mathbf{x}_i)$$
Adaptive, data-dependent receptive fields capture **non-local** structure.

### Idea #2: Transformer on top of a CNN backbone
E.g., DETR (Carion et al. ECCV 2020) — CNN features → Transformer encoder-decoder for end-to-end detection.

### Idea #3: Transformer on top of **patches** → ViT

#### Vision Transformer (Dosovitskiy et al. 2021, "An Image is Worth 16×16 Words")
- Split the image into **patches** (e.g., 16×16 pixels).
- Linearly project each patch + add positional embedding → a sequence of tokens.
- Feed into a standard Transformer **encoder**.
- For a 224×224 image with 14×14 patches → $16\times16 = 256$ tokens.

Variants: **BiT** (Big Transfer, ResNet), **ViT** (Base/Large/Huge; patch 14/16/32). ViT trained supervised then fine-tuned on ImageNet; claimed more compute-efficient than CNNs/hybrids at scale.

#### Swin Transformer (Liu et al. ICCV 2021)
**Hierarchical** vision transformer using **shifted windows** — computes self-attention locally within windows and shifts them across layers to enable cross-window interaction, giving multi-scale features suited to dense tasks (COCO detection/segmentation).

---

## 4. Self-Supervised Pre-Training

Avoid labels by designing proxy tasks:
- **Transformation prediction** (Gidaris et al. 2018): predict the rotation applied to an image.
- **Siamese methods**: maximize similarity between two augmented views of the same image; minimize across different images.

### DINO — Self-Distillation with No Labels (Caron et al. ICCV 2021)
- **Student–teacher** training with a distillation (cross-entropy) loss on softmax outputs.
- Tricks to avoid collapse:
  - **Stop-gradient** on the teacher (no backprop through teacher).
  - Teacher updated by **exponential moving average (EMA)** of the student.
  - **Centering + sharpening** (softmax with low temperature) on teacher output.
- Emergent property: the [CLS] token's attention maps localize objects without labels. (DINOv2, Oquab et al. 2024, extends to robust features.)

### Masked Autoencoders — MAE (He et al. CVPR 2022)
Mask a large fraction of patches; train the network to **reconstruct** the missing patches. Scales well as a vision learner; enables **visual prompting** (Bar et al. NeurIPS 2022) via inpainting.

---

## 5. Dense Prediction with Transformers: SAM

**Segment Anything Model (SAM)** (Kirillov et al. ICCV 2023) and **SAM2** (Ravi et al. ICLR 2025) promptable segmentation models built on transformer backbones — segment any object given a point/box/mask prompt, extended to **images and videos** in SAM2.

---

## 6. Summary

| Concept | Core math / idea |
|---|---|
| Attention | $c_t=\sum a_{t,i}h_i$, $a=\mathrm{softmax}(f_{\text{att}})$ |
| Scaled dot-product | $A=\mathrm{softmax}(QK^\top/\sqrt{D})$, $Y=AV$ |
| Self-attention | $Q=KW_Q$ from same sequence |
| Transformer block | multi-head attn → Add&Norm → FFN → Add&Norm |
| ViT | image → patches → tokens → Transformer encoder |
| Swin | hierarchical, shifted-window local attention |
| DINO / MAE | self-supervised (distillation / masked reconstruction) |
| SAM | promptable dense segmentation transformer |

> **Takeaway:** attention replaced recurrence; ViT showed patches-as-tokens let Transformers rival CNNs in vision; Swin adds hierarchy, DINO/MAE add label-free pre-training, SAM adds promptable dense prediction.

---

## 7. ViT: Concrete Architecture (Dosovitskiy et al. 2021)

1. **Patchify**: split $H\times W$ image into $P\times P$ patches → $N = (H/P)(W/P)$ patches (e.g., $224/16 = 14$ → $14\times14 = 196$ patches).
2. **Linear embed**: each flattened patch → $D$-dim vector via a learned projection.
3. **Prepend CLS token** (for classification) and add **positional embedding** (learned or sinusoidal).
4. **Transformer encoder**: $L$ blocks of (multi-head self-attention → Add&Norm → MLP → Add&Norm).
5. **MLP head** on the CLS token → class logits.

- **Inductive bias**: ViT has almost none (no locality/translation equivariance like CNNs) → needs **massive data** (JFT-300M) or strong augmentation (DeiT) to match CNNs.
- Variants: ViT-B/L/H with patch sizes 32/16/14.

---

## 8. Positional Embeddings & Inductive Bias

Because self-attention is permutation-invariant, position must be injected. Options: learned 1-D (ViT), 2-D (row/col), or sinusoidal. The lack of a convolution's locality prior is why ViT **underperforms CNNs on small data** but **scales better** with data/compute.

---

## 9. Swin Transformer (Detail)

- **Hierarchical**: patch size 4 at stage 1, then merge patches (like pooling) → multi-resolution feature maps → usable for detection/segmentation.
- **Shifted-window attention**: compute self-attention **locally within windows**; alternate between regular and **shifted** windows each block so information crosses window boundaries → global reception with $O(n)$ cost (not $O(n^2)$).

---

## 10. DINO Emergent Properties

Training ViT with DINO makes the **[CLS] token's self-attention maps** segment objects without any segmentation labels — evidence that self-supervised ViTs learn semantic structure. DINOv2 extends this to a strong universal feature extractor.

---

## 11. CNN vs. ViT

| | CNN | ViT |
|---|---|---|
| Inductive bias | locality, weight sharing | minimal |
| Data need | modest | very large (or DeiT) |
| Scaling | good | excellent |
| Dense tasks | native | needs hierarchical (Swin) |

> Modern CV often **hybridizes**: CNN stem + ViT body, or Swin for dense tasks. The Transformer is now the default backbone for both recognition and generation.
