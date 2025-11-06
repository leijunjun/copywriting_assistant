/**
 * Writer 页面 UX 优化验证脚本
 * 验证结构解析区域的自动收缩优化
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 Writer 页面 UX 优化...\n');

const writerPagePath = path.join(process.cwd(), 'src/app/[locale]/writer/page.tsx');

if (!fs.existsSync(writerPagePath)) {
  console.log('❌ Writer 页面文件不存在');
  process.exit(1);
}

const content = fs.readFileSync(writerPagePath, 'utf-8');

let allPassed = true;

console.log('📝 检查优化实现...\n');

// 检查项目 1: 立即折叠结构解析
const immediateCollapsePattern = /setIsGeneratingPrompt\(true\)[\s\S]{0,200}setStructureCollapsed\(true\)/;
if (immediateCollapsePattern.test(content)) {
  console.log('  ✅ 点击按钮后立即折叠结构解析区域');
} else {
  console.log('  ❌ 未找到立即折叠结构解析的代码');
  allPassed = false;
}

// 检查项目 2: 立即展开反向提示词
const immediateExpandPattern = /setStructureCollapsed\(true\)[\s\S]{0,100}setPromptCollapsed\(false\)/;
if (immediateExpandPattern.test(content)) {
  console.log('  ✅ 点击按钮后立即展开反向提示词区域');
} else {
  console.log('  ❌ 未找到立即展开反向提示词的代码');
  allPassed = false;
}

// 检查项目 3: 生成反向提示词按钮存在
const buttonPattern = /onClick=\{\(\) => generateReversePrompt\(\)\}/;
if (buttonPattern.test(content)) {
  console.log('  ✅ "生成反向提示词"按钮配置正确');
} else {
  console.log('  ❌ "生成反向提示词"按钮配置有误');
  allPassed = false;
}

// 检查项目 4: 注释更新
const commentPattern = /立即折叠结构解析区域|确保反向提示词区域保持展开状态/;
if (commentPattern.test(content)) {
  console.log('  ✅ 代码注释已更新');
} else {
  console.log('  ⚠️  建议添加更清晰的注释');
}

// 检查项目 5: 错误处理
const errorHandlingPattern = /catch[\s\S]{100,500}用户可以通过侧边栏重新展开/;
if (errorHandlingPattern.test(content)) {
  console.log('  ✅ 错误处理注释已优化');
} else {
  console.log('  ⚠️  错误处理注释可以进一步优化');
}

console.log('\n📊 代码统计...\n');

// 统计 setStructureCollapsed 调用次数
const structureCollapseCount = (content.match(/setStructureCollapsed\(/g) || []).length;
console.log(`  📌 setStructureCollapsed 调用次数: ${structureCollapseCount}`);

// 统计 setPromptCollapsed 调用次数
const promptCollapseCount = (content.match(/setPromptCollapsed\(/g) || []).length;
console.log(`  📌 setPromptCollapsed 调用次数: ${promptCollapseCount}`);

// 检查优化文档
console.log('\n📚 检查文档...\n');

const docPath = path.join(process.cwd(), 'WRITER_UX_OPTIMIZATION.md');
if (fs.existsSync(docPath)) {
  console.log('  ✅ UX 优化文档已创建');
} else {
  console.log('  ❌ UX 优化文档缺失');
  allPassed = false;
}

// 最终结果
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ Writer 页面 UX 优化验证通过！\n');
  console.log('💡 优化效果：');
  console.log('  • 点击按钮后立即折叠结构解析区域');
  console.log('  • 立即展开反向提示词区域，显示加载状态');
  console.log('  • 用户体验更加流畅，响应更加及时\n');
  console.log('🧪 测试建议：');
  console.log('  1. 启动开发服务器: npm run dev');
  console.log('  2. 访问 Writer 页面');
  console.log('  3. 完成结构解析后，点击"生成反向提示词"');
  console.log('  4. 观察页面是否立即向左收缩');
  process.exit(0);
} else {
  console.log('❌ 部分验证失败，请检查上述错误。');
  process.exit(1);
}

