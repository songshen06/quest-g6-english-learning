#!/usr/bin/env python3
"""
测试第四单元英翻中练习的内容
"""

import json

def test_module4_content():
    """测试第四单元的英翻中练习内容"""

    # 读取第四单元内容
    with open('/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6/src/content/grade6-lower-mod-04-describing-actions.json', 'r', encoding='utf-8') as f:
        content = json.load(f)

    # 找到英翻中练习
    en_to_zh_quest = None
    for quest in content.get('quests', []):
        if quest.get('id') == 'en-to-zh':
            en_to_zh_quest = quest
            break

    if not en_to_zh_quest:
        print("❌ 没有找到英翻中练习")
        return

    print("🎉 找到英翻中练习！")
    print("=" * 50)

    steps = en_to_zh_quest.get('steps', [])
    print(f"共有 {len(steps)} 个英翻中练习")
    print()

    for i, step in enumerate(steps, 1):
        print(f"练习 {i}:")
        print(f"英文: {step.get('english', 'N/A')}")

        scrambled = step.get('scrambledChinese', [])
        correct = step.get('correctChinese', [])

        print(f"打乱顺序: {scrambled}")
        print(f"正确顺序: {correct}")
        print(f"正确答案: {''.join(correct)}")
        print()

        # 检查标点符号是否独立
        has_independent_punctuation = any(
            char in ['，', '。', '！', '？', '；', '：', '、']
            for char in correct
        )
        print(f"标点符号独立处理: {'✅ 是' if has_independent_punctuation else '❌ 否'}")
        print("-" * 30)

if __name__ == "__main__":
    test_module4_content()