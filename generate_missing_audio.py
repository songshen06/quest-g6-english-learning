#!/usr/bin/env python3
"""
批量生成缺失的音频文件
使用Coqui TTS生成所有缺失的音频文件
"""

import os
import json
import sys
import subprocess
import tempfile
import time
from pathlib import Path
from typing import List, Dict
from pydub import AudioSegment

class CoquiAudioGenerator:
    def __init__(self):
        self.project_root = Path(".")
        self.output_dir = Path("public/audio/tts")
        self.temp_dir = Path("temp_coqui_generation")
        self.temp_dir.mkdir(exist_ok=True)

        # Coqui TTS路径
        self.tts_path = "/Users/shens/miniconda3/bin/tts"

        # 统计信息
        self.stats = {
            "total": 0,
            "generated": 0,
            "skipped": 0,
            "failed": 0,
            "errors": []
        }

    def load_missing_files(self) -> List[Dict]:
        """加载缺失文件列表"""
        missing_file = Path("missing_audio_files.json")
        if not missing_file.exists():
            print(f"❌ 缺失文件列表不存在: {missing_file}")
            print("请先运行 check_missing_audio.py 生成缺失文件列表")
            return []

        try:
            with open(missing_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"📋 加载了 {len(data)} 个缺失音频文件")
            return data
        except Exception as e:
            print(f"❌ 加载缺失文件列表失败: {e}")
            return []

    def generate_coqui_tts(self, filename: str, text: str) -> bool:
        """使用Coqui TTS生成单个音频文件"""
        output_path = self.output_dir / filename
        temp_wav = self.temp_dir / f"temp_{output_path.stem}.wav"

        # 检查是否已存在
        if output_path.exists():
            print(f"⏭️ 跳过已存在: {filename}")
            self.stats["skipped"] += 1
            return True

        try:
            # 构建Coqui TTS命令
            cmd = [
                self.tts_path,
                "--model_name", "tts_models/en/ljspeech/vits",
                "--text", f'"{text}"',
                "--out_path", str(temp_wav)
            ]

            # 执行TTS命令
            result = subprocess.run(" ".join(cmd), shell=True, check=True,
                                  capture_output=True, text=True, timeout=30)

            if temp_wav.exists():
                # 音频后处理
                self._post_process_audio(temp_wav, output_path)

                # 清理临时文件
                if temp_wav.exists():
                    temp_wav.unlink()

                print(f"✅ 生成成功: {filename}")
                self.stats["generated"] += 1
                return True
            else:
                print(f"❌ 生成失败: {filename} - 输出文件不存在")
                self.stats["failed"] += 1
                return False

        except subprocess.TimeoutExpired:
            print(f"❌ 生成超时: {filename}")
            self.stats["failed"] += 1
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ 生成失败 {filename}: {e}")
            self.stats["failed"] += 1
            return False
        except Exception as e:
            print(f"❌ 生成异常 {filename}: {e}")
            self.stats["failed"] += 1
            return False

    def _post_process_audio(self, input_path: Path, output_path: Path):
        """音频后处理"""
        try:
            audio = AudioSegment.from_file(str(input_path))

            # 标准化音量
            audio = audio.normalize()

            # 添加淡入淡出
            audio = audio.fade_in(100).fade_out(100)

            # 适合小学生的音量调整
            audio = audio - 2  # 降低2dB

            # 导出为MP3
            audio.export(str(output_path), format="mp3", bitrate="128k")

        except Exception as e:
            print(f"⚠️ 音频后处理失败: {e}")
            # 如果后处理失败，直接复制文件并转换格式
            import shutil
            try:
                audio = AudioSegment.from_file(str(input_path))
                audio.export(str(output_path), format="mp3", bitrate="128k")
            except:
                shutil.copy2(input_path, output_path.with_suffix('.wav'))
                output_path = output_path.with_suffix('.wav')

    def generate_all_missing_audio(self, missing_files: List[Dict]):
        """批量生成所有缺失的音频文件"""
        if not missing_files:
            print("✅ 没有缺失的音频文件需要生成")
            return

        print(f"🚀 开始生成 {len(missing_files)} 个缺失的音频文件...")
        print("=" * 60)

        self.stats["total"] = len(missing_files)

        # 按类型分组优先处理
        words = [f for f in missing_files if f.get('type') == 'word']
        phrases = [f for f in missing_files if f.get('type') == 'phrase']
        quests = [f for f in missing_files if f.get('type') == 'quest']

        # 生成顺序：单词 -> 短语 -> 任务
        all_files = words + phrases + quests

        for i, item in enumerate(all_files):
            filename = item['filename']
            text = item['text']
            source = item.get('source', 'unknown')
            type_ = item.get('type', 'unknown')

            print(f"[{i+1}/{len(all_files)}] {filename}")
            print(f"   类型: {type_} | 文本: '{text}' | 来源: {source}")

            # 过滤中文文本，只生成英文音频
            if self._is_chinese_text(text):
                print(f"⏭️ 跳过中文文本: {filename}")
                self.stats["skipped"] += 1
                print()
                continue

            # 生成音频
            if self.generate_coqui_tts(filename, text):
                # 成功
                pass
            else:
                error_msg = f"生成失败: {filename} - {text}"
                self.stats["errors"].append(error_msg)

            print()

            # 避免系统过载
            time.sleep(0.2)

    def _is_chinese_text(self, text: str) -> bool:
        """检查文本是否包含中文字符"""
        if not text:
            return False
        return any('\u4e00' <= char <= '\u9fff' for char in text)

    def print_summary(self):
        """打印生成摘要"""
        print("=" * 60)
        print(f"🎉 音频生成完成!")
        print(f"📊 统计摘要:")
        print(f"   总计: {self.stats['total']}")
        print(f"   生成: {self.stats['generated']}")
        print(f"   跳过: {self.stats['skipped']}")
        print(f"   失败: {self.stats['failed']}")
        print(f"   成功率: {(self.stats['generated'] / max(self.stats['total'], 1)) * 100:.1f}%")

        if self.stats["errors"]:
            print(f"\n❌ 错误信息 (前5个):")
            for error in self.stats["errors"][:5]:
                print(f"   - {error}")

        print("=" * 60)

    def cleanup(self):
        """清理临时文件"""
        try:
            if self.temp_dir.exists():
                import shutil
                shutil.rmtree(self.temp_dir)
                print("🧹 临时文件已清理")
        except Exception as e:
            print(f"⚠️ 清理失败: {e}")

    def run(self):
        """运行主流程"""
        try:
            print("🎵 Coqui TTS 音频生成器启动")
            print(f"📁 项目: {self.project_root}")
            print(f"📁 输出目录: {self.output_dir}")

            # 确保输出目录存在
            self.output_dir.mkdir(parents=True, exist_ok=True)

            # 加载缺失文件列表
            missing_files = self.load_missing_files()
            if not missing_files:
                return

            # 批量生成音频
            self.generate_all_missing_audio(missing_files)

            # 打印摘要
            self.print_summary()

        except Exception as e:
            print(f"❌ 主流程失败: {e}")
            raise
        finally:
            self.cleanup()

def main():
    """主函数"""
    generator = CoquiAudioGenerator()
    generator.run()

if __name__ == "__main__":
    main()