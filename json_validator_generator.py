#!/usr/bin/env python3
"""
JSON文件验证和生成工具
用于验证LLM生成的JSON文件是否符合项目标准
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
import re

class JSONValidator:
    """JSON文件验证器"""

    def __init__(self):
        self.errors = []
        self.warnings = []

    def validate_module_file(self, file_path: str) -> bool:
        """验证模块JSON文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.errors.append(f"JSON格式错误: {e}")
            return False
        except Exception as e:
            self.errors.append(f"文件读取错误: {e}")
            return False

        # 验证必要字段
        required_fields = [
            'moduleId', 'title', 'durationMinutes',
            'words', 'phrases', 'patterns', 'quests', 'practice', 'funFacts'
        ]

        for field in required_fields:
            if field not in data:
                self.errors.append(f"缺少必要字段: {field}")

        # 验证moduleId格式
        if 'moduleId' in data:
            if not re.match(r'grade6-lower-mod-\d{2}', data['moduleId']):
                self.errors.append(f"moduleId格式错误: {data['moduleId']}")

        # 验证words
        if 'words' in data:
            self._validate_words(data['words'])

        # 验证phrases
        if 'phrases' in data:
            self._validate_phrases(data['phrases'])

        # 验证patterns
        if 'patterns' in data:
            self._validate_patterns(data['patterns'])

        # 验证quests - 最重要
        if 'quests' in data:
            self._validate_quests(data['quests'])

        # 验证practice
        if 'practice' in data:
            self._validate_practice(data['practice'])

        # 验证funFacts
        if 'funFacts' in data:
            self._validate_fun_facts(data['funFacts'])

        return len(self.errors) == 0

    def _validate_words(self, words: List[Dict]) -> None:
        """验证单词列表"""
        if not isinstance(words, list):
            self.errors.append("words必须是数组")
            return

        if len(words) < 6 or len(words) > 12:
            self.warnings.append(f"words数量应在6-12之间，当前为{len(words)}个")

        required_fields = ['id', 'en', 'zh', 'audio']

        for i, word in enumerate(words):
            for field in required_fields:
                if field not in word:
                    self.errors.append(f"word[{i}]缺少字段: {field}")

            # 验证音频路径格式
            if 'audio' in word and not (word['audio'].startswith('/audio/tts/') and word['audio'].endswith('.mp3')):
                self.warnings.append(f"word[{i}]音频路径格式可能不正确: {word['audio']}")

    def _validate_phrases(self, phrases: List[Dict]) -> None:
        """验证短语列表"""
        if not isinstance(phrases, list):
            self.errors.append("phrases必须是数组")
            return

        if len(phrases) < 4 or len(phrases) > 8:
            self.warnings.append(f"phrases数量应在4-8之间，当前为{len(phrases)}个")

        required_fields = ['id', 'en', 'zh', 'audio']

        for i, phrase in enumerate(phrases):
            for field in required_fields:
                if field not in phrase:
                    self.errors.append(f"phrase[{i}]缺少字段: {field}")

            # 验证音频路径格式
            if 'audio' in phrase and not (phrase['audio'].startswith('/audio/tts/') and phrase['audio'].endswith('.mp3')):
                self.warnings.append(f"phrase[{i}]音频路径格式可能不正确: {phrase['audio']}")

    def _validate_patterns(self, patterns: List[Dict]) -> None:
        """验证句型模板"""
        if not isinstance(patterns, list):
            self.errors.append("patterns必须是数组")
            return

        if len(patterns) < 2 or len(patterns) > 4:
            self.warnings.append(f"patterns数量应在2-4之间，当前为{len(patterns)}个")

        for i, pattern in enumerate(patterns):
            if 'q' not in pattern:
                self.errors.append(f"pattern[{i}]缺少问题字段")
            if 'a' not in pattern:
                self.errors.append(f"pattern[{i}]缺少答案字段")

    def _validate_quests(self, quests: List[Dict]) -> None:
        """验证练习任务 - 最重要"""
        if not isinstance(quests, list):
            self.errors.append("quests必须是数组")
            return

        # 检查是否包含4种必要类型
        quest_types = [quest.get('id', '') for quest in quests]
        required_types = ['vocabulary-matching', 'sentence-sorting', 'zh-to-en', 'en-to-zh']

        for req_type in required_types:
            if not any(req_type in qtype for qtype in quest_types):
                self.errors.append(f"缺少必要的练习类型: {req_type}")

        for i, quest in enumerate(quests):
            if 'id' not in quest:
                self.errors.append(f"quest[{i}]缺少id字段")
            if 'title' not in quest:
                self.errors.append(f"quest[{i}]缺少title字段")
            if 'steps' not in quest:
                self.errors.append(f"quest[{i}]缺少steps字段")

            if 'steps' in quest:
                self._validate_quest_steps(quest['steps'], quest.get('id', f'quest[{i}]'))

            if 'reward' in quest:
                self._validate_quest_reward(quest['reward'], quest.get('id', f'quest[{i}]'))

    def _validate_quest_steps(self, steps: List[Dict], quest_id: str) -> None:
        """验证练习步骤"""
        if not isinstance(steps, list):
            self.errors.append(f"{quest_id}: steps必须是数组")
            return

        for i, step in enumerate(steps):
            if 'type' not in step:
                self.errors.append(f"{quest_id}: step[{i}]缺少type字段")

            step_type = step.get('type', '')

            if step_type == 'wordmatching':
                self._validate_wordmatching_step(step, f"{quest_id}: step[{i}]")
            elif step_type == 'sentencesorting':
                self._validate_sentencesorting_step(step, f"{quest_id}: step[{i}]")
            elif step_type == 'fillblank':
                self._validate_fillblank_step(step, f"{quest_id}: step[{i}]")
            elif step_type == 'multiplechoice':
                self._validate_multiplechoice_step(step, f"{quest_id}: step[{i}]")
            elif step_type == 'zhtoen':
                self._validate_zhtoen_step(step, f"{quest_id}: step[{i}]")
            elif step_type == 'entozh':
                self._validate_entozh_step(step, f"{quest_id}: step[{i}]")
            else:
                self.warnings.append(f"{quest_id}: step[{i}]未知类型: {step_type}")

    def _validate_wordmatching_step(self, step: Dict, path: str) -> None:
        """验证词汇匹配步骤"""
        if 'pairs' not in step:
            self.errors.append(f"{path}: 缺少pairs字段")
        if 'options' not in step:
            self.errors.append(f"{path}: 缺少options字段")

    def _validate_sentencesorting_step(self, step: Dict, path: str) -> None:
        """验证句子排序步骤"""
        if 'scrambled' not in step:
            self.errors.append(f"{path}: 缺少scrambled字段")
        if 'correct' not in step:
            self.errors.append(f"{path}: 缺少correct字段")

    def _validate_fillblank_step(self, step: Dict, path: str) -> None:
        """验证填空步骤"""
        if 'answer' not in step:
            self.errors.append(f"{path}: 缺少answer字段")

    def _validate_multiplechoice_step(self, step: Dict, path: str) -> None:
        """验证多选步骤"""
        if 'options' not in step:
            self.errors.append(f"{path}: 缺少options字段")
        if 'correct' not in step:
            self.errors.append(f"{path}: 缺少correct字段")

    def _validate_zhtoen_step(self, step: Dict, path: str) -> None:
        """验证中翻英步骤"""
        if 'chinese' not in step:
            self.errors.append(f"{path}: 缺少chinese字段")
        if 'scrambledEnglish' not in step:
            self.errors.append(f"{path}: 缺少scrambledEnglish字段")
        if 'correctEnglish' not in step:
            self.errors.append(f"{path}: 缺少correctEnglish字段")

    def _validate_entozh_step(self, step: Dict, path: str) -> None:
        """验证英翻中步骤"""
        if 'english' not in step:
            self.errors.append(f"{path}: 缺少english字段")
        if 'scrambledChinese' not in step:
            self.errors.append(f"{path}: 缺少scrambledChinese字段")
        if 'correctChinese' not in step:
            self.errors.append(f"{path}: 缺少correctChinese字段")

    def _validate_quest_reward(self, reward: Dict, quest_id: str) -> None:
        """验证任务奖励"""
        if 'xp' not in reward:
            self.warnings.append(f"{quest_id}: 缺少xp奖励字段")

    def _validate_practice(self, practice: List[Dict]) -> None:
        """验证额外练习"""
        if not isinstance(practice, list):
            self.errors.append("practice必须是数组")
            return

        for i, item in enumerate(practice):
            if 'type' not in item:
                self.errors.append(f"practice[{i}]缺少type字段")

    def _validate_fun_facts(self, fun_facts: List[str]) -> None:
        """验证趣味知识"""
        if not isinstance(fun_facts, list):
            self.errors.append("funFacts必须是数组")
            return

        if len(fun_facts) < 2:
            self.warnings.append("funFacts数量至少应为2个")

        for i, fact in enumerate(fun_facts):
            if not isinstance(fact, str):
                self.errors.append(f"funFacts[{i}]必须是字符串")

    def get_report(self) -> str:
        """获取验证报告"""
        report = []

        if self.errors:
            report.append("❌ 发现错误:")
            for error in self.errors:
                report.append(f"  • {error}")

        if self.warnings:
            report.append("⚠️ 警告:")
            for warning in self.warnings:
                report.append(f"  • {warning}")

        if not self.errors and not self.warnings:
            report.append("✅ 验证通过，JSON文件完全符合要求")

        return "\n".join(report)

class JSONTemplateGenerator:
    """JSON模板生成器"""

    def generate_template(self, module_id: str, title: str) -> Dict:
        """生成标准JSON模板"""
        return {
            "moduleId": module_id,
            "title": title,
            "durationMinutes": 25,
            "words": [
                # 示例：添加6-12个单词
                {
                    "id": "example",
                    "en": "example",
                    "zh": "例子",
                    "audio": "/audio/tts/word-example.mp3"
                }
            ],
            "phrases": [
                # 示例：添加4-8个短语
                {
                    "id": "example-phrase",
                    "en": "example phrase",
                    "zh": "示例短语",
                    "audio": "/audio/tts/phrase-example-phrase.mp3"
                }
            ],
            "patterns": [
                # 示例：添加2-4个句型
                {
                    "q": "Example question?",
                    "a": "Example answer."
                }
            ],
            "quests": [
                {
                    "id": "vocabulary-practice",
                    "title": "词汇练习",
                    "steps": [
                        {
                            "type": "wordmatching",
                            "text": "将英语单词与中文意思配对",
                            "pairs": [
                                {"en": "example", "zh": "例子"}
                            ],
                            "options": [
                                {"en": "option1", "zh": "选项1"}
                            ]
                        },
                        {
                            "type": "sentencesorting",
                            "text": "听句子并按正确顺序排列单词",
                            "audio": "/audio/tts/phrase-example-phrase.mp3",
                            "scrambled": ["word1", "word2", "word3"],
                            "correct": ["Word1", "word2", "word3"]
                        }
                    ],
                    "reward": {
                        "badge": "/images/rewards/vocabulary-badge.png",
                        "xp": 10
                    }
                },
                {
                    "id": "dialogue-practice",
                    "title": "对话练习",
                    "steps": [
                        {
                            "type": "fillblank",
                            "text": "完成对话示例",
                            "answer": "example answer"
                        }
                    ],
                    "reward": {
                        "badge": "/images/rewards/dialogue-badge.png",
                        "xp": 15
                    }
                },
                {
                    "id": "zh-to-en",
                    "title": "中翻英练习",
                    "steps": [
                        {
                            "type": "zhtoen",
                            "text": "将中文句子翻译成正确的英文单词顺序",
                            "chinese": "例子",
                            "scrambledEnglish": ["example"],
                            "correctEnglish": ["example"]
                        }
                    ],
                    "reward": {
                        "badge": "/images/rewards/language-badge.png",
                        "xp": 15
                    }
                },
                {
                    "id": "en-to-zh",
                    "title": "英翻中练习",
                    "steps": [
                        {
                            "type": "entozh",
                            "text": "将英文句子翻译成正确的中文单词顺序",
                            "english": "example",
                            "scrambledChinese": ["例", "子"],
                            "correctChinese": ["例", "子"]
                        }
                    ],
                    "reward": {
                        "badge": "/images/rewards/translation-badge.png",
                        "xp": 15
                    }
                }
            ],
            "practice": [
                {
                    "type": "fillblank",
                    "text": "示例填空",
                    "answer": "example"
                }
            ],
            "funFacts": [
                "示例趣味知识1",
                "示例趣味知识2"
            ]
        }

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='JSON文件验证工具')
    parser.add_argument('file', help='要验证的JSON文件路径')
    parser.add_argument('--template', help='生成模板文件', action='store_true')
    parser.add_argument('--module-id', help='模块ID (用于生成模板)')
    parser.add_argument('--title', help='模块标题 (用于生成模板)')

    args = parser.parse_args()

    if args.template:
        if not args.module_id or not args.title:
            print("❌ 生成模板需要 --module-id 和 --title 参数")
            sys.exit(1)

        generator = JSONTemplateGenerator()
        template = generator.generate_template(args.module_id, args.title)

        output_file = f"{args.module_id}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(template, f, ensure_ascii=False, indent=2)

        print(f"✅ 模板文件已生成: {output_file}")
        print("请根据教材内容填充模板中的具体内容")
        return

    # 验证JSON文件
    validator = JSONValidator()

    if not os.path.exists(args.file):
        print(f"❌ 文件不存在: {args.file}")
        sys.exit(1)

    print(f"🔍 验证文件: {args.file}")

    if validator.validate_module_file(args.file):
        print("✅ JSON文件验证通过")
    else:
        print("❌ JSON文件验证失败")

    print("\n" + validator.get_report())

if __name__ == "__main__":
    main()