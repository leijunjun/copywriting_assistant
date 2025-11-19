/**
 * 图片分析积分成本API
 * 直接查询数据库，避免复杂的系统配置模块
 */

import { NextRequest, NextResponse } from 'next/server';
import { IMAGE_ANALYSIS_CREDITS, CREDIT_CONFIG } from '@/config/credit-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 图片分析积分成本API被调用');
    
    // 使用硬编码配置，确保安全性和一致性
    const cost = IMAGE_ANALYSIS_CREDITS;
    console.log('✅ 使用硬编码积分成本:', cost);

    return NextResponse.json({
      success: true,
      cost: cost,
      message: 'Image analysis cost retrieved successfully (hardcoded)',
      config: {
        minCost: CREDIT_CONFIG.IMAGE_ANALYSIS.MIN_COST,
        maxCost: CREDIT_CONFIG.IMAGE_ANALYSIS.MAX_COST,
      }
    });

  } catch (error) {
    console.error('❌ API错误:', error);
    return NextResponse.json({
      success: false,
      cost: IMAGE_ANALYSIS_CREDITS, // 使用配置常量作为默认值
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

