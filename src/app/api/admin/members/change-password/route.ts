/**
 * 修改用户密码API
 * 
 * 管理员可以修改任意用户的密码
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClientForActions } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员session
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: '需要管理员权限',
            type: 'AUTHENTICATION',
            severity: 'HIGH',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { user_id, new_password } = body;

    if (!user_id || !new_password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: '参数错误：需要 user_id 和 new_password 字段',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (new_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: '密码长度至少为6位',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createServerSupabaseClientForActions();

    // 首先获取用户信息，确定是邮箱还是手机号登录
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, phone')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      logger.error('User not found', userError, 'API', {
        userId: user_id,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 404 }
      );
    }

    // 使用 Supabase Admin API 更新密码
    // 注意：需要使用 auth.users 表，而不是 public.users 表
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    );

    if (authError) {
      logger.error('Failed to update user password', authError, 'API', {
        userId: user_id,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_UPDATE_FAILED',
            message: '修改密码失败',
            type: 'AUTHENTICATION',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    logger.api('User password updated', {
      admin: session.username,
      userId: user_id,
    });

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    });

  } catch (error) {
    logger.error('Unexpected error in change password', error, 'API');
    
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

