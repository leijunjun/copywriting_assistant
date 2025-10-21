/**
 * 创建新会员API
 * 
 * 管理员创建新会员账号
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, logAdminOperation } from '@/lib/auth/admin-auth';
import { createServerSupabaseClient, createServerSupabaseClientForActions } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { CREDIT_CONFIG } from '@/config/credit-config';
import { CreateMemberRequest, CreateMemberResponse } from '@/types/admin';

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

    const body: CreateMemberRequest = await request.json();
    const { email, password, nickname, industry } = body;

    // 验证输入
    if (!email || !password || !nickname || !industry) {
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

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: '邮箱格式不正确',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    // 验证行业
    const validIndustries = ['general', 'housekeeping', 'beauty', 'lifestyle-beauty'];
    if (!validIndustries.includes(industry)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INDUSTRY',
            message: '行业选择无效',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const supabaseAdmin = createServerSupabaseClientForActions();

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: '服务不可用',
            type: 'INTERNAL',
            severity: 'CRITICAL',
          },
        },
        { status: 500 }
      );
    }

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: '该邮箱已被注册',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    // 创建用户账号
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      logger.error('Failed to create user account', authError, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_CREATION_FAILED',
            message: '创建用户账号失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    // 创建用户资料
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        nickname,
        industry,
      })
      .select()
      .single();

    if (userError) {
      logger.error('Failed to create user profile', userError, 'API');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROFILE_CREATION_FAILED',
            message: '创建用户资料失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    // 创建积分账户（如果不存在）
    let creditData;
    const initialBalance = CREDIT_CONFIG.REGISTRATION_BONUS; // 使用配置常量
    
    const { data: existingCredit } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (existingCredit) {
      // 积分账户已存在，更新为新的初始积分
      const { data: updatedCreditData, error: updateError } = await supabase
        .from('user_credits')
        .update({
          balance: initialBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authData.user.id)
        .select()
        .single();

      if (updateError) {
        logger.error('Failed to update credit account', updateError, 'API');
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CREDIT_UPDATE_FAILED',
              message: '更新积分账户失败',
              type: 'DATABASE',
              severity: 'HIGH',
            },
          },
          { status: 500 }
        );
      }
      creditData = updatedCreditData;
      logger.api('Credit account updated', { userId: authData.user.id, newBalance: initialBalance });
    } else {
      // 创建新的积分账户
      const { data: newCreditData, error: creditError } = await supabase
        .from('user_credits')
        .insert({
          user_id: authData.user.id,
          balance: initialBalance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (creditError) {
        logger.error('Failed to create credit account', creditError, 'API');
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CREDIT_CREATION_FAILED',
              message: '创建积分账户失败',
              type: 'DATABASE',
              severity: 'HIGH',
            },
          },
          { status: 500 }
        );
      }
      creditData = newCreditData;
    }

    logger.api('User credits created', { 
      userId: authData.user.id,
      balance: creditData.balance 
    });

    // 记录操作日志
    await logAdminOperation(
      'create_member',
      session.username,
      `创建新会员: ${nickname} (${email})`,
      authData.user.id,
      email,
      initialBalance,
      0,
      initialBalance,
      request
    );

    const response: CreateMemberResponse = {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        industry: userData.industry,
        created_at: userData.created_at,
        last_login_at: null,
        credits: {
          balance: creditData.balance,
          updated_at: creditData.updated_at,
        },
      },
    };

    logger.api('Member created successfully', {
      admin: session.username,
      userId: authData.user.id,
      email,
      nickname,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Unexpected error in create member', error, 'API');
    
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
