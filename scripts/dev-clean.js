#!/usr/bin/env node

/**
 * 清理开发环境缓存和优化启动
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 清理开发环境缓存...');

// 清理缓存目录
const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  'dist',
  'build'
];

cacheDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`删除 ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('✅ 缓存清理完成！');
console.log('🚀 启动开发服务器...');

// 启动开发服务器
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('启动失败:', error.message);
  process.exit(1);
}
