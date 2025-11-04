#!/usr/bin/env python3
"""
修复所有grade5-lower模块的问题
"""

import json
import random
import re
from pathlib import Path

# grade5所有模块的映射
GRADE5_MAPPINGS = {
    # Module 01 - Driver & Player
    "grade5-lower-mod-01-driver-player.json": {
        "My grandma was a driver before.": ["我", "奶奶", "以前", "是", "司机", "。"],
        "What did she drive?": ["她", "开", "什么", "车", "？"],
        "She drove a bus.": ["她", "开过", "公交车", "。"],
        "My grandpa was a flute player before.": ["我", "爷爷", "以前", "是", "笛子", "演奏者", "。"],
        "What music did he play?": ["他", "演奏", "什么", "音乐", "？"],
        "He played Chinese music.": ["他", "演奏", "中国", "音乐", "。"]
    },

    # Module 02 - Traditional Food
    "grade5-lower-mod-02-traditional-food.json": {
        "What did you eat for breakfast?": ["你", "早餐", "吃", "了", "什么", "？"],
        "I had some noodles for breakfast.": ["我", "早餐", "吃", "了", "面条", "。"],
        "What did you have for lunch?": ["你", "午餐", "吃", "了", "什么", "？"],
        "I had some rice and vegetables.": ["我", "吃", "了", "米饭", "和", "蔬菜", "。"]
    },

    # Module 03 - Library Borrow
    "grade5-lower-mod-03-library-borrow.json": {
        "What books did you borrow?": ["你", "借", "了", "什么", "书", "？"],
        "I borrowed some storybooks.": ["我", "借", "了", "一些", "故事书", "。"],
        "When did you borrow them?": ["你", "什么时候", "借", "的", "？"],
        "I borrowed them yesterday.": ["我", "昨天", "借", "的", "。"]
    },

    # Module 04 - Letters & Seasons
    "grade5-lower-mod-04-letters-seasons.json": {
        "What season do you like best?": ["你", "最喜欢", "什么", "季节", "？"],
        "I like spring best.": ["我", "最喜欢", "春天", "。"],
        "Why do you like spring?": ["为什么", "喜欢", "春天", "？"],
        "Because I can fly kites in spring.": ["因为", "我", "可以", "在", "春天", "放风筝", "。"]
    },

    # Module 05 - Shopping & Carrying
    "grade5-lower-mod-05-shopping-carrying.json": {
        "What did you buy?": ["你", "买", "了", "什么", "？"],
        "I bought some apples and bananas.": ["我", "买", "了", "一些", "苹果", "和", "香蕉", "。"],
        "How did you carry them?": ["你", "怎么", "拿", "的", "？"],
        "I carried them in a bag.": ["我", "用", "袋子", "装", "的", "。"]
    },

    # Module 06 - Travel Plans
    "grade5-lower-mod-06-travel-plans.json": {
        "Where will you go for the holiday?": ["假期", "你", "要去", "哪里", "？"],
        "I will go to Beijing.": ["我", "要去", "北京", "。"],
        "How will you go there?": ["你", "怎么", "去", "？"],
        "I will go there by train.": ["我", "坐", "火车", "去", "。"]
    },

    # Module 07 - Jobs & Time
    "grade5-lower-mod-07-jobs-time.json": {
        "What does your father do?": ["你", "爸爸", "是", "做什么", "的", "？"],
        "He is a doctor.": ["他", "是", "医生", "。"],
        "When does he go to work?": ["他", "什么时候", "上班", "？"],
        "He goes to work at 8 o'clock.": ["他", "8点", "上班", "。"]
    },

    # Module 08 - Make a Kite
    "grade5-lower-mod-08-make-a-kite.json": {
        "What are you making?": ["你", "在", "做", "什么", "？"],
        "I'm making a kite.": ["我", "在", "做", "风筝", "。"],
        "What color is it?": ["它", "是", "什么", "颜色", "？"],
        "It's red and blue.": ["它", "是", "红色", "和", "蓝色", "的", "。"]
    },

    # Module 09 - Theatre & History
    "grade5-lower-mod-09-theatre-history.json": {
        "What did you see yesterday?": ["你", "昨天", "看", "了", "什么", "？"],
        "I saw a play yesterday.": ["我", "昨天", "看", "了", "话剧", "。"],
        "Was it interesting?": ["有趣", "吗", "？"],
        "Yes, it was very interesting.": ["是的", "，", "非常", "有趣", "。"]
    },

    # Module 10 - Travel Prep
    "grade5-lower-mod-10-travel-prep.json": {
        "What will you take for the trip?": ["旅行", "你", "要", "带", "什么", "？"],
        "I will take some clothes and books.": ["我", "要", "带", "一些", "衣服", "和", "书", "。"],
        "Where will you put them?": ["你", "把", "它们", "放", "在", "哪里", "？"],
        "I will put them in my bag.": ["我", "把", "它们", "放", "在", "我", "的", "包", "里", "。"]
    }
}

def scramble_chinese_words(words):
    scrambled = words.copy()
    random.shuffle(scrambled)
    while scrambled == words:
        random.shuffle(scrambled)
    return scrambled

def generate_audio_filename(english):
    clean_text = re.sub(r'[^\w\s]', '', english.lower())
    filename = re.sub(r'\s+', '-', clean_text.strip()) + '.mp3'
    return filename

def fix_grade5_module(file_path, mappings):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        patterns = data.get('patterns', [])
        if not patterns:
            print(f"  ⚠️  {file_path.name} 没有patterns")
            return False

        # 创建英翻中练习
        en_to_zh_quest = None
        for quest in data.get('quests', []):
            if quest.get('id') == 'en-to-zh':
                en_to_zh_quest = quest
                break

        if en_to_zh_quest:
            steps = []
            for pattern in patterns:
                english = pattern.get('q', '')
                chinese = pattern.get('a', '')

                if not english or not chinese:
                    continue

                if english in mappings:
                    chinese_words = mappings[english]
                    scrambled_chinese = scramble_chinese_words(chinese_words)
                    audio_path = f'/audio/tts/{generate_audio_filename(english)}'

                    step = {
                        'type': 'entozh',
                        'text': '将英语句子翻译成正确的中文顺序',
                        'english': english,
                        'audio': audio_path,
                        'scrambledChinese': scrambled_chinese,
                        'correctChinese': chinese_words
                    }
                    steps.append(step)
                    print(f"    ✅ 创建英翻中练习: {english}")

            en_to_zh_quest['steps'] = steps

        # 修复词语排序音频路径
        sentence_sorting_quest = None
        for quest in data.get('quests', []):
            if quest.get('id') == 'sentence-sorting':
                sentence_sorting_quest = quest
                break

        if sentence_sorting_quest:
            for step in sentence_sorting_quest.get('steps', []):
                if step.get('type') == 'sentencesorting':
                    correct_words = step.get('correct', [])
                    if correct_words:
                        sentence = ' '.join(correct_words)
                        audio_path = f'/audio/tts/{generate_audio_filename(sentence)}'
                        step['audio'] = audio_path
                        print(f"    🔧 修复音频路径: {sentence}")

        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return True

    except Exception as e:
        print(f"❌ 处理 {file_path.name} 失败: {e}")
        return False

def main():
    print("🔧 修复所有grade5-lower模块的问题")
    print("=" * 60)

    content_dir = Path("src/content")
    random.seed(42)

    fixed_count = 0
    total_count = 0

    for filename, mappings in GRADE5_MAPPINGS.items():
        file_path = content_dir / filename
        if file_path.exists():
            total_count += 1
            print(f"🔍 处理: {filename}")
            if fix_grade5_module(file_path, mappings):
                fixed_count += 1
            print()
        else:
            print(f"❌ 文件不存在: {filename}")

    print("=" * 60)
    print(f"🎉 完成！修复了 {fixed_count}/{total_count} 个grade5-lower模块文件")
    print()
    print("📝 修复内容:")
    print("  - ✅ 创建了英翻中练习")
    print("  - ✅ 修复了词语排序练习的音频路径")
    print("  - ✅ 使用有意义的中文词作为最小单元")

if __name__ == "__main__":
    main()