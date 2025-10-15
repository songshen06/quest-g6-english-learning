#!/usr/bin/env python3
"""
Grade 6 音频质量问题修复脚本
基于音频质量检查报告，自动修复缺失和低质量的音频文件
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

class Grade6AudioFixer:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.audio_dir = self.project_root / "public" / "audio" / "tts"
        self.audio_generator = CoquiAudioGenerator()

        # 从检查报告中加载的问题数据
        self.quality_report_file = self.project_root / "grade6_audio_quality_data.json"

        # 统计信息
        self.stats = {
            "missing_files": 0,
            "low_quality_files": 0,
            "fixed_missing": 0,
            "fixed_low_quality": 0,
            "failed_fixes": 0
        }

    def load_quality_report(self) -> List[Dict]:
        """加载音频质量检查报告"""
        if not self.quality_report_file.exists():
            print(f"❌ 质量报告文件不存在: {self.quality_report_file}")
            print("请先运行 check_grade6_audio_quality.py 生成报告")
            return []

        try:
            with open(self.quality_report_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('results', [])
        except Exception as e:
            print(f"❌ 读取质量报告失败: {e}")
            return []

    def identify_problem_files(self, results: List[Dict]) -> Dict[str, List[Dict]]:
        """识别需要修复的文件"""
        missing_files = []
        low_quality_files = []

        for result in results:
            if result['status'] == 'missing':
                missing_files.append(result)
                self.stats["missing_files"] += 1
            elif result['quality'] == 'low':
                low_quality_files.append(result)
                self.stats["low_quality_files"] += 1

        return {
            'missing': missing_files,
            'low_quality': low_quality_files
        }

    def generate_audio_filename(self, text: str) -> str:
        """根据文本生成音频文件名"""
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

    def fix_missing_files(self, missing_files: List[Dict]) -> bool:
        """修复缺失的音频文件"""
        if not missing_files:
            print("✅ 没有缺失的音频文件需要修复")
            return True

        print(f"\n🔧 开始修复 {len(missing_files)} 个缺失的音频文件...")
        print("=" * 60)

        success = True
        for i, file_info in enumerate(missing_files):
            print(f"[{i+1}/{len(missing_files)}] 修复: {file_info['module_id']} - {file_info['en']}")

            # 生成文件名
            filename = self.generate_audio_filename(file_info['en'])
            filepath = self.audio_dir / filename

            try:
                # 生成音频文件
                self.audio_generator.generate_coqui_tts(filename, file_info['en'])

                # 验证文件是否生成成功
                if filepath.exists():
                    print(f"   ✅ 成功生成: {filename}")
                    self.stats["fixed_missing"] += 1
                else:
                    print(f"   ❌ 生成失败: {filename}")
                    self.stats["failed_fixes"] += 1
                    success = False

            except Exception as e:
                print(f"   ❌ 生成错误: {filename} - {e}")
                self.stats["failed_fixes"] += 1
                success = False

            # 避免系统过载
            time.sleep(0.5)

        return success

    def fix_low_quality_files(self, low_quality_files: List[Dict]) -> bool:
        """修复低质量的音频文件"""
        if not low_quality_files:
            print("✅ 没有低质量的音频文件需要修复")
            return True

        print(f"\n🔄 开始重新生成 {len(low_quality_files)} 个低质量音频文件...")
        print("=" * 60)

        success = True
        for i, file_info in enumerate(low_quality_files):
            print(f"[{i+1}/{len(low_quality_files)}] 重新生成: {file_info['module_id']} - {file_info['en']}")
            print(f"   📊 原相似度: {file_info['similarity']:.1%}")
            print(f"   🔊 原识别: '{file_info.get('transcribed_text', 'N/A')}'")

            # 使用现有文件名
            filename = file_info['filename']
            filepath = self.audio_dir / filename

            try:
                # 重新生成音频文件
                self.audio_generator.generate_coqui_tts(filename, file_info['en'])

                # 验证文件是否重新生成成功
                if filepath.exists():
                    # 检查文件修改时间
                    mtime = filepath.stat().st_mtime
                    current_time = time.time()
                    if current_time - mtime < 10:  # 10秒内修改过
                        print(f"   ✅ 成功重新生成: {filename}")
                        self.stats["fixed_low_quality"] += 1
                    else:
                        print(f"   ⚠️ 文件可能未更新: {filename}")
                        self.stats["failed_fixes"] += 1
                        success = False
                else:
                    print(f"   ❌ 重新生成失败: {filename}")
                    self.stats["failed_fixes"] += 1
                    success = False

            except Exception as e:
                print(f"   ❌ 重新生成错误: {filename} - {e}")
                self.stats["failed_fixes"] += 1
                success = False

            # 避免系统过载
            time.sleep(0.5)

        return success

    def create_fix_report(self, problem_files: Dict[str, List[Dict]]) -> str:
        """创建修复报告"""
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("🔧 Grade 6 音频问题修复报告")
        report_lines.append("=" * 80)
        report_lines.append(f"📅 修复时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")

        # 统计信息
        report_lines.append("📊 修复统计:")
        report_lines.append(f"   缺失文件: {self.stats['missing_files']} 个")
        report_lines.append(f"   低质量文件: {self.stats['low_quality_files']} 个")
        report_lines.append(f"   成功修复缺失: {self.stats['fixed_missing']} 个")
        report_lines.append(f"   成功修复低质量: {self.stats['fixed_low_quality']} 个")
        report_lines.append(f"   修复失败: {self.stats['failed_fixes']} 个")
        report_lines.append("")

        # 修复成功率
        total_problems = self.stats['missing_files'] + self.stats['low_quality_files']
        total_fixed = self.stats['fixed_missing'] + self.stats['fixed_low_quality']
        if total_problems > 0:
            success_rate = total_fixed / total_problems * 100
            report_lines.append(f"🎯 修复成功率: {success_rate:.1f}%")
            report_lines.append("")

        # 详细修复列表
        if problem_files['missing']:
            report_lines.append("📝 缺失文件修复详情:")
            for file_info in problem_files['missing']:
                filename = self.generate_audio_filename(file_info['en'])
                status = "✅" if any(f['en'] == file_info['en'] for f in problem_files.get('fixed_missing', [])) else "❌"
                report_lines.append(f"   {status} {filename} - '{file_info['en']}'")
            report_lines.append("")

        if problem_files['low_quality']:
            report_lines.append("🔄 低质量文件修复详情:")
            for file_info in problem_files['low_quality']:
                status = "✅" if any(f['filename'] == file_info['filename'] for f in problem_files.get('fixed_low_quality', [])) else "❌"
                report_lines.append(f"   {status} {file_info['filename']} - '{file_info['en']}' (原相似度: {file_info['similarity']:.1%})")
            report_lines.append("")

        # 建议后续步骤
        report_lines.append("💡 建议后续步骤:")
        if self.stats['failed_fixes'] > 0:
            report_lines.append("1. 🔍 检查修复失败的文件，可能需要手动处理")
            report_lines.append("2. 🔄 重新运行修复脚本处理失败的文件")

        if total_fixed > 0:
            report_lines.append("3. 🎵 运行音频质量检查脚本验证修复效果")
            report_lines.append("   python3 scripts/check_grade6_audio_quality.py")

        report_lines.append("4. 📚 测试修复后的音频在学习应用中的效果")

        if total_problems == 0:
            report_lines.append("🎉 所有音频文件质量良好，无需修复！")
        elif success_rate >= 90:
            report_lines.append("🎉 音频修复基本完成，质量大幅提升！")
        elif success_rate >= 70:
            report_lines.append("🟡 音频修复大部分完成，建议继续优化剩余问题")
        else:
            report_lines.append("🔴 音频修复存在问题，建议检查系统和配置")

        report_lines.append("")
        report_lines.append("=" * 80)

        return "\n".join(report_lines)

    def save_fix_report(self, report: str):
        """保存修复报告"""
        report_file = self.project_root / "grade6_audio_fix_report.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 修复报告已保存到: {report_file}")

    def run(self):
        """运行完整的修复流程"""
        print("🔧 Grade 6 音频问题修复器启动")
        print(f"📁 项目目录: {self.project_root}")
        print(f"🎵 音频目录: {self.audio_dir}")
        print("=" * 60)

        try:
            # 1. 加载质量检查报告
            print("📊 加载音频质量检查报告...")
            results = self.load_quality_report()

            if not results:
                print("❌ 无法加载质量报告，请先运行音频质量检查")
                return

            # 2. 识别问题文件
            print("🔍 识别需要修复的音频文件...")
            problem_files = self.identify_problem_files(results)

            print(f"📈 发现问题:")
            print(f"   缺失文件: {self.stats['missing_files']} 个")
            print(f"   低质量文件: {self.stats['low_quality_files']} 个")

            if self.stats['missing_files'] == 0 and self.stats['low_quality_files'] == 0:
                print("🎉 所有音频文件质量良好，无需修复！")
                return

            # 3. 修复缺失文件
            missing_success = self.fix_missing_files(problem_files['missing'])

            # 4. 修复低质量文件
            low_quality_success = self.fix_low_quality_files(problem_files['low_quality'])

            # 5. 生成修复报告
            print("\n📋 生成修复报告...")
            report = self.create_fix_report(problem_files)

            # 打印报告摘要
            print("\n" + report)

            # 保存报告
            self.save_fix_report(report)

            # 总结
            total_problems = self.stats['missing_files'] + self.stats['low_quality_files']
            total_fixed = self.stats['fixed_missing'] + self.stats['fixed_low_quality']

            if total_fixed == total_problems:
                print(f"✅ 修复完成！成功修复了 {total_fixed} 个音频文件")
            else:
                print(f"⚠️ 修复部分完成，成功修复 {total_fixed}/{total_problems} 个文件")
                if self.stats['failed_fixes'] > 0:
                    print(f"   失败: {self.stats['failed_fixes']} 个文件")

        except Exception as e:
            print(f"❌ 修复流程失败: {e}")
            raise

def main():
    """主函数"""
    fixer = Grade6AudioFixer()
    fixer.run()

if __name__ == "__main__":
    main()