/**
 * 详细数据测试脚本
 * 检查特定用户的积分数据
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function detailedTest() {
  console.log('🔍 详细数据测试...\n');

  try {
    // 1. 检查特定用户的积分数据
    console.log('=== 检查特定用户积分 ===');
    const { data: specificUser, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        nickname,
        industry,
        user_credits(balance, updated_at)
      `)
      .eq('email', 'yimei@163.com')
      .single();
    
    if (userError) {
      console.error('❌ 查询特定用户失败:', userError);
    } else {
      console.log('用户信息:', specificUser);
      console.log('积分数据:', specificUser.user_credits);
    }

    // 2. 检查所有用户的积分关联
    console.log('\n=== 检查所有用户积分关联 ===');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        nickname,
        industry,
        user_credits(balance, updated_at)
      `)
      .limit(3);
    
    if (allUsersError) {
      console.error('❌ 查询所有用户失败:', allUsersError);
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   - 积分记录数: ${user.user_credits?.length || 0}`);
        if (user.user_credits && user.user_credits.length > 0) {
          console.log(`   - 积分余额: ${user.user_credits[0].balance}`);
        } else {
          console.log(`   - 积分余额: 无记录`);
        }
        console.log('');
      });
    }

    // 3. 检查积分表数据
    console.log('=== 检查积分表数据 ===');
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('user_id, balance, updated_at')
      .limit(5);
    
    if (creditsError) {
      console.error('❌ 查询积分表失败:', creditsError);
    } else {
      console.log('积分表数据:');
      creditsData.forEach((credit, index) => {
        console.log(`${index + 1}. 用户ID: ${credit.user_id}, 余额: ${credit.balance}`);
      });
    }

    // 4. 检查用户和积分的匹配关系
    console.log('\n=== 检查用户和积分匹配关系 ===');
    const { data: usersWithCredits, error: matchError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        user_credits!inner(balance, updated_at)
      `)
      .limit(5);
    
    if (matchError) {
      console.error('❌ 匹配查询失败:', matchError);
    } else {
      console.log(`找到 ${usersWithCredits.length} 个有积分记录的用户:`);
      usersWithCredits.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}: ${user.user_credits?.[0]?.balance || 0} 积分`);
      });
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

detailedTest();
