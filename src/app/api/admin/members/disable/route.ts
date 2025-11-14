/**
 * 禁用/启用用户账号API
 * 
 * 支持禁用和启用用户账号
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient, createServerSupabaseClientForActions } from '@/lib/supabase/server';
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
    const { user_id, disabled } = body;

    if (!user_id || typeof disabled !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: '参数错误：需要 user_id 和 disabled 字段',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClientForActions();

    // 更新用户禁用状态
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_disabled: disabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user disabled status', error, 'API', {
        userId: user_id,
        disabled,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: '更新用户状态失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    logger.api('User disabled status updated', {
      admin: session.username,
      userId: user_id,
      disabled,
    });

    return NextResponse.json({
      success: true,
      message: disabled ? '账号已禁用' : '账号已启用',
      user: data,
    });

  } catch (error) {
    logger.error('Unexpected error in disable user', error, 'API');
    
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

