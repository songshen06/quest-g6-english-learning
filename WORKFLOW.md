# Quest G6 开发工作流

> 📅 最后更新：2025-10-14

## 🚀 核心脚本

### Scripts目录（3个核心脚本）
```
scripts/
├── build-validation.cjs        # 构建验证（npm run build依赖）
├── enhanced-import-v2.cjs      # 主要导入工作流 ⭐
└── enhanced_audio_generation.py # 音频生成工具
```

### Python工具（9个核心脚本）
```
根目录/
├── generate_audio.py              # 基础音频生成
├── generate_elementary_audio.py   # 小学音频生成
├── generate_missing_audio.py      # 缺失音频生成
├── generate_quests_for_grade4.py  # 4年级任务生成
├── generate_quests_for_grade6_lower.py # 6年级下任务生成
├── ensure_pattern_coverage.py     # 模式覆盖检查 ⭐
├── check_missing_audio.py         # 检查缺失音频
├── audio_integrity_checker.py     # 音频完整性检查
├── json_validator_generator.py    # JSON验证器
└── generate_llm_prompts.py        # LLM提示生成
```

## 📋 常用工作流

### 1. 新模块导入工作流
```bash
# 1. 使用主要导入工作流
node scripts/enhanced-import-v2.cjs

# 2. 检查缺失音频
python check_missing_audio.py

# 3. 生成缺失音频
python generate_missing_audio.py

# 4. 验证模式覆盖
python ensure_pattern_coverage.py

# 5. 构建验证
npm run build
```

### 2. 任务生成工作流
```bash
# 4年级任务生成
python generate_quests_for_grade4.py

# 6年级下任务生成
python generate_quests_for_grade6_lower.py

# 确保模式覆盖
python ensure_pattern_coverage.py
```

### 3. 音频管理工作流
```bash
# 检查音频完整性
python audio_integrity_checker.py

# 检查缺失音频
python check_missing_audio.py

# 生成缺失音频
python generate_missing_audio.py
```

## 🎯 核心功能说明

### enhanced-import-v2.cjs
- **功能**: 主要的模块导入工作流
- **用途**: 导入新的学习模块数据
- **特点**: 包含验证、音频检查、错误处理

### ensure_pattern_coverage.py
- **功能**: 确保所有模式在任务中完全覆盖
- **用途**: 检查和修复模式覆盖问题
- **特点**: 自动修复，生成报告

### generate_missing_audio.py
- **功能**: 生成缺失的音频文件
- **用途**: 补充缺失的TTS音频
- **特点**: 支持多种TTS引擎

## ⚡ 快速命令

### 开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建项目
npm run preview      # 预览构建结果
```

### 音频
```bash
python check_missing_audio.py         # 检查缺失音频
python generate_missing_audio.py      # 生成缺失音频
python audio_integrity_checker.py     # 音频完整性检查
```

### 任务
```bash
python ensure_pattern_coverage.py     # 模式覆盖检查
python generate_quests_for_grade4.py  # 4年级任务生成
```

### 导入
```bash
node scripts/enhanced-import-v2.cjs   # 主要导入工作流
```

## 🗂️ 文件清理

### 已删除的重复脚本
- ✅ enhanced-import.cjs (被v2替代)
- ✅ complete-import-workflow.cjs
- ✅ comprehensive-fix.cjs
- ✅ enhanced-validation.cjs
- ✅ validate-imports.cjs
- ✅ validate-naming-conventions.cjs
- ✅ update-books-config.cjs
- ✅ import-book-with-validation.cjs
- ✅ 各种临时测试脚本

### 保留原则
- 保留最新、最完整的版本
- 删除功能重复的脚本
- 删除临时测试脚本
- 保留生产环境必需的脚本

## 📝 注意事项

1. **主要导入**: 始终使用 `enhanced-import-v2.cjs`
2. **模式覆盖**: 确保所有模式都被任务覆盖
3. **音频完整**: 使用音频检查工具确保完整性
4. **构建验证**: 每次重要更改后运行构建验证

## 🔧 维护

- 定期运行 `ensure_pattern_coverage.py` 检查模式覆盖
- 使用 `audio_integrity_checker.py` 检查音频健康度
- 及时清理不再需要的临时脚本
- 保持核心脚本的更新和文档同步