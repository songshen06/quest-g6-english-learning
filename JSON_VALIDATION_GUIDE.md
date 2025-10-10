# JSON 数据验证指南

## 🎯 验证系统概述

本项目包含了完整的JSON数据验证系统，确保课本数据格式的完整性和正确性。

## 📋 命名规范要求

### 文件名格式
```
grade{年级}-{学期}-mod-{单元号}-{主题}.json
```

### moduleId格式
```
grade{年级}-{学期}-mod-{单元号}
```

### 示例
- ✅ **文件名：** `grade5-lower-mod-01-driver-player.json`
- ✅ **moduleId：** `grade5-lower-mod-01`
- ❌ **错误示例：** `driver-player.json` (缺少前缀)
- ❌ **错误示例：** `grade5-mod-01-player` (缺少学期信息)

### 格式规则
- **年级范围：** 1-6 (grade1 到 grade6)
- **学期：** upper (上册) 或 lower (下册)
- **单元号：** 1-10 (mod-1 到 mod-10)
- **主题：** 使用连字符分隔的英文描述

## 🚀 使用方法

### 1. 验证所有JSON文件
```bash
npm run validate-json
```

### 2. 带验证的导入（推荐）
```bash
npm run import-book:validate
```

### 3. 传统导入（无验证）
```bash
npm run import-book
```

## 🔍 验证内容

### 必需字段验证
- ✅ `moduleId` - 必须符合格式规范
- ✅ `title` - 模块标题
- ✅ `durationMinutes` - 学习时长（正数）
- ✅ `words` - 单词数组（至少3个）
- ✅ `quests` - 任务数组（至少1个）

### 单词验证
每个单词必须包含：
- ✅ `id` - 唯一标识符
- ✅ `en` - 英文单词
- ✅ `zh` - 中文翻译
- ⚠️ `audio` - 可选的音频文件

### 任务验证
支持的任务类型：
- `listen` - 听力练习
- `select` - 选择题
- `speak` - 口语练习
- `wordmatching` - 词语配对
- `sentencesorting` - 句子排序
- `entozh` - 英翻中
- `zhtoen` - 中翻英
- `fillblank` - 填空

## ⚠️ 验证规则

### 严格检查
1. **moduleId唯一性** - 所有文件中不能有重复的moduleId
2. **文件名匹配** - 文件名必须与moduleId信息完全一致
3. **格式验证** - 严格遵守命名规范
4. **数据完整性** - 必需字段不能缺失
5. **数据类型** - 字段类型必须正确

### 警告提示
- 单词数量少于3个
- 没有句型练习
- 没有趣味事实
- 任务数量过少

## 📊 示例验证输出

```
🔍 开始验证所有JSON文件...

📊 验证结果汇总:
============================================================
✅ 通过验证: 15 个文件
❌ 验证失败: 2 个文件

✅ 验证通过的文件:
   ✓ grade5-lower-mod-01-driver-player.json
     单词: 6 | 任务: 2 | 步骤: 4

❌ 验证失败的文件:
   ✗ invalid-module.json
     🚨 moduleId格式错误: "invalid". 正确格式: grade{1-6}-{lower/upper}-mod-{1-10}

⚠️  警告信息:
   ⚠️  grade5-lower-mod-01-driver-player.json: 没有定义句型 - 建议添加一些句型
```

## 🔧 修复常见错误

### moduleId格式错误
```json
// 错误
{
  "moduleId": "driver-player"
}

// 正确
{
  "moduleId": "grade5-lower-mod-01"
}
```

### 文件名不匹配
```
// 错误
文件名: driver-player.json
moduleId: grade5-lower-mod-01

// 正确
文件名: grade5-lower-mod-01-driver-player.json
moduleId: grade5-lower-mod-01
```

### 缺少必需字段
```json
// 错误
{
  "moduleId": "grade5-lower-mod-01",
  "title": "Driver & Player"
  // 缺少 words 和 quests
}

// 正确
{
  "moduleId": "grade5-lower-mod-01",
  "title": "Driver & Player",
  "durationMinutes": 10,
  "words": [...],
  "quests": [...]
}
```

## 🛠️ 开发者指南

### 添加新的验证规则
编辑 `src/utils/jsonValidator.ts` 文件：

```typescript
// 在相应的验证函数中添加新规则
const validateWord = (word: any, index: number): string[] => {
  const errors: string[] = []

  // 现有验证...

  // 添加新验证规则
  if (word.en.length > 50) {
    errors.push(`words[${index}].en: 单词长度不能超过50个字符`)
  }

  return errors
}
```

### 自定义验证消息
在验证函数中修改错误消息，使其更具体和有帮助。

## 📝 最佳实践

1. **创建新文件时** - 先运行验证确保格式正确
2. **批量导入前** - 使用 `npm run validate-json` 预检查
3. **修改文件后** - 再次验证确保没有破坏格式
4. **团队协作时** - 使用验证脚本作为CI/CD流程的一部分

## 🆘 故障排除

### 权限错误
确保有读取 `src/content/` 目录的权限

### 编码问题
所有JSON文件必须使用UTF-8编码

### 路径问题
确保在项目根目录运行脚本

---

## 📞 支持

如果遇到验证问题，请检查：
1. 文件命名是否符合规范
2. JSON格式是否正确
3. 必需字段是否完整
4. 是否有重复的moduleId

如需帮助，请参考示例文件或联系开发团队。