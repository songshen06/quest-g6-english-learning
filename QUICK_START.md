# Quest G6 快速开始

## 🚀 开发

```bash
npm run dev    # 启动开发服务器
npm run build  # 构建项目
```

## 📚 内容管理

### 导入新模块
```bash
node scripts/enhanced-import-v2.cjs
```

### 音频管理
```bash
python check_missing_audio.py    # 检查缺失音频
python generate_missing_audio.py # 生成缺失音频
```

### 任务生成
```bash
python ensure_pattern_coverage.py     # 确保模式覆盖
python generate_quests_for_grade4.py  # 4年级任务
```

## 🔧 常用工具

- `scripts/enhanced-import-v2.cjs` - 主要导入工作流
- `ensure_pattern_coverage.py` - 模式覆盖检查
- `check_missing_audio.py` - 音频检查
- `WORKFLOW.md` - 详细工作流文档

## 📱 访问

开发环境: http://localhost:5173/quest-g6-english-learning/