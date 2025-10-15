/**
 * 检查数据库表结构
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 检查数据库表结构...\n');

  try {
    // 1. 检查所有表
    console.log('=== 检查所有表 ===');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ 查询表失败:', tablesError);
      return;
    }

    console.log('数据库中的表:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });

    // 2. 检查 users 表结构
    console.log('\n=== 检查 users 表结构 ===');
    const { data: usersColumns, error: usersError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (usersError) {
      console.error('❌ 查询 users 表结构失败:', usersError);
    } else {
      console.log('users 表字段:');
      usersColumns.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      });
    }

    // 3. 检查 user_credits 表结构
    console.log('\n=== 检查 user_credits 表结构 ===');
    const { data: creditsColumns, error: creditsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_credits')
      .eq('table_schema', 'public');
    
    if (creditsError) {
      console.error('❌ 查询 user_credits 表结构失败:', creditsError);
    } else {
      console.log('user_credits 表字段:');
      creditsColumns.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      });
    }

    // 4. 检查是否有 user_stats 表
    console.log('\n=== 检查 user_stats 表 ===');
    const { data: statsColumns, error: statsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'user_stats')
      .eq('table_schema', 'public');
    
    if (statsError) {
      console.error('❌ user_stats 表不存在或查询失败:', statsError);
    } else {
      console.log('user_stats 表字段:');
      statsColumns.forEach(column => {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      });
    }

    // 5. 检查实际数据
    console.log('\n=== 检查实际数据 ===');
    const { data: usersData, error: usersDataError } = await supabase
      .from('users')
      .select('id, email, nickname')
      .limit(3);
    
    if (usersDataError) {
      console.error('❌ 查询用户数据失败:', usersDataError);
    } else {
      console.log('用户数据示例:');
      usersData.forEach(user => {
        console.log(`  - ${user.email}: ${user.nickname}`);
      });
    }

    const { data: creditsData, error: creditsDataError } = await supabase
      .from('user_credits')
      .select('user_id, balance')
      .limit(3);
    
    if (creditsDataError) {
      console.error('❌ 查询积分数据失败:', creditsDataError);
    } else {
      console.log('积分数据示例:');
      creditsData.forEach(credit => {
        console.log(`  - 用户ID: ${credit.user_id}, 余额: ${credit.balance}`);
      });
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

checkTables();
