#!/usr/bin/env python3
"""
快速音频质量检查脚本
基于 Whisper ASR 的简化版本，专门检查音频质量问题
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

class QuickAudioChecker:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.content_dir = self.project_root / "src" / "content"
        self.audio_dir = self.project_root / "public" / "audio" / "tts"

        # 初始化 Whisper 模型
        print("🤖 加载 Whisper 模型...")
        self.model = whisper.load_model("base")

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
            return ""

    def quick_check_specific_files(self, target_files: List[str]) -> List[Dict]:
        """快速检查指定的音频文件"""
        results = []

        for filename in target_files:
            full_path = self.audio_dir / filename
            if not full_path.exists():
                results.append({
                    "filename": filename,
                    "status": "missing",
                    "original_text": "Unknown",
                    "transcribed_text": "",
                    "similarity": 0.0,
                    "quality": "missing"
                })
                continue

            # 转录音频
            transcribed = self.transcribe_audio(full_path)
            if not transcribed:
                results.append({
                    "filename": filename,
                    "status": "failed",
                    "original_text": "Unknown",
                    "transcribed_text": "",
                    "similarity": 0.0,
                    "quality": "failed"
                })
                continue

            # 从文件名推断原文（简单版本）
            original_text = filename.replace('-', ' ').replace('.mp3', '').title()

            # 计算相似度
            similarity = self.calculate_similarity(original_text, transcribed)

            if similarity >= 0.9:
                quality = "high"
            elif similarity >= 0.7:
                quality = "medium"
            else:
                quality = "low"

            results.append({
                "filename": filename,
                "status": "checked",
                "original_text": original_text,
                "transcribed_text": transcribed,
                "similarity": round(similarity, 3),
                "quality": quality
            })

        return results

    def run_quick_check(self, module_name: str = None):
        """运行快速检查"""
        print("🎵 快速音频质量检查")
        print("=" * 50)

        # 根据模块名选择要检查的文件
        if module_name == "stamps":
            target_files = [
                "the-five-finger-mountain.mp3",
                "a-coconut-tree.mp3",
                "at-all.mp3",
                "put-into.mp3",
                "hainan-island.mp3"
            ]
        elif module_name == "festivals":
            target_files = [
                "what-do-you-do-on-thanksgiving-day.mp3",
                "we-always-have-a-big-special-dinner.mp3",
                "very-important-festival.mp3",
                "be-important-to-sb.mp3",
                "on-the-25th-of-december.mp3"
            ]
        elif module_name == "habits":
            target_files = [
                "do-you-often-read-stories.mp3",
                "yes-i-read-stories-every-day.mp3",
                "tidy.mp3",
                "tidy-toms-bed.mp3",
                "coin.mp3"
            ]
        elif module_name == "ordering-food":
            target_files = [
                "what-do-you-want-to-eat.mp3",
                "i-want-a-hot-dog-please.mp3",
                "what-do-you-want.mp3",
                "i-want-a-hamburger.mp3",
                "hot-dog.mp3",
                "its-thirteen-dollars-and-twenty-five-cents.mp3"
            ]
        elif module_name == "past-events":
            target_files = [
                "were.mp3",
                "birthday-party.mp3",
                "dear.mp3",
                "soon.mp3",
                "friend.mp3"
            ]
        else:
            print("请指定模块: stamps, festivals, habits, ordering-food, 或 past-events")
            return

        print(f"📁 检查模块: {module_name}")
        print(f"📋 检查 {len(target_files)} 个文件")
        print()

        results = self.quick_check_specific_files(target_files)

        # 生成快速报告
        print("📊 检查结果:")
        print("-" * 50)

        high_count = 0
        medium_count = 0
        low_count = 0
        missing_count = 0
        failed_count = 0

        for result in results:
            status_icon = {
                "high": "✅",
                "medium": "🟡",
                "low": "🔴",
                "missing": "❌",
                "failed": "💥"
            }.get(result['quality'], "❓")

            print(f"{status_icon} {result['filename']}")
            print(f"   原文: {result['original_text']}")
            print(f"   识别: {result['transcribed_text']}")
            print(f"   相似度: {result['similarity']:.1%}")
            print()

            # 统计
            if result['quality'] == 'high':
                high_count += 1
            elif result['quality'] == 'medium':
                medium_count += 1
            elif result['quality'] == 'low':
                low_count += 1
            elif result['status'] == 'missing':
                missing_count += 1
            elif result['status'] == 'failed':
                failed_count += 1

        # 摘要
        total = len(results)
        print("📈 摘要:")
        print(f"   高质量 (≥90%): {high_count}/{total}")
        print(f"   中等质量 (70-89%): {medium_count}/{total}")
        print(f"   低质量 (<70%): {low_count}/{total}")
        print(f"   缺失: {missing_count}/{total}")
        print(f"   失败: {failed_count}/{total}")

        if low_count > 0 or missing_count > 0:
            print(f"\n⚠️ 发现 {low_count + missing_count} 个问题需要修复")

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="快速音频质量检查")
    parser.add_argument("module",
                       choices=["stamps", "festivals", "habits", "ordering-food", "past-events"],
                       help="要检查的模块")

    args = parser.parse_args()

    checker = QuickAudioChecker()
    checker.run_quick_check(args.module)

if __name__ == "__main__":
    main()