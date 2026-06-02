---
title: 预训练
description: 大语言模型预训练技术全面解析
---

# 预训练

深入理解大语言模型的预训练过程：从数据准备到模型训练，从评估方法到继续预训练，全面掌握 LLM 预训练技术栈。预训练是构建大语言模型的基础阶段，决定了模型的通用能力上限。

## 文章索引

| 文章 | 内容 |
| --- | --- |
| [预训练定义](pretraining-definition.md) | 预训练概念、训练目标（CLM/MLM/PrefixLM）、开源模型的价值 |
| [预训练数据集](pretraining-datasets.md) | 数据来源、清洗方法、多样性保障、配比策略、主流数据集介绍 |
| [预训练流程](pretraining-process.md) | 分词器训练、模型选择、超参数配置、框架选择（Megatron/DeepSpeed） |
| [预训练评估](pretraining-evaluation.md) | PPL（困惑度）、Benchmark（MMLU/GLUE）、概率探针、大海捞针测试 |
| [继续预训练](continual-pretraining.md) | 领域适配、数据配比、与微调的区别、实现流程 |
