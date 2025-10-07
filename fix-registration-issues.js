/**
 * 修复注册问题脚本
 * 
 * 解决用户注册失败的问题
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
  console.error('请确保在 .env.local 文件中设置了以下变量:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRegistrationIssues() {
  console.log('🔧 开始修复注册问题...\n');

  try {
    // 1. 检查数据库表是否存在
    console.log('📋 检查数据库表...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ 无法获取表列表:', tablesError.message);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('✅ 现有表:', existingTables);

    // 2. 如果表不存在，创建基本表结构
    if (!existingTables.includes('users')) {
      console.log('🔨 创建基本表结构...');
      
      // 创建用户表
      const { error: createUsersError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            nickname VARCHAR(100) NOT NULL DEFAULT '',
            avatar_url TEXT DEFAULT '',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (createUsersError) {
        console.error('❌ 创建用户表失败:', createUsersError.message);
      } else {
        console.log('✅ 用户表创建成功');
      }
    }

    // 3. 检查用户表结构
    console.log('\n🔍 检查用户表结构...');
    const { data: userTest, error: userTestError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userTestError) {
      console.error('❌ 用户表结构错误:', userTestError.message);
      console.error('详细错误:', userTestError);
    } else {
      console.log('✅ 用户表结构正常');
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

    // 5. 检查Supabase认证设置
    console.log('\n🔐 检查Supabase认证设置...');
    console.log('请确保在Supabase Dashboard中：');
    console.log('1. Authentication > Settings > Enable email confirmations: OFF');
    console.log('2. Authentication > Settings > Password requirements: 合理设置');
    console.log('3. Authentication > Settings > Rate limits: 合理设置');

    // 6. 提供解决方案
    console.log('\n💡 解决方案建议：');
    console.log('1. 如果表不存在，请执行数据库重建脚本');
    console.log('2. 如果表结构错误，请检查数据库迁移');
    console.log('3. 如果认证失败，请检查Supabase设置');
    console.log('4. 如果权限问题，请检查RLS策略');

    console.log('\n🎉 注册问题诊断完成！');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error.message);
  }
}

// 运行修复
fixRegistrationIssues();