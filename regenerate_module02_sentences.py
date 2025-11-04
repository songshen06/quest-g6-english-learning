#!/usr/bin/env python3
"""
重新生成 Module 02 中的特定句子音频文件
"""

import sys
from pathlib import Path

# 导入 CoquiAudioGenerator 类
from generate_missing_audio import CoquiAudioGenerator

def main():
    """主函数"""
    print("🎵 重新生成 Module 02 中的句子音频文件")

    # 创建生成器实例
    generator = CoquiAudioGenerator()

    # 确保输出目录存在
    generator.output_dir.mkdir(parents=True, exist_ok=True)

    # Module 02 需要重新生成的句子列表
    sentences = [
        {
            "filename": "i-went-to-chinatown-in-new-york-yesterday.mp3",
            "text": "I went to Chinatown in New York yesterday."
        },
        {
            "filename": "we-saw-a-lion-dance-in-the-street.mp3",
            "text": "We saw a lion dance in the street."
        }
    ]

    print(f"📝 将重新生成 {len(sentences)} 个句子音频文件:")
    print("=" * 60)

    for i, sentence in enumerate(sentences):
        filename = sentence["filename"]
        text = sentence["text"]

        print(f"[{i+1}/{len(sentences)}] 生成: {filename}")
        print(f"   文本: '{text}'")

        # 如果文件已存在，先删除以强制重新生成
        output_path = generator.output_dir / filename
        if output_path.exists():
            print(f"   🗑️ 删除现有文件")
            output_path.unlink()

        # 使用 Coqui TTS 生成音频
        success = generator.generate_coqui_tts(filename, text)

        if success:
            # 检查生成的文件
            if output_path.exists():
                file_size = output_path.stat().st_size
                print(f"   ✅ 成功生成，文件大小: {file_size} bytes")
            else:
                print(f"   ⚠️ 警告: 生成成功但文件不存在")
        else:
            print(f"   ❌ 生成失败")

        print()

    # 清理临时文件
    generator.cleanup()

    print("=" * 60)
    print("🎉 Module 02 句子音频重新生成完成!")
    print("📂 文件位置:")
    for sentence in sentences:
        filepath = generator.output_dir / sentence["filename"]
        if filepath.exists():
            file_size = filepath.stat().st_size
            print(f"   🎵 {sentence['filename']}: {file_size} bytes")

if __name__ == "__main__":
    main()