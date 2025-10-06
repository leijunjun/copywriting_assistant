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

    // Return success HTML page or JSON
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        user: result.user,
        session: result.session,
      });
    } else {
      // Return success HTML page
      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>登录成功</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 2rem;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 90%;
            }
            .success-icon {
              width: 64px;
              height: 64px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
              color: white;
              font-size: 24px;
            }
            h1 {
              color: #1f2937;
              margin: 0 0 0.5rem 0;
              font-size: 1.5rem;
            }
            p {
              color: #6b7280;
              margin: 0 0 1.5rem 0;
            }
            .loading {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 2px solid #e5e7eb;
              border-radius: 50%;
              border-top-color: #3b82f6;
              animation: spin 1s ease-in-out infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .countdown {
              color: #6b7280;
              font-size: 0.875rem;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>登录成功！</h1>
            <p>欢迎使用我们的服务</p>
            <div class="loading"></div>
            <div class="countdown">正在为您跳转...</div>
          </div>
          <script>
            // Close the popup window if opened in popup
            if (window.opener) {
              // Send success message to parent window
              window.opener.postMessage({
                type: 'WECHAT_LOGIN_SUCCESS',
                success: true,
                user: ${JSON.stringify(result.user)},
                session: ${JSON.stringify(result.session)}
              }, '*');
              
              // Close the popup
              setTimeout(() => {
                window.close();
              }, 2000);
            } else {
              // Redirect to home page if not in popup
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            }
          </script>
        </body>
        </html>
      `;
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
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
