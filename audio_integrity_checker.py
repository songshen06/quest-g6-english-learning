#!/usr/bin/env python3
"""
音频文件完整性检测程序
检测MP3文件的完整性、质量和基本信息
"""

import os
import json
import sys
import time
import struct
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False
    print("⚠️ pydub 未安装，部分检测功能将被禁用")

@dataclass
class AudioFileInfo:
    """音频文件信息"""
    filename: str
    filepath: str
    size: int
    is_valid: bool
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: Optional[int] = None
    bitrate: Optional[int] = None
    format: Optional[str] = None
    error_message: Optional[str] = None
    corruption_type: Optional[str] = None

class AudioIntegrityChecker:
    """音频文件完整性检测器"""

    def __init__(self, audio_dir: str = "public/audio/tts"):
        self.audio_dir = Path(audio_dir)
        self.stats = {
            "total_files": 0,
            "valid_files": 0,
            "invalid_files": 0,
            "corrupted_files": 0,
            "empty_files": 0,
            "too_small_files": 0,
            "format_errors": 0,
            "read_errors": 0,
            "check_duration": 0,
            "errors": []
        }

    def check_mp3_header(self, filepath: Path) -> Tuple[bool, Optional[str]]:
        """检查MP3文件头"""
        try:
            with open(filepath, 'rb') as f:
                # 读取前3个字节检查MP3标识
                header = f.read(3)

                if len(header) < 3:
                    return False, "文件太小，无法读取文件头"

                # 检查MP3文件签名
                mp3_signatures = [
                    b'ID3',  # ID3v2 tag
                    b'\xff\xfb',  # MPEG-1 Layer 3
                    b'\xff\xf3',  # MPEG-2 Layer 3
                    b'\xff\xf2',  # MPEG-2.5 Layer 3
                ]

                is_valid = False
                for signature in mp3_signatures:
                    if header.startswith(signature):
                        is_valid = True
                        break

                if not is_valid:
                    return False, "无效的MP3文件签名"

                return True, None

        except Exception as e:
            return False, f"读取文件头失败: {e}"

    def check_file_size(self, filepath: Path) -> Tuple[bool, Optional[str]]:
        """检查文件大小"""
        try:
            size = filepath.stat().st_size

            if size == 0:
                return False, "空文件"
            elif size < 1024:  # 小于1KB
                return False, "文件过小，可能不完整"
            elif size < 4096:  # 小于4KB
                return False, "文件很小，可能损坏"

            return True, None

        except Exception as e:
            return False, f"检查文件大小失败: {e}"

    def analyze_audio_with_pydub(self, filepath: Path) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """使用pydub分析音频文件"""
        if not PYDUB_AVAILABLE:
            return False, None, "pydub未安装"

        try:
            audio = AudioSegment.from_file(str(filepath))

            info = {
                "duration": len(audio) / 1000.0,  # 转换为秒
                "sample_rate": audio.frame_rate,
                "channels": audio.channels,
                "frame_width": audio.frame_width,
                "frame_count": audio.frame_count,
                "max_dBFS": audio.max_dBFS,
                "dBFS": audio.dBFS
            }

            # 检查音频是否异常
            if info["duration"] <= 0:
                return False, info, "音频时长为0"
            elif info["duration"] < 0.1:  # 小于0.1秒
                return False, info, "音频时长过短"
            elif info["max_dBFS"] == -float('inf'):
                return False, info, "音频无声音（静音）"

            return True, info, None

        except Exception as e:
            return False, None, f"音频分析失败: {e}"

    def check_single_file(self, filepath: Path) -> AudioFileInfo:
        """检查单个音频文件"""
        filename = filepath.name

        # 基本文件信息
        try:
            size = filepath.stat().st_size
        except Exception as e:
            return AudioFileInfo(
                filename=filename,
                filepath=str(filepath),
                size=0,
                is_valid=False,
                error_message=f"无法访问文件: {e}",
                corruption_type="access_error"
            )

        # 初始化文件信息
        file_info = AudioFileInfo(
            filename=filename,
            filepath=str(filepath),
            size=size,
            is_valid=False
        )

        # 检查文件大小
        size_valid, size_error = self.check_file_size(filepath)
        if not size_valid:
            file_info.error_message = size_error
            file_info.corruption_type = "size_error"
            if "空文件" in size_error:
                self.stats["empty_files"] += 1
            elif "文件过小" in size_error:
                self.stats["too_small_files"] += 1
            return file_info

        # 检查MP3文件头
        header_valid, header_error = self.check_mp3_header(filepath)
        if not header_valid:
            file_info.error_message = header_error
            file_info.corruption_type = "header_error"
            self.stats["format_errors"] += 1
            return file_info

        # 使用pydub进行深度分析
        if PYDUB_AVAILABLE:
            audio_valid, audio_info, audio_error = self.analyze_audio_with_pydub(filepath)
            if audio_valid and audio_info:
                file_info.duration = audio_info["duration"]
                file_info.sample_rate = audio_info["sample_rate"]
                file_info.channels = audio_info["channels"]
                file_info.format = "MP3"
                file_info.bitrate = int((size * 8) / (audio_info["duration"] * 1000)) if audio_info["duration"] > 0 else None
                file_info.is_valid = True
            else:
                file_info.error_message = audio_error
                file_info.corruption_type = "audio_error"
                self.stats["corrupted_files"] += 1
        else:
            # 如果没有pydub，只做基本检查
            file_info.is_valid = header_valid and size_valid
            file_info.format = "MP3"

        return file_info

    def scan_all_files(self) -> List[AudioFileInfo]:
        """扫描所有音频文件"""
        if not self.audio_dir.exists():
            print(f"❌ 音频目录不存在: {self.audio_dir}")
            return []

        mp3_files = list(self.audio_dir.glob("*.mp3"))
        if not mp3_files:
            print(f"❌ 目录中没有找到MP3文件: {self.audio_dir}")
            return []

        print(f"🔍 开始检测 {len(mp3_files)} 个MP3文件...")
        print("=" * 60)

        results = []
        start_time = time.time()

        for i, filepath in enumerate(mp3_files):
            print(f"[{i+1:3d}/{len(mp3_files)}] 检测: {filepath.name}")

            file_info = self.check_single_file(filepath)
            results.append(file_info)

            # 更新统计
            self.stats["total_files"] += 1
            if file_info.is_valid:
                self.stats["valid_files"] += 1
                print(f"   ✅ 正常 ({file_info.duration:.2f}s, {file_info.sample_rate}Hz)")
            else:
                self.stats["invalid_files"] += 1
                if file_info.corruption_type == "access_error":
                    self.stats["read_errors"] += 1
                print(f"   ❌ {file_info.error_message}")

            # 避免输出过多，每10个文件显示一次进度
            if (i + 1) % 10 == 0:
                progress = (i + 1) / len(mp3_files) * 100
                print(f"   进度: {progress:.1f}% ({i+1}/{len(mp3_files)})")

        self.stats["check_duration"] = time.time() - start_time
        return results

    def generate_report(self, results: List[AudioFileInfo]) -> Dict:
        """生成检测报告"""
        valid_files = [f for f in results if f.is_valid]
        invalid_files = [f for f in results if not f.is_valid]

        # 分析损坏类型
        corruption_types = {}
        for file_info in invalid_files:
            corruption_type = file_info.corruption_type or "unknown"
            if corruption_type not in corruption_types:
                corruption_types[corruption_type] = []
            corruption_types[corruption_type].append(file_info.filename)

        # 统计音频质量信息
        if valid_files and PYDUB_AVAILABLE:
            durations = [f.duration for f in valid_files if f.duration]
            sample_rates = list(set([f.sample_rate for f in valid_files if f.sample_rate]))
            bitrates = [f.bitrate for f in valid_files if f.bitrate]
        else:
            durations = []
            sample_rates = []
            bitrates = []

        report = {
            "scan_info": {
                "timestamp": datetime.now().isoformat(),
                "audio_directory": str(self.audio_dir),
                "scan_duration": f"{self.stats['check_duration']:.2f}s"
            },
            "summary": {
                "total_files": self.stats["total_files"],
                "valid_files": self.stats["valid_files"],
                "invalid_files": self.stats["invalid_files"],
                "success_rate": f"{(self.stats['valid_files'] / max(self.stats['total_files'], 1)) * 100:.1f}%"
            },
            "quality_stats": {
                "avg_duration": f"{sum(durations) / len(durations):.2f}s" if durations else "N/A",
                "min_duration": f"{min(durations):.2f}s" if durations else "N/A",
                "max_duration": f"{max(durations):.2f}s" if durations else "N/A",
                "sample_rates": sample_rates,
                "avg_bitrate": f"{sum(bitrates) / len(bitrates):.0f} kbps" if bitrates else "N/A"
            },
            "corruption_analysis": {
                "empty_files": self.stats["empty_files"],
                "too_small_files": self.stats["too_small_files"],
                "format_errors": self.stats["format_errors"],
                "corrupted_files": self.stats["corrupted_files"],
                "read_errors": self.stats["read_errors"],
                "corruption_types": corruption_types
            },
            "problem_files": [
                {
                    "filename": f.filename,
                    "error": f.error_message,
                    "type": f.corruption_type,
                    "size": f.size
                } for f in invalid_files[:20]  # 只显示前20个问题文件
            ]
        }

        return report

    def print_summary(self, report: Dict):
        """打印检测摘要"""
        print("\n" + "=" * 60)
        print("🎵 音频文件完整性检测报告")
        print("=" * 60)

        summary = report["summary"]
        print(f"📊 文件统计:")
        print(f"   总文件数: {summary['total_files']}")
        print(f"   正常文件: {summary['valid_files']}")
        print(f"   问题文件: {summary['invalid_files']}")
        print(f"   成功率: {summary['success_rate']}")

        quality = report["quality_stats"]
        print(f"\n🎧 音频质量:")
        print(f"   平均时长: {quality['avg_duration']}")
        print(f"   时长范围: {quality['min_duration']} - {quality['max_duration']}")
        print(f"   采样率: {', '.join(map(str, quality['sample_rates']))}")
        print(f"   平均码率: {quality['avg_bitrate']}")

        corruption = report["corruption_analysis"]
        if corruption["empty_files"] > 0 or corruption["too_small_files"] > 0:
            print(f"\n⚠️ 文件大小问题:")
            print(f"   空文件: {corruption['empty_files']}")
            print(f"   过小文件: {corruption['too_small_files']}")

        if corruption["format_errors"] > 0 or corruption["corrupted_files"] > 0:
            print(f"\n❌ 文件损坏问题:")
            print(f"   格式错误: {corruption['format_errors']}")
            print(f"   音频损坏: {corruption['corrupted_files']}")
            print(f"   读取错误: {corruption['read_errors']}")

        if report["problem_files"]:
            print(f"\n📋 问题文件详情 (前20个):")
            for i, problem in enumerate(report["problem_files"], 1):
                print(f"   {i:2d}. {problem['filename']}")
                print(f"       错误: {problem['error']}")
                print(f"       类型: {problem['type']} ({problem['size']} bytes)")

        print("=" * 60)

        # 生成建议
        if summary['invalid_files'] > 0:
            print("🔧 修复建议:")
            if corruption['empty_files'] > 0:
                print("   - 删除空文件，重新生成")
            if corruption['too_small_files'] > 0:
                print("   - 检查过小文件，可能需要重新生成")
            if corruption['format_errors'] > 0:
                print("   - 修复格式错误，可能需要重新转换")
            if corruption['corrupted_files'] > 0:
                print("   - 重新生成损坏的音频文件")
        else:
            print("🎉 所有音频文件都正常！")

    def save_report(self, report: Dict, filename: str = "audio_integrity_report.json"):
        """保存报告到文件"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            print(f"\n📄 详细报告已保存到: {filename}")
        except Exception as e:
            print(f"\n❌ 保存报告失败: {e}")

    def run(self):
        """运行检测"""
        print("🎵 音频文件完整性检测程序")
        print(f"📁 检测目录: {self.audio_dir}")
        print("=" * 60)

        # 扫描文件
        results = self.scan_all_files()

        if not results:
            return

        # 生成报告
        report = self.generate_report(results)

        # 打印摘要
        self.print_summary(report)

        # 保存报告
        self.save_report(report)

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="音频文件完整性检测程序")
    parser.add_argument("--audio-dir", default="public/audio/tts", help="音频文件目录")
    parser.add_argument("--output", help="报告输出文件名")
    parser.add_argument("--quiet", action="store_true", help="静默模式，只输出摘要")

    args = parser.parse_args()

    # 创建检测器
    checker = AudioIntegrityChecker(args.audio_dir)

    # 运行检测
    checker.run()

    if args.output:
        # 重新加载报告并保存到指定文件
        try:
            with open("audio_integrity_report.json", 'r', encoding='utf-8') as f:
                report = json.load(f)
            checker.save_report(report, args.output)
        except Exception as e:
            print(f"❌ 保存到指定文件失败: {e}")

if __name__ == "__main__":
    main()