import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LLM 预训练篇',
  description: '大模型预训练技术文档',
  themeConfig: {
    sidebar: [
      {
        text: '预训练篇',
        items: [
          { text: '概述', link: '/intro' },
          { text: '预训练定义', link: '/pretraining-definition' },
          { text: '预训练数据集', link: '/pretraining-datasets' },
          { text: '预训练流程', link: '/pretraining-process' },
          { text: '预训练评估', link: '/pretraining-evaluation' },
          { text: '继续预训练', link: '/continual-pretraining' },
        ]
      }
    ]
  }
})
