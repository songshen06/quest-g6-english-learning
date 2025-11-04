#!/usr/bin/env python3
"""
为 Module 04-10 的英翻中练习生成音频文件
"""

import sys
from pathlib import Path

# 导入 CoquiAudioGenerator 类
from generate_missing_audio import CoquiAudioGenerator

def main():
    """主函数"""
    print("🎵 为 Module 04-10 的英翻中练习生成音频文件")

    # 创建生成器实例
    generator = CoquiAudioGenerator()

    # 确保输出目录存在
    generator.output_dir.mkdir(parents=True, exist_ok=True)

    # Module 04-10 的所有英翻中句子
    sentences = [
        # Module 04: Festivals
        {"filename": "what-do-you-do-on-thanksgiving-day.mp3", "text": "What do you do on Thanksgiving day?"},
        {"filename": "we-always-have-a-big-special-dinner.mp3", "text": "We always have a big, special dinner."},
        {"filename": "whats-your-favourite-festival.mp3", "text": "What's your favourite festival?"},

        # Module 05: Pen Friends
        {"filename": "she-can-speak-some-english.mp3", "text": "She can speak some English."},
        {"filename": "can-i-write-to-her-of-course-you-can-write-to-her-in-english.mp3", "text": "Can I write to her? Of course. You can write to her in English."},
        {"filename": "pleased-to-meet-you.mp3", "text": "Pleased to meet you!"},
        {"filename": "pleased-to-meet-you-too.mp3", "text": "Pleased to meet you too!"},

        # Module 06: School Answers
        {"filename": "ive-got-some-chinese-chopsticks.mp3", "text": "I've got some Chinese chopsticks."},
        {"filename": "my-brother-has-got-a-chinese-kite.mp3", "text": "My brother has got a Chinese kite."},
        {"filename": "have-you-got-a-book-about-the-us.mp3", "text": "Have you got a book about the US?"},
        {"filename": "yes-i-have-its-very-interesting.mp3", "text": "Yes, I have. It's very interesting."},

        # Module 07: Animals
        {"filename": "pandas-love-bamboo-they-eat-for-twelve-hours-a-day.mp3", "text": "Pandas love bamboo. They eat for twelve hours a day!"},
        {"filename": "do-snakes-love-music-no-they-dont-theyre-almost-deaf.mp3", "text": "Do snakes love music? No, they don't. They're almost deaf!"},
        {"filename": "what-do-pandas-eat.mp3", "text": "What do pandas eat?"},
        {"filename": "pandas-eat-bamboo.mp3", "text": "Pandas eat bamboo."},

        # Module 08: Habits Tidy
        {"filename": "do-you-often-tidy-your-bed-yes-every-day.mp3", "text": "Do you often tidy your bed? Yes, every day."},
        {"filename": "do-you-often-read-stories.mp3", "text": "Do you often read stories?"},
        {"filename": "yes-i-read-stories-every-day.mp3", "text": "Yes. I read stories every day."},
        {"filename": "how-often-do-you-clean-your-room.mp3", "text": "How often do you clean your room?"},
        {"filename": "i-always-clean-my-room-on-weekends.mp3", "text": "I always clean my room on weekends."},

        # Module 09: Peace UN
        {"filename": "is-this-the-un-building-yes-its-a-very-important-building-in-new-york.mp3", "text": "Is this the UN building? Yes. It's a very important building in New York."},
        {"filename": "the-un-wants-to-make-peace-in-the-world.mp3", "text": "The UN wants to make peace in the world."},
        {"filename": "china-is-one-of-the-193-member-states-in-the-un.mp3", "text": "China is one of the 193 member states in the UN."},
        {"filename": "the-un-building-is-in-new-york-city.mp3", "text": "The UN building is in New York City."},

        # Module 10: Travel Safety
        {"filename": "only-drink-clean-water.mp3", "text": "Only drink clean water!"},
        {"filename": "this-water-is-very-clean-its-fun-to-drink-this-way.mp3", "text": "This water is very clean. It's fun to drink this way."},
        {"filename": "dont-cross-the-road-here.mp3", "text": "Don't cross the road here!"},
        {"filename": "cross-at-the-traffic-lights.mp3", "text": "Cross at the traffic lights."}
    ]

    print(f"📝 将生成 {len(sentences)} 个音频文件:")
    print("=" * 60)

    generated_count = 0
    skipped_count = 0

    for i, sentence in enumerate(sentences):
        filename = sentence["filename"]
        text = sentence["text"]

        print(f"[{i+1}/{len(sentences)}] 生成: {filename}")
        print(f"   文本: '{text}'")

        # 检查文件是否已存在
        output_path = generator.output_dir / filename
        if output_path.exists():
            print(f"   ⏭️ 跳过已存在: {filename}")
            skipped_count += 1
            generated_count += 1
            print()
            continue

        # 使用 Coqui TTS 生成音频
        success = generator.generate_coqui_tts(filename, text)

        if success:
            # 检查生成的文件
            if output_path.exists():
                file_size = output_path.stat().st_size
                print(f"   ✅ 成功生成，文件大小: {file_size} bytes")
                generated_count += 1
            else:
                print(f"   ⚠️ 警告: 生成成功但文件不存在")
        else:
            print(f"   ❌ 生成失败")

        print()

    # 清理临时文件
    generator.cleanup()

    print("=" * 60)
    print(f"🎉 音频生成完成！")
    print(f"   总计: {len(sentences)}")
    print(f"   成功: {generated_count}")
    print(f"   跳过: {skipped_count}")
    print()
    print("📂 现在所有 Module 04-10 的英翻中练习都有音频播放功能了！")
    print("🎵 学生可以先听英文句子发音，然后做中文翻译练习")

if __name__ == "__main__":
    main()