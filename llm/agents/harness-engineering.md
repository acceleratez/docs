---
title: 落地工程
description: Agent 工程化部署实践
---

# 落地工程

## 什么是 Harness

先给一个最干净的定义，来自 LangChain 的 Vivek Trivedy[1]：

Harness 就是**模型权重以外的一切**。

比如最近源码意外泄露的 Claude Code，它的 Harness 包括：

|组件|具体是什么|解决什么问题|
|---|---|---|
|System Prompt|系统提示词，定义行为规范|模型不知道自己该是谁|
|CLAUDE.md|项目级指令文件，启动时注入|模型不知道这个项目的规范|
|Tools|可调用的工具集（文件读写、Bash、浏览器）|模型只能输出文本，不能执行操作|
|Sandbox|隔离的执行环境|不能让模型直接操作生产环境|
|Compaction|上下文压缩机制|长对话性能衰减|
|Hooks / Middleware|在模型调用前后插入的逻辑|模型不会主动自检、容易死循环|
|Sub-agent 管理|子代理派生和结果回收|单个上下文窗口装不下复杂任务|

Harness 的名字来自马具。马具就是用来精确地把马的力量引导到正确方向，防止失控，让骑手保持控制权。Harness Engineering 对 LLM 的作用完全类比：**让模型的能力被可靠地驾驭**。

## 为什么 Harness 比你想象的重要

很多人做 Agent 系统，遇到问题第一反应是："**模型还不够聪明，等更好的模型出来就好了。**"

HumanLayer 团队[2]在上百个 Agent 项目后得出了一个不同的结论：

> "It's not a model problem. It's a configuration problem."

LangChain 用数据证明了这一点。[3]

他们拿同一个模型（GPT-5.2-Codex），**只改模型之外的东西**——System Prompt、工具配置、Middleware，其他什么都不动。Terminal Bench 2.0 得分从 52.8 涨到 66.5，排名从 Top 30 直接跳到 Top 5。

他们改了四件事：

- **改动一：在 Agent 试图退出时拦截。** 最常见的失败模式：Agent 写完代码 → 重读一遍自己的代码 → 觉得看起来没问题 → 停止，根本没跑测试。加了一个 Middleware：Agent 试图退出时强制拦截，注入一个 checklist 让它对照任务说明逐项验证。这一个改动贡献了最大的分数提升。

- **改动二：自动扫描并注入环境信息。** Agent 在陌生环境中会浪费大量时间探索目录结构、找 Python 版本。他们在 Agent 启动时自动跑 bash 命令扫描环境，结果注入上下文。Agent 不用探索，直接干活。

- **改动三：追踪编辑次数，超过阈值就打断。** Agent 有时候在同一个文件上反复做小修改，打转超过 10 次还在原地。他们通过 hook 追踪每个文件的编辑次数，超过阈值就注入"考虑换个完全不同的方案"的提示。

- **改动四：调整推理强度策略。**GPT-5.2-Codex 有4档推理强度，全程用最高强度反而得分低、易超时。他们采用xhigh-high-xhigh 的三明治策略：规划和验证阶段用高推理强度，执行阶段用中等推理强度，兼顾效果与效率。

这四个改动全是环境和流程的变化。这就是 Harness Engineering 的哲学，Mitchell Hashimoto（HashiCorp 创始人）表述得最清楚[4]：

> **Harness engineering is the idea that anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again.**

回到开头的那个问题：Agent 写完代码没有跑测试，他改了 Prompt。总结下Harness Engineering 的做法是：在 Agent 试图退出的时候加一个拦截，强制它先跑测试，跑不过不让停。这个行为从此是确定性的，不依赖 Prompt 的解读，就不会"有时候管用有时候不管用"。

## Claude Code：工业级 Harness 的完整实现

2026 年 3 月 31 日，Claude Code 51 万行 TypeScript 源码意外暴露在公网 —— 也不知道是故意的还是不小心，不过这下大家都能清晰地看到，一个工业级 Harness 的完整实现，到底长啥样了。

### 1 工具系统

Claude Code 有 40+ 个工具，分为七大类：

- **文件操作（Read/Write/Edit）**

- **搜索（Glob/Grep）**

- **执行（Bash/PowerShell）**

- **Web（Fetch/Search）**

- **Agent 协调**

- **规划工作流**

- **MCP 协议**

每个工具都实现了一套完整的接口，其中最重要的两个属性：

```Plaintext
**isConcurrencySafe()**  → 是否可以并行执行
**isDestructive() **     → 是否不可逆
```

**`isConcurrencySafe\(\)`** 决定了哪些工具可以真正并发跑。Read、Glob、Grep 这类只读工具标记为并发安全，模型决定同时读取三个文件时，这三次调用是真正并行的。Write、Edit 这类写入工具标记为串行，必须依次执行，防止竞态条件。

工具的粒度是一个刻意的选择。Claude Code 没有把文件操作合并成一个"FileOperation"工具，而是拆成Read/Write/Edit 三个。工具的选择本身携带了意图信息——模型选了 Edit 就意味着局部修改，选了 Write 就意味着全量覆写。工具粒度细，也意味着权限控制可以更细——只读权限允许 Read，但不允许 Write，这在 API 请求构建层就完成了隔离，不依赖模型去"理解"约束。

### 2 权限链

每次工具调用，都要通过这条权限链（源码位于 `src/utils/permissions/`）：

```Plaintext
① validateInput()
   ↓ 参数合法才继续

② PreToolUse Hooks（settings.json 里用户定义的 shell 命令）
   可以：批准 / 拒绝 / 修改工具的输入参数
   ↓ hooks 通过

③ Permission Rules
   alwaysDenyRules  → 硬性禁止，直接拒绝
   alwaysAllowRules → 预授权，直接允许
   alwaysAskRules   → 强制询问用户（无视 permission mode）
   ↓ 无匹配规则

④ tool.checkPermissions()（工具自检）
   ↓ 通过

⑤ permission mode（auto / manual）
   auto mode → AI classifier 并发竞速
   manual mode → 等待用户确认
```

这条链的每一环都是确定性的——前三关是硬逻辑，不依赖 LLM 的推理。这就是 Harness Engineering 的本质：**让环境保证正确性，而不是依赖模型的理解能力**。

被 **`alwaysDenyRules` **标记的工具，连 schema 都不发给模型——模型根本不知道这个工具的存在。这消除了一类攻击面：所有通过 Prompt 注入诱导模型调用被禁止工具的攻击，前提都是模型得知道这个工具存在。

### 3 Hooks：Harness 的拦截层

**PreToolUse Hooks** 是 Claude Code Harness 里特有的部分。

用户可以在 `settings\.json` 里配置任意 shell 命令，在任何工具调用之前先执行。这些命令可以完全批准或拒绝工具调用，甚至修改工具的输入参数。不需要改 Claude Code 的任何代码，就能做到：

- 日志记录所有操作，写进审计系统

- 对某类路径的写入额外要求确认

- 拦截危险命令（如 `rm \-rf`）

- 把调用同步到外部合规系统

这正是 LangChain 那个实验里"拦截 Agent 试图退出并强制跑测试"的机制在 Claude Code 里的实现方式——直接在 Hooks 里加确定性的拦截逻辑。

### 4 上下文管理：让 Chain 可以跑得足够长

Claude Code 的 `autoCompact` 机制（`src/query\.ts`）：当对话历史接近上下文窗口上限（约 80-90%）时，自动触发压缩——把历史对话发给 LLM 生成结构化摘要，保留「**已完成的任务、关键决策、重要文件状态、用户明确偏好**」，然后替换掉原始历史消息。摘要生成之后，整个对话历史变短，但关键信息保留了。Agent 可以继续工作，不会因为上下文满了就失忆。

多 Agent 场景下还有一个工程细节：子 Agent fork 时，System Prompt 和 Tool Definitions 字节级别原封不动地继承，子任务的上下文通过消息历史传入。这样父 Agent 已经建立的 Prompt Cache，子 Agent 第一次请求就能直接命中——N 个子 Agent 共享一份缓存，而不是各自重新建 N 份，直接省掉几百万 token 的重复计算。

### 5 CLAUDE.md：项目知识的持久化层

`CLAUDE\.md` 是 Harness 的记忆层，分三级：

```Plaintext
~/.claude/CLAUDE.md          ← 全局级，跨所有项目有效
PROJECT_ROOT/CLAUDE.md       ← 项目级，当前项目有效
.claude/CLAUDE.md            ← 本地级，当前目录有效
```

三级都会在启动时被读取并注入 System Prompt 的指定位置。

但 HumanLayer 团队做了一个研究值得关注：ETH Zurich 测试了 138 个 agentfile，发现 LLM 自动生成的 `CLAUDE\.md` 反而会让性能下降——Agent 要花 14-22% 更多的推理 token 处理这些指令，步骤更多，工具调用更多，但成功率没有提升。

结论：**CLAUDE.md 要人工精心编写，少而精。** 不要把它当成知识库，要把它当成"只有模型自己无法发现的关键约束"的容器。代码库结构让 Agent 自己探索就好，不需要写进来。

## 为什么 Claude Code 被认为是最好的 Harness 参考

有一个反直觉的数据：在 Terminal Bench 2.0 上，Opus 4.6（Anthropic 最强的模型之一）放在 Claude Code 自己的 Harness 里排名第 33。但把同一个模型放进一个专门调优过的第三方 Harness，排名跳到第 5。

这说明了什么？**Harness 和模型之间存在耦合，但这种耦合不是绝对的**。Claude Code 的 Harness 是为"通用编码 Agent"设计的，面对特定任务类型，一个专门针对该任务类型调优的 Harness 可以超越它。

OpenCode（Claude Code 的开源替代品）也发现，要让 GPT/Codex 模型在自己的 Harness 里表现好，必须专门加一个 `apply\_patch` 工具来模拟 Codex 的 Harness 环境——因为这个模型在训练时和 Codex 的 Harness 深度耦合了。

这其实戳中了工业级 Harness 设计的真相：**模型会被它的 Harness 环境驯化**。Claude Code 的工具、权限、Hooks 实实在在地塑造着模型的行为习惯，Harness 本身就是模型能力的一部分！

Claude Code 之所以被认为是最完整的 Harness 参考实现，是因为它把 Harness 的每一个层面都作为可配置的开放机制暴露出来——**工具层（40+ 工具）、权限层（五道闸门）、拦截层（Hooks）、知识层（CLAUDE.md）、多 Agent 协调层（Coordinator + byte-identical 缓存继承）**。而大多数 Harness 系统是黑盒，Claude Code 是例外。
