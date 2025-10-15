# 音频质量检查脚本使用指南

本指南介绍如何使用基于 Whisper ASR 的音频质量检查脚本来检测和修复音频问题。

## 脚本概述

我们有两个音频质量检查脚本：

### 1. `check_audio_quality_with_whisper.py` - 完整检查脚本
**功能**: 全面检查指定模块的所有音频文件，生成详细报告

**特点**:
- 检查 words、phrases、patterns、quests 所有音频
- 支持自定义模块选择
- 生成详细的文本格式报告
- 识别文件缺失、转录失败等问题
- **支持所有年级模块**，包括 Grade 6 上学期和下学期

### 2. `quick_audio_check.py` - 快速检查脚本
**功能**: 快速检查特定模块的关键音频文件

**特点**:
- 轻量级，检查速度快
- 专注于问题模块的关键文件
- 简洁的控制台输出
- 适合日常快速检查
- **支持重点模块的快速检查**

## 使用方法

### 完整检查脚本

```bash
# 检查所有模块
python3 scripts/check_audio_quality_with_whisper.py --all

# 检查指定模块 (Grade 6 上学期)
python3 scripts/check_audio_quality_with_whisper.py --modules stamps-hobbies festivals habits-tidy

# 检查指定模块 (Grade 6 下学期)
python3 scripts/check_audio_quality_with_whisper.py --modules ordering-food past-events plans-and-weather

# 检查单个模块
python3 scripts/check_audio_quality_with_whisper.py --modules stamps-hobbies
```

### 快速检查脚本

```bash
# 检查 Grade 6 上学期模块的关键文件
python3 scripts/quick_audio_check.py stamps
python3 scripts/quick_audio_check.py festivals
python3 scripts/quick_audio_check.py habits

# 检查 Grade 6 下学期模块的关键文件
python3 scripts/quick_audio_check.py ordering-food
python3 scripts/quick_audio_check.py past-events
```

## 报告解读

### 质量评级标准

- **高质量 (≥90%)**: ✅ 音频与文本高度匹配，质量优秀
- **中等质量 (70-89%)**: 🟡 音频基本正确，但有轻微差异
- **低质量 (<70%)**: 🔴 音频问题明显，需要重新生成
- **文件缺失**: ❌ 音频文件不存在
- **转录失败**: 💥 Whisper 无法处理音频文件

### 常见问题类型

1. **识别准确率极低** (<50%)
   - 音频文件可能损坏
   - 音频内容与文本不匹配
   - 音频质量太差

2. **音频可能被截断**
   - 识别结果明显短于原文
   - 音频可能录制不完整

3. **音频可能包含额外内容**
   - 识别结果明显长于原文
   - 可能包含噪音或额外录音

## 支持的模块

### Grade 6 上学期模块 (grade6-upper-mod)
- `stamps-hobbies` - 邮票和爱好
- `festivals` - 节日
- `habits-tidy` - 习惯和整洁房间

### Grade 6 下学期模块 (grade6-lower-mod)
- `01-ordering-food` - 点餐
- `02-plans-and-weather` - 计划和天气
- `03-past-events` - 过去的事件
- `04-describing-actions` - 描述动作
- `05-simultaneous-actions` - 同时发生的动作
- `06-gifts-and-past-actions` - 礼物和过去的动作
- `07-famous-people` - 著名人物
- `08-asking-why` - 询问为什么
- `09-best-wishes` - 最好的祝愿
- `10-future-school-life` - 未来的学校生活

### 其他模块
- 支持所有 `module-*.json` 格式的文件
- 支持所有 `grade*-lower-mod-*.json` 和 `grade*-upper-mod-*.json` 格式的文件

## 典型检查结果分析

### 示例：Stamps 模块检查结果

```
🟡 the-five-finger-mountain.mp3
   原文: The Five Finger Mountain
   识别: The 5 finger mountain.
   相似度: 88.9%
```

**分析**: 音频质量良好，但识别结果将数字写成了阿拉伯数字，这是正常现象。

```
🔴 at-all.mp3
   原文: At All
   识别: at home.
   相似度: 46.2%
```

**分析**: 音频质量问题明显，"at all" 被识别成 "at home"，需要重新生成。

### 示例：Habits 模块检查结果

```
✅ do-you-often-read-stories.mp3
   原文: Do You Often Read Stories
   识别: Do you often read stories?
   相似度: 100.0%
```

**分析**: 完美匹配，音频质量优秀。

```
🔴 tidy.mp3
   原文: Tidy
   识别: Tie the
   相似度: 36.4%
```

**分析**: 严重问题，"tidy" 被识别成 "tie the"，需要立即重新生成。

## 问题修复流程

### 1. 识别问题文件
根据检查报告，找出所有低质量和缺失的音频文件。

### 2. 重新生成音频
使用 `generate_missing_audio.py` 重新生成问题音频：

```bash
# 为单个文件重新生成音频
python3 -c "
import sys
sys.path.append('.')
from generate_missing_audio import CoquiAudioGenerator

generator = CoquiAudioGenerator()
generator.generate_coqui_tts('filename.mp3', 'Original Text')
"
```

### 3. 验证修复效果
重新运行检查脚本确认问题已解决。

### 4. 批量修复
对于大量问题文件，可以：

1. 创建问题文件列表
2. 使用脚本批量重新生成
3. 再次运行质量检查

## 依赖安装

确保已安装必要的依赖：

```bash
pip install openai-whisper torch
```

## 最佳实践

### 1. 定期检查
- 每次大量音频更新后运行完整检查
- 日常开发使用快速检查脚本
- 保持音频质量在90%以上

### 2. 检查时机
- 🔄 音频生成完成后
- 🔄 JSON配置文件修改后
- 🔄 上线前质量保证
- 🔄 用户反馈音频问题时

### 3. 质量标准
- 高质量音频应占80%以上
- 低质量音频应控制在5%以内
- 缺失文件应立即修复

## 故障排除

### 常见错误

1. **ImportError: No module named 'whisper'**
   ```bash
   pip install openai-whisper torch
   ```

2. **CUDA out of memory**
   - 使用更小的模型：`whisper.load_model("tiny")`
   - 关闭GPU：设置 `fp16=False`

3. **音频文件无法转录**
   - 检查文件是否存在
   - 检查文件格式是否正确
   - 检查文件是否损坏

### 性能优化

- 使用更小的 Whisper 模型（tiny/base）提高速度
- 批量检查时添加适当延迟避免过载
- 使用 SSD 存储音频文件提高读取速度

## 报告文件位置

- 完整检查报告：`audio_quality_report.txt`
- 控制台输出：实时显示检查结果

## 技术细节

### Whisper 模型选择
- `tiny`: 最快，准确度较低
- `base`: 平衡速度和准确度（推荐）
- `small`: 较慢，准确度较高
- `medium`: 慢，准确度高
- `large`: 最慢，准确度最高

### 相似度计算
使用 `difflib.SequenceMatcher` 计算标准化文本的相似度，去除标点符号和大小写影响。

---

通过这些脚本，你可以有效监控和保持音频系统的质量，确保学生获得最佳的学习体验。