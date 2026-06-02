---
title: 模型推理
description: 大语言模型推理优化技术全面解析
---

# 模型推理

从推理两阶段到 KV Cache，从 vLLM 到投机解码，全面掌握大语言模型推理优化技术。推理优化是将大模型部署到生产环境的关键环节，直接影响用户体验和系统成本。

## 文章索引

| 文章 | 内容 |
| --- | --- |
| [推理两阶段：Prefill 和 Decode](inference-two-stages-prefill-decode.md) | Prefill 与 Decode 阶段原理、计算复杂度分析、优化方法 |
| [KV Cache](kv-cache.md) | KV 缓存原理、显存分析、MHA/MQA/GQA、压缩方法 |
| [vLLM](vllm.md) | PagedAttention、Continuous Batching、部署配置指南 |
| [推理评估](inference-evaluation.md) | 推理时延分析、压测指标、性能瓶颈分析、EvalScope 工具 |
| [推理重要论文](important-inference-papers.md) | DistServe、SARATHI、SGLang、Mooncake 等核心思想 |
| [投机解码](speculative-decoding.md) | Speculative Decoding、Medusa、树注意力、验证机制 |
| [推理链压缩](reasoning-chain-compression.md) | CoT 压缩、动态推理、LightThinker、TokenSkip |
