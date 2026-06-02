import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AccelerateZ's Docs",
  base: "/",
  description: "A VitePress Site",
  markdown: {
    math: true,
    image: {
      lazyLoading: true,
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Personal Homepage", link: "https://acceleratez.github.io" },
      { text: "Docs Homepage", link: "/" },
      {
        text: "Computer Science",
        items: [
          { text: "Data Structures and Algorithms", link: "/dsa/index" },
          {
            text: "Theory of Computation",
            link: "/theory-of-computation/index",
          },
          {
            text: "Parallel and Distributed System",
            link: "/parallel-distributed-system/index",
          },
        ],
      },
      {
        text: "Math",
        items: [{ text: "Convex Optimization", link: "/convex/index" }],
      },
      {
        text: "ML and DL",
        items: [
          { text: "Machine Learning", link: "/machine-learning/index" },
          { text: "Deep Learning", link: "/deep-learning/index" },
          { text: "INFSCI0310", link: "/infsci0310/index" },
          { text: "INFSCI0510", link: "/infsci0510/index" },
          { text: "LLM", link: "/llm/index" },
        ],
      },
    ],

    sidebar: {
      "/dsa": [
        {
          items: [
            { text: "Getting Started", link: "/dsa/index" },
            { text: "Exercises", link: "/dsa/exercise" },
            { text: "01-Introduction", link: "/dsa/introduction" },
            { text: "02-Array and Vector", link: "/dsa/array-and-vector" },
            { text: "03-List", link: "/dsa/list-and-node" },
            { text: "04-Stack and Queue", link: "/dsa/stack-and-queue" },
            { text: "05-Sorting", link: "/dsa/sorting" },
            { text: "06-Tree", link: "/dsa/tree" },
            {
              text: "07-Advanced Search Tree",
              link: "/dsa/advanced-search-tree",
            },
            { text: "08-Tree Like DS", link: "/dsa/tree-like-structures" },
            { text: "09-Hash", link: "/dsa/hash-and-collusion" },
            { text: "10-Heap", link: "/dsa/heap-and-huffman-tree" },
            { text: "11-String", link: "/dsa/string" },
            { text: "12-Graph", link: "/dsa/graph" },
            { text: "13-Search", link: "/dsa/search" },
            { text: "14-Divide and Conquer", link: "/dsa/divide-and-conquer" },
            { text: "15-Greedy", link: "/dsa/greedy" },
            { text: "16-Dynamic Programming", link: "/dsa/dp" },
            { text: "17-Backtracking", link: "/dsa/backtracking" },
            { text: "18-Branch and Bound", link: "/dsa/branch-and-bound" },
            { text: "19-NP-Completeness", link: "/dsa/np-complete" },
            { text: "20-Randomized", link: "/dsa/randomized" },
            { text: "21-Approximation", link: "/dsa/approx" },
            { text: "22-Genetic", link: "/dsa/genetic" },
            { text: "23-Cryptography", link: "/dsa/crypto" },
          ],
        },
      ],

      "/theory-of-computation": [
        {
          items: [
            { text: "Overview", link: "/theory-of-computation/index" },
            {
              text: "Ch1: Finite Automata",
              link: "/theory-of-computation/finite-automata",
            },
            {
              text: "Ch2: Regular Expressions",
              link: "/theory-of-computation/regular-expressions",
            },
            {
              text: "Ch3: Context-Free Grammars",
              link: "/theory-of-computation/context-free-grammars",
            },
            {
              text: "Ch4: Pushdown Automata",
              link: "/theory-of-computation/pushdown-automata",
            },
            {
              text: "Ch5: Pumping Lemma for CFL",
              link: "/theory-of-computation/pumping-lemma-cfl",
            },
            {
              text: "Ch6: Turing Machines",
              link: "/theory-of-computation/turing-machines",
            },
            {
              text: "Ch7: Undecidability",
              link: "/theory-of-computation/undecidability",
            },
            {
              text: "Ch8: Intractable Problems",
              link: "/theory-of-computation/intractable-problems",
            },
          ],
        },
      ],

      "/parallel-distributed-system": [
        {
          items: [
            { text: "Overview", link: "/parallel-distributed-system/index" },
            {
              text: "Ch1: Introduction to Parallel Computing",
              link: "/parallel-distributed-system/introduction-parallel-computing",
            },
            {
              text: "Ch2: Parallel Programming Platforms",
              link: "/parallel-distributed-system/parallel-programming-platforms",
            },
            {
              text: "Ch3: Parallel Algorithm Design",
              link: "/parallel-distributed-system/parallel-algorithm-design",
            },
            {
              text: "Ch4: Performance Evaluation",
              link: "/parallel-distributed-system/performance-evaluation",
            },
            {
              text: "Ch5: MPI Message Passing",
              link: "/parallel-distributed-system/mpi-message-passing",
            },
            {
              text: "Ch6: GPU Architecture and CUDA",
              link: "/parallel-distributed-system/gpu-cuda-programming",
            },
            {
              text: "Ch7: Synchronization and Concurrency",
              link: "/parallel-distributed-system/synchronization",
            },
            {
              text: "Ch8: Advanced Topics",
              link: "/parallel-distributed-system/advanced-topics",
            },
          ],
        },
      ],

      "/convex": [
        {
          items: [
            { text: "Overview", link: "/convex/index" },
            {
              text: "Ch1: Mathematical Background",
              link: "/convex/mathematical-background",
            },
            { text: "Ch2: Convex Sets", link: "/convex/convex-sets" },
            { text: "Ch3: Convex Functions", link: "/convex/convex-functions" },
            {
              text: "Ch4: Convex Optimization Problems",
              link: "/convex/convex-optimization-problems",
            },
            { text: "Ch5: Duality", link: "/convex/duality" },
            {
              text: "Ch11: Interior-Point Methods",
              link: "/convex/interior-point-methods",
            },
            {
              text: "Cheatsheet: Problem Forms",
              link: "/convex/cheatsheet-problem-forms",
            },
            {
              text: "Cheatsheet: Convexity Equivalences",
              link: "/convex/cheatsheet-convex-transformations",
            },
          ],
        },
      ],

      "/machine-learning": [
        {
          items: [
            { text: "01-绪论", link: "/machine-learning/index" },
            {
              text: "02-模型评估与选择",
              link: "/machine-learning/model-evaluation-selection",
            },
            { text: "03-线性模型", link: "/machine-learning/linear-model" },
            { text: "04-决策树", link: "/machine-learning/decision-tree" },
            { text: "05-神经网络", link: "/machine-learning/neural-network" },
            { text: "06-支持向量机", link: "/machine-learning/svm" },
            {
              text: "07-贝叶斯分类器",
              link: "/machine-learning/bayesian-classifier",
            },
            {
              text: "08-集成学习",
              link: "/machine-learning/ensemble-learning",
            },
            { text: "09-聚类", link: "/machine-learning/clustering" },
            {
              text: "10-降维与度量值学习",
              link: "/machine-learning/dimensionality-reduction",
            },
            {
              text: "11-特征选择与稀疏学习",
              link: "/machine-learning/feature-selection",
            },
            {
              text: "12-计算学习理论",
              link: "/machine-learning/computational-learning-theory",
            },
            {
              text: "13-半监督学习",
              link: "/machine-learning/semi-supervised-learning",
            },
            {
              text: "14-概率图模型",
              link: "/machine-learning/probabilistic-graphical-model",
            },
            {
              text: "15-强化学习",
              link: "/machine-learning/reinforcement-learning",
            },
          ],
        },
      ],
      "/infsci0510": [
        {
          items: [
            {
              text: "Supervised Learning",
              link: "/infsci0510/supervised-learning",
            },
            {
              text: "Unsupervised Learning",
              link: "/infsci0510/unsupervised-learning",
            },
          ],
        },
      ],
      "/deep-learning": [
        {
          items: [
            { text: "Overview", link: "/deep-learning/index" },
            {
              text: "Introduction to Deep Learning",
              link: "/deep-learning/introduction",
            },
            {
              text: "Convolutional Neural Networks",
              link: "/deep-learning/convolutional-neural-network",
            },
            {
              text: "Recurrent Neural Networks",
              link: "/deep-learning/recurrent-neural-network",
            },
            { text: "Transformers", link: "/deep-learning/transformer" },
            {
              text: "Self-Supervised Learning",
              link: "/deep-learning/self-supervised-learning",
            },
          ],
        },
      ],

      "/infsci0310": [
        {
          items: [
            {
              text: "01-Intro to Information Science",
              link: "/infsci0310/index",
            },
            {
              text: "02-Information Representation",
              link: "/infsci0310/info-representation",
            },
            {
              text: "03-Gradient Descent",
              link: "/infsci0310/gradient-descent",
            },
            {
              text: "04-Optimization",
              link: "/infsci0310/optimization",
            },
            {
              text: "05-Statistics Inference",
              link: "/infsci0310/statistics-inference",
            },
            {
              text: "06-Stochastic, Simulation and Sampling",
              link: "/infsci0310/stochastic-simulation-sampling",
            },
            {
              text: "07-Linear Regression",
              link: "/infsci0310/linear-regression",
            },
            {
              text: "08-Python Basics",
              link: "/infsci0310/python-basics",
            },
            { text: "09-P-and-NP", link: "/infsci0310/p-and-np" },
          ],
        },
      ],
      "llm/nlp-basics/": [
        {
          text: "NLP Basic",
          items: [
            { text: "概述", link: "/llm/nlp-basics" },
            { text: "自注意力", link: "/llm/nlp-basics/self-attention" },
            { text: "Transformer", link: "/llm/nlp-basics/transformer" },
            { text: "分词器", link: "/llm/nlp-basics/tokenizer" },
            { text: "位置编码", link: "/llm/nlp-basics/positional-encoding" },
            { text: "解码", link: "/llm/nlp-basics/decoding" },
            { text: "归一化", link: "/llm/nlp-basics/normalization" },
            { text: "嵌入", link: "/llm/nlp-basics/embedding" },
          ],
        },
      ],
      "llm/pre-training/": [
        {
          text: "Pre-Training",
          items: [
            { text: "概述", link: "/llm/pre-training" },
            {
              text: "预训练定义",
              link: "/llm/pre-training/pretraining-definition",
            },
            {
              text: "预训练数据集",
              link: "/llm/pre-training/pretraining-datasets",
            },
            {
              text: "预训练流程",
              link: "/llm/pre-training/pretraining-process",
            },
            {
              text: "预训练评估",
              link: "/llm/pre-training/pretraining-evaluation",
            },
            {
              text: "继续预训练",
              link: "/llm/pre-training/continual-pretraining",
            },
          ],
        },
      ],
      "llm/post-training/": [
        {
          text: "Post-Training",
          items: [
            { text: "概述", link: "/llm/post-training" },
            {
              text: "模型微调（SFT）",
              link: "/llm/post-training/fine-tuning-sft",
            },
            {
              text: "强化学习",
              link: "/llm/post-training/reinforcement-learning",
            },
            { text: "模型压缩", link: "/llm/post-training/model-compression" },
            {
              text: "分布式训练",
              link: "/llm/post-training/distributed-training",
            },
            {
              text: "调参技巧",
              link: "/llm/post-training/hyperparameter-tuning",
            },
            {
              text: "Flash Attention",
              link: "/llm/post-training/flash-attention",
            },
            { text: "提示工程", link: "/llm/post-training/prompt-engineering" },
            {
              text: "延伸方法",
              link: "/llm/post-training/extension-more-approaches",
            },
          ],
        },
      ],
      "llm/model-inference/": [
        {
          text: "Model Inference",
          items: [
            { text: "概述", link: "/llm/model-inference" },
            {
              text: "推理两阶段",
              link: "/llm/model-inference/inference-two-stages-prefill-decode",
            },
            { text: "KV Cache", link: "/llm/model-inference/kv-cache" },
            { text: "vLLM", link: "/llm/model-inference/vllm" },
            {
              text: "推理评估",
              link: "/llm/model-inference/inference-evaluation",
            },
            {
              text: "推理重要论文",
              link: "/llm/model-inference/important-inference-papers",
            },
            {
              text: "投机解码",
              link: "/llm/model-inference/speculative-decoding",
            },
            {
              text: "推理链压缩",
              link: "/llm/model-inference/reasoning-chain-compression",
            },
          ],
        },
      ],
      "llm/rag/": [
        {
          text: "RAG",
          items: [
            { text: "概述", link: "/llm/rag" },
            { text: "RAG", link: "/llm/rag/rag" },
            { text: "Chunking-free RAG", link: "/llm/rag/chunking-free-rag" },
            { text: "向量索引", link: "/llm/rag/vector-indexing" },
            { text: "ReRank", link: "/llm/rag/rerank" },
            { text: "Long Context", link: "/llm/rag/long-context" },
            { text: "GraphRAG", link: "/llm/rag/graphrag" },
            { text: "Agentic RAG", link: "/llm/rag/agentic-rag" },
          ],
        },
      ],
      "llm/agents/": [
        {
          text: "Agent",
          items: [
            { text: "概述", link: "/llm/agents" },
            { text: "Agent 概述", link: "/llm/agents/agent-overview" },
            { text: "Agent 分类", link: "/llm/agents/agent-classification" },
            { text: "Planning", link: "/llm/agents/planning" },
            { text: "Memory", link: "/llm/agents/memory" },
            { text: "Tool", link: "/llm/agents/tool" },
            {
              text: "多智能体失败原因",
              link: "/llm/agents/why-multi-agent-fail",
            },
            { text: "MCP", link: "/llm/agents/mcp" },
            { text: "Skills", link: "/llm/agents/skills" },
            { text: "OpenClaw 原则", link: "/llm/agents/openclaw-principle" },
            { text: "Hermes", link: "/llm/agents/hermes" },
            {
              text: "落地工程",
              link: "/llm/agents/harness-engineering",
            },
          ],
        },
      ],
    },
    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: "github", link: "https://github.com/acceleratez/docs" },
    ],

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },
    outlineTitle: "Content",
    outline: [1, 3],
  },
});
