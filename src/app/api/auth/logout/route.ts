/**
 * Logout API Endpoint
 * 
 * Handles user logout and session cleanup.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function POST(request: NextRequest) {
  try {
    logger.api('Logout request received');

    // Create server-side Supabase client
    const supabaseServer = createServerSupabaseClient();

    // Sign out from Supabase
    const { error } = await supabaseServer.auth.signOut();

    if (error) {
      logger.error('Logout failed', undefined, 'API', { error: error.message });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'LOGOUT_FAILED',
          message: 'Logout failed',
          type: 'AUTHENTICATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    logger.auth('User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    logger.error('Unexpected error in logout', error, 'API');
    
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

