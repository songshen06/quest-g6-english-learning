#!/usr/bin/env python3
"""
检查缺失的音频文件
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Set

def check_missing_audio_files():
    """检查所有缺失的音频文件"""
    content_dir = Path("src/content")
    audio_dir = Path("public/audio/tts")

    if not content_dir.exists():
        print(f"❌ 内容目录不存在: {content_dir}")
        return

    if not audio_dir.exists():
        print(f"❌ 音频目录不存在: {audio_dir}")
        return

    # 获取所有已存在的音频文件
    existing_files = {f.name for f in audio_dir.glob("*.mp3")}

    print(f"📁 现有音频文件数量: {len(existing_files)}")

    # 检查所有内容文件中的音频引用
    referenced_files = set()
    missing_files = set()

    json_files = list(content_dir.glob("*.json"))
    print(f"📖 找到 {len(json_files)} 个内容文件")

    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 检查单词
            for word in data.get('words', []):
                if 'audio' in word:
                    audio_path = Path(word['audio'])
                    filename = audio_path.name
                    referenced_files.add(filename)
                    if filename not in existing_files:
                        missing_files.add((filename, word.get('en', ''), json_file.name, 'word'))

            # 检查短语
            for phrase in data.get('phrases', []):
                if 'audio' in phrase:
                    audio_path = Path(phrase['audio'])
                    filename = audio_path.name
                    referenced_files.add(filename)
                    if filename not in existing_files:
                        missing_files.add((filename, phrase.get('en', ''), json_file.name, 'phrase'))

            # 检查任务步骤
            for quest in data.get('quests', []):
                for step in quest.get('steps', []):
                    if 'audio' in step:
                        audio_path = Path(step['audio'])
                        filename = audio_path.name
                        referenced_files.add(filename)
                        if filename not in existing_files:
                            # 获取步骤文本
                            text = ""
                            if step.get('type') == 'fillblank' and 'answer' in step:
                                if isinstance(step['answer'], list) and step['answer']:
                                    text = step['answer'][0]
                                elif isinstance(step['answer'], str):
                                    text = step['answer']
                            elif 'text' in step:
                                text = step['text']
                            missing_files.add((filename, text, json_file.name, 'quest'))

        except Exception as e:
            print(f"❌ 处理文件失败 {json_file}: {e}")

    print(f"\n📊 统计信息:")
    print(f"   引用的音频文件: {len(referenced_files)}")
    print(f"   现有的音频文件: {len(existing_files)}")
    print(f"   缺失的音频文件: {len(missing_files)}")

    if missing_files:
        print(f"\n❌ 缺失的音频文件 (前20个):")
        for i, (filename, text, source, type_) in enumerate(sorted(missing_files)[:20]):
            print(f"   {i+1:2d}. {filename}")
            print(f"       文本: '{text}'")
            print(f"       来源: {source} ({type_})")
            print()

        if len(missing_files) > 20:
            print(f"   ... 还有 {len(missing_files) - 20} 个文件缺失")

    return missing_files, existing_files, referenced_files

def main():
    print("🔍 检查缺失的音频文件")
    print("=" * 60)

    missing_files, existing_files, referenced_files = check_missing_audio_files()

    # 生成缺失文件列表用于批量生成
    if missing_files:
        output_file = Path("missing_audio_files.json")
        missing_data = []
        for filename, text, source, type_ in sorted(missing_files):
            missing_data.append({
                'filename': filename,
                'text': text,
                'source': source,
                'type': type_
            })

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(missing_data, f, ensure_ascii=False, indent=2)

        print(f"📋 缺失文件列表已保存到: {output_file}")
        print(f"📝 可用于批量生成音频文件")
    else:
        print("✅ 所有音频文件都存在！")

if __name__ == "__main__":
    main()