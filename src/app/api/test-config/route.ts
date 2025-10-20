/**
 * 测试配置API - 用于调试数据库配置
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfig } from '@/lib/database/system-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 测试配置API被调用');
    }
    
    // 直接查询数据库配置
    const result = await getSystemConfig('image_generation_credits');
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 数据库查询结果:', result);
    }
    
    return NextResponse.json({
      success: true,
      config: result,
      message: '配置查询成功'
    });

  } catch (error) {
    console.error('❌ 测试配置API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: '配置查询失败'
    }, { status: 500 });
  }
}
