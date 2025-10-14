/**
 * 修复数据库配置脚本
 * 直接插入 image_generation_credits 配置
 */

const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseConfig() {
  console.log('🔧 开始修复数据库配置...');

  try {
    // 1. 检查现有配置
    console.log('📋 检查现有配置...');
    const { data: existingConfig, error: checkError } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', 'image_generation_credits');

    if (checkError) {
      console.error('❌ 检查配置失败:', checkError);
      return;
    }

    if (existingConfig && existingConfig.length > 0) {
      console.log('✅ 配置已存在:', existingConfig[0]);
      console.log('📊 当前值:', existingConfig[0].config_value);
    } else {
      console.log('⚠️ 配置不存在，开始插入...');
      
      // 2. 插入新配置
      const { data: insertData, error: insertError } = await supabase
        .from('system_config')
        .insert({
          config_key: 'image_generation_credits',
          config_value: '10', // 设置为10
          description: 'AI图片生成所需积分数量',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error('❌ 插入配置失败:', insertError);
        return;
      }

      console.log('✅ 配置插入成功:', insertData[0]);
    }

    // 3. 验证配置
    console.log('🔍 验证配置...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('system_config')
      .select('*')
      .eq('config_key', 'image_generation_credits');

    if (verifyError) {
      console.error('❌ 验证配置失败:', verifyError);
      return;
    }

    if (verifyData && verifyData.length > 0) {
      console.log('✅ 配置验证成功:');
      console.log('   📋 配置键:', verifyData[0].config_key);
      console.log('   📊 配置值:', verifyData[0].config_value);
      console.log('   📝 描述:', verifyData[0].description);
      console.log('   🕒 创建时间:', verifyData[0].created_at);
      console.log('   🔄 更新时间:', verifyData[0].updated_at);
    } else {
      console.error('❌ 配置验证失败：未找到配置项');
    }

    console.log('🎉 数据库配置修复完成！');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

// 运行修复
fixDatabaseConfig();
