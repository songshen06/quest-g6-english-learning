#!/usr/bin/env python3
"""
网页音频文件测试工具
检查网页/组件中动态生成的音频文件是否存在
"""

import os
import json
import re
from pathlib import Path
from pydub import AudioSegment
import subprocess
import tempfile

class WebAudioTester:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.audio_dir = self.project_root / "public" / "audio"
        self.tts_dir = self.audio_dir / "tts"
        self.src_dir = self.project_root / "src"

        # 收集所有可能的音频文件名
        self.web_audio_references = set()
        self.missing_web_audio = set()

    def scan_components_for_audio_patterns(self):
        """扫描组件文件中的音频生成模式"""
        print("🔍 扫描组件文件中的音频生成模式...")

        # 查找所有 TSX/TS 文件
        component_files = list(self.src_dir.rglob("*.tsx")) + list(self.src_dir.rglob("*.ts"))

        for file_path in component_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 1. 查找 WordMatchingStep 的 getAudioPath 模式
                word_matching_pattern = r'getAssetPath\([\'"`]/audio/tts/.*?\.mp3[\'"`]\)'
                matches = re.findall(word_matching_pattern, content)

                # 2. 查找 ZhToEnStep 的类似模式
                zh_to_en_pattern = r'/audio/tts/.*?\.mp3'
                matches.extend(re.findall(zh_to_en_pattern, content))

                # 3. 查找直接引用的音频文件
                direct_pattern = r'audio:\s*[\'"`]/audio/tts/([^\'"`]+\.mp3)[\'"`]'
                direct_matches = re.findall(direct_pattern, content)

                for match in direct_matches:
                    self.web_audio_references.add(match)

                # 4. 查找单词到文件名的转换逻辑
                if 'getAudioPath' in content or 'wordId' in content:
                    # 提取可能的单词列表（从 pairs、words 等数据结构）
                    word_pattern = r'["\']([^"\']+)["\'][,\s]*zh|["\']([^"\']+)["\'][,\s]*en'
                    words = re.findall(word_pattern, content)

                    for word_pair in words:
                        word = word_pair[0] or word_pair[1]
                        if word and len(word) > 1:
                            # 模拟文件名转换
                            filename = self.word_to_filename(word)
                            if filename:
                                self.web_audio_references.add(filename)

            except Exception as e:
                print(f"⚠️  处理 {file_path} 时出错: {e}")

        print(f"✅ 发现 {len(self.web_audio_references)} 个可能的音频引用")

    def word_to_filename(self, word):
        """将单词转换为文件名（模拟 JS 逻辑）"""
        if not word or len(word.strip()) == 0:
            return None

        # 移除引号
        word = word.strip('"\'')

        # 转换为小写
        filename = word.lower()

        # 替换空格为连字符
        filename = filename.replace(' ', '-')

        # 移除特殊字符，保留字母数字和连字符
        filename = ''.join(c for c in filename if c.isalnum() or c == '-')

        # 替换多个连字符为单个连字符
        while '--' in filename:
            filename = filename.replace('--', '-')

        # 移除开头和结尾的连字符
        filename = filename.strip('-')

        # 确保文件名不太短
        if len(filename) < 2:
            return None

        return f"{filename}.mp3"

    def scan_json_data_for_words(self):
        """扫描 JSON 数据文件中的单词和短语"""
        print("\n📚 扫描 JSON 数据文件...")

        content_dir = self.project_root / "src" / "content"
        if not content_dir.exists():
            return

        # 扫描所有模块文件
        module_files = list(content_dir.glob("module-*.json"))
        module_files += list(content_dir.glob("grade5-lower-module-*.json"))
        module_files += list(content_dir.glob("grade6-lower-module-*.json"))

        for module_file in module_files:
            try:
                with open(module_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # 扫描单词
                for word in data.get('words', []):
                    if 'en' in word:
                        filename = self.word_to_filename(word['en'])
                        if filename:
                            self.web_audio_references.add(filename)

                # 扫描短语
                for phrase in data.get('phrases', []):
                    if 'en' in phrase:
                        filename = self.word_to_filename(phrase['en'])
                        if filename:
                            self.web_audio_references.add(filename)

                # 扫描答案数组（用于填空题）
                for quest in data.get('quests', []):
                    for step in quest.get('steps', []):
                        if 'answer' in step:
                            if isinstance(step['answer'], list):
                                for answer in step['answer']:
                                    filename = self.word_to_filename(answer)
                                    if filename:
                                        self.web_audio_references.add(filename)
                            elif isinstance(step['answer'], str):
                                filename = self.word_to_filename(step['answer'])
                                if filename:
                                    self.web_audio_references.add(filename)

                        # 扫描文本内容
                        if 'text' in step:
                            filename = self.word_to_filename(step['text'])
                            if filename:
                                self.web_audio_references.add(filename)

            except Exception as e:
                print(f"⚠️  处理 {module_file} 时出错: {e}")

    def check_existing_audio_files(self):
        """检查实际存在的音频文件"""
        print("\n🔍 检查实际音频文件...")

        existing_files = set()
        for mp3_file in self.tts_dir.glob("*.mp3"):
            existing_files.add(mp3_file.name)

        print(f"✅ 存在的音频文件: {len(existing_files)} 个")

        # 找出缺失的文件
        self.missing_web_audio = self.web_audio_references - existing_files
        existing_web_audio = self.web_audio_references & existing_files

        print(f"\n❌ 网页引用但缺失的音频文件: {len(self.missing_web_audio)} 个")
        for filename in sorted(list(self.missing_web_audio))[:20]:  # 只显示前20个
            print(f"  📄 {filename}")

        if len(self.missing_web_audio) > 20:
            print(f"  ... 还有 {len(self.missing_web_audio) - 20} 个文件")

        print(f"\n✅ 网页引用且存在的音频文件: {len(existing_web_audio)} 个")

        return existing_files

    def generate_missing_web_audio(self):
        """生成缺失的网页音频文件"""
        if not self.missing_web_audio:
            print("\n✅ 没有缺失的网页音频文件")
            return

        print(f"\n🔧 生成 {len(self.missing_web_audio)} 个缺失的网页音频文件...")

        generated = []
        failed = []

        for filename in sorted(list(self.missing_web_audio)):
            try:
                # 从文件名推断文本
                text = filename.replace('.mp3', '').replace('-', ' ')

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

                    print(f"✅ 生成 {filename}: '{text}'")
                    generated.append(filename)

            except Exception as e:
                print(f"❌ 生成 {filename} 失败: {e}")
                failed.append({'filename': filename, 'error': str(e)})

        print(f"\n✅ 成功生成 {len(generated)} 个文件")
        print(f"❌ 失败 {len(failed)} 个文件")

        return generated, failed

    def generate_report(self):
        """生成报告"""
        print("\n" + "="*60)
        print("🌐 网页音频文件测试报告")
        print("="*60)

        existing_files = self.check_existing_audio_files()

        report = {
            'summary': {
                'web_audio_references': len(self.web_audio_references),
                'existing_audio_files': len(existing_files),
                'missing_web_audio': len(self.missing_web_audio),
                'coverage_percent': round((len(self.web_audio_references - self.missing_web_audio) / len(self.web_audio_references) * 100), 1) if self.web_audio_references else 0
            },
            'missing_files': sorted(list(self.missing_web_audio)),
            'web_audio_references': sorted(list(self.web_audio_references))[:50]  # 只显示前50个
        }

        print(f"\n📈 统计信息:")
        print(f"  网页引用的音频文件: {report['summary']['web_audio_references']}")
        print(f"  实际存在的音频文件: {report['summary']['existing_audio_files']}")
        print(f"  缺失的网页音频文件: {report['summary']['missing_web_audio']}")
        print(f"  覆盖率: {report['summary']['coverage_percent']}%")

        # 保存报告
        report_path = self.project_root / "web_audio_test_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"\n📄 详细报告已保存到: {report_path}")

        return report

    def run_full_test(self):
        """运行完整测试"""
        print("🌐 开始网页音频文件测试...")

        # 1. 扫描组件
        self.scan_components_for_audio_patterns()

        # 2. 扫描 JSON 数据
        self.scan_json_data_for_words()

        # 3. 生成报告
        report = self.generate_report()

        # 4. 生成缺失文件
        if self.missing_web_audio:
            generated, failed = self.generate_missing_web_audio()
            report['generated'] = generated
            report['failed_generation'] = failed

        print("\n✨ 网页音频测试完成！")
        return report

def main():
    """主函数"""
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

    print("🌐 Quest G6 网页音频文件测试工具")
    print("=" * 50)

    tester = WebAudioTester(project_root)
    report = tester.run_full_test()

    return 0

if __name__ == "__main__":
    exit(main())