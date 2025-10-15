#!/usr/bin/env python3
"""
修复音频文件路径映射问题
确保 JSON 配置文件中的音频路径与实际生成的文件名一致
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List

def text_to_filename(text: str) -> str:
    """
    将英文文本转换为音频文件名（与 generate_audio.py 保持一致）
    """
    # 转换为小写
    filename = text.lower()
    # 移除标点符号
    filename = filename.replace('?', '').replace('!', '').replace('.', '').replace(',', '')
    # 将空格替换为连字符
    filename = filename.replace(' ', '-')
    # 移除特殊字符，保留字母数字和连字符
    filename = ''.join(c for c in filename if c.isalnum() or c == '-')
    # 将多个连续连字符替换为单个连字符
    while '--' in filename:
        filename = filename.replace('--', '-')
    # 移除开头和结尾的连字符
    filename = filename.strip('-')

    # 如果文件名为空或太短，使用索引
    if len(filename) < 3:
        filename = f'audio-{hash(text) % 10000}'

    return filename + '.mp3'

def extract_text_from_audio_path(audio_path: str) -> str:
    """
    从音频路径中提取可能的英文文本
    """
    if not audio_path:
        return ""

    # 提取文件名（去掉扩展名和路径）
    filename = Path(audio_path).stem

    # 将连字符替换为空格，转换为首字母大写
    text = filename.replace('-', ' ').title()

    return text

def check_module_file(module_file: Path) -> List[Dict]:
    """
    检查单个模块文件中的音频映射问题
    """
    issues = []

    try:
        with open(module_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 检查 words 部分
        for i, word in enumerate(data.get('words', [])):
            if 'audio' in word and 'en' in word:
                expected_filename = text_to_filename(word['en'])
                current_path = word['audio']
                current_filename = Path(current_path).name

                if current_filename != expected_filename:
                    issues.append({
                        'type': 'word',
                        'index': i,
                        'id': word.get('id', ''),
                        'en': word['en'],
                        'current_path': current_path,
                        'expected_path': f"/audio/tts/{expected_filename}",
                        'module': module_file.name
                    })

        # 检查 phrases 部分
        for i, phrase in enumerate(data.get('phrases', [])):
            if 'audio' in phrase and 'en' in phrase:
                expected_filename = text_to_filename(phrase['en'])
                current_path = phrase['audio']
                current_filename = Path(current_path).name

                if current_filename != expected_filename:
                    issues.append({
                        'type': 'phrase',
                        'index': i,
                        'id': phrase.get('id', ''),
                        'en': phrase['en'],
                        'current_path': current_path,
                        'expected_path': f"/audio/tts/{expected_filename}",
                        'module': module_file.name
                    })

        # 检查 patterns 部分（生成音频文件名）
        for i, pattern in enumerate(data.get('patterns', [])):
            if 'q' in pattern:
                expected_filename = text_to_filename(pattern['q'])
                # patterns 通常没有预定义的 audio 字段，但我们记录应该生成的文件名
                issues.append({
                    'type': 'pattern_info',
                    'index': i,
                    'q': pattern['q'],
                    'expected_filename': expected_filename,
                    'module': module_file.name
                })

        # 检查 quests 部分中的音频
        for qi, quest in enumerate(data.get('quests', [])):
            for si, step in enumerate(quest.get('steps', [])):
                if 'audio' in step and 'text' in step:
                    # 对于 quests，音频内容可能来自 text 或 answer 字段
                    audio_text = step.get('text', '')
                    if step.get('type') == 'fillblank' and 'answer' in step:
                        if isinstance(step['answer'], list) and step['answer']:
                            audio_text = step['answer'][0]
                        else:
                            audio_text = step.get('text', '')

                    if audio_text:
                        expected_filename = text_to_filename(audio_text)
                        current_path = step['audio']
                        current_filename = Path(current_path).name

                        if current_filename != expected_filename:
                            issues.append({
                                'type': 'quest_step',
                                'quest_index': qi,
                                'step_index': si,
                                'text': audio_text,
                                'current_path': current_path,
                                'expected_path': f"/audio/tts/{expected_filename}",
                                'module': module_file.name
                            })

    except Exception as e:
        print(f"❌ 处理文件 {module_file} 时出错: {e}")

    return issues

def fix_module_file(module_file: Path, issues: List[Dict]) -> bool:
    """
    修复模块文件中的音频路径问题
    """
    try:
        with open(module_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False

        # 修复 words
        for issue in issues:
            if issue['type'] == 'word':
                for word in data.get('words', []):
                    if word.get('id') == issue['id']:
                        word['audio'] = issue['expected_path']
                        modified = True
                        break

        # 修复 phrases
        for issue in issues:
            if issue['type'] == 'phrase':
                for phrase in data.get('phrases', []):
                    if phrase.get('id') == issue['id']:
                        phrase['audio'] = issue['expected_path']
                        modified = True
                        break

        # 修复 quest steps
        for issue in issues:
            if issue['type'] == 'quest_step':
                quest = data.get('quests', [])[issue['quest_index']]
                if quest:
                    step = quest.get('steps', [])[issue['step_index']]
                    if step:
                        step['audio'] = issue['expected_path']
                        modified = True

        if modified:
            with open(module_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ 修复了 {module_file.name} 中的 {len([i for i in issues if i['type'] not in ['pattern_info']])} 个音频路径")
            return True
        else:
            print(f"ℹ️  {module_file.name} 无需修复")
            return False

    except Exception as e:
        print(f"❌ 修复文件 {module_file} 时出错: {e}")
        return False

def main():
    """
    主函数
    """
    project_root = Path(__file__).parent.parent
    content_dir = project_root / "src" / "content"

    if not content_dir.exists():
        content_dir = project_root / "public" / "content"

    if not content_dir.exists():
        print(f"❌ 内容目录不存在: {content_dir}")
        return

    print("🔍 检查音频文件路径映射问题...")
    print("=" * 60)

    # 查找所有模块文件
    module_files = list(content_dir.glob("module-*.json"))
    module_files += list(content_dir.glob("grade*lower-mod-*.json"))
    module_files += list(content_dir.glob("grade*upper-mod-*.json"))

    total_issues = 0
    all_issues = {}

    for module_file in sorted(module_files):
        issues = check_module_file(module_file)
        if issues:
            # 过滤掉 info 类型的（patterns 的信息记录）
            real_issues = [i for i in issues if i['type'] != 'pattern_info']
            if real_issues:
                all_issues[module_file] = real_issues
                total_issues += len(real_issues)

                print(f"\n📄 {module_file.name}:")
                for issue in real_issues:
                    if 'en' in issue:
                        print(f"  - {issue['type']}: '{issue['en']}'")
                    elif 'text' in issue:
                        print(f"  - {issue['type']}: '{issue['text']}'")
                    else:
                        print(f"  - {issue['type']}")
                    print(f"    当前: {issue['current_path']}")
                    print(f"    期望: {issue['expected_path']}")

    print(f"\n📊 总计发现 {total_issues} 个音频路径问题")

    if total_issues > 0:
        print("\n🔧 自动开始修复...")
        fixed_count = 0

        for module_file, issues in all_issues.items():
            if fix_module_file(module_file, issues):
                fixed_count += 1

        print(f"\n✅ 修复完成！共修复了 {fixed_count} 个文件")
    else:
        print("✅ 所有音频路径都正确！")

if __name__ == "__main__":
    main()