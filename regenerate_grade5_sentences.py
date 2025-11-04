#!/usr/bin/env python3
"""
专门重新生成grade5模块句子音频的脚本
使用Coqui TTS高质量音频
"""

import json
import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Any

class CoquiAudioGenerator:
    def __init__(self):
        self.temp_dir = Path("temp_coqui_generation")
        self.temp_dir.mkdir(exist_ok=True)

    def generate_coqui_tts(self, text: str, output_path: str) -> bool:
        """使用Coqui TTS生成音频"""
        try:
            # 创建临时文件
            temp_file = self.temp_dir / f"temp_{os.path.basename(output_path)}.wav"

            # 构建Coqui TTS命令
            cmd = [
                "/Users/shens/miniconda3/bin/tts",
                "--model_name", "tts_models/en/ljspeech/vits",
                "--text", text,
                "--out_path", str(temp_file)
            ]

            print(f"  🎙️  Coqui TTS生成: '{text}'")

            # 执行Coqui TTS命令
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0 and temp_file.exists():
                # 转换为MP3
                self._convert_to_mp3(temp_file, output_path)
                temp_file.unlink()  # 删除临时文件
                return True
            else:
                print(f"  ❌ Coqui TTS失败: {result.stderr}")
                return False

        except Exception as e:
            print(f"  ❌ Coqui TTS异常: {e}")
            return False

    def _convert_to_mp3(self, wav_path: Path, mp3_path: str):
        """将WAV转换为MP3"""
        try:
            subprocess.run([
                "ffmpeg", "-y", "-i", str(wav_path),
                "-codec:a", "libmp3lame", "-qscale:a", "2",
                mp3_path
            ], capture_output=True, check=True)
        except subprocess.CalledProcessError:
            # 如果ffmpeg失败，直接复制WAV文件并重命名为MP3
            import shutil
            shutil.copy2(wav_path, mp3_path)

def collect_grade5_sentences() -> List[Dict[str, Any]]:
    """收集所有grade5模块的句子音频需求"""
    sentences = []
    content_dir = Path("src/content")

    # 查找所有grade5模块
    grade5_modules = list(content_dir.glob("grade5-lower-mod-*.json"))
    grade5_modules.extend(list(content_dir.glob("grade5-upper-mod-*.json")))
    grade5_modules.sort()

    for module_file in grade5_modules:
        print(f"📖 扫描模块: {module_file.name}")

        try:
            with open(module_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 收集patterns中的句子
            for pattern in data.get('patterns', []):
                english = pattern.get('q', '')
                if english:
                    # 生成音频文件名
                    filename = generate_sentence_filename(english)
                    sentences.append({
                        'text': english,
                        'filename': filename,
                        'module': module_file.name,
                        'type': 'pattern'
                    })

            # 收收quests中的句子排序音频
            for quest in data.get('quests', []):
                if quest.get('id') == 'sentence-sorting':
                    for step in quest.get('steps', []):
                        if step.get('type') == 'sentencesorting':
                            correct_words = step.get('correct', [])
                            if correct_words:
                                sentence = ' '.join(correct_words)
                                filename = generate_sentence_filename(sentence)
                                sentences.append({
                                    'text': sentence,
                                    'filename': filename,
                                    'module': module_file.name,
                                    'type': 'sentence_sorting'
                                })

            # 收集英翻中练习的音频
            for quest in data.get('quests', []):
                if quest.get('id') == 'en-to-zh':
                    for step in quest.get('steps', []):
                        if step.get('type') == 'entozh':
                            english = step.get('english', '')
                            if english:
                                filename = generate_sentence_filename(english)
                                sentences.append({
                                    'text': english,
                                    'filename': filename,
                                    'module': module_file.name,
                                    'type': 'en_to_zh'
                                })

        except Exception as e:
            print(f"  ❌ 处理 {module_file.name} 失败: {e}")

    return sentences

def generate_sentence_filename(sentence: str) -> str:
    """根据句子生成文件名"""
    # 移除标点符号，转换为小写
    clean = re.sub(r'[^\w\s]', '', sentence.lower())
    # 替换空格为连字符
    filename = re.sub(r'\s+', '-', clean.strip())
    return f"{filename}.mp3"

def regenerate_grade5_audio():
    """重新生成grade5模块音频"""
    print("🎵 开始重新生成grade5模块句子音频")
    print("=" * 60)

    # 收集所有句子
    sentences = collect_grade5_sentences()
    print(f"📝 找到 {len(sentences)} 个句子需要生成音频")
    print()

    # 初始化音频生成器
    generator = CoquiAudioGenerator()

    # 确保输出目录存在
    output_dir = Path("public/audio/tts")
    output_dir.mkdir(parents=True, exist_ok=True)

    success_count = 0
    fail_count = 0

    # 生成音频
    for i, sentence in enumerate(sentences, 1):
        print(f"[{i}/{len(sentences)}] {sentence['filename']}")
        print(f"   模块: {sentence['module']}")
        print(f"   类型: {sentence['type']}")
        print(f"   文本: '{sentence['text']}'")

        output_path = output_dir / sentence['filename']

        if generator.generate_coqui_tts(sentence['text'], str(output_path)):
            print(f"   ✅ 生成成功: {sentence['filename']}")
            success_count += 1
        else:
            print(f"   ❌ 生成失败: {sentence['filename']}")
            fail_count += 1

        print()

    print("=" * 60)
    print(f"🎉 音频生成完成！")
    print(f"   ✅ 成功: {success_count} 个")
    print(f"   ❌ 失败: {fail_count} 个")
    print(f"   📊 总计: {len(sentences)} 个")
    print()
    print("🎵 所有grade5模块句子音频已使用Coqui TTS高质量重新生成！")

if __name__ == "__main__":
    regenerate_grade5_audio()