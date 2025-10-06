/**
 * WeChat Login Status Polling Endpoint
 * 
 * This endpoint checks the status of WeChat login attempts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkWeChatLoginStatus } from '@/lib/auth/wechat';
import { validateWeChatStatusRequest } from '@/lib/validation/auth';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function GET(request: NextRequest) {
  try {
    logger.api('WeChat login status request received');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      logger.error('Missing session_id parameter', undefined, 'API');
      
      return NextResponse.json(
        createErrorResponse({
          code: 'MISSING_SESSION_ID',
          message: 'Session ID is required',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Validate request
    try {
      validateWeChatStatusRequest({ session_id: sessionId });
    } catch (validationError) {
      logger.error('Invalid WeChat status request', undefined, 'API', {
        error: validationError,
        sessionId,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_REQUEST',
          message: 'Invalid request parameters',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Check login status
    const result = await checkWeChatLoginStatus(sessionId);

    if (!result.success) {
      logger.error('Failed to check WeChat login status', undefined, 'API', {
        error: result.error,
        sessionId,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'STATUS_CHECK_FAILED',
          message: result.error || 'Failed to check login status',
          type: 'EXTERNAL',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('WeChat login status checked successfully', {
      sessionId,
      status: result.status,
      hasUser: !!result.user,
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      user: result.user,
    });

  } catch (error) {
    logger.error('Unexpected error in WeChat login status check', error, 'API');
    
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

export async function POST(request: NextRequest) {
  try {
    logger.api('WeChat login status POST request received');

    // Parse request body
    const body = await request.json();
    
    // Validate request
    try {
      validateWeChatStatusRequest(body);
    } catch (validationError) {
      logger.error('Invalid WeChat status request', undefined, 'API', {
        error: validationError,
        body,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_REQUEST',
          message: 'Invalid request parameters',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    const { session_id } = body;

    // Check login status
    const result = await checkWeChatLoginStatus(session_id);

    if (!result.success) {
      logger.error('Failed to check WeChat login status', undefined, 'API', {
        error: result.error,
        sessionId: session_id,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'STATUS_CHECK_FAILED',
          message: result.error || 'Failed to check login status',
          type: 'EXTERNAL',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('WeChat login status checked successfully', {
      sessionId: session_id,
      status: result.status,
      hasUser: !!result.user,
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      user: result.user,
    });

  } catch (error) {
    logger.error('Unexpected error in WeChat login status check', error, 'API');
    
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
