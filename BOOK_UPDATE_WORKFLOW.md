# 📚 最新书籍更新流程

## 🚀 推荐流程：自动化方式 (2步完成)

### 第一步：准备模块文件
1. **创建10个JSON模块文件**
   ```
   src/content/
   ├── grade5-upper-mod-01-school-life.json
   ├── grade5-upper-mod-02-family-friends.json
   ├── grade5-upper-mod-03-food-drinks.json
   ├── grade5-upper-mod-04-animals-pets.json
   ├── grade5-upper-mod-05-sports-games.json
   ├── grade5-upper-mod-06-weather-seasons.json
   ├── grade5-upper-mod-07-hobbies-interests.json
   ├── grade5-upper-mod-08-daily-routine.json
   ├── grade5-upper-mod-09-holidays-festivals.json
   └── grade5-upper-mod-10-review-test.json
   ```

2. **JSON文件格式要求**
   ```json
   {
     "moduleId": "grade5-upper-mod-01",
     "title": "School Life",
     "durationMinutes": 25,
     "words": [
       {
         "id": "school",
         "en": "school",
         "zh": "学校",
         "audio": "/audio/tts/school.mp3"
       }
     ],
     "phrases": [
       {
         "id": "go-to-school",
         "en": "go to school",
         "zh": "去上学",
         "icon": "/images/icons/school.svg",
         "audio": "/audio/tts/go-to-school.mp3"
       }
     ],
     "quests": [
       {
         "id": "vocabulary-practice",
         "title": "词汇练习",
         "steps": [
           {
             "type": "wordmatching",
             "text": "将英语单词与中文意思配对",
             "pairs": [{"en": "school", "zh": "学校"}],
             "options": [{"en": "home", "zh": "家"}]
           }
         ],
         "reward": {
           "badge": "/images/rewards/vocab-badge.png",
           "xp": 10
         }
       }
     ]
   }
   ```

### 第二步：运行自动化脚本
```bash
npm run import-book
```

**脚本自动完成：**
- ✅ 扫描 `src/content/` 目录中的所有JSON模块文件
- ✅ 解析文件名，识别年级、学期、单元信息
- ✅ 按书籍分组模块（每本书10个单元）
- ✅ 自动更新 `src/data/books.ts` - 生成完整书籍配置
- ✅ 自动更新 `src/pages/BookModulesPage.tsx` - 生成模块导入语句
- ✅ 自动更新 `src/pages/ModulePage.tsx` - 创建模块映射关系
- ✅ 处理所有命名规范和语法细节

### 第三步：验证结果
```bash
# 1. 检查编译
npm run build

# 2. 功能测试
npm run dev
```

**验证内容：**
- 书籍在选择界面显示正常
- 所有10个单元都可见
- 点击单元能正常加载内容
- 练习功能正常工作

---

## ⚙️ 传统流程：手动方式 (4步完成)

> **注意**：仅作备用参考，推荐使用自动化方式

### 步骤1：创建模块文件 (同上)

### 步骤2：更新书籍配置
编辑 `src/data/books.ts`，添加新书籍配置

### 步骤3：更新模块加载
- 编辑 `src/pages/BookModulesPage.tsx`，添加模块导入
- 编辑 `src/pages/ModulePage.tsx`，添加模块映射

### 步骤4：测试验证 (同上)

---

## 📊 效率对比

| 流程方式 | 步骤数 | 所需时间 | 错误风险 | 推荐指数 |
|----------|--------|----------|----------|----------|
| **自动化** | 2步 | 5分钟 | 极低 | ⭐⭐⭐⭐⭐ |
| **手动** | 4步 | 30分钟 | 中等 | ⭐⭐ |

---

## 🔧 文件命名规范

### 标准格式
```
grade{年级}-{学期}-mod-{单元号}-{主题}.json
```

### 示例
```
grade5-upper-mod-01-school-life.json    // 五年级上册第1单元：学校生活
grade5-lower-mod-05-travel.json         // 五年级下册第5单元：旅行
grade6-upper-mod-10-review.json         // 六年级上册第10单元：复习
```

### 注意事项
- 使用小写字母和连字符
- 单元号必须是两位数 (01-10)
- 主题使用连字符连接多个单词
- 文件名中的moduleId必须与内容中的moduleId完全一致

---

## ✅ 成功标志

运行 `npm run import-book` 后，看到以下输出表示成功：

```
🚀 开始自动化书籍导入...

发现 10 个模块文件
发现的模块文件：
  - grade5-upper-mod-01-school-life.json (grade5-upper-mod-01)
  - grade5-upper-mod-02-family-friends.json (grade5-upper-mod-02)
  ...

发现 1 本书籍：
  - 五年级上册 (10 个单元)

更新 books.ts...
✓ books.ts 更新完成
更新 BookModulesPage.tsx...
✓ BookModulesPage.tsx 更新完成
更新 ModulePage.tsx...
✓ ModulePage.tsx 更新完成

✅ 自动化导入完成！

📋 下一步操作：
1. 运行 npm run build 检查是否有编译错误
2. 运行 npm run dev 启动开发服务器
3. 测试书籍选择和模块加载功能
```

---

## 🎯 核心优势

1. **维护简化**：只需关注JSON文件内容质量
2. **一键完成**：所有技术配置自动处理
3. **错误减少**：自动处理命名、导入、映射等易错环节
4. **一致性保证**：确保所有配置格式统一
5. **快速验证**：自动检查和验证配置正确性

---

## 📞 获取帮助

如果遇到问题：
1. 检查文件命名是否符合规范
2. 验证JSON格式是否正确
3. 确认必需字段是否完整
4. 查看脚本输出的错误信息
5. 参考 `SCRIPT_USAGE_GUIDE.md` 获取详细故障排除指导

---

**总结**：通过自动化脚本，书籍导入工作从原来的30分钟减少到5分钟，维护人员只需专注于创建高质量的JSON模块文件即可！