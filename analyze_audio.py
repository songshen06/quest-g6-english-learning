#!/usr/bin/env python3
import json
import os
import re
import glob

def convert_to_filename(word):
    """Convert a word to filename format using the same logic as ZhToEnStep.tsx"""
    # Convert to lowercase
    word_id = word.lower()
    # Replace spaces with hyphens
    word_id = word_id.replace(' ', '-')
    # Remove special characters except hyphens
    word_id = re.sub(r'[^a-z0-9-]', '', word_id)
    # Replace multiple hyphens with single hyphen
    word_id = re.sub(r'-+', '-', word_id)
    # Remove leading/trailing hyphens
    word_id = word_id.strip('-')
    return word_id

def get_existing_audio_files():
    """Get a set of existing audio filenames without extensions"""
    audio_dir = "/Users/shens/Tools/Quest_G6/public/audio/tts"
    existing_files = set()
    for file_path in glob.glob(os.path.join(audio_dir, "*.mp3")):
        filename = os.path.basename(file_path)
        filename_without_ext = filename[:-4]  # Remove .mp3
        existing_files.add(filename_without_ext)
    return existing_files

def analyze_module_files():
    """Analyze all module files to extract words from sentences"""
    module_files = glob.glob("/Users/shens/Tools/Quest_G6/public/content/module-*.json")
    existing_files = get_existing_audio_files()

    all_missing_audio = {}
    all_word_details = {}

    for module_file in sorted(module_files):
        module_name = os.path.basename(module_file)

        with open(module_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        module_words = set()
        module_word_details = []

        # Analyze quests for sentence sorting and translation exercises
        if 'quests' in data:
            for quest in data['quests']:
                if 'steps' in quest:
                    for step in quest['steps']:
                        step_type = step.get('type', '')

                        # Extract from sentence sorting exercises
                        if step_type == 'sentencesorting':
                            sentence_source = f"{quest['id']} - sentence sorting"
                            scrambled_words = step.get('scrambled', [])
                            correct_words = step.get('correct', [])

                            for word in scrambled_words + correct_words:
                                if word not in module_words:
                                    filename = convert_to_filename(word)
                                    has_audio = filename in existing_files
                                    module_words.add(word)
                                    module_word_details.append({
                                        'word': word,
                                        'filename': filename,
                                        'has_audio': has_audio,
                                        'source': sentence_source,
                                        'module': module_name,
                                        'priority': get_priority(word)
                                    })

                        # Extract from zh-to-en translation exercises
                        elif step_type == 'zhtoen':
                            sentence_source = f"{quest['id']} - zh-to-en translation"
                            scrambled_words = step.get('scrambledEnglish', [])
                            correct_words = step.get('correctEnglish', [])

                            for word in scrambled_words + correct_words:
                                if word not in module_words:
                                    filename = convert_to_filename(word)
                                    has_audio = filename in existing_files
                                    module_words.add(word)
                                    module_word_details.append({
                                        'word': word,
                                        'filename': filename,
                                        'has_audio': has_audio,
                                        'source': sentence_source,
                                        'module': module_name,
                                        'priority': get_priority(word)
                                    })

        # Filter to only missing audio files
        missing_words = [detail for detail in module_word_details if not detail['has_audio']]

        if missing_words:
            all_missing_audio[module_name] = missing_words

        # Store all words for comprehensive analysis
        all_word_details[module_name] = module_word_details

    return all_missing_audio, all_word_details

def get_priority(word):
    """Assign priority to words based on importance"""
    word_lower = word.lower()

    # High priority: basic words, numbers, common verbs, pronouns
    high_priority_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'among', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
        'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that',
        'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'can', 'could',
        'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'do', 'does', 'did', 'have',
        'has', 'had', 'be', 'am', 'is', 'are', 'was', 'were', 'being', 'been', 'go', 'goes',
        'went', 'come', 'comes', 'came', 'see', 'sees', 'saw', 'get', 'gets', 'got', 'make',
        'makes', 'made', 'take', 'takes', 'took', 'give', 'gives', 'gave', 'put', 'puts', 'put',
        'say', 'says', 'said', 'tell', 'tells', 'told', 'ask', 'asks', 'asked', 'know', 'knows',
        'knew', 'think', 'thinks', 'thought', 'want', 'wants', 'wanted', 'like', 'likes', 'liked',
        'love', 'loves', 'loved', 'hate', 'hates', 'hated', 'need', 'needs', 'needed', 'try',
        'tries', 'tried', 'use', 'uses', 'used', 'work', 'works', 'worked', 'play', 'plays',
        'played', 'read', 'reads', 'write', 'writes', 'wrote', 'eat', 'eats', 'ate', 'drink',
        'drinks', 'drank', 'sleep', 'sleeps', 'slept', 'wake', 'wakes', 'woke', 'look', 'looks',
        'looked', 'listen', 'listens', 'listened', 'watch', 'watches', 'watched', 'speak', 'speaks',
        'spoke', 'talk', 'talks', 'talked', 'buy', 'buys', 'bought', 'sell', 'sells', 'sold',
        'open', 'opens', 'opened', 'close', 'closes', 'closed', 'start', 'starts', 'started',
        'stop', 'stops', 'stopped', 'finish', 'finishes', 'finished', 'begin', 'begins', 'began',
        'end', 'ends', 'ended', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
        'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
        'eighteen', 'nineteen', 'twenty', 'hundred', 'thousand', 'million', 'billion', 'first',
        'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
        'good', 'bad', 'big', 'small', 'large', 'little', 'long', 'short', 'tall', 'high', 'low',
        'fast', 'slow', 'hot', 'cold', 'warm', 'cool', 'new', 'old', 'young', 'happy', 'sad',
        'angry', 'excited', 'tired', 'sick', 'healthy', 'beautiful', 'ugly', 'easy', 'difficult',
        'hard', 'soft', 'heavy', 'light', 'dark', 'bright', 'clean', 'dirty', 'quiet', 'loud',
        'empty', 'full', 'right', 'wrong', 'true', 'false', 'yes', 'no', 'maybe', 'always',
        'never', 'sometimes', 'often', 'rarely', 'usually', 'now', 'then', 'today', 'tomorrow',
        'yesterday', 'here', 'there', 'everywhere', 'somewhere', 'nowhere', 'inside', 'outside',
        'up', 'down', 'left', 'right', 'back', 'front', 'north', 'south', 'east', 'west',
        'time', 'day', 'week', 'month', 'year', 'hour', 'minute', 'second', 'morning', 'afternoon',
        'evening', 'night', 'today', 'tomorrow', 'yesterday', 'sunday', 'monday', 'tuesday',
        'wednesday', 'thursday', 'friday', 'saturday', 'january', 'february', 'march', 'april',
        'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
        'spring', 'summer', 'autumn', 'fall', 'winter', 'sun', 'moon', 'star', 'earth', 'world',
        'water', 'fire', 'air', 'land', 'sea', 'ocean', 'river', 'mountain', 'hill', 'forest',
        'tree', 'flower', 'grass', 'animal', 'bird', 'fish', 'dog', 'cat', 'horse', 'cow', 'pig',
        'sheep', 'chicken', 'man', 'woman', 'boy', 'girl', 'child', 'baby', 'family', 'mother',
        'father', 'parent', 'brother', 'sister', 'son', 'daughter', 'friend', 'teacher', 'student',
        'doctor', 'nurse', 'worker', 'farmer', 'driver', 'cook', 'police', 'soldier', 'artist',
        'musician', 'writer', 'reader', 'player', 'runner', 'swimmer', 'climber', 'walker',
        'talker', 'listener', 'helper', 'giver', 'taker', 'maker', 'breaker', 'fixer', 'cleaner',
        'washer', 'dryer', 'heater', 'cooler', 'lighter', 'heavier', 'bigger', 'smaller', 'older',
        'newer', 'better', 'worse', 'best', 'worst', 'more', 'most', 'less', 'least', 'all',
        'some', 'any', 'none', 'every', 'each', 'both', 'neither', 'either', 'only', 'just',
        'also', 'too', 'very', 'quite', 'rather', 'really', 'actually', 'probably', 'possibly',
        'certainly', 'definitely', 'maybe', 'perhaps', 'please', 'thank', 'thanks', 'sorry',
        'excuse', 'hello', 'goodbye', 'yes', 'no', 'okay', 'alright', 'sure', 'of course',
        'how', 'what', 'where', 'when', 'why', 'which', 'who', 'whom', 'whose', 'is', 'am', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'ought', 'need',
        'dare', 'used', 'to', 'it', 'i', 'you', 'we', 'they', 'he', 'she', 'me', 'him', 'her',
        'us', 'them', 'my', 'your', 'our', 'their', 'mine', 'yours', 'hers', 'its', 'this',
        'that', 'these', 'those', 'here', 'there', 'now', 'then', 'today', 'tomorrow', 'yesterday'
    }

    # Medium priority: descriptive words, adjectives, common nouns
    medium_priority_words = {
        'room', 'house', 'home', 'school', 'class', 'lesson', 'book', 'story', 'photo', 'picture',
        'food', 'dinner', 'breakfast', 'lunch', 'water', 'drink', 'eat', 'sleep', 'play', 'work',
        'study', 'learn', 'teach', 'read', 'write', 'listen', 'watch', 'see', 'hear', 'feel',
        'touch', 'smell', 'taste', 'think', 'know', 'understand', 'remember', 'forget', 'believe',
        'hope', 'wish', 'want', 'need', 'like', 'love', 'hate', 'prefer', 'choose', 'decide',
        'agree', 'disagree', 'accept', 'refuse', 'allow', 'forbid', 'help', 'support', 'protect',
        'save', 'lose', 'find', 'search', 'look', 'wait', 'expect', 'surprise', 'worry', 'care',
        'matter', 'mean', 'seem', 'appear', 'become', 'stay', 'remain', 'change', 'grow', 'develop',
        'increase', 'decrease', 'rise', 'fall', 'drop', 'lift', 'push', 'pull', 'carry', 'bring',
        'take', 'give', 'send', 'receive', 'get', 'put', 'place', 'set', 'keep', 'hold', 'catch',
        'throw', 'hit', 'kick', 'break', 'cut', 'tear', 'burn', 'freeze', 'melt', 'flow', 'stop',
        'start', 'begin', 'continue', 'finish', 'end', 'complete', 'success', 'fail', 'win', 'lose'
    }

    if word_lower in high_priority_words:
        return 'HIGH'
    elif word_lower in medium_priority_words:
        return 'MEDIUM'
    else:
        return 'LOW'

def generate_report():
    """Generate comprehensive report of missing audio files"""
    missing_audio, all_word_details = analyze_module_files()

    print("=" * 80)
    print("COMPREHENSIVE AUDIO FILE ANALYSIS REPORT")
    print("=" * 80)
    print()

    total_missing = sum(len(words) for words in missing_audio.values())
    total_words = sum(len(words) for words in all_word_details.values())

    print(f"Total words analyzed: {total_words}")
    print(f"Total missing audio files: {total_missing}")
    print(f"Coverage: {((total_words - total_missing) / total_words * 100):.1f}%")
    print()

    # Sort modules by priority of missing words
    modules_by_priority = {}
    for module_name, missing_words in missing_audio.items():
        high_priority_count = sum(1 for word in missing_words if word['priority'] == 'HIGH')
        medium_priority_count = sum(1 for word in missing_words if word['priority'] == 'MEDIUM')
        low_priority_count = sum(1 for word in missing_words if word['priority'] == 'LOW')

        priority_score = high_priority_count * 10 + medium_priority_count * 5 + low_priority_count * 1
        modules_by_priority[module_name] = {
            'words': missing_words,
            'high_count': high_priority_count,
            'medium_count': medium_priority_count,
            'low_count': low_priority_count,
            'priority_score': priority_score
        }

    # Sort modules by priority score (descending)
    sorted_modules = sorted(modules_by_priority.items(), key=lambda x: x[1]['priority_score'], reverse=True)

    print("MISSING AUDIO FILES BY MODULE (sorted by priority):")
    print("=" * 80)

    for module_name, module_data in sorted_modules:
        missing_words = module_data['words']
        high_count = module_data['high_count']
        medium_count = module_data['medium_count']
        low_count = module_data['low_count']

        print(f"\n📁 {module_name}")
        print(f"   Missing: {len(missing_words)} words (HIGH: {high_count}, MEDIUM: {medium_count}, LOW: {low_count})")
        print("   " + "-" * 70)

        # Group by priority within each module
        high_priority_words = [w for w in missing_words if w['priority'] == 'HIGH']
        medium_priority_words = [w for w in missing_words if w['priority'] == 'MEDIUM']
        low_priority_words = [w for w in missing_words if w['priority'] == 'LOW']

        if high_priority_words:
            print("   🔴 HIGH PRIORITY:")
            for word in sorted(high_priority_words, key=lambda x: x['word']):
                print(f"      - '{word['word']}' → {word['filename']}.mp3 ({word['source']})")

        if medium_priority_words:
            print("   🟡 MEDIUM PRIORITY:")
            for word in sorted(medium_priority_words, key=lambda x: x['word']):
                print(f"      - '{word['word']}' → {word['filename']}.mp3 ({word['source']})")

        if low_priority_words:
            print("   🟢 LOW PRIORITY:")
            for word in sorted(low_priority_words, key=lambda x: x['word']):
                print(f"      - '{word['word']}' → {word['filename']}.mp3 ({word['source']})")

    print("\n" + "=" * 80)
    print("READY-FOR-GENERATE_AUDIO.PY LIST:")
    print("=" * 80)
    print("Copy the following filenames into your generate_audio.py script:")
    print()

    # Generate a consolidated list of all missing filenames
    all_missing_filenames = set()
    for module_name, module_data in sorted_modules:
        for word in module_data['words']:
            all_missing_filenames.add(word['filename'])

    # Sort by priority first, then alphabetically
    high_priority_files = []
    medium_priority_files = []
    low_priority_files = []

    for module_name, module_data in sorted_modules:
        for word in module_data['words']:
            filename = word['filename']
            if filename not in all_missing_filenames:
                continue

            all_missing_filenames.remove(filename)  # Remove to avoid duplicates

            if word['priority'] == 'HIGH':
                high_priority_files.append(filename)
            elif word['priority'] == 'MEDIUM':
                medium_priority_files.append(filename)
            else:
                low_priority_files.append(filename)

    print("# HIGH PRIORITY FILES (generate these first):")
    for filename in sorted(high_priority_files):
        print(f"'{filename}',")

    print("\n# MEDIUM PRIORITY FILES:")
    for filename in sorted(medium_priority_files):
        print(f"'{filename}',")

    print("\n# LOW PRIORITY FILES:")
    for filename in sorted(low_priority_files):
        print(f"'{filename}',")

    print("\n" + "=" * 80)
    print("SUMMARY BY MODULE:")
    print("=" * 80)

    for module_name, module_data in sorted_modules:
        print(f"{module_name}: {module_data['high_count']} high, {module_data['medium_count']} medium, {module_data['low_count']} low priority missing")

if __name__ == "__main__":
    generate_report()