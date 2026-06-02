---
title: LLM 技术文档
description: 大语言模型技术文档首页
---

# LLM 技术文档

欢迎来到大语言模型（Large Language Model，LLM）技术文档库。本文档涵盖从 NLP 基础到 Agent 应用的完整知识体系，旨在为开发者和研究者提供系统性的技术参考。

## 章节导航

### [NLP 基础知识](./nlp-basics/index.md)
从自注意力机制到嵌入表示，全面掌握大语言模型背后的 NLP 核心技术。包括 Transformer 架构、分词器（BPE/SentencePiece）、位置编码（RoPE/ALiBi）、解码策略、归一化方法和词嵌入技术。

### [预训练](./pre-training/index.md)
深入理解大语言模型的预训练过程：从数据准备到模型训练，从评估方法到继续预训练。涵盖预训练定义、数据集构建（Common Crawl/The Pile）、训练流程、评估指标（PPL/Benchmark）及领域适配技术。

### [后训练](./post-training/index.md)
从微调到强化学习，从模型压缩到分布式训练，全面掌握大语言模型的后训练技术栈。包括监督微调（LoRA/QLoRA）、强化学习（RLHF/PPO/DPO）、模型量化（GPTQ/AWQ）、分布式训练（DeepSpeed/Megatron）、Flash Attention 和提示工程。

### [模型推理](./model-inference/index.md)
从推理两阶段到 KV Cache，从 vLLM 到投机解码，全面掌握大语言模型推理优化技术。涵盖 Prefill/Decode 原理、KV Cache 优化、PagedAttention、Continuous Batching、推理评估和推理链压缩。

### [RAG](./rag/index.md)
从检索到生成，全面掌握检索增强生成（Retrieval-Augmented Generation）技术栈。包括 RAG 完整流程、查询转换、向量索引（HNSW/IVF）、重排序（Cross-Encoder）、长上下文处理、GraphRAG 和 Agentic RAG。

### [Agent](./agents/index.md)
从规划到工具使用，从单智能体到多智能体协作，全面掌握大语言模型 Agent（智能体）技术。包括 Agent 架构、规划策略（CoT/ReAct/LATS）、记忆机制、工具调用、MCP 协议、Skills 系统和工程化部署。

## 适用人群

- **AI 开发者**：快速掌握 LLM 技术栈，构建基于大模型的应用
- **算法工程师**：深入理解模型训练、推理优化和部署实践
- **研究人员**：系统性了解 LLM 领域的最新进展和技术趋势
- **产品经理**：理解大模型能力边界，制定合理的产品策略

## 使用建议

1. **初学者**：从 NLP 基础知识开始，逐步学习预训练、后训练、推理优化
2. **有基础的开发者**：根据需求直接跳转到相关章节
3. **实践导向**：重点关注代码示例和工程化部署内容
