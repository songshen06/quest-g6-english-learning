#!/usr/bin/env python3
"""
统一的音频质量检查脚本
使用Whisper ASR检查音频质量，支持多种检查模式
"""

import json
import time
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

from ..utils.common import (
    load_json_files, extract_text_from_json, get_audio_filename_from_path,
    calculate_similarity, print_progress, generate_timestamp, get_audio_file_info,
    load_whisper_model, format_duration, format_file_size
)
from ..utils.config import config

@dataclass
class CheckResult:
    """检查结果"""
    module_id: str
    module_title: str
    item_type: str
    item_id: str
    text: str
    zh: str
    audio_path: str
    filename: str
    status: str  # missing, failed, checked
    transcribed_text: str = ""
    similarity: float = 0.0
    quality: str = ""  # high, medium, low
    issues: List[str] = None
    audio_info: Optional[Dict] = None

    def __post_init__(self):
        if self.issues is None:
            self.issues = []

class AudioQualityChecker:
    """音频质量检查器"""

    def __init__(self):
        self.audio_dir = config.get_audio_dir()
        self.reports_dir = config.get_reports_dir()
        self.whisper_model = None

        # 统计信息
        self.stats = {
            "total_items": 0,
            "checked_items": 0,
            "high_quality": 0,
            "medium_quality": 0,
            "low_quality": 0,
            "missing_files": 0,
            "transcription_failed": 0,
            "invalid_files": 0,
            "check_duration": 0
        }

    def load_whisper_model(self):
        """加载Whisper模型"""
        self.whisper_model = load_whisper_model()
        return self.whisper_model is not None

    def transcribe_audio(self, audio_path: Path) -> str:
        """使用Whisper转录音频"""
        if not self.whisper_model:
            return ""

        try:
            result = self.whisper_model.transcribe(
                str(audio_path),
                fp16=False,
                language='en'  # 指定为英语
            )
            return result['text'].strip()
        except Exception as e:
            print(f"❌ 转录失败 {audio_path.name}: {e}")
            return ""

    def check_audio_file(self, item: Dict) -> CheckResult:
        """检查单个音频文件"""
        # 提取文件名
        filename = get_audio_filename_from_path(item['audio_path'])
        full_audio_path = self.audio_dir / filename

        result = CheckResult(
            module_id=item['module_id'],
            module_title=item['module_title'],
            item_type=item['type'],
            item_id=item['id'],
            text=item['text'],
            zh=item['zh'],
            audio_path=item['audio_path'],
            filename=filename,
            status='missing'
        )

        # 检查文件是否存在
        if not full_audio_path.exists():
            result.issues.append('音频文件不存在')
            self.stats["missing_files"] += 1
            return result

        # 获取音频文件信息
        audio_info = get_audio_file_info(full_audio_path)
        result.audio_info = {
            'size': audio_info.size,
            'duration': audio_info.duration,
            'format': audio_info.format
        }

        # 检查文件有效性
        if not audio_info.is_valid:
            result.status = 'invalid'
            result.issues.append(audio_info.error_message or '文件无效')
            self.stats["invalid_files"] += 1
            return result

        # 转录音频
        transcribed = self.transcribe_audio(full_audio_path)
        if not transcribed:
            result.status = 'failed'
            result.issues.append('Whisper转录失败')
            self.stats["transcription_failed"] += 1
            return result

        # 计算相似度
        similarity = calculate_similarity(item['text'], transcribed)
        result.transcribed_text = transcribed
        result.similarity = round(similarity, 3)

        # 评估质量
        if similarity >= config.asr.similarity_threshold_high:
            result.quality = "high"
            self.stats["high_quality"] += 1
        elif similarity >= config.asr.similarity_threshold_medium:
            result.quality = "medium"
            self.stats["medium_quality"] += 1
        else:
            result.quality = "low"
            self.stats["low_quality"] += 1

        # 识别问题
        if similarity < 0.5:
            result.issues.append("识别准确率极低")
        elif similarity < config.asr.similarity_threshold_medium:
            result.issues.append("识别准确率较低")

        if audio_info.duration:
            if audio_info.duration < 0.5:
                result.issues.append("音频时长过短")
            elif audio_info.duration > len(item['text']) * 0.3 + 2:
                result.issues.append("音频时长可能过长")

        result.status = 'checked'
        self.stats["checked_items"] += 1

        return result

    def check_pattern(self, pattern: str) -> List[CheckResult]:
        """
        根据模式检查音频质量

        Args:
            pattern: 文件匹配模式，如 "grade6-*.json", "module-01-*.json"

        Returns:
            检查结果列表
        """
        print(f"🔍 正在搜索匹配模式: {pattern}")

        # 加载匹配的JSON文件
        contents = load_json_files(pattern)
        if not contents:
            print(f"❌ 未找到匹配 '{pattern}' 的文件")
            return []

        print(f"📚 找到 {len(contents)} 个文件")

        # 提取所有需要检查的文本项
        items = []
        for content in contents:
            if not content.get('moduleId') or not content.get('title'):
                print(f"⚠️ 跳过无效文件: {content.get('_filename', 'unknown')}")
                continue

            content_items = extract_text_from_json(content)
            items.extend(content_items)

        if not items:
            print("❌ 未找到需要检查的音频内容")
            return []

        print(f"📊 总计需要检查: {len(items)} 个音频项")

        self.stats["total_items"] = len(items)

        # 检查音频质量
        results = []
        start_time = time.time()

        for i, item in enumerate(items):
            print_progress(i + 1, len(items), "检查进度", f"{item['module_id']} - {item['type']}")
            result = self.check_audio_file(item)
            results.append(result)

            # 避免系统过载
            time.sleep(0.1)

        self.stats["check_duration"] = time.time() - start_time

        return results

    def generate_report(self, results: List[CheckResult], pattern: str) -> str:
        """生成检查报告"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("🎵 音频质量检查报告")
        report_lines.append("🤖 基于 Whisper ASR 的音频质量分析")
        report_lines.append("=" * 80)
        report_lines.append(f"📅 检查时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"🎯 检查模式: {pattern}")
        report_lines.append(f"🤖 Whisper模型: {config.asr.whisper_model}")
        report_lines.append(f"⏱️  检查耗时: {format_duration(self.stats['check_duration'])}")
        report_lines.append("")

        # 总体统计
        total = len(results)
        success_rate = (self.stats["high_quality"] + self.stats["medium_quality"]) / total * 100 if total > 0 else 0

        report_lines.append("📊 总体统计:")
        report_lines.append(f"   总项目数: {total}")
        report_lines.append(f"   检查完成: {self.stats['checked_items']}")
        report_lines.append(f"   高质量 (≥{config.asr.similarity_threshold_high*100:.0f}%): {self.stats['high_quality']} ({self.stats['high_quality']/total*100:.1f}%)")
        report_lines.append(f"   中等质量 ({config.asr.similarity_threshold_medium*100:.0f}%-{config.asr.similarity_threshold_high*100:.0f}%): {self.stats['medium_quality']} ({self.stats['medium_quality']/total*100:.1f}%)")
        report_lines.append(f"   低质量 (<{config.asr.similarity_threshold_medium*100:.0f}%): {self.stats['low_quality']} ({self.stats['low_quality']/total*100:.1f}%)")
        report_lines.append(f"   文件缺失: {self.stats['missing_files']}")
        report_lines.append(f"   转录失败: {self.stats['transcription_failed']}")
        report_lines.append(f"   文件无效: {self.stats['invalid_files']}")
        report_lines.append(f"   成功率: {success_rate:.1f}%")
        report_lines.append("")

        # 按模块统计
        module_stats = {}
        for result in results:
            module_id = result.module_id
            if module_id not in module_stats:
                module_stats[module_id] = {
                    'title': result.module_title,
                    'total': 0,
                    'high': 0,
                    'medium': 0,
                    'low': 0,
                    'missing': 0,
                    'failed': 0,
                    'invalid': 0
                }

            module_stats[module_id]['total'] += 1
            if result.quality == 'high':
                module_stats[module_id]['high'] += 1
            elif result.quality == 'medium':
                module_stats[module_id]['medium'] += 1
            elif result.quality == 'low':
                module_stats[module_id]['low'] += 1
            elif result.status == 'missing':
                module_stats[module_id]['missing'] += 1
            elif result.status == 'failed':
                module_stats[module_id]['failed'] += 1
            elif result.status == 'invalid':
                module_stats[module_id]['invalid'] += 1

        report_lines.append("📈 按模块统计:")
        report_lines.append("-" * 80)
        for module_id, stats in module_stats.items():
            module_success_rate = (stats['high'] + stats['medium']) / stats['total'] * 100 if stats['total'] > 0 else 0
            report_lines.append(f"📁 {module_id} ({stats['title']})")
            report_lines.append(f"   总计: {stats['total']} | 成功率: {module_success_rate:.1f}%")
            report_lines.append(f"   高质量: {stats['high']} | 中等质量: {stats['medium']} | 低质量: {stats['low']}")
            if stats['missing'] > 0 or stats['failed'] > 0 or stats['invalid'] > 0:
                report_lines.append(f"   ⚠️  问题: 缺失{stats['missing']} | 失败{stats['failed']} | 无效{stats['invalid']}")
            report_lines.append("")

        # 问题文件列表
        problem_results = [r for r in results if r.quality in ['low'] or r.status in ['missing', 'failed', 'invalid']]

        if problem_results:
            report_lines.append("⚠️ 需要关注的音频文件:")
            report_lines.append("-" * 80)

            # 按相似度排序
            problem_results.sort(key=lambda x: x.similarity)

            for result in problem_results[:30]:  # 只显示前30个问题
                status_icon = {
                    "low": "🔴",
                    "missing": "❌",
                    "failed": "💥",
                    "invalid": "⚠️"
                }.get(result.status, "❓")

                report_lines.append(f"{status_icon} {result.module_id} ({result.item_type})")
                report_lines.append(f"   📄 文件: {result.filename}")
                report_lines.append(f"   📝 原文: '{result.text}'")
                transcribed_text = result.transcribed_text if result.transcribed_text else 'N/A'
                report_lines.append(f"   🔊 识别: '{transcribed_text}'")

                if result.similarity > 0:
                    report_lines.append(f"   📊 相似度: {result.similarity:.1%}")

                if result.audio_info and result.audio_info.get('duration'):
                    report_lines.append(f"   ⏱️  时长: {format_duration(result.audio_info['duration'])}")

                if result.issues:
                    for issue in result.issues:
                        report_lines.append(f"   ⚠️  {issue}")
                report_lines.append("")

        # 高质量示例
        high_quality_results = [r for r in results if r.quality == 'high']
        if high_quality_results:
            report_lines.append("✅ 高质量音频示例:")
            report_lines.append("-" * 80)

            for result in high_quality_results[:10]:  # 显示前10个高质量示例
                report_lines.append(f"📁 {result.module_id} ({result.item_type})")
                report_lines.append(f"   📝 原文: '{result.text}'")
                report_lines.append(f"   🔊 识别: '{result.transcribed_text}'")
                report_lines.append(f"   📊 相似度: {result.similarity:.1%}")
                if result.audio_info and result.audio_info.get('duration'):
                    report_lines.append(f"   ⏱️  时长: {format_duration(result.audio_info['duration'])}")
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

        if self.stats['invalid_files'] > 0:
            report_lines.append(f"🔧 修复 {self.stats['invalid_files']} 个无效音频文件")

        if success_rate >= 90:
            report_lines.append("🎉 音频质量优秀，系统运行良好")
        elif success_rate >= 75:
            report_lines.append("🟡 音频质量良好，建议优化低质量文件")
        else:
            report_lines.append("🔴 音频质量需要改进，建议系统检查")

        report_lines.append("")
        report_lines.append("=" * 80)

        return "\n".join(report_lines)

    def save_report(self, report: str, results: List[CheckResult], pattern: str):
        """保存报告到文件"""
        timestamp = generate_timestamp()
        pattern_safe = pattern.replace('*', 'all').replace('?', 'any')
        report_filename = f"audio_quality_report_{pattern_safe}_{timestamp}.txt"
        json_filename = f"audio_quality_data_{pattern_safe}_{timestamp}.json"

        # 保存文本报告
        report_file = self.reports_dir / report_filename
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 文本报告已保存到: {report_file}")

        # 保存JSON数据
        json_file = self.reports_dir / json_filename
        json_data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'pattern': pattern,
            'config': {
                'whisper_model': config.asr.whisper_model,
                'high_threshold': config.asr.similarity_threshold_high,
                'medium_threshold': config.asr.similarity_threshold_medium
            },
            'stats': self.stats,
            'results': [
                {
                    'module_id': r.module_id,
                    'module_title': r.module_title,
                    'item_type': r.item_type,
                    'item_id': r.item_id,
                    'text': r.text,
                    'zh': r.zh,
                    'audio_path': r.audio_path,
                    'filename': r.filename,
                    'status': r.status,
                    'transcribed_text': r.transcribed_text,
                    'similarity': r.similarity,
                    'quality': r.quality,
                    'issues': r.issues,
                    'audio_info': r.audio_info
                } for r in results
            ]
        }

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        print(f"📊 JSON数据已保存到: {json_file}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="音频质量检查工具")
    parser.add_argument("pattern", help="文件匹配模式，如 'grade6-*.json', 'module-01-*.json'")
    parser.add_argument("--config", help="配置文件路径")
    parser.add_argument("--model", default=None, help="Whisper模型 (tiny, base, small, medium, large)")
    parser.add_argument("--quiet", action="store_true", help="静默模式，只输出摘要")
    parser.add_argument("--device", help="设备 (cpu, cuda, auto)")

    args = parser.parse_args()

    # 加载配置
    if args.config:
        config.load_from_file(args.config)

    # 更新配置
    if args.model:
        config.asr.whisper_model = args.model
    if args.device:
        config.asr.device = args.device

    print("🎵 音频质量检查器启动")
    print(f"📁 项目目录: {config.project_root}")
    print(f"🎵 音频目录: {config.get_audio_dir()}")
    print(f"📄 报告目录: {config.get_reports_dir()}")
    print("=" * 60)

    # 创建检查器
    checker = AudioQualityChecker()

    # 加载Whisper模型
    if not checker.load_whisper_model():
        print("❌ 无法加载Whisper模型，程序退出")
        return

    try:
        # 执行检查
        results = checker.check_pattern(args.pattern)

        if not results:
            print("❌ 没有找到需要检查的内容")
            return

        # 生成报告
        print(f"\n📊 生成检查报告...")
        report = checker.generate_report(results, args.pattern)

        # 打印报告摘要
        if not args.quiet:
            print("\n" + report)

        # 保存报告
        checker.save_report(report, results, args.pattern)

        print(f"✅ 检查完成！共检查了 {len(results)} 个音频项")

    except KeyboardInterrupt:
        print("\n⚠️ 检查被用户中断")
    except Exception as e:
        print(f"❌ 检查过程中发生错误: {e}")
        raise

if __name__ == "__main__":
    main()