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
          {
            text: "Computer Architecture",
            link: "/computer-architecture/index",
          },
          { text: "Database", link: "/database/index" },
          {
            text: "Interface Design Methodology",
            link: "/interface-design-methodology/index",
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
          { text: "Computer Vision", link: "/computer-vision/index" },
          { text: "Data Mining", link: "/data-mining/index" },
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
      "/computer-architecture": [
        {
          items: [
            { text: "Overview", link: "/computer-architecture/index" },
            {
              text: "Ch1: Introduction",
              link: "/computer-architecture/introduction",
            },
            {
              text: "Ch2: Measuring Performance",
              link: "/computer-architecture/performance",
            },
            {
              text: "Ch3: Basic Pipelining",
              link: "/computer-architecture/pipeline",
            },
            {
              text: "Ch4: Data Hazards",
              link: "/computer-architecture/data-hazard",
            },
            {
              text: "Ch5: Instruction Level Parallelism",
              link: "/computer-architecture/ilp",
            },
            {
              text: "Ch6: Branch Prediction",
              link: "/computer-architecture/branch-prediction",
            },
            {
              text: "Ch7: Out-of-Order Processors",
              link: "/computer-architecture/out-of-order",
            },
            {
              text: "Ch8: Cache Hierarchy",
              link: "/computer-architecture/cache",
            },
            {
              text: "Ch9: Virtual Memory",
              link: "/computer-architecture/virtual-memory",
            },
            {
              text: "Ch10: Memory & DRAM",
              link: "/computer-architecture/memory",
            },
            {
              text: "Ch11: Multiprocessors",
              link: "/computer-architecture/multiprocessor",
            },
          ],
        },
      ],

      "/computer-vision": [
        {
          items: [
            { text: "Overview", link: "/computer-vision/index" },
            {
              text: "Ch1: Introduction",
              link: "/computer-vision/introduction",
            },
            {
              text: "Ch2: Image Filtering",
              link: "/computer-vision/image-filtering",
            },
            {
              text: "Ch3: Image Resampling",
              link: "/computer-vision/image-resampling",
            },
            {
              text: "Ch4: Feature Detection",
              link: "/computer-vision/feature-detection",
            },
            {
              text: "Ch5: Feature Description and Matching",
              link: "/computer-vision/feature-description-matching",
            },
            {
              text: "Ch6: Homography and Projective Transformation",
              link: "/computer-vision/homography-projective",
            },
            {
              text: "Ch7: Stereo Vision",
              link: "/computer-vision/stereo-vision",
            },
            {
              text: "Ch8: Motion Estimation",
              link: "/computer-vision/motion-estimation",
            },
            {
              text: "Ch9: Tracking",
              link: "/computer-vision/tracking",
            },
            {
              text: "Ch10: Introduction to Deep Learning",
              link: "/computer-vision/intro-deep-learning",
            },
            {
              text: "Ch11-12: Training Deep Learning Models",
              link: "/computer-vision/training-dl-models",
            },
            {
              text: "Ch13: Encoder-Decoder for Latent Analysis",
              link: "/computer-vision/encoder-decoder",
            },
            {
              text: "Ch14: Convolutional Neural Networks",
              link: "/computer-vision/cnns",
            },
            {
              text: "Ch15: Recurrent Neural Networks",
              link: "/computer-vision/rnns",
            },
            {
              text: "Ch16: Vision Transformer",
              link: "/computer-vision/vision-transformer",
            },
            {
              text: "Ch17: GANs",
              link: "/computer-vision/gans",
            },
            {
              text: "Ch18: Diffusion Models",
              link: "/computer-vision/diffusion-models",
            },
            {
              text: "Ch19: Object Recognition",
              link: "/computer-vision/object-recognition",
            },
          ],
        },
      ],

      "/database": [
        {
          items: [
            { text: "Overview", link: "/database/index" },
            {
              text: "Ch1: Introduction to Databases",
              link: "/database/introduction",
            },
            {
              text: "Ch2: Database System Concepts and Architecture",
              link: "/database/database-architecture",
            },
            {
              text: "Ch3: Entity-Relationship Model",
              link: "/database/entity-relationship",
            },
            {
              text: "Ch5: Relational Data Model and Constraints",
              link: "/database/relational-model",
            },
            {
              text: "Ch6: Basic SQL",
              link: "/database/sql",
            },
            {
              text: "Ch7: More SQL",
              link: "/database/advanced-sql",
            },
            {
              text: "Ch8: Relational Algebra and Calculus",
              link: "/database/relational-algebra",
            },
            {
              text: "Ch14: Functional Dependencies and Normalization",
              link: "/database/normalization",
            },
            {
              text: "Ch16: Disk Storage, File Structures, Hashing",
              link: "/database/storage",
            },
            {
              text: "Ch17: Indexing Structures and Physical Design",
              link: "/database/indexing",
            },
            {
              text: "Ch18: Strategies for Query Processing",
              link: "/database/query-processing",
            },
            {
              text: "Ch19: Query Optimization",
              link: "/database/query-optimization",
            },
            {
              text: "Ch20: Transaction Processing",
              link: "/database/transactions",
            },
          ],
        },
      ],

      "/data-mining": [
        {
          items: [
            { text: "Overview", link: "/data-mining/index" },
            {
              text: "Ch1: Introduction",
              link: "/data-mining/introduction",
            },
            {
              text: "Ch2: Getting to Know Your Data",
              link: "/data-mining/data-overview",
            },
            {
              text: "Ch3: Data Preprocessing",
              link: "/data-mining/preprocessing",
            },
            {
              text: "Ch4: Data Warehousing and OLAP",
              link: "/data-mining/olap",
            },
            {
              text: "Ch5: Frequent Pattern Mining (Basic)",
              link: "/data-mining/fpgrowth-basic",
            },
            {
              text: "Ch6: Frequent Pattern Mining (Advanced)",
              link: "/data-mining/fpgrowth-advanced",
            },
            {
              text: "Ch7: Classification (Basic)",
              link: "/data-mining/classification-basic",
            },
            {
              text: "Ch8: Classification (Advanced)",
              link: "/data-mining/classification-advanced",
            },
            {
              text: "Ch9: Cluster Analysis (Basic)",
              link: "/data-mining/clustering-basic",
            },
            {
              text: "Ch10: Cluster Analysis (Advanced)",
              link: "/data-mining/clustering-advanced",
            },
            {
              text: "Ch11: Outlier Analysis",
              link: "/data-mining/outlier-analysis",
            },
            {
              text: "Ch12: Mining Text Data",
              link: "/data-mining/text-mining",
            },
            {
              text: "Ch13: Mining Web Data",
              link: "/data-mining/web-mining",
            },
          ],
        },
      ],

      "/interface-design-methodology": [
        {
          items: [
            {
              text: "Overview",
              link: "/interface-design-methodology/index",
            },
            {
              text: "Ch1: The Human and the Computer",
              link: "/interface-design-methodology/human-computer",
            },
            {
              text: "Ch2: Interaction — Models, Ergonomics and Styles",
              link: "/interface-design-methodology/interaction",
            },
            {
              text: "Ch3: Interaction Design Basics",
              link: "/interface-design-methodology/interaction-design",
            },
            {
              text: "Ch4: Design Rules and Usability Principles",
              link: "/interface-design-methodology/design-rules",
            },
            {
              text: "Ch5: Implementation and Evaluation",
              link: "/interface-design-methodology/implementation-evaluation",
            },
            {
              text: "Ch6: Universal Design and User Support",
              link: "/interface-design-methodology/universal-design-support",
            },
            {
              text: "Ch7: Communication and Task Models",
              link: "/interface-design-methodology/communication-task-models",
            },
            {
              text: "Ch8: Notations and System Models",
              link: "/interface-design-methodology/notations-system-models",
            },
            {
              text: "Ch9: Interface Design Issues and UI Patterns",
              link: "/interface-design-methodology/interface-design-issues",
            },
            {
              text: "Ch10: UI and UX Design",
              link: "/interface-design-methodology/ui-design",
            },
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
