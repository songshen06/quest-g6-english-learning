#!/usr/bin/env python3
"""
音频文件测试和验证工具
1. 检查所有音频文件大小
2. 验证文件名和内容的匹配
3. 重新生成有问题的音频文件
"""

import os
import json
import re
from pathlib import Path
from pydub import AudioSegment
import subprocess
import tempfile

class AudioTester:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.audio_dir = self.project_root / "public" / "audio"
        self.tts_dir = self.audio_dir / "tts"
        self.content_dir = self.project_root / "src" / "content"

        # 收集所有音频文件引用
        self.audio_references = {}
        self.problematic_files = []

    def scan_all_audio_files(self):
        """扫描所有音频文件并检查大小"""
        print("🔍 扫描所有音频文件...")

        problematic_files = []
        normal_files = []

        for mp3_file in self.audio_dir.rglob("*.mp3"):
            size_kb = mp3_file.stat().st_size / 1024

            file_info = {
                'path': str(mp3_file),
                'name': mp3_file.name,
                'size_kb': round(size_kb, 1),
                'relative_path': str(mp3_file.relative_to(self.audio_dir))
            }

            if size_kb < 3:  # 小于3KB认为有问题
                problematic_files.append(file_info)
            else:
                normal_files.append(file_info)

        print(f"\n❌ 发现 {len(problematic_files)} 个有问题的音频文件 (< 3KB):")
        for file in problematic_files:
            print(f"  📄 {file['relative_path']} - {file['size_kb']}K")

        print(f"\n✅ 正常音频文件: {len(normal_files)} 个")

        self.problematic_files = problematic_files
        return problematic_files, normal_files

    def collect_audio_references(self):
        """收集所有模块中的音频文件引用"""
        print("\n📚 收集音频文件引用...")

        if not self.content_dir.exists():
            print(f"❌ 内容目录不存在: {self.content_dir}")
            return

        # 扫描所有模块文件
        module_files = list(self.content_dir.glob("module-*.json"))
        module_files += list(self.content_dir.glob("grade5-lower-module-*.json"))
        module_files += list(self.content_dir.glob("grade6-lower-module-*.json"))

        for module_file in module_files:
            print(f"  📖 处理: {module_file.name}")

            try:
                with open(module_file, 'r', encoding='utf-8') as f:
                    module_data = json.load(f)

                # 收集单词音频
                for word in module_data.get('words', []):
                    if 'audio' in word and 'en' in word:
                        audio_path = word['audio']
                        expected_filename = Path(audio_path).name
                        self.audio_references[expected_filename] = {
                            'text': word['en'],
                            'chinese': word.get('zh', ''),
                            'type': 'word',
                            'module': module_file.name
                        }

                # 收集短语音频
                for phrase in module_data.get('phrases', []):
                    if 'audio' in phrase and 'en' in phrase:
                        audio_path = phrase['audio']
                        expected_filename = Path(audio_path).name
                        self.audio_references[expected_filename] = {
                            'text': phrase['en'],
                            'chinese': phrase.get('zh', ''),
                            'type': 'phrase',
                            'module': module_file.name
                        }

                # 收集任务音频
                for quest in module_data.get('quests', []):
                    for step in quest.get('steps', []):
                        if 'audio' in step:
                            audio_path = step['audio']
                            expected_filename = Path(audio_path).name

                            # 获取文本内容
                            if step.get('type') == 'fillblank' and 'answer' in step:
                                if isinstance(step['answer'], list) and step['answer']:
                                    text = step['answer'][0]
                                else:
                                    text = step.get('text', '')
                            elif 'text' in step:
                                text = step['text']
                            else:
                                text = ''

                            self.audio_references[expected_filename] = {
                                'text': text,
                                'chinese': '',
                                'type': 'quest',
                                'module': module_file.name
                            }

            except Exception as e:
                print(f"❌ 处理 {module_file.name} 时出错: {e}")

        print(f"✅ 收集到 {len(self.audio_references)} 个音频引用")
        return self.audio_references

    def check_file_name_matching(self):
        """检查文件名和内容的匹配"""
        print("\n🔍 检查文件名和内容匹配...")

        missing_files = []
        orphaned_files = []

        # 检查引用的文件是否存在
        for filename, ref in self.audio_references.items():
            file_path = self.tts_dir / filename
            if not file_path.exists():
                missing_files.append({
                    'filename': filename,
                    'text': ref['text'],
                    'type': ref['type'],
                    'module': ref['module']
                })

        # 检查存在的文件是否有引用
        existing_files = set(f.name for f in self.tts_dir.glob("*.mp3"))
        referenced_files = set(self.audio_references.keys())

        orphaned_files = list(existing_files - referenced_files)

        print(f"\n❌ 缺失的音频文件 ({len(missing_files)} 个):")
        for missing in missing_files:
            print(f"  📄 {missing['filename']} - '{missing['text']}' ({missing['type']})")

        print(f"\n🔍 未被引用的音频文件 ({len(orphaned_files)} 个):")
        for orphan in orphaned_files:
            print(f"  📄 {orphan}")

        return missing_files, orphaned_files

    def regenerate_problematic_files(self):
        """重新生成有问题的音频文件"""
        print(f"\n🔧 重新生成 {len(self.problematic_files)} 个有问题的音频文件...")

        regenerated = []
        failed = []

        for file_info in self.problematic_files:
            filename = file_info['name']

            # 查找对应的文本内容
            ref = self.audio_references.get(filename, {})
            text = ref.get('text', '')

            if not text:
                # 尝试从文件名推断文本
                text = filename.replace('.mp3', '').replace('-', ' ')
                print(f"⚠️  未找到 {filename} 的文本引用，使用推断文本: '{text}'")

            try:
                # 使用 macOS say 命令生成音频
                with tempfile.NamedTemporaryFile(delete=False, suffix='.aiff') as tmp_aiff:
                    subprocess.run(['say', '-v', 'Samantha', '-o', tmp_aiff.name, text],
                                 check=True, timeout=30)

                    # 转换为 MP3
                    audio = AudioSegment.from_file(tmp_aiff.name)
                    audio = audio.normalize().fade_in(100).fade_out(200)

                    output_path = self.tts_dir / filename
                    audio.export(output_path, format="mp3", bitrate="128k")

                    os.unlink(tmp_aiff.name)

                    print(f"✅ 重新生成 {filename}: '{text}'")
                    regenerated.append(filename)

            except Exception as e:
                print(f"❌ 重新生成 {filename} 失败: {e}")
                failed.append({'filename': filename, 'error': str(e)})

        print(f"\n✅ 成功重新生成 {len(regenerated)} 个文件")
        print(f"❌ 失败 {len(failed)} 个文件")

        return regenerated, failed

    def generate_report(self):
        """生成完整的报告"""
        print("\n" + "="*60)
        print("📊 音频文件测试报告")
        print("="*60)

        problematic_files, normal_files = self.scan_all_audio_files()
        missing_files, orphaned_files = self.check_file_name_matching()

        print(f"\n📈 统计信息:")
        print(f"  总音频文件: {len(problematic_files) + len(normal_files)}")
        print(f"  有问题文件: {len(problematic_files)} (< 3KB)")
        print(f"  正常文件: {len(normal_files)}")
        print(f"  音频引用: {len(self.audio_references)}")
        print(f"  缺失文件: {len(missing_files)}")
        print(f"  孤立文件: {len(orphaned_files)}")

        # 保存报告到文件
        report = {
            'summary': {
                'total_files': len(problematic_files) + len(normal_files),
                'problematic_files': len(problematic_files),
                'normal_files': len(normal_files),
                'audio_references': len(self.audio_references),
                'missing_files': len(missing_files),
                'orphaned_files': len(orphaned_files)
            },
            'problematic_files': problematic_files,
            'missing_files': missing_files,
            'orphaned_files': orphaned_files,
            'audio_references': dict(list(self.audio_references.items())[:10])  # 只显示前10个
        }

        report_path = self.project_root / "audio_test_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"\n📄 详细报告已保存到: {report_path}")

        return report

    def run_full_test(self):
        """运行完整测试"""
        print("🚀 开始音频文件完整测试...")

        # 1. 收集音频引用
        self.collect_audio_references()

        # 2. 生成报告
        report = self.generate_report()

        # 3. 重新生成有问题的文件
        if self.problematic_files:
            regenerated, failed = self.regenerate_problematic_files()
            report['regenerated'] = regenerated
            report['failed_regeneration'] = failed

        print("\n✨ 测试完成！")
        return report

def main():
    """主函数"""
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

    print("🎵 Quest G6 音频文件测试工具")
    print("=" * 50)

    tester = AudioTester(project_root)
    report = tester.run_full_test()

    return 0

if __name__ == "__main__":
    exit(main())