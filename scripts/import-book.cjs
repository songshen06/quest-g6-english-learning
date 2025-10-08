#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 自动化书籍导入脚本
 *
 * 使用方法：
 * node scripts/import-book.js
 *
 * 此脚本会：
 * 1. 扫描 src/content/ 目录中的模块文件
 * 2. 按年级和学期分组模块
 * 3. 自动更新 books.ts 配置
 * 4. 自动更新 BookModulesPage.tsx 导入
 * 5. 自动更新 ModulePage.tsx 映射
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

  // 新格式变体：grade5-lower-module-01-driver-player.json
  const newFormatVariantMatch = filename.match(/grade(\d+)-(upper|lower)-module-(\d+)-(.+)\.json$/);
  if (newFormatVariantMatch) {
    return {
      grade: parseInt(newFormatVariantMatch[1]),
      semester: newFormatVariantMatch[2],
      moduleNumber: parseInt(newFormatVariantMatch[3]),
      topic: newFormatVariantMatch[4].replace(/-/g, ' '),
      moduleId: `grade${newFormatVariantMatch[1]}-${newFormatVariantMatch[2]}-mod-${newFormatVariantMatch[3].padStart(2, '0')}`,
      filename: filename.replace('.json', ''),
      format: 'new'
    };
  }

  // 特殊格式：grade6-lower-module-01-future-plans.json (这种是六年级下册)
  const specialFormatMatch = filename.match(/grade6-lower-module-(\d+)-(.+)\.json$/);
  if (specialFormatMatch) {
    const moduleNumber = parseInt(specialFormatMatch[1]);
    const topic = specialFormatMatch[2].replace(/-/g, ' ');
    return {
      grade: 6,
      semester: 'lower',
      moduleNumber,
      topic,
      moduleId: `grade6-lower-mod-${moduleNumber.toString().padStart(2, '0')}`,
      filename: filename.replace('.json', ''),
      format: 'special'
    };
  }

  // 旧格式：module-01-how-long.json (假设是六年级上册)
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

// 扫描模块文件
function scanModuleFiles() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
  const modules = files
    .map(parseModuleFileName)
    .filter(Boolean)
    .sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.semester !== b.semester) return a.semester === 'upper' ? -1 : 1;
      return a.moduleNumber - b.moduleNumber;
    });

  console.log(`发现 ${modules.length} 个模块文件`);
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
  console.log('更新 books.ts...');

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
  console.log('更新 BookModulesPage.tsx...');

  let content = fs.readFileSync(BOOK_MODULES_PAGE_FILE, 'utf8');

  // 查找导入区域
  const importStart = content.indexOf('// Import all module JSON files');
  const arrayStart = content.indexOf('const allModulesData = [');
  const arrayEnd = content.indexOf(']', arrayStart) + 1;

  if (importStart === -1 || arrayStart === -1 || arrayEnd === -1) {
    console.error('无法找到 BookModulesPage.tsx 中的导入区域或数组区域');
    return;
  }

  // 生成新的导入语句
  const imports = [
    '// Import all module JSON files',
    ...modules.map(m => {
      const varName = m.filename.replace(/-/g, '').replace(/_/g, '');
      return `import ${varName}Data from '../content/${m.filename}.json'`;
    })
  ].join('\n');

  // 生成新的模块数组
  const arrayDeclaration = `\nconst allModulesData = [\n  ${modules.map(m => {
    const varName = m.filename.replace(/-/g, '').replace(/_/g, '');
    return `${varName}Data`;
  }).join(',\n  ')}\n]`;

  // 查找导入结束位置（到数组开始之前）
  const beforeImports = content.substring(0, importStart);
  const afterArray = content.substring(arrayEnd);

  const newContent = beforeImports + imports + arrayDeclaration + afterArray;

  fs.writeFileSync(BOOK_MODULES_PAGE_FILE, newContent, 'utf8');
  console.log('✓ BookModulesPage.tsx 更新完成');
}

// 更新 ModulePage.tsx 映射
function updateModulePageFile(modules) {
  console.log('更新 ModulePage.tsx...');

  let content = fs.readFileSync(MODULE_PAGE_FILE, 'utf8');

  // 查找导入区域
  const importStart = content.indexOf('// Import all module data directly');
  if (importStart === -1) {
    console.error('无法找到 ModulePage.tsx 中的导入区域');
    return;
  }

  // 查找导入结束位置（到 const moduleDataMap 之前）
  const importEnd = content.indexOf('const moduleDataMap: Record<string, Module> = {');

  // 生成新的导入语句
  const imports = [
    '// Import all module data directly',
    ...modules.map(m => {
      const varName = m.filename.replace(/-/g, '').replace(/_/g, '');
      return `import ${varName}Data from '@/content/${m.filename}.json'`;
    })
  ].join('\n');

  // 查找映射区域
  const mapStart = content.indexOf('const moduleDataMap: Record<string, Module> = {');
  let mapEnd = -1;
  let braceCount = 0;
  let foundStart = false;

  // 找到 moduleDataMap 对象的完整定义（正确匹配大括号）
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

  // 生成新的映射（去重）
  const mappingMap = new Map();
  modules.forEach(m => {
    const shortId = m.moduleId.replace(`grade${m.grade}-`, '').replace(`${m.semester}-mod-`, '');
    const varName = m.filename.replace(/-/g, '').replace(/_/g, '');

    // 优先使用完整的moduleId
    mappingMap.set(m.moduleId, varName);

    // 对于短ID，只有当不存在时才添加（避免覆盖）
    if (!mappingMap.has(shortId)) {
      mappingMap.set(shortId, varName);
    }

    // 添加带年级学期前缀的短ID
    const prefixedShortId = `${m.grade}${m.semester[0]}-${shortId}`;
    mappingMap.set(prefixedShortId, varName);
  });

  const mappings = Array.from(mappingMap.entries())
    .map(([key, varName]) => `        '${key}': ${varName}Data`)
    .join(',\n');

  const mapContent = `const moduleDataMap: Record<string, Module> = {\n${mappings}\n      }`;

  // 查找映射结束位置
  const afterMap = content.substring(mapEnd);

  // 组装新内容
  const beforeImports = content.substring(0, importStart);
  const newContent = beforeImports + imports + '\n\n' + mapContent + afterMap;

  fs.writeFileSync(MODULE_PAGE_FILE, newContent, 'utf8');
  console.log('✓ ModulePage.tsx 更新完成');
}

// 主函数
function main() {
  console.log('🚀 开始自动化书籍导入...\n');

  try {
    // 1. 扫描模块文件
    const modules = scanModuleFiles();
    if (modules.length === 0) {
      console.log('❌ 未发现任何模块文件，请检查文件命名格式');
      process.exit(1);
    }

    console.log('发现的模块文件：');
    modules.forEach(m => {
      console.log(`  - ${m.filename}.json (${m.moduleId})`);
    });
    console.log('');

    // 2. 按书籍分组
    const booksData = groupModulesByBook(modules);
    console.log(`发现 ${Object.keys(booksData).length} 本书籍：`);
    Object.entries(booksData).forEach(([bookKey, bookInfo]) => {
      console.log(`  - ${bookInfo.title} (${bookInfo.modules.length} 个单元)`);
    });
    console.log('');

    // 3. 更新文件
    updateBooksFile(booksData);
    updateBookModulesPageFile(modules);
    updateModulePageFile(modules);

    console.log('\n✅ 自动化导入完成！');
    console.log('\n📋 下一步操作：');
    console.log('1. 运行 npm run build 检查是否有编译错误');
    console.log('2. 运行 npm run dev 启动开发服务器');
    console.log('3. 测试书籍选择和模块加载功能');

  } catch (error) {
    console.error('❌ 导入过程中出现错误：', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { parseModuleFileName, scanModuleFiles, groupModulesByBook };