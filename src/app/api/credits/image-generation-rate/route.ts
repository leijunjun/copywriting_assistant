/**
 * Image Generation Credit Rate API Endpoint
 * 
 * This endpoint provides the current credit deduction rate for image generation.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { IMAGE_GENERATION_CREDITS } from '@/config/credit-config';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.api('Image generation credit rate request received');

    // 使用硬编码配置，确保安全性和一致性
    const creditCost = IMAGE_GENERATION_CREDITS;

    logger.api('Image generation credit cost retrieved', { cost: creditCost });

    return NextResponse.json({
      success: true,
      rate: creditCost,
      message: 'Image generation credit cost retrieved successfully',
    });

  } catch (error) {
    logger.error('Unexpected error getting image generation credit cost', error, 'API');
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get image generation credit cost',
      rate: IMAGE_GENERATION_CREDITS, // 使用配置常量作为默认值
    }, { status: 500 });
  }
}
