---
title: 预训练流程
description: 大模型预训练完整流程，包括分词器训练、模型选择、超参数配置、框架选择及训练监控
---

# 预训练流程

本文详细介绍大模型预训练的完整流程，包括分词器训练、模型选择、核心超参数配置、预训练框架选择和训练监控。

## 分词器训练

分词器（Tokenizer）的作用是将连续的文本字符串分解成模型能够处理的基本单位。这些基本单位可以是单词、子词（subword），甚至是单个字符，每个基本单位对应词表中的一个数值，然后输入到模型进行处理。

分词器常用算法：**BPE、BBPE、WordPiece**。

### 好的分词器的重要性

1. 减少词表大小，降低模型复杂性，提高模型计算效率。

2. 提升模型泛化能力，遇到未见过的词时，能通过学习到的子词来理解其含义（**OOV问题**）。

3. 保持语义一致性，尽量避免将具有特定语义的词错误地分割，以免影响模型的语义理解能力。

### 什么时候需要训练分词器

一般是外国模型可能没有在足够的中文数据上进行训练，需要在中文语料上进行二次预训练。

### 如何训练tokenizer

收集一个很大的训练集，直接利用**BPE、BBPE、WordPiece**等算法训练。

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

# Step 1：实例化一个空白的BPE tokenizer
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
# Step 2：实例化一个BPE tokenizer 的训练器 trainer 这里 special_tokens 的顺序决定了其id排序
trainer = BpeTrainer(
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
    min_frequency=1,
    show_progress=True,
    vocab_size=40000
)
# Step 3：定义预分词规则（比如以空格预切分）
tokenizer.pre_tokenizer = Whitespace()
# Step 4：加载数据集 训练tokenizer
files = [f"./wikitext-103-raw/wiki.test.raw"]
tokenizer.train(files, trainer)
# Step 5：保存 tokenizer
tokenizer.save("./tokenizer-wiki.json")
```

### tokenizer训练的细节

- **不要随意扩词表**：例如加入了"中华人民"这个新token，并且引入相对应的merge token的逻辑，就可能导致"中华人民共和国"这个旧token永远不会被encode出来，那"中华人民共和国"这个token对应的知识也就丢失了。

- **什么时候考虑扩充词表**：
    - 如果知道业务场景，提前补充业务场景相关的token，增加业务场景文本的压缩率，比如医疗场景，提前把阿莫西林、青霉素等作为一个token。换句话说，如果基座模型的词表跟领域词表差别很大，可以增加domain的语料。
    - 扩充的token都是低频词，对原词表中的高频词影响不大（比如"思密达"这种音译词）。

- **数字切分**：避免9.9 > 9.11的问题。

- **控制压缩率**：1个token对应多少个汉字：压缩率太低，那就是字太多、词太少，很影响解码效率；压缩率太大，也就是词太多，又会影响模型的知识能力。通常，压缩率越低的模型，loss也会低，大部分中文大模型的1个token会映射成1.5个汉字左右。

- **手动移除脏token**（GPT4o词表泄露发现有很多色情赌博token），语料的质量很重要。

- 词表的中、英覆盖率要足够大，其他语种看业务需求。

- tokenizer的vocab_size和模型的embedding_size之间，要有一千个左右的buffer，后续的alignment环节，需要大量在pretrain阶段没见过的全新token来做训练。

体验分词器：[tiktokenizer](https://tiktokenizer.vercel.app/)

## 模型选择

在预训练时尽量**选择基座模型**，不选Chat模型。模型架构一般采用**Llama**架构，采用**ROPE + GQA + RMSNorm + SwiGLU**，模型参数量与计算资源和数据量呈正相关。

## 核心超参

### 学习率和batch-size

**一般模型规模越大batch-size越大**。学习率一般采用**WSD(warmup-stable-decay)**的策略。

- **warmup**是为了保障前期训练稳定。

- **stable**阶段维持高学习率，更快更广泛的探索最优的学习空间。

- **decay**阶段学习率退火，需要更高质量的数据或者想着重增强模型能力领域的数据。

### layer_num和hidden_size

一般**layer_num越大hidden_size越大**，保障模型宽度和高度比较均匀。layer_num最好有多的质因数，保障流水线并行的效率。

### num_head

一般是**8的整数倍**，因为张量并行的极限一般是8，大于8就引入了机间通讯，训练效率就低了。

## 预训练框架

预训练数据一般是以T为单位的规模，因此预训练阶段往往采用Megatron。

### 训练数据的训练速度

卡内通讯 > 卡间通讯 > 机间通讯。为了加速训练效率和降低通讯量，应避免机间通讯，尽量不引入**张量并行**、**流水线并行**、**序列并行**，只有**数据并行**不会牺牲算法。在显存充足的情况下，不要开启数据offload和梯度激活点。

### Megatron vs Deepspeed

- **训练速度**：Megatron训练速度更快，因为支持更完善的张量并行和流水线，并且rope已经被开发成了apex算子，速度远高于llama里的实现方案。Deepspeed训练速度相比Megatron会有10%～30%左右的算力损失。

- **参数清晰**：Megatron参数配置的非常完善，可微操的空间很大。与之对比的Deepspeed很难对源码进行修改。

- **上手难度**：Deepspeed代码简单，且大多数开源项目也基于Deepspeed实现。Megatron代码复杂。

## 预训练监控

需要监控的指标有：

- 分别监控中文、英文、代码三类数据的**channel_loss**。

- 监控**loss的突然变化**，大概率是数据问题（全是乱码的数据loss很高，全是换行符的数据loss很低）。如果数据过脏，就回退到上个checkpoint进行训练。

- 如果数据没问题还是出现loss突然变化，监控**梯度**有没有异常，大概率与**优化器参数**设置有关。

- **困惑度PPL**，从每个数据集随机抽取几百条数据监控PPL。

## Scaling Law

**scaling law指的是模型性能（如测试集上的损失或准确率）如何随着模型参数数量、训练数据量以及计算量的增加而变化的经验性定律。** 这三者按**幂律关系（Power Law）**共同影响模型表现：当三者同步增长时，损失函数以可预测的速度下降——但任何单一变量的过度增长都会遭遇瓶颈。

### Scaling Law的用途

- **优化资源分配**：Scaling Law揭示了**参数规模、数据规模与算力之间的最佳配比**。OpenAI的研究发现，在给定计算预算下，与其训练一个小模型用海量数据，不如训练一个**更大的模型**但**适度早停**更为高效。更大的模型对数据的**样本效率**更高——达到同等性能所需的训练步骤和数据更少。

- **预测和规划模型训练**：在小规模模型上实验并拟合Scaling Law，可以**预测更大模型的性能**，从而决定训练多大的模型、用多少数据，以高效利用有限的计算预算，并且根据实验结果调整训练参数、数据配比等。

- **评估模型扩展性**：通过Scaling Law，可以评估模型性能是否达到了当前规模的**饱和点**。如果模型仍遵循预期的幂律提升，则意味着增加规模仍有益；反之，如果性能提升出现停滞或偏离幂律曲线，则提示可能需要调整策略（如改进模型架构或算法）而不仅仅是"堆料"扩展。

### Scaling Law的核心公式

1. 对于Decode-only模型，其计算量C（FLOPs），模型参数量N，数据量D满足以下关系：**C ≈ 6ND**。**计算量与模型结构无关**。

2. `L(N,D) = A/N^α + B/D^β + L₀`，其中L₀是理论上的不可减损失下界（数据和模型无限大时的极限误差）。根据《Training Compute-Optimal Large Language Models》中的计算，α ≈ 0.34, β ≈ 0.28，模型参数量对损失的影响略强于数据量。通过固定总算力C，就可以推导出最优N和D的关系。

### 模型和数据放大比例策略

- **OpenAI**：若将训练计算量提高10倍，OpenAI推算**模型参数应增加约5.5倍，训练token数量增加约1.8倍**，反应在公式上就是**最优参数量** N_opt ∝ C^0.73，**最优数据量** D_opt ∝ C^0.27。

- **DeepMind**：**模型大小和数据量应按相等比例扩展**，提出**Chinchilla定律**，即**训练语料的token数量约为模型参数量的20倍。**

### Scaling Law在大模型中的体现

- **GPT4**：基于10,000倍小的计算规模，就能预测最终GPT4的性能。

- **Baichuan2**：基于10M到3B的模型在1T数据上训练的性能，可预测出最后7B模型和13B模型在2.6T数据上的性能。

- **MindLLM**：基于10M到500M的模型在10B数据上训练的性能，预测出最后3B模型在500B数据上的性能。

- **LLaMA3**：给定不同的预算6×10¹⁸ ~ 10²² FLOPs，调整模型的大小（从40M到16B）。基于在小模型上的实验结果，接下来预测在大预算下什么模型是计算最优模型。使用幂律法则来建模：N*(C) = AC^α。其中C是FLOPs预算，N*是这个预算下的计算最优Token数，A和alpha是需要拟合的参数。这里alpha=0.537，A=0.299。

输入是3.8×10²⁵ FLOPs，得到计算最优Token数量为16.55T，模型大小为402B。LLaMA3的模型是405B。
