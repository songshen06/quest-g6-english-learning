# JSON 文件生成提示词模板

## 🎯 基础提示词模板

### 复制这个完整模板给 LLM：

````
你是一个专业的英语教育内容设计师。请为Quest G6英语学习应用生成一个6年级英语学习模块的JSON数据文件。

## 生成要求

### 模块信息
- **年级学期**: grade6-lower (六年级下册)
- **单元编号**: mod-03 (第3单元)
- **学习主题**: 购物与消费 (Shopping and Consumption)
- **建议时长**: 10-15分钟
- **目标学生**: 6年级学生，ADHD友好设计

### 文件格式要求
**文件名**: grade6-lower-mod-03-shopping-consumption.json
**moduleId**: grade6-lower-mod-03

### ID命名规则
- **单词ID**: 使用小写+连字符，如 "shopping-center"
- **短语ID**: 使用小写+连字符，如 "go-shopping"
- **任务ID**: 使用描述性名称，如 "vocabulary-matching"

### JSON结构必须包含
```json
{
  "moduleId": "grade6-lower-mod-03",
  "title": "模块标题",
  "durationMinutes": 12,
  "words": [
    {
      "id": "shopping-center",
      "en": "shopping center",
      "zh": "购物中心",
      "audio": "/audio/tts/shopping-center.mp3"
    },
    {
      "id": "price",
      "en": "price",
      "zh": "价格",
      "audio": "/audio/tts/price.mp3"
    }
  ],
  "phrases": [
    {
      "id": "go-shopping",
      "en": "go shopping",
      "zh": "去购物",
      "icon": "/images/icons/shopping-cart.svg",
      "audio": "/audio/tts/go-shopping.mp3"
    },
    {
      "id": "how-much",
      "en": "how much",
      "zh": "多少钱",
      "icon": "/images/icons/price-tag.svg",
      "audio": "/audio/tts/how-much.mp3"
    }
  ],
  "patterns": [
    {
      "q": "How much is this?",
      "a": "这个多少钱？"
    },
    {
      "q": "I want to buy a new phone.",
      "a": "我想买一个新手机。"
    }
  ],
  "quests": [
    {
      "id": "vocabulary-matching",
      "title": "词语配对练习",
      "steps": [
        {
          "type": "wordmatching",
          "text": "将英语单词与中文意思配对",
          "pairs": [
            {"en": "shopping center", "zh": "购物中心"},
            {"en": "price", "zh": "价格"},
            {"en": "expensive", "zh": "昂贵的"},
            {"en": "cheap", "zh": "便宜的"},
            {"en": "buy", "zh": "购买"}
          ],
          "options": [
            {"en": "sell", "zh": "出售"},
            {"en": "cost", "zh": "花费"}
          ]
        }
      ],
      "reward": {
        "badge": "/images/rewards/shopping-badge.png",
        "xp": 10
      }
    },
    {
      "id": "sentence-practice",
      "title": "句子练习",
      "steps": [
        {
          "type": "sentencesorting",
          "text": "听句子并按正确顺序排列单词",
          "audio": "/audio/tts/how-much-is-this-phone.mp3",
          "scrambled": ["much", "is", "this", "phone", "How"],
          "correct": ["How", "much", "is", "this", "phone"]
        }
      ],
      "reward": {
        "badge": "/images/rewards/sentence-badge.png",
        "xp": 15
      }
    }
  ],
  "practice": [
    {
      "type": "fillblank",
      "text": "How much is this ___? It's 100 yuan.",
      "answer": "phone"
    },
    {
      "type": "fillblank",
      "text": "This shopping ___ is very big.",
      "answer": "center"
    },
    {
      "type": "translate",
      "cn": "这个多少钱？",
      "en": ["How much is this?"]
    }
  ],
  "funFacts": [
    "The world's largest shopping mall is the New South China Mall in China.",
    "Black Friday is the biggest shopping day in the United States.",
    "People spend about 1-2 hours shopping each time they go to a store."
  ]
}
````

### 具体要求

#### 任务要求 (2-3 个)

1. **词语配对练习** (wordmatching)

   - 5 对单词配对
   - 然后保证覆盖所有出现的单词

2. **句子排序练习** (sentencesorting)

   - 6-8 个单词排序
   - 音频支持

3. **翻译练习** (entozh 或 zhtoen)
   - 中英互译
   - 句子结构练习

#### 练习要求 (2-3 个)

- 填空题
- 翻译题
- 难度递进

#### 趣味事实 (2-3 个)

- 英语文化知识
- 激发学习兴趣
- 简单易懂

### 输出格式

请严格按照上述 JSON 格式输出，确保：

1. 所有必需字段完整
2. 数据类型正确
3. 主题一致性
4. 适合 6 年级水平
5. ADHD 友好设计

### ⚠️ 重要注意事项

1. **不要添加注释** - JSON 不能包含注释
2. **确保语法正确** - 所有逗号、括号都要匹配
3. **音频路径统一** - 所有 audio 字段都要以"/audio/tts/"开头
4. **ID 唯一性** - 同一模块内所有 ID 不能重复
5. **主题一致性** - 所有内容都要围绕购物消费主题

请开始生成 grade6-lower-mod-03 购物与消费主题的模块 JSON 数据。

```

## 🔧 主题特定模板

### 根据不同主题修改的关键部分：

#### 1. 环境保护主题
```

- **学习主题**: 环境保护与可持续发展
- **单元编号**: mod-05
- **文件名**: grade6-lower-mod-05-environment-protection.json
- **moduleId**: grade6-lower-mod-05

**单词示例**: environment, pollution, recycle, protect, sustainable
**短语示例**: "protect the environment", "reduce pollution"
**句型示例**: "What can we do to protect the Earth?"

```

#### 2. 科技与生活主题
```

- **学习主题**: 现代科技与日常生活
- **单元编号**: mod-07
- **文件名**: grade6-lower-mod-07-technology-life.json
- **moduleId**: grade6-lower-mod-07

**单词示例**: technology, device, internet, digital, communicate
**短语示例**: "use the internet", "digital devices"
**句型示例**: "How does technology help us in daily life?"

```

#### 3. 职业规划主题
```

- **学习主题**: 未来职业与梦想工作
- **单元编号**: mod-02
- **文件名**: grade6-lower-mod-02-future-careers.json
- **moduleId**: grade6-lower-mod-02

**单词示例**: career, profession, dream, future, achieve
**短语示例**: "dream job", "achieve goals"
**句型示例**: "What do you want to be in the future?"

````

## 📋 任务类型详细说明

### 1. wordmatching (词语配对)
```json
{
  "type": "wordmatching",
  "text": "将英语单词与中文意思配对",
  "pairs": [
    {"en": "environment", "zh": "环境"},
    {"en": "pollution", "zh": "污染"}
  ],
  "options": [
    {"en": "protect", "zh": "保护"},
    {"en": "clean", "zh": "清洁"}
  ]
}
````

### 2. sentencesorting (句子排序)

```json
{
  "type": "sentencesorting",
  "text": "听句子并按正确顺序排列单词",
  "audio": "/audio/tts/例句音频.mp3",
  "scrambled": ["We", "should", "protect", "the", "environment"],
  "correct": ["We", "should", "protect", "the", "environment"]
}
```

### 3. entozh (英翻中)

```json
{
  "type": "entozh",
  "text": "将英语句子翻译成正确的中文顺序",
  "english": "We should protect our environment.",
  "scrambledChinese": ["保护", "环境", "应该", "我们", "的"],
  "correctChinese": ["我们", "应该", "保护", "环境"]
}
```

### 4. zhtoen (中翻英)

```json
{
  "type": "zhtoen",
  "text": "将中文句子翻译成正确的英文单词顺序",
  "chinese": "我们应该保护环境。",
  "scrambledEnglish": ["We", "environment", "should", "protect"],
  "correctEnglish": ["We", "should", "protect", "the", "environment"]
}
```

## 🎯 质量检查清单

### 生成后请检查：

- [ ] moduleId 格式正确
- [ ] 文件名与 moduleId 匹配
- [ ] 所有必需字段完整
- [ ] 单词数量 5-8 个
- [ ] 短语数量 3-5 个
- [ ] 句型数量 3-4 个
- [ ] 任务数量 2-3 个
- [ ] 练习数量 2-3 个
- [ ] 趣味事实 2-3 个
- [ ] 内容适合 5 年级水平
- [ ] 主题一致性良好
- [ ] ADHD 友好设计

## 🚀 快速生成命令

### 为不同主题快速生成：

```
请为以下主题生成JSON数据：
- 年级学期: grade6-lower
- 单元编号: mod-[数字]
- 主题: [主题描述]
- 时长: [数字]分钟

使用上面提供的JSON格式和要求。
```

## 🔧 常见问题修复

### 如果 LLM 生成的 JSON 有错误：

#### 1. 缺少字段

```
问题：缺少moduleId字段
解决：在JSON开头添加 "moduleId": "grade6-lower-mod-03",
```

#### 2. 音频路径错误

```
问题：audio字段路径不统一
解决：确保所有audio都格式为 "/audio/tts/xxx.mp3"
```

#### 3. ID 重复

```
问题：单词ID和短语ID重复
解决：确保每个ID都是唯一的，使用不同前缀
```

#### 4. JSON 语法错误

```
问题：多余的逗号或括号不匹配
解决：仔细检查JSON语法，移除多余逗号
```

## 💡 最佳实践

1. **先明确主题** - 确定具体的、适合 6 年级的主题
2. **难度控制** - 单词和句子要符合 6 年级水平
3. **实用性** - 选择日常实用的词汇和表达
4. **多样性** - 包含不同类型的练习活动
5. **趣味性** - 加入有趣的 facts 和互动元素
6. **验证生成** - 使用 `npm run validate-json` 验证生成的文件

## 🚀 快速使用流程

1. **复制模板** → 2. **修改主题** → 3. **发送给 LLM** → 4. **保存 JSON** → 5. **验证文件** → 6. **导入系统**

使用这个模板，LLM 就能生成符合你格式要求的 JSON 文件了！

---

## 📚 基于教科书生成说明

本模板用于“基于教科书内容”生成模块数据。请先从教科书对应单元提取信息，再严格映射到下方 JSON 字段。确保命名、数量与格式符合规范。

### 教材到 JSON 字段映射

- 教材信息 → `moduleId`, `title`, `durationMinutes`
  - `moduleId`: `grade{1-6}-{lower/upper}-mod-{01-10}`（如 `grade6-lower-mod-03`）
  - `title`: 教材该单元或课题英文标题（必要时可提炼简洁版）
  - `durationMinutes`: 建议时长（10–15）
- 教材词汇表 → `words`（5–8 个）
  - 每项包含 `id`（小写连字符）、`en`、`zh`、`audio`（`/audio/tts/<id>.mp3`）
- 教材短语/搭配 → `phrases`（3–5 个）
  - 每项包含 `id`、`en`、`zh`、`icon`、`audio`
- 教材重点句型/例句 → `patterns`（3–4 条）
  - 每项包含 `q`（英文）、`a`（中文）
- 教材练习与活动建议 → `quests`（2–3 个）
  - 选择 `wordmatching`、`sentencesorting`、`entozh`、`zhtoen` 等类型，并为每个任务设计至少 1 个 `steps`
  - 每个任务包含 `reward`（`badge` 与 `xp`）
- 课后练习/巩固 → `practice`（2–3 个）
  - 使用 `fillblank`、`translate` 等类型，难度递进
- 文化补充/趣味知识 → `funFacts`（2–3 个）

### 教材输入示例（提供给 LLM 的上下文）

```
教材元信息：
- 年级学期：grade6-lower
- 单元编号：mod-03
- 主题（中/英）：购物与消费 / Shopping and Consumption
- 建议时长：12分钟

教材词汇（英文/中文）：
- shopping center / 购物中心
- price / 价格
- expensive / 昂贵的
- cheap / 便宜的
- buy / 购买

教材短语：
- go shopping / 去购物
- how much / 多少钱
- on sale / 打折

教材重点句型/例句：
- How much is this? / 这个多少钱？
- Is there a discount? / 有折扣吗？
- I want to buy ... / 我想买……

教材活动建议（可转为任务/练习）：
- 词汇配对、句子排序、英中互译
```

### 生成与导入流程（基于教科书）

1. 按教材单元提取并整理上述“教材输入示例”内容。
2. 使用本模板提示词生成 JSON，文件命名为：`grade6-lower-mod-03-shopping-consumption.json`。
3. 将文件保存到 `src/content/` 目录。
4. 运行 `npm run validate-json` 完整校验命名与数据格式。
5. 运行 `npm run import-book:validate` 自动导入并生成模块映射（推荐）。
6. 启动开发服预览交互效果：`npm run dev`。

### 质量与一致性要点（来自教科书）

- 主题一致：所有词汇、短语、句型、任务与练习围绕教材主题。
- 数量规范：`words` 5–8，`phrases` 3–5，`patterns` 3–4，`quests` 2–3，`practice` 2–3，`funFacts` 2–3。
- 命名规范：`moduleId` 与文件名严格匹配；各 `id` 唯一、小写连字符。
- 音频规范：统一使用 `/audio/tts/<id>.mp3`；如暂缺音频，可先占位，后续补齐。
- ADHD 友好：步骤清晰、指令简洁、难度递进、奖励明确。

---

## 🧭 Quests 强化要求（四类型必含）

为保证交互一致性，每个模块必须包含以下 4 种任务类型，各至少 1 个步骤：

- vocabulary-matching → `type: "wordmatching"`

  - 字段：`text`, `pairs[{en, zh, audio?}]`, `options[{en, zh}]`
  - 建议：`pairs` 覆盖本模块出现的核心词汇，`options` 为干扰项

- sentence-sorting → `type: "sentencesorting"`

  - 字段：`text`, `audio?`, `scrambled[string[]]`, `correct[string[]]`
  - 建议：6–8 个单词；如有音频，置于 `audio: /audio/tts/<sentence>.mp3`

- en-to-zh → `type: "entozh"`

  - 字段：`text`, `english`, `scrambledChinese[string[]]`, `correctChinese[string[]]`
  - 建议：选教材重点句，中文词序打乱后要求排成正确顺序

- zh-to-en → `type: "zhtoen"`
  - 字段：`text`, `chinese`, `scrambledEnglish[string[]]`, `correctEnglish[string[]]`
  - 建议：中文句子给定，英文单词打乱后按正确语序排列

注意：`type` 字段必须严格使用：`wordmatching`、`sentencesorting`、`entozh`、`zhtoen`，以匹配系统校验与前端组件。

---

## 📦 批量生成 10 单元（grade5-lower）提示词

将以下提示词整体复制给 LLM，并在“模块主题清单”中填入你教科书的 10 个单元主题（英文与中文）。LLM 将一次性输出 10 个独立的 JSON 代码块，每个对应一个文件。

````
你是一个专业的英语教育内容设计师。请基于六年级下册（grade6-lower）教科书，一次性生成 10 个学习模块的 JSON 文件。



## 全局约束

- 年级学期：grade6-lower

- 单元编号：mod-01 到 mod-10（两位数编号）

- 文件命名格式：grade{1-6}-{lower/upper}-mod-{01-10}-{主题英文}.json

  - 本次文件名示例：grade6-lower-mod-01-<topic-en>.json ... grade6-lower-mod-10-<topic-en>.json

- moduleId：grade6-lower-mod-01 ... grade6-lower-mod-10（与文件名中的编号一致）

- 时长：每个模块的 `durationMinutes` 为 10–15 分钟



## 模块主题清单（替换为教科书实际主题）

- mod-01: <topic-en-01> / <topic-zh-01>

- mod-02: <topic-en-02> / <topic-zh-02>

- mod-03: <topic-en-03> / <topic-zh-03>

- mod-04: <topic-en-04> / <topic-zh-04>

- mod-05: <topic-en-05> / <topic-zh-05>

- mod-06: <topic-en-06> / <topic-zh-06>

- mod-07: <topic-en-07> / <topic-zh-07>

- mod-08: <topic-en-08> / <topic-zh-08>

- mod-09: <topic-en-09> / <topic-zh-09>

- mod-10: <topic-en-10> / <topic-zh-10>



## 每个模块的JSON格式（严格一致）

```json

{

  "moduleId": "grade5-lower-mod-01",

  "title": "<模块英文标题，基于主题>",

  "durationMinutes": 12,

  "words": [

    {"id": "<word-id-1>", "en": "<en>", "zh": "<zh>", "audio": "/audio/tts/<word-id-1>.mp3"},

    {"id": "<word-id-2>", "en": "<en>", "zh": "<zh>", "audio": "/audio/tts/<word-id-2>.mp3"}

  ],

  "phrases": [

    {"id": "<phrase-id-1>", "en": "<en>", "zh": "<zh>", "icon": "/images/icons/<icon-1>.svg", "audio": "/audio/tts/<phrase-id-1>.mp3"}

  ],

  "patterns": [

    {"q": "<重点句型英文>", "a": "<中文译文>"}

  ],

  "quests": [

    {

      "id": "vocabulary-matching",

      "title": "词语配对练习",

      "steps": [

        {"type": "wordmatching", "text": "将英语单词与中文意思配对", "pairs": [{"en": "<en>", "zh": "<zh>"}], "options": [{"en": "<en>", "zh": "<zh>"}]}

      ],

      "reward": {"badge": "/images/rewards/<badge-1>.png", "xp": 10}

    },

    {

      "id": "sentence-sorting",

      "title": "句子排序练习",

      "steps": [

        {"type": "sentencesorting", "text": "听句子并按正确顺序排列单词", "audio": "/audio/tts/<sentence-audio>.mp3", "scrambled": ["<w1>", "<w2>", "<w3>"], "correct": ["<w1>", "<w2>", "<w3>"]}

      ],

      "reward": {"badge": "/images/rewards/<badge-2>.png", "xp": 15}

    },

    {

      "id": "en-to-zh",

      "title": "英翻中练习",

      "steps": [

        {"type": "entozh", "text": "将英语句子翻译成正确的中文顺序", "english": "<English sentence>", "scrambledChinese": ["<词1>", "<词2>", "<词3>"], "correctChinese": ["<词1>", "<词2>", "<词3>"]}

      ],

      "reward": {"badge": "/images/rewards/<badge-3>.png", "xp": 12}

    },

    {

      "id": "zh-to-en",

      "title": "中翻英练习",

      "steps": [

        {"type": "zhtoen", "text": "将中文句子翻译成正确的英文单词顺序", "chinese": "<中文句子>", "scrambledEnglish": ["<word1>", "<word2>", "<word3>"], "correctEnglish": ["<word1>", "<word2>", "<word3>"]}

      ],

      "reward": {"badge": "/images/rewards/<badge-4>.png", "xp": 12}

    }

  ],

  "practice": [

    {"type": "fillblank", "text": "<句子含空格>", "answer": "<答案>"},

    {"type": "translate", "cn": "<中文>", "en": ["<英文>"]}

  ],

  "funFacts": ["<简短趣味事实1>", "<简短趣味事实2>"]

}

````

## 字段与数量要求（每个模块）

- words：5–8 个；`id` 使用小写连字符且唯一；`audio` 统一为 `/audio/tts/<id>.mp3`

- phrases：3–5 个；包含 `icon` 与 `audio`

- patterns：3–4 条；英文 `q` + 中文 `a`

- quests：4 个，必须包含以下四类型：`wordmatching`、`sentencesorting`、`entozh`、`zhtoen`；每个任务包含 `steps` 与 `reward`

- practice：2–3 个；包含 `fillblank` 与 `translate` 类型，难度递进

- funFacts：2–3 个；简洁、有趣、与主题相关

## 命名与路径规则

- 文件名与 `moduleId` 严格匹配编号（01–10），示例：`grade5-lower-mod-03-<topic-en>.json`

- 所有 `audio` 路径以 `/audio/tts/` 开头；`badge` 使用 `/images/rewards/`；`icon` 使用 `/images/icons/`

- 不在 JSON 内添加注释；确保语法正确、逗号与括号匹配

## 输出格式要求

- 输出 10 个相互独立的 JSON 代码块。

- 每个代码块前用一行标明文件名：`FILENAME: grade6-lower-mod-XX-<topic-en>.json`

- 代码块内仅包含合法 JSON 字段，无注释、无多余文本。

```

```
