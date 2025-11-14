/**
 * 测试环境变量配置脚本
 * 验证所有新增的环境变量是否正确配置
 */

// 检查必需的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_MODEL_NAME',
];

// 检查可选的环境变量
const optionalEnvVars = [
  'NEXT_PUBLIC_WRITER_MODEL',
  'NEXT_PUBLIC_IMAGE_API_URL',
  'NEXT_PUBLIC_IMAGE_MODEL',
  'NEXT_PUBLIC_KIMI_API_KEY',
  'NEXT_PUBLIC_KIMI_MODEL',
];

console.log('🔍 检查环境变量配置...\n');

console.log('📌 必需的环境变量:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: 未配置`);
  }
});

console.log('\n📌 可选的环境变量（有默认值）:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    // 显示默认值
    let defaultValue = '';
    if (varName === 'NEXT_PUBLIC_WRITER_MODEL') {
      defaultValue = 'qwen3-235b-a22b-instruct-2507';
    } else if (varName === 'NEXT_PUBLIC_IMAGE_API_URL') {
      defaultValue = 'https://api.302.ai/doubao/images/generations';
    } else if (varName === 'NEXT_PUBLIC_IMAGE_MODEL') {
      defaultValue = 'doubao-seedream-4-0-250828';
    } else if (varName === 'NEXT_PUBLIC_KIMI_API_KEY') {
      defaultValue = '将使用 NEXT_PUBLIC_API_KEY';
    } else if (varName === 'NEXT_PUBLIC_KIMI_MODEL') {
      defaultValue = '将使用 NEXT_PUBLIC_MODEL_NAME';
    }
    console.log(`  ⚠️  ${varName}: 未配置（将使用默认值: ${defaultValue}）`);
  }
});

console.log('\n✨ 环境变量检查完成');
console.log('\n💡 提示：');
console.log('  - 如需切换模型，请修改 .env.local 文件中的相应变量');
console.log('  - 修改后需要重启开发服务器才能生效');

