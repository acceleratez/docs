---
title: 模型压缩
description: 模型压缩是降低大模型计算成本和存储需求的关键技术。本文详解量化、剪枝、知识蒸馏等主流压缩方法。
---

# 模型压缩

模型压缩是降低大模型计算成本和存储需求的关键技术。本文详解量化（Quantization）、剪枝（Pruning）、知识蒸馏（Knowledge Distillation）等主流压缩方法。

## 量化

## 什么是量化

- **量化（Quantization）**：将连续/高精度值映射为离散/低精度值
- **反量化（Dequantization）**：将量化后的值映射回原始值域（有损）

## 为什么要做量化

1. 减少模型的存储空间和显存的占用
2. 在显卡中，数据从HBM中加载到Tensor Core中计算，计算速度受限于数据加载的速度。通过对模型进行量化，减少HBM和Tensor Core之间的数值传输量，从而加快模型推理时间
3. 显卡对整数运算速度快于浮点型数据，从而加快模型推理时间

## 量化矩阵运算

$$
X_f W_f = (X_q - Z_x) \cdot s_x @ (W_q - Z_w) \cdot s_w = s_x \cdot s_w (X_q W_q - X_q Z_w - W_q Z_x + Z_x Z_w)
$$

其中 $X_f$、$W_f$ 为浮点值，$X_q$、$W_q$ 为量化后的整数值，$s_x$、$s_w$ 为缩放因子，$Z_x$、$Z_w$ 为零点值。

## 量化方法分类

- **训练后量化（Post-Training Quantization, PTQ）**：先训练模型再做量化，直接将浮点权重和激活值转换为低精度（如INT8）表示，无需重新训练模型。量化时拿一些训练数据集做校准，得到量化过程中的常数。

- **量化感知训练（Quantization-aware Training, QAT）**：在模型训练过程中模拟量化操作，使模型权重在训练阶段适应低精度表示，减少量化导致的精度损失，例如QLoRA。

## 量化精度对比实验数据

以下为典型大模型在不同量化精度下的性能对比（基于LLaMA-7B/13B/70B模型）：

| 量化方法 | 精度 | 模型大小（7B） | MMLU准确率 | 推理速度提升 |
| --- | --- | --- | --- | --- |
| FP16（基线） | 16-bit | 14 GB | 46.8% | 1.0x |
| INT8（LLM.int8()） | 8-bit | 7 GB | 46.5% | 1.2x |
| INT4（GPTQ） | 4-bit | 3.5 GB | 44.2% | 1.8x |
| INT4（AWQ） | 4-bit | 3.5 GB | 45.1% | 1.9x |
| NF4（QLoRA） | 4-bit | 3.5 GB | 44.8% | 1.7x |
| INT2（QuIP#） | 2-bit | 1.75 GB | 38.5% | 2.5x |

**关键结论**：
- INT8量化几乎无损精度，适合部署场景
- INT4量化（GPTQ/AWQ）在精度和效率之间取得最佳平衡
- 低于4-bit的量化会导致显著的精度下降

## ZeroQuant

作者发现激活值的绝对值范围要远大于参数，因此激活值需要做更细粒度的量化。

- 对于激活值X，采用**token-wise粒度**
- 对于权重W，采用**group-wise粒度**

量化后的精度损失采用层级蒸馏的方式弥补。

## LLM.int8()

观察到激活值中存在一些离群值（大于某个超参数），绝对值显著大于其他值，严重影响量化结果。LLM.int8()采用混合精度分阶段量化方法，将包含离群值的特征提取出来保留16bit，其余权重和激活使用8bit量化。

**LLM.int8()训练流程**：

1. 从输入的隐含状态中，按列提取异常值（离群特征，即大于某个阈值的值）
2. 对离群特征进行FP16矩阵运算，对非离群特征进行量化，做INT8矩阵运算
3. 反量化非离群值的矩阵乘结果，并与离群值矩阵乘结果相加，获得最终的FP16结果

**总结LLM.int8()**：
- 离群值仅占所有特征的0.1%
- Weight在加载模型时量化，显存占用比float16减半
- 使用LLM.int8()对精度几乎没有影响
- 模型推理速度会变慢20%左右

## Smooth Quant

作者观察到激活值要比权重矩阵更难量化，且离群值总是出现在固定的channel上。可以对激活值除以一个缩放常数而对权重乘以一个缩放常数，从而使得权重和激活值都容易量化。

$$
Y = (X \text{diag}(s)^{-1}) \cdot (\text{diag}(s) W) = \hat{X} \hat{W}
$$

其中 $s$ 为缩放因子，通过迁移量化难度从激活值到权重，实现更平衡的量化。

## GPTQ

GPTQ的量化精度为4-bit。只对权重矩阵进行量化，做矩阵乘时再反量化权重矩阵。

**GPTQ算法流程**：

1. **初始化**：使用OBS（Optimal Brain Surgeon）框架，将权重矩阵按列分组
2. **逐列量化**：对每一列权重，计算量化误差并进行补偿
3. **Hessian矩阵求逆**：利用Fisher信息矩阵的逆来指导量化顺序
4. **批处理优化**：同时处理128个列，提高计算效率

**GPTQ算法优化**：
- 取消贪心算法：随机的顺序效果也一样好
- 批处理：同时处理128个列
- 数据稳定性：往 $H^{-1}$ 里加入一个小的常数项

```python
# GPTQ量化伪代码
for col in range(0, num_cols, group_size):
    # 计算Hessian逆矩阵
    H_inv = compute_hessian_inv(calibration_data)
    # 逐列量化并补偿误差
    for c in range(col, min(col + group_size, num_cols)):
        q_weight = quantize(weight[:, c])
        error = weight[:, c] - dequantize(q_weight)
        # 使用Hessian逆矩阵补偿误差
        weight[:, c+1:] -= error @ H_inv[c, c+1:] / H_inv[c, c]
```

## AWQ

也是只对权重量化的方法，发现有一部分权重对LLM的性能更重要。不对这些关键的权重进行量化，可以在不进行任何训练或回归的情况下，弥补量化损失造成的性能下降。

**AWQ算法流程**：

1. **重要性评估**：通过校准数据计算每个权重通道的重要性（基于激活值的分布）
2. **缩放因子计算**：为重要通道计算最优的缩放因子 $s$
3. **权重缩放**：对权重矩阵进行缩放，使重要权重的量化误差最小化
4. **对称量化**：对缩放后的权重进行对称量化

**激活感知缩放**：为 $w$ 中的关键参数乘以一个放大系数 $s > 1$，同时再反向缩放 $x$，缩小了关键权重的量化误差。

$$
\text{Quant}(W \cdot s) \cdot (\frac{x}{s}) \approx W \cdot x
$$

```python
# AWQ量化关键步骤
def awq_quantize(weight, activation_scales, group_size=128):
    # 计算通道重要性
    channel_importance = activation_scales.mean(dim=0)
    # 计算缩放因子
    scales = (channel_importance / channel_importance.mean()) ** alpha
    # 缩放权重
    scaled_weight = weight * scales.unsqueeze(0)
    # 对称量化
    q_weight = symmetric_quantize(scaled_weight, group_size)
    return q_weight, scales
```

## 剪枝

模型剪枝研究模型权重中的冗余，并尝试删除/修剪冗余和非关键的权重。至少需要剪枝掉一半以上的参数才能有性能提升，因为需要额外存储位置矩阵。

## 剪枝方式分类

- **非结构化剪枝（Unstructured Pruning）**：允许删除任何权重或连接，不保留原始网络架构
- **结构化剪枝（Structured Pruning）**：保留原始模型的架构，将比较小的元素置为0

## 剪枝时间分类

1. 剪枝后训练（Pruning after Training）
2. 边训练边剪枝（Training with Pruning）
3. 训练后剪枝（Post-training Pruning）

## 知识蒸馏

知识蒸馏的是通过从大模型中提取知识，教给小模型，来增强小模型的性能。但是根据Scaling law，采用小模型的准确度普遍低于大模型，所以知识蒸馏效果比较一般。

## 黑盒蒸馏

使用大模型生成数据，通过这些数据去微调更小的模型，来达到蒸馏的目的。

**优点**：
- 实现简单，只需大模型生成数据、小模型学习
- 不需要直接访问大模型的参数或中间状态
- 可以生成针对特定任务的专用数据

**缺点**：
- 蒸馏效率低，需要大量样本
- 生成的数据可能包含大模型的偏见或错误
- 无法直接学习大模型内部表示

## 白盒蒸馏

- **Knowledge-based**：对结果进行蒸馏，通过KL散度损失对齐教师和学生的输出分布
- **Feature-based**：对中间层特征进行蒸馏，通过MSE损失对齐中间层表示
- **Relation-based**：蒸馏样本间的关系信息和结构化的知识

## 黑盒蒸馏 vs 白盒蒸馏

黑盒蒸馏的效率低于白盒蒸馏，但仍是现实中使用最多的方法，主要原因：
1. 实现简单
2. 适用范围广
3. 模型异构性支持
4. 数据扩充能力
5. 隐私保护
6. 部署灵活性
7. 无需模型权重访问权限
