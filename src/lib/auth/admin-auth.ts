/**
 * 管理员认证中间件
 * 
 * 提供管理员登录、登出、session验证等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 管理员session接口
export interface AdminSession {
  username: string;
  loginTime: number;
  expiresAt: number;
}

// 管理员认证配置
const ADMIN_CONFIG = {
  SESSION_DURATION: 2 * 60 * 60 * 1000, // 2小时
  COOKIE_NAME: 'admin_session',
  JWT_SECRET: process.env.JWT_SECRET || 'admin-secret-key-change-in-production',
};

/**
 * 验证管理员session (Edge Runtime兼容版本)
 */
export async function verifyAdminSession(request: NextRequest): Promise<AdminSession | null> {
  try {
    // 从请求中获取cookie，而不是使用cookies()函数
    const sessionCookie = request.cookies.get(ADMIN_CONFIG.COOKIE_NAME);
    
    if (!sessionCookie) {
      return null;
    }

    // 简单的session验证，不使用JWT（Edge Runtime兼容）
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      
      // 检查session是否过期
      if (Date.now() > sessionData.expiresAt) {
        return null;
      }

      return sessionData as AdminSession;
    } catch (parseError) {
      // 如果解析失败，返回null
      return null;
    }
  } catch (error) {
    console.error('Admin session verification failed:', error);
    return null;
  }
}

/**
 * 创建管理员session (Edge Runtime兼容版本)
 */
export function createAdminSession(username: string): string {
  const now = Date.now();
  const session: AdminSession = {
    username,
    loginTime: now,
    expiresAt: now + ADMIN_CONFIG.SESSION_DURATION,
  };

  // 直接返回JSON字符串，不使用JWT（Edge Runtime兼容）
  return JSON.stringify(session);
}

/**
 * 验证管理员凭据
 */
export async function validateAdminCredentials(username: string, password: string): Promise<boolean> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured');
    return false;
  }

  // 验证用户名
  if (username !== adminUsername) {
    return false;
  }

  // 验证密码（支持明文和bcrypt加密）。在Edge环境中动态导入bcrypt，避免静态依赖。
  if (adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$')) {
    try {
      const { default: bcrypt } = await import('bcryptjs');
      return await bcrypt.compare(password, adminPassword);
    } catch (e) {
      // 在Edge运行时不可用，回退为失败，避免误判
      console.error('bcrypt not available in current runtime:', e);
      return false;
    }
  }

  // 明文密码，直接比较
  return password === adminPassword;
}

/**
 * 设置管理员session cookie (Edge Runtime兼容版本)
 */
export function setAdminSessionCookie(sessionToken: string): void {
  // 在Edge Runtime中，我们不能直接设置cookie
  // 这个函数将在API路由中通过NextResponse来设置cookie
  console.log('Session token created:', sessionToken);
}

/**
 * 清除管理员session cookie (Edge Runtime兼容版本)
 */
export function clearAdminSessionCookie(): void {
  // 在Edge Runtime中，我们不能直接删除cookie
  // 这个函数将在API路由中通过NextResponse来删除cookie
  console.log('Session cookie cleared');
}

/**
 * 记录管理员操作日志
 */
export async function logAdminOperation(
  operationType: 'create_member' | 'adjust_credits' | 'login' | 'logout',
  adminUsername: string,
  description: string,
  targetUserId?: string,
  targetUserEmail?: string,
  creditAmount?: number,
  beforeBalance?: number,
  afterBalance?: number,
  request?: NextRequest
): Promise<void> {
  try {
    // 延迟调用，防止在Edge中直接引用Node-only模块
    const logging = await import('./admin-logger-node');
    await logging.logAdminOperationNode(
      operationType,
      adminUsername,
      description,
      targetUserId,
      targetUserEmail,
      creditAmount,
      beforeBalance,
      afterBalance,
      request
    );
  } catch (error) {
    console.error('Failed to log admin operation (fallback to console only):', error);
  }
}

/**
 * 管理员认证中间件
 */
export async function requireAdminAuth(request: NextRequest): Promise<AdminSession | null> {
  const session = await verifyAdminSession(request);
  
  if (!session) {
    return null;
  }

  return session;
}

/**
 * 创建错误响应
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message,
        type: 'AUTHENTICATION',
        severity: 'HIGH',
      },
    },
    { status }
  );
}
