# 📚 书籍导入完整指南

## 🎯 概述

**重要更新**：现在可以使用自动化脚本完成大部分工作！推荐使用自动化方式，手动方式仅作参考。

### 自动化方式（推荐）⭐
只需2个步骤：
1. **创建模块文件** (10个JSON文件)
2. **运行自动化脚本** (一键更新所有配置)

### 手动方式（传统）⚙️
需要完成4个主要步骤：
1. **创建模块文件** (10个JSON文件)
2. **配置书籍信息** (更新books.ts)
3. **更新模块加载** (更新两个页面)
4. **测试验证** (确保功能正常)

---

## 🚀 自动化方式（推荐）

### 步骤1：创建模块文件
按照下面的模板创建10个JSON模块文件，保存到 `src/content/` 目录。

### 步骤2：运行自动化脚本
```bash
npm run import-book
```

脚本会自动：
- ✅ 扫描所有模块文件
- ✅ 解析文件名并分组
- ✅ 更新 `src/data/books.ts`
- ✅ 更新 `src/pages/BookModulesPage.tsx`
- ✅ 更新 `src/pages/ModulePage.tsx`
- ✅ 生成完整的导入语句和映射

### 步骤3：验证结果
```bash
npm run build  # 检查编译
npm run dev    # 启动测试
```

---

## 📝 手动方式（传统）

### 步骤1：创建模块文件 (10个单元)

### 1.1 确定模块ID格式
```
格式：{grade}-{semester}-mod-{number}
示例：grade5-upper-mod-01 (五年级上册第1单元)
```

### 1.2 创建模块文件
每个模块文件命名：`{模块ID}-{主题}.json`
```
grade5-upper-mod-01-school-life.json
grade5-upper-mod-02-family-friends.json
grade5-upper-mod-03-food-drinks.json
...
grade5-upper-mod-10-review.json
```

### 1.3 模块文件内容模板
```json
{
  "moduleId": "grade5-upper-mod-01",
  "title": "School Life",
  "durationMinutes": 25,
  "words": [
    {
      "id": "school",
      "en": "school",
      "zh": "学校",
      "audio": "/audio/tts/school.mp3"
    }
  ],
  "phrases": [
    {
      "id": "go-to-school",
      "en": "go to school",
      "zh": "去上学",
      "icon": "/images/icons/school.svg",
      "audio": "/audio/tts/go-to-school.mp3"
    }
  ],
  "quests": [
    {
      "id": "vocabulary-practice",
      "title": "词汇练习",
      "steps": [
        {
          "type": "wordmatching",
          "text": "将英语单词与中文意思配对",
          "pairs": [
            {"en": "school", "zh": "学校"}
          ],
          "options": [
            {"en": "home", "zh": "家"}
          ]
        }
      ],
      "reward": {
        "badge": "/images/rewards/vocab-badge.png",
        "xp": 10
      }
    }
  ]
}
```

### 1.4 内容要求
- **words**: 6-8个核心词汇
- **phrases**: 3-5个常用短语
- **quests**: 至少2个练习

### 1.5 字段说明
- `moduleId`: 模块唯一标识符，格式为 `{grade}-{semester}-mod-{number}`
- `title`: 模块标题
- `durationMinutes`: 预计学习时长
- `words`: 词汇数组，每个包含 id、en、zh、audio
- `phrases`: 短语数组，每个包含 id、en、zh、icon、audio
- `quests`: 练习题数组，每个包含 id、title、steps、reward

---

## 📋 步骤2：配置书籍信息

### 2.1 打开书籍配置文件
```
src/data/books.ts
```

### 2.2 添加书籍配置
在`booksData`数组中添加新书籍：

```typescript
{
  id: 'grade5-upper',
  title: '五年级上册',
  subtitle: 'English Adventure Grade 5A',
  grade: 5,
  semester: 'upper',
  cover: '/images/books/grade5-upper.jpg',
  description: '五年级上册英语学习内容，包含10个主题单元',
  totalModules: 10,
  difficulty: 'elementary',
  tags: ['小学中年级', '基础语法', '日常对话'],
  isActive: true,
  publishedAt: '2024-01-01',
  chapters: [
    {
      id: 'g5u-ch1',
      bookId: 'grade5-upper',
      number: 1,
      title: 'Unit 1: School Life',
      description: '学校生活',
      moduleIds: ['grade5-upper-mod-01'],
      estimatedMinutes: 25,
      isLocked: false
    },
    {
      id: 'g5u-ch2',
      bookId: 'grade5-upper',
      number: 2,
      title: 'Unit 2: Family & Friends',
      description: '家庭和朋友',
      moduleIds: ['grade5-upper-mod-02'],
      estimatedMinutes: 30,
      isLocked: false
    }
    // 继续添加到Unit 10...
  ]
}
```

### 2.3 配置要点
- `id`: 使用格式`{grade}{semester}`
- `totalModules`: 设置为10
- `isActive`: 设置为`true`
- `chapters`: 每个章节对应一个单元

---

## 🔄 步骤3：更新模块加载

### 3.1 更新BookModulesPage.tsx
```
src/pages/BookModulesPage.tsx
```

#### 3.1.1 添加模块导入
```typescript
// 在import部分添加
import grade5UpperMod01Data from '../content/grade5-upper-mod-01-school-life.json'
import grade5UpperMod02Data from '../content/grade5-upper-mod-02-family-friends.json'
// ... 继续添加所有10个模块
```

#### 3.1.2 更新模块数组
```typescript
const allModulesData = [
  // 现有模块...
  module01Data,
  module02Data,
  // ...

  // 新的年级模块
  grade5UpperMod01Data,
  grade5UpperMod02Data,
  // ... 添加所有10个模块
]
```

### 3.2 更新ModulePage.tsx
```
src/pages/ModulePage.tsx
```

#### 3.2.1 添加模块导入
```typescript
// 在import部分添加
import grade5UpperMod01Data from '@/content/grade5-upper-mod-01-school-life.json'
import grade5UpperMod02Data from '@/content/grade5-upper-mod-02-family-friends.json'
// ... 继续添加所有10个模块
```

#### 3.2.2 更新模块映射
```typescript
const moduleDataMap: Record<string, Module> = {
  // 现有模块...

  // 新的年级模块
  'grade5-upper-mod-01': grade5UpperMod01Data,
  'grade5-upper-mod-02': grade5UpperMod02Data,
  // ... 添加所有10个模块
}
```

---

## 🧪 步骤4：测试验证

### 4.1 构建测试
```bash
npm run build
```
确保没有编译错误。

### 4.2 功能测试
1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **测试流程**：
   - 访问 http://localhost:5174/
   - 点击"Modules"
   - 选择新添加的书籍
   - 验证所有10个单元都显示
   - 点击每个单元，确认能正常加载
   - 测试练习题是否正常工作

### 4.3 验证清单
- [ ] 书籍在选择界面显示正确
- [ ] 所有10个单元都可见
- [ ] 每个单元都能点击进入
- [ ] 单元内容正确加载
- [ ] 练习题功能正常
- [ ] 词汇、短语、句型都显示
- [ ] 进度跟踪正常工作
- [ ] 无控制台错误

---

## 📁 文件组织示例

### 创建10个模块文件：
```
src/content/
├── grade5-upper-mod-01-school-life.json
├── grade5-upper-mod-02-family-friends.json
├── grade5-upper-mod-03-food-drinks.json
├── grade5-upper-mod-04-animals-pets.json
├── grade5-upper-mod-05-sports-games.json
├── grade5-upper-mod-06-weather-seasons.json
├── grade5-upper-mod-07-hobbies-interests.json
├── grade5-upper-mod-08-daily-routine.json
├── grade5-upper-mod-09-holidays-festivals.json
└── grade5-upper-mod-10-review-test.json
```

### 修改的文件：
```
src/
├── data/books.ts                    # 添加书籍配置
├── pages/BookModulesPage.tsx        # 添加模块导入
└── pages/ModulePage.tsx             # 添加模块映射
```

---

## ⚠️ 注意事项

### 1. 模块ID一致性
- 确保文件名、moduleId、books.ts中的moduleIds完全一致
- 错误示例：文件名是`mod-01`但配置中是`mod01`

### 2. JSON格式严格性
- 所有字符串必须用双引号
- 最后一个属性后不能有逗号
- 确保必需字段存在：moduleId, title, durationMinutes, words, phrases, quests

### 3. 音频文件路径
- 确保所有audio路径都存在
- 使用`/audio/tts/word.mp3`格式

### 4. 图片资源
- badge路径：`/images/rewards/badge.png`
- icon路径：`/images/icons/phrase.svg`
- cover路径：`/images/books/grade5-upper.jpg`

### 5. 内容质量
- 词汇适合目标年级
- 练习难度循序渐进
- 主题符合学生兴趣

---

## 🔧 常见问题解决

### 自动化脚本问题
**Q1: 脚本运行失败**
**原因**: 文件命名格式不正确或JSON格式错误
**解决**: 检查文件名格式和JSON语法

**Q2: 模块数量不正确**
**原因**: 脚本没有识别到某些模块文件
**解决**: 确认文件都在 `src/content/` 目录中，命名符合规范

**Q3: 构建失败**
**原因**: 生成的代码有语法错误
**解决**: 检查JSON文件中的必需字段是否完整

### 手动方式问题
**Q4: 模块加载失败**
**原因**: ModulePage.tsx中缺少模块映射
**解决**: 在moduleDataMap中添加模块映射

**Q5: 书籍不显示**
**原因**: books.ts中isActive设置为false
**解决**: 设置isActive为true

**Q6: 单元无法点击**
**原因**: moduleIds与实际moduleId不匹配
**解决**: 检查并确保ID完全一致

**Q7: 构建失败**
**原因**: JSON格式错误或导入路径错误
**解决**: 检查JSON语法和文件路径

---

## 📋 完整检查清单

### 自动化方式检查清单
- [ ] 创建了10个模块JSON文件
- [ ] 文件命名符合规范 (gradeX-semester-mod-XX-topic.json)
- [ ] JSON格式正确，包含必需字段
- [ ] 运行了 `npm run import-book`
- [ ] 脚本成功识别并处理所有模块
- [ ] 构建无错误 (`npm run build`)
- [ ] 功能测试通过 (`npm run dev`)

### 手动方式检查清单
- [ ] 每个文件都有正确的moduleId
- [ ] JSON格式正确
- [ ] 包含所有必需字段 (words, phrases, quests)
- [ ] 音频路径正确
- [ ] 内容适合目标年级

### 书籍配置
- [ ] books.ts中添加了书籍配置
- [ ] totalModules设置为10
- [ ] isActive设置为true
- [ ] 所有10个章节都已配置
- [ ] moduleIds与模块文件的moduleId一致

### 模块加载
- [ ] BookModulesPage.tsx中导入了所有模块
- [ ] ModulePage.tsx中导入了所有模块
- [ ] ModulePage.tsx中添加了模块映射
- [ ] 构建无错误

### 功能测试
- [ ] 书籍在选择界面可见
- [ ] 所有单元都显示
- [ ] 单元内容正确加载
- [ ] 练习功能正常
- [ ] 进度跟踪工作

---

## 📊 效率对比

| 方式 | 步骤数量 | 所需时间 | 错误率 | 推荐度 |
|------|----------|----------|--------|--------|
| 自动化 | 2步 | 5分钟 | 低 | ⭐⭐⭐⭐⭐ |
| 手动 | 4步 | 30分钟 | 中 | ⭐⭐ |

---

## 🎯 总结

**推荐工作流程**：
1. 创建10个JSON模块文件
2. 运行 `npm run import-book`
3. 验证构建和功能

这样的自动化流程让书籍导入工作大大简化，维护人员只需专注于内容质量，技术配置完全交给脚本处理！