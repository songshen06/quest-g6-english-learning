# 🎵 Quest G6 音频管理系统指南

## 📚 目录

1. [系统概述](#系统概述)
2. [快速开始](#快速开始)
3. [详细功能说明](#详细功能说明)
4. [高级配置](#高级配置)
5. [最佳实践](#最佳实践)
6. [故障排除](#故障排除)
7. [迁移指南](#迁移指南)

---

## 系统概述

### 🎯 解决的问题

之前的音频管理系统存在以下问题：
- **脚本分散**: 音频检查、生成、修复脚本散落在不同目录
- **功能重复**: 多个脚本做类似的事情，参数不统一
- **维护困难**: 修改功能需要同时更新多个文件
- **使用复杂**: 每个脚本有不同的命令格式和参数

### ✨ 新系统优势

```
旧系统: 15+ 个分散脚本 → 新系统: 1个统一管理器
```

- **统一接口**: 所有操作通过 `scripts/manage.py` 完成
- **功能整合**: 音频检查、生成、配置管理一体化
- **标准化**: 统一的参数格式和输出样式
- **智能化**: 自动选择最佳TTS引擎和参数
- **可维护**: 模块化设计，易于扩展和修改

---

## 快速开始

### 🚀 安装依赖

```bash
# 核心依赖（必需）
pip install openai-whisper torch

# TTS引擎（至少安装一个）
pip install TTS          # Coqui TTS (推荐)
pip install gtts         # Google TTS
# macOS say 是系统自带的，无需安装

# 可选依赖
pip install pydub        # 音频处理
```

### 📋 基本使用

#### 1. 音频质量检查
```bash
# 检查所有6年级音频
python scripts/manage.py check grade6-*.json

# 检查特定模块
python scripts/manage.py check "module-01-*.json"

# 静默模式检查
python scripts/manage.py check "*.json" --quiet
```

#### 2. 音频生成
```bash
# 生成所有音频
python scripts/manage.py generate grade6-*.json

# 只生成缺失的音频
python scripts/manage.py generate grade6-*.json --missing-only

# 指定TTS引擎
python scripts/manage.py generate "module-01-*.json" --engine coqui
```

#### 3. 配置管理
```bash
# 查看当前配置
python scripts/manage.py config show

# 保存配置
python scripts/manage.py config save --file my_config.json

# 加载配置
python scripts/manage.py config load --file my_config.json
```

### 🎯 常用命令组合

```bash
# 1. 检查音频质量并生成缺失文件
python scripts/manage.py check grade6-*.json
python scripts/manage.py generate grade6-*.json --missing-only

# 2. 使用高质量模型检查
python scripts/manage.py check "grade6-*.json" --model medium

# 3. 强制重新生成所有音频
python scripts/manage.py generate "*.json" --force
```

---

## 详细功能说明

### 🔍 音频质量检查

#### 工作原理
1. **文件扫描**: 根据模式查找JSON文件
2. **内容提取**: 从JSON中提取需要音频的文本
3. **音频转录**: 使用Whisper ASR转录现有音频
4. **相似度计算**: 对比原文和转录文本
5. **质量评估**: 根据相似度评分音频质量

#### 质量评级标准
- **高质量** (≥90%): 音频清晰，转录准确
- **中等质量** (70-89%): 音频基本清晰，有少量误差
- **低质量** (<70%): 音频不清晰或有严重问题

#### 支持的文件模式
```bash
grade6-*.json           # 所有6年级模块
grade6-upper-*.json     # 6年级上学期
grade6-lower-*.json     # 6年级下学期
module-*.json           # 所有module模块
"module-01-*.json"      # 特定编号模块
"module-0[1-5]-*.json"  # 模块1-5
"grade6-*-mod-0[1-6].json" # 6年级前6个单元
```

#### 检查报告
检查完成后会生成两种格式的报告：

1. **文本报告** (`audio_quality_report_<pattern>_<timestamp>.txt`)
   ```
   🎵 音频质量检查报告
   📊 总体统计:
      总项目数: 156
      高质量: 120 (76.9%)
      中等质量: 25 (16.0%)
      低质量: 11 (7.1%)
   ```

2. **JSON报告** (`audio_quality_data_<pattern>_<timestamp>.json`)
   ```json
   {
     "timestamp": "2025-01-16 14:30:00",
     "pattern": "grade6-*.json",
     "stats": {...},
     "results": [...]
   }
   ```

### 🎤 TTS音频生成

#### TTS引擎优先级
```
1. Coqui TTS (最高质量，支持多语言)
2. macOS say (系统原生，速度快)
3. gTTS (Google服务，需要网络)
```

#### 引擎特点对比

| 引擎 | 质量 | 速度 | 离线 | 多语言 | 系统要求 |
|------|------|------|------|--------|----------|
| Coqui TTS | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ | GPU推荐 |
| macOS say | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | macOS only |
| gTTS | ⭐⭐⭐ | ⭐⭐ | ❌ | ✅ | 网络连接 |

#### 生成选项
```bash
# 基本生成
python scripts/manage.py generate grade6-*.json

# 只生成缺失文件（推荐）
python scripts/manage.py generate grade6-*.json --missing-only

# 强制重新生成
python scripts/manage.py generate grade6-*.json --force

# 指定引擎
python scripts/manage.py generate grade6-*.json --engine coqui
python scripts/manage.py generate grade6-*.json --engine say --voice "Karen"
python scripts/manage.py generate grade6-*.json --engine gtts
```

#### 生成过程
1. **内容分析**: 扫描JSON文件，提取需要生成的文本
2. **文件检查**: 检查音频文件是否已存在
3. **引擎选择**: 按优先级选择可用的TTS引擎
4. **批量生成**: 逐个生成音频文件
5. **进度显示**: 实时显示生成进度

### ⚙️ 配置管理

#### 配置文件结构
```json
{
  "tts": {
    "preferred_engine": "coqui",
    "coqui_model": "tts_models/multilingual/multi-dataset/xtts_v2",
    "say_voice": "Samantha",
    "gtts_lang": "en",
    "output_dir": "public/audio/tts",
    "sample_rate": 22050
  },
  "asr": {
    "whisper_model": "base",
    "device": "auto",
    "similarity_threshold_high": 0.9,
    "similarity_threshold_medium": 0.7
  }
}
```

#### 配置选项说明

**TTS配置**
- `preferred_engine`: 首选TTS引擎
- `coqui_model`: Coqui TTS模型路径
- `say_voice`: macOS语音名称
- `gtts_lang`: gTTS语言代码
- `sample_rate`: 音频采样率

**ASR配置**
- `whisper_model`: Whisper模型大小
- `device`: 计算设备 (auto/cpu/cuda)
- `similarity_threshold_high`: 高质量阈值
- `similarity_threshold_medium`: 中等质量阈值

---

## 高级配置

### 🎛️ Whisper模型选择

```bash
# 最快模型 (适合快速检查)
python scripts/manage.py check "*.json" --model tiny

# 平衡模型 (默认推荐)
python scripts/manage.py check "*.json" --model base

# 高质量模型 (适合详细检查)
python scripts/manage.py check "*.json" --model small
python scripts/manage.py check "*.json" --model medium

# 最佳质量模型 (适合重要内容)
python scripts/manage.py check "*.json" --model large
```

### 🖥️ 设备配置

```bash
# 自动选择设备
python scripts/manage.py check "*.json" --device auto

# 强制使用CPU
python scripts/manage.py check "*.json" --device cpu

# 强制使用GPU (如果可用)
python scripts/manage.py check "*.json" --device cuda
```

### 🎤 TTS引擎详细配置

#### Coqui TTS
```bash
# 使用不同模型
python scripts/manage.py generate "*.json" --engine coqui
# 修改模型需要在配置文件中设置:
# "coqui_model": "tts_models/en/ljspeech/tacotron2-DDC"
```

#### macOS say
```bash
# 列出可用语音
say -v "?"

# 使用不同语音
python scripts/manage.py generate "*.json" --engine say --voice "Karen"
python scripts/manage.py generate "*.json" --engine say --voice "Alex"
```

#### gTTS
```bash
# 使用不同语言
python scripts/manage.py generate "*.json" --engine gtts
# 修改语言需要在配置文件中设置:
# "gtts_lang": "en", "fr", "es", "de"等
```

### 📊 自定义阈值

创建自定义配置文件：
```json
{
  "asr": {
    "similarity_threshold_high": 0.95,
    "similarity_threshold_medium": 0.8
  }
}
```

使用自定义配置：
```bash
python scripts/manage.py check "*.json" --config strict_config.json
```

---

## 最佳实践

### 🎯 日常工作流程

#### 1. 初始设置
```bash
# 1. 查看当前配置
python scripts/manage.py config show

# 2. 保存基础配置
python scripts/manage.py config save --file production_config.json

# 3. 检查现有音频质量
python scripts/manage.py check grade6-*.json
```

#### 2. 内容更新后
```bash
# 1. 生成缺失的音频
python scripts/manage.py generate "*.json" --missing-only

# 2. 检查新音频质量
python scripts/manage.py check "*.json" --quiet

# 3. 如果有问题，重新生成低质量音频
# (需要根据报告手动处理)
```

#### 3. 质量检查流程
```bash
# 1. 快速检查 (使用tiny模型)
python scripts/manage.py check "*.json" --model tiny

# 2. 如果发现问题，详细检查
python scripts/manage.py check "*.json" --model base

# 3. 对重要内容使用高质量检查
python scripts/manage.py check "grade6-upper-*.json" --model medium
```

### 📁 文件组织建议

#### 配置文件
```
configs/
├── development.json      # 开发环境配置
├── production.json       # 生产环境配置
├── strict_check.json     # 严格检查配置
└── fast_check.json       # 快速检查配置
```

#### 使用不同配置
```bash
# 开发时使用快速检查
python scripts/manage.py check "*.json" --config configs/fast_check.json

# 生产时使用严格检查
python scripts/manage.py check "*.json" --config configs/strict_check.json
```

### 🔄 批量操作

#### 检查多个年级
```bash
# 检查所有年级
for grade in grade3 grade4 grade5 grade6; do
    echo "检查 $grade..."
    python scripts/manage.py check "$grade-*.json" --quiet
done
```

#### 按模块分批处理
```bash
# 分批检查模块 (避免内存问题)
for i in {01..10}; do
    echo "检查模块 $i..."
    python scripts/manage.py check "module-$i-*.json" --quiet
done
```

---

## 故障排除

### ❌ 常见错误及解决方案

#### 1. Whisper模型加载失败
```
错误: ❌ 请安装必要的依赖: pip install openai-whisper torch
```

**解决方案**:
```bash
# 安装依赖
pip install openai-whisper torch

# 如果有GPU，安装CUDA版本
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### 2. TTS引擎初始化失败
```
错误: ⚠️ Coqui TTS初始化失败
```

**解决方案**:
```bash
# 方法1: 安装Coqui TTS
pip install TTS

# 方法2: 使用其他引擎
python scripts/manage.py generate "*.json" --engine say
python scripts/manage.py generate "*.json" --engine gtts
```

#### 3. 权限问题
```
错误: Permission denied
```

**解决方案**:
```bash
# 给脚本添加执行权限
chmod +x scripts/manage.py

# 检查音频目录权限
ls -la public/audio/tts/
chmod 755 public/audio/tts/
```

#### 4. 内存不足
```
错误: CUDA out of memory
```

**解决方案**:
```bash
# 使用CPU
python scripts/manage.py check "*.json" --device cpu

# 使用更小的模型
python scripts/manage.py check "*.json" --model tiny
```

#### 5. 网络连接问题 (gTTS)
```
错误: gTTS API连接失败
```

**解决方案**:
```bash
# 使用本地TTS引擎
python scripts/manage.py generate "*.json" --engine say
python scripts/manage.py generate "*.json" --engine coqui
```

### 🔧 调试技巧

#### 1. 使用详细输出
```bash
# 显示详细过程 (不要用--quiet)
python scripts/manage.py check "*.json"
```

#### 2. 检查配置
```bash
# 确认配置正确
python scripts/manage.py config show
```

#### 3. 分步骤测试
```bash
# 先测试小范围
python scripts/manage.py check "grade6-upper-mod-01.json"

# 再扩展到更大范围
python scripts/manage.py check "grade6-upper-*.json"
```

#### 4. 检查日志
```bash
# 查看生成的报告文件
ls -la reports/
cat reports/audio_quality_report_*.txt
```

### 📊 性能优化

#### 1. 提升检查速度
```bash
# 使用更快的Whisper模型
python scripts/manage.py check "*.json" --model tiny

# 并行处理 (需要修改代码支持)
```

#### 2. 提升生成速度
```bash
# 使用系统原生TTS
python scripts/manage.py generate "*.json" --engine say

# 批量处理而非单个文件
```

#### 3. 内存优化
```bash
# 使用CPU而非GPU
python scripts/manage.py check "*.json" --device cpu

# 分批处理大量文件
```

---

## 迁移指南

### 🔄 从旧系统迁移

#### 映射表

| 旧脚本命令 | 新系统命令 | 说明 |
|-----------|-----------|------|
| `python scripts/check_grade6_audio_quality.py` | `python scripts/manage.py check grade6-*.json` | 6年级音频检查 |
| `python scripts/check_modules_01_10_audio_quality.py` | `python scripts/manage.py check "module-*.json"` | 模块音频检查 |
| `python audio_integrity_checker.py` | 集成到check命令 | 音频完整性检查 |
| `python generate_audio.py` | `python scripts/manage.py generate "*.json"` | 音频生成 |
| `python scripts/enhanced_audio_generation.py` | `python scripts/manage.py generate "*.json" --engine coqui` | 高质量音频生成 |
| `python generate_missing_audio.py` | `python scripts/manage.py generate "*.json" --missing-only` | 生成缺失音频 |
| `python scripts/force_regenerate_low_quality_audio.py` | 需要根据报告手动处理 | 强制重新生成 |

#### 迁移步骤

1. **备份现有脚本**
   ```bash
   mkdir backup_scripts
   cp *.py backup_scripts/
   cp scripts/*.py backup_scripts/
   ```

2. **测试新系统**
   ```bash
   # 先在小范围测试
   python scripts/manage.py check "grade6-upper-mod-01.json"
   ```

3. **验证结果**
   ```bash
   # 比较新旧系统的输出
   diff old_report.txt new_report.txt
   ```

4. **逐步迁移**
   ```bash
   # 逐个替换脚本使用
   python scripts/manage.py check grade6-*.json
   python scripts/manage.py generate grade6-*.json --missing-only
   ```

5. **清理旧脚本**
   ```bash
   # 确认新系统工作正常后，可以删除旧脚本
   # mv backup_scripts/ ../archive/
   ```

### 📝 自定义脚本迁移

如果你有自定义的旧脚本，可以将其功能集成到新系统中：

1. **分析功能**: 确定脚本的核心功能
2. **找到对应模块**: 检查是否在新系统中已有对应功能
3. **配置参数**: 通过配置文件实现自定义
4. **扩展功能**: 在现有模块基础上添加新功能

---

## 📚 附录

### 🎯 文件模式参考

#### 通配符说明
- `*`: 匹配任意字符序列
- `?`: 匹配单个字符
- `[...]`: 匹配字符集中的任意字符
- `{...}`: 匹配用逗号分隔的模式列表

#### 实用模式示例
```bash
# 所有6年级文件
grade6-*.json

# 6年级上学期前3个模块
grade6-upper-mod-0[1-3].json

# 模块1、3、5
module-0[135]-*.json

# 所有单元文件
*mod-*.json
```

### 🎤 可用的macOS语音

查看可用语音：
```bash
say -v "?"
```

常用英语语音：
- `Samantha` (美式女声，默认)
- `Alex` (美式男声)
- `Karen` (澳式女声)
- `Daniel` (英式男声)
- `Moira` (爱尔兰女声)
- `Ting-Ting` (中文女声)
- `Sin-ji` (粤语女声)

### 🔧 环境变量

可以设置环境变量来覆盖配置：

```bash
# 设置Whisper模型
export WHISPER_MODEL=small
python scripts/manage.py check "*.json"

# 设置TTS引擎
export TTS_ENGINE=say
python scripts/manage.py generate "*.json"

# 设置音频目录
export AUDIO_DIR=/path/to/audio
python scripts/manage.py check "*.json"
```

### 📖 参考资源

- [Whisper官方文档](https://github.com/openai/whisper)
- [Coqui TTS文档](https://coqui.ai/)
- [gTTS文档](https://gtts.readthedocs.io/)
- [macOS say手册](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/SpeechSynthesisProgrammingGuide/Introduction/Introduction.html)

---

## 🎉 总结

新的音频管理系统提供了：

✅ **统一的接口** - 一个命令处理所有音频操作
✅ **智能的引擎选择** - 自动选择最佳TTS引擎
✅ **详细的质量报告** - 全面的音频质量分析
✅ **灵活的配置** - 适应不同使用场景
✅ **简单的维护** - 模块化设计，易于扩展

现在你可以用更简单、更强大的方式管理项目的音频内容了！