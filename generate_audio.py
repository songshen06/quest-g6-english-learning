#!/usr/bin/env python3
"""
音频文件生成脚本
用于为 Quest G6 英语学习应用生成所需的音频文件

依赖库:
- pydub: 音频处理
- gtts: Google Text-to-Speech
- numpy: 数值计算
- scipy: 科学计算

安装命令:
pip install pydub gtts numpy scipy requests
"""

import os
import json
import numpy as np
from pydub import AudioSegment
from pydub.generators import Sine, Square, Sawtooth
from gtts import gTTS
import tempfile
import requests
from pathlib import Path
import platform
import subprocess

# 导入Coqui TTS生成器
try:
    from generate_missing_audio import CoquiAudioGenerator
    COQUI_AVAILABLE = True
except ImportError:
    COQUI_AVAILABLE = False

class AudioGenerator:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.audio_dir = self.project_root / "public" / "audio"
        self.sfx_dir = self.audio_dir / "sfx"
        self.tts_dir = self.audio_dir / "tts"
        
        # 确保目录存在
        self.sfx_dir.mkdir(parents=True, exist_ok=True)
        self.tts_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_sfx_sounds(self):
        """生成音效文件"""
        print("🎵 生成音效文件...")
        
        # 正确音效 - 愉快的和弦
        correct_sound = self._create_success_sound()
        correct_sound.export(self.sfx_dir / "correct.mp3", format="mp3")
        print("✅ 生成 correct.mp3")
        
        # 错误音效 - 低沉的错误音
        wrong_sound = self._create_error_sound()
        wrong_sound.export(self.sfx_dir / "wrong.mp3", format="mp3")
        print("❌ 生成 wrong.mp3")
        
        # 解锁音效 - 上升音调
        unlock_sound = self._create_unlock_sound()
        unlock_sound.export(self.sfx_dir / "unlock.mp3", format="mp3")
        print("🔓 生成 unlock.mp3")
        
        # 完成音效 - 胜利音乐
        complete_sound = self._create_complete_sound()
        complete_sound.export(self.sfx_dir / "complete.mp3", format="mp3")
        print("🎉 生成 complete.mp3")
    
    def _create_success_sound(self):
        """创建成功音效 - C大调和弦"""
        duration = 800  # 毫秒
        
        # C大调和弦 (C-E-G)
        c_note = Sine(523.25).to_audio_segment(duration=duration//3)  # C5
        e_note = Sine(659.25).to_audio_segment(duration=duration//3)  # E5
        g_note = Sine(783.99).to_audio_segment(duration=duration//3)  # G5
        
        # 混合和弦
        chord = c_note.overlay(e_note).overlay(g_note)
        
        # 添加淡入淡出效果
        chord = chord.fade_in(50).fade_out(200)
        
        # 降低音量
        return chord - 10
    
    def _create_error_sound(self):
        """创建错误音效 - 低频嗡嗡声"""
        duration = 600
        
        # 低频音调
        low_tone = Sine(200).to_audio_segment(duration=duration)
        
        # 添加一些噪音效果
        noise = Square(150).to_audio_segment(duration=duration//2)
        
        # 混合并添加效果
        error_sound = low_tone.overlay(noise, position=duration//4)
        error_sound = error_sound.fade_in(50).fade_out(300)
        
        return error_sound - 15
    
    def _create_unlock_sound(self):
        """创建解锁音效 - 上升音调序列"""
        notes = [
            (392.00, 150),  # G4
            (493.88, 150),  # B4
            (587.33, 150),  # D5
            (783.99, 300),  # G5
        ]
        
        unlock_sound = AudioSegment.empty()
        
        for freq, duration in notes:
            note = Sine(freq).to_audio_segment(duration=duration)
            note = note.fade_in(20).fade_out(50)
            unlock_sound += note
        
        return unlock_sound - 8
    
    def _create_complete_sound(self):
        """创建完成音效 - 胜利旋律"""
        # 简单的胜利旋律
        melody = [
            (523.25, 200),  # C5
            (659.25, 200),  # E5
            (783.99, 200),  # G5
            (1046.50, 400), # C6
        ]
        
        complete_sound = AudioSegment.empty()
        
        for freq, duration in melody:
            note = Sine(freq).to_audio_segment(duration=duration)
            note = note.fade_in(30).fade_out(100)
            complete_sound += note
            
            # 添加短暂的间隔
            if duration < 400:
                complete_sound += AudioSegment.silent(duration=50)
        
        return complete_sound - 5
    
    def generate_tts_audio(self):
        """生成 TTS 语音文件"""
        print("🗣️ 生成 TTS 语音文件...")

        # 查找所有模块文件 - 先尝试 src 目录，再尝试 public 目录
        content_dir = self.project_root / "src" / "content"
        if not content_dir.exists():
            content_dir = self.project_root / "public" / "content"

        if not content_dir.exists():
            print(f"❌ 内容目录不存在: {content_dir}")
            return

        # 扫描所有格式的模块文件
        module_files = sorted(content_dir.glob("module-*.json"))
        module_files += sorted(content_dir.glob("grade5-lower-mod-*.json"))
        module_files += sorted(content_dir.glob("grade5-upper-mod-*.json"))
        module_files += sorted(content_dir.glob("grade6-lower-mod-*.json"))
        module_files += sorted(content_dir.glob("grade6-upper-mod-*.json"))

        # 去重（基于文件名）
        seen_names = set()
        unique_files = []
        for file in module_files:
            if file.name not in seen_names:
                seen_names.add(file.name)
                unique_files.append(file)
        module_files = unique_files

        if not module_files:
            print(f"❌ 未找到模块文件在: {content_dir}")
            return

        # 处理所有模块文件
        for module_file in module_files:
            print(f"\n📖 处理模块: {module_file.name}")

            with open(module_file, 'r', encoding='utf-8') as f:
                module_data = json.load(f)

            # 生成单词发音
            for word in module_data.get('words', []):
                if 'audio' in word and 'en' in word:
                    audio_path = word['audio']
                    text = word['en']
                    filename = Path(audio_path).name
                    self._generate_tts_file(text, filename)

            # 生成短语发音
            for phrase in module_data.get('phrases', []):
                if 'audio' in phrase and 'en' in phrase:
                    audio_path = phrase['audio']
                    text = phrase['en']
                    filename = Path(audio_path).name
                    self._generate_tts_file(text, filename)

            # 生成句型发音（patterns字段）
            for i, pattern in enumerate(module_data.get('patterns', [])):
                if 'q' in pattern:
                    text = pattern['q']
                    # 基于英文句子生成文件名
                    filename = self._convert_pattern_to_filename(text, i)
                    self._generate_tts_file(text, filename)

            # 生成任务中的特殊语音
            for quest in module_data.get('quests', []):
                for step in quest.get('steps', []):
                    if 'audio' in step:
                        audio_path = step['audio']
                        # 如果是fillblank类型，使用answer数组内容
                        if step.get('type') == 'fillblank' and 'answer' in step:
                            if isinstance(step['answer'], list) and step['answer']:
                                text = step['answer'][0]  # 使用第一个答案
                            else:
                                text = step.get('text', '')
                        elif 'text' in step:
                            text = step['text']
                        else:
                            continue

                        filename = Path(audio_path).name
                        self._generate_tts_file(text, filename)

        # 生成额外的缺失音频文件
        self._generate_missing_audio()

    def _generate_missing_audio(self):
        """生成模块中缺失的音频文件"""
        print("\n🔍 生成额外的缺失音频文件...")

        # 高优先级单词 - 基础功能词 (21个)
        high_priority_words = [
            ("a", "a.mp3"),
            ("are", "are.mp3"),
            ("big", "big.mp3"),
            ("do", "do.mp3"),
            ("have", "have.mp3"),
            ("in", "in.mp3"),
            ("into", "into.mp3"),
            ("long", "long.mp3"),
            ("make", "make.mp3"),
            ("me", "me.mp3"),
            ("my", "my.mp3"),
            ("new", "new.mp3"),
            ("of", "of.mp3"),
            ("on", "on.mp3"),
            ("the", "the.mp3"),
            ("to", "to.mp3"),
            ("watch", "watch.mp3"),
            ("we", "we.mp3"),
            ("what", "what.mp3"),
            ("you", "you.mp3"),
            ("your", "your.mp3"),
        ]

        # 中优先级单词 - 重要描述词 (4个)
        medium_priority_words = [
            ("dinner", "dinner.mp3"),
            ("photo", "photo.mp3"),
            ("room", "room.mp3"),
            ("worry", "worry.mp3"),
        ]

        # 低优先级单词 - 特定场景词 (23个)
        low_priority_words = [
            ("course", "course.mp3"),
            ("doing", "doing.mp3"),
            ("don't", "dont.mp3"),
            ("dvd", "dvd.mp3"),
            ("forty", "forty.mp3"),
            ("I'm", "im.mp3"),
            ("li", "li.mp3"),
            ("meet", "meet.mp3"),
            ("putting", "putting.mp3"),
            ("questions", "questions.mp3"),
            ("road", "road.mp3"),
            ("show", "show.mp3"),
            ("special", "special.mp3"),
            ("stamps", "stamps.mp3"),
        ]

        print("🎯 生成高优先级基础单词...")
        for text, filename in high_priority_words:
            self._generate_tts_file(text, filename)

        print("🎯 生成中优先级描述单词...")
        for text, filename in medium_priority_words:
            self._generate_tts_file(text, filename)

        print("🎯 生成低优先级特定单词...")
        for text, filename in low_priority_words:
            self._generate_tts_file(text, filename)

        # 之前缺失的单词和短语
        previous_missing = [
            # 缺失的单词
            ("spoke", "spoke.mp3"),
            ("wrote", "wrote.mp3"),
            ("when", "when.mp3"),
            ("gave", "gave.mp3"),
            ("almost", "almost.mp3"),
            ("art teacher", "art-teacher.mp3"),
            ("in English", "in-english.mp3"),
            ("in French", "in-french.mp3"),
            ("learn English", "learn-english.mp3"),

            # 第一单元句子 "It's more than two thousand years old." 中缺失的单个单词
            ("more", "more.mp3"),
            ("than", "than.mp3"),
            ("two", "two.mp3"),
            ("thousand", "thousand.mp3"),
            ("years", "years.mp3"),
            ("old", "old.mp3"),

            # 缺失的短语
            ("the Empire State Building", "the-empire-state-building.mp3"),
            ("four hundred metres high", "four-hundred-metres-high.mp3"),
            ("Children's Day", "childrens-day.mp3"),
            ("favourite festival", "favourite-festival.mp3"),
            ("special dinner", "special-dinner.mp3"),
            ("have a lot of fun", "have-a-lot-of-fun.mp3"),
            ("write a poem", "write-a-poem.mp3"),
            ("be important to", "be-important-to-sb.mp3"),
            ("very important festival", "very-important-festival.mp3"),
            ("in many countries", "in-many-countries.mp3"),
            ("on the 25th of December", "on-the-25th-of-december.mp3"),
            ("festival", "festival.mp3"),

            # 缺失的任务音频
            ("How long is the Great Wall?", "how-long-great-wall.mp3"),
            ("I went to Chinatown yesterday", "chinatown-yesterday.mp3"),
            ("We saw a lion dance in the street", "lion-dance-street.mp3"),
            ("They want to visit Chinatown again", "chinatown-visit.mp3"),
            ("Collecting stamps is a great hobby", "stamp-quest.mp3"),
            ("Thanksgiving is a wonderful festival", "thanksgiving-quest.mp3"),
        ]

        print("🔄 生成之前缺失的单词和短语...")
        for text, filename in previous_missing:
            self._generate_tts_file(text, filename)
    
    def _generate_tts_file(self, text, filename):
        """生成单个 TTS 文件"""
        output_path = self.tts_dir / filename

        # 检查文件是否已存在
        if output_path.exists():
            print(f"⏭️  跳过已存在的 {filename}")
            return

        # 优先使用 Coqui TTS (最高质量)
        if COQUI_AVAILABLE:
            try:
                print(f"🎙️  尝试 Coqui TTS 生成 {filename}: '{text}'")
                coqui_generator = CoquiAudioGenerator()
                success = coqui_generator.generate_coqui_tts(filename, text)
                if success:
                    print(f"🎤 (Coqui TTS) 生成 {filename}: '{text}'")
                    return
                else:
                    print(f"⚠️ Coqui TTS 生成 {filename} 失败，尝试其他方法")
            except Exception as coqui_err:
                print(f"⚠️ Coqui TTS 生成 {filename} 失败: {coqui_err}")

        # 尝试使用 macOS 本地 TTS ('say')
        if platform.system() == 'Darwin':
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.aiff') as tmp_aiff:
                    # 使用系统 TTS 生成 AIFF
                    subprocess.run(['say', '-o', tmp_aiff.name, text], check=True, timeout=30)

                # 读取 AIFF 并做基础处理
                audio = AudioSegment.from_file(tmp_aiff.name)
                audio = audio.normalize().fade_in(100).fade_out(200)
                audio.export(output_path, format="mp3", bitrate="128k")

                print(f"🎤 (macOS) 生成 {filename}: '{text}'")
                os.unlink(tmp_aiff.name)
                return
            except Exception as mac_err:
                print(f"⚠️ macOS 'say' 失败: {mac_err}")

        # 尝试使用 Google TTS 作为备选
        try:
            print(f"🌐 尝试 Google TTS 生成 {filename}: '{text}'")
            tts = gTTS(text=text, lang='en', slow=False)

            # 保存到临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                tts.save(tmp_file.name)

                # 使用 pydub 处理音频（调整音量、添加效果等）
                audio = AudioSegment.from_mp3(tmp_file.name)

                # 标准化音量
                audio = audio.normalize()

                # 添加轻微的淡入淡出
                audio = audio.fade_in(100).fade_out(200)

                # 保存最终文件
                audio.export(output_path, format="mp3", bitrate="128k")

                print(f"🎤 (Google TTS) 生成 {filename}: '{text}'")

                # 清理临时文件
                os.unlink(tmp_file.name)
                return

        except Exception as e:
            print(f"❌ Google TTS 生成 {filename} 失败: {e}")

        # 最后降级为占位音频，避免空文件
        try:
            placeholder = Sine(440).to_audio_segment(duration=600).fade_in(50).fade_out(200)
            placeholder.export(output_path, format="mp3", bitrate="128k")
            print(f"⚠️ 使用占位音频生成 {filename}: '{text}'")
        except Exception as last_err:
            print(f"❌ 无法生成占位音频 {filename}: {last_err}")

    def _convert_pattern_to_filename(self, text, index):
        """将句型文本转换为音频文件名"""
        # 转换为小写
        filename = text.lower()
        # 移除标点符号
        filename = filename.replace('?', '').replace('!', '').replace('.', '').replace(',', '')
        # 将空格替换为连字符
        filename = filename.replace(' ', '-')
        # 移除特殊字符，保留字母数字和连字符
        filename = ''.join(c for c in filename if c.isalnum() or c == '-')
        # 将多个连续连字符替换为单个连字符
        while '--' in filename:
            filename = filename.replace('--', '-')
        # 移除开头和结尾的连字符
        filename = filename.strip('-')

        # 如果文件名为空或太短，使用索引
        if len(filename) < 3:
            filename = f'pattern-{index + 1}'

        return filename + '.mp3'

    def convert_text_to_filename(self, text):
        """将英文文本转换为音频文件名（与ZhToEnStep.tsx保持一致）"""
        # 转换为小写
        filename = text.lower()
        # 将空格替换为连字符
        filename = filename.replace(' ', '-')
        # 移除特殊字符，保留字母数字和连字符
        filename = ''.join(c for c in filename if c.isalnum() or c == '-')
        # 将多个连续连字符替换为单个连字符
        while '--' in filename:
            filename = filename.replace('--', '-')
        # 移除开头和结尾的连字符
        filename = filename.strip('-')
        return filename + '.mp3'

    def generate_all(self):
        """生成所有音频文件"""
        print("🚀 开始生成音频文件...")
        print(f"📁 项目目录: {self.project_root}")
        print(f"🎵 音频目录: {self.audio_dir}")
        print()
        
        # 生成音效
        self.generate_sfx_sounds()
        print()
        
        # 生成 TTS 语音
        self.generate_tts_audio()
        print()
        
        print("✨ 所有音频文件生成完成！")
        print()
        print("📋 生成的文件列表:")
        
        # 列出生成的文件
        for audio_type in ['sfx', 'tts']:
            audio_subdir = self.audio_dir / audio_type
            if audio_subdir.exists():
                print(f"\n{audio_type.upper()} 文件:")
                for file in sorted(audio_subdir.glob("*.mp3")):
                    size = file.stat().st_size
                    print(f"  📄 {file.name} ({size:,} bytes)")

def main():
    """主函数"""
    import sys
    
    # 获取项目根目录
    if len(sys.argv) > 1:
        project_root = sys.argv[1]
    else:
        project_root = os.getcwd()
    
    print("🎵 Quest G6 音频文件生成器")
    print("=" * 50)
    
    # 检查依赖
    try:
        import pydub
        import gtts
        import numpy
        import scipy
    except ImportError as e:
        print(f"❌ 缺少依赖库: {e}")
        print("\n请安装所需依赖:")
        print("pip install pydub gtts numpy scipy requests")
        return 1
    
    # 创建生成器并运行
    generator = AudioGenerator(project_root)
    generator.generate_all()
    
    return 0

if __name__ == "__main__":
    exit(main())