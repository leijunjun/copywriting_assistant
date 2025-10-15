/**
 * 管理员登出API
 * 
 * 处理管理员登出请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminSession, 
  clearAdminSessionCookie,
  logAdminOperation 
} from '@/lib/auth/admin-auth';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    logger.api('Admin logout request received');

    // 验证当前session
    const session = await verifyAdminSession(request);
    
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: '未登录',
            type: 'AUTHENTICATION',
            severity: 'MEDIUM',
          },
        },
        { status: 401 }
      );
    }

    // 记录登出操作日志
    await logAdminOperation(
      'logout',
      session.username,
      '管理员登出',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      request
    );

    logger.auth('Admin logged out successfully', { username: session.username });

    // 创建响应并清除cookie
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 立即过期
      path: '/',
    });

    return response;

  } catch (error) {
    logger.error('Unexpected error in admin logout', error, 'API');
    
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
