#!/usr/bin/env python3
"""
为英翻中练习生成缺失的音频文件
"""

import sys
from pathlib import Path

# 导入 CoquiAudioGenerator 类
from generate_missing_audio import CoquiAudioGenerator

def main():
    """主函数"""
    print("🎵 为英翻中练习生成缺失的音频文件")

    # 创建生成器实例
    generator = CoquiAudioGenerator()

    # 确保输出目录存在
    generator.output_dir.mkdir(parents=True, exist_ok=True)

    # 需要生成的音频文件列表（基于脚本运行结果）
    sentences = [
        # Module 01
        {
            "filename": "how-long-is-the-great-wall.mp3",
            "text": "How long is the Great Wall?"
        },
        {
            "filename": "its-more-than-forty-thousand-li-long.mp3",
            "text": "It's more than forty thousand li long."
        },
        {
            "filename": "how-old-is-it.mp3",
            "text": "How old is it?"
        },
        {
            "filename": "its-more-than-two-thousand-years-old.mp3",
            "text": "It's more than two thousand years old."
        }
    ]

    print(f"📝 将生成 {len(sentences)} 个音频文件:")
    print("=" * 60)

    generated_count = 0

    for i, sentence in enumerate(sentences):
        filename = sentence["filename"]
        text = sentence["text"]

        print(f"[{i+1}/{len(sentences)}] 生成: {filename}")
        print(f"   文本: '{text}'")

        # 检查文件是否已存在
        output_path = generator.output_dir / filename
        if output_path.exists():
            print(f"   ⏭️ 跳过已存在: {filename}")
            generated_count += 1
            print()
            continue

        # 使用 Coqui TTS 生成音频
        success = generator.generate_coqui_tts(filename, text)

        if success:
            # 检查生成的文件
            if output_path.exists():
                file_size = output_path.stat().st_size
                print(f"   ✅ 成功生成，文件大小: {file_size} bytes")
                generated_count += 1
            else:
                print(f"   ⚠️ 警告: 生成成功但文件不存在")
        else:
            print(f"   ❌ 生成失败")

        print()

    # 清理临时文件
    generator.cleanup()

    print("=" * 60)
    print(f"🎉 音频生成完成！成功: {generated_count}/{len(sentences)}")
    print()
    print("📂 现在所有英翻中练习都有音频播放功能了！")
    print("🎵 学生可以在做翻译练习前先听英文句子的标准发音")

if __name__ == "__main__":
    main()