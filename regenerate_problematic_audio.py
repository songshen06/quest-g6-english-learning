#!/usr/bin/env python3
"""
重新生成指定短语的音频文件，支持命令行参数输入
"""
import os
import sys
import re
from pathlib import Path

# 导入音频生成器
from generate_audio import AudioGenerator

def text_to_filename(text):
    """将文本转换为文件名（小写，用连字符替换空格和特殊字符）"""
    # 移除标点符号，只保留字母、数字和空格
    cleaned = re.sub(r'[^\w\s]', '', text.lower())
    # 将空格替换为连字符
    filename = re.sub(r'\s+', '-', cleaned.strip())
    return filename + '.mp3'

def regenerate_audio_for_phrases(phrases):
    """为指定短语重新生成音频文件"""

    print("🎵 开始重新生成短语音频文件（高质量 coqui TTS）...")

    # 获取项目根目录
    project_root = Path(__file__).parent

    # 初始化音频生成器
    generator = AudioGenerator(project_root)

    success_count = 0
    total_count = len(phrases)

    for text in phrases:
        try:
            filename = text_to_filename(text)
            print(f"🎵 生成高质量音频: '{text}' -> {filename}")

            # 强制重新生成音频文件（删除已存在的文件）
            output_path = generator.tts_dir / filename
            if output_path.exists():
                output_path.unlink()  # 删除已存在的文件
                print(f"🗑️  删除旧文件: {filename}")

            generator._generate_tts_file(text, filename)

            # 检查文件是否生成成功
            output_path = generator.tts_dir / filename
            if output_path.exists():
                # 检查文件大小确保音频质量
                file_size = output_path.stat().st_size
                print(f"✅ 成功生成: {output_path} ({file_size} bytes)")
                success_count += 1
            else:
                print(f"❌ 生成失败: {text}")

        except Exception as e:
            print(f"❌ 生成 '{text}' 时出错: {e}")

    print(f"\n📊 音频生成完成: {success_count}/{total_count} 个文件成功生成")

    if success_count < total_count:
        print(f"⚠️  有 {total_count - success_count} 个文件生成失败")
        return False
    else:
        print("🎉 所有短语音频文件重新生成成功！")
        return True

def show_usage():
    """显示使用说明"""
    print("📖 使用方法:")
    print("  python regenerate_problematic_audio.py \"短语1\" \"短语2\" \"短语3\"")
    print("\n📝 示例:")
    print("  python regenerate_problematic_audio.py \"have a big surprise\"")
    print("  python regenerate_problematic_audio.py \"have a big surprise\" \"be different from\" \"collect stamps\"")
    print("  python regenerate_problematic_audio.py \"hello world\" \"how are you\"")
    print("\n💡 提示: 短语用空格分隔，包含空格的短语需要用引号包围")

if __name__ == "__main__":
    # 检查命令行参数
    if len(sys.argv) < 2:
        print("❌ 错误: 请提供要生成音频的短语")
        show_usage()
        sys.exit(1)

    # 如果第一个参数是 help，显示帮助信息
    if sys.argv[1].lower() in ['help', '-h', '--help']:
        show_usage()
        sys.exit(0)

    # 获取所有短语参数
    phrases = sys.argv[1:]

    print(f"🎯 将为以下 {len(phrases)} 个短语生成音频:")
    for i, phrase in enumerate(phrases, 1):
        print(f"  {i}. \"{phrase}\"")
    print()

    # 开始生成音频
    success = regenerate_audio_for_phrases(phrases)
    sys.exit(0 if success else 1)