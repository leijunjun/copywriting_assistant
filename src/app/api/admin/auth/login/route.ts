/**
 * 管理员登录API
 * 
 * 处理管理员登录请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  validateAdminCredentials, 
  createAdminSession, 
  setAdminSessionCookie,
  logAdminOperation 
} from '@/lib/auth/admin-auth';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    logger.api('Admin login request received');

    const body = await request.json();
    const { username, password } = body;

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: '用户名和密码不能为空',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    // 验证管理员凭据
    const isValid = await validateAdminCredentials(username, password);
    
    if (!isValid) {
      logger.auth('Admin login failed - invalid credentials', { username });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '用户名或密码错误',
            type: 'AUTHENTICATION',
            severity: 'HIGH',
          },
        },
        { status: 401 }
      );
    }

    // 创建session
    const sessionToken = createAdminSession(username);
    
    // 记录登录操作日志
    await logAdminOperation(
      'login',
      username,
      '管理员登录',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      request
    );

    logger.auth('Admin logged in successfully', { username });

    // 创建响应并设置cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        username,
        loginTime: new Date().toISOString(),
      },
    });

    // 设置session cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60, // 2小时，以秒为单位
      path: '/',
    });

    return response;

  } catch (error) {
    logger.error('Unexpected error in admin login', error, 'API');
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '内部服务器错误',
          type: 'INTERNAL',
          severity: 'CRITICAL',
        },
      },
      { status: 500 }
    );
  }
}
