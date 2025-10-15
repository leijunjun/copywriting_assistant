/**
 * 获取会员详情API
 * 
 * 获取指定会员的详细信息和积分交易记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { MemberDetail } from '@/types/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '用户ID不能为空',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 获取用户基本信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        nickname,
        avatar_url,
        industry,
        created_at,
        updated_at,
        last_login_at,
        user_credits!inner(balance, updated_at)
      `)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      logger.error('User not found', userError, 'API', { userId });
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

    // 获取用户积分交易记录（最近20条）
    const { data: transactions, error: transactionError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transactionError) {
      logger.error('Failed to fetch credit transactions', transactionError, 'API', { userId });
    }

    const memberDetail: MemberDetail = {
      id: userData.id,
      email: userData.email,
      nickname: userData.nickname,
      avatar_url: userData.avatar_url,
      industry: userData.industry,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login_at: userData.last_login_at,
      credits: {
        balance: userData.user_credits?.[0]?.balance || 0,
        updated_at: userData.user_credits?.[0]?.updated_at || userData.created_at,
      },
      credit_transactions: transactions?.map(t => ({
        id: t.id,
        amount: t.amount,
        transaction_type: t.transaction_type,
        description: t.description,
        created_at: t.created_at,
      })) || [],
    };

    logger.api('Member detail fetched successfully', {
      admin: session.username,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: memberDetail,
    });

  } catch (error) {
    logger.error('Unexpected error in get member detail', error, 'API');
    
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
