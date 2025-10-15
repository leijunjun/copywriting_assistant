/**
 * 大额操作预警API
 * 
 * 获取大额积分操作记录，用于风险监控
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { AlertListResponse } from '@/types/admin';

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

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const riskLevel = searchParams.get('risk_level') || undefined;

    const supabase = createServerSupabaseClient();

    // 使用预定义的大额操作预警视图
    let query = supabase
      .from('large_credit_operations')
      .select('*');

    // 风险等级筛选
    if (riskLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(riskLevel)) {
      query = query.eq('risk_level', riskLevel);
    }

    // 按金额和时间排序
    query = query.order('credit_amount', { ascending: false });

    // 获取总数
    const { count } = await query.select('*', { count: 'exact', head: true });

    // 分页查询
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data: alerts, error } = await query
      .range(from, to);

    if (error) {
      logger.error('Failed to fetch alert list', error, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: '获取预警列表失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: AlertListResponse = {
      success: true,
      alerts: alerts || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };

    logger.api('Alert list fetched successfully', {
      admin: session.username,
      total,
      page,
      riskLevel,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Unexpected error in alert list', error, 'API');
    
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
