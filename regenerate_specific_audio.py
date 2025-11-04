#!/usr/bin/env python3
"""
使用 Coqui TTS 重新生成 "It was very exciting!" 音频文件
"""

import sys
from pathlib import Path

# 导入 CoquiAudioGenerator 类
from generate_missing_audio import CoquiAudioGenerator

def main():
    """主函数"""
    print("🎵 使用 Coqui TTS 重新生成 'It was very exciting!' 音频")

    # 创建生成器实例
    generator = CoquiAudioGenerator()

    # 确保输出目录存在
    generator.output_dir.mkdir(parents=True, exist_ok=True)

    # 文件信息
    filename = "it-was-very-exciting.mp3"
    text = "It was very exciting!"

    print(f"📝 文件名: {filename}")
    print(f"📝 文本: '{text}'")
    print(f"📁 输出目录: {generator.output_dir}")
    print("=" * 50)

    # 如果文件已存在，先删除以强制重新生成
    output_path = generator.output_dir / filename
    if output_path.exists():
        print(f"🗑️ 删除现有文件: {filename}")
        output_path.unlink()

    # 使用 Coqui TTS 生成音频
    success = generator.generate_coqui_tts(filename, text)

    if success:
        print(f"✅ 成功生成音频文件: {filename}")

        # 检查生成的文件
        if output_path.exists():
            file_size = output_path.stat().st_size
            print(f"📊 文件大小: {file_size} bytes")
            print(f"📂 文件路径: {output_path}")
        else:
            print("⚠️ 警告: 生成成功但文件不存在")
    else:
        print(f"❌ 生成失败: {filename}")

    # 清理临时文件
    generator.cleanup()

    print("=" * 50)
    print("🎉 操作完成!")

if __name__ == "__main__":
    main()