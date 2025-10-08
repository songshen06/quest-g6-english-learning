# 可扩展书籍系统指南

## 系统概述

这个书籍系统支持1-6年级上下册的英语学习内容管理，具有高度的可扩展性和灵活性。

## 核心特性

### 🎯 灵活的年级结构
- 支持1-6年级上下册（共12本书）
- 每本书包含多个章节，每个章节包含若干单元
- 自动推荐下一本书籍

### 🔓 智能解锁机制
- 基于学习进度自动解锁新内容
- 下册需要完成上册80%内容
- 下一年级需要完成当前年级

### 📊 进度跟踪
- 实时跟踪每本书、每章节的学习进度
- 支持多用户独立进度管理
- 持久化存储学习数据

## 文件结构

```
src/
├── types/
│   └── books.ts          # 书籍系统类型定义
├── data/
│   └── books.ts          # 书籍数据配置
├── store/
│   └── useBookStore.ts   # 书籍状态管理
├── components/
│   └── BookSelection.tsx # 书籍选择组件
└── pages/
    └── BookModulesPage.tsx # 新的模块页面
```

## 如何添加新书

### 1. 添加书籍数据

在 `src/data/books.ts` 中添加新书籍：

```typescript
{
  id: 'grade6-lower', // 唯一标识：grade{年级}-{学期}
  title: '六年级下册', // 显示标题
  subtitle: 'English Adventure Grade 6B', // 英文副标题
  grade: 6, // 年级 (1-6)
  semester: 'lower', // 学期：'upper'(上册) | 'lower'(下册)
  cover: '/images/books/grade6-lower.jpg', // 封面图片
  description: '六年级下册英语学习内容', // 描述
  totalModules: 10, // 总单元数
  difficulty: 'intermediate', // 难度：'beginner' | 'elementary' | 'intermediate'
  tags: ['小学高年级', '毕业复习'], // 标签
  isActive: true, // 是否激活（是否显示给学生）
  publishedAt: '2024-06-01', // 发布日期
  chapters: [
    {
      id: 'g6l-ch1', // 章节ID
      bookId: 'grade6-lower', // 所属书籍ID
      number: 1, // 章节号
      title: 'Unit 11-12: Future Plans', // 章节标题
      description: '讨论未来计划和梦想', // 章节描述
      moduleIds: ['mod-11', 'mod-12'], // 包含的模块ID列表
      estimatedMinutes: 50, // 预估学习时间（分钟）
      isLocked: false // 是否锁定（通常为false，由系统动态控制）
    }
  ]
}
```

### 2. 创建模块内容

在 `src/content/` 目录下创建新的模块JSON文件：

```json
// module-11-future-plans.json
{
  "moduleId": "mod-11",
  "title": "Future Plans",
  "durationMinutes": 25,
  "words": [
    {"id": "future", "en": "future", "zh": "未来", "audio": "/audio/tts/future.mp3"}
  ],
  "phrases": [
    {"id": "want-to-be", "en": "want to be", "zh": "想成为", "audio": "/audio/tts/want-to-be.mp3"}
  ],
  "quests": [
    {
      "id": "vocabulary-practice",
      "title": "词汇练习",
      "steps": [
        {"type": "wordmatching", "text": "匹配单词和中文意思", "pairs": [...]}
      ],
      "reward": {"badge": "/images/rewards/future-badge.png", "xp": 10}
    }
  ]
}
```

### 3. 更新模块导入

在 `src/pages/BookModulesPage.tsx` 中添加新模块的导入：

```typescript
import module11Data from '../content/module-11-future-plans.json'
import module12Data from '../content/module-12-travel-dreams.json'

const allModulesData = [
  // ... 现有模块
  module11Data,
  module12Data
]
```

## 解锁逻辑说明

### 自动解锁条件

1. **上册 → 下册**：完成上册80%的模块
2. **下册 → 下一年级上册**：完成下册大部分内容（至少6个模块）
3. **新手用户**：默认解锁六年级上册

### 解锁函数

```typescript
const canUnlockBook = (bookId: string, userProgress: UserBookProgress) => {
  // 检查是否已解锁
  if (userProgress.unlockedBooks.includes(bookId)) return true

  // 检查前置条件...
}
```

## 学习路径建议

### 推荐顺序
1. **新生**：根据年龄选择对应年级的上册
2. **进度完成**：自动推荐下一本书
3. **跳级**：支持快速学习者跳级

### 灵活性
- 学生可以切换已解锁的任意书籍
- 支持同时学习多本书（进度独立）
- 可以回看之前完成的内容

## 数据持久化

### 存储结构
```typescript
{
  userBookProgress: {
    currentBookId: 'grade6-upper',
    unlockedBooks: ['grade6-upper', 'grade6-lower'],
    bookProgress: {
      'grade6-upper': {
        bookId: 'grade6-upper',
        completedModules: ['mod-01', 'mod-02'],
        completedChapters: ['g6u-ch1'],
        totalXP: 120,
        timeSpent: 180,
        lastAccessed: '2024-01-15T10:30:00.000Z'
      }
    }
  }
}
```

### 本地存储
- 使用 `zustand` 的 `persist` 中间件
- 自动保存到浏览器本地存储
- 支持数据迁移和版本控制

## 扩展建议

### 短期扩展
1. **添加六年级下册内容**（10个单元）
2. **完善五年级上册**（8个单元）
3. **添加更多练习类型**

### 长期扩展
1. **支持初中年级**（7-9年级）
2. **添加主题分类**（语法、词汇、听力等）
3. **智能推荐系统**（基于学习表现推荐内容）
4. **学习路径定制**（支持个性化学习计划）

### 技术优化
1. **服务端同步**：支持多设备同步
2. **离线支持**：下载内容到本地
3. **性能优化**：懒加载和缓存策略
4. **国际化**：支持更多语言

## 常见问题

### Q: 如何修改解锁条件？
A: 在 `src/store/useBookStore.ts` 中修改 `canUnlockBook` 函数的逻辑。

### Q: 如何添加新的练习类型？
A: 在模块JSON文件中添加新的quest类型，并在相关组件中处理。

### Q: 如何自定义书籍封面？
A: 将图片放在 `public/images/books/` 目录下，并在书籍数据中指定路径。

### Q: 支持同时使用多个书籍吗？
A: 是的，学生可以随时切换已解锁的书籍，进度独立保存。

## 开发工具

### 调试命令
```bash
# 查看书籍数据
console.log(useBookStore.getState().allBooks)

# 查看用户进度
console.log(useBookStore.getState().userBookProgress)

# 解锁书籍（测试用）
useBookStore.getState().unlockBook('grade5-upper')
```

### 重置数据
```typescript
// 重置所有书籍进度
useBookStore.setState({
  userBookProgress: createDefaultUserBookProgress(),
  currentBookId: 'grade6-upper'
})
```

---

这个系统设计旨在提供最大的灵活性和可扩展性，支持未来多年的内容发展和功能增强。