#!/usr/bin/env python3
"""
为 Module 04-10 添加完整的英翻中练习
"""

import json
import random
from pathlib import Path
from typing import Dict, List, Any

def text_to_filename(text: str) -> str:
    """将文本转换为文件名"""
    import re
    # 移除标点符号并替换为空格
    clean_text = re.sub(r'[^\w\s]', '', text.lower())
    # 替换空格为连字符
    filename = re.sub(r'\s+', '-', clean_text.strip()) + '.mp3'
    return filename

def scramble_chinese(text: str) -> List[str]:
    """打乱中文文字顺序"""
    chars = list(text)
    random.shuffle(chars)
    return chars

def add_entozh_exercises_to_module(file_path: Path) -> bool:
    """为单个模块添加英翻中练习"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        patterns = data.get('patterns', [])
        if not patterns:
            print(f"  ⚠️  {file_path.name} 没有patterns，跳过")
            return False

        # 查找英翻中练习
        en_to_zh_quest = None
        for quest in data.get('quests', []):
            if quest.get('id') == 'en-to-zh':
                en_to_zh_quest = quest
                break

        if not en_to_zh_quest:
            print(f"  ❌ {file_path.name} 没有找到en-to-zh练习")
            return False

        # 为每个pattern创建英翻中练习步骤
        steps = []
        for pattern in patterns:
            english = pattern.get('q', '')
            chinese = pattern.get('a', '')

            if not english or not chinese:
                continue

            # 打乱中文文字
            scrambled_chinese = scramble_chinese(chinese)
            # 确保打乱顺序与正确顺序不同
            while scrambled_chinese == list(chinese):
                scrambled_chinese = scramble_chinese(chinese)

            # 生成音频文件路径
            audio_path = f"/audio/tts/{text_to_filename(english)}"

            step = {
                "type": "entozh",
                "text": "将英语句子翻译成正确的中文顺序",
                "english": english,
                "audio": audio_path,
                "scrambledChinese": scrambled_chinese,
                "correctChinese": list(chinese)
            }
            steps.append(step)
            print(f"    ✅ 添加练习: {english} -> {chinese}")

        # 更新steps
        en_to_zh_quest['steps'] = steps

        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return True

    except Exception as e:
        print(f"❌ 处理 {file_path.name} 失败: {e}")
        return False

def main():
    """主函数"""
    print("🎯 为 Module 04-10 添加完整的英翻中练习")
    print("=" * 60)

    content_dir = Path("src/content")

    # 处理 Module 04-10
    modules_to_process = []
    for i in range(4, 11):
        module_file = content_dir / f"module-{i:02d}-*.json"
        files = list(content_dir.glob(f"module-{i:02d}-*.json"))
        if files:
            modules_to_process.extend(files)

    if not modules_to_process:
        print("❌ 未找到 Module 04-10 文件")
        return

    print(f"📁 找到 {len(modules_to_process)} 个模块文件")
    print()

    # 设置随机种子以确保可重现的结果
    random.seed(42)

    modified_count = 0

    for file_path in sorted(modules_to_process):
        print(f"🔍 处理: {file_path.name}")
        if add_entozh_exercises_to_module(file_path):
            modified_count += 1
        print()

    print("=" * 60)
    print(f"🎉 完成！修改了 {modified_count} 个模块文件")
    print()
    print("📝 添加内容:")
    print("  - 基于patterns创建了完整的英翻中练习")
    print("  - 打乱了中文文字顺序")
    print("  - 添加了音频文件路径")
    print()
    print("⏭️  下一步:")
    print("  - 运行音频生成脚本生成缺失的音频文件")

if __name__ == "__main__":
    main()