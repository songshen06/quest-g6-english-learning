#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 带验证的书籍导入脚本
 *
 * 使用方法：
 * node scripts/import-book-with-validation.js
 *
 * 此脚本会：
 * 1. 扫描 src/content/ 目录中的模块文件
 * 2. 验证每个JSON文件的格式和内容
 * 3. 检查moduleId唯一性和文件名匹配
 * 4. 按年级和学期分组模块
 * 5. 自动更新 books.ts 配置
 * 6. 自动更新 BookModulesPage.tsx 导入
 * 7. 自动更新 ModulePage.tsx 映射
 */

// 配置
const CONTENT_DIR = path.join(__dirname, '../src/content');
const BOOKS_FILE = path.join(__dirname, '../src/data/books.ts');
const BOOK_MODULES_PAGE_FILE = path.join(__dirname, '../src/pages/BookModulesPage.tsx');
const MODULE_PAGE_FILE = path.join(__dirname, '../src/pages/ModulePage.tsx');

// 年级和学期配置
const GRADE_CONFIG = {
  1: { upper: '一年级上册', lower: '一年级下册', difficulty: 'beginner' },
  2: { upper: '二年级上册', lower: '二年级下册', difficulty: 'beginner' },
  3: { upper: '三年级上册', lower: '三年级下册', difficulty: 'elementary' },
  4: { upper: '四年级上册', lower: '四年级下册', difficulty: 'elementary' },
  5: { upper: '五年级上册', lower: '五年级下册', difficulty: 'elementary' },
  6: { upper: '六年级上册', lower: '六年级下册', difficulty: 'intermediate' }
};

// 简化的验证函数（从TypeScript版本移植）
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

function parseFilename(filename) {
  const nameWithoutExt = filename.replace(/\.json$/, '');

  // 标准格式：grade5-lower-mod-01-driver-player
  const standardPattern = /^grade(\d+)-(lower|upper)-mod-(\d+)-(.+)$/;
  const standardMatch = nameWithoutExt.match(standardPattern);

  if (standardMatch) {
    const grade = parseInt(standardMatch[1]);
    const semester = standardMatch[2];
    const moduleNumber = parseInt(standardMatch[3]);
    const topic = standardMatch[4];

    if (grade < 1 || grade > 6) {
      return {
        isValid: false,
        error: `文件名年级超出范围: grade${grade}. 必须在 grade1 到 grade6 之间`
      };
    }

    if (moduleNumber < 1 || moduleNumber > 10) {
      return {
        isValid: false,
        error: `文件名单元编号超出范围: mod-${moduleNumber}. 必须在 mod-1 到 mod-10 之间`
      };
    }

    return {
      isValid: true,
      grade,
      semester,
      moduleNumber,
      topic
    };
  }

  // 兼容旧格式：module-01-how-long
  const oldPattern = /^module-(\d+)-(.+)$/;
  const oldMatch = nameWithoutExt.match(oldPattern);

  if (oldMatch) {
    const moduleNumber = parseInt(oldMatch[1]);
    const topic = oldMatch[2];

    if (moduleNumber < 1 || moduleNumber > 10) {
      return {
        isValid: false,
        error: `文件名单元编号超出范围: module-${moduleNumber}. 必须在 module-1 到 module-10 之间`
      };
    }

    return {
      isValid: true,
      grade: 6,
      semester: 'upper',
      moduleNumber,
      topic
    };
  }

  return {
    isValid: false,
    error: `文件名格式错误: "${filename}". 正确格式: grade{1-6}-{lower/upper}-mod-{1-10}-{主题}.json`
  };
}

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
  } else {
    // 验证每个单词
    data.words.forEach((word, index) => {
      if (!word || typeof word !== 'object') {
        errors.push(`${filename}: words[${index}]必须是对象`);
        return;
      }
      if (!word.id || typeof word.id !== 'string') {
        errors.push(`${filename}: words[${index}].id是必需的字符串`);
      }
      if (!word.en || typeof word.en !== 'string') {
        errors.push(`${filename}: words[${index}].en是必需的字符串`);
      }
      if (!word.zh || typeof word.zh !== 'string') {
        errors.push(`${filename}: words[${index}].zh是必需的字符串`);
      }
    });
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

  // 生成警告
  if (summary.totalWords < 3) {
    warnings.push(`${filename}: 单词数量较少 (建议至少3个单词)`);
  }

  if (summary.totalQuests < 1) {
    warnings.push(`${filename}: 任务数量较少 (建议至少1个任务)`);
  }

  if (!data.patterns || data.patterns.length === 0) {
    warnings.push(`${filename}: 没有定义句型 - 建议添加一些句型`);
  }

  if (!data.funFacts || data.funFacts.length === 0) {
    warnings.push(`${filename}: 没有定义趣味事实 - 建议添加一些趣味事实`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary
  };
}

function validateFilenameModuleMatch(filename, moduleId) {
  const moduleValidation = validateModuleIdFormat(moduleId);
  const filenameValidation = parseFilename(filename);

  if (!moduleValidation.isValid) {
    return {
      isMatch: false,
      error: moduleValidation.error
    };
  }

  if (!filenameValidation.isValid) {
    return {
      isMatch: false,
      error: filenameValidation.error
    };
  }

  const isMatch =
    moduleValidation.grade === filenameValidation.grade &&
    moduleValidation.semester === filenameValidation.semester &&
    moduleValidation.moduleNumber === filenameValidation.moduleNumber;

  if (!isMatch) {
    return {
      isMatch: false,
      error: `文件名和moduleId不匹配: 文件名解析为 grade${filenameValidation.grade}-${filenameValidation.semester}-mod-${filenameValidation.moduleNumber.toString().padStart(2, '0')} vs moduleId "${moduleId}"`
    };
  }

  return { isMatch: true };
}

// 解析模块文件名
function parseModuleFileName(filename) {
  // 新格式：grade6-upper-mod-01-school-life.json
  const newFormatMatch = filename.match(/grade(\d+)-(upper|lower)-mod-(\d+)-(.+)\.json$/);
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
  const variantMatch = filename.match(/grade(\d+)-(upper|lower)-module-(\d+)-(.+)\.json$/);
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

// 验证所有模块文件
function validateAllModuleFiles() {
  console.log('🔍 开始验证所有JSON文件...\n');

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

      // 验证文件名和moduleId匹配
      let filenameMatchValidation = { isMatch: true, error: null };
      if (data.moduleId) {
        filenameMatchValidation = validateFilenameModuleMatch(filename, data.moduleId);

        // 检查moduleId唯一性
        if (allModuleIds.has(data.moduleId)) {
          filenameMatchValidation.isMatch = false;
          filenameMatchValidation.error = `moduleId重复: "${data.moduleId}"`;
        } else {
          allModuleIds.add(data.moduleId);
        }
      }

      const isValid = jsonValidation.isValid && filenameMatchValidation.isMatch;
      if (!isValid) {
        hasErrors = true;
      }

      validationResults.push({
        filename,
        data,
        isValid,
        errors: [...jsonValidation.errors, ...(filenameMatchValidation.error ? [filenameMatchValidation.error] : [])],
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

  if (validFiles.length > 0) {
    console.log('\n✅ 验证通过的文件:');
    validFiles.forEach(result => {
      console.log(`   ✓ ${result.filename}`);
      if (result.summary) {
        console.log(`     单词: ${result.summary.totalWords} | 任务: ${result.summary.totalQuests} | 步骤: ${result.summary.totalSteps}`);
      }
    });
  }

  if (invalidFiles.length > 0) {
    console.log('\n❌ 验证失败的文件:');
    invalidFiles.forEach(result => {
      console.log(`   ✗ ${result.filename}`);
      result.errors.forEach(error => {
        console.log(`     🚨 ${error}`);
      });
    });
  }

  // 打印所有警告
  const allWarnings = validationResults.flatMap(r => r.warnings);
  if (allWarnings.length > 0) {
    console.log('\n⚠️  警告信息:');
    allWarnings.forEach(warning => {
      console.log(`   ⚠️  ${warning}`);
    });
  }

  if (hasErrors) {
    console.log('\n⚠️  部分文件验证失败，将跳过这些文件。');
  }

  console.log('\n✅ 验证完成，继续处理通过的文件...');
  return validationResults.filter(r => r.isValid).map(r => ({ filename: r.filename, data: r.data }));
}

// 扫描模块文件
function scanModuleFiles() {
  const validatedModules = validateAllModuleFiles();
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

// 更新 BookModulesPage.tsx 导入
function updateBookModulesPageFile(modules) {
  console.log('📝 更新 BookModulesPage.tsx...');

  let content = fs.readFileSync(BOOK_MODULES_PAGE_FILE, 'utf8');

  const importStart = content.indexOf('// Import all module JSON files');
  const arrayStart = content.indexOf('const allModulesData = [');
  const arrayEnd = content.indexOf(']', arrayStart) + 1;

  if (importStart === -1 || arrayStart === -1 || arrayEnd === -1) {
    console.error('无法找到 BookModulesPage.tsx 中的导入区域或数组区域');
    return;
  }

  const imports = [
    '// Import all module JSON files',
    ...modules.map(m => {
      const varName = m.filename.replace(/-/g, '').replace(/_/g, '');
      return `import ${varName}Data from '../content/${m.filename}.json'`;
    })
  ].join('\n');

  const arrayDeclaration = `\nconst allModulesData = [\n  ${modules.map(m => {
    const varName = m.filename.replace(/-/g, '').replace(/_/g, '');
    return `${varName}Data`;
  }).join(',\n  ')}\n]`;

  const beforeImports = content.substring(0, importStart);
  const afterArray = content.substring(arrayEnd);

  const newContent = beforeImports + imports + arrayDeclaration + afterArray;

  fs.writeFileSync(BOOK_MODULES_PAGE_FILE, newContent, 'utf8');
  console.log('✓ BookModulesPage.tsx 更新完成');
}

// 更新 ModulePage.tsx 映射
function updateModulePageFile(modules) {
  console.log('📝 更新 ModulePage.tsx...');

  let content = fs.readFileSync(MODULE_PAGE_FILE, 'utf8');

  const importStart = content.indexOf('// Import all module data directly');
  if (importStart === -1) {
    console.error('无法找到 ModulePage.tsx 中的导入区域');
    return;
  }

  const imports = [
    '// Import all module data directly',
    ...modules.map(m => {
      const varName = m.filename.replace(/-/g, '').replace(/_/g, '');
      return `import ${varName}Data from '@/content/${m.filename}.json'`;
    })
  ].join('\n');

  const mapStart = content.indexOf('const moduleDataMap: Record<string, Module> = {');
  let mapEnd = -1;
  let braceCount = 0;
  let foundStart = false;

  for (let i = mapStart; i < content.length; i++) {
    if (content[i] === '{') {
      if (!foundStart) {
        foundStart = true;
      }
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (foundStart && braceCount === 0) {
        mapEnd = i + 1;
        break;
      }
    }
  }

  if (mapStart === -1 || mapEnd === -1) {
    console.error('无法找到 ModulePage.tsx 中的映射区域');
    return;
  }

  const mappingMap = new Map();
  modules.forEach(m => {
    const shortId = m.moduleId.replace(`grade${m.grade}-`, '').replace(`${m.semester}-mod-`, '');
    const varName = m.filename.replace(/-/g, '').replace(/_/g, '');

    mappingMap.set(m.moduleId, varName);

    if (!mappingMap.has(shortId)) {
      mappingMap.set(shortId, varName);
    }

    const prefixedShortId = `${m.grade}${m.semester[0]}-${shortId}`;
    mappingMap.set(prefixedShortId, varName);
  });

  const mappings = Array.from(mappingMap.entries())
    .map(([key, varName]) => `        '${key}': ${varName}Data`)
    .join(',\n');

  const mapContent = `const moduleDataMap: Record<string, Module> = {\n${mappings}\n      }`;

  const afterMap = content.substring(mapEnd);
  const beforeImports = content.substring(0, importStart);
  const newContent = beforeImports + imports + '\n\n' + mapContent + afterMap;

  fs.writeFileSync(MODULE_PAGE_FILE, newContent, 'utf8');
  console.log('✓ ModulePage.tsx 更新完成');
}

// 更新统一内容管理系统
function updateContentIndexFile(modules) {
  console.log('📝 更新 src/content/index.ts...');

  const CONTENT_INDEX_FILE = path.join(__dirname, '../src/content/index.ts');

  if (!fs.existsSync(CONTENT_INDEX_FILE)) {
    console.error('❌ src/content/index.ts 文件不存在');
    return;
  }

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

  // 读取现有文件内容
  let content = fs.readFileSync(CONTENT_INDEX_FILE, 'utf8');

  // 找到导入区域和映射区域
  const importsStart = content.indexOf('// 统一的内容管理模块');
  const moduleDataStart = content.indexOf('export const moduleData = {');

  if (importsStart === -1 || moduleDataStart === -1) {
    console.error('❌ 无法找到内容管理文件的正确区域');
    return;
  }

  // 构建新内容
  const beforeImports = content.substring(0, importsStart);
  const beforeModuleData = content.substring(moduleDataStart);

  const newImportsSection = [
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
    beforeModuleData
  ].join('\n');

  fs.writeFileSync(CONTENT_INDEX_FILE, newImportsSection, 'utf8');
  console.log('✓ src/content/index.ts 更新完成');
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

// 检查并生成缺失的音频文件
function checkAndGenerateMissingAudio(modules) {
  console.log('\n🎵 检查音频文件...');

  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');

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
    // 运行音频生成脚本（它会自动跳过已存在的文件）
    const result = execSync('python generate_audio.py', {
      cwd: projectRoot,
      stdio: 'inherit',
      timeout: 300000 // 5分钟超时
    });

    console.log('✅ 音频生成完成');

  } catch (error) {
    console.warn(`⚠️  音频生成遇到问题: ${error.message}`);
    console.log('📝 音频生成失败，但应用核心功能仍可正常使用');
    console.log('💡 你可以稍后手动运行: python generate_audio.py');
  }
}

// 主函数
function main() {
  console.log('🚀 开始带验证的自动化书籍导入...\n');
  console.log('=' .repeat(60));

  try {
    // 1. 验证所有模块文件
    const modules = scanModuleFiles();
    if (modules.length === 0) {
      console.log('❌ 未发现任何有效模块文件，请检查文件格式和内容');
      process.exit(1);
    }

    console.log('\n📚 发现的模块文件：');
    modules.forEach(m => {
      console.log(`  - ${m.filename}.json (${m.moduleId})`);
    });

    // 2. 按书籍分组
    const booksData = groupModulesByBook(modules);
    console.log(`\n📖 发现 ${Object.keys(booksData).length} 本书籍：`);
    Object.entries(booksData).forEach(([bookKey, bookInfo]) => {
      console.log(`  - ${bookInfo.title} (${bookInfo.modules.length} 个单元)`);
    });

    // 3. 更新文件
    updateBooksFile(booksData);
    // 更新统一内容管理系统
    updateContentIndexFile(modules);
    // 更新模块页面组件
    updateBookModulesPageFile(modules);

    // 4. 检查并生成缺失的音频文件
    checkAndGenerateMissingAudio(modules);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 带验证的自动化导入完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行 npm run build 检查是否有编译错误');
    console.log('2. 运行 npm run dev 启动开发服务器');
    console.log('3. 测试书籍选择和模块加载功能');

  } catch (error) {
    console.error('\n❌ 导入过程中出现错误：', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  parseModuleFileName,
  scanModuleFiles,
  groupModulesByBook,
  validateAllModuleFiles,
  validateJsonContent,
  validateFilenameModuleMatch
};