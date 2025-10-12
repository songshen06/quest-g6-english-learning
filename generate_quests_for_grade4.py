#!/usr/bin/env python3
"""
Grade 4 Quests 生成脚本
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
            "reward": {"badge": "/images/rewards/vocabulary-badge.png", "xp": 10}
        }

    def create_sentence_sorting_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建词语排序练习"""
        steps = []

        # 优先使用短语，不足时使用patterns
        sorting_items = []

        # 添加短语 (3个)
        for phrase in phrases[:3]:
            if 'en' in phrase:
                text = phrase['en']
                words = text.split()
                if len(words) >= 3:
                    # 打乱单词顺序
                    scrambled = words[1:] + [words[0]]  # 简单打乱
                    phrase_text = text.lower().replace(' ', '-').replace("'", "")
                    audio_path = f"/audio/tts/phrase-{phrase_text}.mp3"

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
            "reward": {"badge": "/images/rewards/sorting-badge.png", "xp": 15}
        }

    def create_en_to_zh_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建英翻中练习"""
        steps = []

        # 优先使用短语
        translation_items = []

        for phrase in phrases[:2]:
            if 'en' in phrase and 'zh' in phrase:
                chinese_words = phrase['zh'].split()
                if len(chinese_words) >= 2:
                    translation_items.append({
                        "type": "entozh",
                        "text": "将英语句子翻译成正确的中文顺序",
                        "english": phrase['en'],
                        "scrambledChinese": chinese_words[1:] + [chinese_words[0]],
                        "correctChinese": chinese_words
                    })

        # 如果短语不足，使用patterns
        if len(translation_items) < 2:
            for pattern in patterns[:2-len(translation_items)]:
                if 'q' in pattern and 'a' in pattern:
                    chinese_words = pattern['a'].split()
                    if len(chinese_words) >= 2:
                        translation_items.append({
                            "type": "entozh",
                            "text": "将英语句子翻译成正确的中文顺序",
                            "english": pattern['q'],
                            "scrambledChinese": chinese_words[1:] + [chinese_words[0]],
                            "correctChinese": chinese_words
                        })

        return {
            "id": "en-to-zh",
            "title": "英翻中练习",
            "steps": translation_items,
            "reward": {"badge": "/images/rewards/translation-badge.png", "xp": 15}
        }

    def create_zh_to_en_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建中翻英练习"""
        steps = []

        # 优先使用短语
        translation_items = []

        for phrase in phrases[:2]:
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

        # 如果短语不足，使用patterns
        if len(translation_items) < 2:
            for pattern in patterns[:2-len(translation_items)]:
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

        return {
            "id": "zh-to-en",
            "title": "中翻英练习",
            "steps": translation_items,
            "reward": {"badge": "/images/rewards/language-badge.png", "xp": 15}
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

        # 3. 英翻中练习 (总是生成)
        en_to_zh_quest = self.create_en_to_zh_quest(phrases, patterns)
        if en_to_zh_quest['steps']:
            quests.append(en_to_zh_quest)

        # 4. 中翻英练习 (总是生成)
        zh_to_en_quest = self.create_zh_to_en_quest(phrases, patterns)
        if zh_to_en_quest['steps']:
            quests.append(zh_to_en_quest)

        return quests

    def update_all_grade4_modules(self):
        """更新所有Grade4模块的quests"""
        grade4_files = list(self.content_dir.glob("grade4-*.json"))

        updated_files = []
        skipped_files = []

        for file_path in grade4_files:
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

                    updated_files.append(file_path.name)
                    logger.info(f"✅ 更新完成: {file_path.name} (生成 {len(new_quests)} 个quests)")
                else:
                    skipped_files.append(file_path.name)
                    logger.warning(f"⚠️ 跳过: {file_path.name} (内容不足)")

            except Exception as e:
                logger.error(f"❌ 处理失败 {file_path.name}: {e}")

        logger.info(f"\n📊 处理完成:")
        logger.info(f"   更新文件: {len(updated_files)}")
        logger.info(f"   跳过文件: {len(skipped_files)}")

        return updated_files, skipped_files

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="Grade 4 Quests生成器")
    parser.add_argument("--content-dir", default="src/content", help="内容目录路径")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，不实际修改文件")

    args = parser.parse_args()

    content_dir = Path(args.content_dir)
    if not content_dir.exists():
        logger.error(f"❌ 内容目录不存在: {content_dir}")
        return 1

    logger.info("🚀 开始为Grade4模块生成quests...")
    logger.info(f"📁 内容目录: {content_dir}")

    if args.dry_run:
        logger.info("🔍 预览模式 - 不会修改实际文件")

    generator = QuestGenerator(str(content_dir))

    if not args.dry_run:
        updated_files, skipped_files = generator.update_all_grade4_modules()

        logger.info(f"\n✅ 成功更新的文件:")
        for file_name in updated_files:
            logger.info(f"   - {file_name}")

        if skipped_files:
            logger.info(f"\n⚠️ 跳过的文件:")
            for file_name in skipped_files:
                logger.info(f"   - {file_name}")
    else:
        # 预览模式：只显示将要处理的文件
        grade4_files = list(content_dir.glob("grade4-*.json"))
        logger.info(f"📋 将要处理 {len(grade4_files)} 个文件:")
        for file_path in grade4_files:
            logger.info(f"   - {file_path.name}")

    logger.info("\n🎉 Quests生成完成!")
    return 0

if __name__ == "__main__":
    exit(main())