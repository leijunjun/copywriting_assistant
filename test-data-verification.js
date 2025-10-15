/**
 * 数据验证脚本
 * 检查会员管理列表中的行业和积分字段是否与数据库一致
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyData() {
  console.log('🔍 开始验证会员管理数据...\n');

  try {
    // 1. 检查用户数据
    console.log('=== 用户数据检查 ===');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, nickname, industry, created_at, last_login_at')
      .limit(10);
    
    if (usersError) {
      console.error('❌ 用户数据查询失败:', usersError);
      return;
    }

    console.log(`✅ 找到 ${users.length} 个用户`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - 昵称: ${user.nickname}`);
      console.log(`   - 行业: ${user.industry}`);
      console.log(`   - 注册时间: ${user.created_at}`);
      console.log(`   - 最后登录: ${user.last_login_at || '从未登录'}`);
      console.log('');
    });

    // 2. 检查积分数据
    console.log('=== 积分数据检查 ===');
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('user_id, balance, updated_at')
      .limit(10);
    
    if (creditsError) {
      console.error('❌ 积分数据查询失败:', creditsError);
      return;
    }

    console.log(`✅ 找到 ${credits.length} 个积分记录`);
    credits.forEach((credit, index) => {
      console.log(`${index + 1}. 用户ID: ${credit.user_id}`);
      console.log(`   - 余额: ${credit.balance}`);
      console.log(`   - 更新时间: ${credit.updated_at}`);
      console.log('');
    });

    // 3. 检查关联查询（模拟API查询）
    console.log('=== 关联查询检查（模拟API） ===');
    const { data: joined, error: joinedError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        nickname,
        industry,
        created_at,
        last_login_at,
        user_credits(balance, updated_at)
      `)
      .limit(5);
    
    if (joinedError) {
      console.error('❌ 关联查询失败:', joinedError);
      return;
    }

    console.log(`✅ 关联查询成功，找到 ${joined.length} 个用户`);
    joined.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - 昵称: ${user.nickname}`);
      console.log(`   - 行业: ${user.industry}`);
      console.log(`   - 积分余额: ${user.user_credits?.[0]?.balance || 0}`);
      console.log(`   - 积分更新时间: ${user.user_credits?.[0]?.updated_at || 'N/A'}`);
      console.log('');
    });

    // 4. 检查行业选项一致性
    console.log('=== 行业选项一致性检查 ===');
    const industryValues = [...new Set(users.map(u => u.industry))];
    console.log('数据库中的行业值:', industryValues);
    
    const expectedIndustries = ['general', 'housekeeping', 'beauty', 'lifestyle-beauty'];
    const missingIndustries = industryValues.filter(industry => !expectedIndustries.includes(industry));
    const extraIndustries = expectedIndustries.filter(industry => !industryValues.includes(industry));
    
    if (missingIndustries.length > 0) {
      console.log('⚠️  数据库中存在但组件中未定义的行业:', missingIndustries);
    }
    if (extraIndustries.length > 0) {
      console.log('⚠️  组件中定义但数据库中不存在的行业:', extraIndustries);
    }
    if (missingIndustries.length === 0 && extraIndustries.length === 0) {
      console.log('✅ 行业选项完全一致');
    }

    // 5. 检查积分余额格式
    console.log('\n=== 积分余额格式检查 ===');
    const totalCredits = credits.reduce((sum, credit) => sum + credit.balance, 0);
    console.log(`总积分余额: ${totalCredits.toLocaleString()}`);
    console.log('积分格式化测试:');
    credits.slice(0, 3).forEach(credit => {
      console.log(`  ${credit.balance} -> ${credit.balance.toLocaleString()}`);
    });

    console.log('\n✅ 数据验证完成！');

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
  }
}

verifyData();
