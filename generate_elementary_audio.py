#!/usr/bin/env python3
"""
小学生英语音频生成脚本 - 优化配置版本

功能特性：
- 专门为小学生优化的音频生成配置
- 慢速语音设置
- 高质量音频输出
- 完整的质量验证流程
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

# 导入我们的音频生成器
from coqui_whisper_audio import CoquiWhisperAudio, CoquiAudioConfig
from test_audio_quality import AudioQualityTester, TestConfig

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_elementary_audio_config(project_root: str) -> CoquiAudioConfig:
    """获取适合小学生的音频配置"""

    return CoquiAudioConfig(
        project_root=project_root,

        # Coqui TTS 配置 - 选择高质量的英语语音 (使用VITS，不需要独立声码器)
        tts_model="tts_models/en/ljspeech/vits",  # 高质量英语语音，内置声码器
        vocoder_model=None,  # VITS模型不需要独立声码器
        speech_speed=0.75,  # 慢速，适合小学生 (0.7-0.8 较好)
        speaker_idx=None,

        # Whisper ASR 配置
        whisper_model="base",  # 平衡速度和准确性
        enable_asr_verification=True,
        similarity_threshold=0.80,  # 适合小学生的验证标准

        # 音频质量配置
        audio_format="mp3",
        sample_rate=22050,  # 清晰的采样率
        normalize_audio=True,
        fade_duration=200,  # 适中的淡入淡出

        # 输出配置
        output_dir="",
        temp_dir=""
    )

def get_test_config(project_root: str) -> TestConfig:
    """获取音频质量测试配置"""

    return TestConfig(
        audio_dir=str(Path(project_root) / "public" / "audio" / "tts"),
        content_dir=str(Path(project_root) / "src" / "content"),
        whisper_model="base",
        language="en",
        similarity_threshold=0.80,
        output_dir=str(Path(project_root) / "audio_test_reports")
    )

def generate_audio_for_elementary(project_root: str):
    """为小学生生成音频"""

    logger.info("🎵 开始为小学生生成英语音频...")

    # 获取配置
    config = get_elementary_audio_config(project_root)

    logger.info(f"📁 项目目录: {project_root}")
    logger.info(f"🎤 TTS模型: {config.tts_model}")
    logger.info(f"⚡ 语速: {config.speech_speed}x (慢速模式)")
    logger.info(f"🔍 ASR验证: {'启用' if config.enable_asr_verification else '禁用'}")
    logger.info(f"📊 相似度阈值: {config.similarity_threshold}")

    # 创建音频生成器
    generator = CoquiWhisperAudio(config)

    # 运行生成
    generator.run()

    return generator

def test_audio_quality(project_root: str):
    """测试音频质量"""

    logger.info("🔍 开始测试音频质量...")

    # 获取测试配置
    config = get_test_config(project_root)

    logger.info(f"📁 音频目录: {config.audio_dir}")
    logger.info(f"📖 内容目录: {config.content_dir}")
    logger.info(f"🔍 Whisper模型: {config.whisper_model}")

    # 创建测试器
    tester = AudioQualityTester(config)

    # 运行测试
    tester.run()

    return tester

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="小学生英语音频生成脚本")
    parser.add_argument("--project-root", default=".", help="项目根目录")
    parser.add_argument("--mode", choices=["generate", "test", "both"], default="both",
                       help="运行模式: generate=只生成音频, test=只测试质量, both=生成并测试")
    parser.add_argument("--speech-speed", type=float, default=0.75,
                       help="语速倍数 (0.5-2.0，建议小学生0.7-0.8)")
    parser.add_argument("--tts-model", default="tts_models/en/ljspeech/vits",
                       help="TTS模型名称")
    parser.add_argument("--whisper-model", default="base",
                       choices=["tiny", "base", "small", "medium", "large"],
                       help="Whisper ASR模型")
    parser.add_argument("--no-asr", action="store_true", help="禁用ASR验证")

    args = parser.parse_args()

    # 获取项目根目录的绝对路径
    project_root = Path(args.project_root).resolve()

    if not project_root.exists():
        logger.error(f"❌ 项目目录不存在: {project_root}")
        return 1

    logger.info("🚀 小学生英语音频生成系统启动")
    logger.info(f"📁 项目根目录: {project_root}")
    logger.info(f"🎯 运行模式: {args.mode}")

    try:
        # 音频生成阶段
        if args.mode in ["generate", "both"]:
            logger.info(f"\n{'='*60}")
            logger.info("📝 第1步: 音频生成")
            logger.info(f"{'='*60}")

            # 获取配置并调整参数
            config = get_elementary_audio_config(str(project_root))
            config.speech_speed = args.speech_speed
            config.tts_model = args.tts_model
            config.whisper_model = args.whisper_model
            config.enable_asr_verification = not args.no_asr

            generator = CoquiWhisperAudio(config)
            generator.run()

            logger.info("✅ 音频生成完成!")

        # 质量测试阶段
        if args.mode in ["test", "both"]:
            logger.info(f"\n{'='*60}")
            logger.info("🔍 第2步: 音频质量测试")
            logger.info(f"{'='*60}")

            config = get_test_config(str(project_root))
            config.whisper_model = args.whisper_model

            tester = AudioQualityTester(config)
            tester.run()

            logger.info("✅ 音频质量测试完成!")

        logger.info(f"\n{'='*60}")
        logger.info("🎉 小学生英语音频生成系统运行完成!")
        logger.info(f"{'='*60}")

        # 输出使用建议
        logger.info("\n📚 使用建议:")
        logger.info("1. 生成的音频适合小学4-6年级学生使用")
        logger.info("2. 语速已设置为慢速模式，便于学习理解")
        logger.info("3. 音频质量经过ASR验证，确保发音准确")
        logger.info("4. 建议在教学时结合文字材料使用")
        logger.info("\n📂 文件位置:")
        logger.info(f"   音频文件: {project_root}/public/audio/tts/")
        logger.info(f"   生成报告: {project_root}/public/audio/tts/coqui_audio_report.json")
        if args.mode in ["test", "both"]:
            logger.info(f"   测试报告: {project_root}/audio_test_reports/audio_quality_test_report.json")

        return 0

    except Exception as e:
        logger.error(f"❌ 运行失败: {e}")
        return 1

if __name__ == "__main__":
    exit(main())