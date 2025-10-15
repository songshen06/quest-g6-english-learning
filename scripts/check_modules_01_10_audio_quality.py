#!/usr/bin/env python3
"""
Module 01-10 音频质量检查脚本
专门检查 module-01 到 module-10 的短语和句子音频质量，使用 Whisper ASR 进行对比分析
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

class Modules01To10AudioQualityChecker:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.content_dir = self.project_root / "src" / "content"
        self.audio_dir = self.project_root / "public" / "audio" / "tts"

        # 初始化 Whisper 模型
        print("🤖 加载 Whisper 模型...")
        self.model = whisper.load_model("base")

        # 统计信息
        self.stats = {
            "total_modules": 0,
            "total_phrases": 0,
            "total_patterns": 0,
            "total_words": 0,
            "checked_phrases": 0,
            "checked_patterns": 0,
            "checked_words": 0,
            "high_quality": 0,
            "medium_quality": 0,
            "low_quality": 0,
            "missing_files": 0,
            "transcription_failed": 0
        }

        # 存储检查结果
        self.results = []

    def text_to_filename(self, text: str) -> str:
        """将文本转换为预期的音频文件名"""
        filename = text.lower()
        filename = filename.replace('?', '').replace('!', '').replace('.', '').replace(',', '')
        filename = filename.replace(':', '').replace(';', '').replace("'", '').replace('"', '')
        filename = filename.replace(' ', '-')
        filename = ''.join(c for c in filename if c.isalnum() or c == '-')
        while '--' in filename:
            filename = filename.replace('--', '-')
        filename = filename.strip('-')

        if len(filename) < 3:
            filename = f'audio-{hash(text) % 10000}'

        return filename + '.mp3'

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """计算两个文本的相似度"""
        normalize = lambda s: re.sub(r'[^\w\s]', '', s.lower().strip())
        norm1 = normalize(text1)
        norm2 = normalize(text2)
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

    def collect_modules_content(self) -> List[Dict]:
        """收集 module-01 到 module-10 的所有短语、句子和单词"""
        modules_content = []

        # 查找 module-01 到 module-10 文件
        module_files = []
        for i in range(1, 11):
            module_num = f"{i:02d}"
            module_file = self.content_dir / f"module-{module_num}-*.json"
            found_files = list(self.content_dir.glob(f"module-{module_num}-*.json"))

            # 排除备份文件
            found_files = [f for f in found_files if not f.name.endswith('.backup')]

            if found_files:
                module_files.extend(found_files)
                print(f"📖 找到模块 {module_num}: {found_files[0].name}")
            else:
                print(f"⚠️ 未找到模块 {module_num}")

        module_files.sort()
        print(f"📚 总共找到 {len(module_files)} 个模块文件")

        for module_file in module_files:
            print(f"📖 处理模块: {module_file.name}")

            try:
                with open(module_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception as e:
                print(f"❌ 读取文件失败 {module_file.name}: {e}")
                continue

            module_id = data.get('moduleId', module_file.stem)
            module_title = data.get('title', module_file.stem)
            self.stats["total_modules"] += 1

            # 收集短语
            for phrase in data.get('phrases', []):
                if 'en' in phrase and 'audio' in phrase:
                    self.stats["total_phrases"] += 1
                    modules_content.append({
                        'module_id': module_id,
                        'module_title': module_title,
                        'type': 'phrase',
                        'id': phrase.get('id', ''),
                        'en': phrase['en'],
                        'zh': phrase.get('zh', ''),
                        'audio_path': phrase['audio'],
                        'file': module_file.name
                    })

            # 收集句子 (patterns)
            for i, pattern in enumerate(data.get('patterns', [])):
                if 'q' in pattern:
                    self.stats["total_patterns"] += 1
                    expected_filename = self.text_to_filename(pattern['q'])
                    audio_path = f"/audio/tts/{expected_filename}"

                    modules_content.append({
                        'module_id': module_id,
                        'module_title': module_title,
                        'type': 'pattern',
                        'id': f"pattern-{i}",
                        'en': pattern['q'],
                        'zh': pattern.get('a', ''),
                        'audio_path': audio_path,
                        'file': module_file.name
                    })

            # 收集单词
            for word in data.get('words', []):
                if 'en' in word and 'audio' in word:
                    self.stats["total_words"] += 1
                    modules_content.append({
                        'module_id': module_id,
                        'module_title': module_title,
                        'type': 'word',
                        'id': word.get('id', ''),
                        'en': word['en'],
                        'zh': word.get('zh', ''),
                        'audio_path': word['audio'],
                        'file': module_file.name
                    })

        print(f"📊 总计收集: {len(modules_content)} 个音频内容")
        print(f"   - 短语: {self.stats['total_phrases']} 个")
        print(f"   - 句子: {self.stats['total_patterns']} 个")
        print(f"   - 单词: {self.stats['total_words']} 个")

        return modules_content

    def check_audio_quality(self, content_items: List[Dict]) -> List[Dict]:
        """检查音频质量"""
        print("\n🎵 开始音频质量检查...")
        print("=" * 60)

        results = []

        for i, item in enumerate(content_items):
            print(f"[{i+1}/{len(content_items)}] 检查: {item['module_id']} - {item['type']} - {item['en'][:50]}...")

            # 提取音频文件名
            if item['audio_path'].startswith('/audio/tts/'):
                filename = item['audio_path'].replace('/audio/tts/', '')
            else:
                filename = Path(item['audio_path']).name

            full_audio_path = self.audio_dir / filename

            # 检查音频文件是否存在
            if not full_audio_path.exists():
                result = {
                    **item,
                    'filename': filename,
                    'status': 'missing',
                    'transcribed_text': '',
                    'similarity': 0.0,
                    'quality': 'missing',
                    'issues': ['音频文件不存在']
                }
                self.stats["missing_files"] += 1
                results.append(result)
                print(f"   ❌ 文件缺失: {filename}")
                continue

            # 转录音频
            transcribed = self.transcribe_audio(full_audio_path)
            if not transcribed:
                result = {
                    **item,
                    'filename': filename,
                    'status': 'transcription_failed',
                    'transcribed_text': '',
                    'similarity': 0.0,
                    'quality': 'failed',
                    'issues': ['Whisper 转录失败']
                }
                self.stats["transcription_failed"] += 1
                results.append(result)
                print(f"   💥 转录失败: {filename}")
                continue

            # 计算相似度
            similarity = self.calculate_similarity(item['en'], transcribed)

            # 评估质量
            if similarity >= 0.9:
                quality = "high"
                self.stats["high_quality"] += 1
            elif similarity >= 0.7:
                quality = "medium"
                self.stats["medium_quality"] += 1
            else:
                quality = "low"
                self.stats["low_quality"] += 1

            # 识别问题
            issues = []
            if similarity < 0.5:
                issues.append("识别准确率极低")
            elif similarity < 0.7:
                issues.append("识别准确率较低")

            if len(transcribed) < len(item['en']) * 0.5:
                issues.append("音频可能被截断")
            elif len(transcribed) > len(item['en']) * 2:
                issues.append("音频可能包含额外内容")

            # 更新统计
            if item['type'] == 'phrase':
                self.stats["checked_phrases"] += 1
            elif item['type'] == 'pattern':
                self.stats["checked_patterns"] += 1
            elif item['type'] == 'word':
                self.stats["checked_words"] += 1

            result = {
                **item,
                'filename': filename,
                'status': 'checked',
                'transcribed_text': transcribed,
                'similarity': round(similarity, 3),
                'quality': quality,
                'issues': issues
            }
            results.append(result)

            print(f"   ✅ 相似度: {similarity:.1%} ({quality})")

            # 避免系统过载
            time.sleep(0.1)

        return results

    def generate_detailed_report(self, results: List[Dict]) -> str:
        """生成详细的质量检查报告"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("📚 Module 01-10 音频质量检查报告")
        report_lines.append("🤖 基于 Whisper ASR 的短语、句子和单词质量分析")
        report_lines.append("=" * 80)
        report_lines.append(f"📅 检查时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"🤖 使用的模型: Whisper Base")
        report_lines.append("")

        # 总体统计
        total_checked = len(results)
        report_lines.append("📊 总体统计:")
        report_lines.append(f"   检查模块数: {self.stats['total_modules']}")
        report_lines.append(f"   短语总数: {self.stats['total_phrases']}")
        report_lines.append(f"   句子总数: {self.stats['total_patterns']}")
        report_lines.append(f"   单词总数: {self.stats['total_words']}")
        report_lines.append(f"   检查完成: {total_checked}")
        report_lines.append(f"   高质量 (≥90%): {self.stats['high_quality']} ({self.stats['high_quality']/total_checked*100:.1f}%)")
        report_lines.append(f"   中等质量 (70-89%): {self.stats['medium_quality']} ({self.stats['medium_quality']/total_checked*100:.1f}%)")
        report_lines.append(f"   低质量 (<70%): {self.stats['low_quality']} ({self.stats['low_quality']/total_checked*100:.1f}%)")
        report_lines.append(f"   文件缺失: {self.stats['missing_files']}")
        report_lines.append(f"   转录失败: {self.stats['transcription_failed']}")
        report_lines.append("")

        # 按模块分组统计
        module_stats = {}
        for result in results:
            module_id = result['module_id']
            if module_id not in module_stats:
                module_stats[module_id] = {
                    'title': result['module_title'],
                    'total': 0,
                    'high': 0,
                    'medium': 0,
                    'low': 0,
                    'missing': 0,
                    'failed': 0
                }

            module_stats[module_id]['total'] += 1
            if result['quality'] == 'high':
                module_stats[module_id]['high'] += 1
            elif result['quality'] == 'medium':
                module_stats[module_id]['medium'] += 1
            elif result['quality'] == 'low':
                module_stats[module_id]['low'] += 1
            elif result['status'] == 'missing':
                module_stats[module_id]['missing'] += 1
            elif result['status'] == 'transcription_failed':
                module_stats[module_id]['failed'] += 1

        report_lines.append("📈 按模块统计:")
        report_lines.append("-" * 80)
        for module_id, stats in module_stats.items():
            success_rate = (stats['high'] + stats['medium']) / stats['total'] * 100 if stats['total'] > 0 else 0
            report_lines.append(f"📁 {module_id} ({stats['title']})")
            report_lines.append(f"   总计: {stats['total']} | 成功率: {success_rate:.1f}%")
            report_lines.append(f"   高质量: {stats['high']} | 中等质量: {stats['medium']} | 低质量: {stats['low']}")
            if stats['missing'] > 0 or stats['failed'] > 0:
                report_lines.append(f"   ⚠️  问题: 缺失{stats['missing']} | 失败{stats['failed']}")
            report_lines.append("")

        # 问题详细列表
        problem_results = [r for r in results if r['quality'] in ['low', 'missing', 'failed']]

        if problem_results:
            report_lines.append("⚠️ 需要关注的音频文件:")
            report_lines.append("-" * 80)

            # 按相似度排序
            problem_results.sort(key=lambda x: x['similarity'] if 'similarity' in x else 0)

            for result in problem_results[:30]:  # 只显示前30个问题
                status_icon = {
                    "low": "🔴",
                    "missing": "❌",
                    "failed": "💥"
                }.get(result['quality'], "❓")

                report_lines.append(f"{status_icon} {result['module_id']} ({result['type']})")
                report_lines.append(f"   📄 文件: {result['filename']}")
                report_lines.append(f"   📝 原文: '{result['en']}'")
                report_lines.append(f"   🔊 识别: '{result.get('transcribed_text', 'N/A')}'")

                if 'similarity' in result:
                    report_lines.append(f"   📊 相似度: {result['similarity']:.1%}")

                if result.get('issues'):
                    for issue in result['issues']:
                        report_lines.append(f"   ⚠️  {issue}")
                report_lines.append("")

        # 高质量示例
        high_quality_results = [r for r in results if r['quality'] == 'high']
        if high_quality_results:
            report_lines.append("✅ 高质量音频示例:")
            report_lines.append("-" * 80)

            for result in high_quality_results[:10]:  # 显示前10个高质量示例
                report_lines.append(f"📁 {result['module_id']} ({result['type']})")
                report_lines.append(f"   📝 原文: '{result['en']}'")
                report_lines.append(f"   🔊 识别: '{result['transcribed_text']}'")
                report_lines.append(f"   📊 相似度: {result['similarity']:.1%}")
                report_lines.append("")

        # 建议和总结
        report_lines.append("💡 建议:")
        report_lines.append("-" * 80)

        if self.stats['low_quality'] > 0:
            report_lines.append(f"🔄 重新生成 {self.stats['low_quality']} 个低质量音频文件")

        if self.stats['missing_files'] > 0:
            report_lines.append(f"📝 生成 {self.stats['missing_files']} 个缺失的音频文件")

        if self.stats['transcription_failed'] > 0:
            report_lines.append(f"🔧 检查 {self.stats['transcription_failed']} 个转录失败的音频文件")

        success_rate = (self.stats['high_quality'] + self.stats['medium_quality']) / total_checked * 100 if total_checked > 0 else 0
        if success_rate >= 90:
            report_lines.append("🎉 音频质量优秀，系统运行良好")
        elif success_rate >= 75:
            report_lines.append("🟡 音频质量良好，建议优化低质量文件")
        else:
            report_lines.append("🔴 音频质量需要改进，建议系统检查")

        report_lines.append("")
        report_lines.append("=" * 80)

        return "\n".join(report_lines)

    def save_detailed_report(self, report: str, filename: str = "modules_01_10_audio_quality_report.txt"):
        """保存详细报告到文件"""
        report_file = self.project_root / filename
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 详细报告已保存到: {report_file}")

    def save_json_report(self, results: List[Dict], filename: str = "modules_01_10_audio_quality_data.json"):
        """保存 JSON 格式的详细数据"""
        report_file = self.project_root / filename
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'stats': self.stats,
                'results': results
            }, f, indent=2, ensure_ascii=False)
        print(f"📊 JSON 数据已保存到: {report_file}")

    def run(self):
        """运行完整的检查流程"""
        print("🎵 Module 01-10 音频质量检查器启动")
        print(f"📁 项目目录: {self.project_root}")
        print(f"🎵 音频目录: {self.audio_dir}")
        print("=" * 60)

        try:
            # 1. 收集所有 Module 01-10 内容
            content_items = self.collect_modules_content()

            if not content_items:
                print("❌ 未找到任何 Module 01-10 内容")
                return

            # 2. 检查音频质量
            results = self.check_audio_quality(content_items)

            # 3. 生成和保存报告
            print("\n📊 生成检查报告...")
            report = self.generate_detailed_report(results)

            # 打印报告摘要
            print("\n" + report)

            # 保存文件
            self.save_detailed_report(report)
            self.save_json_report(results)

            print(f"✅ 检查完成！共检查了 {len(results)} 个音频文件")

        except Exception as e:
            print(f"❌ 检查流程失败: {e}")
            raise

def main():
    """主函数"""
    checker = Modules01To10AudioQualityChecker()
    checker.run()

if __name__ == "__main__":
    main()