#!/usr/bin/env python3
"""
模块查找助手
列出所有可用的模块文件，帮助用户了解可以使用哪些模块名
"""

from pathlib import Path

def list_modules():
    """列出所有可用的模块文件"""
    project_root = Path(__file__).parent.parent
    content_dir = project_root / "src" / "content"

    print("📋 可用的模块文件列表:")
    print("=" * 80)

    # 查找所有模块文件
    module_files = []

    # 查找 module-*.json 文件
    module_files.extend(content_dir.glob("module-*.json"))

    # 查找 grade*lower-mod-*.json 文件
    module_files.extend(content_dir.glob("grade*lower-mod-*.json"))

    # 查找 grade*upper-mod-*.json 文件
    module_files.extend(content_dir.glob("grade*upper-mod-*.json"))

    # 过滤掉备份文件
    module_files = [f for f in module_files if not f.name.endswith('.backup')]

    # 按文件名排序
    module_files.sort()

    # 按类型分组显示
    print("\n🔢 Module-*.json 文件:")
    print("-" * 40)
    for file_path in module_files:
        if file_path.name.startswith("module-"):
            # 提取可用的模块名
            name = file_path.stem
            if name.startswith("module-"):
                module_name = name.replace("module-", "", 1)
                print(f"  📁 {name}")
                print(f"     可用的参数名: module-{module_name}, {module_name}")
                # 提取关键词
                if '-' in module_name:
                    parts = module_name.split('-')
                    print(f"     或者关键词: {parts[0]}")
                    if len(parts) > 1:
                        print(f"              或: {parts[-1]}")

    print("\n📚 Grade*lower-mod-*.json 文件:")
    print("-" * 40)
    for file_path in module_files:
        if "lower-mod-" in file_path.name:
            name = file_path.stem
            print(f"  📁 {name}")
            # 提取年级和模块编号
            parts = name.split('-')
            if len(parts) >= 4:
                grade = parts[0] + parts[1]
                mod_num = parts[3]
                print(f"     可用的参数名: {mod_num}")

    print("\n🎓 Grade*upper-mod-*.json 文件:")
    print("-" * 40)
    for file_path in module_files:
        if "upper-mod-" in file_path.name:
            name = file_path.stem
            print(f"  📁 {name}")
            # 提取年级和模块编号
            parts = name.split('-')
            if len(parts) >= 4:
                grade = parts[0] + parts[1]
                mod_num = parts[3]
                print(f"     可用的参数名: {mod_num}")

    print(f"\n📊 总计: {len(module_files)} 个模块文件")

    # 使用示例
    print("\n💡 使用示例:")
    print("-" * 40)
    print("# 检查 module-03-stamps-hobbies")
    print("python3 scripts/check_audio_quality_with_whisper.py --modules stamps-hobbies")
    print("python3 scripts/check_audio_quality_with_whisper.py --modules 03")
    print("python3 scripts/check_audio_quality_with_whisper.py --modules stamps")
    print("python3 scripts/check_audio_quality_with_whisper.py --modules hobbies")
    print("")
    print("# 检查多个模块")
    print("python3 scripts/check_audio_quality_with_whisper.py --modules stamps-hobbies festivals habits-tidy")
    print("")
    print("# 检查所有模块")
    print("python3 scripts/check_audio_quality_with_whisper.py --all")

if __name__ == "__main__":
    list_modules()