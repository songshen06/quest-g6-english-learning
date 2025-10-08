超赞的方向！把它做成互动的 web app，最关键是先把“可复用的素材与结构”准备齐全，这样内容能持续扩展（Module 1…N）。下面给你一份**一次性准备清单 + 数据结构样例 + 组件蓝图**，照着做就能很快开工。

# 🎯 产品核心循环（为 ADHD 友好而设计）

1. 进入关卡 → 2) 解锁“技能卡”（短语/动作）→ 3) 触发小任务（10–15 分钟）→ 4) 立即反馈与奖励 → 5) 记录进度与徽章
   可随时暂停、随时完成，不“堆量”。

---

# 🧰 一次性素材清单（按类目）

## 1) 内容与数据

* **模块内容 JSON**：单词、短语、句型、任务步骤、练习题、奖励规则、配图/音频引用。
* **可视化脚本**（家长/老师用）：每张“技能卡”的动作说明、家中可执行小任务文案。
* **音频台词稿**：TTS 或真人配音用（简短、节奏清晰）。
* **翻译与提示**：中英对照、易错点、发音提示（重音/连读）。

## 2) 视觉素材

* **图标集**：技能按钮、奖励、徽章、难度星级、计时器、完成/失败状态（建议统一线性风格）。
* **插画/配图**：

  * 地标（帝国大厦、长城）示意图（非侵权，尽量自制简笔）
  * 抽象动词图标：look at / near / along / climb …
* **“技能卡”模板**：卡面（标题、图标、示例句、动作说明、贴纸位）。
* **奖励美术**：徽章、贴纸（星星、盾牌、宝箱）。

## 3) 音频与交互

* **提示音**：解锁、正确、再试一次、通关。
* **BGM（可选）**：极简循环背景乐 + 音量开关（避免过度刺激）。
* **语音朗读**：单词、短语、句型（mp3/wav），时长 1–3 秒为宜。

## 4) UI 与可访问性

* **高对比度主题**（深/浅两套）+ **字体预设**（清晰、无衬线）。
* **大按钮**、**可切换字号**、**行距加宽**。
* **色弱安全色板**（红绿不做唯一区分）。
* **离线图标**（PWA 可选）。

## 5) 行为与进度

* **奖励规则表**：完成任务数→解锁哪枚徽章、多少贴纸。
* **日历/打卡贴纸**：每日 1 小关即可通关，防止“堆量焦虑”。
* **家长面板素材**：进度图（环形/条形）、学习时长、错误Top3 短语。

---

# 📦 目录与命名建议

```
/public
  /images
    /icons (svg)
    /skills (短语技能插画)
    /landmarks (GreatWall, EmpireState...)
    /rewards (badges, stickers)
  /audio
    /tts (单词/短语/句型)
    /sfx (unlock, correct, retry, win)
/content
  module-01-how-long.json
  module-02-...json
/src
  /components
  /pages
  /store
  /utils
  /i18n
```

---

# 🧱 数据结构样例（Module 1: How long?）

> 你可以直接把下面这段存为 `/content/module-01-how-long.json`，后续只要“换数据不改代码”。

```json
{
  "moduleId": "mod-01",
  "title": "How long?",
  "durationMinutes": 10,
  "words": [
    {"id": "how-long", "en": "how long", "zh": "多长", "audio": "/audio/tts/how-long.mp3"},
    {"id": "near", "en": "near", "zh": "在……附近", "audio": "/audio/tts/near.mp3"},
    {"id": "along", "en": "along", "zh": "沿着", "audio": "/audio/tts/along.mp3"},
    {"id": "more-than", "en": "more than", "zh": "超过", "audio": "/audio/tts/more-than.mp3"},
    {"id": "kilometre", "en": "kilometre", "zh": "千米", "audio": "/audio/tts/kilometre.mp3"},
    {"id": "metre", "en": "metre", "zh": "米", "audio": "/audio/tts/metre.mp3"}
  ],
  "phrases": [
    {"id": "look-at", "en": "look at", "zh": "看", "icon": "/images/icons/look.svg", "audio": "/audio/tts/look-at.mp3"},
    {"id": "empire-state", "en": "the Empire State Building", "zh": "帝国大厦", "icon": "/images/landmarks/empire-state.png"},
    {"id": "400m-high", "en": "four hundred metres high", "zh": "四百米高"},
    {"id": "climb-stairs", "en": "climb the stairs to the top", "zh": "爬楼梯到顶部"}
  ],
  "patterns": [
    {"q": "How long is the Great Wall?", "a": "It's more than forty thousand li long."},
    {"q": "How old is it?", "a": "It's more than two thousand years old."}
  ],
  "quests": [
    {
      "id": "great-wall",
      "title": "The Great Wall Quest",
      "steps": [
        {"type": "listen", "text": "How long is the Great Wall?", "audio": "/audio/tts/how-long-great-wall.mp3"},
        {"type": "select", "text": "Choose the correct answer", "options": [
          "It’s more than forty thousand li long.",
          "It’s four hundred metres high."
        ], "answerIndex": 0},
        {"type": "speak", "text": "Say: How old is it?", "recordable": true},
        {"type": "reveal", "text": "It's more than two thousand years old."}
      ],
      "reward": {"badge": "/images/rewards/ancient-stone.png", "xp": 10}
    },
    {
      "id": "empire-state",
      "title": "Empire State Challenge",
      "steps": [
        {"type": "show", "image": "/images/landmarks/empire-state.png", "text": "Look at the Empire State Building."},
        {"type": "drag", "text": "Drag the label to the picture: four hundred metres high", "target": "height"},
        {"type": "action", "text": "Do the gesture: climb the stairs to the top (simulate steps)!"}
      ],
      "reward": {"badge": "/images/rewards/sky-badge.png", "xp": 10}
    }
  ],
  "practice": [
    {"type": "fillblank", "text": "The Empire State Building is in ________", "answer": "New York"},
    {"type": "fillblank", "text": "The Great Wall is ________ 40,000 li long.", "answer": "more than"},
    {"type": "translate", "cn": "长城有多古老？ 它有两千多年历史。", "en": ["How old is the Great Wall?", "It's more than two thousand years old."]}
  ],
  "funFacts": [
    "The Great Wall is more than 21,000 kilometres long.",
    "The Empire State Building was built in 1931 and is about 381 metres high."
  ]
}
```

---

# 🧩 关键组件蓝图（无需立刻写代码）

* **ModuleLoader**：读取 JSON，注入到状态管理。
* **WordCard / PhraseCard**：展示词/短语，按钮可播放音频、放大图片。
* **QuestRunner**：按 `steps` 类型渲染（listen/select/speak/drag/action/reveal）。
* **TimerBar**：10–15 分钟视觉计时（可隐藏，避免压力）。
* **RewardsModal**：解锁徽章/贴纸，点击“收集”入册。
* **ProgressPanel（家长）**：已学单词数、完成关卡、错题回看。
* **Settings**：字体大小、配色模式、BGM/音效、动效强度（ADHD 友好）。

---

# ⚙️ 技术与配置建议

* **前端栈**：React + Vite + Tailwind；状态管理用 Zustand；路由用 React Router。
* **UI 库**：shadcn/ui + lucide-react（图标）
* **音频**：HTMLAudioElement 简单封装（支持一次只播一个，避免噪声）。
* **本地存储**：LocalStorage/IndexedDB 存存档（进度、徽章、错题）。
* **PWA（可选）**：离线运行、安装到平板。
* **国际化**：i18n JSON（中文提示可开关）。
* **无障碍**：ARIA label、键盘可操作、焦点明显。

---

# 🧠 ADHD 友好开关（建议做成“设置”里的选项）

* **低刺激模式**：关闭背景动画、减少粒子效果。
* **大字模式**：字号 + 行距一键增大。
* **简化模式**：每次只显示 1–2 个选项，避免干扰。
* **立即反馈**：答题后 0.2–0.5s 内出结果 + 正向提示音。
* **微任务节奏**：每关 ≤ 10 分钟，系统鼓励“明天再来一关”。

---

# 🚀 实施路线（从 MVP 起步）

**MVP（1–2 周）**

* 支持加载 1 个模块 JSON（如 Module 1）
* Word/Phrase 卡片 + 2 个 Quest step 类型（listen/select）
* 简单奖励弹窗 + 本地进度保存

**V1（再加 1–2 周）**

* 拖拽题 / 语音录制 step（可先占位按钮）
* 家长面板（统计+错题）
* PWA + 主题/字号设置
* 模块切换与关卡地图（线性解锁）

---

# ✅ 你现在需要准备的“素材打包清单”

1. **module-01-how-long.json**（按上面的结构来）
2. 词/短语配图（SVG/PNG，256–512px）、地标简图、奖励徽章
3. TTS/配音音频（mp3）：单词/短语/句型/指令
4. 提示音效（unlock/correct/retry/win 各 1 个）
5. 技能卡打印稿（可选，线下练习时用）
6. 颜色与字体基线（深/浅各一套）

---

如果你愿意，我可以把上面的 **JSON 模板**扩成一个“空白模板 + 校验规则（必填字段）”，这样你只要往里填内容就能批量生成各个 Module 的关卡。需要的话告诉我，你用“Excel/表格填内容导出 JSON”的方式也可以，我给你映射字段表。

