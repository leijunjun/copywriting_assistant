/**
 * 简单数据库检查脚本
 * 
 * 检查数据库表是否存在
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 环境变量检查:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ 已设置' : '❌ 未设置');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSimple() {
  console.log('🔍 开始检查数据库状态...\n');

  try {
    // 1. 检查用户表是否存在
    console.log('📋 检查用户表...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ 用户表不存在或有问题:', usersError.message);
      console.error('详细错误:', usersError);
      
      if (usersError.message.includes('relation "public.users" does not exist')) {
        console.log('\n💡 解决方案:');
        console.log('1. 在Supabase Dashboard中执行 URGENT_DATABASE_FIX.sql 脚本');
        console.log('2. 或者运行以下SQL命令:');
        console.log(`
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nickname VARCHAR(100) NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
      }
    } else {
      console.log('✅ 用户表存在');
    }

    // 2. 检查积分表是否存在
    console.log('\n💰 检查积分表...');
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .limit(1);

    if (creditsError) {
      console.error('❌ 积分表不存在或有问题:', creditsError.message);
    } else {
      console.log('✅ 积分表存在');
    }

    // 3. 检查交易表是否存在
    console.log('\n📊 检查交易表...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .limit(1);

    if (transactionsError) {
      console.error('❌ 交易表不存在或有问题:', transactionsError.message);
    } else {
      console.log('✅ 交易表存在');
    }

    // 4. 测试用户创建
    console.log('\n🧪 测试用户创建...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      const { data: testUser, error: testUserError } = await supabase
        .from('users')
        .insert({
          email: testEmail,
          nickname: 'Test User',
          avatar_url: ''
        })
        .select()
        .single();

      if (testUserError) {
        console.error('❌ 测试用户创建失败:', testUserError.message);
        console.error('详细错误:', testUserError);
      } else {
        console.log('✅ 测试用户创建成功:', testUser);
        
        // 清理测试用户
        await supabase
          .from('users')
          .delete()
          .eq('id', testUser.id);
        console.log('🧹 测试用户已清理');
      }
    } catch (error) {
      console.error('❌ 测试用户创建过程中发生错误:', error.message);
    }

    console.log('\n🎉 数据库检查完成！');

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

// 运行检查
checkDatabaseSimple();
