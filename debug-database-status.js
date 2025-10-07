/**
 * 数据库状态诊断脚本
 * 
 * 检查数据库表结构、函数和配置是否正确
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

async function checkDatabaseStatus() {
  console.log('🔍 开始检查数据库状态...\n');

  try {
    // 1. 检查表是否存在
    console.log('📋 检查表结构...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('❌ 无法获取表列表:', tablesError.message);
      return;
    }

    const expectedTables = ['users', 'user_credits', 'credit_transactions', 'user_sessions', 'system_config', 'audit_logs'];
    const existingTables = tables.map(t => t.table_name);
    
    console.log('✅ 现有表:', existingTables);
    
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      console.error('❌ 缺少表:', missingTables);
      console.error('请执行数据库重建脚本');
      return;
    }

    // 2. 检查函数是否存在
    console.log('\n🔧 检查函数...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .order('routine_name');

    if (functionsError) {
      console.error('❌ 无法获取函数列表:', functionsError.message);
    } else {
      const expectedFunctions = ['process_credit_transaction', 'initialize_user_credits', 'check_user_credit_balance'];
      const existingFunctions = functions.map(f => f.routine_name);
      console.log('✅ 现有函数:', existingFunctions);
      
      const missingFunctions = expectedFunctions.filter(func => !existingFunctions.includes(func));
      if (missingFunctions.length > 0) {
        console.error('❌ 缺少函数:', missingFunctions);
      }
    }

    // 3. 检查系统配置
    console.log('\n⚙️ 检查系统配置...');
    const { data: config, error: configError } = await supabase
      .from('system_config')
      .select('*');

    if (configError) {
      console.error('❌ 无法获取系统配置:', configError.message);
    } else {
      console.log('✅ 系统配置:', config);
    }

    // 4. 测试用户表结构
    console.log('\n👤 测试用户表结构...');
    const { data: userTest, error: userTestError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (userTestError) {
      console.error('❌ 用户表结构错误:', userTestError.message);
    } else {
      console.log('✅ 用户表结构正常');
    }

    // 5. 测试积分表结构
    console.log('\n💰 测试积分表结构...');
    const { data: creditTest, error: creditTestError } = await supabase
      .from('user_credits')
      .select('*')
      .limit(1);

    if (creditTestError) {
      console.error('❌ 积分表结构错误:', creditTestError.message);
    } else {
      console.log('✅ 积分表结构正常');
    }

    // 6. 测试积分处理函数
    console.log('\n🔧 测试积分处理函数...');
    const { data: functionTest, error: functionTestError } = await supabase
      .rpc('process_credit_transaction', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_amount: 100,
        p_transaction_type: 'bonus',
        p_description: 'Test transaction'
      });

    if (functionTestError) {
      console.error('❌ 积分处理函数错误:', functionTestError.message);
    } else {
      console.log('✅ 积分处理函数正常:', functionTest);
    }

    // 7. 检查行级安全策略
    console.log('\n🔒 检查行级安全策略...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.error('❌ 无法获取安全策略:', policiesError.message);
    } else {
      console.log('✅ 安全策略:', policies);
    }

    // 8. 检查现有用户
    console.log('\n👥 检查现有用户...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, nickname, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ 无法获取用户列表:', usersError.message);
    } else {
      console.log('✅ 现有用户:', users);
    }

    console.log('\n🎉 数据库状态检查完成！');

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
  }
}

// 运行检查
checkDatabaseStatus();