/**
 * 获取操作日志API
 * 
 * 查询管理员操作日志，支持分页和筛选
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { OperationLogParams, OperationLogResponse } from '@/types/admin';

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
    const params: OperationLogParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      admin_username: searchParams.get('admin_username') || undefined,
      operation_type: searchParams.get('operation_type') || undefined,
      target_user_id: searchParams.get('target_user_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
    };

    const supabase = createServerSupabaseClient();

    // 构建查询
    let query = supabase
      .from('admin_operation_logs')
      .select('*');

    // 筛选条件
    if (params.admin_username) {
      query = query.eq('admin_username', params.admin_username);
    }

    if (params.operation_type) {
      query = query.eq('operation_type', params.operation_type);
    }

    if (params.target_user_id) {
      query = query.eq('target_user_id', params.target_user_id);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    // 排序
    query = query.order(params.sort_by, { ascending: params.sort_order === 'asc' });

    // 获取总数
    const { count } = await query.select('*', { count: 'exact', head: true });

    // 分页查询
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    
    const { data: logs, error } = await query
      .range(from, to);

    if (error) {
      logger.error('Failed to fetch operation logs', error, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: '获取操作日志失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / params.limit);

    const response: OperationLogResponse = {
      success: true,
      logs: logs || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        total_pages: totalPages,
        has_next: params.page < totalPages,
        has_prev: params.page > 1,
      },
    };

    logger.api('Operation logs fetched successfully', {
      admin: session.username,
      total,
      page: params.page,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Unexpected error in operation logs', error, 'API');
    
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
