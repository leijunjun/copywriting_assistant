#!/usr/bin/env node

/**
 * 开发环境优化脚本
 * 设置环境变量来减少启动错误和警告
 */

const { spawn } = require('child_process');
const path = require('path');

// 设置优化环境变量
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.WATCHPACK_POLLING = 'true';
process.env.WEBPACK_CACHE = 'false';
process.env.NEXT_PRIVATE_SKIP_VALIDATION = '1';

console.log('🚀 启动优化开发服务器...');
console.log('📊 已禁用遥测数据收集');
console.log('🧠 已优化内存使用');
console.log('⚡ 已启用快速轮询');

// 启动开发服务器
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // 额外的优化环境变量
    NODE_ENV: 'development',
    NEXT_TELEMETRY_DISABLED: '1',
    NODE_OPTIONS: '--max-old-space-size=4096',
    WATCHPACK_POLLING: 'true',
    WEBPACK_CACHE: 'false',
    NEXT_PRIVATE_SKIP_VALIDATION: '1'
  }
});

devProcess.on('error', (error) => {
  console.error('启动失败:', error);
  process.exit(1);
});

devProcess.on('close', (code) => {
  console.log(`开发服务器退出，代码: ${code}`);
  process.exit(code);
});

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止开发服务器...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在停止开发服务器...');
  devProcess.kill('SIGTERM');
});
