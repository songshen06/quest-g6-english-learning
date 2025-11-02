#!/usr/bin/env python3
"""
通用工具函数模块
提供所有脚本共享的工具函数
"""

import os
import re
import json
import time
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from datetime import datetime

from .config import config

def text_to_filename(text: str, max_length: int = 100) -> str:
    """
    将文本转换为有效的音频文件名

    Args:
        text: 输入文本
        max_length: 最大文件名长度

    Returns:
        标准化的文件名
    """
    filename = text.lower()

    # 移除标点符号
    filename = re.sub(r'[^\w\s-]', '', filename)

    # 替换空格为连字符
    filename = filename.replace(' ', '-')

    # 移除多余的连字符
    filename = re.sub(r'-+', '-', filename)

    # 移除首尾连字符
    filename = filename.strip('-')

    # 如果文件名太短，使用哈希
    if len(filename) < 3:
        filename = f"audio-{hashlib.md5(text.encode()).hexdigest()[:8]}"

    # 限制长度
    if len(filename) > max_length:
        filename = filename[:max_length].rstrip('-')
        if len(filename) < 3:
            filename = f"audio-{hashlib.md5(text.encode()).hexdigest()[:8]}"

    return filename + '.mp3'

def calculate_similarity(text1: str, text2: str) -> float:
    """
    计算两个文本的相似度

    Args:
        text1: 第一个文本
        text2: 第二个文本

    Returns:
        相似度分数 (0-1)
    """
    import difflib

    # 标准化文本
    normalize = lambda s: re.sub(r'[^\w\s]', '', s.lower().strip())
    norm1 = normalize(text1)
    norm2 = normalize(text2)

    # 计算相似度
    similarity = difflib.SequenceMatcher(None, norm1, norm2).ratio()
    return similarity

def extract_text_from_json(content: Dict) -> List[Dict]:
    """
    从JSON内容中提取需要音频的文本

    Args:
        content: JSON内容

    Returns:
        文本项列表
    """
    items = []
    module_id = content.get('moduleId', '')
    module_title = content.get('title', '')

    # 提取短语
    for phrase in content.get('phrases', []):
        if 'en' in phrase and phrase['en'].strip():
            items.append({
                'module_id': module_id,
                'module_title': module_title,
                'type': 'phrase',
                'id': phrase.get('id', ''),
                'text': phrase['en'].strip(),
                'zh': phrase.get('zh', ''),
                'audio_path': phrase.get('audio', ''),
                'file': content.get('_filename', '')
            })

    # 提取句子
    for i, pattern in enumerate(content.get('patterns', [])):
        if 'q' in pattern and pattern['q'].strip():
            expected_filename = text_to_filename(pattern['q'])
            audio_path = f"/audio/tts/{expected_filename}"

            items.append({
                'module_id': module_id,
                'module_title': module_title,
                'type': 'pattern',
                'id': f"pattern-{i}",
                'text': pattern['q'].strip(),
                'zh': pattern.get('a', ''),
                'audio_path': audio_path,
                'file': content.get('_filename', '')
            })

    # 提取单词
    for word in content.get('words', []):
        if 'en' in word and word['en'].strip():
            items.append({
                'module_id': module_id,
                'module_title': module_title,
                'type': 'word',
                'id': word.get('id', ''),
                'text': word['en'].strip(),
                'zh': word.get('zh', ''),
                'audio_path': word.get('audio', ''),
                'file': content.get('_filename', '')
            })

    return items

def load_json_files(pattern: str) -> List[Dict]:
    """
    加载匹配模式的JSON文件

    Args:
        pattern: 文件匹配模式

    Returns:
        JSON内容列表
    """
    content_dir = config.get_content_dir()
    json_files = list(content_dir.glob(pattern))

    # 排除备份文件
    json_files = [f for f in json_files if not f.name.endswith('.backup')]

    contents = []
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                content = json.load(f)
                content['_filename'] = json_file.name
                contents.append(content)
        except Exception as e:
            print(f"❌ 读取文件失败 {json_file.name}: {e}")

    return contents

def get_audio_filename_from_path(audio_path: str) -> str:
    """
    从音频路径中提取文件名

    Args:
        audio_path: 音频路径

    Returns:
        音频文件名
    """
    if audio_path.startswith('/audio/tts/'):
        return audio_path.replace('/audio/tts/', '')
    elif audio_path.startswith('audio/tts/'):
        return audio_path.replace('audio/tts/', '')
    else:
        return Path(audio_path).name

def format_duration(seconds: float) -> str:
    """
    格式化时长

    Args:
        seconds: 秒数

    Returns:
        格式化的时长字符串
    """
    if seconds < 60:
        return f"{seconds:.2f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        secs = seconds % 60
        return f"{minutes}m{secs:.0f}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours}h{minutes}m{secs:.0f}s"

def format_file_size(size_bytes: int) -> str:
    """
    格式化文件大小

    Args:
        size_bytes: 字节数

    Returns:
        格式化的文件大小字符串
    """
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f}KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f}MB"

def print_progress(current: int, total: int, prefix: str = "", suffix: str = ""):
    """
    打印进度条

    Args:
        current: 当前进度
        total: 总数
        prefix: 前缀
        suffix: 后缀
    """
    progress = (current / total) * 100 if total > 0 else 0
    bar_length = 30
    filled_length = int(bar_length * progress / 100)

    bar = '█' * filled_length + '-' * (bar_length - filled_length)
    print(f'\r{prefix} |{bar}| {progress:.1f}% ({current}/{total}) {suffix}', end='', flush=True)

    if current == total:
        print()  # 完成时换行

@dataclass
class AudioInfo:
    """音频文件信息"""
    filename: str
    filepath: Path
    size: int
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    channels: Optional[int] = None
    format: Optional[str] = None
    is_valid: bool = False
    error_message: Optional[str] = None

def get_audio_file_info(filepath: Path) -> AudioInfo:
    """
    获取音频文件信息

    Args:
        filepath: 音频文件路径

    Returns:
        音频文件信息
    """
    filename = filepath.name

    try:
        size = filepath.stat().st_size
    except Exception as e:
        return AudioInfo(
            filename=filename,
            filepath=filepath,
            size=0,
            is_valid=False,
            error_message=f"无法访问文件: {e}"
        )

    # 基本检查
    if size == 0:
        return AudioInfo(
            filename=filename,
            filepath=filepath,
            size=size,
            is_valid=False,
            error_message="空文件"
        )

    # 尝试用pydub分析
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(str(filepath))

        return AudioInfo(
            filename=filename,
            filepath=filepath,
            size=size,
            duration=len(audio) / 1000.0,  # 转换为秒
            sample_rate=audio.frame_rate,
            channels=audio.channels,
            format=Path(filepath).suffix.upper().replace('.', ''),
            is_valid=True
        )
    except ImportError:
        # pydub未安装，只做基本检查
        return AudioInfo(
            filename=filename,
            filepath=filepath,
            size=size,
            format=Path(filepath).suffix.upper().replace('.', ''),
            is_valid=True
        )
    except Exception as e:
        return AudioInfo(
            filename=filename,
            filepath=filepath,
            size=size,
            is_valid=False,
            error_message=f"音频分析失败: {e}"
        )

def generate_timestamp() -> str:
    """生成时间戳字符串"""
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def ensure_directory(directory: Path):
    """确保目录存在"""
    directory.mkdir(parents=True, exist_ok=True)

def load_whisper_model():
    """加载Whisper模型"""
    try:
        import whisper
        import torch

        print(f"🤖 加载 Whisper 模型: {config.asr.whisper_model}")

        # 确定设备
        if config.asr.device == "auto":
            device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            device = config.asr.device

        model = whisper.load_model(config.asr.whisper_model, device=device)
        print(f"✅ Whisper 模型已加载 (设备: {device})")

        return model
    except ImportError:
        print("❌ 请安装必要的依赖: pip install openai-whisper torch")
        return None
    except Exception as e:
        print(f"❌ 加载 Whisper 模型失败: {e}")
        return None

def validate_json_structure(content: Dict) -> bool:
    """
    验证JSON文件结构是否正确

    Args:
        content: JSON内容

    Returns:
        是否有效
    """
    required_fields = ['moduleId', 'title']

    for field in required_fields:
        if field not in content:
            return False

    # 至少要有phrases、patterns或words中的一个
    content_types = ['phrases', 'patterns', 'words']
    has_content = any(content.get(type) for type in content_types)

    return has_content