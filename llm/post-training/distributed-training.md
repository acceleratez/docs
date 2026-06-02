---
title: 分布式训练
description: 分布式训练通过多设备并行计算加速模型训练，解决单设备显存不足、计算效率低的问题。
---

# 分布式训练

随着模型参数的不断增大，单个显卡已经远远无法满足训练需求。分布式训练（Distributed Training）通过多设备（GPU/TPU）并行计算加速模型训练，解决单设备显存不足、计算效率低的问题。

## 分布式训练概述

分布式总训练速度 = 单设备计算速度 × 计算设备总量 × 多设备加速比

- **单设备计算速度**：主要由单卡的运算速度和数据I/O能力决定
- **计算设备总量**：随着计算设备数量的增加，理论上峰值计算速度会增加
- **多设备加速比**：这指的是当使用多个计算设备并行处理时，相对于单设备计算速度的加速比例

## 分布式方法分类

- **数据并行（Data Parallel，DP）**：将训练数据划分为多个子批次，每个设备持有完整的模型副本
- **流水并行（Pipeline Parallel，PP）**：将模型的层切分到不同GPU
- **张量并行（Tensor Parallel，TP）**：将单层内的张量操作拆分到多个设备
- **上下文并行（Context Parallel，CP）**：将输入序列分块分配到不同设备

## 数据并行（DP）

通过pytorch的nn.DataParallel实现数据并行，实现数据并行需要把batch-size放大，本质是多个设备分一个batch内的数据。

**Data Parallel的问题**：
- 单进程，多线程，由于GIL锁的问题，不能充分发挥多卡的优势
- 由于Data Parallel的训练策略问题，会导致一个主节点占用比其他节点高很多
- 效率低，尤其是模型很大batch_size很小的情况
- 只适用于单机训练，无法支持真正的分布式多节点训练

## 分布式数据并行（DDP）

真正的数据并行，采用多进程的方式进行训练。

- 所有显卡的初始模型都相同
- 在每轮训练时，反向传播计算出梯度后，采用AllReduce通信来聚合所有显卡的通信

## Ring-AllReduce

Ring-AllReduce可以拆解成两个步骤：Reduce-scatter和All-gather。**单个设备通信量与GPU数量N无关，总通信量为 $2\Psi$**。

## DDP中的分桶策略

简而言之就是在反向传播时，把需要梯度按照一定策略分到若干个"桶"，从而**减少通信开销**、**在最大限度上做到通信和计算重叠**。

## Accelerate库

集成了DDP，Deepspeed等库，训练代码更简洁，提供了统一的接口。

```python
accelerator = Accelerator()
model, optimizer, trainloader, validloader = accelerator.prepare(model, optimizer, trainloader, validloader)
accelerator.backward(loss)
```

## 混合精度训练

混合精度训练（Mixed Precision Training）结合了FP32和FP16/BF16来进行模型训练。这种方法可以减少GPU内存的使用，同时加速训练。

**混合精度训练的核心组件**：
- **FP32主权重**：维护一份FP32精度的权重副本，用于参数更新
- **FP16/BF16前向/反向**：使用低精度进行计算，加速训练
- **损失缩放（Loss Scaling）**：放大损失值，避免FP16下梯度下溢

```python
accelerator = Accelerator(mixed_precision="bf16")
```

**FP16 vs BF16对比**：

| 特性 | FP16 | BF16 |
| --- | --- | --- |
| 位数 | 1符号+5指数+10尾数 | 1符号+8指数+7尾数 |
| 数值范围 | $6.55 \times 10^{-8} \sim 65504$ | $1.18 \times 10^{-38} \sim 3.39 \times 10^{38}$ |
| 精度 | 较高（10位尾数） | 较低（7位尾数） |
| 训练稳定性 | 需要Loss Scaling | 通常不需要Loss Scaling |
| 适用场景 | 推理部署 | 大模型训练 |

```python
# 混合精度训练示例
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for data, target in dataloader:
    optimizer.zero_grad()
    
    # 前向传播使用FP16
    with autocast():
        output = model(data)
        loss = loss_fn(output, target)
    
    # 反向传播使用Loss Scaling
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

## 梯度累积

梯度累积（Gradient Accumulation）允许模型在有限资源下模拟更大batch_size的训练效果。

```python
accelerator = Accelerator(gradient_accumulation_steps=2)
```

$$
\text{Effective Batch Size} = \text{per_device_batch_size} \times \text{num_devices} \times \text{gradient_accumulation_steps}
$$

## DeepSpeed

DDP存在的问题：在N张卡进行训练，就需要存储N份模型、梯度和优化器参数。Deepspeed则是在DDP的基础上，采用Zero分片策略。

## ZeRO Stage 1

仅对优化器状态进行分割，每个GPU中仍有完整的模型参数和梯度数据。

**内存占用分析**（假设模型参数为 $\Phi$，混合精度训练）：
- 模型参数：$2\Phi$（FP16）
- 梯度：$2\Phi$（FP16）
- 优化器状态：$12\Phi$（FP32参数副本+一阶动量+二阶动量）

Stage 1内存占用：$16\Phi$（每GPU）

## ZeRO Stage 2

对优化器状态和梯度进行分割。

**内存占用分析**：
- 模型参数：$2\Phi$（FP16，每GPU完整）
- 梯度：$\frac{2\Phi}{N}$（FP16，N为GPU数量）
- 优化器状态：$\frac{12\Phi}{N}$（每GPU分片）

Stage 2内存占用：$2\Phi + \frac{14\Phi}{N}$（每GPU）

## ZeRO Stage 3

对优化器状态、梯度和模型参数全部进行分割，前向/反向传播时动态获取其他设备的参数分片。

**内存占用分析**：
- 模型参数：$\frac{2\Phi}{N}$（FP16，每GPU分片）
- 梯度：$\frac{2\Phi}{N}$（FP16，每GPU分片）
- 优化器状态：$\frac{12\Phi}{N}$（每GPU分片）

Stage 3内存占用：$\frac{16\Phi}{N}$（每GPU）

## ZeRO各阶段详细对比

| 特性 | ZeRO-1 | ZeRO-2 | ZeRO-3 |
| --- | --- | --- | --- |
| 优化器状态分片 | 是 | 是 | 是 |
| 梯度分片 | 否 | 是 | 是 |
| 参数分片 | 否 | 否 | 是 |
| 通信量 | 与DDP相同 | 略高于DDP | 1.5x DDP |
| 显存节省 | 4x | 8x | N倍 |
| 适用场景 | 小模型 | 中等模型 | 超大模型 |
| 通信开销 | 低 | 中 | 高 |

## DeepSpeed优化

- **ZeRO ++**：针对ZeRO3通信进行优化，使用分区权重更新（PWZ）和分层分区（HP）减少跨节点通信
- **ZeRO-Infinity**：是ZeRO3的拓展，允许通过使用NUVMe固态硬盘扩展GPU和CPU内存
- **Zero offload**：将优化器、模型参数从显存卸载至内存
- **DeepSpeed Ulysses**：针对长序列训练，使用序列并行和自定义all-to-all通信

## Megatron-LM

Megatron-LM是一个基于PyTorch的分布式训练框架，用来训练基于Transformer的大型语言模型。Megatron-LM综合应用了数据并行DP、张量并行TP和流水线并行PP。

## 模型并行

**激活检查点（Activation Checkpointing）**：可以一定程度上克服数据并行的限制，省略一些激活值。在反向传播时重新计算，以时间换空间。

$$
\text{显存节省} \approx \sqrt{L} \quad \text{（L为层数）}
$$

## 流水线并行

流水线并行面临最严重的问题是**流水线气泡（Bubble）**。

- **Gpipe**：将transformer layer按层切分，并将一个batch切分成多个micro-batch
- **PipeDream**：通过1F1B模式，每个Device上最少只需要保存1份micro-batch的激活值
- **Virtual Pipeline**：为每个GPU分配多个model chunk

## 张量并行

张量并行利用矩阵分块乘法（GEMM）的原理，有行并行和列并行两种方式。

**行并行（Row Parallel）**：
$$
Y = XW = X[W_1, W_2] = [XW_1, XW_2]
$$

**列并行（Column Parallel）**：
$$
Y = XW = X \begin{bmatrix} W_1 \\ W_2 \end{bmatrix} = XW_1 + XW_2
$$

## 混合并行

Megatron-LM提出了PTD-P技术，它结合了流水线、张量和数据并行。

**3D并行配置示例**（64 GPU）：
$$
\text{总GPU数} = TP \times PP \times DP = 8 \times 4 \times 2 = 64
$$
