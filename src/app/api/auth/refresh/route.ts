/**
 * Refresh Token API Endpoint
 * 
 * Handles token refresh for authenticated users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function POST(request: NextRequest) {
  try {
    logger.api('Token refresh request received');

    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        createErrorResponse({
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabaseServer = createServerSupabaseClient();

    // Refresh session with Supabase
    const { data, error } = await supabaseServer.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      logger.error('Token refresh failed', undefined, 'API', { error: error.message });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        createErrorResponse({
          code: 'REFRESH_FAILED',
          message: 'Token refresh failed',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 401 }
      );
    }

    logger.auth('Token refreshed successfully', {
      userId: data.session.user?.id,
    });

    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });

  } catch (error) {
    logger.error('Unexpected error in token refresh', error, 'API');
    
    return NextResponse.json(
      createErrorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        type: 'INTERNAL',
        severity: 'CRITICAL',
      }),
      { status: 500 }
    );
  }
}

