import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AccelerateZ's Docs",
  base: "/",
  description: "A VitePress Site",
  markdown: {
    math: true,
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Personal Homepage", link: "https://acceleratez.github.io" },
      { text: "Docs Homepage", link: "/" },
      { text: "DSA", link: "/dsa/index" },
      {
        text: "Math",
        items: [
          { text: "Convex Optimization", link: "/convex/index" },
        ],
      },
      {
        text: "ML and DL",
        items: [
          { text: "Machine Learning", link: "/machine-learning/index" },
          { text: "Deep Learning", link: "/deep-learning/index" },
          { text: "INFSCI0310", link: "/infsci0310/index" },
          { text: "INFSCI0510", link: "/infsci0510/index" },
          { text: "Advanced ML and DL", link: "/advanced-ml-dl/index" },
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

      "/convex": [
        {
          items: [
            { text: "Overview", link: "/convex/index" },
            { text: "Ch1: Mathematical Background", link: "/convex/chapter-01-mathematical-background" },
            { text: "Ch2: Convex Sets", link: "/convex/chapter-02-convex-sets" },
            { text: "Ch3: Convex Functions", link: "/convex/chapter-03-convex-functions" },
            { text: "Ch4: Convex Optimization Problems", link: "/convex/chapter-04-convex-optimization-problems" },
            { text: "Ch5: Duality", link: "/convex/chapter-05-duality" },
            { text: "Ch11: Interior-Point Methods", link: "/convex/chapter-11-interior-point-methods" },
            { text: "Cheatsheet: Problem Forms", link: "/convex/cheatsheet-problem-forms" },
            { text: "Cheatsheet: Convexity Equivalences", link: "/convex/cheatsheet-convex-transformations" },
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
          ],
        },
      ],
      "/advanced-ml-dl": [
        {
          items: [
            {
              text: "11-特征选择与稀疏学习",
              link: "/advanced-ml-dl/feature-selection",
            },
            {
              text: "12-计算学习理论",
              link: "/advanced-ml-dl/computational-learning-theory",
            },
            {
              text: "13-半监督学习",
              link: "/advanced-ml-dl/semi-supervised-learning",
            },
            {
              text: "14-概率图模型",
              link: "/advanced-ml-dl/probabilistic-graphical-model",
            },
            {
              text: "15-强化学习",
              link: "/advanced-ml-dl/reinforcement-learning",
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
            { text: "Introduction to Deep Learning", link: "/deep-learning/introduction" },
            { text: "Convolutional Neural Networks", link: "/deep-learning/convolutional-neural-network" },
            { text: "Recurrent Neural Networks", link: "/deep-learning/recurrent-neural-network" },
            { text: "Transformers", link: "/deep-learning/transformer" },
            { text: "Self-Supervised Learning", link: "/deep-learning/self-supervised-learning" },
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
