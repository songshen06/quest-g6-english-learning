#!/usr/bin/env python3
"""
LLM提示词生成器
根据六年级下册教材单元快速生成标准化的LLM提示词
"""

from pathlib import Path

def generate_prompt_for_unit(unit_number: int, unit_title: str, theme: str,
                           keywords: list, patterns: list) -> str:
    """为特定单元生成LLM提示词"""

    prompt = f"""你是一个专业的英语教学内容开发专家，需要根据外研社六年级下册英语教材第{unit_number}单元"{unit_title}"（{theme}）的教材内容，生成符合Quest G6学习系统的标准JSON格式文件。

## 📚 单元信息
- **单元编号**: 第{unit_number}单元
- **单元标题**: {unit_title}
- **核心主题**: {theme}
- **关键词汇**: {', '.join(keywords)}
- **核心句型**: {', '.join(patterns)}

## 🎯 JSON生成要求

### 1. 文件命名
文件名必须是：`grade6-lower-mod-{unit_number:02d}-{unit_title.lower().replace(' ', '-')}.json`

### 2. 必须包含的字段结构
```json
{{
  "moduleId": "grade6-lower-mod-{unit_number:02d}",
  "title": "{unit_title}",
  "durationMinutes": 25,
  "words": [],
  "phrases": [],
  "patterns": [],
  "quests": [],
  "practice": [],
  "funFacts": []
}}
```

### 3. 内容生成标准

#### Words（单词列表）- 6-12个单词
基于关键词汇扩展，每个单词包含：
```json
{{
  "id": "word-id",
  "en": "english-word",
  "zh": "中文意思",
  "audio": "/audio/tts/word-english-word.mp3"
}}
```

#### Phrases（短语列表）- 4-8个短语
基于主题和关键词生成常用短语：
```json
{{
  "id": "phrase-id",
  "en": "English phrase",
  "zh": "中文意思",
  "audio": "/audio/tts/phrase-phrase-id.mp3"
}}
```

#### Patterns（句型模板）- 2-4个句型
必须包含以下句型：
{chr(10).join([f'- {pattern}' for pattern in patterns])}

#### Quests（练习任务）- 必须包含4种类型

**1. vocabulary-practice（词汇练习）**
```json
{{
  "id": "vocabulary-practice",
  "title": "词汇练习",
  "steps": [
    {{
      "type": "wordmatching",
      "text": "将英语单词与中文意思配对",
      "pairs": [
        {{"en": "word1", "zh": "中文1"}},
        {{"en": "word2", "zh": "中文2"}}
      ],
      "options": [
        {{"en": "distractor1", "zh": "干扰项1"}},
        {{"en": "distractor2", "zh": "干扰项2"}}
      ]
    }},
    {{
      "type": "sentencesorting",
      "text": "听句子并按正确顺序排列单词",
      "audio": "/audio/tts/phrase-sentence-practice.mp3",
      "scrambled": ["words", "in", "wrong", "order"],
      "correct": ["Words", "in", "correct", "order"]
    }}
  ],
  "reward": {{
    "badge": "/images/rewards/vocabulary-badge.png",
    "xp": 10
  }}
}}
```

**2. dialogue-practice（对话练习）**
```json
{{
  "id": "dialogue-practice",
  "title": "对话练习",
  "steps": [
    {{
      "type": "fillblank",
      "text": "完成对话示例",
      "answer": "expected answer"
    }},
    {{
      "type": "multiplechoice",
      "text": "选择正确的答案",
      "options": ["option1", "option2", "option3"],
      "correct": 0
    }}
  ],
  "reward": {{
    "badge": "/images/rewards/dialogue-badge.png",
    "xp": 15
  }}
}}
```

**3. zh-to-en（中翻英练习）**
```json
{{
  "id": "zh-to-en",
  "title": "中翻英练习",
  "steps": [
    {{
      "type": "zhtoen",
      "text": "将中文句子翻译成正确的英文单词顺序",
      "chinese": "中文句子",
      "scrambledEnglish": ["scrambled", "words"],
      "correctEnglish": ["Correct", "words"]
    }}
  ],
  "reward": {{
    "badge": "/images/rewards/language-badge.png",
    "xp": 15
  }}
}}
```

**4. en-to-zh（英翻中练习）**
```json
{{
  "id": "en-to-zh",
  "title": "英翻中练习",
  "steps": [
    {{
      "type": "entozh",
      "text": "将英文句子翻译成正确的中文单词顺序",
      "english": "English sentence",
      "scrambledChinese": ["错", "误", "顺", "序"],
      "correctChinese": ["正", "确", "顺", "序"]
    }}
  ],
  "reward": {{
    "badge": "/images/rewards/translation-badge.png",
    "xp": 15
  }}
}}
```

#### Practice（额外练习）- 2-3个
```json
[
  {{
    "type": "fillblank",
    "text": "填空练习",
    "answer": "expected answer"
  }},
  {{
    "type": "translate",
    "cn": "中文句子",
    "en": ["English", "sentence"]
  }}
]
```

#### FunFacts（趣味知识）- 2-3个
与主题相关的有趣事实，用中文表达。

## ⚠️ 重要提醒

1. **JSON格式严格性**：
   - 使用双引号，不要使用单引号
   - 确保所有括号匹配
   - 不要有多余的逗号

2. **内容质量要求**：
   - 所有内容必须符合六年级学生水平
   - 单词和短语要实用和常用
   - 练习要有教育意义和趣味性

3. **音频路径格式**：
   - 单词："/audio/tts/word-[单词].mp3"
   - 短语："/audio/tts/phrase-[短语标识].mp3"

请根据以上要求，结合外研社六年级下册第{unit_number}单元"{unit_title}"的具体教材内容，生成完整的JSON文件。

生成完成后，请自己检查：
- [ ] JSON格式正确
- [ ] 包含所有必要字段
- [ ] 单词数量6-12个
- [ ] 短语数量4-8个
- [ ] 包含4种练习类型
- [ ] 内容适合六年级学生
"""

    return prompt

def generate_all_unit_prompts():
    """生成所有单元的提示词"""

    units = [
        {
            "number": 1,
            "title": "Future Plans",
            "theme": "未来计划和职业理想",
            "keywords": ["future", "want", "become", "doctor", "teacher", "engineer", "grow up", "plan", "dream"],
            "patterns": ["What do you want to be in the future?", "I want to be a..."]
        },
        {
            "number": 2,
            "title": "Travel Dreams",
            "theme": "旅行计划和梦想目的地",
            "keywords": ["travel", "dream", "country", "city", "visit", "plane", "train", "hotel", "beach", "mountain"],
            "patterns": ["Where do you want to travel?", "I want to visit..."]
        },
        {
            "number": 3,
            "title": "Healthy Habits",
            "theme": "健康生活习惯",
            "keywords": ["healthy", "habit", "exercise", "sleep", "eat", "vegetables", "fruit", "water", "rest"],
            "patterns": ["What are healthy habits?", "I should..."]
        },
        {
            "number": 4,
            "title": "Environmental Protection",
            "theme": "环境保护",
            "keywords": ["environment", "protect", "recycle", "clean", "green", "earth", "nature", "pollution", "save"],
            "patterns": ["How can we protect the environment?", "We should..."]
        },
        {
            "number": 5,
            "title": "Technology and Life",
            "theme": "科技与生活",
            "keywords": ["technology", "computer", "internet", "phone", "robot", "future", "smart", "digital", "AI"],
            "patterns": ["How does technology help us?", "Technology makes..."]
        },
        {
            "number": 6,
            "title": "Cultural Exchange",
            "theme": "文化交流",
            "keywords": ["culture", "tradition", "festival", "custom", "different", "country", "food", "music", "art"],
            "patterns": ["What do you know about different cultures?", "In... they..."]
        },
        {
            "number": 7,
            "title": "Hobbies and Interests",
            "theme": "兴趣爱好",
            "keywords": ["hobby", "interest", "music", "sports", "reading", "painting", "dancing", "singing", "playing"],
            "patterns": ["What are your hobbies?", "I like..."]
        },
        {
            "number": 8,
            "title": "School Life",
            "theme": "学校生活",
            "keywords": ["school", "class", "teacher", "student", "homework", "exam", "friend", "study", "learn"],
            "patterns": ["What do you do at school?", "At school we..."]
        },
        {
            "number": 9,
            "title": "Food and Nutrition",
            "theme": "食物与营养",
            "keywords": ["food", "eat", "drink", "healthy", "nutrition", "breakfast", "lunch", "dinner", "fruit", "vegetable"],
            "patterns": ["What's your favorite food?", "I like eating..."]
        },
        {
            "number": 10,
            "title": "Seasons and Weather",
            "theme": "季节与天气",
            "keywords": ["season", "weather", "spring", "summer", "autumn", "winter", "sunny", "rainy", "windy", "snowy"],
            "patterns": ["What's the weather like?", "It's..."]
        },
        {
            "number": 11,
            "title": "Animals and Nature",
            "theme": "动物与自然",
            "keywords": ["animal", "nature", "forest", "river", "mountain", "bird", "fish", "flower", "tree", "plant"],
            "patterns": ["What animals do you like?", "I like..."]
        },
        {
            "number": 12,
            "title": "Review and Summary",
            "theme": "复习总结",
            "keywords": ["review", "summary", "learn", "remember", "practice", "improve", "progress", "knowledge", "skill"],
            "patterns": ["What have you learned?", "I have learned..."]
        }
    ]

    prompts_dir = Path("llm_prompts")
    prompts_dir.mkdir(exist_ok=True)

    for unit in units:
        prompt = generate_prompt_for_unit(
            unit["number"],
            unit["title"],
            unit["theme"],
            unit["keywords"],
            unit["patterns"]
        )

        filename = f"grade6-lower-mod-{unit['number']:02d}-prompt.txt"
        filepath = prompts_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(prompt)

        print(f"✅ 生成提示词文件: {filename}")

    print(f"\n🎯 所有单元提示词已生成到 {prompts_dir} 目录")
    print("请根据教材内容选择对应的提示词文件，复制到LLM中生成JSON")

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='LLM提示词生成器')
    parser.add_argument('--all', help='生成所有单元的提示词', action='store_true')
    parser.add_argument('--unit', type=int, help='指定单元编号')
    parser.add_argument('--title', help='单元标题')
    parser.add_argument('--theme', help='单元主题')
    parser.add_argument('--keywords', help='关键词（逗号分隔）')
    parser.add_argument('--patterns', help='句型模板（逗号分隔）')

    args = parser.parse_args()

    if args.all:
        generate_all_unit_prompts()
    elif args.unit and args.title and args.theme:
        keywords = args.keywords.split(',') if args.keywords else []
        patterns = args.patterns.split(',') if args.patterns else []

        prompt = generate_prompt_for_unit(
            args.unit, args.title, args.theme, keywords, patterns
        )

        print("=" * 60)
        print(f"🎯 第{args.unit}单元提示词")
        print("=" * 60)
        print(prompt)
        print("=" * 60)
    else:
        print("请使用 --all 生成所有单元提示词，或指定具体参数生成单个单元提示词")
        print("示例:")
        print("  python generate_llm_prompts.py --all")
        print("  python generate_llm_prompts.py --unit 1 --title 'Future Plans' --theme '未来计划' --keywords 'future,want,doctor' --patterns 'What do you want to be?'")

if __name__ == "__main__":
    main()