#!/usr/bin/env python3
"""
统一的TTS音频生成脚本
支持多种TTS引擎：Coqui TTS > macOS say > gTTS
"""

import os
import sys
import time
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Union
from dataclasses import dataclass

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from scripts.utils.common import (
    load_json_files, extract_text_from_json, text_to_filename,
    print_progress, generate_timestamp, ensure_directory
)
from scripts.utils.config import config

@dataclass
class TTSResult:
    """TTS生成结果"""
    text: str
    filename: str
    filepath: Path
    success: bool
    engine: str
    duration: Optional[float] = None
    error_message: Optional[str] = None

class TTSGenerator:
    """TTS音频生成器"""

    def __init__(self):
        self.audio_dir = config.get_audio_dir()
        ensure_directory(self.audio_dir)

        self.engines = []
        self._initialize_engines()

    def _initialize_engines(self):
        """初始化TTS引擎"""
        # 按优先级顺序初始化引擎
        engine_initializers = [
            ("coqui", self._init_coqui),
            ("say", self._init_say),
            ("gtts", self._init_gtts)
        ]

        for engine_name, init_func in engine_initializers:
            try:
                if init_func():
                    self.engines.append(engine_name)
                    print(f"✅ {engine_name.upper()} 引擎初始化成功")
                else:
                    print(f"⚠️ {engine_name.upper()} 引擎初始化失败")
            except Exception as e:
                print(f"❌ {engine_name.upper()} 引擎初始化错误: {e}")

        if not self.engines:
            print("❌ 没有可用的TTS引擎")
            sys.exit(1)

        print(f"🎤 可用TTS引擎: {' > '.join(self.engines)}")

    def _init_coqui(self) -> bool:
        """初始化Coqui TTS"""
        try:
            import TTS
            # 检查模型是否可用
            TTS.utils.manage_manager.ModelManager()
            return True
        except ImportError:
            print("⚠️ Coqui TTS未安装，安装命令: pip install TTS")
            return False
        except Exception as e:
            print(f"⚠️ Coqui TTS初始化失败: {e}")
            return False

    def _init_say(self) -> bool:
        """初始化macOS say"""
        if sys.platform != "darwin":
            print("⚠️ macOS say仅在macOS上可用")
            return False

        try:
            # 测试say命令
            result = subprocess.run(['say', '--version'],
                                  capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except Exception:
            return False

    def _init_gtts(self) -> bool:
        """初始化gTTS"""
        try:
            import gtts
            return True
        except ImportError:
            print("⚠️ gTTS未安装，安装命令: pip install gtts")
            return False

    def generate_with_coqui(self, text: str, filepath: Path) -> TTSResult:
        """使用Coqui TTS生成音频"""
        try:
            import TTS
            from TTS.utils.synthesizer import Synthesizer

            print(f"🎤 使用Coqui TTS生成: {text[:30]}...")

            # 初始化合成器
            synthesizer = Synthesizer(
                tts_model_path=None,  # 使用默认模型
                vocoder_path=None,
                encoder_config=None,
                use_cuda=False
            )

            # 生成音频
            wav = synthesizer.tts(text)
            synthesizer.save_wav(wav, str(filepath))

            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=True,
                engine="coqui"
            )

        except Exception as e:
            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=False,
                engine="coqui",
                error_message=str(e)
            )

    def generate_with_say(self, text: str, filepath: Path) -> TTSResult:
        """使用macOS say生成音频"""
        try:
            print(f"🗣️  使用macOS say生成: {text[:30]}...")

            # 使用say命令生成音频文件
            cmd = [
                'say',
                '-v', config.tts.say_voice,
                '-o', str(filepath),
                '--data-format=LEF32@22050',
                text
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode != 0:
                raise Exception(f"say命令失败: {result.stderr}")

            # 转换为MP3（需要ffmpeg）
            mp3_filepath = filepath.with_suffix('.mp3')
            convert_cmd = [
                'ffmpeg', '-y',
                '-f', 'caf',
                '-i', str(filepath),
                '-ar', str(config.tts.sample_rate),
                '-ac', '1',
                '-b:a', '64k',
                str(mp3_filepath)
            ]

            convert_result = subprocess.run(convert_cmd, capture_output=True, text=True, timeout=30)

            # 删除临时的caf文件
            if filepath.exists():
                filepath.unlink()

            if convert_result.returncode != 0:
                raise Exception(f"ffmpeg转换失败: {convert_result.stderr}")

            return TTSResult(
                text=text,
                filename=mp3_filepath.name,
                filepath=mp3_filepath,
                success=True,
                engine="say"
            )

        except subprocess.TimeoutExpired:
            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=False,
                engine="say",
                error_message="生成超时"
            )
        except Exception as e:
            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=False,
                engine="say",
                error_message=str(e)
            )

    def generate_with_gtts(self, text: str, filepath: Path) -> TTSResult:
        """使用gTTS生成音频"""
        try:
            from gtts import gTTS
            import base64
            from pydub import AudioSegment

            print(f"🌐 使用gTTS生成: {text[:30]}...")

            # 生成gTTS音频
            tts = gTTS(text=text, lang=config.tts.gtts_lang, slow=False)

            # 保存为临时文件
            temp_file = filepath.with_suffix('.mp3')
            tts.save(str(temp_file))

            # 使用pydub重新编码以确保质量
            audio = AudioSegment.from_mp3(str(temp_file))
            audio = audio.set_frame_rate(config.tts.sample_rate)
            audio = audio.set_channels(1)
            audio.export(str(filepath), format="mp3", bitrate="64k")

            # 删除临时文件
            if temp_file.exists() and temp_file != filepath:
                temp_file.unlink()

            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=True,
                engine="gtts"
            )

        except ImportError as e:
            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=False,
                engine="gtts",
                error_message=f"缺少依赖: {e}"
            )
        except Exception as e:
            return TTSResult(
                text=text,
                filename=filepath.name,
                filepath=filepath,
                success=False,
                engine="gtts",
                error_message=str(e)
            )

    def generate_audio(self, text: str, filename: str = None) -> TTSResult:
        """
        生成音频文件

        Args:
            text: 要转换的文本
            filename: 目标文件名（可选）

        Returns:
            生成结果
        """
        if not filename:
            filename = text_to_filename(text)

        filepath = self.audio_dir / filename

        # 按优先级尝试不同的引擎
        for engine in self.engines:
            try:
                if engine == "coqui":
                    result = self.generate_with_coqui(text, filepath)
                elif engine == "say":
                    result = self.generate_with_say(text, filepath)
                elif engine == "gtts":
                    result = self.generate_with_gtts(text, filepath)
                else:
                    continue

                if result.success:
                    print(f"✅ 成功生成: {filename} (引擎: {engine})")
                    return result
                else:
                    print(f"❌ {engine}引擎失败: {result.error_message}")
                    continue

            except Exception as e:
                print(f"❌ {engine}引擎异常: {e}")
                continue

        return TTSResult(
            text=text,
            filename=filename,
            filepath=filepath,
            success=False,
            engine="none",
            error_message="所有TTS引擎都失败了"
        )

    def generate_from_pattern(self, pattern: str, force_regenerate: bool = False) -> List[TTSResult]:
        """
        根据模式生成音频

        Args:
            pattern: 文件匹配模式
            force_regenerate: 是否强制重新生成已存在的文件

        Returns:
            生成结果列表
        """
        print(f"🔍 正在搜索匹配模式: {pattern}")

        # 加载匹配的JSON文件
        contents = load_json_files(pattern)
        if not contents:
            print(f"❌ 未找到匹配 '{pattern}' 的文件")
            return []

        print(f"📚 找到 {len(contents)} 个文件")

        # 提取所有需要生成音频的文本项
        items = []
        for content in contents:
            if not content.get('moduleId') or not content.get('title'):
                print(f"⚠️ 跳过无效文件: {content.get('_filename', 'unknown')}")
                continue

            content_items = extract_text_from_json(content)
            items.extend(content_items)

        if not items:
            print("❌ 未找到需要生成音频的内容")
            return []

        print(f"📊 总计需要生成: {len(items)} 个音频项")

        # 生成音频
        results = []
        start_time = time.time()

        for i, item in enumerate(items):
            print_progress(i + 1, len(items), "生成进度", f"{item['module_id']} - {item['type']}")

            # 确定文件名
            if item['audio_path']:
                filename = item['audio_path'].replace('/audio/tts/', '')
            else:
                filename = text_to_filename(item['text'])

            filepath = self.audio_dir / filename

            # 检查文件是否已存在
            if filepath.exists() and not force_regenerate:
                print(f"\n⏭️  跳过已存在: {filename}")
                results.append(TTSResult(
                    text=item['text'],
                    filename=filename,
                    filepath=filepath,
                    success=True,
                    engine="existing"
                ))
                continue

            # 生成音频
            result = self.generate_audio(item['text'], filename)
            results.append(result)

            # 更新JSON文件中的音频路径
            if result.success and item.get('audio_path') and item['audio_path'] != f"/audio/tts/{filename}":
                self._update_audio_path(content, item, filename)

        generation_time = time.time() - start_time
        successful = sum(1 for r in results if r.success)
        print(f"\n✅ 生成完成！成功: {successful}/{len(results)}, 耗时: {generation_time:.1f}s")

        return results

    def _update_audio_path(self, content: Dict, item: Dict, filename: str):
        """更新JSON文件中的音频路径"""
        try:
            # 这里需要实现更新JSON文件的逻辑
            # 为了简化，暂时跳过这个功能
            pass
        except Exception as e:
            print(f"⚠️ 更新音频路径失败: {e}")

    def generate_missing_audio(self, pattern: str) -> List[TTSResult]:
        """
        生成缺失的音频文件

        Args:
            pattern: 文件匹配模式

        Returns:
            生成结果列表
        """
        print(f"🔍 检查缺失的音频文件: {pattern}")

        # 加载内容
        contents = load_json_files(pattern)
        if not contents:
            print(f"❌ 未找到匹配 '{pattern}' 的文件")
            return []

        # 提取所有需要的音频项
        items = []
        for content in contents:
            content_items = extract_text_from_json(content)
            items.extend(content_items)

        # 找出缺失的文件
        missing_items = []
        for item in items:
            filename = item['audio_path'].replace('/audio/tts/', '') if item['audio_path'] else text_to_filename(item['text'])
            filepath = self.audio_dir / filename

            if not filepath.exists():
                missing_items.append((item, filename))

        if not missing_items:
            print("✅ 所有音频文件都存在")
            return []

        print(f"📊 发现 {len(missing_items)} 个缺失的音频文件")

        # 生成缺失的音频
        results = []
        for i, (item, filename) in enumerate(missing_items):
            print_progress(i + 1, len(missing_items), "生成缺失音频", f"{item['module_id']}")
            result = self.generate_audio(item['text'], filename)
            results.append(result)

        successful = sum(1 for r in results if r.success)
        print(f"\n✅ 缺失音频生成完成！成功: {successful}/{len(results)}")

        return results

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="TTS音频生成工具")
    parser.add_argument("pattern", help="文件匹配模式，如 'grade6-*.json', 'module-01-*.json'")
    parser.add_argument("--config", help="配置文件路径")
    parser.add_argument("--engine", help="首选TTS引擎 (coqui, say, gtts)")
    parser.add_argument("--missing-only", action="store_true", help="只生成缺失的音频文件")
    parser.add_argument("--force", action="store_true", help="强制重新生成已存在的文件")
    parser.add_argument("--voice", help="say语音（仅macOS say）")
    parser.add_argument("--quiet", action="store_true", help="静默模式")

    args = parser.parse_args()

    # 加载配置
    if args.config:
        config.load_from_file(args.config)

    # 更新配置
    if args.engine:
        config.tts.preferred_engine = args.engine
    if args.voice:
        config.tts.say_voice = args.voice

    print("🎤 TTS音频生成器启动")
    print(f"📁 项目目录: {config.project_root}")
    print(f"🎵 音频目录: {config.get_audio_dir()}")
    print("=" * 60)

    # 创建生成器
    generator = TTSGenerator()

    try:
        if args.missing_only:
            # 只生成缺失的音频
            results = generator.generate_missing_audio(args.pattern)
        else:
            # 生成所有音频
            results = generator.generate_from_pattern(args.pattern, args.force)

        if not results:
            print("❌ 没有找到需要生成的内容")
            return

        # 统计结果
        successful = sum(1 for r in results if r.success)
        failed = sum(1 for r in results if not r.success)

        print(f"\n📊 生成统计:")
        print(f"   总计: {len(results)}")
        print(f"   成功: {successful}")
        print(f"   失败: {failed}")

        if failed > 0:
            print(f"\n❌ 失败的文件:")
            for result in results:
                if not result.success:
                    print(f"   {result.filename}: {result.error_message}")

    except KeyboardInterrupt:
        print("\n⚠️ 生成被用户中断")
    except Exception as e:
        print(f"❌ 生成过程中发生错误: {e}")
        raise

if __name__ == "__main__":
    main()