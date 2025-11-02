# 🎵 Quest G6 音频管理系统

统一的音频生成、检查和管理工具，替代项目中分散的旧脚本。

## 📁 新的目录结构

```
scripts/
├── audio/
│   ├── check_quality.py      # 统一的音频质量检查 (Whisper ASR)
│   └── generate.py           # 统一的TTS生成 (Coqui > say > gTTS)
├── utils/
│   ├── config.py             # 全局配置管理
│   └── common.py             # 通用工具函数
└── manage.py                 # 主脚本管理器
```

## 🚀 快速开始

### 1. 音频质量检查
```bash
# 检查所有6年级音频质量
python scripts/manage.py check grade6-*.json

# 检查特定模块
python scripts/manage.py check "module-01-*.json" --model small

# 静默模式检查
python scripts/manage.py check "*.json" --quiet
```

### 2. 音频生成
```bash
# 生成所有6年级音频
python scripts/manage.py generate grade6-*.json

# 只生成缺失的音频
python scripts/manage.py generate grade6-*.json --missing-only

# 指定TTS引擎
python scripts/manage.py generate "module-01-*.json" --engine coqui

# 强制重新生成
python scripts/manage.py generate "*.json" --force
```

### 3. 配置管理
```bash
# 查看当前配置
python scripts/manage.py config show

# 保存配置
python scripts/manage.py config save --file my_config.json

# 加载配置
python scripts/manage.py config load --file my_config.json
```

## 🎯 功能特性

### 🔍 音频质量检查
- **Whisper ASR**: 自动转录音频并对比原文
- **相似度评估**: 高质量(≥90%)、中等(70-89%)、低质量(<70%)
- **完整性检查**: 验证音频文件与JSON文件的对应关系
- **详细报告**: 生成文本和JSON格式的检查报告

### 🎤 TTS音频生成
- **多引擎支持**: Coqui TTS > macOS say > gTTS (按优先级自动选择)
- **智能跳过**: 避免重复生成已存在的音频文件
- **批量处理**: 支持基于文件模式的批量生成
- **进度显示**: 实时显示生成进度

### ⚙️ 配置管理
- **TTS配置**: 引擎选择、语音设置、输出质量
- **ASR配置**: Whisper模型、相似度阈值
- **路径配置**: 灵活的目录结构配置

## 📋 替代的旧脚本

| 旧脚本 | 新命令 | 说明 |
|--------|--------|------|
| `scripts/check_grade6_audio_quality.py` | `python scripts/manage.py check grade6-*.json` | 统一的音频质量检查 |
| `scripts/check_modules_01_10_audio_quality.py` | `python scripts/manage.py check "module-*.json"` | 支持任意模块范围 |
| `scripts/check_audio_quality_with_whisper.py` | `python scripts/manage.py check "*.json"` | 通用检查模式 |
| `audio_integrity_checker.py` | 集成到check_quality.py | 完整性检查功能 |
| `generate_audio.py` | `python scripts/manage.py generate "*.json"` | 统一的音频生成 |
| `scripts/enhanced_audio_generation.py` | 内置增强功能 | 自动选择最佳引擎 |
| `generate_missing_audio.py` | `python scripts/manage.py generate "*.json" --missing-only` | 专门生成缺失文件 |

## 🔧 高级用法

### 自定义Whisper模型
```bash
# 使用更高质量的模型
python scripts/manage.py check grade6-*.json --model medium

# 使用更快的模型
python scripts/manage.py check grade6-*.json --model tiny
```

### 指定TTS引擎
```bash
# 强制使用Coqui TTS
python scripts/manage.py generate grade6-*.json --engine coqui

# 强制使用macOS say
python scripts/manage.py generate grade6-*.json --engine say --voice "Karen"

# 强制使用gTTS
python scripts/manage.py generate grade6-*.json --engine gtts
```

### 配置文件使用
```bash
# 使用自定义配置
python scripts/manage.py check grade6-*.json --config production.json

# 创建配置模板
python scripts/manage.py config show > production.json
```

## 📊 报告格式

检查完成后会生成两种格式的报告：

1. **文本报告** (`audio_quality_report_<pattern>_<timestamp>.txt`)
   - 人类可读的详细报告
   - 包含统计信息、问题列表、建议

2. **JSON报告** (`audio_quality_data_<pattern>_<timestamp>.json`)
   - 机器可读的结构化数据
   - 便于进一步分析和处理

## ⚠️ 注意事项

1. **依赖安装**:
   ```bash
   pip install openai-whisper torch
   pip install TTS  # 可选，Coqui TTS
   pip install gtts  # 可选，gTTS
   pip install pydub  # 可选，音频处理
   ```

2. **系统要求**:
   - macOS: say命令内置支持
   - Linux/Windows: 需要安装gTTS或Coqui TTS
   - Whisper: 支持CUDA的GPU会显著提升速度

3. **文件模式**:
   - 使用引号包围包含通配符的模式
   - 支持标准的shell通配符 (`*`, `?`)

## 🎉 优势

1. **统一接口**: 一个命令管理所有音频操作
2. **减少冗余**: 合并重复功能的脚本
3. **标准化**: 统一的参数格式和输出样式
4. **可扩展**: 模块化设计便于添加新功能
5. **自动化**: 智能选择最佳引擎和参数
6. **详细报告**: 提供完整的操作记录和建议

## 🐛 故障排除

### 常见问题

1. **Whisper模型加载失败**
   ```
   解决方案: pip install openai-whisper torch
   ```

2. **TTS引擎初始化失败**
   ```
   解决方案: 检查系统是否安装了相应的TTS库
   ```

3. **权限问题**
   ```
   解决方案: chmod +x scripts/manage.py
   ```

4. **Python路径问题**
   ```
   解决方案: 确保在项目根目录运行命令
   ```

### 获取帮助
```bash
# 显示详细帮助
python scripts/manage.py help

# 查看配置
python scripts/manage.py config show
```

---

**迁移提示**: 新系统完全兼容旧脚本的功能，建议逐步迁移到新的统一接口。