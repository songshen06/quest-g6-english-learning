# 添加新模块完整指南

## 🎯 快速开始 - 添加六年级下册模块

### 第一步：创建模块文件

#### 方法1：使用脚本（推荐）
```bash
cd /Users/shens/Tools/Quest_G6
node scripts/create-module.js 13 "Hobbies and Interests"
```

#### 方法2：手动创建
复制现有文件：
```bash
cp src/content/module-01-how-long.json src/content/module-13-hobbies.json
```

### 第二步：编辑模块内容

编辑新创建的模块文件，修改以下字段：
- `moduleId`: 确保格式正确（如 "mod-13"）
- `title`: 模块标题
- `durationMinutes`: 学习时长
- `words`: 词汇列表
- `phrases`: 短语列表
- `patterns`: 句型模式
- `quests`: 练习题和奖励

### 第三步：更新模块导入

在 `src/pages/BookModulesPage.tsx` 中添加导入：

```typescript
import module13Data from '../content/module-13-hobbies.json'

const allModulesData = [
  // ... 现有模块
  module13Data
]
```

### 第四步：更新书籍配置

在 `src/data/books.ts` 中：

1. **更新六年级下册配置**：
```typescript
{
  id: 'grade6-lower',
  title: '六年级下册',
  // ...
  totalModules: 3, // 增加1个
  chapters: [
    // ... 现有章节
    {
      id: 'g6l-ch3',
      bookId: 'grade6-lower',
      number: 3,
      title: 'Unit 13: Hobbies and Interests',
      description: '兴趣爱好',
      moduleIds: ['mod-13'], // 添加新模块
      estimatedMinutes: 25,
      isLocked: false
    }
  ]
}
```

### 第五步：测试

1. 重启开发服务器
2. 进入六年级下册
3. 确认新模块显示在正确章节中
4. 测试模块可以正常进入

## 📋 模块内容结构

每个模块文件需要包含以下结构：

```json
{
  "moduleId": "mod-13",
  "title": "模块标题",
  "durationMinutes": 25,
  "words": [
    {
      "id": "word1",
      "en": "example",
      "zh": "中文意思",
      "audio": "/audio/tts/example.mp3"
    }
  ],
  "phrases": [
    {
      "id": "phrase1",
      "en": "example phrase",
      "zh": "中文短语",
      "icon": "/images/icons/example.svg", // 可选
      "audio": "/audio/tts/phrase.mp3"
    }
  ],
  "patterns": [
    {
      "q": "问句",
      "a": "答句"
    }
  ],
  "quests": [
    {
      "id": "quest-unique-id",
      "title": "练习标题",
      "steps": [
        {
          "type": "wordmatching", // 或其他类型
          "text": "练习说明",
          "pairs": [{"en": "word", "zh": "词"}],
          "options": [{"en": "选项", "zh": "选项"}]
        }
      ],
      "reward": {
        "badge": "/images/rewards/badge.png",
        "xp": 10
      }
    }
  ],
  "practice": [
    {
      "type": "fillblank",
      "text": "填空题题干______",
      "answer": "答案"
    }
  ],
  "funFacts": [
    "有趣的事实1",
    "有趣的事实2"
  ]
}
```

## 🎨 练习类型参考

### 词汇练习
- `wordmatching`: 单词配对
- `flashcards`: 闪卡

### 句子练习
- `sentencesorting`: 句子排序
- `fillblank`: 填空
- `multiplechoice`: 选择题

### 翻译练习
- `entozh`: 英翻中
- `zhtoen`: 中翻英

### 听说练习
- `listen`: 听力练习
- `speak`: 口语练习（需要录音权限）

## 📁 文件组织

```
src/
├── content/                  # 模块内容文件
│   ├── module-01-*.json
│   ├── module-02-*.json
│   └── ...
├── data/
│   └── books.ts             # 书籍配置
├── pages/
│   └── BookModulesPage.tsx  # 模块页面
└── scripts/
    └── create-module.js     # 模块生成脚本
```

## 🔧 解锁条件设置

在 `src/store/useBookStore.ts` 中可以调整解锁条件：

```typescript
canUnlockBook: (bookId: string, userProgress: UserBookProgress) => {
  // 修改这里的逻辑来调整解锁条件
}
```

默认条件：
- 下册需要上册完成80%
- 下一年级需要当前年级完成大部分

## 📊 进度跟踪

系统会自动跟踪：
- ✅ 完成的模块
- ✅ 完成的章节
- 📈 学习进度百分比
- ⭐ 获得的XP和徽章

## 🐛 常见问题

### Q: 模块显示在错误的章节中
A: 检查 `books.ts` 中的 `moduleIds` 数组配置

### Q: 模块无法点击
A: 确认 `canAccessModule` 函数逻辑正确

### Q: 进度不保存
A: 检查 BookStore 的 persist 配置

### Q: 音频文件缺失
A: 确保音频文件路径正确，文件存在

## 🚀 批量添加建议

如果要添加多个模块：

1. **创建计划**：先规划好所有模块的主题
2. **批量生成**：使用脚本创建文件模板
3. **分批测试**：每添加2-3个模块测试一次
4. **内容质量**：确保每个模块内容丰富且完整

## 📝 内容创作建议

### 词汇选择
- 选择该年级核心词汇
- 包含常用动词、名词、形容词
- 每个模块6-8个词汇

### 短语设计
- 基于词汇扩展常用短语
- 包含实用表达方式
- 3-5个短语为宜

### 练习设计
- 从简单到复杂
- 包含听、说、读、写综合练习
- 每个练习15-20分钟

---

记住：**质量比数量更重要**！确保每个模块内容完整、有趣、有价值。