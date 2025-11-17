/**
 * Industry Presets API Endpoint
 * 
 * Returns industry-specific presets for Chrome Extension
 * Supports version checking for cache updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { industryConfigMap, type IndustryType, type IndustryPresets } from '@/constant/industry';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Generate version hash from preset data
 */
function generateVersion(data: IndustryPresets): string {
  const dataString = JSON.stringify(data);
  return crypto.createHash('md5').update(dataString).digest('hex').substring(0, 16);
}

/**
 * GET /api/industry-presets
 * 
 * Query parameters:
 * - industry: Industry type (optional, default: all industries)
 * - version: Current version for update checking (optional)
 * 
 * Returns:
 * - success: boolean
 * - data: IndustryPresets object
 * - version: string (hash of the data)
 * - timestamp: number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const industryParam = searchParams.get('industry') as IndustryType | null;
    const clientVersion = searchParams.get('version') || null;

    // Get presets for the specified industry or all industries
    let presetsData: IndustryPresets;
    
    if (industryParam && industryParam !== 'general' && industryConfigMap[industryParam as IndustryType]) {
      // Return presets for specific industry
      presetsData = {
        [industryParam]: industryConfigMap[industryParam as IndustryType],
      };
    } else {
      // Return all industry presets
      presetsData = industryConfigMap;
    }

    // Generate version hash
    const version = generateVersion(presetsData);

    // If client version matches, return 304 Not Modified
    if (clientVersion === version) {
      return new NextResponse(null, { status: 304 });
    }

    // Return presets with version info
    return NextResponse.json({
      success: true,
      data: presetsData,
      version,
      timestamp: Date.now(),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error fetching industry presets:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'PRESETS_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch industry presets',
      },
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

