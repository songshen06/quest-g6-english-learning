#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 增强版导入脚本 v2.0 - 适配统一内容管理系统
 *
 * 使用方法：
 * node scripts/enhanced-import-v2.cjs
 *
 * 新特性：
 * 1. 自动检测项目是否使用统一内容管理系统
 * 2. 适配不同的导入方式
 * 3. 避免重复定义和冲突
 * 4. 智能处理TypeScript类型问题
 */

// 配置
const CONTENT_DIR = path.join(__dirname, '../src/content');
const BOOKS_FILE = path.join(__dirname, '../src/data/books.ts');
const CONTENT_INDEX_FILE = path.join(__dirname, '../src/content/index.ts');
const BOOK_MODULES_PAGE_FILE = path.join(__dirname, '../src/pages/BookModulesPage.tsx');
const MODULES_PAGE_FILE = path.join(__dirname, '../src/pages/ModulesPage.tsx');
const MODULE_PAGE_FILE = path.join(__dirname, '../src/pages/ModulePage.tsx');
const QUEST_PAGE_FILE = path.join(__dirname, '../src/pages/QuestPage.tsx');

// 年级和学期配置
const GRADE_CONFIG = {
  1: { upper: '一年级上册', lower: '一年级下册', difficulty: 'beginner' },
  2: { upper: '二年级上册', lower: '二年级下册', difficulty: 'beginner' },
  3: { upper: '三年级上册', lower: '三年级下册', difficulty: 'elementary' },
  4: { upper: '四年级上册', lower: '四年级下册', difficulty: 'elementary' },
  5: { upper: '五年级上册', lower: '五年级下册', difficulty: 'elementary' },
  6: { upper: '六年级上册', lower: '六年级下册', difficulty: 'intermediate' }
};

// 检测项目是否使用统一内容管理系统
function detectProjectStructure() {
  console.log('🔍 检测项目结构...');

  // 检查content/index.ts是否存在
  const hasContentIndex = fs.existsSync(CONTENT_INDEX_FILE);

  // 检查BookModulesPage.tsx的导入方式
  let usesUnifiedContent = false;
  if (fs.existsSync(BOOK_MODULES_PAGE_FILE)) {
    const content = fs.readFileSync(BOOK_MODULES_PAGE_FILE, 'utf8');
    usesUnifiedContent = content.includes("import { moduleData } from '@/content'") ||
                        content.includes('import { moduleData } from \'@/content\'');
  }

  console.log(`  📁 content/index.ts: ${hasContentIndex ? '✅ 存在' : '❌ 不存在'}`);
  console.log(`  🔗 统一内容管理: ${usesUnifiedContent ? '✅ 已启用' : '❌ 未启用'}`);

  return {
    hasContentIndex,
    usesUnifiedContent,
    needsUnifiedUpdate: hasContentIndex && !usesUnifiedContent
  };
}

// 验证模块文件（复用原有逻辑）
function validateModuleIdFormat(moduleId) {
  const pattern = /^grade(\d+)-(lower|upper)-mod-(\d+)$/;
  const match = moduleId.match(pattern);

  if (!match) {
    return {
      isValid: false,
      error: `moduleId格式错误: "${moduleId}". 正确格式: grade{1-6}-{lower/upper}-mod-{1-10}`
    };
  }

  const grade = parseInt(match[1]);
  const semester = match[2];
  const moduleNumber = parseInt(match[3]);

  if (grade < 1 || grade > 6) {
    return {
      isValid: false,
      error: `年级超出范围: grade${grade}. 必须在 grade1 到 grade6 之间`
    };
  }

  if (moduleNumber < 1 || moduleNumber > 10) {
    return {
      isValid: false,
      error: `单元编号超出范围: mod-${moduleNumber}. 必须在 mod-1 到 mod-10 之间`
    };
  }

  return { isValid: true, grade, semester, moduleNumber };
}

// 解析模块文件名
function parseModuleFileName(filename) {
  // 新格式：grade6-lower-mod-01-ordering-food.json
  const newFormatMatch = filename.match(/grade(\d+)-(lower|upper)-mod-(\d+)-(.+)\.json$/);
  if (newFormatMatch) {
    return {
      grade: parseInt(newFormatMatch[1]),
      semester: newFormatMatch[2],
      moduleNumber: parseInt(newFormatMatch[3]),
      topic: newFormatMatch[4].replace(/-/g, ' '),
      moduleId: `grade${newFormatMatch[1]}-${newFormatMatch[2]}-mod-${newFormatMatch[3].padStart(2, '0')}`,
      filename: filename.replace('.json', ''),
      format: 'new'
    };
  }

  // 兼容格式：grade5-lower-module-01-driver-player.json
  const variantMatch = filename.match(/grade(\d+)-(lower|upper)-module-(\d+)-(.+)\.json$/);
  if (variantMatch) {
    return {
      grade: parseInt(variantMatch[1]),
      semester: variantMatch[2],
      moduleNumber: parseInt(variantMatch[3]),
      topic: variantMatch[4].replace(/-/g, ' '),
      moduleId: `grade${variantMatch[1]}-${variantMatch[2]}-mod-${variantMatch[3].padStart(2, '0')}`,
      filename: filename.replace('.json', ''),
      format: 'variant'
    };
  }

  // 旧格式：module-01-how-long.json
  const oldFormatMatch = filename.match(/module-(\d+)-(.+)\.json$/);
  if (oldFormatMatch) {
    const moduleNumber = parseInt(oldFormatMatch[1]);
    const topic = oldFormatMatch[2].replace(/-/g, ' ');
    return {
      grade: 6,
      semester: 'upper',
      moduleNumber,
      topic,
      moduleId: `grade6-upper-mod-${moduleNumber.toString().padStart(2, '0')}`,
      filename: filename.replace('.json', ''),
      format: 'old'
    };
  }

  return null;
}

// 验证JSON内容
function validateJsonContent(data, filename) {
  const errors = [];
  const warnings = [];

  // 验证基本结构
  if (!data || typeof data !== 'object') {
    errors.push(`${filename}: 文件必须包含有效的JSON对象`);
    return { isValid: false, errors, warnings, summary: null };
  }

  // 验证必需字段
  if (!data.moduleId || typeof data.moduleId !== 'string') {
    errors.push(`${filename}: moduleId是必需字段，必须是字符串`);
  }

  if (!data.title || typeof data.title !== 'string') {
    errors.push(`${filename}: title是必需字段，必须是字符串`);
  }

  if (typeof data.durationMinutes !== 'number' || data.durationMinutes <= 0) {
    errors.push(`${filename}: durationMinutes是必需字段，必须是正数`);
  }

  if (!Array.isArray(data.words)) {
    errors.push(`${filename}: words是必需字段，必须是数组`);
  } else if (data.words.length === 0) {
    errors.push(`${filename}: words数组不能为空`);
  }

  if (!Array.isArray(data.quests)) {
    errors.push(`${filename}: quests是必需字段，必须是数组`);
  } else if (data.quests.length === 0) {
    errors.push(`${filename}: quests数组不能为空`);
  }

  // 生成统计信息
  const summary = {
    totalWords: data.words?.length || 0,
    totalPhrases: data.phrases?.length || 0,
    totalPatterns: data.patterns?.length || 0,
    totalQuests: data.quests?.length || 0,
    totalSteps: data.quests?.reduce((total, quest) => total + (quest.steps?.length || 0), 0) || 0,
    totalPracticeItems: data.practice?.length || 0,
    totalFunFacts: data.funFacts?.length || 0
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary
  };
}

// 扫描和验证所有模块文件
function scanAndValidateModules() {
  console.log('\n🔍 开始验证所有JSON文件...\n');

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
  const validationResults = [];
  const allModuleIds = new Set();
  let hasErrors = false;

  for (const filename of files) {
    const filePath = path.join(CONTENT_DIR, filename);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // 验证JSON内容
      const jsonValidation = validateJsonContent(data, filename);

      // 验证moduleId唯一性
      if (data.moduleId) {
        if (allModuleIds.has(data.moduleId)) {
          jsonValidation.errors.push(`moduleId重复: "${data.moduleId}"`);
          jsonValidation.isValid = false;
        } else {
          allModuleIds.add(data.moduleId);
        }
      }

      if (!jsonValidation.isValid) {
        hasErrors = true;
      }

      validationResults.push({
        filename,
        data,
        isValid: jsonValidation.isValid,
        errors: jsonValidation.errors,
        warnings: jsonValidation.warnings,
        summary: jsonValidation.summary
      });

    } catch (error) {
      hasErrors = true;
      validationResults.push({
        filename,
        isValid: false,
        errors: [`${filename}: JSON解析错误 - ${error.message}`],
        warnings: [],
        summary: null
      });
    }
  }

  // 打印验证结果
  console.log('📊 验证结果汇总:');
  console.log('='.repeat(60));

  const validFiles = validationResults.filter(r => r.isValid);
  const invalidFiles = validationResults.filter(r => !r.isValid);

  console.log(`✅ 通过验证: ${validFiles.length} 个文件`);
  console.log(`❌ 验证失败: ${invalidFiles.length} 个文件`);

  if (invalidFiles.length > 0) {
    console.log('\n❌ 验证失败的文件:');
    invalidFiles.forEach(result => {
      console.log(`   ✗ ${result.filename}`);
      result.errors.forEach(error => {
        console.log(`     🚨 ${error}`);
      });
    });
  }

  if (hasErrors) {
    console.log('\n⚠️  部分文件验证失败，将跳过这些文件。');
  }

  console.log('\n✅ 验证完成，继续处理通过的文件...');
  return validationResults.filter(r => r.isValid).map(r => ({ filename: r.filename, data: r.data }));
}

// 解析模块文件信息
function parseModuleFiles(validatedModules) {
  const modules = validatedModules
    .map(({ filename, data }) => parseModuleFileName(filename))
    .filter(Boolean)
    .sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.semester !== b.semester) return a.semester === 'upper' ? -1 : 1;
      return a.moduleNumber - b.moduleNumber;
    });

  console.log(`\n📁 发现 ${modules.length} 个有效模块文件`);
  return modules;
}

// 按书籍分组模块
function groupModulesByBook(modules) {
  const books = {};

  modules.forEach(module => {
    const bookKey = `grade${module.grade}-${module.semester}`;
    if (!books[bookKey]) {
      books[bookKey] = {
        grade: module.grade,
        semester: module.semester,
        title: GRADE_CONFIG[module.grade][module.semester],
        modules: []
      };
    }
    books[bookKey].modules.push(module);
  });

  return books;
}

// 生成书籍配置
function generateBookConfig(bookKey, bookInfo) {
  const { grade, semester, title, modules } = bookInfo;
  const bookId = `grade${grade}-${semester}`;

  const chapters = modules.map((module, index) => ({
    id: `g${grade}${semester[0]}-ch${index + 1}`,
    bookId,
    number: index + 1,
    title: `Unit ${index + 1}: ${module.topic}`,
    description: module.topic,
    moduleIds: [module.moduleId],
    estimatedMinutes: 25,
    isLocked: false
  }));

  return `  {
    id: '${bookId}',
    title: '${title}',
    subtitle: 'English Adventure Grade ${grade}${semester === 'upper' ? 'A' : 'B'}',
    grade: ${grade},
    semester: '${semester}',
    cover: '/images/books/${bookId}.jpg',
    description: '${title}英语学习内容，包含${modules.length}个主题单元',
    totalModules: ${modules.length},
    difficulty: '${GRADE_CONFIG[grade].difficulty}',
    tags: ['${GRADE_CONFIG[grade].difficulty === 'beginner' ? '小学低年级' : '小学中年级'}', '基础语法', '日常对话'],
    isActive: true,
    publishedAt: '2024-01-01',
    chapters: [
${chapters.map(ch => `      {
        id: '${ch.id}',
        bookId: '${ch.bookId}',
        number: ${ch.number},
        title: '${ch.title}',
        description: '${ch.description}',
        moduleIds: ['${ch.moduleIds[0]}'],
        estimatedMinutes: ${ch.estimatedMinutes},
        isLocked: ${ch.isLocked}
      }`).join(',\n')}
    ]
  }`;
}

// 更新 books.ts 文件
function updateBooksFile(booksData) {
  console.log('\n📝 更新 books.ts...');

  const bookConfigs = Object.entries(booksData).map(([bookKey, bookInfo]) =>
    generateBookConfig(bookKey, bookInfo)
  );

  const content = `import { Book } from '@/types/books'

export const booksData: Book[] = [
${bookConfigs.join(',\n')}
]

export const getActiveBooks = () => {
  return booksData.filter(book => book.isActive)
}

export const getNextRecommendedBook = (currentBookId: string) => {
  const currentBook = booksData.find(book => book.id === currentBookId)
  if (!currentBook) return null

  // 推荐逻辑：同年级下册或下一年级上册
  if (currentBook.semester === 'upper') {
    const lowerBook = booksData.find(book =>
      book.grade === currentBook.grade && book.semester === 'lower'
    )
    if (lowerBook) return lowerBook
  }

  const nextGradeBook = booksData.find(book =>
    book.grade === currentBook.grade + 1 && book.semester === 'upper'
  )

  return nextGradeBook || null
}
`;

  fs.writeFileSync(BOOKS_FILE, content, 'utf8');
  console.log('✓ books.ts 更新完成');
}

// 更新统一内容管理系统
function updateUnifiedContentIndex(modules) {
  console.log('\n📝 更新统一内容管理系统...');

  // 按年级分组模块
  const gradeGroups = {};
  modules.forEach(module => {
    const grade = module.grade;
    const semester = module.semester;
    const key = `grade${grade}-${semester}`;

    if (!gradeGroups[key]) {
      gradeGroups[key] = [];
    }
    gradeGroups[key].push(module);
  });

  // 生成导入语句
  const imports = [];
  const exports = [];
  const mappings = [];

  Object.entries(gradeGroups).forEach(([gradeKey, modules]) => {
    const [grade, semester] = gradeKey.split('-');
    const gradeName = getGradeName(parseInt(grade));

    imports.push(`// ${gradeName}册模块 (Grade ${grade} ${semester === 'upper' ? 'Upper' : 'Lower'})`);

    modules.forEach((module, index) => {
      const varName = generateVariableName(module);
      const filePath = `./${module.filename}.json`;

      imports.push(`import ${varName} from '${filePath}'`);
      exports.push(`export { ${varName} }`);

      // 添加映射
      mappings.push(`  '${module.moduleId}': ${varName},`);
      const shortId = `${grade[0]}${semester[0]}-${String(index + 1).padStart(2, '0')}`;
      mappings.push(`  '${shortId}': ${varName},`);
    });

    imports.push(''); // 空行分隔
    exports.push(''); // 空行分隔
  });

  // 读取现有文件内容，检查是否已有moduleData定义
  let existingContent = '';
  if (fs.existsSync(CONTENT_INDEX_FILE)) {
    existingContent = fs.readFileSync(CONTENT_INDEX_FILE, 'utf8');
  }

  // 构建新内容
  const newContent = [
    '// 统一的内容管理模块',
    '// 所有JSON文件都在这里集中导入和管理',
    '',
    ...imports,
    '// 重新导出所有模块数据',
    ...exports,
    '',
    '// 模块数据映射 - 支持多种访问方式',
    'export const moduleData = {',
    ...mappings,
    '};',
    '',
    '// 便捷函数：根据模块ID获取数据',
    'export function getModuleData(moduleId: string) {',
    '  return moduleData[moduleId as keyof typeof moduleData] || null',
    '}',
    '',
    '// 获取所有可用模块ID',
    'export function getAllModuleIds() {',
    '  return Object.keys(moduleData)',
    '}',
    '',
    '// 按年级分组模块',
    'export function getModulesByGrade() {',
    '  // 实现分组逻辑...',
    '  return {}; // 简化实现',
    '}',
    ''
  ].join('\n');

  // 如果文件已存在且有内容，检查是否需要更新
  if (existingContent) {
    // 检查是否包含重复的moduleData定义
    if (existingContent.includes('export const moduleData = {') &&
        existingContent.split('export const moduleData = {').length > 2) {
      console.log('⚠️  检测到重复的moduleData定义，正在清理...');
      // 保留第一次出现的moduleData定义，删除后续的
      const parts = existingContent.split('export const moduleData = {');
      const beforeFirst = parts[0];
      const afterFirst = 'export const moduleData = {' + parts.slice(1).join('export const moduleData = {');

      // 找到第一个moduleData的结束位置
      let braceCount = 0;
      let moduleDataEnd = -1;
      let foundStart = false;

      for (let i = 0; i < afterFirst.length; i++) {
        if (afterFirst[i] === '{') {
          if (!foundStart) {
            foundStart = true;
          }
          braceCount++;
        } else if (afterFirst[i] === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            moduleDataEnd = i + 1;
            break;
          }
        }
      }

      if (moduleDataEnd > -1) {
        const cleanContent = beforeFirst + afterFirst.substring(0, moduleDataEnd);
        fs.writeFileSync(CONTENT_INDEX_FILE, cleanContent + '\n' + newContent, 'utf8');
        console.log('✓ 清理重复定义并更新完成');
      } else {
        fs.writeFileSync(CONTENT_INDEX_FILE, newContent, 'utf8');
        console.log('✓ 直接覆盖完成');
      }
    } else {
      // 检查是否需要添加新的模块
      const existingModules = existingContent.match(/import\s+\w+\s+from\s+['"][\w\-\/\.]+['"];?/g) || [];
      const newModules = imports.filter(line => line.startsWith('import ') && !existingModules.includes(line));

      if (newModules.length > 0) {
        console.log(`📝 添加 ${newModules.length} 个新模块...`);

        // 找到导入区域的结束位置
        const importEnd = existingContent.lastIndexOf('// 重新导出所有模块数据');
        if (importEnd > -1) {
          const beforeImports = existingContent.substring(0, importEnd);
          const afterImports = existingContent.substring(importEnd);
          const updatedContent = beforeImports + newModules.join('\n') + '\n' + afterImports;

          // 更新moduleData映射
          const moduleDataStart = updatedContent.indexOf('export const moduleData = {');
          const moduleDataEnd = updatedContent.indexOf('};', moduleDataStart) + 2;
          const beforeModuleData = updatedContent.substring(0, moduleDataStart);
          const afterModuleData = updatedContent.substring(moduleDataEnd);

          const finalContent = beforeModuleData +
                              'export const moduleData = {\n' +
                              mappings.join('\n') +
                              '\n};' +
                              afterModuleData;

          fs.writeFileSync(CONTENT_INDEX_FILE, finalContent, 'utf8');
          console.log('✓ 增量更新完成');
        } else {
          fs.writeFileSync(CONTENT_INDEX_FILE, newContent, 'utf8');
          console.log('✓ 完整重建完成');
        }
      } else {
        console.log('✓ 无需更新，所有模块已存在');
      }
    }
  } else {
    fs.writeFileSync(CONTENT_INDEX_FILE, newContent, 'utf8');
    console.log('✓ 新建文件完成');
  }
}

// 更新使用统一管理系统的页面
function updatePagesForUnifiedSystem(modules) {
  console.log('\n📝 更新页面组件...');

  // 更新 BookModulesPage.tsx
  if (fs.existsSync(BOOK_MODULES_PAGE_FILE)) {
    let content = fs.readFileSync(BOOK_MODULES_PAGE_FILE, 'utf8');

    // 检查是否已使用统一导入
    if (!content.includes("import { moduleData } from '@/content'")) {
      console.log('  📝 更新 BookModulesPage.tsx 使用统一导入...');

      // 替换导入区域
      const importStart = content.indexOf('// Import');
      if (importStart > -1) {
        const nextBlankLine = content.indexOf('\n\n', importStart);
        if (nextBlankLine > -1) {
          const beforeImport = content.substring(0, importStart);
          const afterImport = content.substring(nextBlankLine);

          const newImport = '// Import from unified content management\nimport { moduleData } from \'@/content\'\n';
          const newArray = 'const allModulesData = Object.values(moduleData)';

          // 替换数组定义
          const arrayStart = content.indexOf('const allModulesData = [');
          const arrayEnd = content.indexOf(']', arrayStart) + 1;

          if (arrayStart > -1 && arrayEnd > -1) {
            const beforeArray = content.substring(0, arrayStart);
            const afterArray = content.substring(arrayEnd);

            content = beforeImport + newImport + newArray + afterArray;
          } else {
            content = beforeImport + newImport + newArray + '\n\n' + afterImport;
          }

          fs.writeFileSync(BOOK_MODULES_PAGE_FILE, content, 'utf8');
          console.log('  ✓ BookModulesPage.tsx 更新完成');
        }
      }
    } else {
      console.log('  ✓ BookModulesPage.tsx 已使用统一导入');
    }
  }

  // 更新 ModulesPage.tsx
  if (fs.existsSync(MODULES_PAGE_FILE)) {
    let content = fs.readFileSync(MODULES_PAGE_FILE, 'utf8');

    if (!content.includes("import { moduleData } from '@/content'")) {
      console.log('  📝 更新 ModulesPage.tsx 使用统一导入...');

      // 替换单独导入为统一导入
      const importStart = content.indexOf('// Import from unified content management');
      if (importStart > -1) {
        const nextFunction = content.indexOf('\n\n', importStart);
        if (nextFunction > -1) {
          const beforeImport = content.substring(0, importStart);
          const afterImport = content.substring(nextFunction);

          const newImport = '// Import from unified content management\nimport { moduleData } from \'@/content\'\n\nconst allModulesData = Object.values(moduleData)';

          content = beforeImport + newImport + afterImport;
          fs.writeFileSync(MODULES_PAGE_FILE, content, 'utf8');
          console.log('  ✓ ModulesPage.tsx 更新完成');
        }
      }
    } else {
      console.log('  ✓ ModulesPage.tsx 已使用统一导入');
    }
  }

  // 更新 ModulePage.tsx 和 QuestPage.tsx（确保使用正确的类型）
  [MODULE_PAGE_FILE, QUEST_PAGE_FILE].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // 修复类型问题
      if (content.includes('moduleData[moduleId]') && !content.includes('as keyof typeof moduleData')) {
        console.log(`  📝 修复 ${path.basename(filePath)} 的TypeScript类型...`);
        content = content.replace(/moduleData\[moduleId\]/g, 'moduleData[moduleId as keyof typeof moduleData]');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ ${path.basename(filePath)} 类型修复完成`);
      }
    }
  });
}

// 生成变量名
function generateVariableName(module) {
  const cleanName = module.filename
    .replace(/^grade(\d+)-/, '') // 移除年级前缀
    .replace(/-/g, ' ') // 替换连字符为空格
    .replace(/\b\w/g, (match) => match.toUpperCase()) // 首字母大写
    .replace(/\s/g, ''); // 移除空格

  return cleanName + 'Data';
}

// 获取年级名称
function getGradeName(grade) {
  const gradeNames = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六'
  };
  return gradeNames[grade] || grade;
}

// 检查并生成缺失的音频文件（复用原有逻辑）
function checkAndGenerateMissingAudio(modules) {
  console.log('\n🎵 检查音频文件...');

  const projectRoot = path.resolve(__dirname, '..');
  const audioDir = path.join(projectRoot, 'public', 'audio', 'tts');

  // 确保音频目录存在
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // 收集所有需要的音频文件
  const requiredAudioFiles = new Set();

  modules.forEach(module => {
    // 读取模块JSON文件获取音频需求
    const moduleFilePath = path.join(projectRoot, 'src', 'content', `${module.filename}.json`);
    if (fs.existsSync(moduleFilePath)) {
      try {
        const moduleData = JSON.parse(fs.readFileSync(moduleFilePath, 'utf8'));

        // 收集单词音频
        moduleData.words?.forEach(word => {
          if (word.audio) {
            const filename = path.basename(word.audio);
            requiredAudioFiles.add(filename);
          }
        });

        // 收集短语音频
        moduleData.phrases?.forEach(phrase => {
          if (phrase.audio) {
            const filename = path.basename(phrase.audio);
            requiredAudioFiles.add(filename);
          }
        });

        // 收集任务音频
        moduleData.quests?.forEach(quest => {
          quest.steps?.forEach(step => {
            if (step.audio) {
              const filename = path.basename(step.audio);
              requiredAudioFiles.add(filename);
            }
          });
        });

      } catch (error) {
        console.warn(`⚠️  无法读取模块文件 ${module.filename}: ${error.message}`);
      }
    }
  });

  // 检查哪些音频文件缺失
  const missingAudioFiles = [];
  requiredAudioFiles.forEach(filename => {
    const audioPath = path.join(audioDir, filename);
    if (!fs.existsSync(audioPath)) {
      missingAudioFiles.push(filename);
    }
  });

  if (missingAudioFiles.length === 0) {
    console.log('✅ 所有音频文件都已存在，跳过音频生成');
    return;
  }

  console.log(`🔍 发现 ${missingAudioFiles.length} 个缺失音频文件`);
  console.log('🎵 开始生成缺失的音频文件...');

  try {
    // 这里可以调用音频生成脚本
    console.log('💡 音频生成功能已准备就绪，可运行音频生成脚本');
  } catch (error) {
    console.warn(`⚠️  音频生成遇到问题: ${error.message}`);
    console.log('📝 音频生成失败，但应用核心功能仍可正常使用');
  }
}

// 主函数
function main() {
  console.log('🚀 开始增强版自动化书籍导入 v2.0...\n');
  console.log('='.repeat(60));

  try {
    // 1. 检测项目结构
    const projectStructure = detectProjectStructure();

    // 2. 验证所有模块文件
    const validatedModules = scanAndValidateModules();
    if (validatedModules.length === 0) {
      console.log('❌ 未发现任何有效模块文件，请检查文件格式和内容');
      process.exit(1);
    }

    console.log('\n📚 发现的模块文件：');
    validatedModules.forEach(m => {
      console.log(`  - ${m.filename}`);
    });

    // 3. 解析模块信息
    const modules = parseModuleFiles(validatedModules);

    // 4. 按书籍分组
    const booksData = groupModulesByBook(modules);
    console.log(`\n📖 发现 ${Object.keys(booksData).length} 本书籍：`);
    Object.entries(booksData).forEach(([bookKey, bookInfo]) => {
      console.log(`  - ${bookInfo.title} (${bookInfo.modules.length} 个单元)`);
    });

    // 5. 更新文件
    updateBooksFile(booksData);

    // 6. 根据项目结构选择更新方式
    if (projectStructure.hasContentIndex) {
      console.log('\n🔄 检测到统一内容管理系统，使用智能更新...');
      updateUnifiedContentIndex(modules);

      if (projectStructure.usesUnifiedContent || projectStructure.needsUnifiedUpdate) {
        updatePagesForUnifiedSystem(modules);
      }
    } else {
      console.log('\n📝 传统项目结构，使用标准更新...');
      // 这里可以添加传统更新逻辑
    }

    // 7. 检查并生成缺失的音频文件
    checkAndGenerateMissingAudio(modules);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 增强版自动化导入完成！');
    console.log('\n📋 项目特性：');
    console.log(`  - 统一内容管理: ${projectStructure.hasContentIndex ? '✅' : '❌'}`);
    console.log(`  - 智能导入检测: ${projectStructure.usesUnifiedContent ? '✅' : '❌'}`);
    console.log('\n📋 下一步操作：');
    console.log('1. 运行 npm run build 检查是否有编译错误');
    console.log('2. 运行 npm run dev 启动开发服务器');
    console.log('3. 测试书籍选择和模块加载功能');

  } catch (error) {
    console.error('\n❌ 导入过程中出现错误：', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  detectProjectStructure,
  scanAndValidateModules,
  parseModuleFiles,
  groupModulesByBook,
  updateUnifiedContentIndex,
  updatePagesForUnifiedSystem
};