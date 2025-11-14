/**
 * 用户搜索API
 * 
 * 用于积分调整页面的用户搜索功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        users: [],
        message: '请输入至少2个字符进行搜索'
      });
    }

    const supabase = createServerSupabaseClient();

    // 搜索用户，按邮箱、昵称和手机号搜索
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        phone,
        nickname,
        industry,
        created_at,
        last_login_at
      `)
      .or(`email.ilike.%${query}%,nickname.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to search users', error, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SEARCH_FAILED',
            message: '搜索用户失败',
            type: 'DATABASE',
            severity: 'MEDIUM',
          },
        },
        { status: 500 }
      );
    }

    // 格式化搜索结果
    const formattedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      industry: user.industry,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    })) || [];

    logger.api('User search completed', {
      query,
      resultCount: formattedUsers.length,
      adminUsername: session.username
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      query,
      total: formattedUsers.length
    });

  } catch (error) {
    logger.error('User search API error', error, 'API');
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
