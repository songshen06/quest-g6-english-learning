# 通用Quest生成器使用指南

## 概述

`generate_quests_generic.py` 是一个通用的Quest内容生成脚本，可以为任意年级和不同格式的学习模块文件自动生成标准格式的quests内容。

## 主要特性

- **兼容性强**: 支持新旧不同的文件格式
- **自适应检测**: 自动识别文件结构并适配
- **多种练习类型**: 生成4种不同类型的交互练习
- **安全性**: 自动备份原文件，支持预览模式

## 支持的练习类型

1. **词汇配对练习** (`vocabulary-matching`) - 将英语单词与中文意思配对
2. **句子排序练习** (`sentence-sorting`) - 听句子并按正确顺序排列单词
3. **英翻中练习** (`en-to-zh`) - 将英语句子翻译成正确的中文顺序
4. **中翻英练习** (`zh-to-en`) - 将中文句子翻译成正确的英文单词顺序

## 使用方法

### 基本用法

```bash
# 为特定年级生成quests
python generate_quests_generic.py --grade grade3

# 为特定年级生成quests（预览模式）
python generate_quests_generic.py --grade grade4 --dry-run

# 使用自定义文件模式
python generate_quests_generic.py --pattern "grade3-lower-*"

# 详细输出模式
python generate_quests_generic.py --grade grade5 --verbose
```

### 参数说明

- `--content-dir`: 内容目录路径（默认: src/content）
- `--grade`: 指定年级（如: grade3, grade4）
- `--pattern`: 自定义文件名模式（如: grade3-lower-*）
- `--dry-run`: 预览模式，不实际修改文件
- `--verbose, -v`: 详细输出模式

## 文件格式兼容性

### 新格式（Grade 3）
```json
{
  "words": [
    {"id": "nice", "en": "nice", "zh": "友好的", "audio": "/audio/tts/nice.mp3"}
  ],
  "phrases": [
    {"id": "a-bit-shy", "en": "a bit shy", "zh": "有点害羞", "icon": "...", "audio": "..."}
  ],
  "patterns": [
    {"q": "She's very nice.", "a": "她非常友好。"}
  ]
}
```

### 旧格式（Grade 4+）
```json
{
  "words": [
    {"en": "nice", "zh": "友好的", "audio": "/audio/tts/nice.mp3"}
  ],
  "phrases": [
    {"en": "a bit shy", "zh": "有点害羞", "audio": "/audio/tts/a-bit-shy.mp3"}
  ],
  "patterns": [
    {"question": "She's very nice.", "answer": "她非常友好。"}
  ]
}
```

## 示例输出

每个生成的quest包含以下结构：

```json
{
  "id": "vocabulary-matching",
  "title": "词语配对练习",
  "steps": [
    {
      "type": "wordmatching",
      "text": "将英语单词与中文意思配对",
      "pairs": [...],
      "options": [...]
    }
  ],
  "reward": {
    "badge": "/images/rewards/badge-vocab.png",
    "xp": 10
  }
}
```

## 安全特性

1. **自动备份**: 运行时会自动创建 `.json.backup` 备份文件
2. **预览模式**: 使用 `--dry-run` 可以预览将要进行的更改
3. **错误处理**: 脚本会跳过格式不正确或内容不足的文件
4. **详细日志**: 提供处理过程的详细信息

## 注意事项

1. 确保文件包含足够的words、phrases和patterns内容
2. 中文翻译练习现在支持短字符序列（最小2个字符）
3. 英文翻译练习要求至少2个单词
4. 脚本会自动处理不同文件格式的转换

## 故障排除

### 问题：翻译练习内容不足
**解决方案**: 检查文件中的phrases和patterns是否包含足够的翻译内容

### 问题：文件格式不识别
**解决方案**: 确保JSON文件包含至少words、phrases或patterns中的一个字段

### 问题：权限错误
**解决方案**: 确保对content目录和JSON文件有读写权限

## 更新日志

- v1.0: 初始版本，支持Grade 4文件
- v2.0: 通用版本，支持多年级和不同文件格式
- v2.1: 修复短字符翻译问题，支持Grade 3文件