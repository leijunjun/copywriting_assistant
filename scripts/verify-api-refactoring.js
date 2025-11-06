/**
 * API 重构验证脚本
 * 验证接口重构是否成功完成
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证 API 重构...\n');

let allPassed = true;

// 验证项目列表
const checks = [
  {
    name: '新接口文件存在',
    path: 'src/app/api/writer/chat/route.ts',
    shouldExist: true
  },
  {
    name: '旧接口目录已删除',
    path: 'src/app/api/dify',
    shouldExist: false
  },
  {
    name: '过时文档已删除',
    path: 'Difyapi.md',
    shouldExist: false
  },
  {
    name: 'Writer 页面文件存在',
    path: 'src/app/[locale]/writer/page.tsx',
    shouldExist: true
  },
  {
    name: 'API 重构文档存在',
    path: 'API_REFACTORING.md',
    shouldExist: true
  }
];

// 执行检查
checks.forEach(check => {
  const fullPath = path.join(process.cwd(), check.path);
  const exists = fs.existsSync(fullPath);
  const passed = exists === check.shouldExist;
  
  if (passed) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name}`);
    allPassed = false;
  }
});

console.log('\n📝 检查接口调用更新...\n');

// 检查 Writer 页面是否使用新接口
try {
  const writerPagePath = path.join(process.cwd(), 'src/app/[locale]/writer/page.tsx');
  const writerPageContent = fs.readFileSync(writerPagePath, 'utf-8');
  
  const oldApiCalls = (writerPageContent.match(/\/api\/dify\/workflow/g) || []).length;
  const newApiCalls = (writerPageContent.match(/\/api\/writer\/chat/g) || []).length;
  
  if (oldApiCalls === 0 && newApiCalls >= 2) {
    console.log(`  ✅ Writer 页面已更新为新接口 (${newApiCalls} 处调用)`);
  } else {
    console.log(`  ❌ Writer 页面接口调用未完全更新`);
    console.log(`     旧接口调用: ${oldApiCalls} 处`);
    console.log(`     新接口调用: ${newApiCalls} 处`);
    allPassed = false;
  }
} catch (error) {
  console.log(`  ❌ 无法读取 Writer 页面文件: ${error.message}`);
  allPassed = false;
}

console.log('\n🔍 检查新接口实现...\n');

// 检查新接口文件内容
try {
  const newApiPath = path.join(process.cwd(), 'src/app/api/writer/chat/route.ts');
  const newApiContent = fs.readFileSync(newApiPath, 'utf-8');
  
  const checks = [
    { pattern: /Writer Chat API/, name: '包含 Writer Chat API 注释' },
    { pattern: /NEXT_PUBLIC_WRITER_MODEL/, name: '使用 Writer 专用模型配置' },
    { pattern: /Writer chat request received/, name: '日志信息已更新' },
    { pattern: /Writer 智能写作/, name: '积分扣除描述已更新' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(newApiContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
      allPassed = false;
    }
  });
} catch (error) {
  console.log(`  ❌ 无法读取新接口文件: ${error.message}`);
  allPassed = false;
}

// 最终结果
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ 所有验证通过！API 重构成功完成。');
  console.log('\n💡 建议：');
  console.log('  1. 启动开发服务器: npm run dev');
  console.log('  2. 访问 Writer 页面测试功能');
  console.log('  3. 检查生成反向提示词功能');
  console.log('  4. 检查智能对话响应功能');
  process.exit(0);
} else {
  console.log('❌ 部分验证失败，请检查上述错误。');
  process.exit(1);
}

