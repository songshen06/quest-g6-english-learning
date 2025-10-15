#!/usr/bin/env python3
"""
通用 Quests 生成脚本
根据每个单元的words、phrases、patterns自动生成标准格式的quests内容

支持任意年级和不同文件结构：
- 支持旧格式（words为字典列表）
- 支持新格式（words包含id、en、zh等字段）
- 自动检测文件结构并适配

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
from typing import Dict, List, Any, Tuple, Optional
import logging

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class GenericQuestGenerator:
    """通用Quest内容生成器"""

    def __init__(self, content_dir: str):
        self.content_dir = Path(content_dir)

    def normalize_word_format(self, word_data: Any) -> Optional[Dict[str, str]]:
        """统一不同格式的word数据"""
        if isinstance(word_data, dict):
            # 新格式：包含id字段
            if 'id' in word_data and 'en' in word_data and 'zh' in word_data:
                return {
                    'id': word_data['id'],
                    'en': word_data['en'],
                    'zh': word_data['zh']
                }
            # 旧格式：直接包含en和zh
            elif 'en' in word_data and 'zh' in word_data:
                return {
                    'id': str(hash(word_data['en']))[:8],
                    'en': word_data['en'],
                    'zh': word_data['zh']
                }
        return None

    def normalize_phrase_format(self, phrase_data: Any) -> Optional[Dict[str, str]]:
        """统一不同格式的phrase数据"""
        if isinstance(phrase_data, dict):
            # 新格式：包含id字段
            if 'id' in phrase_data and 'en' in phrase_data and 'zh' in phrase_data:
                return {
                    'id': phrase_data['id'],
                    'en': phrase_data['en'],
                    'zh': phrase_data['zh']
                }
            # 旧格式：直接包含en和zh
            elif 'en' in phrase_data and 'zh' in phrase_data:
                return {
                    'id': str(hash(phrase_data['en']))[:8],
                    'en': phrase_data['en'],
                    'zh': phrase_data['zh']
                }
        return None

    def normalize_pattern_format(self, pattern_data: Any) -> Optional[Dict[str, str]]:
        """统一不同格式的pattern数据"""
        if isinstance(pattern_data, dict):
            # 新格式：包含q和a字段
            if 'q' in pattern_data and 'a' in pattern_data:
                return {
                    'q': pattern_data['q'],
                    'a': pattern_data['a']
                }
            # 兼容其他可能的格式
            elif 'question' in pattern_data and 'answer' in pattern_data:
                return {
                    'q': pattern_data['question'],
                    'a': pattern_data['answer']
                }
            elif 'example' in pattern_data and 'translation' in pattern_data:
                return {
                    'q': pattern_data['example'],
                    'a': pattern_data['translation']
                }
        return None

    def extract_words(self, module_data: Dict) -> List[Dict[str, str]]:
        """提取并标准化words数据"""
        words_raw = module_data.get('words', [])
        words = []

        for word_data in words_raw:
            normalized = self.normalize_word_format(word_data)
            if normalized:
                words.append(normalized)

        logger.debug(f"提取到 {len(words)} 个words")
        return words

    def extract_phrases(self, module_data: Dict) -> List[Dict[str, str]]:
        """提取并标准化phrases数据"""
        phrases_raw = module_data.get('phrases', [])
        phrases = []

        for phrase_data in phrases_raw:
            normalized = self.normalize_phrase_format(phrase_data)
            if normalized:
                phrases.append(normalized)

        logger.debug(f"提取到 {len(phrases)} 个phrases")
        return phrases

    def extract_patterns(self, module_data: Dict) -> List[Dict[str, str]]:
        """提取并标准化patterns数据"""
        patterns_raw = module_data.get('patterns', [])
        patterns = []

        for pattern_data in patterns_raw:
            normalized = self.normalize_pattern_format(pattern_data)
            if normalized:
                patterns.append(normalized)

        logger.debug(f"提取到 {len(patterns)} 个patterns")
        return patterns

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

        # 添加单词配对 (最多6个)
        for word in words[:6]:
            all_pairs.append({
                "en": word['en'],
                "zh": word['zh']
            })

        # 添加短语配对 (如果单词不足6个，用短语补充)
        for phrase in phrases[:6-len(all_pairs)]:
            all_pairs.append({
                "en": phrase['en'],
                "zh": phrase['zh']
            })

        if len(all_pairs) < 2:
            logger.warning("词汇配对内容不足，至少需要2个词汇")
            return None

        # 添加干扰项
        options = []
        remaining_words = words[6:]
        if len(remaining_words) >= 2:
            for option_word in remaining_words[:2]:
                options.append({
                    "en": option_word['en'],
                    "zh": option_word['zh']
                })
        elif len(all_pairs) >= 4:
            # 如果剩余单词不足，从正确答案中选一些作为干扰项
            for i in range(min(2, len(all_pairs))):
                options.append({
                    "en": all_pairs[i]['zh'],
                    "zh": all_pairs[i]['en']
                })

        step = {
            "type": "wordmatching",
            "text": "将英语单词与中文意思配对",
            "pairs": all_pairs,
            "options": options
        }

        return {
            "id": "vocabulary-matching",
            "title": "词语配对练习",
            "steps": [step],
            "reward": {"badge": f"/images/rewards/badge-vocab.png", "xp": 10}
        }

    def create_sentence_sorting_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建词语排序练习"""
        steps = []

        # 优先使用短语，不足时使用patterns
        sorting_items = []

        # 添加短语 (最多3个)
        for phrase in phrases[:3]:
            text = phrase['en']
            words = text.split()
            if len(words) >= 3:
                # 打乱单词顺序
                scrambled = words[1:] + [words[0]]  # 简单打乱
                filename = self.generate_filename_from_text(text)
                audio_path = f"/audio/tts/{filename}"

                sorting_items.append({
                    "type": "sentencesorting",
                    "text": "听句子并按正确顺序排列单词",
                    "audio": audio_path,
                    "scrambled": scrambled,
                    "correct": words
                })

        # 添加patterns (如果短语不足)
        if len(sorting_items) < 3:
            for pattern in patterns[:3-len(sorting_items)]:
                text = pattern['q']
                words = text.split()
                if len(words) >= 3:
                    scrambled = words[1:] + [words[0]]
                    filename = self.generate_filename_from_text(text)
                    audio_path = f"/audio/tts/{filename}"

                    sorting_items.append({
                        "type": "sentencesorting",
                        "text": "听句子并按正确顺序排列单词",
                        "audio": audio_path,
                        "scrambled": scrambled,
                        "correct": words
                    })

        if not sorting_items:
            logger.warning("句子排序内容不足")
            return None

        return {
            "id": "sentence-sorting",
            "title": "句子排序练习",
            "steps": sorting_items,
            "reward": {"badge": f"/images/rewards/badge-sentence.png", "xp": 15}
        }

    def create_en_to_zh_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建英翻中练习"""
        steps = []

        # 优先使用短语
        translation_items = []

        for phrase in phrases[:2]:
            chinese_chars = list(phrase['zh'])
            # 降低要求，中文至少2个字符即可
            if len(chinese_chars) >= 2:
                # 简单打乱：将第一个字符移到最后
                scrambled = chinese_chars[1:] + [chinese_chars[0]]
                translation_items.append({
                    "type": "entozh",
                    "text": "将英语句子翻译成正确的中文顺序",
                    "english": phrase['en'],
                    "scrambledChinese": scrambled,
                    "correctChinese": chinese_chars
                })

        # 如果短语不足，使用patterns
        if len(translation_items) < 2:
            for pattern in patterns[:2-len(translation_items)]:
                chinese_chars = list(pattern['a'])
                if len(chinese_chars) >= 2:
                    scrambled = chinese_chars[1:] + [chinese_chars[0]]
                    translation_items.append({
                        "type": "entozh",
                        "text": "将英语句子翻译成正确的中文顺序",
                        "english": pattern['q'],
                        "scrambledChinese": scrambled,
                        "correctChinese": chinese_chars
                    })

        if not translation_items:
            logger.warning("英翻中练习内容不足")
            return None

        return {
            "id": "en-to-zh",
            "title": "英翻中练习",
            "steps": translation_items,
            "reward": {"badge": f"/images/rewards/badge-translate.png", "xp": 12}
        }

    def create_zh_to_en_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建中翻英练习"""
        steps = []

        # 优先使用短语
        translation_items = []

        for phrase in phrases[:2]:
            english_words = phrase['en'].split()
            # 降低要求，英文至少2个单词即可
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
                english_words = pattern['q'].split()
                if len(english_words) >= 2:
                    translation_items.append({
                        "type": "zhtoen",
                        "text": "将中文句子翻译成正确的英文单词顺序",
                        "chinese": pattern['a'],
                        "scrambledEnglish": english_words[1:] + [english_words[0]],
                        "correctEnglish": english_words
                    })

        if not translation_items:
            logger.warning("中翻英练习内容不足")
            return None

        return {
            "id": "zh-to-en",
            "title": "中翻英练习",
            "steps": translation_items,
            "reward": {"badge": f"/images/rewards/badge-language.png", "xp": 12}
        }

    def generate_quests_for_module(self, module_data: Dict) -> List[Dict]:
        """为单个模块生成quests"""
        words = self.extract_words(module_data)
        phrases = self.extract_phrases(module_data)
        patterns = self.extract_patterns(module_data)

        quests = []

        # 1. 词语配对练习
        vocab_quest = self.create_vocabulary_matching_quest(words, phrases)
        if vocab_quest:
            quests.append(vocab_quest)

        # 2. 词语排序练习
        sorting_quest = self.create_sentence_sorting_quest(phrases, patterns)
        if sorting_quest:
            quests.append(sorting_quest)

        # 3. 英翻中练习
        en_to_zh_quest = self.create_en_to_zh_quest(phrases, patterns)
        if en_to_zh_quest:
            quests.append(en_to_zh_quest)

        # 4. 中翻英练习
        zh_to_en_quest = self.create_zh_to_en_quest(phrases, patterns)
        if zh_to_en_quest:
            quests.append(zh_to_en_quest)

        return quests

    def update_modules_by_pattern(self, pattern: str, dry_run: bool = False) -> Tuple[List[str], List[str]]:
        """根据文件名模式更新模块"""
        files = list(self.content_dir.glob(f"{pattern}.json"))

        updated_files = []
        skipped_files = []

        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    module_data = json.load(f)

                # 生成新的quests
                new_quests = self.generate_quests_for_module(module_data)

                if new_quests:
                    if not dry_run:
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
                    logger.info(f"✅ {'预览' if dry_run else '更新'}完成: {file_path.name} (生成 {len(new_quests)} 个quests)")
                else:
                    skipped_files.append(file_path.name)
                    logger.warning(f"⚠️ 跳过: {file_path.name} (内容不足)")

            except Exception as e:
                logger.error(f"❌ 处理失败 {file_path.name}: {e}")

        return updated_files, skipped_files

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="通用Quests生成器")
    parser.add_argument("--content-dir", default="src/content", help="内容目录路径")
    parser.add_argument("--grade", help="指定年级 (如: grade3, grade4)")
    parser.add_argument("--pattern", help="自定义文件名模式 (如: grade3-lower-*)")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，不实际修改文件")
    parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")

    args = parser.parse_args()

    # 设置日志级别
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    content_dir = Path(args.content_dir)
    if not content_dir.exists():
        logger.error(f"❌ 内容目录不存在: {content_dir}")
        return 1

    # 确定处理模式
    if args.pattern:
        pattern = args.pattern
        description = f"模式 '{pattern}'"
    elif args.grade:
        pattern = f"{args.grade}*"
        description = f"年级 {args.grade}"
    else:
        logger.error("❌ 必须指定 --grade 或 --pattern 参数")
        return 1

    logger.info(f"🚀 开始为{description}生成quests...")
    logger.info(f"📁 内容目录: {content_dir}")

    if args.dry_run:
        logger.info("🔍 预览模式 - 不会修改实际文件")

    generator = GenericQuestGenerator(str(content_dir))

    updated_files, skipped_files = generator.update_modules_by_pattern(pattern, args.dry_run)

    logger.info(f"\n📊 处理完成:")
    logger.info(f"   更新文件: {len(updated_files)}")
    logger.info(f"   跳过文件: {len(skipped_files)}")

    if updated_files:
        logger.info(f"\n✅ 成功{'预览' if args.dry_run else '更新'}的文件:")
        for file_name in updated_files:
            logger.info(f"   - {file_name}")

    if skipped_files:
        logger.info(f"\n⚠️ 跳过的文件:")
        for file_name in skipped_files:
            logger.info(f"   - {file_name}")

    logger.info(f"\n🎉 Quests生成完成!")
    return 0

if __name__ == "__main__":
    exit(main())