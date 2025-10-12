#!/usr/bin/env node

/**
 * 构建前验证脚本
 *
 * 在运行 npm run build 之前运行此脚本来验证：
 * 1. 导入导出一致性
 * 2. 文件完整性
 * 3. 语法正确性
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_INDEX_FILE = path.join(PROJECT_ROOT, 'src/content/index.ts');
const BOOK_MODULES_PAGE_FILE = path.join(PROJECT_ROOT, 'src/pages/BookModulesPage.tsx');

function validateImportExportConsistency() {
  console.log('🔍 检查导入导出一致性...');

  // 读取content/index.ts
  const contentIndexContent = fs.readFileSync(CONTENT_INDEX_FILE, 'utf8');

  // 提取所有导出
  const exports = contentIndexContent.match(/export\s+(\{[^}]+\}|\w+\s*\w+|\w+\s*=)/g) || [];
  const exportedNames = new Set();

  exports.forEach(exportLine => {
    if (exportLine.includes('export const')) {
      // 处理 export const moduleData
      const match = exportLine.match(/export const (\w+)/);
      if (match) {
        exportedNames.add(match[1]);
      }
    } else if (exportLine.includes('export function')) {
      // 处理 export function
      const match = exportLine.match(/export function (\w+)/);
      if (match) {
        exportedNames.add(match[1]);
      }
    } else if (exportLine.includes('export {')) {
      // 处理具名导出: export { name1, name2 }
      const match = exportLine.match(/export\s+\{\s*([^}]+)\s*\}/);
      if (match) {
        const names = match[1].split(',').map(name => {
          // 处理别名导出: export { varName as alias }
          const aliasMatch = name.trim().match(/(.+)\s+as\s+(.+)/);
          if (aliasMatch) {
            return aliasMatch[2].trim();
          }
          return name.trim();
        });
        names.forEach(name => exportedNames.add(name));
      }
    }
  });

  // 读取BookModulesPage.tsx检查导入
  const bookModulesContent = fs.readFileSync(BOOK_MODULES_PAGE_FILE, 'utf8');
  const importMatch = bookModulesContent.match(/import\s*\{[^}]+\}\s*from\s*['"]@\/content['"]/);

  if (importMatch) {
    const importLine = importMatch[0];
    const importedNames = importLine.match(/\{\s*([^}]+)\s*\}/)[1].split(',').map(name => name.trim());

    const missingExports = importedNames.filter(name => !exportedNames.has(name));

    if (missingExports.length > 0) {
      console.error('❌ 发现缺失的导出:');
      missingExports.forEach(name => console.error(`   - ${name}`));
      return false;
    }
  }

  console.log('✅ 导入导出一致性检查通过');
  return true;
}

function validateDuplicateExports() {
  console.log('🔍 检查重复导出...');

  const contentIndexContent = fs.readFileSync(CONTENT_INDEX_FILE, 'utf8');
  const exportMatches = contentIndexContent.match(/export\s+(const\s+\w+|function\s+\w+|{[^}]+})/g) || [];

  const exportNames = new Set();
  const duplicates = new Set();

  exportMatches.forEach(match => {
    let name;
    if (match.includes('export const')) {
      name = match.match(/export const (\w+)/)[1];
    } else if (match.includes('export function')) {
      name = match.match(/export function (\w+)/)[1];
    } else if (match.includes('export {')) {
      // 处理具名导出
      const names = match.match(/{([^}]+)}/)[1].split(',').map(n => n.trim().split(' as ')[0]);
      names.forEach(n => {
        if (exportNames.has(n)) {
          duplicates.add(n);
        } else {
          exportNames.add(n);
        }
      });
      return;
    }

    if (name) {
      if (exportNames.has(name)) {
        duplicates.add(name);
      } else {
        exportNames.add(name);
      }
    }
  });

  if (duplicates.size > 0) {
    console.error('❌ 发现重复导出:');
    duplicates.forEach(name => console.error(`   - ${name}`));
    return false;
  }

  console.log('✅ 重复导出检查通过');
  return true;
}

function validateFileStructure() {
  console.log('🔍 检查文件结构...');

  const requiredFiles = [
    'src/content/index.ts',
    'src/data/books.ts',
    'src/pages/BookModulesPage.tsx',
    'src/pages/ModulePage.tsx'
  ];

  const missingFiles = requiredFiles.filter(file =>
    !fs.existsSync(path.join(PROJECT_ROOT, file))
  );

  if (missingFiles.length > 0) {
    console.error('❌ 发现缺失的文件:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    return false;
  }

  console.log('✅ 文件结构检查通过');
  return true;
}

function runQuickBuildCheck() {
  console.log('🔍 运行快速构建检查...');

  try {
    const { execSync } = require('child_process');
    const result = execSync('npx tsc --noEmit', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    console.log('✅ TypeScript编译检查通过');
    return true;
  } catch (error) {
    console.error('❌ TypeScript编译检查失败:');
    console.error(error.stdout || error.stderr);
    return false;
  }
}

function main() {
  console.log('🚀 开始构建前验证...\n');
  console.log('='.repeat(50));

  const checks = [
    validateFileStructure,
    validateDuplicateExports,
    validateImportExportConsistency,
    runQuickBuildCheck
  ];

  let allPassed = true;

  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
    console.log(''); // 空行分隔
  }

  console.log('='.repeat(50));

  if (allPassed) {
    console.log('✅ 所有验证检查通过！可以安全运行构建。');
    process.exit(0);
  } else {
    console.log('❌ 发现问题，请修复后再运行构建。');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}