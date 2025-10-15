/**
 * 调整会员积分API
 * 
 * 管理员可以增加或扣减会员积分
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminOperation } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { CreditAdjustmentRequest, CreditAdjustmentResponse } from '@/types/admin';

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

    const body: CreditAdjustmentRequest = await request.json();
    const { user_id, amount, description, operation_type } = body;

    // 验证输入
    if (!user_id || !amount || !description || !operation_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: '所有字段都是必填的',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: '积分金额必须大于0',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    if (!['add', 'subtract'].includes(operation_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_OPERATION',
            message: '操作类型必须是add或subtract',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 获取用户当前积分余额
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    if (creditError || !creditData) {
      logger.error('User stats not found', creditError, 'API', { userId: user_id });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_STATS_NOT_FOUND',
            message: '用户统计信息不存在',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 404 }
      );
    }

    const currentBalance = creditData.balance;
    const adjustmentAmount = operation_type === 'add' ? amount : -amount;
    const newBalance = currentBalance + adjustmentAmount;

    // 检查扣减后余额是否为负数
    if (newBalance < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: '积分余额不足，无法完成扣减操作',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    // 更新积分余额
    const { data: updatedCredit, error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: newBalance
      })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update credit balance', updateError, 'API', { userId: user_id });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: '更新积分余额失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    // 记录积分交易
    const transactionType = operation_type === 'add' ? 'bonus' : 'deduction';
    const { data: transactionData, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id,
        amount: adjustmentAmount,
        transaction_type: transactionType,
        description: `管理员${operation_type === 'add' ? '增加' : '扣减'}积分: ${description}`,
      })
      .select()
      .single();

    if (transactionError) {
      logger.error('Failed to create credit transaction', transactionError, 'API', { userId: user_id });
      // 不返回错误，因为积分已经更新成功
    }

    // 获取用户邮箱用于日志记录
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user_id)
      .single();

    // 记录管理员操作日志
    await logAdminOperation(
      'adjust_credits',
      session.username,
      `调整积分: ${operation_type === 'add' ? '增加' : '扣减'}${amount}积分 - ${description}`,
      user_id,
      userData?.email || null,
      adjustmentAmount,
      currentBalance,
      newBalance,
      request
    );

    const response: CreditAdjustmentResponse = {
      success: true,
      transaction_id: transactionData?.id,
      new_balance: newBalance,
    };

    logger.api('Credit adjustment completed successfully', {
      admin: session.username,
      userId: user_id,
      operation: operation_type,
      amount,
      oldBalance: currentBalance,
      newBalance,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Unexpected error in credit adjustment', error, 'API');
    
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
