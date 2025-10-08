#!/usr/bin/env python3
"""
简单的测试服务器，验证Quest应用的新题目类型
"""

import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def check_module_files():
    """检查模块文件是否正确更新"""
    modules_dir = "/Users/shens/Tools/Quest_G6/public/content"
    quest_types = ['wordmatching', 'sentencesorting', 'entozh', 'zhtoen']

    print("=== 检查模块文件更新情况 ===")

    for filename in os.listdir(modules_dir):
        if filename.startswith('module-') and filename.endswith('.json'):
            filepath = os.path.join(modules_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                quests = data.get('quests', [])
                print(f"\n📄 {filename}:")

                for quest in quests:
                    quest_id = quest.get('id', 'unknown')
                    title = quest.get('title', 'untitled')
                    steps = quest.get('steps', [])

                    print(f"  🎯 {quest_id}: {title}")

                    for step in steps:
                        step_type = step.get('type')
                        if step_type in quest_types:
                            print(f"    ✅ {step_type}")
                        else:
                            print(f"    ⚠️  {step_type} (非目标题型)")

            except Exception as e:
                print(f"❌ 读取 {filename} 时出错: {e}")

def check_component_files():
    """检查组件文件是否存在"""
    components_dir = "/Users/shens/Tools/Quest_G6/src/components/quest-steps"
    required_files = [
        'WordMatchingStep.tsx',
        'SentenceSortingStep.tsx',
        'EnToZhStep.tsx',
        'ZhToEnStep.tsx'
    ]

    print("\n=== 检查组件文件 ===")

    for filename in required_files:
        filepath = os.path.join(components_dir, filename)
        if os.path.exists(filepath):
            print(f"✅ {filename}")
        else:
            print(f"❌ {filename} (缺失)")

def test_quest_data():
    """测试一些题目数据"""
    print("\n=== 测试题目数据示例 ===")

    # 测试模块1
    try:
        with open("/Users/shens/Tools/Quest_G6/public/content/module-01-how-long.json", 'r', encoding='utf-8') as f:
            data = json.load(f)

        quests = data.get('quests', [])
        print(f"模块1包含 {len(quests)} 个题目")

        for quest in quests:
            print(f"\n🎯 {quest['title']}")
            steps = quest.get('steps', [])
            for step in steps:
                step_type = step.get('type')
                print(f"  - {step_type}")

                if step_type == 'wordmatching':
                    pairs = step.get('pairs', [])
                    print(f"    配对数量: {len(pairs)}")
                    print(f"    示例: {pairs[0] if pairs else '无'}")
                elif step_type == 'sentencesorting':
                    scrambled = step.get('scrambled', [])
                    correct = step.get('correct', [])
                    print(f"    单词数量: {len(scrambled)}")
                    print(f"    打乱: {' '.join(scrambled[:3])}...")
                elif step_type == 'entozh':
                    english = step.get('english', '')
                    print(f"    英文: {english}")
                elif step_type == 'zhtoen':
                    chinese = step.get('chinese', '')
                    print(f"    中文: {chinese}")

    except Exception as e:
        print(f"❌ 测试模块1时出错: {e}")

if __name__ == "__main__":
    print("🚀 Quest 应用测试工具")
    print("=" * 50)

    check_module_files()
    check_component_files()
    test_quest_data()

    print("\n" + "=" * 50)
    print("✅ 测试完成！")
    print("📱 应用访问地址:")
    print("   - http://localhost:3000")
    print("   - http://192.168.31.201:3000")
    print("   - http://172.29.244.157:3000")