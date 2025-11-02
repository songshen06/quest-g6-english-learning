#!/usr/bin/env python3
"""
配置管理模块
管理所有脚本的全局配置
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass
import json

@dataclass
class TTSConfig:
    """TTS配置"""
    preferred_engine: str = "coqui"  # coqui, say, gtts
    coqui_model: str = "tts_models/multilingual/multi-dataset/xtts_v2"
    say_voice: str = "Samantha"
    gtts_lang: str = "en"
    output_dir: str = "public/audio/tts"
    sample_rate: int = 22050

@dataclass
class ASRConfig:
    """ASR配置"""
    whisper_model: str = "base"  # tiny, base, small, medium, large
    device: str = "auto"  # auto, cpu, cuda
    similarity_threshold_high: float = 0.9
    similarity_threshold_medium: float = 0.7

@dataclass
class PathConfig:
    """路径配置"""
    project_root: Path = None
    content_dir: str = "src/content"
    audio_dir: str = "public/audio/tts"
    reports_dir: str = "reports"

    def __post_init__(self):
        if self.project_root is None:
            self.project_root = Path(__file__).parent.parent.parent

class Config:
    """全局配置管理器"""

    def __init__(self, config_file: Optional[str] = None):
        self.project_root = Path(__file__).parent.parent.parent

        # 初始化配置
        self.tts = TTSConfig()
        self.asr = ASRConfig()
        self.paths = PathConfig(self.project_root)

        # 如果存在配置文件，加载配置
        if config_file and os.path.exists(config_file):
            self.load_from_file(config_file)

        # 确保目录存在
        self._ensure_directories()

    def _ensure_directories(self):
        """确保必要的目录存在"""
        dirs = [
            self.paths.audio_dir,
            self.paths.reports_dir,
            self.paths.project_root / "logs"
        ]

        for dir_path in dirs:
            full_path = self.paths.project_root / dir_path
            full_path.mkdir(parents=True, exist_ok=True)

    def load_from_file(self, config_file: str):
        """从文件加载配置"""
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 更新TTS配置
            if 'tts' in data:
                for key, value in data['tts'].items():
                    if hasattr(self.tts, key):
                        setattr(self.tts, key, value)

            # 更新ASR配置
            if 'asr' in data:
                for key, value in data['asr'].items():
                    if hasattr(self.asr, key):
                        setattr(self.asr, key, value)

        except Exception as e:
            print(f"⚠️ 加载配置文件失败: {e}")

    def save_to_file(self, config_file: str):
        """保存配置到文件"""
        config_data = {
            'tts': {
                'preferred_engine': self.tts.preferred_engine,
                'coqui_model': self.tts.coqui_model,
                'say_voice': self.tts.say_voice,
                'gtts_lang': self.tts.gtts_lang,
                'output_dir': self.tts.output_dir,
                'sample_rate': self.tts.sample_rate
            },
            'asr': {
                'whisper_model': self.asr.whisper_model,
                'device': self.asr.device,
                'similarity_threshold_high': self.asr.similarity_threshold_high,
                'similarity_threshold_medium': self.asr.similarity_threshold_medium
            }
        }

        try:
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
            print(f"✅ 配置已保存到: {config_file}")
        except Exception as e:
            print(f"❌ 保存配置失败: {e}")

    def get_audio_dir(self) -> Path:
        """获取音频目录"""
        return self.paths.project_root / self.paths.audio_dir

    def get_content_dir(self) -> Path:
        """获取内容目录"""
        return self.paths.project_root / self.paths.content_dir

    def get_reports_dir(self) -> Path:
        """获取报告目录"""
        return self.paths.project_root / self.paths.reports_dir

    def print_config(self):
        """打印当前配置"""
        print("📋 当前配置:")
        print("=" * 50)
        print("🎤 TTS配置:")
        print(f"   首选引擎: {self.tts.preferred_engine}")
        print(f"   Coqui模型: {self.tts.coqui_model}")
        print(f"   say语音: {self.tts.say_voice}")
        print(f"   gTTS语言: {self.tts.gtts_lang}")
        print(f"   输出目录: {self.tts.output_dir}")
        print()
        print("🎵 ASR配置:")
        print(f"   Whisper模型: {self.asr.whisper_model}")
        print(f"   设备: {self.asr.device}")
        print(f"   高质量阈值: {self.asr.similarity_threshold_high}")
        print(f"   中等质量阈值: {self.asr.similarity_threshold_medium}")
        print("=" * 50)

# 全局配置实例
config = Config()