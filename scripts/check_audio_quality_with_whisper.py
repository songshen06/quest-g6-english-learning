#!/usr/bin/env python3
"""
基于 Whisper ASR 的音频质量检查脚本
检查短语和句子的音频文件，比较 ASR 识别结果与原始文本
"""

import json
import os
import re
import time
from pathlib import Path
from typing import Dict, List, Tuple
import difflib

try:
    import whisper
    import torch
except ImportError:
    print("❌ 请安装必要的依赖:")
    print("pip install openai-whisper torch")
    exit(1)

class AudioQualityChecker:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.content_dir = self.project_root / "src" / "content"
        self.audio_dir = self.project_root / "public" / "audio" / "tts"

        # 初始化 Whisper 模型
        print("🤖 加载 Whisper 模型...")
        self.model = whisper.load_model("base")  # 使用 base 模型，平衡速度和准确性

        # 统计信息
        self.stats = {
            "total_audio_files": 0,
            "processed_files": 0,
            "failed_files": 0,
            "high_quality": 0,
            "medium_quality": 0,
            "low_quality": 0,
            "issues": []
        }

        # 存储检查结果
        self.results = []

    def text_to_filename(self, text: str) -> str:
        """
        将文本转换为预期的音频文件名（与音频生成脚本保持一致）
        """
        # 转换为小写
        filename = text.lower()
        # 移除标点符号
        filename = filename.replace('?', '').replace('!', '').replace('.', '').replace(',', '')
        filename = filename.replace(':', '').replace(';', '').replace("'", '').replace('"', '')
        # 将空格替换为连字符
        filename = filename.replace(' ', '-')
        # 移除特殊字符，保留字母数字和连字符
        filename = ''.join(c for c in filename if c.isalnum() or c == '-')
        # 将多个连续连字符替换为单个连字符
        while '--' in filename:
            filename = filename.replace('--', '-')
        # 移除开头和结尾的连字符
        filename = filename.strip('-')

        # 如果文件名为空或太短，使用索引
        if len(filename) < 3:
            filename = f'audio-{hash(text) % 10000}'

        return filename + '.mp3'

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """计算两个文本的相似度"""
        # 标准化文本：转小写，移除标点，移除多余空格
        normalize = lambda s: re.sub(r'[^\w\s]', '', s.lower().strip())
        norm1 = normalize(text1)
        norm2 = normalize(text2)

        # 使用 SequenceMatcher 计算相似度
        similarity = difflib.SequenceMatcher(None, norm1, norm2).ratio()
        return similarity

    def transcribe_audio(self, audio_path: Path) -> str:
        """使用 Whisper 转录音频文件"""
        try:
            result = self.model.transcribe(str(audio_path), fp16=False)
            return result['text'].strip()
        except Exception as e:
            print(f"❌ 转录失败 {audio_path.name}: {e}")
            return ""

    def check_module_audio(self, module_file: Path) -> List[Dict]:
        """检查单个模块文件中的音频质量"""
        module_results = []

        try:
            with open(module_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ 读取文件失败 {module_file.name}: {e}")
            return module_results

        module_name = data.get('moduleId', module_file.stem)

        # 检查 words 部分
        for i, word in enumerate(data.get('words', [])):
            if 'en' in word and 'audio' in word:
                result = self.check_single_audio(
                    word['en'],
                    word['audio'],
                    f"{module_name}-word-{i}",
                    "word"
                )
                if result:
                    module_results.append(result)

        # 检查 phrases 部分
        for i, phrase in enumerate(data.get('phrases', [])):
            if 'en' in phrase and 'audio' in phrase:
                result = self.check_single_audio(
                    phrase['en'],
                    phrase['audio'],
                    f"{module_name}-phrase-{i}",
                    "phrase"
                )
                if result:
                    module_results.append(result)

        # 检查 patterns 部分
        for i, pattern in enumerate(data.get('patterns', [])):
            if 'q' in pattern:
                expected_filename = self.text_to_filename(pattern['q'])
                audio_path = self.audio_dir / expected_filename

                if audio_path.exists():
                    result = self.check_single_audio(
                        pattern['q'],
                        f"/audio/tts/{expected_filename}",
                        f"{module_name}-pattern-{i}",
                        "pattern"
                    )
                    if result:
                        module_results.append(result)

        # 检查 quests 中的音频
        for qi, quest in enumerate(data.get('quests', [])):
            for si, step in enumerate(quest.get('steps', [])):
                if 'audio' in step:
                    # 对于 quests，音频内容可能来自 text 或其他字段
                    audio_text = step.get('text', '')

                    if not audio_text and step.get('type') == 'sentencesorting':
                        # 对于句子排序，使用 scrambled 或 correct 数组中的内容
                        if 'correct' in step and step['correct']:
                            audio_text = ' '.join(step['correct'])

                    if audio_text and len(audio_text.strip()) > 0:
                        result = self.check_single_audio(
                            audio_text,
                            step['audio'],
                            f"{module_name}-quest{qi}-step{si}",
                            "quest"
                        )
                        if result:
                            module_results.append(result)

        return module_results

    def check_single_audio(self, original_text: str, audio_path: str, item_id: str, item_type: str) -> Dict:
        """检查单个音频文件的质量"""
        # 提取文件名
        if audio_path.startswith('/audio/tts/'):
            filename = audio_path.replace('/audio/tts/', '')
        else:
            filename = Path(audio_path).name

        full_audio_path = self.audio_dir / filename

        if not full_audio_path.exists():
            return {
                "id": item_id,
                "type": item_type,
                "filename": filename,
                "original_text": original_text,
                "status": "missing",
                "transcribed_text": "",
                "similarity": 0.0,
                "quality": "missing",
                "issue": "音频文件不存在"
            }

        # 转录音频
        transcribed = self.transcribe_audio(full_audio_path)
        if not transcribed:
            return {
                "id": item_id,
                "type": item_type,
                "filename": filename,
                "original_text": original_text,
                "status": "failed",
                "transcribed_text": "",
                "similarity": 0.0,
                "quality": "failed",
                "issue": "Whisper 转录失败"
            }

        # 计算相似度
        similarity = self.calculate_similarity(original_text, transcribed)

        # 评估质量
        if similarity >= 0.9:
            quality = "high"
        elif similarity >= 0.7:
            quality = "medium"
        else:
            quality = "low"

        # 识别问题
        issues = []
        if similarity < 0.5:
            issues.append("识别准确率极低")
        elif similarity < 0.7:
            issues.append("识别准确率较低")

        # 检查常见的音频问题
        if len(transcribed) < len(original_text) * 0.5:
            issues.append("音频可能被截断")
        elif len(transcribed) > len(original_text) * 2:
            issues.append("音频可能包含额外内容")

        return {
            "id": item_id,
            "type": item_type,
            "filename": filename,
            "original_text": original_text,
            "transcribed_text": transcribed,
            "similarity": round(similarity, 3),
            "quality": quality,
            "issues": issues,
            "status": "checked"
        }

    def generate_report(self, results: List[Dict]) -> str:
        """生成音频质量检查报告"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("🎵 音频质量检查报告 (基于 Whisper ASR)")
        report_lines.append("=" * 80)
        report_lines.append(f"📅 检查时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"🤖 使用的模型: Whisper Base")
        report_lines.append("")

        # 统计摘要
        total = len(results)
        high_quality = len([r for r in results if r['quality'] == 'high'])
        medium_quality = len([r for r in results if r['quality'] == 'medium'])
        low_quality = len([r for r in results if r['quality'] == 'low'])
        missing = len([r for r in results if r['status'] == 'missing'])
        failed = len([r for r in results if r['status'] == 'failed'])

        report_lines.append("📊 统计摘要:")
        report_lines.append(f"   总计检查: {total}")
        report_lines.append(f"   高质量 (≥90%): {high_quality} ({high_quality/total*100:.1f}%)")
        report_lines.append(f"   中等质量 (70-89%): {medium_quality} ({medium_quality/total*100:.1f}%)")
        report_lines.append(f"   低质量 (<70%): {low_quality} ({low_quality/total*100:.1f}%)")
        report_lines.append(f"   文件缺失: {missing}")
        report_lines.append(f"   转录失败: {failed}")
        report_lines.append("")

        # 按类型分组
        by_type = {}
        for result in results:
            type_name = result['type']
            if type_name not in by_type:
                by_type[type_name] = []
            by_type[type_name].append(result)

        # 详细的低质量报告
        low_quality_results = [r for r in results if r['quality'] in ['low', 'medium'] and r['status'] == 'checked']

        if low_quality_results:
            report_lines.append("⚠️ 需要关注的音频文件:")
            report_lines.append("-" * 80)

            for result in sorted(low_quality_results, key=lambda x: x['similarity']):
                report_lines.append(f"📁 {result['id']} ({result['type']})")
                report_lines.append(f"   文件: {result['filename']}")
                report_lines.append(f"   原文: '{result['original_text']}'")
                report_lines.append(f"   识别: '{result['transcribed_text']}'")
                report_lines.append(f"   相似度: {result['similarity']:.1%}")

                if result['issues']:
                    for issue in result['issues']:
                        report_lines.append(f"   ⚠️  {issue}")
                report_lines.append("")

        # 文件缺失和失败的报告
        problem_results = [r for r in results if r['status'] in ['missing', 'failed']]
        if problem_results:
            report_lines.append("❌ 严重问题:")
            report_lines.append("-" * 80)

            for result in problem_results:
                report_lines.append(f"📁 {result['id']} ({result['type']})")
                report_lines.append(f"   文件: {result['filename']}")
                report_lines.append(f"   状态: {result['status']}")
                if result.get('issue'):
                    report_lines.append(f"   问题: {result['issue']}")
                report_lines.append("")

        # 建议
        report_lines.append("💡 建议:")
        report_lines.append("-" * 80)

        if low_quality:
            report_lines.append(f"🔄 重新生成 {low_quality} 个低质量音频文件")
            report_lines.append("   建议检查音频生成参数或文本内容")

        if missing:
            report_lines.append(f"📝 生成 {missing} 个缺失的音频文件")

        if failed:
            report_lines.append(f"🔧 检查 {failed} 个转录失败的音频文件")
            report_lines.append("   可能是音频文件损坏或格式不正确")

        report_lines.append("")
        report_lines.append("🎯 整体建议:")
        if high_quality / total >= 0.9:
            report_lines.append("   ✅ 音频质量优秀，系统运行良好")
        elif high_quality / total >= 0.7:
            report_lines.append("   🟡 音频质量良好，建议优化低质量文件")
        else:
            report_lines.append("   🔴 音频质量需要改进，建议系统检查")

        report_lines.append("=" * 80)

        return "\n".join(report_lines)

    def save_report(self, report: str):
        """保存报告到文件"""
        report_file = self.project_root / "audio_quality_report.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 报告已保存到: {report_file}")

    def run(self, target_modules: List[str] = None):
        """运行音频质量检查"""
        print("🎵 开始音频质量检查...")
        print(f"📁 项目目录: {self.project_root}")
        print(f"🎵 音频目录: {self.audio_dir}")
        print("=" * 60)

        # 查找模块文件
        module_files = []

        if target_modules:
            # 检查指定模块
            for module_name in target_modules:
                possible_files = [
                    self.content_dir / f"{module_name}.json",
                    self.content_dir / f"module-{module_name}.json",
                    self.content_dir / f"module-03-{module_name}.json",
                    self.content_dir / f"module-04-{module_name}.json",
                    self.content_dir / f"module-08-{module_name}.json",
                    self.content_dir / f"grade6-upper-mod-{module_name.zfill(2)}.json",
                    self.content_dir / f"grade6-lower-mod-{module_name.zfill(2)}.json"
                ]

                # 也搜索包含模块名的文件
                all_files = list(self.content_dir.glob("*.json"))
                for file_path in all_files:
                    if module_name in file_path.stem:
                        possible_files.append(file_path)

                found = False
                for file_path in possible_files:
                    if file_path.exists():
                        module_files.append(file_path)
                        found = True
                        break

                if not found:
                    print(f"⚠️  未找到模块: {module_name}")
        else:
            # 检查所有模块
            module_files = list(self.content_dir.glob("module-*.json"))
            module_files += list(self.content_dir.glob("grade*lower-mod-*.json"))
            module_files += list(self.content_dir.glob("grade*upper-mod-*.json"))

        if not module_files:
            print("❌ 未找到任何模块文件")
            return

        print(f"📋 找到 {len(module_files)} 个模块文件")
        print()

        # 检查每个模块
        all_results = []
        for i, module_file in enumerate(sorted(module_files), 1):
            print(f"[{i}/{len(module_files)}] 检查模块: {module_file.name}")

            module_results = self.check_module_audio(module_file)
            all_results.extend(module_results)

            print(f"   检查了 {len(module_results)} 个音频文件")
            print()

        # 生成和保存报告
        print("📊 生成检查报告...")
        report = self.generate_report(all_results)

        # 打印报告
        print(report)

        # 保存报告
        self.save_report(report)

        print(f"✅ 检查完成！共检查了 {len(all_results)} 个音频文件")

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="检查音频质量")
    parser.add_argument("--modules", nargs="+", help="指定要检查的模块 (例如: 04 08)")
    parser.add_argument("--all", action="store_true", help="检查所有模块")

    args = parser.parse_args()

    checker = AudioQualityChecker()

    if args.all or not args.modules:
        checker.run()
    else:
        checker.run(args.modules)

if __name__ == "__main__":
    main()