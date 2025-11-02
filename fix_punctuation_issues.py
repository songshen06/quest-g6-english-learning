#!/usr/bin/env python3
"""
修复JSON文件中的标点符号处理问题
"""

import json
import os
import re
import shutil
from datetime import datetime

class PunctuationFixer:
    def __init__(self):
        # 中文标点符号集合
        self.chinese_punctuation = r'[，。！？；：""''（）【】《》、]'
        self.punctuation_pattern = re.compile(f'({self.chinese_punctuation})')

    def split_chinese_sentence(self, sentence):
        """智能分割中文句子，将标点符号独立处理"""
        if not sentence:
            return []

        # 第一步：提取并分割标点符号
        parts = re.split(self.punctuation_pattern, sentence)

        # 第二步：处理非标点符号部分，按词语分割
        result = []
        for part in parts:
            if not part:  # 跳过空字符串
                continue
            elif re.match(self.chinese_punctuation, part):  # 如果是标点符号
                result.append(part)
            else:  # 如果是文字部分
                # 移除可能的空格，然后按常见分词规则分割
                clean_part = part.strip()
                if clean_part:
                    # 简单的中文分词逻辑：
                    # 1. 先尝试按空格分割
                    words = clean_part.split()
                    if len(words) > 1:
                        result.extend(words)
                    else:
                        # 2. 如果没有空格，尝试按常见的词语边界分割
                        text = clean_part
                        i = 0
                        while i < len(text):
                            # 优先尝试3字词
                            if i + 3 <= len(text) and text[i:i+3] in ['做什么', '干什么', '怎么做', '为什么', '怎么样', '有多长']:
                                result.append(text[i:i+3])
                                i += 3
                            # 然后尝试2字词
                            elif i + 2 <= len(text) and text[i:i+2] in ['我们', '你们', '他们', '什么', '怎么', '为什么', '这样', '那样', '这里', '那里', '现在', '正在', '已经', '可以', '应该', '需要', '想要', '喜欢', '知道', '明白', '理解', '学习', '工作', '生活', '回家', '吃饭', '睡觉', '起床', '出门', '进门', '上楼', '下楼', '开门', '关门', '开灯', '关灯', '长城', '历史', '很长', '很长', '邮票', '册里']:
                                result.append(text[i:i+2])
                                i += 2
                            else:
                                # 单字处理
                                result.append(text[i])
                                i += 1

        # 过滤掉空字符串
        result = [word for word in result if word.strip()]

        return result

    def fix_file(self, file_path, backup=True):
        """修复单个文件的标点符号问题"""
        try:
            # 读取文件
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)

            module_name = os.path.basename(file_path)
            print(f"\n🔧 修复 {module_name}...")

            changes_made = False

            # 遍历所有quests
            quests = content.get('quests', [])
            for quest in quests:
                if quest.get('id') == 'en-to-zh':
                    steps = quest.get('steps', [])

                    for step_idx, step in enumerate(steps):
                        # 获取原始数据
                        original_scrambled = step.get('scrambledChinese', [])
                        original_correct = step.get('correctChinese', [])
                        english = step.get('english', 'N/A')

                        # 重新生成正确答案
                        correct_text = ''.join(original_correct)
                        new_correct = self.split_chinese_sentence(correct_text)

                        # 重新生成打乱答案（基于新的正确答案）
                        if len(new_correct) >= 2:
                            new_scrambled = new_correct[1:] + [new_correct[0]]
                        else:
                            new_scrambled = new_correct

                        # 检查是否有变化
                        if (original_scrambled != new_scrambled or
                            original_correct != new_correct):

                            changes_made = True

                            print(f"  📝 练习 {step_idx + 1}: {english}")
                            print(f"    原始打乱: {original_scrambled}")
                            print(f"    原始正确: {original_correct}")
                            print(f"    新的打乱: {new_scrambled}")
                            print(f"    新的正确: {new_correct}")
                            print(f"    原答案: {''.join(original_correct)}")
                            print(f"    新答案: {''.join(new_correct)}")
                            print()

                            # 更新数据
                            step['scrambledChinese'] = new_scrambled
                            step['correctChinese'] = new_correct

            if changes_made:
                # 备份原文件
                if backup:
                    backup_path = f"{file_path}.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
                    shutil.copy2(file_path, backup_path)
                    print(f"  💾 已备份到: {os.path.basename(backup_path)}")

                # 写入修复后的文件
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(content, f, ensure_ascii=False, indent=2)

                print(f"  ✅ {module_name} 修复完成!")
                return True
            else:
                print(f"  ⚪ {module_name} 没有需要修复的问题")
                return False

        except Exception as e:
            print(f"  ❌ 修复 {module_name} 时出错: {e}")
            return False

    def fix_files(self, file_paths):
        """修复多个文件"""
        print("🔧 开始修复标点符号处理问题...")
        print("=" * 70)

        fixed_count = 0
        total_count = len(file_paths)

        for file_path in file_paths:
            if self.fix_file(file_path):
                fixed_count += 1

        print("=" * 70)
        print(f"📊 修复完成:")
        print(f"  总文件数: {total_count}")
        print(f"  成功修复: {fixed_count}")
        print(f"  无需修复: {total_count - fixed_count}")

        return fixed_count > 0

def main():
    """主函数"""
    fixer = PunctuationFixer()

    # 五年级下册需要修复的文件
    files_to_fix = [
        '/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6/src/content/grade5-lower-mod-03-library-borrow.json',
        '/Users/shens/Library/CloudStorage/OneDrive-NVIDIACorporation/Tools/Quest_G6/src/content/grade5-lower-mod-07-jobs-time.json'
    ]

    # 检查文件是否存在
    existing_files = []
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            existing_files.append(file_path)
        else:
            print(f"❌ 文件不存在: {file_path}")

    if not existing_files:
        print("❌ 没有找到需要修复的文件")
        return

    # 修复文件
    fixer.fix_files(existing_files)

if __name__ == "__main__":
    main()