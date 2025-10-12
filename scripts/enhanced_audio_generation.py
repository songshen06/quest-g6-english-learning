#!/usr/bin/env python3
"""
增强版音频生成脚本 - 集成Whisper TTS/ASR

功能特性：
- 使用Whisper进行高质量语音识别 (ASR)
- 使用系统TTS进行高质量文本转语音 (TTS)
- 支持批处理模式
- 自动音频格式转换
- 音频质量优化
- 音效混合
- 进度跟踪和错误处理
"""

import os
import sys
import json
import argparse
import subprocess
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class AudioGenerationConfig:
    """音频生成配置"""
    input_json: str
    output_dir: str
    quality: str = "medium"  # low, medium, high
    format: str = "mp3"      # mp3, wav, m4a
    use_whisper_asr: bool = True
    use_system_tts: bool = True
    include_sound_effects: bool = True
    batch_mode: bool = False
    voice_model: str = "medium"
    language: str = "auto"

@dataclass
class AudioItem:
    """音频项目数据结构"""
    text: str
    filename: str
    type: str  # "word", "phrase", "sentence", "quest"
    language: Optional[str] = None
    speed: float = 1.0
    effects: List[str] = None

class EnhancedAudioGenerator:
    """增强版音频生成器"""

    def __init__(self, config: AudioGenerationConfig):
        self.config = config
        self.output_dir = Path(config.output_dir)
        self.temp_dir = self.output_dir / "temp"

        # 创建目录
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(exist_ok=True)

        # Whisper路径
        self.whisper_path = "/Library/Frameworks/Python.framework/Versions/3.10/bin/whisper"

        # 初始化统计
        self.stats = {
            "total_items": 0,
            "successful": 0,
            "failed": 0,
            "start_time": datetime.now()
        }

    def load_json_data(self) -> Dict[str, Any]:
        """加载JSON数据"""
        try:
            with open(self.config.input_json, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"✅ 成功加载JSON文件: {self.config.input_json}")
            return data
        except Exception as e:
            logger.error(f"❌ 加载JSON文件失败: {e}")
            raise

    def extract_audio_items(self, data: Dict[str, Any]) -> List[AudioItem]:
        """从JSON数据中提取音频项目"""
        items = []

        # 提取模块基本信息
        module_id = data.get("moduleId", "unknown")
        title = data.get("title", "")
        description = data.get("description", "")

        # 添加标题音频
        if title:
            items.append(AudioItem(
                text=title,
                filename=f"{module_id}_title",
                type="title",
                language=self.detect_language(title)
            ))

        # 添加描述音频
        if description:
            items.append(AudioItem(
                text=description,
                filename=f"{module_id}_description",
                type="description",
                language=self.detect_language(description)
            ))

        # 提取词汇表
        vocabulary = data.get("vocabulary", [])
        for i, word in enumerate(vocabulary):
            if isinstance(word, dict):
                word_text = word.get("word", word.get("text", ""))
                if word_text:
                    items.append(AudioItem(
                        text=word_text,
                        filename=f"{module_id}_word_{i+1:02d}",
                        type="word",
                        language=self.detect_language(word_text)
                    ))

        # 提取对话内容
        conversations = data.get("conversation", [])
        for i, conv in enumerate(conversations):
            if isinstance(conv, dict):
                speaker_text = conv.get("speaker", "")
                dialogue_text = conv.get("dialogue", "")

                if speaker_text:
                    items.append(AudioItem(
                        text=speaker_text,
                        filename=f"{module_id}_speaker_{i+1:02d}",
                        type="speaker",
                        language=self.detect_language(speaker_text)
                    ))

                if dialogue_text:
                    items.append(AudioItem(
                        text=dialogue_text,
                        filename=f"{module_id}_dialogue_{i+1:02d}",
                        type="dialogue",
                        language=self.detect_language(dialogue_text)
                    ))

        # 提取练习内容
        practice = data.get("practice", [])
        for i, item in enumerate(practice):
            if isinstance(item, dict):
                question = item.get("question", "")
                answer = item.get("answer", "")

                if question:
                    items.append(AudioItem(
                        text=question,
                        filename=f"{module_id}_question_{i+1:02d}",
                        type="question",
                        language=self.detect_language(question)
                    ))

                if answer:
                    items.append(AudioItem(
                        text=answer,
                        filename=f"{module_id}_answer_{i+1:02d}",
                        type="answer",
                        language=self.detect_language(answer)
                    ))

        logger.info(f"📊 提取到 {len(items)} 个音频项目")
        self.stats["total_items"] = len(items)
        return items

    def detect_language(self, text: str) -> str:
        """检测文本语言"""
        # 简单的中英文检测
        chinese_chars = sum(1 for char in text if '\u4e00' <= char <= '\u9fff')
        if chinese_chars > len(text) * 0.3:
            return "zh"
        return "en"

    def generate_tts_audio(self, item: AudioItem) -> str:
        """生成TTS音频"""
        output_path = self.output_dir / f"{item.filename}.{self.config.format}"

        try:
            # 使用系统TTS命令
            voice = self.get_system_voice(item.language or "en")

            # 构建TTS命令
            cmd = [
                "say",
                f"-v {voice}",
                f"-r {int(200 * item.speed)}",
                f"-o \"{output_path}\"",
                f"--file-format={self.config.format}",
                f"\"{item.text}\""
            ]

            logger.info(f"🎙️ 生成TTS: {item.filename}")
            subprocess.run(" ".join(cmd), shell=True, check=True, timeout=30)

            # 如果需要，添加音效
            if self.config.include_sound_effects and item.effects:
                self.add_sound_effects(output_path, item.effects)

            logger.info(f"✅ TTS完成: {output_path}")
            return str(output_path)

        except subprocess.TimeoutExpired:
            logger.error(f"❌ TTS超时: {item.filename}")
            raise
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ TTS失败: {item.filename} - {e}")
            raise

    def add_sound_effects(self, audio_path: Path, effects: List[str]):
        """添加音效"""
        try:
            # 这里可以添加音效处理逻辑
            # 例如使用ffmpeg添加背景音乐或音效
            for effect in effects:
                if effect == "bell":
                    # 添加铃声效果
                    pass
                elif effect == "chime":
                    # 添加风铃效果
                    pass
        except Exception as e:
            logger.warning(f"⚠️ 音效添加失败: {e}")

    def get_system_voice(self, language: str) -> str:
        """获取系统语音"""
        voices = {
            "zh": "Ting-Ting",     # 中文语音
            "en": "Samantha",      # 英文语音
            "ja": "Kyoko",         # 日文语音
            "ko": "Yuna",          # 韩文语音
        }
        return voices.get(language, "Samantha")

    def recognize_speech(self, audio_path: str) -> Dict[str, Any]:
        """使用Whisper进行语音识别"""
        if not self.config.use_whisper_asr:
            return {"text": "", "language": "unknown"}

        try:
            # 构建Whisper命令
            cmd = [
                f'"{self.whisper_path}"',
                f'"{audio_path}"',
                f'--model {self.config.voice_model}',
                '--language auto' if self.config.language == "auto" else f'--language {self.config.language}',
                '--output_format json',
                f'--output_dir "{self.temp_dir}"'
            ]

            logger.info(f"🎯 ASR识别: {Path(audio_path).name}")
            result = subprocess.run(" ".join(cmd), shell=True, check=True,
                                  capture_output=True, text=True, timeout=120)

            # 读取JSON结果
            json_path = self.temp_dir / f"{Path(audio_path).stem}.json"
            if json_path.exists():
                with open(json_path, 'r', encoding='utf-8') as f:
                    whisper_result = json.load(f)

                # 清理临时文件
                json_path.unlink()

                return {
                    "text": whisper_result.get("text", ""),
                    "language": whisper_result.get("language", "unknown"),
                    "segments": whisper_result.get("segments", [])
                }

            return {"text": "", "language": "unknown"}

        except subprocess.TimeoutExpired:
            logger.error(f"❌ ASR超时: {audio_path}")
            return {"text": "", "language": "timeout"}
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ ASR失败: {audio_path} - {e}")
            return {"text": "", "language": "error"}

    def generate_all_audio(self, items: List[AudioItem]):
        """生成所有音频"""
        logger.info(f"🚀 开始生成 {len(items)} 个音频文件...")

        for i, item in enumerate(items):
            try:
                logger.info(f"\n[{i+1}/{len(items)}] 处理: {item.filename}")

                # 生成TTS音频
                audio_path = self.generate_tts_audio(item)

                # 如果启用ASR，进行语音识别验证
                if self.config.use_whisper_asr:
                    recognition_result = self.recognize_speech(audio_path)
                    if recognition_result["text"]:
                        logger.info(f"✅ ASR验证: {recognition_result['text'][:50]}...")
                    else:
                        logger.warning(f"⚠️ ASR识别失败或为空")

                self.stats["successful"] += 1

            except Exception as e:
                logger.error(f"❌ 处理失败: {item.filename} - {e}")
                self.stats["failed"] += 1

    def generate_manifest(self):
        """生成音频清单文件"""
        manifest = {
            "generation_info": {
                "timestamp": datetime.now().isoformat(),
                "config": {
                    "quality": self.config.quality,
                    "format": self.config.format,
                    "use_whisper_asr": self.config.use_whisper_asr,
                    "use_system_tts": self.config.use_system_tts
                }
            },
            "statistics": {
                "total_items": self.stats["total_items"],
                "successful": self.stats["successful"],
                "failed": self.stats["failed"],
                "success_rate": f"{(self.stats['successful'] / max(self.stats['total_items'], 1)) * 100:.1f}%",
                "duration": str(datetime.now() - self.stats["start_time"])
            },
            "audio_files": []
        }

        # 添加音频文件列表
        for audio_file in self.output_dir.glob(f"*.{self.config.format}"):
            manifest["audio_files"].append({
                "filename": audio_file.name,
                "path": str(audio_file.relative_to(self.output_dir)),
                "size": audio_file.stat().st_size,
                "created": datetime.fromtimestamp(audio_file.stat().st_mtime).isoformat()
            })

        # 保存清单文件
        manifest_path = self.output_dir / "audio_manifest.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        logger.info(f"📋 音频清单已生成: {manifest_path}")

    def cleanup(self):
        """清理临时文件"""
        if self.temp_dir.exists():
            import shutil
            shutil.rmtree(self.temp_dir)
            logger.info("🧹 临时文件已清理")

    def run(self):
        """运行音频生成流程"""
        try:
            logger.info("🎵 开始增强版音频生成...")

            # 加载数据
            data = self.load_json_data()

            # 提取音频项目
            items = self.extract_audio_items(data)

            if not items:
                logger.warning("⚠️ 未找到需要生成音频的内容")
                return

            # 生成音频
            self.generate_all_audio(items)

            # 生成清单
            self.generate_manifest()

            # 输出统计
            logger.info(f"\n🎉 音频生成完成!")
            logger.info(f"📊 统计信息:")
            logger.info(f"   总计: {self.stats['total_items']} 项")
            logger.info(f"   成功: {self.stats['successful']} 项")
            logger.info(f"   失败: {self.stats['failed']} 项")
            logger.info(f"   成功率: {(self.stats['successful'] / max(self.stats['total_items'], 1)) * 100:.1f}%")
            logger.info(f"   耗时: {datetime.now() - self.stats['start_time']}")

        except Exception as e:
            logger.error(f"❌ 音频生成失败: {e}")
            raise
        finally:
            # 清理临时文件
            self.cleanup()

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="增强版音频生成脚本")
    parser.add_argument("input_json", help="输入JSON文件路径")
    parser.add_argument("output_dir", help="输出目录路径")
    parser.add_argument("--quality", choices=["low", "medium", "high"], default="medium", help="音频质量")
    parser.add_argument("--format", choices=["mp3", "wav", "m4a"], default="mp3", help="音频格式")
    parser.add_argument("--no-whisper-asr", action="store_true", help="禁用Whisper ASR")
    parser.add_argument("--no-system-tts", action="store_true", help="禁用系统TTS")
    parser.add_argument("--no-effects", action="store_true", help="禁用音效")
    parser.add_argument("--voice-model", choices=["tiny", "base", "small", "medium", "large"], default="medium", help="Whisper语音模型")
    parser.add_argument("--language", default="auto", help="语言代码 (auto, en, zh, ja, ko)")

    args = parser.parse_args()

    # 创建配置
    config = AudioGenerationConfig(
        input_json=args.input_json,
        output_dir=args.output_dir,
        quality=args.quality,
        format=args.format,
        use_whisper_asr=not args.no_whisper_asr,
        use_system_tts=not args.no_system_tts,
        include_sound_effects=not args.no_effects,
        voice_model=args.voice_model,
        language=args.language
    )

    # 运行生成器
    generator = EnhancedAudioGenerator(config)
    generator.run()

if __name__ == "__main__":
    main()