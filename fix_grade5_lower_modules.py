#!/usr/bin/env python3
"""
修复grade5-lower模块的问题：
1. 创建英翻中练习
2. 修复词语排序练习的音频路径
"""

import json
import random
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any

def create_word_mapping_for_grade5(english: str, chinese: str) -> List[str]:
    """
    为grade5创建英中词对应关系
    """
    # grade5特殊句子的映射规则
    mappings = {
        # Module 01 - Driver & Player
        "My grandma was a driver before.": ["我", "奶奶", "以前", "是", "司机", "。"],
        "What did she drive?": ["她", "开", "什么", "车", "？"],
        "She drove a bus.": ["她", "开过", "公交车", "。"],
        "My grandpa was a flute player before.": ["我", "爷爷", "以前", "是", "笛子", "演奏者", "。"],
        "What music did he play?": ["他", "演奏", "什么", "音乐", "？"],
        "He played Chinese music.": ["他", "演奏", "中国", "音乐", "。"],

        # Module 02 - Traditional Food
        "What did you eat for breakfast?": ["你", "早餐", "吃", "了", "什么", "？"],
        "I had some noodles for breakfast.": ["我", "早餐", "吃", "了", "面条", "。"],
        "What did you have for lunch?": ["你", "午餐", "吃", "了", "什么", "？"],
        "I had some rice and vegetables.": ["我", "吃", "了", "米饭", "和", "蔬菜", "。"],

        # Module 03 - Library Borrow
        "What books did you borrow?": ["你", "借", "了", "什么", "书", "？"],
        "I borrowed some storybooks.": ["我", "借", "了", "一些", "故事书", "。"],
        "When did you borrow them?": ["你", "什么时候", "借", "的", "？"],
        "I borrowed them yesterday.": ["我", "昨天", "借", "的", "。"],

        # Module 04 - Letters & Seasons
        "What season do you like best?": ["你", "最喜欢", "什么", "季节", "？"],
        "I like spring best.": ["我", "最喜欢", "春天", "。"],
        "Why do you like spring?": ["为什么", "喜欢", "春天", "？"],
        "Because I can fly kites in spring.": ["因为", "我", "可以", "在", "春天", "放风筝", "。"],

        # Module 05 - Shopping & Carrying
        "What did you buy?": ["你", "买", "了", "什么", "？"],
        "I bought some apples and bananas.": ["我", "买", "了", "一些", "苹果", "和", "香蕉", "。"],
        "How did you carry them?": ["你", "怎么", "拿", "的", "？"],
        "I carried them in a bag.": ["我", "用", "袋子", "装", "的", "。"],

        # Module 06 - Travel Plans
        "Where will you go for the holiday?": ["假期", "你", "要去", "哪里", "？"],
        "I will go to Beijing.": ["我", "要去", "北京", "。"],
        "How will you go there?": ["你", "怎么", "去", "？"],
        "I will go there by train.": ["我", "坐", "火车", "去", "。"],

        # Module 07 - Jobs & Time
        "What does your father do?": ["你", "爸爸", "是", "做什么", "的", "？"],
        "He is a doctor.": ["他", "是", "医生", "。"],
        "When does he go to work?": ["他", "什么时候", "上班", "？"],
        "He goes to work at 8 o'clock.": ["他", "8点", "上班", "。"],

        # Module 08 - Make a Kite
        "What are you making?": ["你", "在", "做", "什么", "？"],
        "I'm making a kite.": ["我", "在", "做", "风筝", "。"],
        "What color is it?": ["它", "是", "什么", "颜色", "？"],
        "It's red and blue.": ["它", "是", "红色", "和", "蓝色", "的", "。"],

        # Module 09 - Theatre & History
        "What did you see yesterday?": ["你", "昨天", "看", "了", "什么", "？"],
        "I saw a play yesterday.": ["我", "昨天", "看", "了", "话剧", "。"],
        "Was it interesting?": ["有趣", "吗", "？"],
        "Yes, it was very interesting.": ["是的", "，", "非常", "有趣", "。"],

        # Module 10 - Travel Prep
        "What will you take for the trip?": ["旅行", "你", "要", "带", "什么", "？"],
        "I will take some clothes and books.": ["我", "要", "带", "一些", "衣服", "和", "书", "。"],
        "Where will you put them?": ["你", "把", "它们", "放", "在", "哪里", "？"],
        "I will put them in my bag.": ["我", "把", "它们", "放", "在", "我", "的", "包", "里", "。"]
    }

    return mappings.get(english, chinese.split())

def scramble_chinese_words(words: List[str]) -> List[str]:
    """打乱中文词顺序"""
    scrambled = words.copy()
    random.shuffle(scrambled)
    # 确保打乱顺序与原始顺序不同
    while scrambled == words:
        random.shuffle(scrambled)
    return scrambled

def generate_audio_filename(english: str) -> str:
    """根据英语句子生成音频文件名"""
    clean_text = re.sub(r'[^\w\s]', '', english.lower())
    filename = re.sub(r'\s+', '-', clean_text.strip()) + '.mp3'
    return filename

def fix_grade5_module(file_path: Path) -> bool:
    """修复单个grade5模块文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        patterns = data.get('patterns', [])
        if not patterns:
            print(f"  ⚠️  {file_path.name} 没有patterns，跳过")
            return False

        # 修复1: 创建英翻中练习
        en_to_zh_quest = None
        for quest in data.get('quests', []):
            if quest.get('id') == 'en-to-zh':
                en_to_zh_quest = quest
                break

        if en_to_zh_quest:
            # 为每个pattern创建正确的英翻中练习步骤
            steps = []
            for pattern in patterns:
                english = pattern.get('q', '')
                chinese = pattern.get('a', '')

                if not english or not chinese:
                    continue

                # 创建词映射
                chinese_words = create_word_mapping_for_grade5(english, chinese)

                # 打乱中文词顺序
                scrambled_chinese = scramble_chinese_words(chinese_words)

                # 生成音频文件路径
                audio_path = f"/audio/tts/{generate_audio_filename(english)}"

                step = {
                    "type": "entozh",
                    "text": "将英语句子翻译成正确的中文顺序",
                    "english": english,
                    "audio": audio_path,
                    "scrambledChinese": scrambled_chinese,
                    "correctChinese": chinese_words
                }
                steps.append(step)
                print(f"    ✅ 创建英翻中练习: {english}")

            # 更新steps
            en_to_zh_quest['steps'] = steps

        # 修复2: 修复词语排序练习的音频路径
        sentence_sorting_quest = None
        for quest in data.get('quests', []):
            if quest.get('id') == 'sentence-sorting':
                sentence_sorting_quest = quest
                break

        if sentence_sorting_quest:
            for step in sentence_sorting_quest.get('steps', []):
                if step.get('type') == 'sentencesorting':
                    # 获取正确的单词顺序来生成句子
                    correct_words = step.get('correct', [])
                    if correct_words:
                        # 组合成完整的句子
                        sentence = ' '.join(correct_words)
                        # 生成正确的音频文件路径
                        audio_path = f"/audio/tts/{generate_audio_filename(sentence)}"
                        step['audio'] = audio_path
                        print(f"    🔧 修复音频路径: {sentence} -> {audio_path}")

        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return True

    except Exception as e:
        print(f"❌ 处理 {file_path.name} 失败: {e}")
        return False

def main():
    """主函数"""
    print("🔧 修复grade5-lower模块的问题")
    print("=" * 60)

    content_dir = Path("src/content")

    # 查找所有grade5-lower模块文件
    module_files = list(content_dir.glob("grade5-lower-mod-*.json"))
    module_files.sort()

    if not module_files:
        print("❌ 未找到grade5-lower模块文件")
        return

    print(f"📁 找到 {len(module_files)} 个grade5-lower模块文件")
    print()

    # 设置随机种子以确保可重现的结果
    random.seed(42)

    modified_count = 0

    for file_path in module_files:
        print(f"🔍 处理: {file_path.name}")
        if fix_grade5_module(file_path):
            modified_count += 1
        print()

    print("=" * 60)
    print(f"🎉 完成！修复了 {modified_count} 个grade5-lower模块文件")
    print()
    print("📝 修复内容:")
    print("  - 为英翻中练习创建了完整的练习步骤")
    print("  - 修复了词语排序练习的音频文件路径")
    print("  - 使用有意义的中文词作为最小单元")
    print()
    print("✨ 现在练习更加合理和教育性更强！")

if __name__ == "__main__":
    main()