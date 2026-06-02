---
title: vLLM
description: PagedAttention原理图解、Continuous Batching实现细节、vLLM部署配置指南
---

# vLLM

vLLM 是高吞吐量、内存高效的 LLM 推理与服务引擎，核心创新为 **PagedAttention**——借鉴操作系统虚拟内存与分页思想管理 KV Cache，将显存碎片率从 60-80% 降至接近 0%，同等 GPU 下可服务 2-4 倍请求。

## PagedAttention

传统 LLM 推理中，每个请求需预分配连续显存存储 KV Cache。由于输出长度不可预知，实际分配量常远超实际需求，导致显存碎片化严重。

PagedAttention 借鉴 OS 虚拟内存机制：

1. 将 KV Cache 切分为固定大小的 **Block**（如 16 个 token 为一块）
2. 为每个请求维护 **Block Table**，记录逻辑块到物理显存块的映射
3. 按需分配物理块，无需连续显存

**效果**：

| 指标 | 传统方式 | PagedAttention |
| --- | --- | --- |
| 显存碎片率 | 60-80% | ≈ 0% |
| 并发请求数 | 基线 | 提升 2-4 倍 |

### 原理详解

#### 传统方式的问题

在传统实现中，假设一个请求的最大输出长度为 2048 个 token，每个 token 的 KV Cache 大小为 128 字节。那么系统需要为每个请求预分配 2048 × 128 = 256KB 的连续显存空间。

问题在于：
1. **内存浪费**：大多数请求的实际输出长度远小于最大长度，预分配的空间大部分被浪费
2. **内存碎片**：请求完成后释放的内存块大小不一，难以被新请求复用
3. **容量限制**：由于碎片化，实际能并发的请求数远低于理论最大值

#### PagedAttention 的解决方案

PagedAttention 将 KV Cache 划分为固定大小的逻辑块（Block），每个 Block 存储固定数量 token 的 KV（如 16 个）。每个请求维护一个 Block Table，记录该请求的 KV Cache 分布在哪些物理 Block 中。

**Block Table 结构**：
```
逻辑块 0 → 物理块 3
逻辑块 1 → 物理块 7
逻辑块 2 → 物理块 1
...
```

**核心优势**：
1. **按需分配**：只在需要时才分配新的物理 Block，避免预分配浪费
2. **非连续存储**：逻辑上连续的 KV Cache 可以分散在物理显存的不同位置
3. **动态增长**：随着生成的进行，动态分配新的 Block，无需预先知道输出长度

### 算法流程

```
1. 请求到达，创建新的 Block Table（初始为空）
2. Prefill 阶段：
   a. 计算所有 token 的 KV
   b. 按 Block 大小分配物理 Block
   c. 将 KV 存入对应的物理 Block
   d. 在 Block Table 中记录映射关系
3. Decode 阶段：
   a. 每生成一个 token，计算其 KV
   b. 检查当前 Block 是否已满
   c. 如果已满，分配新 Block 并更新 Block Table
   d. 将新 token 的 KV 存入当前 Block
4. 请求完成：
   a. 释放所有物理 Block
   b. 删除 Block Table
```

### 显存利用率分析

假设：
- Block 大小 = 16 个 token
- KV Cache 每 token 大小 = 128 字节
- 物理 Block 数量 = 1024
- 平均请求输出长度 = 256 个 token

**传统方式**：
- 每请求预分配：2048 × 128 = 256KB
- 实际使用：256 × 128 = 32KB
- 利用率：32KB / 256KB = 12.5%
- 碎片率：约 40%

**PagedAttention**：
- 每请求分配 Block 数：⌈256 / 16⌉ = 16 个 Block
- 实际使用：256 × 128 = 32KB
- 利用率：100%（无碎片）
- 总显存：16 × 16 × 128 = 32KB

## Copy-on-Write

当多个请求共享相同 prompt 时，传统做法为每个请求各复制一份 KV Cache，造成大量显存浪费。

PagedAttention 采用 Copy-on-Write（CoW）机制：所有请求共享同一份 prompt 的 KV Cache 物理块，仅在生成新 token 时才分配独立块并拷贝。这使前缀相同的请求在显存中可被合并，进一步提升显存利用率。

### 实现细节

#### 共享前缀检测

vLLM 在请求到达时会检测其 prompt 是否与其他请求共享前缀。对于共享相同 system prompt 或 few-shot 示例的请求，系统会：

1. 计算 prompt 的哈希值，识别共享前缀
2. 如果前缀 KV Cache 已存在，直接复用
3. 为所有共享前缀的请求创建引用计数

#### 引用计数管理

每个物理 Block 维护一个引用计数（ref_count），记录有多少请求正在使用该 Block：

- 当新请求复用前缀时，对应 Block 的 ref_count 加 1
- 当某个请求完成时，遍历其 Block Table，将每个 Block 的 ref_count 减 1
- 当 ref_count 降为 0 时，释放该物理 Block

#### 写时复制

当共享前缀的某个请求需要生成新 token 时：

1. 检查当前 Block 的 ref_count
2. 如果 ref_count > 1（有其他请求共享），分配新物理 Block
3. 将原 Block 的内容拷贝到新 Block
4. 在新 Block 中写入新 token 的 KV
5. 更新该请求的 Block Table，指向新 Block
6. 原 Block 的 ref_count 减 1

### 优势分析

| 场景 | 传统方式 | CoW 机制 | 节省显存 |
| --- | --- | --- | --- |
| 10 个相同 system prompt | 10 × 前缀 KV | 1 × 前缀 KV | 90% |
| 100 个相同 few-shot | 100 × 示例 KV | 1 × 示例 KV | 99% |
| 多轮对话 | 每轮独立存储 | 复用历史 KV | 50-80% |

## Continuous Batching

传统 Static Batching 中，一个 batch 内所有请求必须等待最长序列完成，其余请求的 GPU 时间被浪费。

Continuous Batching 的做法：

- 在每个 decode 步结束后动态调整 batch：已完成的请求立即移出，新请求随时插入
- 消除了请求间的等待浪费，GPU 利用率显著提升

### 实现细节

#### Static Batching 的问题

假设一个 batch 包含 4 个请求，输出长度分别为 100、150、200、250 个 token：

```
请求 1: [================] (完成)
请求 2: [====================] (完成)
请求 3: [========================] (完成)
请求 4: [============================] (完成)
```

在 Static Batching 中，所有请求必须等待请求 4 完成（250 步），期间：
- 请求 1 在第 100 步完成后，GPU 仍需等待 150 步
- 请求 2 在第 150 步完成后，GPU 仍需等待 100 步
- 请求 3 在第 200 步完成后，GPU 仍需等待 50 步

**GPU 利用率** = (100 + 150 + 200 + 250) / (4 × 250) = 70%

#### Continuous Batching 的解决方案

Continuous Batching 在每个 decode 步后检查哪些请求已完成，并立即替换为新请求：

```
步骤 1-100: 4 个请求同时处理
步骤 101-150: 请求 1 完成，新请求 5 加入，3+1=4 个请求
步骤 151-200: 请求 2 完成，新请求 6 加入，3+1=4 个请求
步骤 201-250: 请求 3 完成，新请求 7 加入，3+1=4 个请求
步骤 251: 请求 4 完成，新请求 8 加入，1 个请求
```

**GPU 利用率** = (100×4 + 50×4 + 50×4 + 50×4) / (4 × 250) = 100%

#### 调度策略

vLLM 的 Continuous Batching 调度器在每个 decode 步后执行以下操作：

1. **检查完成请求**：遍历当前 batch，检查哪些请求的输出长度达到上限或生成了 EOS token
2. **释放资源**：为完成的请求释放 KV Cache 和 Block Table
3. **检查等待队列**：检查是否有新请求等待处理
4. **评估资源**：计算当前可用显存和计算资源
5. **添加新请求**：如果资源充足，从等待队列中取出新请求加入 batch
6. **更新调度表**：更新 batch 中的请求列表和对应的 Block Table

### 批次大小管理

Continuous Batching 需要动态管理批次大小，以平衡吞吐量和延迟：

- **最大批次大小**：根据 GPU 显存和计算能力设定上限，防止 OOM
- **最小批次大小**：确保 GPU 利用率，避免频繁的 batch 切换
- **动态调整**：根据当前请求的平均长度和可用显存，动态调整批次大小

## Prefix Caching

许多应用中，不同请求共享相同 system prompt 或 few-shot 示例。Prefix Caching 通过自动检测并缓存公共前缀的 KV Cache，避免重复计算，对长 system prompt 场景效果尤为显著。

### 实现机制

1. **前缀哈希**：为每个 prompt 的前缀计算哈希值，用于快速查找
2. **KV Cache 缓存**：将计算完成的前缀 KV Cache 存入共享缓存池
3. **缓存查找**：新请求到达时，检查其前缀是否在缓存池中
4. **缓存命中**：如果命中，直接复用 KV Cache，跳过 Prefill 阶段
5. **缓存未命中**：如果未命中，正常计算并缓存结果

### 适用场景

| 场景 | 前缀特点 | 效果 |
| --- | --- | --- |
| 多轮对话 | 相同历史上下文 | 复用历史 KV Cache |
| RAG 系统 | 相同检索文档 | 复用文档 KV Cache |
| 多租户服务 | 相同 system prompt | 复用系统提示 KV Cache |
| Few-shot 学习 | 相同示例 | 复用示例 KV Cache |

## 量化支持

vLLM 支持多种量化格式（AWQ、GPTQ、SqueezeLLM 等），降低显存占用，使更大模型或更高并发在单卡上成为可能。

### 支持的量化格式

| 格式 | 精度 | 压缩比 | 适用场景 |
| --- | --- | --- | --- |
| AWQ | 4-bit | 4× | 通用，平衡精度和性能 |
| GPTQ | 4-bit | 4× | 通用，需要校准数据 |
| SqueezeLLM | 4-bit | 4× | 通用，支持混合精度 |
| FP8 | 8-bit | 2× | 新硬件支持（H100） |

## 适用场景

- 高并发 LLM 服务（在线 API、聊天机器人）
- 长 prompt 场景（RAG、Agent）
- 多租户共享模型服务
- 显存受限的部署环境

## vLLM 部署配置指南

### 安装

```bash
pip install vllm
```

### 基本启动

```bash
python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-2-7b-chat-hf \
    --host 0.0.0.0 \
    --port 8000
```

### 关键配置参数

| 参数 | 说明 | 默认值 | 建议值 |
| --- | --- | --- | --- |
| `--model` | 模型路径或 HuggingFace 模型 ID | 无（必填） | - |
| `--tensor-parallel-size` | 张量并行的 GPU 数量 | 1 | 根据模型大小调整 |
| `--max-model-len` | 最大序列长度 | 模型默认值 | 根据显存调整 |
| `--gpu-memory-utilization` | GPU 显存使用比例 | 0.9 | 0.8-0.95 |
| `--max-num-batched-tokens` | 最大批次 token 数 | 2560 | 根据显存调整 |
| `--max-num-seqs` | 最大并发请求数 | 256 | 根据显存调整 |
| `--enable-prefix-caching` | 启用前缀缓存 | False | True |
| `--quantization` | 量化格式 | 无 | 根据需求选择 |

### 性能调优建议

1. **显存优化**：
   - 启用 Prefix Caching 复用公共前缀
   - 使用 GQA 模型减少 KV Cache 大小
   - 启用量化降低显存占用

2. **吞吐量优化**：
   - 增大 `--max-num-batched-tokens` 提升批次大小
   - 增大 `--max-num-seqs` 提升并发数
   - 使用张量并行跨多个 GPU

3. **延迟优化**：
   - 减小 `--max-model-len` 限制最大长度
   - 使用投机解码加速生成
   - 监控 TTFT 和 TPOT 指标

### 监控指标

vLLM 提供 Prometheus 格式的监控指标：

- `vllm:num_requests_running`：当前运行的请求数
- `vllm:num_requests_waiting`：等待队列中的请求数
- `vllm:gpu_cache_usage_perc`：GPU 缓存使用率
- `vllm:avg_generation_throughput_toks_per_s`：平均生成吞吐量

vLLM 的技术体系详见 [PagedAttention](kv-cache.md) 与 [投机解码](speculative-decoding.md)。