# 书籍设计架构文档

## 📚 设计原则

### 每本书独立性
- **每本书都是独立的**，都从第1单元（Unit 1）开始
- **不延续年级序号**，六年级下册不是从第11单元开始
- **每本书都有10个单元**，符合标准教材设计

### 模块ID命名规范

#### 格式：`{grade}-{semester}-mod-{number}`
- `grade6-lower-mod-01`：六年级下册第1单元
- `grade5-upper-mod-01`：五年级上册第1单元
- `grade4-lower-mod-01`：四年级下册第1单元

## 🏗️ 系统架构

### 文件组织结构
```
src/content/
├── module-01-*.json         # 六年级上册模块（原有）
├── module-02-*.json         # 六年级上册模块（原有）
├── ...
├── module-10-*.json         # 六年级上册模块（原有）
├── grade6-lower-mod-01-*.json   # 六年级下册模块
├── grade6-lower-mod-02-*.json   # 六年级下册模块
├── grade5-upper-mod-01-*.json   # 五年级上册模块
├── grade5-lower-mod-01-*.json   # 五年级下册模块
└── ...
```

### 书籍配置示例
```typescript
{
  id: 'grade6-lower',
  title: '六年级下册',
  subtitle: 'English Adventure Grade 6B',
  grade: 6,
  semester: 'lower',
  totalModules: 10,
  chapters: [
    {
      id: 'g6l-ch1',
      bookId: 'grade6-lower',
      number: 1,
      title: 'Unit 1: Future Plans',
      description: '讨论未来计划和梦想',
      moduleIds: ['grade6-lower-mod-01'],
      estimatedMinutes: 25,
      isLocked: false
    },
    {
      id: 'g6l-ch2',
      bookId: 'grade6-lower',
      number: 2,
      title: 'Unit 2: Travel Dreams',
      description: '环游世界的梦想',
      moduleIds: ['grade6-lower-mod-02'],
      estimatedMinutes: 30,
      isLocked: false
    }
    // ... 继续到Unit 10
  ]
}
```

## 📋 JSON格式模板

每个模块文件必须严格遵守以下格式：

```json
{
  "moduleId": "grade6-lower-mod-01",
  "title": "模块标题",
  "durationMinutes": 25,
  "words": [
    {
      "id": "unique-word-id",
      "en": "english word",
      "zh": "中文意思",
      "audio": "/audio/tts/word.mp3"
    }
  ],
  "phrases": [
    {
      "id": "unique-phrase-id",
      "en": "english phrase",
      "zh": "中文短语",
      "icon": "/images/icons/phrase.svg",
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
          "type": "wordmatching|sentencesorting|fillblank|multiplechoice|entozh|zhtoen",
          "text": "练习说明",
          // 根据类型的特定字段
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
      "type": "fillblank|translate",
      "text": "练习题",
      "answer": "答案"
    }
  ],
  "funFacts": [
    "有趣的事实1",
    "有趣的事实2"
  ]
}
```

## 🎯 练习类型说明

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

## 📝 实施计划

### 第一阶段：六年级下册
- ✅ 创建Unit 1-2模块文件
- ⏳ 继续创建Unit 3-10
- ⏳ 测试完整功能

### 第二阶段：其他年级
- ⏳ 五年级上册/下册
- ⏳ 四年级上册/下册
- ⏳ 三年级上册/下册
- ⏳ 二年级上册/下册
- ⏳ 一年级上册/下册

### 第三阶段：优化和扩展
- ⏳ 添加音频文件
- ⏳ 优化图片资源
- ⏳ 增加更多练习类型

## 🔧 开发指南

### 创建新模块
1. 复制现有模块文件作为模板
2. 修改`moduleId`为正确格式
3. 更新内容（词汇、短语、练习等）
4. 在`books.ts`中添加对应的章节配置
5. 在`BookModulesPage.tsx`中导入新模块

### 质量检查清单
- [ ] JSON格式正确
- [ ] 模块ID符合命名规范
- [ ] 所有音频文件路径存在
- [ ] 练习答案正确
- [ ] 难度适合目标年级
- [ ] 单元时长合理（20-30分钟）

## 📊 系统扩展性

### 优点
1. **独立性强**：每本书可以独立开发和测试
2. **维护简单**：修改一本书不影响其他书
3. **扩展容易**：可以逐步添加新年级和书籍
4. **用户体验好**：学生可以从任何年级开始学习

### 注意事项
1. **文件数量**：需要管理大量的模块文件
2. **加载性能**：需要考虑模块的懒加载
3. **内容一致性**：需要确保相同难度级别的内容质量一致

---

这个架构设计确保了系统的可扩展性和维护性，同时提供了良好的学习体验。