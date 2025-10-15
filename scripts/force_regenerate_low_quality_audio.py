#!/usr/bin/env python3
"""
强制重新生成低质量音频文件脚本
专门用于重新生成音频质量检查中发现的低质量文件
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, List

# 导入音频生成器
try:
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from generate_missing_audio import CoquiAudioGenerator
except ImportError:
    print("❌ 无法导入音频生成器，请确保 generate_missing_audio.py 存在")
    exit(1)

class ForceAudioRegenerator:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.audio_dir = self.project_root / "public" / "audio" / "tts"
        self.audio_generator = CoquiAudioGenerator()

        # 低质量文件列表（从检查报告中提取）
        self.low_quality_files = [
            {
                'filename': 'what-do-you-want.mp3',
                'text': 'What do you want?',
                'module': 'grade6-lower-mod-01',
                'original_similarity': 54.5
            },
            {
                'filename': 'what-do-you-want-to-eat.mp3',
                'text': 'What do you want to eat?',
                'module': 'grade6-lower-mod-01',
                'original_similarity': 51.4
            },
            {
                'filename': 'i-want-a-hot-dog-please.mp3',
                'text': 'I want a hot dog, please.',
                'module': 'grade6-lower-mod-01',
                'original_similarity': 69.8
            },
            {
                'filename': 'its-thirteen-dollars-and-twenty-five-cents.mp3',
                'text': "It's thirteen dollars and twenty-five cents.",
                'module': 'grade6-lower-mod-01',
                'original_similarity': 16.3
            },
            {
                'filename': 'oh-dear.mp3',
                'text': 'Oh dear!',
                'module': 'grade6-lower-mod-02',
                'original_similarity': 44.4
            },
            {
                'filename': 'what-will-the-weather-be-like-in-beijing.mp3',
                'text': 'What will the weather be like in Beijing?',
                'module': 'grade6-lower-mod-02',
                'original_similarity': 68.8
            },
            {
                'filename': 'went-to-the-zoo.mp3',
                'text': 'went to the zoo',
                'module': 'grade6-lower-mod-03',
                'original_similarity': 56.0
            },
            {
                'filename': 'the-oranges-are-falling.mp3',
                'text': 'The oranges are falling!',
                'module': 'grade6-lower-mod-04',
                'original_similarity': 61.5
            },
            {
                'filename': 'made-a-model.mp3',
                'text': 'made a model',
                'module': 'grade6-lower-mod-06',
                'original_similarity': 66.7
            },
            {
                'filename': 'flew-into-space.mp3',
                'text': 'flew into space',
                'module': 'grade6-lower-mod-07',
                'original_similarity': 66.7
            },
            {
                'filename': 'couldnt-see-or-hear.mp3',
                'text': 'couldn\'t see or hear',
                'module': 'grade6-lower-mod-07',
                'original_similarity': 51.6
            },
            {
                'filename': 'because-im-happy.mp3',
                'text': "Because I'm happy.",
                'module': 'grade6-lower-mod-08',
                'original_similarity': 66.7
            }
        ]

        # 统计信息
        self.stats = {
            "total_files": len(self.low_quality_files),
            "success_count": 0,
            "failed_count": 0
        }

    def backup_original_files(self):
        """备份原始文件"""
        backup_dir = self.audio_dir / "backup_original"
        backup_dir.mkdir(exist_ok=True)

        print("📦 备份原始低质量文件...")
        for file_info in self.low_quality_files:
            src_path = self.audio_dir / file_info['filename']
            backup_path = backup_dir / file_info['filename']

            if src_path.exists():
                try:
                    # 复制文件到备份目录
                    import shutil
                    shutil.copy2(src_path, backup_path)
                    print(f"   ✅ 备份: {file_info['filename']}")
                except Exception as e:
                    print(f"   ❌ 备份失败: {file_info['filename']} - {e}")
            else:
                print(f"   ⚠️ 文件不存在: {file_info['filename']}")

        print(f"📦 原始文件备份完成，保存在: {backup_dir}")

    def force_regenerate_audio(self, file_info: Dict) -> bool:
        """强制重新生成单个音频文件"""
        filename = file_info['filename']
        text = file_info['text']
        filepath = self.audio_dir / filename

        # 删除现有文件（如果存在）
        if filepath.exists():
            try:
                filepath.unlink()
                print(f"   🗑️ 删除原文件: {filename}")
            except Exception as e:
                print(f"   ❌ 删除文件失败: {filename} - {e}")
                return False

        # 重新生成音频文件
        try:
            print(f"   🎵 重新生成: {text}")
            self.audio_generator.generate_coqui_tts(filename, text)

            # 验证文件是否生成成功
            if filepath.exists():
                # 检查文件大小和修改时间
                file_size = filepath.stat().st_size
                mtime = filepath.stat().st_mtime
                current_time = time.time()

                if file_size > 0 and (current_time - mtime) < 10:
                    print(f"   ✅ 重新生成成功: {filename} (大小: {file_size} bytes)")
                    return True
                else:
                    print(f"   ⚠️ 文件生成异常: {filename} (大小: {file_size})")
                    return False
            else:
                print(f"   ❌ 文件未生成: {filename}")
                return False

        except Exception as e:
            print(f"   ❌ 重新生成失败: {filename} - {e}")
            return False

    def run_regeneration(self):
        """运行强制重新生成流程"""
        print("🔄 强制重新生成低质量音频文件")
        print(f"📁 音频目录: {self.audio_dir}")
        print(f"📊 待处理文件: {self.stats['total_files']} 个")
        print("=" * 60)

        # 1. 备份原始文件
        self.backup_original_files()
        print()

        # 2. 强制重新生成
        print("🔧 开始强制重新生成...")
        for i, file_info in enumerate(self.low_quality_files):
            print(f"[{i+1}/{self.stats['total_files']}] 处理: {file_info['module']} - {file_info['filename']}")
            print(f"   📝 原文: '{file_info['text']}'")
            print(f"   📊 原相似度: {file_info['original_similarity']:.1f}%")

            success = self.force_regenerate_audio(file_info)

            if success:
                self.stats["success_count"] += 1
            else:
                self.stats["failed_count"] += 1

            print()  # 空行分隔
            time.sleep(0.5)  # 避免系统过载

        # 3. 生成报告
        self.generate_regeneration_report()

    def generate_regeneration_report(self):
        """生成重新生成报告"""
        print("📋 重新生成完成报告")
        print("=" * 60)

        print(f"📊 处理统计:")
        print(f"   总文件数: {self.stats['total_files']}")
        print(f"   成功重新生成: {self.stats['success_count']}")
        print(f"   重新生成失败: {self.stats['failed_count']}")

        if self.stats['total_files'] > 0:
            success_rate = self.stats['success_count'] / self.stats['total_files'] * 100
            print(f"   成功率: {success_rate:.1f}%")

        print("\n💡 建议后续步骤:")
        if self.stats['success_count'] > 0:
            print("1. 🎵 运行音频质量检查脚本验证重新生成效果")
            print("   python3 scripts/check_grade6_audio_quality.py")

        if self.stats['failed_count'] > 0:
            print("2. 🔍 检查重新生成失败的文件")
            print("3. 🔧 可能需要手动处理失败的文件")

        print("4. 📚 测试音频在学习应用中的播放效果")

        if success_rate >= 90:
            print("\n🎉 重新生成基本完成，音频质量应显著提升！")
        elif success_rate >= 70:
            print("\n🟡 大部分文件重新生成成功，建议继续优化剩余文件")
        else:
            print("\n🔴 重新生成存在问题，建议检查系统和配置")

        # 保存报告到文件
        report_content = f"""
强制重新生成低质量音频文件报告
=====================================
时间: {time.strftime('%Y-%m-%d %H:%M:%S')}
处理文件数: {self.stats['total_files']}
成功重新生成: {self.stats['success_count']}
重新生成失败: {self.stats['failed_count']}
成功率: {success_rate:.1f}%

处理的文件列表:
"""
        for file_info in self.low_quality_files:
            report_content += f"- {file_info['filename']} ({file_info['module']}) - '{file_info['text']}'\n"

        report_file = self.project_root / "force_regenerate_audio_report.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        print(f"\n📄 详细报告已保存到: {report_file}")

def main():
    """主函数"""
    regenerator = ForceAudioRegenerator()
    regenerator.run_regeneration()

if __name__ == "__main__":
    main()