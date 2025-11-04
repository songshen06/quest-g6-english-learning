#!/usr/bin/env python3
"""
创建英翻中练习的词分割版本
为每个模块创建合理的英中词对应关系
"""

import json
import random
from pathlib import Path
from typing import Dict, List, Tuple, Any

def create_word_mapping(english: str, chinese: str) -> List[Tuple[str, str]]:
    """
    根据英中句子创建词对应关系
    这里使用简化的映射规则，基于常见的翻译模式
    """
    # 特殊句子的映射规则
    mappings = {
        # Module 01
        "How long is the Great Wall?": ["这", "是", "长城", "吗", "？"],
        "It's more than forty thousand li long.": ["它", "有", "四万多里", "长", "。"],
        "How old is it?": ["它", "有", "多少年", "历史", "？"],
        "It's more than two thousand years old.": ["它", "有", "两千多年", "历史", "了", "。"],

        # Module 02
        "I went to Chinatown in New York yesterday.": ["我", "昨天", "去了", "纽约", "的", "唐人街", "。"],
        "We saw a lion dance in the street.": ["我们", "在", "街道", "上", "看到", "了", "舞狮", "。"],
        "It was very exciting!": ["它", "非常", "有趣", "！"],

        # Module 03
        "What are you doing?": ["你", "在", "做什么", "？"],
        "I'm putting my new stamps into my stamp book.": ["我", "正在", "把", "新", "邮票", "放进", "集邮册", "里", "。"],
        "Have you got any stamps from China?": ["你", "有", "中国", "的", "邮票", "吗", "？"],
        "No, I haven't.": ["不", "，", "我", "没有", "。"],

        # Module 04
        "What do you do on Thanksgiving day?": ["感恩节", "你们", "做什么", "？"],
        "We always have a big, special dinner.": ["我们", "总是", "吃", "一顿", "丰盛", "的", "特别", "晚餐", "。"],
        "What's your favourite festival?": ["你", "最喜欢", "什么", "节日", "？"],

        # Module 05
        "She can speak some English.": ["她", "会", "说", "一些", "英语", "。"],
        "Can I write to her? Of course. You can write to her in English.": ["我", "可以", "给", "她", "写信", "吗", "？", "当然", "。", "你", "可以", "用", "英语", "给", "她", "写信", "。"],
        "Pleased to meet you!": ["很高兴", "认识", "你", "！"],
        "Pleased to meet you too!": ["我", "也", "很高兴", "认识", "你", "！"],

        # Module 06
        "I've got some Chinese chopsticks.": ["我", "有", "一些", "中国", "筷子", "。"],
        "My brother has got a Chinese kite.": ["我", "哥哥", "有", "一个", "中国", "风筝", "。"],
        "Have you got a book about the US?": ["你", "有", "一本", "关于", "美国", "的", "书", "吗", "？"],
        "Yes, I have. It's very interesting.": ["是", "的", "，", "我", "有", "。", "它", "很", "有趣", "。"],

        # Module 07
        "Pandas love bamboo. They eat for twelve hours a day!": ["熊猫", "喜欢", "竹子", "。", "它们", "一天", "吃", "十二", "个", "小时", "！"],
        "Do snakes love music? No, they don't. They're almost deaf!": ["蛇", "喜欢", "音乐", "吗", "？", "不", "，", "它们", "不", "喜欢", "。", "它们", "几乎", "全聋", "！"],
        "What do pandas eat?": ["熊猫", "吃", "什么", "？"],
        "Pandas eat bamboo.": ["熊猫", "吃", "竹子", "。"],

        # Module 08
        "Do you often tidy your bed? Yes, every day.": ["你", "经常", "整理", "床铺", "吗", "？", "是", "的", "，", "每天", "。"],
        "Do you often read stories?": ["你", "经常", "读", "故事", "吗", "？"],
        "Yes. I read stories every day.": ["是", "的", "。", "我", "每天", "都", "读", "故事", "。"],
        "How often do you clean your room?": ["你", "多久", "打扫", "一次", "你", "的", "房间", "？"],
        "I always clean my room on weekends.": ["我", "总是", "在", "周末", "打扫", "我", "的", "房间", "。"],

        # Module 09
        "Is this the UN building? Yes. It's a very important building in New York.": ["这", "是", "联合国", "大楼", "吗", "？", "是", "的", "。", "它", "是", "纽约", "一个", "非常", "重要", "的", "建筑", "。"],
        "The UN wants to make peace in the world.": ["联合国", "想", "在", "世界", "上", "缔造", "和平", "。"],
        "China is one of the 193 member states in the UN.": ["中国", "是", "联合国", "193个", "成员国", "之一", "。"],
        "The UN building is in New York City.": ["联合国", "大楼", "在", "纽约市", "。"],

        # Module 10
        "Only drink clean water!": ["只", "喝", "干净", "的", "水", "！"],
        "This water is very clean. It's fun to drink this way.": ["这", "水", "很", "干净", "。", "这样", "喝", "很", "有趣", "。"],
        "Don't cross the road here!": ["不要", "在", "这里", "穿行", "马路", "！"],
        "Cross at the traffic lights.": ["在", "红绿灯", "处", "穿行", "。"]
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

def fix_module_file(file_path: Path) -> bool:
    """修复单个模块文件中的英翻中练习"""
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

        # 为每个pattern创建正确的英翻中练习步骤
        steps = []
        for pattern in patterns:
            english = pattern.get('q', '')
            chinese = pattern.get('a', '')

            if not english or not chinese:
                continue

            # 创建词映射
            chinese_words = create_word_mapping(english, chinese)

            # 打乱中文词顺序
            scrambled_chinese = scramble_chinese_words(chinese_words)

            # 生成音频文件路径
            import re
            clean_text = re.sub(r'[^\w\s]', '', english.lower())
            filename = re.sub(r'\s+', '-', clean_text.strip()) + '.mp3'
            audio_path = f"/audio/tts/{filename}"

            step = {
                "type": "entozh",
                "text": "将英语句子翻译成正确的中文顺序",
                "english": english,
                "audio": audio_path,
                "scrambledChinese": scrambled_chinese,
                "correctChinese": chinese_words
            }
            steps.append(step)
            print(f"    ✅ 修复练习: {english}")
            print(f"       中文词: {chinese_words}")

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
    print("🔧 创建所有模块的英翻中练习词分割版本")
    print("=" * 60)

    content_dir = Path("src/content")

    # 查找所有模块文件
    module_files = list(content_dir.glob("module-*.json"))
    module_files.sort()

    if not module_files:
        print("❌ 未找到模块文件")
        return

    print(f"📁 找到 {len(module_files)} 个模块文件")
    print()

    # 设置随机种子以确保可重现的结果
    random.seed(42)

    modified_count = 0

    for file_path in module_files:
        print(f"🔍 处理: {file_path.name}")
        if fix_module_file(file_path):
            modified_count += 1
        print()

    print("=" * 60)
    print(f"🎉 完成！修复了 {modified_count} 个模块文件")
    print()
    print("📝 修复内容:")
    print("  - 英翻中练习现在按有意义的中文词作为最小单元")
    print("  - 中文词顺序被打乱，学生需要按正确顺序排列")
    print("  - 保持了原有的音频文件路径")
    print()
    print("✨ 现在练习更加合理和教育性更强！")

if __name__ == "__main__":
    main()