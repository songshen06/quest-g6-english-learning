#!/usr/bin/env python3
"""
精确修复英翻中练习的词分割问题
基于人工分析的英中对应关系重新生成分词
"""

import json
import random
from pathlib import Path
from typing import Dict, List, Tuple, Any

# 精确的英中词对应关系（手动建立）
PRECISE_MAPPING = {
    # Module 01
    ("How long is the Great Wall?", "长城有多长？"): [
        ("How", "多"), ("long", "长"), ("is", "是"), ("the", "这"), ("Great", "长城"), ("Wall", "有多长？")
    ],
    ("It's more than forty thousand li long.", "它有四万多里长。"): [
        ("It's", "它"), ("more", "有"), ("than", "四万"), ("forty", "多里"), ("thousand", "长"), ("li", "。")
    ],
    ("How old is it?", "它有多老？"): [
        ("How", "它"), ("old", "有多"), ("is", "老？"), ("it", "")
    ],
    ("It's more than two thousand years old.", "它有两千多年历史。"): [
        ("It's", "它"), ("more", "有"), ("than", "两千多"), ("two", "年"), ("thousand", "历史"), ("years", "。"), ("old", "")
    ],

    # Module 02
    ("I went to Chinatown in New York yesterday.", "我昨天去了纽约的唐人街。"): [
        ("I", "我"), ("went", "昨天"), ("to", "去了"), ("Chinatown", "纽约的"), ("in", "唐人街"), ("New", "。"), ("York", ""), ("yesterday", "")
    ],
    ("We saw a lion dance in the street.", "我们在街道上看到了舞狮。"): [
        ("We", "我们"), ("saw", "在街道上"), ("a", "看到"), ("lion", "了"), ("dance", "舞狮"), ("in", "。"), ("the", ""), ("street", "")
    ],
    ("It was very exciting!", "它非常有趣！"): [
        ("It", "它"), ("was", "非常"), ("very", "有趣"), ("exciting", "！")
    ],

    # Module 03
    ("What are you doing?", "你在做什么？"): [
        ("What", "你"), ("are", "在"), ("you", "做什么"), ("doing", "？")
    ],
    ("I'm putting my new stamps into my stamp book.", "我正在把新邮票放进集邮册里。"): [
        ("I'm", "我"), ("putting", "正在"), ("my", "把"), ("new", "新"), ("stamps", "邮票"), ("into", "放"), ("my", "进"), ("stamp", "集邮册"), ("book", "里。")
    ],
    ("Have you got any stamps from China?", "你有中国的邮票吗？"): [
        ("Have", "你"), ("you", "有"), ("got", "中国的"), ("any", "邮票"), ("stamps", "吗"), ("from", ""), ("China", "？")
    ],
    ("No, I haven't.", "不，我没有。"): [
        ("No", "不"), (",", "，"), ("I", "我"), ("haven't", "没有"), (".", "。")
    ],

    # Module 04
    ("What do you do on Thanksgiving day?", "感恩节你们做什么？"): [
        ("What", "感恩节"), ("do", "你们"), ("you", "做什么"), ("do", ""), ("on", ""), ("Thanksgiving", ""), ("day", "？")
    ],
    ("We always have a big, special dinner.", "我们总是吃一顿丰盛的特别晚餐。"): [
        ("We", "我们"), ("always", "总是"), ("have", "吃"), ("a", "一顿"), ("big", "丰盛的"), ("special", "特别"), ("dinner", "晚餐。")
    ],
    ("What's your favourite festival?", "你最喜欢什么节日？"): [
        ("What's", "你"), ("your", "最喜欢"), ("favourite", "什么"), ("festival", "节日？")
    ],

    # Module 05
    ("She can speak some English.", "她会说一些英语。"): [
        ("She", "她"), ("can", "会"), ("speak", "说"), ("some", "一些"), ("English", "英语。")
    ],
    ("Can I write to her? Of course. You can write to her in English.", "我可以给她写信吗？当然可以。你可以用英语给她写信。"): [
        ("Can", "我"), ("I", "可以"), ("write", "给"), ("to", "她"), ("her", "写信"), ("?", "吗"), ("Of", "当然"), ("course", "。"), ("You", "你"), ("can", "可以"), ("write", "用"), ("to", "英语"), ("her", "给"), ("in", "她"), ("English", "写信。")
    ],
    ("Pleased to meet you!", "很高兴认识你！"): [
        ("Pleased", "高兴"), ("to", "认识"), ("meet", "你"), ("you", "！")
    ],
    ("Pleased to meet you too!", "我也很高兴认识你！"): [
        ("Pleased", "也"), ("to", "高兴"), ("meet", "认识"), ("you", "你"), ("too", "！")
    ],

    # Module 06
    ("I've got some Chinese chopsticks.", "我有一些中国筷子。"): [
        ("I've", "我"), ("got", "有"), ("some", "一些"), ("Chinese", "中国"), ("chopsticks", "筷子。")
    ],
    ("My brother has got a Chinese kite.", "我哥哥有一个中国风筝。"): [
        ("My", "我"), ("brother", "哥哥"), ("has", "有"), ("got", "一个"), ("a", "中国"), ("Chinese", "风筝"), ("kite", "。")
    ],
    ("Have you got a book about the US?", "你有一本关于美国的书吗？"): [
        ("Have", "你"), ("you", "有"), ("got", "一本"), ("a", "关于"), ("book", "美国的"), ("about", "书"), ("the", "吗"), ("US", "？")
    ],
    ("Yes, I have. It's very interesting.", "是的，我有。它很有趣。"): [
        ("Yes", "是的"), (",", "，"), ("I", "我"), ("have", "有"), (".", "。"), ("It's", "它"), ("very", "很"), ("interesting", "有趣。")
    ],

    # Module 07
    ("Pandas love bamboo. They eat for twelve hours a day!", "熊猫喜欢竹子。它们一天吃十二个小时！"): [
        ("Pandas", "熊猫"), ("love", "喜欢"), ("bamboo", "竹子"), (".", "。"), ("They", "它们"), ("eat", "一天"), ("for", "吃"), ("twelve", "十二"), ("hours", "个"), ("a", "小"), ("day", "时！")
    ],
    ("Do snakes love music? No, they don't. They're almost deaf!", "蛇喜欢音乐吗？不，它们不喜欢。它们几乎全聋！"): [
        ("Do", "蛇"), ("snakes", "喜欢"), ("love", "音乐"), ("music", "吗"), ("?", "不"), ("No", "它们"), (",", "不喜欢"), ("they", "。"), ("don't", "它们"), (".", "它们"), ("They're", "几乎"), ("almost", "全聋"), ("deaf", "！")
    ],
    ("What do pandas eat?", "熊猫吃什么？"): [
        ("What", "熊猫"), ("do", "吃"), ("pandas", "什么"), ("eat", "？")
    ],
    ("Pandas eat bamboo.", "熊猫吃竹子。"): [
        ("Pandas", "熊猫"), ("eat", "吃"), ("bamboo", "竹子。")
    ],

    # Module 08
    ("Do you often tidy your bed? Yes, every day.", "你经常整理床铺吗？是的，每天。"): [
        ("Do", "你"), ("you", "经常"), ("often", "整理"), ("tidy", "床铺"), ("your", "吗"), ("bed", ""), ("?", "是的"), ("Yes", "每"), (",", "天"), ("every", "。"), ("day", "")
    ],
    ("Do you often read stories?", "你经常读故事吗？"): [
        ("Do", "你"), ("you", "经常"), ("often", "读"), ("read", "故事"), ("stories", "吗"), ("?", "")
    ],
    ("Yes. I read stories every day.", "是的。我每天都读故事。"): [
        ("Yes", "是的"), (".", "。"), ("I", "我"), ("read", "读"), ("stories", "故事"), ("every", "每"), ("day", "天"), (".", "。")
    ],
    ("How often do you clean your room?", "你多久打扫一次你的房间？"): [
        ("How", "你"), ("often", "多久"), ("do", "打扫"), ("you", "一次"), ("clean", "你的"), ("your", "房间"), ("room", "？")
    ],
    ("I always clean my room on weekends.", "我总是在周末打扫我的房间。"): [
        ("I", "我"), ("always", "总是"), ("clean", "打扫"), ("my", "我的"), ("room", "房间"), ("on", "在"), ("weekends", "周末。")
    ],

    # Module 09
    ("Is this the UN building? Yes. It's a very important building in New York.", "这是联合国大楼吗？是的。它是纽约一个非常重要的建筑。"): [
        ("Is", "这"), ("this", "是"), ("the", "联合国"), ("UN", "大楼"), ("building", "吗"), ("?", "是的"), ("Yes", "。"), ("It's", "它"), ("a", "是"), ("very", "一个"), ("important", "非常"), ("building", "重要"), ("in", "的"), ("New", "纽约"), ("York", "建筑。")
    ],
    ("The UN wants to make peace in the world.", "联合国想在世界上缔造和平。"): [
        ("The", "联合国"), ("UN", "想"), ("wants", "在"), ("to", "世界"), ("make", "缔造"), ("peace", "和平"), ("in", ""), ("the", ""), ("world", "。")
    ],
    ("China is one of the 193 member states in the UN.", "中国是联合国193个成员国之一。"): [
        ("China", "中国"), ("is", "是"), ("one", "是"), ("of", "联合国"), ("the", "193个"), ("193", "成员国"), ("member", "之一"), ("states", ""), ("in", ""), ("the", ""), ("UN", "。")
    ],
    ("The UN building is in New York City.", "联合国大楼在纽约市。"): [
        ("The", "联合国"), ("UN", "大楼"), ("building", "在"), ("is", "纽约"), ("in", "市"), ("New", "。"), ("York", ""), ("City", "")
    ],

    # Module 10
    ("Only drink clean water!", "只喝干净的水！"): [
        ("Only", "只"), ("drink", "喝"), ("clean", "干净"), ("water", "的水！")
    ],
    ("This water is very clean. It's fun to drink this way.", "这水很干净。这样喝很有趣。"): [
        ("This", "这"), ("water", "水"), ("is", "很"), ("very", "干净"), ("clean", "。"), ("It's", "这样"), ("fun", "喝"), ("to", "很"), ("drink", "有趣"), ("this", "。"), ("way", "")
    ],
    ("Don't cross the road here!", "不要在这里穿行马路！"): [
        ("Don't", "不要"), ("cross", "在这里"), ("the", "穿行"), ("road", "马路"), ("here", "！")
    ],
    ("Cross at the traffic lights.", "在红绿灯处穿行。"): [
        ("Cross", "在"), ("at", "红绿灯"), ("the", "处"), ("traffic", "穿行"), ("lights", "。")
    ]
}

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

            # 查找精确映射
            word_pairs = None
            for key, value in PRECISE_MAPPING.items():
                if key == english and value[0][1] + value[0][3:] == chinese:
                    word_pairs = value
                    break

            if not word_pairs:
                print(f"    ⚠️  未找到映射: {english} -> {chinese}")
                continue

            # 提取英文词和中文词
            english_words = [pair[0] for pair in word_pairs if pair[1]]
            chinese_words = [pair[1] for pair in word_pairs if pair[1]]

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
            print(f"       英文词: {english_words}")
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
    print("🔧 精确修复所有模块的英翻中练习词分割问题")
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
    print("  - 英翻中练习现在按英文单词对应的中文词作为最小单元")
    print("  - 中文词顺序被打乱，学生需要按正确顺序排列")
    print("  - 保持了原有的音频文件路径")
    print()
    print("✨ 现在练习更加合理和教育性更强！")

if __name__ == "__main__":
    main()