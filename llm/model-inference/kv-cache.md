---
title: KV Cache
description: KV缓存原理、显存分析与优化方法详解
---

# KV Cache

Transformer 自回归解码时，每生成一个新 token 都需要与之前所有 token 交互。若每次都重新计算全部 token 的 K、V，计算量随序列长度平方增长。**KV Cache** 通过缓存已计算的 K、V 向量避免重复计算，是 LLM 推理的核心优化。

## 原理

在 Transformer 的每一层中，每个 token 的注意力计算需要当前 token 的 Q 与所有 token 的 K 做点积，再与所有 token 的 V 加权求和。自回归生成第 $t$ 个 token 时，前 $t-1$ 个 token 的 K、V 不会改变，因此可以缓存下来，每次只需计算新 token 的 K、V 并追加到缓存中。

### 为什么需要 KV Cache？

假设没有 KV Cache，生成长度为 $T$ 的序列时，每个 token 的生成都需要重新计算 $t$ 次注意力，总计算复杂度为 $O(T^2 \cdot d)$。使用 KV Cache 后，Prefill 阶段只需计算一次，Decode 阶段每个 token 只需计算当前 token 的 K、V 并与缓存的 KV 做注意力，总复杂度降低为 $O(T \cdot d)$。

### KV Cache 的存储结构

对于标准的 Multi-Head Attention（MHA），KV Cache 在每一层的存储结构为：

$$
\text{KV Cache per layer} = 2 \times n_{\text{heads}} \times \text{seq\_len} \times d_{\text{head}}
$$

其中系数 2 对应 K 和 V 两个矩阵。在 Prefill 阶段，每个 token 都会生成对应的 K、V 向量并存入缓存；在 Decode 阶段，每生成一个新 token 就将其 K、V 追加到缓存末尾。

## 显存分析

KV Cache 的显存占用可通过以下公式估算：

$$
\text{KV Cache 大小} = 2 \times n_{\text{layers}} \times n_{\text{heads}} \times d_{\text{head}} \times \text{seq\_len} \times \text{dtype\_bytes}
$$

其中系数 2 对应 K 和 V 两个矩阵。以 LLaMA-7B（32 层、32 头、128 维、FP16）为例，序列长度 2048 时 KV Cache 约占 1GB 显存。

| 模型 | 层数 | 头数 | 维度 | 序列长度 | KV Cache（FP16） |
| --- | --- | --- | --- | --- | --- |
| LLaMA-7B | 32 | 32 | 128 | 2048 | ≈ 1GB |
| LLaMA-13B | 40 | 40 | 128 | 2048 | ≈ 2GB |
| LLaMA-70B | 80 | 64 | 128 | 4096 | ≈ 16GB |

**多请求并发场景**：当并发处理 $B$ 个请求时，KV Cache 总显存占用为：

$$
\text{Total KV Cache} = B \times 2 \times L \times n_{\text{heads}} \times d_{\text{head}} \times \text{seq\_len} \times \text{dtype\_bytes}
$$

例如，并发处理 32 个 LLaMA-7B 请求（seq_len=2048），KV Cache 需要约 32GB 显存，这在实际部署中是主要的显存瓶颈。

## MHA / MQA / GQA

不同的注意力变体对 KV Cache 的影响：

| 类型 | 全称 | KV Cache 缩减 | 说明 |
| --- | --- | --- | --- |
| MHA | Multi-Head Attention | 1×（基线） | 每个头独立的 K、V |
| MQA | Multi-Query Attention | 1/num\_heads | 所有头共享一组 K、V |
| GQA | Grouped-Query Attention | 1/num\_kv\_heads | 每组头共享 K、V，MHA 与 MQA 的折中 |

主流模型（LLaMA-2/3、Mistral、Qwen-2.5 等）普遍采用 GQA，在质量与显存之间取得平衡。

### 注意力变体原理对比

**MHA（Multi-Head Attention）**：标准的多头注意力，每个头独立维护自己的 Q、K、V 投影矩阵和 KV Cache。

$$
\text{KV Cache (MHA)} = 2 \times n_{\text{heads}} \times \text{seq\_len} \times d_{\text{head}}
$$

**MQA（Multi-Query Attention）**：所有头共享同一组 K、V，但 Q 仍然独立。可以将 KV Cache 压缩为 MHA 的 $1/n_{\text{heads}}$。

$$
\text{KV Cache (MQA)} = 2 \times \text{seq\_len} \times d_{\text{head}}
$$

**GQA（Grouped-Query Attention）**：将 $n_{\text{heads}}$ 个 Q 头分成 $n_{\text{kv\_heads}}$ 组，每组共享一组 K、V。是 MHA 和 MQA 的折中方案。

$$
\text{KV Cache (GQA)} = 2 \times n_{\text{kv\_heads}} \times \text{seq\_len} \times d_{\text{head}}
$$

## PagedAttention

传统 KV Cache 为每个请求预分配连续显存，由于输出长度未知导致严重碎片化。PagedAttention 借鉴 OS 虚拟内存分页：

- 将 KV Cache 切分为固定大小的 Block（如 16 个 token）
- 通过 Block Table 维护逻辑块到物理显存块的映射
- 按需分配，消除碎片

效果：显存碎片率从 60-80% 降至 ≈ 0%，并发能力提升 2-4 倍。详见 [vLLM](vllm.md)。

## KV Cache 压缩

KV Cache 的显存占用随序列长度线性增长，是长上下文推理的主要瓶颈。主要压缩手段：

| 方法 | 原理 | 代表工作 |
| --- | --- | --- |
| 量化 | 将 KV 从 FP16 降至 INT8/INT4 | KIVI |
| 剪枝/驱逐 | 移除不重要的 KV 对 | H2O、Scissorhands |
| 稀疏注意力 | 只保留部分位置的 KV | NSA、StreamingLLM |
| 低秩投影 | 将 KV 投影到低维空间 | LCKV |
| 层共享 | 相邻层共享 KV | CLA |

详见 [推理重要论文](important-inference-papers.md) 中的相关工作。

### 量化（Quantization）

**原理**：将 KV Cache 从高精度（如 FP16）量化为低精度（如 INT8、INT4），减少每个 KV 元素的存储空间。

**KIVI**：一种高效的 KV Cache 量化方法，支持对 Key 和 Value 分别采用不同的量化策略。Key 采用 per-channel 量化（沿 head_dim 维度），Value 采用 per-token 量化，可以显著降低量化误差。

**优势**：实现简单，与现有推理框架兼容性好，可以在几乎不损失精度的情况下将 KV Cache 压缩 2-4 倍。

**局限**：极低比特量化（如 INT2）可能导致精度下降，需要结合混合精度策略。

### 剪枝/驱逐（Pruning/Eviction）

**原理**：基于注意力分数或重要性度量，移除不重要的 KV 对，只保留对当前解码最有用的历史 KV。

**H2O（Heavy Hitter Oracle）**：识别并保留注意力分数最高的 KV 对（Heavy Hitters），驱逐其他低重要性的 KV。

**Scissorhands**：发现注意力分数具有时间局部性，近期 token 的 KV 更重要，可以安全地驱逐早期 token 的 KV。

**优势**：可以在不修改模型的情况下压缩 KV Cache，压缩比可动态调整。

**局限**：驱逐策略可能导致信息丢失，需要仔细设计重要性度量。

### 稀疏注意力（Sparse Attention）

**原理**：只保留部分位置的 KV，例如只保留局部窗口或固定间隔的 token。

**StreamingLLM**：发现注意力分数在初始 token（Attention Sink）处异常高，保留这些 token 和最近的窗口 token，可以实现无限长度的流式推理。

**NSA（Native Sparse Attention）**：在模型训练阶段引入稀疏注意力模式，推理时自然支持稀疏 KV Cache。

**优势**：理论上可以将 KV Cache 压缩到固定大小，支持无限长度推理。

**局限**：可能丢失长距离依赖，需要针对特定任务调优。

### 低秩投影（Low-Rank Projection）

**原理**：将 KV 向量投影到低维空间，减少存储维度。

**LCKV（Low-Cost Key-Value）**：学习一个低秩投影矩阵，将 KV 从高维空间映射到低维空间，然后在低维空间存储和计算。

**优势**：可以精确控制压缩比，理论上比量化更灵活。

**局限**：需要额外的投影矩阵存储和计算开销，适合固定长度的推理场景。

### 层共享（Layer Sharing）

**原理**：相邻的 Transformer 层共享 KV Cache，减少总存储量。

**CLA（Cross-Layer Attention）**：允许不同层之间共享 KV Cache，通常每 2-4 层共享一次。

**优势**：实现简单，可以显著减少 KV Cache 的层数维度。

**局限**：可能影响模型表达能力，需要在训练阶段设计。

## 压缩方法对比

| 方法 | 压缩比 | 精度影响 | 计算开销 | 实现复杂度 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| 量化（INT8） | 2× | 极小 | 低 | 低 | 通用 |
| 量化（INT4） | 4× | 小 | 中 | 中 | 通用 |
| H2O | 可变 | 中 | 低 | 中 | 长文本 |
| Scissorhands | 可变 | 中 | 低 | 中 | 流式推理 |
| StreamingLLM | 固定 | 中 | 低 | 低 | 流式推理 |
| LCKV | 可变 | 小 | 中 | 高 | 固定长度 |
| CLA | 2-4× | 小 | 低 | 中 | 通用 |

## 最佳实践建议

1. **优先使用 GQA**：在模型训练阶段选择 GQA 架构，可以在不损失精度的情况下显著减少 KV Cache 显存占用。

2. **结合量化和剪枝**：对于极长上下文场景，可以结合 KIVI 量化和 H2O 剪枝，实现更激进的压缩。

3. **使用 PagedAttention**：在生产环境中部署时，使用 vLLM 等支持 PagedAttention 的框架，避免显存碎片化。

4. **监控 KV Cache 使用**：在推理服务中监控 KV Cache 的显存占用，及时调整批次大小和序列长度限制。