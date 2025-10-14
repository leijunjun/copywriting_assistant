/**
 * Image Generation Credit Rate API Endpoint
 * 
 * This endpoint provides the current credit deduction rate for image generation.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { getSystemConfig } from '@/lib/database/system-config';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.api('Image generation credit rate request received');

    // Get image generation credit cost directly from database (bypass cache)
    const result = await getSystemConfig('image_generation_credits');
    let creditCost = 50; // default fallback
    
    if (result.success && result.config) {
      const parsedValue = parseInt(result.config.config_value, 10);
      if (!isNaN(parsedValue) && parsedValue > 0) {
        creditCost = parsedValue;
      }
    }

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
      rate: 50, // Fallback value
    }, { status: 500 });
  }
}
