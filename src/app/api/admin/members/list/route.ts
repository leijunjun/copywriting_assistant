/**
 * 获取会员列表API
 * 
 * 支持分页、搜索、筛选功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { MemberListParams, MemberListResponse } from '@/types/admin';

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
    const params: MemberListParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // 最大100条
      search: searchParams.get('search') || undefined,
      industry: searchParams.get('industry') as any || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
    };

    const supabase = createServerSupabaseClient();

    // 构建查询 - 从 user_stats 表获取数据
    let query = supabase
      .from('user_stats')
      .select(`
        id,
        email,
        nickname,
        credit_balance,
        created_at,
        last_login
      `);

    // 搜索条件
    if (params.search) {
      query = query.or(`email.ilike.%${params.search}%,nickname.ilike.%${params.search}%`);
    }

    // 行业筛选 - 暂时跳过，将在后续处理中筛选
    // if (params.industry) {
    //   query = query.eq('users.industry', params.industry);
    // }

    // 排序
    const sortColumn = params.sort_by === 'credits' ? 'credit_balance' : params.sort_by;
    query = query.order(sortColumn, { ascending: params.sort_order === 'asc' });

    // 获取总数
    const { count } = await query.select('*', { count: 'exact', head: true });

    // 分页查询 - 重新构建查询以确保包含所有字段
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    
    // 重新构建查询 - 从 user_stats 表获取数据
    let dataQuery = supabase
      .from('user_stats')
      .select(`
        id,
        email,
        nickname,
        credit_balance,
        created_at,
        last_login
      `);

    // 重新应用搜索条件
    if (params.search) {
      dataQuery = dataQuery.or(`email.ilike.%${params.search}%,nickname.ilike.%${params.search}%`);
    }

    // 重新应用行业筛选 - 暂时跳过，将在后续处理中筛选
    // if (params.industry) {
    //   dataQuery = dataQuery.eq('users.industry', params.industry);
    // }

    // 重新应用排序
    dataQuery = dataQuery.order(sortColumn, { ascending: params.sort_order === 'asc' });

    const { data: members, error } = await dataQuery
      .range(from, to);

    if (error) {
      logger.error('Failed to fetch members list', error, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: '获取会员列表失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    // 获取所有用户的 industry、注册时间和最后登录时间信息
    const userIds = members?.map(member => member.id) || [];
    let userIndustries: { [key: string]: string } = {};
    let userCreatedAt: { [key: string]: string } = {};
    let userLastLoginAt: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, industry, created_at, last_login_at')
        .in('id', userIds);
      
      if (!usersError && usersData) {
        userIndustries = usersData.reduce((acc, user) => {
          acc[user.id] = user.industry || 'general';
          return acc;
        }, {} as { [key: string]: string });
        
        userCreatedAt = usersData.reduce((acc, user) => {
          acc[user.id] = user.created_at;
          return acc;
        }, {} as { [key: string]: string });
        
        userLastLoginAt = usersData.reduce((acc, user) => {
          acc[user.id] = user.last_login_at;
          return acc;
        }, {} as { [key: string]: string | null });
      }
    }

    // 格式化数据 - 从 user_stats 表获取的数据，手动关联 users 表获取 industry、注册时间和最后登录时间
    const formattedMembers = members?.map(member => ({
      id: member.id,
      email: member.email,
      nickname: member.nickname,
      industry: userIndustries[member.id] || 'general', // 从手动查询的 users 表获取 industry
      created_at: userCreatedAt[member.id] || member.created_at, // 使用 users 表的 created_at 作为注册时间
      last_login_at: userLastLoginAt[member.id] || null, // 统一使用 users 表的 last_login_at 字段
      credits: {
        balance: member.credit_balance || 0,
        updated_at: member.created_at, // user_stats 表可能没有单独的积分更新时间
      },
    })) || [];

    // 如果有行业筛选，在这里进行筛选
    let filteredMembers = formattedMembers;
    if (params.industry) {
      filteredMembers = formattedMembers.filter(member => member.industry === params.industry);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / params.limit);

    const response: MemberListResponse = {
      success: true,
      members: filteredMembers,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        total_pages: totalPages,
        has_next: params.page < totalPages,
        has_prev: params.page > 1,
      },
    };

    logger.api('Members list fetched successfully', {
      admin: session.username,
      total,
      page: params.page,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Unexpected error in members list', error, 'API');
    
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
