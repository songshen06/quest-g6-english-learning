#!/usr/bin/env python3
"""
检查所有年级JSON文件的标点符号处理问题
"""

import json
import os
import re
from pathlib import Path

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

def check_all_grades():
    """检查所有年级的模块"""
    content_dir = Path('/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6/src/content')

    print("🔍 检查所有年级JSON文件的标点符号处理问题...")
    print("=" * 80)

    # 查找所有JSON文件
    all_files = list(content_dir.glob('*.json'))

    # 按年级分类
    grade_files = {
        'grade1-lower': [],
        'grade1-upper': [],
        'grade2-lower': [],
        'grade2-upper': [],
        'grade3-lower': [],
        'grade3-upper': [],
        'grade4-lower': [],
        'grade4-upper': [],
        'grade5-lower': [],
        'grade5-upper': [],
        'grade6-lower': [],
        'grade6-upper': [],
        'module': [],  # 六年级上册的module-*文件
        'others': []   # 其他文件
    }

    # 分类文件
    for file_path in all_files:
        filename = file_path.name

        if filename.startswith('module-'):
            grade_files['module'].append(file_path)
        elif filename.startswith('grade1-lower'):
            grade_files['grade1-lower'].append(file_path)
        elif filename.startswith('grade1-upper'):
            grade_files['grade1-upper'].append(file_path)
        elif filename.startswith('grade2-lower'):
            grade_files['grade2-lower'].append(file_path)
        elif filename.startswith('grade2-upper'):
            grade_files['grade2-upper'].append(file_path)
        elif filename.startswith('grade3-lower'):
            grade_files['grade3-lower'].append(file_path)
        elif filename.startswith('grade3-upper'):
            grade_files['grade3-upper'].append(file_path)
        elif filename.startswith('grade4-lower'):
            grade_files['grade4-lower'].append(file_path)
        elif filename.startswith('grade4-upper'):
            grade_files['grade4-upper'].append(file_path)
        elif filename.startswith('grade5-lower'):
            grade_files['grade5-lower'].append(file_path)
        elif filename.startswith('grade5-upper'):
            grade_files['grade5-upper'].append(file_path)
        elif filename.startswith('grade6-lower'):
            grade_files['grade6-lower'].append(file_path)
        elif filename.startswith('grade6-upper'):
            grade_files['grade6-upper'].append(file_path)
        else:
            grade_files['others'].append(file_path)

    total_modules = 0
    modules_with_entozh = 0
    modules_with_issues = 0
    issues_summary = {}
    problem_files = []

    # 按年级检查
    for grade_name, files in sorted(grade_files.items()):
        if not files:
            continue

        print(f"\n📚 检查 {grade_name} (共{len(files)}个文件):")
        print("-" * 50)

        grade_issues = 0
        grade_entozh = 0

        for file_path in sorted(files):
            total_modules += 1
            result, error = check_module_file(file_path)

            if error:
                print(f"  ❌ {os.path.basename(file_path)}: {error}")
                continue

            if result['has_entozh']:
                grade_entozh += 1
                modules_with_entozh += 1

            if result['punctuation_issues']:
                grade_issues += 1
                modules_with_issues += 1
                problem_files.append(file_path)
                issues_summary[os.path.basename(file_path)] = {
                    'grade': grade_name,
                    'issues_count': len(result['punctuation_issues']),
                    'examples_count': len(result['examples']),
                    'entozh_count': result['entozh_count']
                }

                print(f"  ❌ {os.path.basename(file_path)}: {result['entozh_count']}个英翻中练习, {len(result['punctuation_issues'])}个标点问题")

                # 显示第一个有问题的例子
                if result['examples']:
                    example = result['examples'][0]
                    print(f"      示例: {example['english']}")
                    print(f"      问题: {example['issues'][0]}")
            else:
                if result['has_entozh']:
                    print(f"  ✅ {os.path.basename(file_path)}: {result['entozh_count']}个英翻中练习, 标点正确")
                else:
                    print(f"  ⚪ {os.path.basename(file_path)}: 无英翻中练习")

        if grade_entozh > 0:
            print(f"  📊 {grade_name}: {grade_entozh}个模块有英翻中, {grade_issues}个有问题")

    print("\n" + "=" * 80)
    print("📊 总体统计:")
    print(f"  总模块数: {total_modules}")
    print(f"  有英翻中练习的模块: {modules_with_entozh}")
    print(f"  有标点符号问题的模块: {modules_with_issues}")

    if issues_summary:
        print(f"\n❌ 需要修复的模块 ({len(issues_summary)}个):")

        # 按年级分组显示
        grades_with_issues = {}
        for filename, info in issues_summary.items():
            grade = info['grade']
            if grade not in grades_with_issues:
                grades_with_issues[grade] = []
            grades_with_issues[grade].append((filename, info))

        for grade, files in sorted(grades_with_issues.items()):
            print(f"\n  📖 {grade}:")
            for filename, info in files:
                print(f"    • {filename} ({info['issues_count']}个问题, {info['examples_count']}个例子, {info['entozh_count']}个英翻中练习)")

        print(f"\n🔧 需要修复的文件路径:")
        for file_path in problem_files:
            print(f"  • {file_path}")

        return problem_files
    else:
        print(f"\n✅ 所有模块的标点符号处理都正确!")
        return []

if __name__ == "__main__":
    problem_files = check_all_grades()

    if problem_files:
        print(f"\n⚠️  发现 {len(problem_files)} 个文件需要修复")
        print("建议运行修复工具进行修复")
    else:
        print("\n🎉 所有检查通过!")