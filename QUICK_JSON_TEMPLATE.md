# 🚀 快速JSON生成模板（复制使用）

## 📋 直接复制给LLM的提示词：

```
请为Quest G6英语学习应用生成一个6年级下册第4单元的JSON模块文件。

## 基本信息
- 文件名: grade6-lower-mod-04-healthy-habits.json
- moduleId: grade6-lower-mod-04
- 主题: 健康生活习惯
- 时长: 12分钟
- 年级: 6年级下册

## 严格遵循以下JSON格式：
```json
{
  "moduleId": "grade6-lower-mod-04",
  "title": "Healthy Habits",
  "durationMinutes": 12,
  "words": [
    {
      "id": "healthy",
      "en": "healthy",
      "zh": "健康的",
      "audio": "/audio/tts/healthy.mp3"
    },
    {
      "id": "exercise",
      "en": "exercise",
      "zh": "锻炼",
      "audio": "/audio/tts/exercise.mp3"
    },
    {
      "id": "balanced",
      "en": "balanced",
      "zh": "均衡的",
      "audio": "/audio/tts/balanced.mp3"
    },
    {
      "id": "nutrition",
      "en": "nutrition",
      "zh": "营养",
      "audio": "/audio/tts/nutrition.mp3"
    },
    {
      "id": "sleep",
      "en": "sleep",
      "zh": "睡眠",
      "audio": "/audio/tts/sleep.mp3"
    },
    {
      "id": "energy",
      "en": "energy",
      "zh": "能量",
      "audio": "/audio/tts/energy.mp3"
    }
  ],
  "phrases": [
    {
      "id": "healthy-habits",
      "en": "healthy habits",
      "zh": "健康习惯",
      "icon": "/images/icons/health.svg",
      "audio": "/audio/tts/healthy-habits.mp3"
    },
    {
      "id": "daily-exercise",
      "en": "daily exercise",
      "zh": "日常锻炼",
      "icon": "/images/icons/exercise.svg",
      "audio": "/audio/tts/daily-exercise.mp3"
    },
    {
      "id": "balanced-diet",
      "en": "balanced diet",
      "zh": "均衡饮食",
      "icon": "/images/icons/food.svg",
      "audio": "/audio/tts/balanced-diet.mp3"
    }
  ],
  "patterns": [
    {
      "q": "What are healthy habits?",
      "a": "什么是健康习惯？"
    },
    {
      "q": "We should exercise every day.",
      "a": "我们应该每天锻炼。"
    },
    {
      "q": "A balanced diet is important for health.",
      "a": "均衡饮食对健康很重要。"
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
            {"en": "healthy", "zh": "健康的"},
            {"en": "exercise", "zh": "锻炼"},
            {"en": "balanced", "zh": "均衡的"},
            {"en": "nutrition", "zh": "营养"},
            {"en": "sleep", "zh": "睡眠"}
          ],
          "options": [
            {"en": "energy", "zh": "能量"},
            {"en": "daily", "zh": "日常"}
          ]
        }
      ],
      "reward": {
        "badge": "/images/rewards/health-badge.png",
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
          "audio": "/audio/tts/we-should-exercise-every-day.mp3",
          "scrambled": ["exercise", "We", "every", "should", "day"],
          "correct": ["We", "should", "exercise", "every", "day"]
        },
        {
          "type": "entozh",
          "text": "将英语句子翻译成正确的中文顺序",
          "english": "A balanced diet is important for health.",
          "scrambledChinese": ["健康", "对", "重要", "均衡饮食", "是"],
          "correctChinese": ["均衡饮食", "对", "健康", "是", "重要"]
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
      "text": "We should ___ every day to stay healthy.",
      "answer": "exercise"
    },
    {
      "type": "fillblank",
      "text": "A ___ diet helps us stay strong.",
      "answer": "balanced"
    },
    {
      "type": "translate",
      "cn": "健康的习惯很重要。",
      "en": ["Healthy habits are important."]
    }
  ],
  "funFacts": [
    "Kids need about 9-12 hours of sleep every night.",
    "Eating fruits and vegetables every day keeps you healthy.",
    "Regular exercise makes your brain work better!"
  ]
}
```

## 生成要求：
1. 严格遵循上述JSON结构和字段名称
2. 单词数量：5-8个
3. 短语数量：3-5个
4. 句型数量：3-4个
5. 任务数量：2-3个（必须包含wordmatching和sentencesorting）
6. 练习数量：2-3个
7. 趣味事实：2-3个
8. 内容适合6年级水平，ADHD友好设计

请生成完整的JSON数据。
```

## 🔄 换主题使用模板：

### 方法1：直接替换关键词
```
将模板中的：
- 第4单元 → 第X单元
- healthy-habits → 你的新主题（用连字符）
- Healthy Habits → 你的新主题标题
- 健康生活习惯 → 你的中文主题
- 相关单词、短语、句型替换为新的主题内容
```

### 方法2：快速指定新主题
```
请使用上面的模板格式，但将主题改为：
- 单元：第5单元 (mod-05)
- 主题：环境保护
- 文件名：grade6-lower-mod-05-environment-protection.json
- moduleId：grade6-lower-mod-05

其他所有内容都与环保相关。
```

## ✅ 生成后检查清单：
- [ ] moduleId正确
- [ ] 所有必需字段完整
- [ ] 音频路径格式正确
- [ ] 主题一致性
- [ ] 难度适合6年级
- [ ] ADHD友好

## 🎯 生成其他年级模板：

### 5年级模板：
```
只需将：
- grade6-lower → grade5-lower
- 6年级 → 5年级
- 适当降低难度
```

### 其他学期：
```
- lower (下册)
- upper (上册)
```

这个模板确保LLM生成的JSON文件完全符合你的格式要求！