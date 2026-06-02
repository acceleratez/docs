---
title: 推理两阶段：Prefill和Decode
description: Prefill与Decode阶段原理、计算复杂度分析、优化方法详解
---

# 推理两阶段：Prefill 和 Decode

在基于 Transformer 的大模型推理中，整个生成过程可分为两大阶段：

1. **预填充（Prefill）阶段**：对完整的输入 prompt 进行一次性并行计算，为每一个 token 生成并缓存键（Key）和值（Value）向量（即 KV Cache）。这一步只需运行一次，缓存内容将用于后续的生成步骤。

2. **解码（Decode）阶段**：模型以自回归方式逐步生成新 token。每一轮仅需计算当前要生成的 token，并与此前缓存的 KV（包括用户查询和已生成的 token）进行注意力计算，避免对整个历史序列重复计算。

## Prefill 阶段

- **Token 化**：输入为批大小为 `batch_size` 的若干 prompt，每个 prompt 被处理为长度为 `seq_len` 的 Token 序列。

- **嵌入层**：这些 Token 序列被映射为隐藏向量 `X`，形状为 `(batch_size, seq_len, hidden_dim)`。

- **线性映射**：通过权重矩阵 $W_Q, W_K, W_V$，分别计算得到 $Q, K, V$，并重塑为 `(batch_size, num_heads, seq_len, head_dim)`。

- **KV Cache 缓存**：计算得到的 $K$ 和 $V$ 矩阵被缓存下来，供后续解码阶段使用。

- **注意力计算**：

$$
A = \text{softmax}\left(\frac{Q \cdot K^T}{\sqrt{d}}\right)
$$

其中 $A$ 的形状为 `(batch_size, num_heads, seq_len, seq_len)`，计算复杂度为 $O(batch\_size \times seq\_len^2 \times hidden\_dim)$。

$$
O = A \cdot V
$$

随后重塑为 `(batch_size, seq_len, hidden_dim)` 并传递到下一层，计算复杂度同上。

- **生成第一个 token**：在工程实践中，为减少一次显存读写和前向传播开销，通常直接利用 prompt 最后一个位置的 hidden state 来生成第一个 token。

**为什么要做 Prefill？**

- **避免重复计算**：如果不在 Prefill 阶段缓存 KV，每生成一个新 token 都需要对整个历史序列重新跑完整的自注意力计算，复杂度为 $O(seq\_len^2)$，效率极低。

- **提高 GPU 利用率**：Prefill 阶段是典型的**计算密集型任务**，输入 prompt 是完整的，可以通过高度并行最大化发挥 GPU 的算力优势。

- **便于并行优化**：将 Prefill 和 Decode 解耦后，可以分别在不同的 GPU 上执行。Prefill 适合**张量并行**来降低 TTFT，Decode 适合**数据并行或流水线并行**来提升 TPOT。参见论文 [DistServe](important-inference-papers.md)。

### 计算复杂度分析

Prefill 阶段的主要计算开销来自 Transformer 的前向传播，具体包括：

1. **嵌入层**：$O(batch\_size \times seq\_len \times hidden\_dim)$，通常可忽略不计。

2. **线性投影**：每个 Transformer 层包含 $W_Q, W_K, W_V, W_O$ 四个投影矩阵，每个矩阵的计算复杂度为 $O(batch\_size \times seq\_len \times hidden\_dim^2)$。

3. **自注意力计算**：这是 Prefill 阶段的主要计算瓶颈，复杂度为 $O(batch\_size \times num\_heads \times seq\_len^2 \times head\_dim)$，即 $O(batch\_size \times seq\_len^2 \times hidden\_dim)$。

4. **FFN 层**：每个 Transformer 层包含两个全连接层，计算复杂度为 $O(batch\_size \times seq\_len \times hidden\_dim \times ffn\_dim)$，其中 $ffn\_dim$ 通常为 $4 \times hidden\_dim$。

**总体复杂度**：对于一个 $L$ 层的 Transformer 模型，Prefill 阶段的总计算复杂度为：

$$
O\left(L \times batch\_size \times seq\_len \times \left(hidden\_dim^2 + seq\_len \times hidden\_dim\right)\right)
$$

当 $seq\_len \gg hidden\_dim$ 时，自注意力计算成为主要瓶颈；当 $hidden\_dim \gg seq\_len$ 时，线性投影成为主要瓶颈。在实际大模型推理中，通常 $seq\_len$ 较大，因此自注意力计算是主要优化目标。

### 优化方向详细说明

1. **FlashAttention**：通过分块计算和硬件级优化，将自注意力计算的 $O(seq\_len^2)$ 显存占用降低为 $O(seq\_len)$，同时提升计算速度。其核心思想是将 $Q, K, V$ 分块加载到 SRAM 中，避免频繁访问 HBM。

2. **张量并行（Tensor Parallelism）**：将权重矩阵切分到多个 GPU 上，每个 GPU 计算部分结果后通过 AllReduce 通信合并。适合 Prefill 阶段的高并行计算需求。

3. **Chunked Prefill**：将长 prompt 分块处理，每个 chunk 独立计算 KV Cache，然后拼接。可以降低单次计算的显存峰值，但会增加计算次数。

4. **Prefix Caching**：对于相同前缀的多个请求，缓存其 KV Cache 并复用，避免重复计算。特别适合多轮对话和 RAG 场景。

## Decode 阶段

- **输入准备**：使用 Prefill 阶段已计算并存储的 **KV Cache**，以及**当前轮刚生成的 token**。

- **嵌入层**：在第 $t$ 步，将新生成的 token 转换为嵌入向量，计算得到 $Q_t, K_t, V_t$，并将 $K_t, V_t$ 更新到 KV Cache 中。

- **计算注意力**：基于 $Q_t$ 和现有的 KV Cache 进行注意力计算，计算复杂度为 $O(seq\_len)$，相比 Prefill 阶段大幅降低。

- **生成下一个 token**：将最后一层的注意力输出经过线性层和 softmax，得到下一个 token 的概率分布，根据解码策略（greedy search、beam search 等）选出下一个 token。

Decode 阶段是典型的**通信密集型**任务，主要受限于显存带宽。每次 decode 都需要访问和更新 KV Cache，随着生成内容长度增加，对 GPU 内存带宽的压力随之增大。

### 计算复杂度分析

Decode 阶段的主要计算开销分析：

1. **线性投影**：每个 Transformer 层的 $W_Q, W_K, W_V, W_O$ 投影矩阵，对于单个 token 的计算复杂度为 $O(hidden\_dim^2)$。

2. **自注意力计算**：由于只有 1 个 token 的 $Q$ 向量，计算复杂度为 $O(seq\_len \times hidden\_dim)$，显著低于 Prefill 阶段。

3. **KV Cache 访问**：需要读取完整的 KV Cache（$2 \times seq\_len \times hidden\_dim$），这是主要的内存带宽瓶颈。

4. **FFN 层**：计算复杂度为 $O(hidden\_dim \times ffn\_dim)$。

**总体复杂度**：对于生成 $T$ 个 token 的 Decode 阶段，总计算复杂度为：

$$
O\left(L \times T \times \left(hidden\_dim^2 + seq\_len \times hidden\_dim\right)\right)
$$

**性能瓶颈分析**：Decode 阶段的主要瓶颈是**内存带宽**而非计算能力。以 LLaMA-7B 为例，KV Cache 的大小为 $2 \times L \times seq\_len \times hidden\_dim \times sizeof(dtype)$，当 $seq\_len=2048$ 时，单个请求的 KV Cache 约为 1GB，频繁的读写操作对内存带宽要求极高。

### 优化方向详细说明

1. **PagedAttention**：借鉴操作系统虚拟内存的思想，将 KV Cache 划分为固定大小的块（page），通过页表管理 KV Cache 的分配和释放，避免内存碎片化，提升显存利用率。

2. **Continuous Batching**：动态调整批次大小，当一个请求完成后立即将新的请求加入批次，而不是等待整个批次完成。可以显著提升吞吐量。

3. **KV Cache 压缩**：通过量化、剪枝或低秩近似等方法减少 KV Cache 的大小，降低内存带宽压力。例如 GQA（Grouped-Query Attention）通过减少 KV 头的数量来压缩 KV Cache。

4. **投机解码（Speculative Decoding）**：使用小模型快速生成多个候选 token，然后用大模型并行验证，可以减少串行解码步骤，提升吞吐量。

5. **异步流水线**：将 Prefill 和 Decode 阶段分配到不同的 GPU 上异步执行，避免资源争抢，参见 [DistServe](important-inference-papers.md)。

## 代码示例

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadAttentionWithKVCache(nn.Module):
    def __init__(self, hidden_dim, num_heads):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.num_heads = num_heads
        self.head_dim = hidden_dim // num_heads

        self.q_proj = nn.Linear(hidden_dim, hidden_dim)
        self.k_proj = nn.Linear(hidden_dim, hidden_dim)
        self.v_proj = nn.Linear(hidden_dim, hidden_dim)
        self.out_proj = nn.Linear(hidden_dim, hidden_dim)

        self.k_cache = None
        self.v_cache = None

    def _split_heads(self, x):
        batch, seq_len, _ = x.size()
        x = x.view(batch, seq_len, self.num_heads, self.head_dim)
        return x.permute(0, 2, 1, 3)

    def _combine_heads(self, x):
        batch, num_heads, seq_len, head_dim = x.size()
        x = x.permute(0, 2, 1, 3).contiguous()
        return x.view(batch, seq_len, num_heads * head_dim)

    def prefill(self, x):
        Q = self._split_heads(self.q_proj(x))
        K = self._split_heads(self.k_proj(x))
        V = self._split_heads(self.v_proj(x))
        self.k_cache, self.v_cache = K, V
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.head_dim ** 0.5)
        attn = F.softmax(scores, dim=-1)
        context = torch.matmul(attn, V)
        context = self._combine_heads(context)
        return self.out_proj(context)

    def decode(self, new_x):
        Q_t = self._split_heads(self.q_proj(new_x))
        K_t = self._split_heads(self.k_proj(new_x))
        V_t = self._split_heads(self.v_proj(new_x))
        K_cat = torch.cat([self.k_cache, K_t], dim=2)
        V_cat = torch.cat([self.v_cache, V_t], dim=2)
        scores = torch.matmul(Q_t, K_cat.transpose(-2, -1)) / (self.head_dim ** 0.5)
        attn = F.softmax(scores, dim=-1)
        context = torch.matmul(attn, V_cat)
        out = self.out_proj(self._combine_heads(context))
        self.k_cache, self.v_cache = K_cat, V_cat
        return out
```

## 优化方向总结

| 方法 | 优化目标 | 适用阶段 | 说明 |
| --- | --- | --- | --- |
| DistServe | Prefill/Decode 解耦 | 两个阶段 | 分配到不同 GPU，避免资源争抢 |
| SARATHI | Prefill 效率 | Prefill | Chunked Prefill + Decode 捎带 |
| GQA | KV Cache 显存 | Decode | 分组查询注意力，减少 KV 缓存 |
| FlashAttention | 自注意力计算 | Prefill | 硬件级高效注意力实现 |
| KV Cache 复用 | 高并发场景 | 两个阶段 | 共享 prompt 前缀的 KV Cache |
| PagedAttention | 显存管理 | Decode | 虚拟内存管理 KV Cache |
| Continuous Batching | 吞吐量 | Decode | 动态调整批次大小 |
| 投机解码 | 生成延迟 | Decode | 小模型草稿+大模型验证 |

## 性能指标对比

| 指标 | Prefill 阶段 | Decode 阶段 |
| --- | --- | --- |
| 计算瓶颈 | 计算密集型（Compute-bound） | 通信密集型（Memory-bound） |
| 主要限制 | GPU 算力（FLOPS） | 内存带宽（Bandwidth） |
| 并行度 | 高（可批量处理） | 低（逐 token 生成） |
| 优化重点 | FlashAttention、张量并行 | PagedAttention、KV Cache 压缩 |
| 关键指标 | TTFT（Time to First Token） | TPOT（Time per Output Token） |