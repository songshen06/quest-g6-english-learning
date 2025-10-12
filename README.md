# Quest G6 - 外研社（一年级起）英语学习系统

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)

## 项目简介

Quest G6 是一个基于外研社（一年级起）教材的英语学习系统，目前完整覆盖小学4-6年级内容。系统采用现代化前端技术栈，提供互动式学习体验，包括词汇学习、句子练习、听力训练等多种学习模式。

### 🎯 核心特性

- ✅ **完整课程覆盖**：外研社（一年级起）4-6年级完整覆盖
- 🎵 **高清音频**：978个高质量音频文件，支持听力训练
- 🎮 **互动学习**：词汇匹配、句子排序、翻译练习等多种任务类型
- 📱 **响应式设计**：支持桌面端和移动端设备
- 🚀 **PWA支持**：可安装为应用程序，离线使用
- 🔊 **语音合成**：集成Coqui TTS和Whisper ASR技术
- 📊 **进度追踪**：实时学习进度和成就系统

## 技术架构

### 前端技术栈
- **React 18.2.0** - 现代化UI框架
- **TypeScript 5.2.2** - 类型安全的JavaScript
- **Vite 5.0.8** - 快速构建工具
- **Tailwind CSS 3.3.6** - 实用优先的CSS框架
- **React Router 6.20.1** - 客户端路由
- **Zustand 4.4.7** - 轻量级状态管理

### 音频技术
- **Coqui TTS** - 高质量文本转语音
- **Whisper ASR** - 语音识别验证
- **VITS模型** - 神经网络语音合成

### 部署技术
- **PWA** - 渐进式Web应用
- **Service Worker** - 离线缓存策略
- **Static Hosting** - 静态资源托管

## 快速开始

### 环境要求
- Node.js 16.0+
- npm 8.0+

### 安装依赖
```bash
git clone https://github.com/your-username/quest-g6.git
cd quest-g6
npm install
```

### 开发环境
```bash
npm run dev
```
访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 课程内容

### 年级覆盖
- **四年级（下册）**：10个模块
- **四年级（上册）**：10个模块
- **五年级（下册）**：10个模块
- **五年级（上册）**：10个模块
- **六年级（下册）**：12个模块

**总计**：42个完整学习模块

### 模块结构
每个学习模块包含：
- 📖 **核心词汇**：10-15个重点单词
- 🗣️ **实用短语**：日常交流句型
- 📝 **练习任务**：4种不同类型的练习
  - 词汇匹配 (Vocabulary Matching)
  - 句子排序 (Sentence Sorting)
  - 中译英 (Chinese to English)
  - 英译中 (English to Chinese)
- 🎵 **音频支持**：所有内容配套高清音频

## 音频系统

### 音频文件统计
- **总音频文件**：978个
- **覆盖范围**：单词、短语、句子、任务指令
- **音频格式**：MP3
- **音质**：高清（44.1kHz）

### 音频命名规范
```
word-{单词}.mp3          # 单词音频
phrase-{短语标识}.mp3     # 短语音频
pattern-{句型标识}.mp3    # 句型音频
quest-{任务类型}.mp3      # 任务指令音频
```

### 音频生成
系统支持自动音频生成：
```bash
python generate_elementary_audio.py --project-root . --mode generate
```

## 二次开发指南

### 扩充课程内容

如需扩充其他年级或教材内容，请按照以下标准格式创建JSON文件：

#### 1. 文件位置
新课程文件应放置在 `src/content/` 目录下

#### 2. 文件命名规范
```
{年级}-{册别}-mod-{编号:02d}-{主题标识}.json
```
示例：`grade7-lower-mod-01-new-topic.json`

#### 3. JSON文件结构

```json
{
  "moduleId": "grade7-lower-mod-01-new-topic",
  "title": "模块标题",
  "description": "模块描述",
  "grade": "7",
  "semester": "lower",
  "words": [
    {
      "id": "word-001",
      "english": "example",
      "chinese": "例子",
      "pronunciation": "/ɪɡˈzæmpəl/",
      "audio": "word-example.mp3",
      "example": "This is an example.",
      "type": "vocabulary"
    }
  ],
  "phrases": [
    {
      "id": "phrase-001",
      "english": "for example",
      "chinese": "例如",
      "audio": "phrase-for-example.mp3",
      "usage": "We can learn, for example, from history."
    }
  ],
  "patterns": [
    {
      "id": "pattern-001",
      "english": "This is a {noun}.",
      "chinese": "这是一个{名词}。",
      "audio": "pattern-this-is-a.mp3",
      "placeholder": "noun"
    }
  ],
  "quests": [
    {
      "id": "quest-001",
      "type": "vocabulary-matching",
      "title": "词汇匹配",
      "instructions": {
        "english": "Match the English words with their Chinese meanings.",
        "chinese": "将英文单词与中文意思匹配。"
      },
      "steps": [
        {
          "type": "match",
          "question": "example",
          "options": ["例子", "练习", "测试", "学习"],
          "answer": "例子",
          "audio": "quest-match-example.mp3"
        }
      ]
    }
  ]
}
```

#### 4. 必填字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| moduleId | string | ✅ | 模块唯一标识符 |
| title | string | ✅ | 模块标题 |
| grade | string | ✅ | 年级（"4", "5", "6", "7"等） |
| semester | string | ✅ | 学期（"lower", "upper"） |
| words | array | ✅ | 词汇列表 |
| phrases | array | ✅ | 短语列表 |
| patterns | array | ✅ | 句型列表 |
| quests | array | ✅ | 练习任务列表 |

#### 5. 数据导入

创建新的JSON文件后，使用以下命令导入：

```bash
npm run import-book --validate
```

系统会自动验证文件格式并更新课程索引。

#### 6. 音频文件生成

导入新的课程内容后，生成对应的音频文件：

```bash
python generate_elementary_audio.py --project-root . --mode generate
```

### 代码开发

#### 项目结构
```
src/
├── components/          # 可复用组件
│   ├── ModuleCard.tsx   # 模块卡片组件
│   ├── AudioPlayer.tsx  # 音频播放器
│   └── TaskRenderer.tsx # 任务渲染器
├── pages/              # 页面组件
│   ├── ModulesPage.tsx # 模块列表页
│   └── BookModulesPage.tsx # 书籍模块页
├── data/               # 数据文件
│   └── books.ts        # 书籍配置
├── content/            # 课程内容
│   └── *.json          # 模块JSON文件
└── utils/              # 工具函数
```

#### 添加新功能

1. **组件开发**：在 `src/components/` 中创建新组件
2. **页面开发**：在 `src/pages/` 中创建新页面
3. **路由配置**：在 `src/App.tsx` 中添加新路由
4. **状态管理**：使用 Zustand 管理全局状态
5. **样式开发**：使用 Tailwind CSS 类名

### 构建和部署

#### 开发环境
```bash
npm run dev          # 启动开发服务器
npm run lint         # 代码检查
```

#### 生产构建
```bash
npm run build        # 构建生产版本
npm run preview      # 预览构建结果
```

#### 部署选项

1. **静态托管**：构建后部署到 Vercel、Netlify 等
2. **CDN部署**：上传 `dist/` 目录到CDN
3. **服务器部署**：使用 nginx 或 Apache 托管静态文件

## 版本历史

### v2.2.0 (2025-10-12) - 外研社完整覆盖版
- 🎯 **完整覆盖**：外研社（一年级起）4-6年级完整覆盖（42个模块）
- 🎵 **音频升级**：新增978个高质量音频文件
- 🔧 **技术优化**：修复Coqui TTS模型兼容性问题
- 📚 **内容完善**：修复Grade 4模块任务生成问题
- 🧪 **测试增强**：添加前端渲染和功能完整性测试
- 📖 **文档完善**：新增二次开发指南和标准格式文档

### v2.1.0 - 基础版本
- ✨ 初始版本发布
- 🎵 基础音频播放功能
- 📱 响应式界面设计
- 🗂️ 基础课程内容管理

## 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件使用函数式写法
- 样式使用 Tailwind CSS 类名

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请通过以下方式联系：

- 📧 邮箱：your-email@example.com
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-username/quest-g6/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/your-username/quest-g6/discussions)

## 致谢

感谢外研社提供优质的英语教材内容，以及开源社区的技术支持。

---

**Quest G6 v2.2.0** - 让英语学习更加有趣和高效！ 🚀