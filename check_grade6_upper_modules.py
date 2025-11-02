#!/usr/bin/env python3
"""
检查六年级上册模块的标点符号处理问题
"""

import json
import os
import re

def has_punctuation_issues(scrambled_list, correct_list):
    """检查是否有标点符号处理问题"""
    if not scrambled_list or not correct_list:
        return False, "No data"

    # 中文标点符号
    chinese_punctuation = r'[，。！？；：""''（）【】《》、]'

    issues = []

    # 检查正确答案中是否有标点符号与其他字符混在一起
    for word in correct_list:
        if re.search(chinese_punctuation, word):
            # 如果这个词包含标点符号，但长度大于1，说明可能有问题
            if len(word) > 1:
                # 检查是否是纯标点符号
                if not re.match(f'^{chinese_punctuation}+$', word):
                    issues.append(f"标点符号混在词语中: '{word}'")

    return len(issues) > 0, issues

def check_module_file(file_path):
    """检查单个模块文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = json.load(f)
    except Exception as e:
        return None, f"Error reading file: {e}"

    module_name = os.path.basename(file_path)
    result = {
        'module': module_name,
        'has_entozh': False,
        'entozh_count': 0,
        'punctuation_issues': [],
        'examples': []
    }

    # 检查所有quests
    quests = content.get('quests', [])
    for quest in quests:
        if quest.get('id') == 'en-to-zh':
            result['has_entozh'] = True
            steps = quest.get('steps', [])
            result['entozh_count'] = len(steps)

            # 检查每个英翻中练习
            for i, step in enumerate(steps):
                scrambled = step.get('scrambledChinese', [])
                correct = step.get('correctChinese', [])

                has_issues, issues = has_punctuation_issues(scrambled, correct)
                if has_issues:
                    result['punctuation_issues'].extend(issues)
                    result['examples'].append({
                        'step': i + 1,
                        'english': step.get('english', 'N/A'),
                        'scrambled': scrambled,
                        'correct': correct,
                        'issues': issues
                    })

    return result, None

def check_grade6_upper_modules():
    """检查六年级上册模块"""
    content_dir = '/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6/src/content'

    print("🔍 检查六年级上册模块的标点符号处理问题...")
    print("=" * 70)

    # 六年级上册模块文件列表
    grade6_upper_files = [
        'module-01-how-long.json',
        'module-02-chinatown-tombs.json',
        'module-03-stamps-hobbies.json',
        'module-04-festivals.json',
        'module-05-pen-friends.json',
        'module-06-school-answers.json',
        'module-07-animals.json',
        'module-08-habits-tidy.json',
        'module-09-peace-un.json',
        'module-10-travel-safety.json'
    ]

    problems_found = False
    modules_with_issues = []

    for filename in grade6_upper_files:
        file_path = os.path.join(content_dir, filename)

        if not os.path.exists(file_path):
            print(f"❌ {filename}: 文件不存在")
            continue

        result, error = check_module_file(file_path)

        if error:
            print(f"❌ {filename}: {error}")
            continue

        if not result['has_entozh']:
            print(f"⚪ {filename}: 没有英翻中练习")
            continue

        print(f"📝 {filename}: {result['entozh_count']}个英翻中练习")

        if result['punctuation_issues']:
            problems_found = True
            modules_with_issues.append(filename)
            print(f"  ❌ 发现标点符号问题:")
            for issue in result['punctuation_issues']:
                print(f"    • {issue}")

            # 显示第一个有问题的例子
            if result['examples']:
                example = result['examples'][0]
                print(f"  📋 示例 (练习{example['step']}):")
                print(f"    英文: {example['english']}")
                print(f"    打乱: {example['scrambled']}")
                print(f"    正确: {example['correct']}")
                print(f"    正确答案: {''.join(example['correct'])}")
        else:
            print(f"  ✅ 标点符号处理正确")

        print()

    print("=" * 70)
    print(f"📊 检查结果:")

    if modules_with_issues:
        print(f"  ❌ 发现 {len(modules_with_issues)} 个模块有标点符号问题:")
        for module in modules_with_issues:
            print(f"    • {module}")
        print(f"\n🔧 建议重新生成这些模块的内容")
        return True
    else:
        print(f"  ✅ 所有检查的模块标点符号处理都正确!")
        return False

if __name__ == "__main__":
    check_grade6_upper_modules()