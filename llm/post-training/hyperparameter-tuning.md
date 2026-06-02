---
title: 调参技巧
description: 本文介绍大模型训练和微调过程中的调参技巧，包括学习率、Batch-size、正则化等核心参数设置。
---

# 调参技巧

本文介绍大模型训练和微调过程中的调参技巧，包括学习率、Batch-size、正则化等核心参数设置。

## 训练轮数

对于在特定领域的微调任务，一般训练1-3个epoch就行。当然如果数据很多或者学习率很低可以适当增加训练轮数。

## Batch-size

batch-size大更新速度更快，充分利用了GPU的算力，但是对显存的需求比较高。为了模拟大的batch-size，可以通过设置gradient_accumulation来实现（表示在更新模型参数之前，梯度会在多少个小批次上累积）。

## Batch Size选择原则

### 显存限制原则

Batch Size的上限主要受GPU显存限制。以下是不同显存下推荐的Batch Size配置：

| 显存大小 | 推荐Batch Size | 梯度累积步数 | 等效Batch Size |
| --- | --- | --- | --- |
| 8 GB | 1-2 | 16-32 | 32-64 |
| 16 GB | 2-4 | 8-16 | 32-64 |
| 24 GB | 4-8 | 4-8 | 32-64 |
| 40 GB | 8-16 | 2-4 | 32-64 |
| 80 GB | 16-32 | 1-2 | 32-64 |

### 收敛性原则

- **小Batch Size**（1-8）：梯度噪声大，有利于逃离局部最优，但收敛不稳定
- **中等Batch Size**（16-64）：通常是最优选择，兼顾收敛速度和稳定性
- **大Batch Size**（128+）：收敛快但可能陷入sharp minima，需要配合学习率调整

### 线性缩放规则（Linear Scaling Rule）

当Batch Size增大 $k$ 倍时，学习率也应增大 $k$ 倍：

$$
\eta_{\text{new}} = k \cdot \eta_{\text{base}}
$$

### 平方根缩放规则（Square Root Scaling）

对于大规模训练，使用平方根缩放更稳定：

$$
\eta_{\text{new}} = \sqrt{k} \cdot \eta_{\text{base}}
$$

## 数据与标签

- **数据归一化**：归一化（映射到(-1, 1)区间），标准化（减去均值除标准差），零均值处理（减去均值）
- **标签平滑（Label Smoothing）**：将独热标签换成soft label，避免过拟合，提高模型的泛化能力

$$
y_{\text{smooth}} = (1 - \epsilon) \cdot y_{\text{hot}} + \frac{\epsilon}{K}
$$

其中 $\epsilon$ 为平滑系数（通常0.1），$K$ 为类别数。

## 权重初始化

kaiming_normal / xavier_normal；He初始化，适用于ReLU，Xavier初始法，适用于普通激活函数(tanh, sigmoid)

- 初始参数尽量小，使得softmax回归输出接近均匀分布，网络无法轻易判断数据属于哪一类
- 参数存在一定的方差，梯度下降更快

## 学习率

- **Warm up**：由于模型随机初始化，采用较大学习率可能导致不稳定。于是初始学习率设为小值，逐渐增大。
- **Batch-size和学习率**：batchsize和学习率大小成正比。因为小batch更新次数多，模型收敛速度更快，但也更容易震荡，所以用小学习率；对应的大batch更新方向更confidence，用大学习率收敛快。

## 学习率调度策略详细对比

### 常用调度策略

| 调度策略 | 公式 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| StepLR | $\eta_t = \eta_0 \cdot \gamma^{\lfloor t/s \rfloor}$ | 简单，固定间隔衰减 | 基础训练 |
| ExponentialLR | $\eta_t = \eta_0 \cdot \gamma^t$ | 平滑衰减 | 长期训练 |
| CosineAnnealingLR | $\eta_t = \eta_{\min} + \frac{1}{2}(\eta_{\max}-\eta_{\min})(1+\cos(\frac{t}{T}\pi))$ | 周期性，后期平稳 | 大模型预训练 |
| WarmupCosine | $\eta_t = \eta_0 \cdot \frac{t}{T_{\text{warmup}}}$ (warmup阶段) | 先升后降 | LLM训练标配 |
| OneCycleLR | 先升后降再降 | 超收敛 | 快速训练 |
| With flooding | loss > 阈值正常下降，< 阈值上升 | 防止过拟合 | 微调任务 |

### Cosine Annealing with Warmup

大模型训练最常用的调度策略：

$$
\eta_t = 
\begin{cases}
\eta_0 \cdot \frac{t}{T_{\text{warmup}}} & \text{if } t < T_{\text{warmup}} \\
\eta_{\min} + \frac{1}{2}(\eta_0 - \eta_{\min})(1 + \cos(\frac{t - T_{\text{warmup}}}{T_{\text{total}} - T_{\text{warmup}}}\pi)) & \text{otherwise}
\end{cases}
$$

**推荐参数**：
- Warmup步数：总步数的5%-10%
- 最小学习率：最大学习率的1/10

```python
from transformers import get_cosine_schedule_with_warmup

scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=1000,
    num_training_steps=10000
)
```

### With flooding

loss大于阈值时正常梯度下降；小于阈值时梯度上升。loss在阈值附近random walk，使得模型被优化到一个平坦的损失区域，防止过拟合。

```python
flood = (loss - b).abs() + b
```

- 对于微调任务，一般学习率设置为[1e-5, 5e-4]之间

## 模型

- **多模型融合ensemble**：多模型probs融合和投票，模型叠加
- **知识蒸馏**：加一个蒸馏损失来惩罚学生模型和教师模型的输出之间的差异
- **指数移动平均EMA**：在深度学习的优化过程中，$\theta_t$ 是 $t$ 时刻的模型权重，$v_t$ 是 $t$ 时刻的影子权重。模型权重在最后的n步内，会在实际的最优点处抖动，所以我们取最后n步的平均，能使得模型更加的鲁棒。

$$
v_t = \beta \cdot v_{t-1} + (1 - \beta) \cdot \theta_t
$$

其中 $\beta$ 通常取0.999或0.9999。

## 难例挖掘

在分类错误的样本上继续训练。

## 交叉验证

在数据不充足时，重复使用数据。例如5-fold cross validation，将训练集分5份，一份做验证集，其他做训练集，重复5次。

## 先在小数据集上过拟合

调整学习率、正则化项等参数，验证模型的有效性。

## 优化器

adam收敛速度快，sgd精确度高。可以先用adam在用sgd，定期在验证集上检查，如果cost不下降，学习率减半。

### 优化器对比

| 优化器 | 学习率 | 优点 | 缺点 |
| --- | --- | --- | --- |
| SGD | 0.01-0.1 | 精度高，泛化好 | 收敛慢，易陷入局部最优 |
| Adam | 1e-4-1e-3 | 收敛快，自适应 | 可能泛化差 |
| AdamW | 1e-4-1e-3 | 解耦权重衰减 | 内存占用大 |
| LAMB | 1e-3-1e-2 | 适合大Batch | 实现复杂 |

## 正则

Weight decay（l2正则），dropout（删除部分神经元），batchnorm

$$
\mathcal{L}_{\text{reg}} = \mathcal{L}_{\text{task}} + \lambda \sum_i \theta_i^2
$$

## 降低显存的方法

1. **Gradient accumulation**：降低batch-size大小为1，增大Gradient accumulation。缺点是延长了训练时间。
2. **Gradient checkpoint**：前向传播的激活值不保留，在反向传播时重新计算
3. **Adafactor Optimizer**：使用占用空间更小的优化器，取代Adam
4. 采用**flash attention**
5. **max_seq_len**：降低每条数据的最大长度
6. **deepspeed**：一般采用zero2就行，zero3通信太多，训练太慢

## 显存优化技巧详解

### 显存占用分析

大模型训练时的显存占用主要包括：

| 组件 | FP32 | FP16/BF16 |
| --- | --- | --- |
| 模型参数 | $4\Phi$ bytes | $2\Phi$ bytes |
| 梯度 | $4\Phi$ bytes | $2\Phi$ bytes |
| 优化器状态（Adam） | $12\Phi$ bytes | $12\Phi$ bytes |
| 激活值 | 变化 | 变化 |

其中 $\Phi$ 为模型参数量。

### 显存优化技术组合

**场景1：7B模型微调（24GB显存）**
```
配置：
- 精度：BF16混合精度
- 优化器：AdamW
- Batch Size：4
- 梯度累积：8
- Gradient Checkpoint：启用
- Flash Attention：启用
- LoRA（可选）：r=16

显存占用：约20GB
```

**场景2：13B模型全量微调（40GB显存）**
```
配置：
- 精度：BF16混合精度
- 优化器：AdamW
- Batch Size：2
- 梯度累积：16
- DeepSpeed ZeRO-2
- Gradient Checkpoint：启用

显存占用：约35GB
```

**场景3：70B模型微调（80GB×2显存）**
```
配置：
- 精度：BF16混合精度
- 优化器：AdamW
- Batch Size：1
- 梯度累积：32
- DeepSpeed ZeRO-3
- Gradient Checkpoint：启用
- 张量并行：2

显存占用：约75GB×2
```

### 显存监控工具

```python
# 使用nvidia-smi监控显存
# 实时监控
watch -n 1 nvidia-smi

# Python代码中监控
import torch
print(f"已分配显存：{torch.cuda.memory_allocated() / 1024**3:.2f} GB")
print(f"缓存显存：{torch.cuda.memory_reserved() / 1024**3:.2f} GB")
```
