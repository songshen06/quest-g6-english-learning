#!/usr/bin/env node

// 六年级下册模块生成脚本
// 使用方法: node scripts/create-module.js 13 "Hobbies and Interests"

const fs = require('fs');
const path = require('path');

const moduleNumber = process.argv[2];
const moduleTitle = process.argv[3];

if (!moduleNumber || !moduleTitle) {
  console.log('使用方法: node scripts/create-module.js <模块号> <模块标题>');
  console.log('示例: node scripts/create-module.js 13 "Hobbies and Interests"');
  process.exit(1);
}

const moduleId = `mod-${moduleNumber.padStart(2, '0')}`;
const fileName = `module-${moduleId}-${moduleTitle.toLowerCase().replace(/\s+/g, '-')}.json`;

const template = {
  moduleId,
  title: moduleTitle,
  durationMinutes: 25,
  words: [
    {"id": "word1", "en": "example", "zh": "例子", "audio": `/audio/tts/example.mp3`},
    {"id": "word2", "en": "practice", "zh": "练习", "audio": `/audio/tts/practice.mp3`},
    {"id": "word3", "en": "learn", "zh": "学习", "audio": `/audio/tts/learn.mp3`}
  ],
  phrases: [
    {"id": "phrase1", "en": "practice English", "zh": "练习英语", "audio": `/audio/tts/practice-english.mp3`}
  ],
  patterns: [
    {"q": "What do you like to do?", "a": "I like to practice English."}
  ],
  quests: [
    {
      "id": "vocabulary-practice",
      "title": "词汇练习",
      "steps": [
        {
          "type": "wordmatching",
          "text": "将英语单词与中文意思配对",
          "pairs": [
            {"en": "example", "zh": "例子"},
            {"en": "practice", "zh": "练习"}
          ],
          "options": [
            {"en": "learn", "zh": "学习"}
          ]
        }
      ],
      "reward": {"badge": `/images/rewards/${moduleId}-badge.png`, "xp": 10}
    }
  ],
  practice: [
    {
      "type": "fillblank",
      "text": "I like to ______ English.",
      "answer": "practice"
    }
  ],
  funFacts: [
    "Practice makes perfect!",
    "Learning English opens many opportunities."
  ]
};

const filePath = path.join(__dirname, '../src/content', fileName);

fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf8');
console.log(`✅ 模块文件已创建: ${filePath}`);
console.log(`📝 模块ID: ${moduleId}`);
console.log(`🔤 标题: ${moduleTitle}`);
console.log('');
console.log('下一步:');
console.log(`1. 编辑 ${filePath} 添加具体内容`);
console.log(`2. 在 src/pages/BookModulesPage.tsx 中添加导入`);
console.log(`3. 在 src/data/books.ts 中更新模块配置`);
console.log(`4. 在 src/data/books.ts 中增加 totalModules 计数`);