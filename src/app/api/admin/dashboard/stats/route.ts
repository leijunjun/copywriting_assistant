/**
 * 仪表盘统计数据API
 * 
 * 获取系统统计概览数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { DashboardStats } from '@/types/admin';

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

    const supabase = createServerSupabaseClient();

    // 获取总会员数
    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 获取活跃会员数（最近30天有登录的）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', thirtyDaysAgo.toISOString());

    // 获取总积分
    const { data: creditData } = await supabase
      .from('user_credits')
      .select('balance');
    
    const totalCredits = creditData?.reduce((sum, credit) => sum + credit.balance, 0) || 0;

    // 获取本月操作数
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count: recentOperations } = await supabase
      .from('admin_operation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // 获取高风险操作数（大额积分操作）
    const { count: highRiskOperations } = await supabase
      .from('admin_operation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .gte('credit_amount', 100);

    // 获取本月新增会员数
    const { count: thisMonthMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // 获取上月新增会员数
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    
    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);
    
    const { count: lastMonthMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());

    // 计算增长率
    const growthRate = lastMonthMembers && lastMonthMembers > 0 
      ? Math.round(((thisMonthMembers || 0) - (lastMonthMembers || 0)) / lastMonthMembers * 100)
      : 0;

    // 获取本月积分变动
    const { data: creditTransactions } = await supabase
      .from('credit_transactions')
      .select('amount, transaction_type')
      .gte('created_at', startOfMonth.toISOString());

    const totalAdded = creditTransactions
      ?.filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const totalDeducted = Math.abs(creditTransactions
      ?.filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0);

    const stats: DashboardStats = {
      total_members: totalMembers || 0,
      active_members: activeMembers || 0,
      total_credits: totalCredits,
      recent_operations: recentOperations || 0,
      high_risk_operations: highRiskOperations || 0,
      member_growth: {
        this_month: thisMonthMembers || 0,
        last_month: lastMonthMembers || 0,
        growth_rate: growthRate,
      },
      credit_flow: {
        total_added: totalAdded,
        total_deducted: totalDeducted,
        net_change: totalAdded - totalDeducted,
      },
    };

    logger.api('Dashboard stats fetched successfully', {
      admin: session.username,
      totalMembers: stats.total_members,
      totalCredits: stats.total_credits,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Unexpected error in dashboard stats', error, 'API');
    
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
