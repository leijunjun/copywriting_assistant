/**
 * Credit Deduction Rate API Endpoint
 * 
 * This endpoint provides the current credit deduction rate for content generation.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { getCreditDeductionRate } from '@/lib/database/system-config';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.api('Credit deduction rate request received');

    // Get credit deduction rate from system config
    const deductionRate = await getCreditDeductionRate();

    logger.api('Credit deduction rate retrieved', { rate: deductionRate });

    return NextResponse.json({
      success: true,
      deduction_rate: deductionRate,
      message: 'Credit deduction rate retrieved successfully',
    });

  } catch (error) {
    logger.error('Unexpected error getting credit deduction rate', error, 'API');
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get credit deduction rate',
      deduction_rate: 5, // Fallback value
    }, { status: 500 });
  }
}
