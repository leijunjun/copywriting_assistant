/**
 * WeChat OAuth Callback Handler
 * 
 * This endpoint handles the WeChat OAuth callback and creates user sessions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWeChatCallback } from '@/lib/auth/wechat';
import { validateWeChatCallbackRequest } from '@/lib/validation/auth';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function POST(request: NextRequest) {
  try {
    logger.api('WeChat OAuth callback request received');

    // Parse request body
    const body = await request.json();
    
    // Validate request
    try {
      validateWeChatCallbackRequest(body);
    } catch (validationError) {
      logger.error('Invalid WeChat callback request', undefined, 'API', {
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

    const { code, state } = body;

    // Handle WeChat callback
    const result = await handleWeChatCallback(code, state);

    if (!result.success) {
      logger.error('WeChat callback failed', undefined, 'API', {
        error: result.error,
        code,
        state,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'CALLBACK_FAILED',
          message: result.error || 'Failed to handle WeChat callback',
          type: 'EXTERNAL',
          severity: 'HIGH',
        }),
        { status: 400 }
      );
    }

    logger.auth('User authenticated successfully via WeChat', {
      userId: result.user?.id,
      openid: result.user?.wechat_openid,
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    });

  } catch (error) {
    logger.error('Unexpected error in WeChat callback', error, 'API');
    
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

export async function GET(request: NextRequest) {
  try {
    logger.api('WeChat OAuth callback GET request received');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      logger.error('Missing required parameters in WeChat callback', undefined, 'API', {
        code: !!code,
        state: !!state,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'MISSING_PARAMETERS',
          message: 'Missing required parameters: code and state',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Handle WeChat callback
    const result = await handleWeChatCallback(code, state);

    if (!result.success) {
      logger.error('WeChat callback failed', undefined, 'API', {
        error: result.error,
        code,
        state,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'CALLBACK_FAILED',
          message: result.error || 'Failed to handle WeChat callback',
          type: 'EXTERNAL',
          severity: 'HIGH',
        }),
        { status: 400 }
      );
    }

    logger.auth('User authenticated successfully via WeChat', {
      userId: result.user?.id,
      openid: result.user?.wechat_openid,
    });

    // Redirect to success page or return JSON
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        user: result.user,
        session: result.session,
      });
    } else {
      // Redirect to success page
      return NextResponse.redirect(new URL('/auth/success', request.url));
    }

  } catch (error) {
    logger.error('Unexpected error in WeChat callback', error, 'API');
    
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
