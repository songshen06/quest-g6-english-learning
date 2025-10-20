#!/usr/bin/env python3
"""
Grade 6 Lower Quests 生成脚本
根据每个单元的words、phrases、patterns自动生成标准格式的quests内容

生成的quests包含4种类型：
1. vocabulary-matching - 词语配对练习
2. sentence-sorting - 词语排序练习
3. en-to-zh - 英翻中练习
4. zh-to-en - 中翻英练习
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple
import logging

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QuestGenerator:
    """Quest内容生成器"""

    def __init__(self, content_dir: str):
        self.content_dir = Path(content_dir)

    def generate_filename_from_text(self, text: str) -> str:
        """从文本生成文件名"""
        filename = text.lower()
        filename = re.sub(r'[^\w\s-]', '', filename)
        filename = re.sub(r'\s+', '-', filename)
        filename = re.sub(r'-+', '-', filename)
        filename = filename.strip('-')
        return filename + ".mp3"

    def split_chinese_sentence(self, sentence: str) -> List[str]:
        """智能分割中文句子，将标点符号独立处理

        Args:
            sentence: 中文句子，如"你在做什么？"

        Returns:
            分割后的词语列表，如["你", "在", "做什么", "？"]
        """
        import re

        # 中文标点符号集合
        chinese_punctuation = r'[，。！？；：""''（）【】《》、]'

        # 第一步：提取并分割标点符号
        # 使用正则表达式找到所有标点符号的位置
        punctuation_pattern = f'({chinese_punctuation})'
        parts = re.split(punctuation_pattern, sentence)

        # 第二步：处理非标点符号部分，按词语分割
        result = []
        for part in parts:
            if not part:  # 跳过空字符串
                continue
            elif re.match(chinese_punctuation, part):  # 如果是标点符号
                result.append(part)
            else:  # 如果是文字部分
                # 移除可能的空格，然后按常见分词规则分割
                clean_part = part.strip()
                if clean_part:
                    # 简单的中文分词逻辑：
                    # 1. 先尝试按空格分割
                    words = clean_part.split()
                    if len(words) > 1:
                        result.extend(words)
                    else:
                        # 2. 如果没有空格，尝试按常见的词语边界分割
                        # 这里使用启发式方法：常见的词语长度为2-3个字
                        text = clean_part
                        i = 0
                        while i < len(text):
                            # 优先尝试3字词
                            if i + 3 <= len(text) and text[i:i+3] in ['做什么', '干什么', '怎么做', '为什么', '怎么样']:
                                result.append(text[i:i+3])
                                i += 3
                            # 然后尝试2字词
                            elif i + 2 <= len(text) and text[i:i+2] in ['我们', '你们', '他们', '什么', '怎么', '为什么', '这样', '那样', '这里', '那里', '现在', '正在', '已经', '可以', '应该', '需要', '想要', '喜欢', '知道', '明白', '理解', '学习', '工作', '生活', '回家', '吃饭', '睡觉', '起床', '出门', '进门', '上楼', '下楼', '开门', '关门', '开灯', '关灯']:
                                result.append(text[i:i+2])
                                i += 2
                            else:
                                # 单字处理
                                result.append(text[i])
                                i += 1

        # 过滤掉空字符串
        result = [word for word in result if word.strip()]

        return result

    def create_vocabulary_matching_quest(self, words: List[Dict], phrases: List[Dict]) -> Dict:
        """创建词语配对练习"""
        # 合并words和phrases作为配对内容
        all_pairs = []

        # 添加单词配对 (6个)
        for word in words[:6]:
            if 'en' in word and 'zh' in word:
                all_pairs.append({
                    "en": word['en'],
                    "zh": word['zh']
                })

        # 添加短语配对 (6个)
        for phrase in phrases[:6]:
            if 'en' in phrase and 'zh' in phrase:
                all_pairs.append({
                    "en": phrase['en'],
                    "zh": phrase['zh']
                })

        # 分成3个步骤
        steps = []
        for i in range(0, len(all_pairs), 6):
            step_pairs = all_pairs[i:i+6]
            if len(step_pairs) >= 2:
                # 添加干扰项
                options = []
                for option_word in words[6:8] if len(words) > 8 else words[-2:]:
                    if 'en' in option_word and 'zh' in option_word:
                        options.append({
                            "en": option_word['en'],
                            "zh": option_word['zh']
                        })

                step = {
                    "type": "wordmatching",
                    "text": f"将英语单词与短语配对 (第{i//6 + 1}部分)",
                    "pairs": step_pairs,
                    "options": options
                }
                steps.append(step)

        return {
            "id": "vocabulary-matching",
            "title": "词语配对练习",
            "steps": steps,
            "reward": {"badge": "/images/rewards/badge-food.png", "xp": 10}
        }

    def create_sentence_sorting_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建词语排序练习"""
        steps = []

        # 优先使用短语，不足时使用patterns
        sorting_items = []

        # 添加短语 (3个)
        for phrase in phrases[:3]:
            if 'en' in phrase and 'audio' in phrase:
                text = phrase['en']
                words = text.split()
                if len(words) >= 3:
                    # 打乱单词顺序
                    scrambled = words[1:] + [words[0]]  # 简单打乱
                    # 使用短语中已有的音频路径
                    audio_path = phrase['audio']

                    sorting_items.append({
                        "type": "sentencesorting",
                        "text": f"听句子并按正确顺序排列单词 (第{len(sorting_items)+1}部分)",
                        "audio": audio_path,
                        "scrambled": scrambled,
                        "correct": words
                    })

        # 添加patterns (如果短语不足)
        if len(sorting_items) < 3:
            for pattern in patterns[:3-len(sorting_items)]:
                if 'q' in pattern:
                    text = pattern['q']
                    words = text.split()
                    if len(words) >= 3:
                        scrambled = words[1:] + [words[0]]
                        filename = self.generate_filename_from_text(text)
                        audio_path = f"/audio/tts/{filename}"

                        sorting_items.append({
                            "type": "sentencesorting",
                            "text": f"听句子并按正确顺序排列单词 (第{len(sorting_items)+1}部分)",
                            "audio": audio_path,
                            "scrambled": scrambled,
                            "correct": words
                        })

        return {
            "id": "sentence-sorting",
            "title": "词语排序练习",
            "steps": sorting_items,
            "reward": {"badge": "/images/rewards/badge-sentence.png", "xp": 15}
        }

    def create_en_to_zh_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建英翻中练习"""
        steps = []

        # 优先使用patterns中的所有句子
        translation_items = []

        # 添加patterns中的所有句子
        for pattern in patterns:
            if 'q' in pattern and 'a' in pattern:
                chinese_words = self.split_chinese_sentence(pattern['a'])
                if len(chinese_words) >= 2:
                    translation_items.append({
                        "type": "entozh",
                        "text": "将英语句子翻译成正确的中文顺序",
                        "english": pattern['q'],
                        "scrambledChinese": chinese_words[1:] + [chinese_words[0]],
                        "correctChinese": chinese_words
                    })

        # 如果patterns不足，补充短语
        if len(translation_items) < 4:  # 目标是4个练习
            for phrase in phrases[:4-len(translation_items)]:
                if 'en' in phrase and 'zh' in phrase:
                    chinese_words = self.split_chinese_sentence(phrase['zh'])
                    if len(chinese_words) >= 2:
                        translation_items.append({
                            "type": "entozh",
                            "text": "将英语句子翻译成正确的中文顺序",
                            "english": phrase['en'],
                            "scrambledChinese": chinese_words[1:] + [chinese_words[0]],
                            "correctChinese": chinese_words
                        })

        return {
            "id": "en-to-zh",
            "title": "英翻中练习",
            "steps": translation_items[:4],  # 最多4个练习
            "reward": {"badge": "/images/rewards/badge-translate.png", "xp": 15}
        }

    def create_zh_to_en_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建中翻英练习"""
        steps = []

        # 优先使用patterns中的所有句子
        translation_items = []

        # 添加patterns中的所有句子
        for pattern in patterns:
            if 'q' in pattern and 'a' in pattern:
                english_words = pattern['q'].split()
                if len(english_words) >= 2:
                    translation_items.append({
                        "type": "zhtoen",
                        "text": "将中文句子翻译成正确的英文单词顺序",
                        "chinese": pattern['a'],
                        "scrambledEnglish": english_words[1:] + [english_words[0]],
                        "correctEnglish": english_words
                    })

        # 如果patterns不足，补充短语
        if len(translation_items) < 4:  # 目标是4个练习
            for phrase in phrases[:4-len(translation_items)]:
                if 'en' in phrase and 'zh' in phrase:
                    english_words = phrase['en'].split()
                    if len(english_words) >= 2:
                        translation_items.append({
                            "type": "zhtoen",
                            "text": "将中文句子翻译成正确的英文单词顺序",
                            "chinese": phrase['zh'],
                            "scrambledEnglish": english_words[1:] + [english_words[0]],
                            "correctEnglish": english_words
                        })

        return {
            "id": "zh-to-en",
            "title": "中翻英练习",
            "steps": translation_items[:4],  # 最多4个练习
            "reward": {"badge": "/images/rewards/badge-language.png", "xp": 15}
        }

    def generate_quests_for_module(self, module_data: Dict) -> List[Dict]:
        """为单个模块生成quests"""
        words = module_data.get('words', [])
        phrases = module_data.get('phrases', [])
        patterns = module_data.get('patterns', [])

        quests = []

        # 1. 词语配对练习 (总是生成)
        vocab_quest = self.create_vocabulary_matching_quest(words, phrases)
        if vocab_quest['steps']:
            quests.append(vocab_quest)

        # 2. 词语排序练习 (总是生成)
        sorting_quest = self.create_sentence_sorting_quest(phrases, patterns)
        if sorting_quest['steps']:
            quests.append(sorting_quest)

        # 3. 英翻中练习 (总是生成，优先覆盖patterns)
        en_to_zh_quest = self.create_en_to_zh_quest(phrases, patterns)
        if en_to_zh_quest['steps']:
            quests.append(en_to_zh_quest)

        # 4. 中翻英练习 (总是生成，优先覆盖patterns)
        zh_to_en_quest = self.create_zh_to_en_quest(phrases, patterns)
        if zh_to_en_quest['steps']:
            quests.append(zh_to_en_quest)

        return quests

    def update_grade6_lower_modules(self):
        """更新指定的六年级下册模块的quests"""
        # 指定的10个六年级下册文件
        grade6_lower_files = [
            "grade6-lower-mod-01-ordering-food.json",
            "grade6-lower-mod-02-plans-and-weather.json",
            "grade6-lower-mod-03-past-events.json",
            "grade6-lower-mod-04-describing-actions.json",
            "grade6-lower-mod-05-simultaneous-actions.json",
            "grade6-lower-mod-06-gifts-and-past-actions.json",
            "grade6-lower-mod-07-famous-people.json",
            "grade6-lower-mod-08-asking-why.json",
            "grade6-lower-mod-09-best-wishes.json",
            "grade6-lower-mod-10-future-school-life.json"
        ]

        updated_files = []
        skipped_files = []
        error_files = []

        for file_name in grade6_lower_files:
            file_path = self.content_dir / file_name

            # 检查文件是否存在
            if not file_path.exists():
                logger.warning(f"⚠️ 文件不存在，跳过: {file_name}")
                skipped_files.append(file_name)
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    module_data = json.load(f)

                # 生成新的quests
                new_quests = self.generate_quests_for_module(module_data)

                if new_quests:
                    # 备份原文件
                    backup_path = file_path.with_suffix('.json.backup')
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        json.dump(module_data, f, ensure_ascii=False, indent=2)

                    # 更新quests
                    module_data['quests'] = new_quests

                    # 保存更新后的文件
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(module_data, f, ensure_ascii=False, indent=2)

                    updated_files.append(file_name)
                    logger.info(f"✅ 更新完成: {file_name} (生成 {len(new_quests)} 个quests)")
                else:
                    skipped_files.append(file_name)
                    logger.warning(f"⚠️ 跳过: {file_name} (内容不足)")

            except Exception as e:
                error_files.append(file_name)
                logger.error(f"❌ 处理失败 {file_name}: {e}")

        logger.info(f"\n📊 处理完成:")
        logger.info(f"   更新文件: {len(updated_files)}")
        logger.info(f"   跳过文件: {len(skipped_files)}")
        logger.info(f"   错误文件: {len(error_files)}")

        return updated_files, skipped_files, error_files

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="Grade 6 Lower Quests生成器")
    parser.add_argument("--content-dir", default="src/content", help="内容目录路径")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，不实际修改文件")

    args = parser.parse_args()

    content_dir = Path(args.content_dir)
    if not content_dir.exists():
        logger.error(f"❌ 内容目录不存在: {content_dir}")
        return 1

    logger.info("🚀 开始为六年级下册模块生成quests...")
    logger.info(f"📁 内容目录: {content_dir}")

    if args.dry_run:
        logger.info("🔍 预览模式 - 不会修改实际文件")

    generator = QuestGenerator(str(content_dir))

    if not args.dry_run:
        updated_files, skipped_files, error_files = generator.update_grade6_lower_modules()

        logger.info(f"\n✅ 成功更新的文件:")
        for file_name in updated_files:
            logger.info(f"   - {file_name}")

        if skipped_files:
            logger.info(f"\n⚠️ 跳过的文件:")
            for file_name in skipped_files:
                logger.info(f"   - {file_name}")

        if error_files:
            logger.info(f"\n❌ 处理失败的文件:")
            for file_name in error_files:
                logger.info(f"   - {file_name}")
    else:
        # 预览模式：只显示将要处理的文件
        grade6_files = [
            "grade6-lower-mod-01-ordering-food.json",
            "grade6-lower-mod-02-plans-and-weather.json",
            "grade6-lower-mod-03-past-events.json",
            "grade6-lower-mod-04-describing-actions.json",
            "grade6-lower-mod-05-simultaneous-actions.json",
            "grade6-lower-mod-06-gifts-and-past-actions.json",
            "grade6-lower-mod-07-famous-people.json",
            "grade6-lower-mod-08-asking-why.json",
            "grade6-lower-mod-09-best-wishes.json",
            "grade6-lower-mod-10-future-school-life.json"
        ]
        logger.info(f"📋 将要处理 {len(grade6_files)} 个文件:")
        for file_name in grade6_files:
            file_path = content_dir / file_name
            exists = "✅" if file_path.exists() else "❌"
            logger.info(f"   {exists} - {file_name}")

    logger.info("\n🎉 Quests生成完成!")
    return 0

if __name__ == "__main__":
    exit(main())