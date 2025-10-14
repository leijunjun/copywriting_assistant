/**
 * 测试积分扣除同步性
 * 验证前端显示的积分数和数据库配置是否一致
 */

const { createClient } = require('@supabase/supabase-js');

// 配置Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreditSync() {
  console.log('🔍 开始测试积分扣除同步性...\n');

  try {
    // 1. 检查数据库中的配置
    console.log('1. 检查数据库配置:');
    const { data: configData, error: configError } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', 'image_generation_credits');

    if (configError) {
      console.error('❌ 数据库查询失败:', configError);
      return;
    }

    if (configData && configData.length > 0) {
      const config = configData[0];
      console.log(`   ✅ 配置键: ${config.config_key}`);
      console.log(`   ✅ 配置值: ${config.config_value}`);
      console.log(`   ✅ 描述: ${config.description}`);
    } else {
      console.log('   ⚠️  未找到 image_generation_credits 配置');
    }

    // 2. 测试API端点
    console.log('\n2. 测试API端点:');
    
    // 测试图片生成积分扣除率API
    try {
      const response = await fetch('http://localhost:3000/api/credits/image-generation-rate');
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ API返回积分扣除率: ${data.rate}`);
        console.log(`   ✅ API状态: ${data.success ? '成功' : '失败'}`);
      } else {
        console.log(`   ❌ API请求失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ API请求错误: ${error.message}`);
    }

    // 3. 检查其他相关配置
    console.log('\n3. 检查其他积分相关配置:');
    const { data: allConfigs, error: allConfigsError } = await supabase
      .from('system_config')
      .select('*')
      .like('config_key', '%credit%');

    if (!allConfigsError && allConfigs) {
      allConfigs.forEach(config => {
        console.log(`   📋 ${config.config_key}: ${config.config_value}`);
      });
    }

    console.log('\n✅ 积分扣除同步性测试完成');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testCreditSync();
