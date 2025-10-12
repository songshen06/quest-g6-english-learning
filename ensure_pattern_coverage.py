#!/usr/bin/env python3
"""
Quest Patterns 覆盖检查和修复工具

功能：
1. 检查所有JSON模块文件的quests是否完全覆盖了patterns中的句子
2. 自动修复不符合要求的quests
3. 生成详细的报告

使用方法：
python ensure_pattern_coverage.py [--dry-run] [--content-dir src/content]

参数：
--dry-run: 预览模式，只检查不修复
--content-dir: 指定内容目录路径，默认为 src/content
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple
import logging
import argparse
from datetime import datetime

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PatternCoverageChecker:
    """Patterns覆盖检查和修复器"""

    def __init__(self, content_dir: str):
        self.content_dir = Path(content_dir)
        self.report = {
            'timestamp': datetime.now().isoformat(),
            'total_files': 0,
            'files_with_patterns': 0,
            'files_with_complete_coverage': 0,
            'files_needing_repair': 0,
            'details': []
        }

    def generate_filename_from_text(self, text: str) -> str:
        """从文本生成文件名"""
        filename = text.lower()
        filename = re.sub(r'[^\w\s-]', '', filename)
        filename = re.sub(r'\s+', '-', filename)
        filename = re.sub(r'-+', '-', filename)
        filename = filename.strip('-')
        return filename + ".mp3"

    def extract_covered_patterns(self, quests: List[Dict]) -> Set[Tuple[str, str]]:
        """从quests中提取已覆盖的patterns (q, a) pairs"""
        covered = set()

        for quest in quests:
            if quest.get('id') in ['en-to-zh', 'zh-to-en']:
                for step in quest.get('steps', []):
                    if step.get('type') == 'entozh':
                        # 英翻中练习
                        english = step.get('english', '')
                        chinese = step.get('correctChinese', [])
                        if english and chinese:
                            chinese_text = ' '.join(chinese)
                            covered.add((english, chinese_text))

                    elif step.get('type') == 'zhtoen':
                        # 中翻英练习
                        chinese = step.get('chinese', '')
                        english = step.get('correctEnglish', [])
                        if chinese and english:
                            english_text = ' '.join(english)
                            covered.add((english_text, chinese))

        return covered

    def create_vocabulary_matching_quest(self, words: List[Dict], phrases: List[Dict]) -> Dict:
        """创建词语配对练习"""
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

        # 分成多个步骤
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
        sorting_items = []

        # 添加短语
        for phrase in phrases[:3]:
            if 'en' in phrase and 'audio' in phrase:
                text = phrase['en']
                words = text.split()
                if len(words) >= 3:
                    scrambled = words[1:] + [words[0]]
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
            "reward": {"badge": "/images/rewards/sorting-badge.png", "xp": 15}
        }

    def create_en_to_zh_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建英翻中练习 - 优先覆盖所有patterns"""
        translation_items = []

        # 添加patterns中的所有句子
        for pattern in patterns:
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

        # 如果patterns不足，补充短语
        if len(translation_items) < 4:
            for phrase in phrases[:4-len(translation_items)]:
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

        return {
            "id": "en-to-zh",
            "title": "英翻中练习",
            "steps": translation_items[:4],
            "reward": {"badge": "/images/rewards/translation-badge.png", "xp": 15}
        }

    def create_zh_to_en_quest(self, phrases: List[Dict], patterns: List[Dict]) -> Dict:
        """创建中翻英练习 - 优先覆盖所有patterns"""
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
        if len(translation_items) < 4:
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
            "steps": translation_items[:4],
            "reward": {"badge": "/images/rewards/language-badge.png", "xp": 15}
        }

    def generate_complete_quests(self, module_data: Dict) -> List[Dict]:
        """生成完整的quests，确保patterns覆盖"""
        words = module_data.get('words', [])
        phrases = module_data.get('phrases', [])
        patterns = module_data.get('patterns', [])

        quests = []

        # 1. 词语配对练习 - 总是生成
        vocab_quest = self.create_vocabulary_matching_quest(words, phrases)
        quests.append(vocab_quest)

        # 2. 词语排序练习 - 总是生成
        sorting_quest = self.create_sentence_sorting_quest(phrases, patterns)
        quests.append(sorting_quest)

        # 3. 英翻中练习 - 确保覆盖所有patterns，总是生成
        en_to_zh_quest = self.create_en_to_zh_quest(phrases, patterns)
        quests.append(en_to_zh_quest)

        # 4. 中翻英练习 - 确保覆盖所有patterns，总是生成
        zh_to_en_quest = self.create_zh_to_en_quest(phrases, patterns)
        quests.append(zh_to_en_quest)

        return quests

    def check_file_coverage(self, file_path: Path) -> Dict:
        """检查单个文件的patterns覆盖情况"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            file_name = file_path.name
            patterns = data.get('patterns', [])
            quests = data.get('quests', [])

            result = {
                'file_name': file_name,
                'has_patterns': len(patterns) > 0,
                'patterns_count': len(patterns),
                'quests_count': len(quests),
                'covered_patterns': 0,
                'missing_patterns': [],
                'needs_repair': False,
                'patterns': [],
                'quest_details': []
            }

            if not patterns:
                result['status'] = 'no_patterns'
                return result

            # 提取所有patterns
            all_patterns = set()
            for pattern in patterns:
                if 'q' in pattern and 'a' in pattern:
                    all_patterns.add((pattern['q'], pattern['a']))
                    result['patterns'].append({
                        'q': pattern['q'],
                        'a': pattern['a']
                    })

            # 提取已覆盖的patterns
            covered_patterns = self.extract_covered_patterns(quests)
            result['covered_patterns'] = len(covered_patterns)

            # 找出缺失的patterns
            missing_patterns = all_patterns - covered_patterns
            result['missing_patterns'] = [
                {'q': q, 'a': a} for q, a in missing_patterns
            ]

            # 判断是否需要修复
            result['needs_repair'] = len(missing_patterns) > 0

            if len(missing_patterns) == 0:
                result['status'] = 'complete_coverage'
            else:
                result['status'] = 'incomplete_coverage'
                result['coverage_percentage'] = (len(covered_patterns) / len(all_patterns)) * 100

            # 添加quests详情
            for quest in quests:
                result['quest_details'].append({
                    'id': quest.get('id'),
                    'title': quest.get('title'),
                    'steps_count': len(quest.get('steps', []))
                })

            return result

        except Exception as e:
            return {
                'file_name': file_path.name,
                'status': 'error',
                'error': str(e)
            }

    def repair_file(self, file_path: Path, dry_run: bool = False) -> Dict:
        """修复单个文件的quests"""
        check_result = self.check_file_coverage(file_path)

        if check_result.get('status') != 'incomplete_coverage':
            return {
                'file_name': file_path.name,
                'action': 'no_repair_needed',
                'reason': check_result.get('status', 'unknown')
            }

        if dry_run:
            return {
                'file_name': file_path.name,
                'action': 'would_repair',
                'missing_patterns': check_result['missing_patterns'],
                'coverage_percentage': check_result.get('coverage_percentage', 0)
            }

        try:
            # 读取原文件
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 创建备份
            backup_path = file_path.with_suffix('.json.backup')
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # 生成新的quests
            new_quests = self.generate_complete_quests(data)
            data['quests'] = new_quests

            # 保存修复后的文件
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            return {
                'file_name': file_path.name,
                'action': 'repaired',
                'old_quests_count': len(check_result['quest_details']),
                'new_quests_count': len(new_quests),
                'backup_created': str(backup_path)
            }

        except Exception as e:
            return {
                'file_name': file_path.name,
                'action': 'repair_failed',
                'error': str(e)
            }

    def check_all_files(self) -> Dict:
        """检查所有文件"""
        json_files = list(self.content_dir.glob("*.json"))
        self.report['total_files'] = len(json_files)

        results = []

        logger.info(f"🔍 检查 {len(json_files)} 个JSON文件...")

        for file_path in json_files:
            result = self.check_file_coverage(file_path)
            results.append(result)

            if result['has_patterns']:
                self.report['files_with_patterns'] += 1

            if result['status'] == 'complete_coverage':
                self.report['files_with_complete_coverage'] += 1
            elif result['status'] == 'incomplete_coverage':
                self.report['files_needing_repair'] += 1

            # 显示进度
            status_icon = {
                'complete_coverage': '✅',
                'incomplete_coverage': '⚠️',
                'no_patterns': '⚪',
                'error': '❌'
            }.get(result['status'], '❓')

            logger.info(f"  {status_icon} {result['file_name']}: {result['status']}")

            if result['status'] == 'incomplete_coverage':
                coverage = result.get('coverage_percentage', 0)
                logger.info(f"    📊 覆盖率: {coverage:.1f}% ({result['covered_patterns']}/{result['patterns_count']})")

        self.report['details'] = results
        return self.report

    def repair_all_files(self, dry_run: bool = False) -> Dict:
        """修复所有需要修复的文件"""
        if dry_run:
            logger.info("🔍 预览模式 - 不会实际修改文件")

        # 首先检查所有文件
        check_report = self.check_all_files()

        repair_results = []
        files_to_repair = [r for r in check_report['details'] if r['needs_repair']]

        if not files_to_repair:
            logger.info("✅ 所有文件的patterns都已完全覆盖，无需修复！")
            return check_report

        logger.info(f"🔧 发现 {len(files_to_repair)} 个文件需要修复...")

        for result in files_to_repair:
            file_path = self.content_dir / result['file_name']
            repair_result = self.repair_file(file_path, dry_run)
            repair_results.append(repair_result)

            if repair_result['action'] == 'would_repair':
                logger.info(f"  🔄 {repair_result['file_name']}: 将修复 (覆盖率: {repair_result['coverage_percentage']:.1f}%)")
            elif repair_result['action'] == 'repaired':
                logger.info(f"  ✅ {repair_result['file_name']}: 修复完成 ({repair_result['old_quests_count']} → {repair_result['new_quests_count']} quests)")
            elif repair_result['action'] == 'repair_failed':
                logger.error(f"  ❌ {repair_result['file_name']}: 修复失败 - {repair_result['error']}")

        # 添加修复结果到报告
        check_report['repair_results'] = repair_results
        check_report['dry_run'] = dry_run

        return check_report

    def save_report(self, report: Dict, filename: str = None):
        """保存报告到文件"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"pattern_coverage_report_{timestamp}.json"

        report_path = Path(filename)
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        logger.info(f"📋 报告已保存到: {report_path}")
        return report_path

def main():
    parser = argparse.ArgumentParser(description="Quest Patterns覆盖检查和修复工具")
    parser.add_argument("--content-dir", default="src/content", help="内容目录路径")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，只检查不修复")
    parser.add_argument("--output", help="报告输出文件名")
    parser.add_argument("--save-report", action="store_true", help="保存详细报告到文件")

    args = parser.parse_args()

    content_dir = Path(args.content_dir)
    if not content_dir.exists():
        logger.error(f"❌ 内容目录不存在: {content_dir}")
        return 1

    logger.info("🚀 开始Quest Patterns覆盖检查...")
    logger.info(f"📁 内容目录: {content_dir}")

    checker = PatternCoverageChecker(str(content_dir))

    if args.dry_run:
        logger.info("🔍 预览模式 - 只检查不修复")

    # 执行检查和修复
    report = checker.repair_all_files(dry_run=args.dry_run)

    # 显示总结
    logger.info("\n" + "="*60)
    logger.info("📊 检查完成总结:")
    logger.info(f"   总文件数: {report['total_files']}")
    logger.info(f"   有patterns的文件: {report['files_with_patterns']}")
    logger.info(f"   完全覆盖的文件: {report['files_with_complete_coverage']}")
    logger.info(f"   需要修复的文件: {report['files_needing_repair']}")

    if report['files_with_patterns'] > 0:
        coverage_rate = (report['files_with_complete_coverage'] / report['files_with_patterns']) * 100
        logger.info(f"   整体覆盖率: {coverage_rate:.1f}%")

    if args.save_report or args.output:
        report_path = checker.save_report(report, args.output)

    logger.info("\n🎉 检查完成!")
    return 0

if __name__ == "__main__":
    exit(main())