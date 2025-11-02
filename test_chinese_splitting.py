#!/usr/bin/env python3
"""
测试中文分词功能
"""

import sys
import os
# 添加项目根目录到 Python 路径
sys.path.append('/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6')

from generate_quests_for_grade6_lower import QuestGenerator

def test_chinese_splitting():
    """测试中文分词功能"""
    generator = QuestGenerator("/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6/src/content")

    test_sentences = [
        "你在做什么？",
        "他正在看书。",
        "我们今天要去公园。",
        "我喜欢吃苹果！",
        "她正在做什么工作？"
    ]

    print("中文分词测试结果：")
    print("=" * 50)

    for sentence in test_sentences:
        result = generator.split_chinese_sentence(sentence)
        print(f"原句: {sentence}")
        print(f"分词: {result}")
        print(f"词语数量: {len(result)}")
        print("-" * 30)

if __name__ == "__main__":
    test_chinese_splitting()