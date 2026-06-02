---
title: Flash Attention
description: Flash Attention是一种优化Transformer模型中注意力机制的算法，旨在提高计算效率和内存利用率。
---

# Flash Attention

Flash Attention是一种优化Transformer模型中注意力机制的算法，旨在提高计算效率和内存利用率。自注意力（Self-Attention）的缺点之一是计算和空间复杂度巨大，导致在处理长序列时速度变慢且内存需求巨大。

## 自注意力的空间复杂度

自注意力模块的空间复杂度为 $O(N^2)$，其中 $N$ 为序列长度。自注意力对应的空间需求巨大，无法完整的存贮执行自注意力计算的所有参数，对应的将数据从HBM搬运到SRAM也消耗了大量时间。

## GPU内存层次

- **SRAM（Static RAM）**：静态随机存取存储器，速度快，访问延迟低，用于GPU的片上缓存
- **HBM（High Bandwidth Memory）**：高带宽内存，用于GPU的片外内存，主要作为全局内存
- **DRAM（Dynamic RAM）**：动态随机存取存储器，高密度、低成本，用于系统的主内存

| 内存类型 | 容量 | 带宽 | 延迟 |
| --- | --- | --- | --- |
| SRAM | 20 MB | 19 TB/s | ~20 cycles |
| HBM | 80 GB | 3.35 TB/s | ~300 cycles |
| DRAM | 512 GB | 50 GB/s | ~300 cycles |

## 传统自注意力

对于传统算法，$S$ 和 $P$ 远大于 $Q$、$K$、$V$、$O$，在SRAM中放不下，需要在HBM中进行存储，计算时需要反复访问HBM，搬运数据浪费了大量时间。

**传统自注意力计算的内存访问复杂度**：

1. 第一步把 $Q$，$K$ 读取出来计算出 $S=QK^T$，然后把 $S$ 存回去，内存访问复杂度 $\Theta(Nd+N^2)$
2. 第二步把 $S$ 读取出来计算出 $P=\text{softmax}(S)$，然后把 $P$ 存回去，内存访问复杂度 $\Theta(N^2)$
3. 第三步把 $V$，$P$ 读取出来计算出 $O=PV$，然后计算出结果 $O$，内存访问复杂度 $\Theta(Nd+N^2)$

综上所述，整体的内存访问复杂度为 $\Theta(Nd+N^2)$。

**传统自注意力面临两个问题**：

1. 显存占用多，由于计算过程中存储完整注意力矩阵 $P$ 和 $S$，需要 $O(N^2)$ 的空间
2. HBM读写次数多，需要传输的数据量大

## Flash Attention原理

将从输入的 $Q$、$K$、$V$ 到输出 $O$ 的整个过程进行融合，省去 $S$、$P$ 矩阵的存储开销。此外，为了将计算过程的结果完全存储在SRAM中，摆脱对HBM的依赖，采用**分片（Tiling）**操作，每次进行部分计算，确保这些计算结果能在SRAM内进行交互，待得到对应的结果后再进行输出。

## 分块计算的详细图解

### 传统注意力 vs Flash Attention

```
传统注意力（需要O(N²)显存）：
┌─────────────────────────────────────────────┐
│  HBM                                        │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │  Q  │  │  K  │  │  V  │  │  O  │       │
│  └──┬──┘  └──┬──┘  └──┬──┘  └──▲──┘       │
│     │        │        │        │           │
│     └────────┴────────┼────────┘           │
│              ↓                            │
│         ┌─────────┐                       │
│         │    S    │  O(N²)                │
│         │    ↓    │                       │
│         │    P    │  O(N²)                │
│         └────┬────┘                       │
└──────────────┼────────────────────────────┘
               ↓
          [SRAM计算]

Flash Attention（O(N)显存）：
┌─────────────────────────────────────────────┐
│  HBM                                        │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │  Q  │  │  K  │  │  V  │  │  O  │       │
│  └──┬──┘  └──┬──┘  └──┬──┘  └──▲──┘       │
│     │        │        │        │           │
│     └────────┴────────┼────────┘           │
│              ↓ (分块加载)                   │
│         ┌─────────┐                       │
│         │  Q_i    │  SRAM                 │
│         │  K_j    │                       │
│         │  V_j    │                       │
│         │    ↓    │                       │
│         │  S_ij   │  O(B_c × B_r)         │
│         │    ↓    │                       │
│         │  P_ij   │                       │
│         │    ↓    │                       │
│         │  O_i    │                       │
│         └─────────┘                       │
└─────────────────────────────────────────────┘
```

### 分块大小选择

SRAM大小为 $M$，分块大小需要满足：

$$
B_c = \frac{M}{4d}, \quad B_r = \min(\frac{M}{4d}, d)
$$

其中 $d$ 为头维度，$B_c$ 为Key/Value的分块大小，$B_r$ 为Query的分块大小。

## Softmax的分块计算

对于分块计算，矩阵乘法和逐点操作（scale，mask，dropout）的分块计算是容易实现的。需要注意的是，在进行softmax分块计算时，需要完整的一行作为输入数据，因为**其分母需要对完整一行求和**。

当处理完一个分块后，显存中只保留 $m(x^{(1)})$ 和 $l(x^{(1)})$，节省内存开销，此外保存两个全局标量 $m_{\text{max}}$ 和 $l_{\text{all}}$，分别表示当前最大值和全局exp的求和项。

## 增量计算过程

1. 首先计算一个分块的局部softmax值，然后存储起来
2. 当处理完下一个分块时，可以根据此时的新的全局最大值和全局exp求和项来更新旧的softmax值
3. 当处理完所有分块后，此时的所有分块的softmax值都是"全局的"

**Online Softmax更新公式**：

$$
m_i^{\text{new}} = \max(m_i^{\text{old}}, m_{ij})
$$

$$
l_i^{\text{new}} = l_i^{\text{old}} \cdot e^{m_i^{\text{old}} - m_i^{\text{new}}} + l_{ij} \cdot e^{m_{ij} - m_i^{\text{new}}}
$$

$$
O_i^{\text{new}} = O_i^{\text{old}} \cdot \frac{l_i^{\text{old}} \cdot e^{m_i^{\text{old}} - m_i^{\text{new}}}}{l_i^{\text{new}}} + \frac{P_{ij} V_j}{l_i^{\text{new}}}
$$

## Flash Attention伪代码

**输入**：在HBM中的 $Q$、$K$、$V \in \mathbb{R}^{N \times d}$，SRAM大小 $M$

1. 计算 $Q$、$O$ 和 $K$、$V$ 的分块大小 $B_c$ 和 $B_r$
2. 初始化最终输出 $O \in \mathbb{R}^{N \times d}$，$N$ 维向量 $l$ 和 $m$
3. 将 $K$、$V$ 作为外层循环，$Q$、$O$ 作为内层循环
4. 分块计算Attention score
5. 计算局部 $\hat{m}_{ij}$ 和 $\hat{l}_{ij}$，并利用其更新全局 $m_i^{\text{new}}$ 和 $l_i^{\text{new}}$
6. 更新输出 $O$

## Flash Attention 2改进

Flash Attention 2在Flash Attention基础上进行了以下优化：

1. **减少非矩阵乘法运算**：将softmax的缩放和加法操作与矩阵乘法融合
2. **优化并行化策略**：在序列长度维度上并行，而非batch×head维度
3. **优化工作分区**：减少warp间的同步和通信

**性能对比**：

| 特性 | Flash Attention | Flash Attention 2 |
| --- | --- | --- |
| 计算效率 | 50-73% TFLOPS | 65-73% TFLOPS |
| 内存访问 | $O(N)$ | $O(N)$ |
| 并行维度 | batch × head | sequence length |
| 反向传播 | 重计算 | 优化重计算 |

## Flash Attention 3改进

Flash Attention 3针对Hopper架构（H100）进行了专门优化：

1. **异步执行**：利用Tensor Memory Accelerator（TMA）实现异步数据加载
2. **Warp specialization**：将生产者和消费者warp分离
3. **FP8支持**：原生支持FP8量化注意力计算

```python
# Flash Attention 3使用示例
from flash_attn.flash_attn_interface import flash_attn_func

# 标准FP16/BF16
output = flash_attn_func(q, k, v, causal=True)

# FP8量化（H100+）
output = flash_attn_func(q, k, v, causal=True, 
                         out_dtype=torch.float8_e4m3fn)
```

## IO复杂度分析

Flash Attention的核心优化是减少HBM访问次数：

**传统注意力IO复杂度**：
$$
\text{IO}_{\text{traditional}} = O(Nd + N^2)
$$

**Flash Attention IO复杂度**：
$$
\text{IO}_{\text{flash}} = O(\frac{N^2 d^2}{M})
$$

其中 $M$ 为SRAM大小。当 $M = O(Nd)$ 时，Flash Attention的IO复杂度为 $O(Nd)$，显著优于传统方法。

## Flash Attention总结

- **为什么加快了计算？** 降低了耗时的HBM（显存）访问次数。采用Tiling技术分块从HBM加载数据到SRAM缓存进行融合计算。

- **为什么节省了内存？** 不再对中间矩阵 $S$，$P$ 进行存储。在反向的时候重新计算来计算梯度。

- **为什么是精准注意力？** 算法流程只是分块计算，无近似操作。

- **适用场景**：
  - 长序列训练（序列长度 > 2048）
  - 大批量训练
  - 内存受限场景

- **限制**：
  - 需要GPU支持（A100/H100效果最佳）
  - 分块大小受SRAM限制
  - 实现复杂度较高
