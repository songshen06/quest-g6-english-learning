#!/usr/bin/env python3
"""
主脚本管理器
统一管理所有音频相关操作
"""

import sys
import argparse
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.append(str(Path(__file__).parent.parent))

from scripts.utils.config import config
from scripts.audio.check_quality import AudioQualityChecker
from scripts.audio.generate import TTSGenerator

def print_banner():
    """打印欢迎横幅"""
    print("=" * 80)
    print("🎵 Quest G6 音频管理工具")
    print("统一的音频生成、检查和管理系统")
    print("=" * 80)
    print(f"📁 项目目录: {config.project_root}")
    print(f"🎵 音频目录: {config.get_audio_dir()}")
    print(f"📄 报告目录: {config.get_reports_dir()}")
    print("=" * 80)

def print_help():
    """打印帮助信息"""
    help_text = """
🎵 Quest G6 音频管理工具 - 使用指南

📋 支持的操作:

1. 音频质量检查:
   python scripts/manage.py check <pattern> [选项]

   示例:
   python scripts/manage.py check grade6-*.json
   python scripts/manage.py check "module-01-*.json" --model small
   python scripts/manage.py check "*.json" --quiet

2. 音频生成:
   python scripts/manage.py generate <pattern> [选项]

   示例:
   python scripts/manage.py generate grade6-*.json
   python scripts/manage.py generate "module-01-*.json" --engine coqui
   python scripts/manage.py generate "*.json" --missing-only

3. 配置管理:
   python scripts/manage.py config [action]

   示例:
   python scripts/manage.py config show
   python scripts/manage.py config save my_config.json
   python scripts/manage.py config load my_config.json

📋 通用选项:
   --config <file>     指定配置文件
   --quiet             静默模式
   --help              显示帮助信息

🎯 常用模式字符串:
   grade6-*.json           所有6年级模块
   grade6-upper-*.json     6年级上学期
   grade6-lower-*.json     6年级下学期
   module-*.json           所有module模块
   "module-01-*.json"      特定编号模块
   "*.json"                所有JSON文件

🎤 TTS引擎优先级:
   1. Coqui TTS (最高质量)
   2. macOS say (系统原生)
   3. gTTS (在线服务)

🎵 ASR模型:
   - tiny: 最快，质量较低
   - base: 平衡推荐 (默认)
   - small: 较好质量
   - medium: 好质量
   - large: 最佳质量，较慢
"""
    print(help_text)

def handle_check_command(args):
    """处理检查命令"""
    print("🔍 开始音频质量检查...")

    # 创建检查器
    checker = AudioQualityChecker()

    # 加载Whisper模型
    if not checker.load_whisper_model():
        print("❌ 无法加载Whisper模型，程序退出")
        return False

    try:
        # 执行检查
        results = checker.check_pattern(args.pattern)

        if not results:
            print("❌ 没有找到需要检查的内容")
            return False

        # 生成报告
        print(f"\n📊 生成检查报告...")
        report = checker.generate_report(results, args.pattern)

        # 打印报告摘要
        if not args.quiet:
            print("\n" + report)

        # 保存报告
        checker.save_report(report, results, args.pattern)

        print(f"✅ 检查完成！共检查了 {len(results)} 个音频项")
        return True

    except Exception as e:
        print(f"❌ 检查过程中发生错误: {e}")
        return False

def handle_generate_command(args):
    """处理生成命令"""
    print("🎤 开始音频生成...")

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
            return False

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

        return failed == 0

    except Exception as e:
        print(f"❌ 生成过程中发生错误: {e}")
        return False

def handle_config_command(args):
    """处理配置命令"""
    if args.action == "show":
        config.print_config()
    elif args.action == "save":
        if args.file:
            config.save_to_file(args.file)
        else:
            filename = f"quest_audio_config_{config.paths.project_root.name}.json"
            config.save_to_file(filename)
    elif args.action == "load":
        if args.file:
            config.load_from_file(args.file)
            print(f"✅ 配置已从 {args.file} 加载")
        else:
            print("❌ 请指定配置文件路径")
    else:
        print("❌ 未知的配置操作。可用操作: show, save, load")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="Quest G6 音频管理工具",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("--config", help="配置文件路径")
    parser.add_argument("--quiet", action="store_true", help="静默模式")

    subparsers = parser.add_subparsers(dest="command", help="可用命令")

    # 检查命令
    check_parser = subparsers.add_parser("check", help="音频质量检查")
    check_parser.add_argument("pattern", help="文件匹配模式")
    check_parser.add_argument("--model", help="Whisper模型 (tiny, base, small, medium, large)")
    check_parser.add_argument("--device", help="设备 (cpu, cuda, auto)")

    # 生成命令
    generate_parser = subparsers.add_parser("generate", help="音频生成")
    generate_parser.add_argument("pattern", help="文件匹配模式")
    generate_parser.add_argument("--engine", help="首选TTS引擎 (coqui, say, gtts)")
    generate_parser.add_argument("--missing-only", action="store_true", help="只生成缺失的音频文件")
    generate_parser.add_argument("--force", action="store_true", help="强制重新生成已存在的文件")
    generate_parser.add_argument("--voice", help="say语音（仅macOS say）")

    # 配置命令
    config_parser = subparsers.add_parser("config", help="配置管理")
    config_parser.add_argument("action", choices=["show", "save", "load"], help="配置操作")
    config_parser.add_argument("--file", help="配置文件路径")

    # 帮助命令
    help_parser = subparsers.add_parser("help", help="显示详细帮助")

    args = parser.parse_args()

    # 如果没有命令，显示帮助
    if not args.command:
        print_banner()
        print_help()
        return

    # 处理帮助命令
    if args.command == "help":
        print_banner()
        print_help()
        return

    # 加载配置
    if args.config:
        config.load_from_file(args.config)

    # 更新配置
    if args.command == "check":
        if args.model:
            config.asr.whisper_model = args.model
        if args.device:
            config.asr.device = args.device
    elif args.command == "generate":
        if args.engine:
            config.tts.preferred_engine = args.engine
        if args.voice:
            config.tts.say_voice = args.voice

    # 打印横幅（除非是静默模式）
    if not args.quiet:
        print_banner()

    # 执行命令
    success = False

    try:
        if args.command == "check":
            success = handle_check_command(args)
        elif args.command == "generate":
            success = handle_generate_command(args)
        elif args.command == "config":
            handle_config_command(args)
            success = True
        else:
            print(f"❌ 未知命令: {args.command}")
            print_help()
            return

    except KeyboardInterrupt:
        print("\n⚠️ 操作被用户中断")
        return
    except Exception as e:
        print(f"❌ 执行过程中发生错误: {e}")
        return

    # 退出状态
    if success:
        print("✅ 操作成功完成")
    else:
        print("❌ 操作完成，但遇到了一些问题")
        sys.exit(1)

if __name__ == "__main__":
    main()