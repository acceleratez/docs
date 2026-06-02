---
title: 投机解码
description: Speculative Decoding、Medusa与树注意力机制详解
---

# 投机解码

## 背景：为什么需要加速 Decode

大模型推理分为 **Prefill** 和 **Decode** 两个阶段。Prefill 并行度高，效率问题不大；真正的瓶颈在 Decode——自回归解码每次只生成一个 token，推理延迟随生成序列长度线性增长，算力利用率不高，显存带宽压力大。

已有加速方案各有局限：

- **Continuous Batching**：已解码的任务退出 batch，允许新请求插入，但在用户请求少时无法发挥作用。
- **Parallel Decoding**：在 Transformer 解码器顶部添加额外 FFN 头，每步同时生成多个 token，再由原始 LLM 并行验证。但额外 FFN 头预测能力有限。

**投机解码（Speculative Decoding）** 带来更灵活的思路：**先预测（draft）、再验证（verify）**。用轻量的 drafter 模型预测多个未来 token，再用 LLM 并行验证，只有通过验证的 token 才被接受。

投机解码成立的两个观察：

- 许多简单的 token 用简单模型就能预测
- 解码是**通信密集型任务**，每次解码需将大量参数从 HBM 加载到 SRAM，减少解码次数即可提升效率

## 公式化定义

### 自回归解码

给定输入序列 $x_1, \dots, x_t$，目标模型为 $\mathcal{M}_q$，每次生成一个 token：

$$
x_{t+1} \sim q_{t+1} = \mathcal{M}_q(x \mid x_{<t+1})
$$

### 投机解码

每一步先用轻量 drafter 模型 $\mathcal{M}_p$ 并行预测 $K$ 个 token，再由 verify 模型 $\mathcal{M}_q$ 并行验证。

**核心步骤**：

- **Drafting**：给定输入序列，利用 $\mathcal{M}_p$ 并行预测 $K$ 个 token：

$$
p_1, \dots, p_K = \text{DRAFT}(x_{\leq t}, \mathcal{M}_p), \quad \tilde{x}_i \sim p_i, \quad i = 1, \dots, K
$$

- **Verification**：使用 $\mathcal{M}_q$ 并行计算 $K+1$ 个条件分布：

$$
q_i = \mathcal{M}_q(x \mid x_{\leq t}, \tilde{x}_{<i}), \quad i = 1, \dots, K+1
$$

Drafted token 通过验证准则 $\text{VERIFY}(\tilde{x}_i, p_i, q_i)$ 验证。若第 $c$ 个 token 不正确，则使用 $\text{CORRECT}(p_c, q_c)$ 纠正，后续 token 被丢弃。若全部验证成功，第 $K+1$ 个 token 从 $q_{K+1}$ 中采样。

投机解码的加速效果取决于**接受率**——drafter 预测的 token 有多少能通过大模型验证。

## Drafting：如何生成草稿

研究路线分为 **Independent Drafting** 和 **Self-Drafting** 两类。

### Independent Drafting

使用与目标 LLM 不同但更高效的小模型来生成候选 token：

1. **专用非自回归 Transformer**：如 SpecDec 的 deep-shallow encoder-decoder 结构，需要额外训练。
2. **同系列小模型**：直接使用同系列轻量模型，天然更易对齐；结合知识蒸馏可进一步提高接受率。

### Self-Drafting

在目标 LLM 内部生成草稿，避免额外训练和调度开销：

1. **FFN Heads**：添加并行 FFN 头（如 Blockwise Decoding、Medusa），一次性生成多个 token。
2. **Early Exiting / Layer Skipping**：推理时提前退出或跳过中间层（如 Self-Speculative）。
3. **Mask-Predict & N-grams**：在输入末尾追加多个 [PAD]，并行掩码填充预测。
4. **Learnable Tokens**：引入可训练的特殊 token，通过小规模微调改善并行预测。

## Verification：如何批改草稿

### 贪婪解码

- **严格匹配（Lossless）**：要求 drafter 预测 token 等于目标模型 Top-1 结果。若不匹配则用 Top-1 替换并舍弃后续 token。缺点是可能拒绝"质量高但非 Top-1"的预测。
- **近似匹配（Approximate）**：放宽条件，如 SpecDec 允许预测落在 Top-k 内；BiLD 在连续不匹配超过阈值时才拒绝。

### 投机采样

引入概率接受机制：

$$
r < \min\left(1, \frac{q_i(\tilde{x}_i)}{p_i(\tilde{x}_i)}\right), \quad r \sim U[0,1]
$$

若拒绝，按以下分布重新采样：

$$
x_{t+c} \sim \text{norm}(\max(0, q_c - p_c))
$$

理论上保证最终分布与目标模型一致。

### Token 树验证

利用共享前缀将多条候选序列合并为**token 树**，目标模型通过树注意力掩码并行验证整棵树，大幅减少重复计算。代表方法：SpecInfer、Medusa。

## Alignment：如何提升接受率

主要方法包括：

| 方法 | 原理 |
| --- | --- |
| 序列级知识蒸馏（Seq-KD） | 在目标模型生成的序列上训练 drafter |
| 集体增强微调（Col-BT） | 对多个小模型应用 Seq-KD，聚合输出预测 |
| 在线知识蒸馏（Online KD） | 推理过程中基于实时查询动态更新 drafter |

参考论文：[Unlocking Efficiency in Large Language Model Inference: A Comprehensive Survey of Speculative Decoding](https://arxiv.org/pdf/2401.07851)

## 应用：Medusa

Medusa 遵循投机解码框架，分为三个步骤：生成候选 → 处理候选 → 接受候选。

### Medusa Head

在原始模型最后一层隐藏状态 $h_t$ 上增加 $K$ 个解码头，每个头使用带残差的单层 FFN。第 $k$ 个头预测第 $t+k+1$ 个位置的词：

$$
p_t^{(k)} = \text{softmax}\left(W_2^{(k)} \cdot \text{SiLU}(W_1^{(k)} \cdot h_t)\right)
$$

其中 $W_2^{(k)}$ 初始化为原语言模型 head 权重，$W_1^{(k)}$ 初始化为 0，保证初始预测与原始模型一致。

### Tree Attention

每个 Medusa 头生成多个候选 token，通过笛卡尔积构建树状候选空间。例如 $s_1=2, s_2=3$ 时构成 6 个候选序列。

**稀疏树优化**：在校准集上统计每个头的 top-$i$ 准确率 $a_k^{(i)}$，贪心构造最大化接受长度期望的最优稀疏树，在节点数受限时显著提升效率。

### 训练策略

- **MEDUSA-1**：只训练解码头，损失函数为各头交叉熵的加权和：

$$
L_{\text{MEDUSA-1}} = \sum_{k=1}^{K} -\lambda_k \log p_t^{(k)}(y_{t+k+1})
$$

- **MEDUSA-2**：主干与解码头一起训练，采用组合损失、差异化学习率、Medusa 头预热等策略：

$$
L_{\text{MEDUSA-2}} = L_{\text{LM}} + \lambda_0 L_{\text{MEDUSA-1}}
$$

### 典型接受（Typical Acceptance）

不要求输出分布与原模型完全一致，优先接受"原始模型也认为合理"的典型序列：

$$
p_{\text{original}}(x_{n+k} \mid x_1, \dots, x_{n+k-1}) > \min\left(\epsilon, \delta \exp(-H(p_{\text{original}}(\cdot \mid x_1, \dots, x_{n+k-1})))\right)
$$

相较拒绝采样更宽容、速度更快，输出质量相似。

### 自蒸馏

在没有与原始模型输出分布匹配的训练数据时，使用原始模型在公开种子数据集上自动生成回答，形成 QA 对。

- MEDUSA-1 直接用自蒸馏数据训练。
- MEDUSA-2 用原始模型概率分布作为 label，避免主干能力退化：

$$
L_{\text{LM-distill}} = KL(p^{(0)}_{\text{original}, t} \| p^{(0)}_t)
$$

## 实验结果

在 Vicuna 模型上，使用 ShareGPT 数据集训练 2 个 epoch（单张 A100 数小时），Medusa-1 在 7B/13B 上取得 2.18x/2.33x 加速，Medusa-2 取得 2.83x 加速。

关键发现：稀疏树效果优于稠密树；过多节点会因计算量过大反而减慢推理速度。

参考论文：[MEDUSA: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://arxiv.org/pdf/2401.10774)