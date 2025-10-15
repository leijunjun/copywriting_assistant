/**
 * 积分余额核对API
 * 
 * 检查所有用户的积分余额是否正确
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { BalanceCheckResponse, BalanceCheckResult } from '@/types/admin';

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

    // 获取所有用户的积分余额
    const { data: creditBalances, error: balanceError } = await supabase
      .from('user_credits')
      .select(`
        user_id,
        balance,
        users!inner(email)
      `);

    if (balanceError) {
      logger.error('Failed to fetch credit balances', balanceError, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: '获取积分余额失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    const results: BalanceCheckResult[] = [];
    let totalDifference = 0;
    let balancedUsers = 0;
    let imbalancedUsers = 0;

    // 对每个用户进行余额核对
    for (const creditBalance of creditBalances || []) {
      const userId = creditBalance.user_id;
      const actualBalance = creditBalance.balance;

      // 计算该用户的所有积分交易总和
      const { data: transactions, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', userId);

      if (transactionError) {
        logger.error('Failed to fetch transactions for user', transactionError, 'API', { userId });
        continue;
      }

      // 计算积分总和（注册奖励 + 所有交易）
      const initialBalance = 100; // 注册奖励积分
      const transactionSum = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const calculatedBalance = initialBalance + transactionSum;

      const difference = actualBalance - calculatedBalance;
      const isBalanced = Math.abs(difference) < 0.01; // 允许0.01的误差

      if (isBalanced) {
        balancedUsers++;
      } else {
        imbalancedUsers++;
        totalDifference += difference;
      }

      results.push({
        user_id: userId,
        user_email: creditBalance.users.email,
        calculated_balance: calculatedBalance,
        actual_balance: actualBalance,
        difference,
        is_balanced: isBalanced,
        transaction_count: transactions?.length || 0,
        last_transaction_date: transactions?.[0]?.created_at || null,
      });
    }

    // 按差异大小排序，不平衡的排在前面
    results.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

    const response: BalanceCheckResponse = {
      success: true,
      results,
      summary: {
        total_users: results.length,
        balanced_users: balancedUsers,
        imbalanced_users: imbalancedUsers,
        total_difference: totalDifference,
      },
    };

    logger.api('Balance check completed', {
      admin: session.username,
      totalUsers: results.length,
      balancedUsers,
      imbalancedUsers,
      totalDifference,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Unexpected error in balance check', error, 'API');
    
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
