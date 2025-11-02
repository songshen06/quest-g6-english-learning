#!/usr/bin/env python3
"""
重新生成有问题的音频文件
"""
import os
import sys
from pathlib import Path

# 导入音频生成器
from generate_audio import AudioGenerator

def regenerate_specific_audio():
    """重新生成特定的音频文件"""

    # 定义需要重新生成的文本和文件名映射
    audio_files = [
        ("collect stamps", "collect-stamps.mp3"),
        ("the five-finger mountain", "the-five-finger-mountain.mp3"),
        ("a coconut tree", "a-coconut-tree.mp3"),
        ("finger mountain", "finger-mountain.mp3"),
        ("coconut tree", "coconut-tree.mp3")
    ]

    print("🎵 开始重新生成有问题的音频文件...")

    # 获取项目根目录
    project_root = Path(__file__).parent

    # 初始化音频生成器
    generator = AudioGenerator(project_root)

    success_count = 0
    total_count = len(audio_files)

    for text, filename in audio_files:
        try:
            print(f"🎵 生成音频: {text} -> {filename}")

            # 使用生成器的内部方法生成单个文件
            generator._generate_tts_file(text, filename)

            # 检查文件是否生成成功
            output_path = generator.tts_dir / filename
            if output_path.exists():
                print(f"✅ 成功生成: {output_path}")
                success_count += 1
            else:
                print(f"❌ 生成失败: {text}")

        except Exception as e:
            print(f"❌ 生成 {text} 时出错: {e}")

    print(f"\n📊 音频生成完成: {success_count}/{total_count} 个文件成功生成")

    if success_count < total_count:
        print(f"⚠️  有 {total_count - success_count} 个文件生成失败")
        return False
    else:
        print("🎉 所有音频文件重新生成成功！")
        return True

if __name__ == "__main__":
    regenerate_specific_audio()