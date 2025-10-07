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
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Log all parameters for debugging
    logger.api('WeChat callback parameters', {
      code: code ? 'present' : 'missing',
      state: state ? 'present' : 'missing',
      error,
      errorDescription,
      fullUrl: request.url,
    });

    // Handle error cases
    if (error) {
      logger.error('WeChat OAuth error', undefined, 'API', {
        error,
        errorDescription,
        state,
      });
      
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>登录失败</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
            .error-icon {
              width: 64px;
              height: 64px;
              background: #ef4444;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">✗</div>
            <h1>登录失败</h1>
            <p>${errorDescription || '用户取消了授权'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'WECHAT_LOGIN_ERROR',
                  error: '${error}',
                  errorDescription: '${errorDescription || '用户取消了授权'}'
                }, '*');
                setTimeout(() => window.close(), 2000);
              } else {
                setTimeout(() => window.location.href = '/', 3000);
              }
            </script>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(errorHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    if (!code || !state) {
      logger.error('Missing required parameters in WeChat callback', undefined, 'API', {
        code: !!code,
        state: !!state,
        fullUrl: request.url,
      });
      
      const missingParamsHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>参数错误</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
            .warning-icon {
              width: 64px;
              height: 64px;
              background: #f59e0b;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="warning-icon">⚠</div>
            <h1>参数错误</h1>
            <p>缺少必要的授权参数，请重新尝试登录</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'WECHAT_LOGIN_ERROR',
                  error: 'MISSING_PARAMETERS',
                  errorDescription: '缺少必要的授权参数'
                }, '*');
                setTimeout(() => window.close(), 2000);
              } else {
                setTimeout(() => window.location.href = '/', 3000);
              }
            </script>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(missingParamsHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Handle WeChat callback
    logger.api('Processing WeChat callback', { code: code.substring(0, 10) + '...', state });
    const result = await handleWeChatCallback(code, state);

    if (!result.success) {
      logger.error('WeChat callback failed', undefined, 'API', {
        error: result.error,
        code: code.substring(0, 10) + '...',
        state,
      });
      
      const failureHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>登录失败</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
            .error-icon {
              width: 64px;
              height: 64px;
              background: #ef4444;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">✗</div>
            <h1>登录失败</h1>
            <p>${result.error || '处理授权时发生错误'}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'WECHAT_LOGIN_ERROR',
                  error: 'CALLBACK_FAILED',
                  errorDescription: '${result.error || '处理授权时发生错误'}'
                }, '*');
                setTimeout(() => window.close(), 2000);
              } else {
                setTimeout(() => window.location.href = '/', 3000);
              }
            </script>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(failureHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    logger.auth('User authenticated successfully via WeChat', {
      userId: result.user?.id,
      openid: result.user?.wechat_openid,
    });

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
          console.log('WeChat login success, processing result...');
          
          // Store session data in localStorage for authentication
          try {
            localStorage.setItem('wechat_session_token', '${result.session.access_token}');
            localStorage.setItem('wechat_user', JSON.stringify(${JSON.stringify(result.user)}));
            localStorage.setItem('wechat_session_expires', '${result.session.expires_at}');
            console.log('✅ Session data stored in localStorage');
          } catch (error) {
            console.error('❌ Failed to store session data:', error);
          }
          
          // Close the popup window if opened in popup
          if (window.opener) {
            console.log('Window has opener, sending success message...');
            // Send success message to parent window
            window.opener.postMessage({
              type: 'WECHAT_LOGIN_SUCCESS',
              success: true,
              user: ${JSON.stringify(result.user)},
              session: ${JSON.stringify(result.session)}
            }, '*');
            
            // Close the popup
            setTimeout(() => {
              console.log('Closing popup window...');
              window.close();
            }, 2000);
          } else {
            console.log('No opener window, redirecting to home page...');
            // Redirect to home page if not in popup
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
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

  } catch (error) {
    logger.error('Unexpected error in WeChat callback', error, 'API');
    
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>服务器错误</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          .error-icon {
            width: 64px;
            height: 64px;
            background: #ef4444;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">✗</div>
          <h1>服务器错误</h1>
          <p>处理登录时发生内部错误，请稍后重试</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'WECHAT_LOGIN_ERROR',
                error: 'INTERNAL_ERROR',
                errorDescription: '服务器内部错误'
              }, '*');
              setTimeout(() => window.close(), 2000);
            } else {
              setTimeout(() => window.location.href = '/', 3000);
            }
          </script>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}
