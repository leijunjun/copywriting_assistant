/**
 * 测试 user_stats 表数据
 * 验证积分余额数据源修正
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserStats() {
  console.log('🔍 测试 user_stats 表数据...\n');

  try {
    // 1. 检查 user_stats 表结构
    console.log('=== 检查 user_stats 表数据 ===');
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id, credit_balance, updated_at')
      .limit(10);
    
    if (statsError) {
      console.error('❌ user_stats 表查询失败:', statsError);
      return;
    }

    console.log(`✅ 找到 ${userStats.length} 条 user_stats 记录`);
    userStats.forEach((stat, index) => {
      console.log(`${index + 1}. 用户ID: ${stat.user_id}`);
      console.log(`   - 积分余额: ${stat.credit_balance}`);
      console.log(`   - 更新时间: ${stat.updated_at}`);
      console.log('');
    });

    // 2. 检查用户和 user_stats 的关联查询
    console.log('=== 检查用户和 user_stats 关联查询 ===');
    const { data: usersWithStats, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        nickname,
        industry,
        user_stats(credit_balance, updated_at)
      `)
      .limit(5);
    
    if (usersError) {
      console.error('❌ 用户关联查询失败:', usersError);
      return;
    }

    console.log(`✅ 关联查询成功，找到 ${usersWithStats.length} 个用户`);
    usersWithStats.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - 昵称: ${user.nickname}`);
      console.log(`   - 行业: ${user.industry}`);
      console.log(`   - 积分余额: ${user.user_stats?.[0]?.credit_balance || 0}`);
      console.log(`   - 积分更新时间: ${user.user_stats?.[0]?.updated_at || 'N/A'}`);
      console.log('');
    });

    // 3. 计算总积分
    console.log('=== 计算总积分 ===');
    const totalCredits = userStats.reduce((sum, stat) => sum + stat.credit_balance, 0);
    console.log(`总积分余额: ${totalCredits.toLocaleString()}`);

    // 4. 检查数据一致性
    console.log('\n=== 数据一致性检查 ===');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(10);
    
    const { data: allStats, error: allStatsError } = await supabase
      .from('user_stats')
      .select('user_id, credit_balance')
      .limit(10);

    if (allUsersError || allStatsError) {
      console.error('❌ 数据一致性检查失败');
      return;
    }

    console.log(`用户总数: ${allUsers.length}`);
    console.log(`user_stats 记录数: ${allStats.length}`);
    
    const usersWithStatsCount = allUsers.filter(user => 
      allStats.some(stat => stat.user_id === user.id)
    ).length;
    
    console.log(`有 user_stats 记录的用户数: ${usersWithStatsCount}`);
    console.log(`覆盖率: ${((usersWithStatsCount / allUsers.length) * 100).toFixed(1)}%`);

    console.log('\n✅ user_stats 表数据测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

testUserStats();
