# 变量命名规范 (Variable Naming Conventions)

## 概述

本文档定义了 Quest_G6 项目中统一的内容模块变量命名规范，确保代码的一致性和可维护性。

## 核心原则

1. **一致性** - 所有模块变量遵循相同的命名模式
2. **可读性** - 变量名清晰表达其含义和用途
3. **标准化** - 使用统一的格式和缩写规则
4. **可扩展性** - 支持未来新增年级和模块

## 命名格式

### 1. 导入变量名 (Import Variable Names)

格式：`grade{年级}{学期}Mod{模块号}{主题描述}Data`

**示例：**
- `grade4LowerMod01RulesAndWarningsData`
- `grade5UpperMod03FestivalsData`
- `grade6LowerMod02TravelDreamsData`

**组成部分：**
- `grade{年级}`: 年级标识 (4, 5, 6)
- `{学期}`: 学期标识 (Lower/Lower, Upper/Upper)
- `Mod{模块号}`: 模块编号，两位数字 (Mod01, Mod02...)
- `{主题描述}`: 基于模块标题的驼峰命名
- `Data`: 后缀，表示数据变量

### 2. 导出变量名 (Export Variable Names)

格式：`grade{年级}{学期}Mod{模块号}{主题描述}`

**示例：**
- `grade4LowerMod01RulesAndWarnings`
- `grade5UpperMod03Festivals`
- `grade6LowerMod02TravelDreams`

**与导入变量的关系：**
导出变量名 = 导入变量名去掉 `Data` 后缀

### 3. 模块ID格式 (Module ID Format)

格式：`grade{年级}-{学期}-mod-{模块号}`

**示例：**
- `grade4-lower-mod-01`
- `grade5-upper-mod-03`
- `grade6-lower-mod-02`

### 4. 短格式标识符 (Short Format Identifiers)

格式：`{年级首字母}{学期首字母}-{模块号}`

**示例：**
- `4l-01` (四年级下册模块01)
- `5u-03` (五年级上册模块03)
- `6l-02` (六年级下册模块02)

## 主题描述命名规则

### 1. 英文标题转换

将模块标题转换为驼峰命名格式：

| 原始标题 | 主题描述 |
|---------|---------|
| "Rules and Warnings" | `RulesAndWarnings` |
| "Shopping and Prices" | `ShoppingAndPrices` |
| "Past Events and Friends" | `PastEventsFriends` |
| "Helping at Home" | `HelpingHome` |
| "Changes Around Us" | `ChangesAroundUs` |

### 2. 转换规则

- 移除介词 (at, and, in, on, the 等)
- 单词首字母大写
- 移除特殊字符和空格
- 保持语义完整性

### 3. 特殊处理

- 连字符转驼峰：`school-trips` → `SchoolTrips`
- 缩写保持：`UN` → `UN`, `TTS` → `TTS`
- 数字保留：`Module 1` → `Module1`

## 年级和学期标识

| 年级 | 代码 | 学期 | 代码 | 示例 |
|------|------|------|------|------|
| 四年级 | 4 | 上册 | Upper | `grade4UpperMod01...` |
| 四年级 | 4 | 下册 | Lower | `grade4LowerMod01...` |
| 五年级 | 5 | 上册 | Upper | `grade5UpperMod01...` |
| 五年级 | 5 | 下册 | Lower | `grade5LowerMod01...` |
| 六年级 | 6 | 上册 | Upper | `grade6UpperMod01...` |
| 六年级 | 6 | 下册 | Lower | `grade6LowerMod01...` |

## 特殊情况处理

### 1. 六年级上册模块 (保持兼容性)

对于现有的六年级上册模块，保持原有命名格式：

```
module01HowLongData → module01HowLong
module02ChinatownTombsData → module02ChinatownTombs
```

### 2. 文件命名格式

JSON文件名：`grade{年级}-{学期}-mod-{模块号}-{主题描述}.json`

**示例：**
- `grade4-lower-mod-01-rules-and-warnings.json`
- `grade5-upper-mod-03-festivals.json`
- `grade6-lower-mod-02-travel-dreams.json`

## 实现示例

### 完整的导入导出示例

```typescript
// 导入
import grade4LowerMod01RulesAndWarningsData from './grade4-lower-mod-01-rules-and-warnings.json'
import grade5UpperMod03FestivalsData from './grade5-upper-mod-03-festivals.json'
import grade6LowerMod02TravelDreamsData from './grade6-lower-mod-02-travel-dreams.json'

// 导出
export { grade4LowerMod01RulesAndWarningsData as grade4LowerMod01RulesAndWarnings }
export { grade5UpperMod03FestivalsData as grade5UpperMod03Festivals }
export { grade6LowerMod02TravelDreamsData as grade6LowerMod02TravelDreams }

// 模块映射
export const moduleData = {
  'grade4-lower-mod-01': grade4LowerMod01RulesAndWarningsData,
  'grade5-upper-mod-03': grade5UpperMod03FestivalsData,
  'grade6-lower-mod-02': grade6LowerMod02TravelDreamsData,
  // 短格式映射
  '4l-01': grade4LowerMod01RulesAndWarningsData,
  '5u-03': grade5UpperMod03FestivalsData,
  '6l-02': grade6LowerMod02TravelDreamsData,
}
```

## 命名算法实现

### 主题描述生成函数

```javascript
function generateTopicDescription(title) {
  return title
    .toLowerCase()
    .replace(/\b(at|and|in|on|the|of|for|to|with)\b/g, '') // 移除介词
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .split(/[\s-]+) // 按空格或连字符分割
    .filter(word => word.length > 0) // 移除空字符串
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // 首字母大写
    .join(''); // 连接成驼峰命名
}
```

### 完整变量名生成函数

```javascript
function generateVariableName(filename, moduleId, title) {
  // 解析moduleId
  const match = moduleId.match(/^grade(\d+)-(lower|upper)-mod-(\d+)$/);
  if (!match) throw new Error(`Invalid moduleId: ${moduleId}`);

  const [_, grade, semester, moduleNum] = match;
  const topicDesc = generateTopicDescription(title);

  return `grade${grade}${semester.charAt(0).toUpperCase() + semester.slice(1)}Mod${moduleNum.padStart(2, '0')}${topicDesc}Data`;
}
```

## 工具和脚本

### 1. 命名验证脚本

使用 `scripts/validate-imports.cjs` 验证导入导出一致性：

```bash
node scripts/validate-imports.cjs
```

### 2. 增强导入脚本

使用 `scripts/enhanced-import.cjs` 自动生成符合规范的导入：

```bash
node scripts/enhanced-import.cjs
```

### 3. 批量重命名工具

创建工具用于批量重命名现有文件和变量：

```bash
node scripts/batch-rename.cjs --apply-rules
```

## 最佳实践

1. **保持一致性** - 所有新模块都遵循此命名规范
2. **及时更新** - 添加新模块时及时更新相关文件
3. **定期验证** - 使用验证工具定期检查一致性
4. **文档同步** - 修改命名规范时同步更新此文档
5. **版本控制** - 重大命名变更应通过PR审查

## 迁移指南

### 从旧命名迁移到新命名

1. **识别不一致的变量名**
2. **使用重命名工具批量更新**
3. **运行验证脚本确认**
4. **更新相关的导入语句**
5. **测试功能完整性**

### 迁移检查清单

- [ ] 所有导入变量名以 `Data` 结尾
- [ ] 所有导出变量名去掉 `Data` 后缀
- [ ] 模块ID格式统一为 `grade{年级}-{学期}-mod-{模块号}`
- [ ] 短格式映射正确配置
- [ ] JSON文件名符合规范
- [ ] 验证脚本无报错

---

**版本**: 1.0
**最后更新**: 2025-01-10
**维护者**: Quest_G6 开发团队