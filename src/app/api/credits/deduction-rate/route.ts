/**
 * Credit Deduction Rate API Endpoint
 * 
 * This endpoint provides the current credit deduction rate for content generation.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { CREDIT_CONFIG } from '@/config/credit-config';
import { logger, LogCategory } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.api('Credit deduction rate request received');

    // 使用硬编码配置，确保安全性和一致性
    const deductionRate = CREDIT_CONFIG.WRITING_GENERATION.COST;
    console.log('✅ 使用硬编码积分扣除率:', deductionRate);

    logger.api('Credit deduction rate retrieved', { rate: deductionRate });

    return NextResponse.json({
      success: true,
      deduction_rate: deductionRate,
      message: 'Credit deduction rate retrieved successfully',
    });

  } catch (error) {
    logger.error('Unexpected error getting credit deduction rate', undefined, LogCategory.API);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get credit deduction rate',
      deduction_rate: CREDIT_CONFIG.WRITING_GENERATION.COST, // Fallback value
    }, { status: 500 });
  }
}
