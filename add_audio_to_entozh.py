#!/usr/bin/env python3
"""
为所有模块的英翻中练习添加音频路径
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any

def text_to_filename(text: str) -> str:
    """将文本转换为文件名"""
    # 移除标点符号并替换为空格
    clean_text = re.sub(r'[^\w\s]', '', text.lower())
    # 替换空格为连字符
    filename = re.sub(r'\s+', '-', clean_text.strip()) + '.mp3'
    return filename

def process_module_file(file_path: Path) -> bool:
    """处理单个模块文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False

        # 查找英翻中练习
        for quest in data.get('quests', []):
            if quest.get('id') == 'en-to-zh':
                for step in quest.get('steps', []):
                    if step.get('type') == 'entozh':
                        english = step.get('english', '')
                        if english and not step.get('audio'):
                            # 生成对应的音频文件名
                            filename = text_to_filename(english)
                            audio_path = f"/audio/tts/{filename}"
                            step['audio'] = audio_path
                            modified = True
                            print(f"  ✅ 添加音频路径: {english} -> {audio_path}")

        if modified:
            # 保存修改后的文件
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True

        return False

    except Exception as e:
        print(f"❌ 处理文件失败 {file_path}: {e}")
        return False

def main():
    """主函数"""
    print("🎵 为所有模块的英翻中练习添加音频路径")
    print("=" * 60)

    content_dir = Path("src/content")
    if not content_dir.exists():
        print(f"❌ 内容目录不存在: {content_dir}")
        return

    # 查找所有模块文件
    module_files = list(content_dir.glob("module-*.json"))
    module_files.sort()

    if not module_files:
        print("❌ 未找到模块文件")
        return

    print(f"📁 找到 {len(module_files)} 个模块文件")
    print()

    modified_count = 0

    for file_path in module_files:
        print(f"🔍 处理: {file_path.name}")
        if process_module_file(file_path):
            modified_count += 1
        print()

    print("=" * 60)
    print(f"🎉 完成！修改了 {modified_count} 个模块文件")
    print()
    print("📝 修改内容:")
    print("  - 为所有英翻中练习的英文句子添加了音频路径")
    print("  - 音频文件名基于英文句子自动生成")
    print()
    print("⚠️  请注意:")
    print("  - 部分音频文件可能需要重新生成")
    print("  - 建议检查音频文件是否存在")

if __name__ == "__main__":
    main()