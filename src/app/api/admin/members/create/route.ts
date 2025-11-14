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
import { identifyAuthType, formatPhoneForSupabase, normalizePhone } from '@/lib/utils/auth-identifier';

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
    // Support both 'email' (legacy) and 'identifier' (new) field names
    const identifier = body.email || (body as any).identifier;
    const { password, nickname, industry } = body;

    // 验证输入
    if (!identifier || !password || !nickname || !industry) {
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

    // 识别输入类型（邮箱或手机号）
    const authType = identifyAuthType(identifier);
    if (!authType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IDENTIFIER',
            message: '请输入有效的邮箱地址或手机号',
            type: 'VALIDATION',
            severity: 'MEDIUM',
          },
        },
        { status: 400 }
      );
    }

    // 验证行业
    const validIndustries = ['general', 'housekeeping', 'beauty', 'lifestyle-beauty', 'makeup'];
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

    // 检查邮箱或手机号是否已存在
    // 需要同时检查auth.users表和users表
    try {
      if (authType === 'email') {
        // 检查users表
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', identifier)
          .maybeSingle();

        if (existingUser) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'EMAIL_EXISTS',
                message: '该邮箱已被注册，请使用其他邮箱',
                type: 'VALIDATION',
                severity: 'MEDIUM',
              },
            },
            { status: 409 }
          );
        }

        // 也检查auth.users表（可能用户在auth中存在但users表中不存在）
        try {
          const { data: authUsers, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (listUsersError) {
            logger.error('Failed to list users for email check', listUsersError, 'API');
            // 如果检查失败，继续执行，让创建时Supabase返回错误
          } else if (authUsers?.users) {
            const emailExists = authUsers.users.some(
              user => user.email?.toLowerCase() === identifier.toLowerCase()
            );
            
            if (emailExists) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'EMAIL_EXISTS',
                    message: '该邮箱已被注册，请使用其他邮箱',
                    type: 'VALIDATION',
                    severity: 'MEDIUM',
                  },
                },
                { status: 409 }
              );
            }
          }
        } catch (listError) {
          logger.error('Exception while checking email in auth.users', listError, 'API');
          // 继续执行，让创建时Supabase返回错误
        }
      } else if (authType === 'phone') {
        // 对于手机号，通过Supabase Admin API检查是否已存在
        try {
          const formattedPhone = formatPhoneForSupabase(identifier); // +8618903713030
          const normalizedPhone = normalizePhone(identifier); // 18903713030
          const phoneWithoutPlus = formattedPhone.replace(/^\+/, ''); // 8618903713030
          
          const { data: authUsers, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (listUsersError) {
            logger.error('Failed to list users for phone check', listUsersError, 'API');
            // 如果检查失败，继续执行，让创建时Supabase返回错误
          } else if (authUsers?.users) {
            const phoneExists = authUsers.users.some(
              user => {
                if (!user.phone) return false;
                // 标准化用户手机号（去除所有空格和特殊字符）
                const userPhone = user.phone.replace(/[\s\-\(\)]/g, '');
                // 检查多种可能的格式匹配
                return userPhone === formattedPhone ||           // +8618903713030
                       userPhone === phoneWithoutPlus ||         // 8618903713030
                       userPhone === normalizedPhone ||          // 18903713030
                       userPhone === `+86${normalizedPhone}` ||  // +8618903713030
                       userPhone === `86${normalizedPhone}` ||   // 8618903713030
                       userPhone.replace(/^\+/, '') === phoneWithoutPlus || // 去除+后比较
                       userPhone.replace(/^\+86/, '') === normalizedPhone || // 去除+86后比较
                       userPhone.replace(/^86/, '') === normalizedPhone;     // 去除86后比较
              }
            );
            
            if (phoneExists) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'PHONE_EXISTS',
                    message: '该手机号已被注册，请使用其他手机号',
                    type: 'VALIDATION',
                    severity: 'MEDIUM',
                  },
                },
                { status: 409 }
              );
            }
          }
        } catch (phoneCheckError) {
          logger.error('Exception while checking phone in auth.users', phoneCheckError, 'API');
          // 继续执行，让创建时Supabase返回错误
        }
      }
    } catch (checkError) {
      // 如果检查失败，记录错误但继续尝试创建，让Supabase返回错误
      logger.error('Failed to check identifier existence', checkError, 'API', {
        authType,
        identifier,
      });
    }

    // 创建用户账号
    let createUserParams: {
      email?: string;
      phone?: string;
      password: string;
      email_confirm?: boolean;
      phone_confirm?: boolean;
    };

    if (authType === 'phone') {
      const formattedPhone = formatPhoneForSupabase(identifier);
      createUserParams = {
        phone: formattedPhone,
        password,
        phone_confirm: true,
      };
    } else {
      createUserParams = {
        email: identifier,
        password,
        email_confirm: true,
      };
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(createUserParams);

    if (authError || !authData.user) {
      logger.error('Failed to create user account', authError, 'API', {
        authType,
        identifier,
        errorCode: authError?.code,
        errorMessage: authError?.message,
        errorStatus: authError?.status,
      });
      
      // 处理邮箱或手机号已存在的特殊情况
      // 检查多种可能的错误格式
      const errorMessage = (authError?.message || '').toLowerCase();
      const errorCode = (authError?.code || '').toLowerCase();
      const errorStatus = authError?.status;
      
      // 判断是否为"已存在"错误
      const isExistsError = 
        errorStatus === 409 ||
        errorCode === 'email_exists' || 
        errorCode === 'phone_exists' ||
        errorCode === 'user_already_registered' ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('user already registered') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('conflict');
      
      if (isExistsError) {
        const identifierType = authType === 'phone' ? '手机号' : '邮箱';
        return NextResponse.json(
          {
            success: false,
            error: {
              code: authType === 'phone' ? 'PHONE_EXISTS' : 'EMAIL_EXISTS',
              message: `该${identifierType}已被注册，请使用其他${identifierType}`,
              type: 'VALIDATION',
              severity: 'MEDIUM',
            },
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_CREATION_FAILED',
            message: authError?.message || '创建用户账号失败',
            type: 'DATABASE',
            severity: 'HIGH',
          },
        },
        { status: 500 }
      );
    }

    // 创建用户资料
    // 邮箱用户存储email，手机号用户存储phone
    const normalizedPhone = authType === 'phone' ? normalizePhone(identifier) : null;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authType === 'email' ? identifier : null,
        phone: normalizedPhone, // 存储手机号（去除+86前缀和空格）
        nickname,
        industry,
        avatar_url: '', // Empty avatar
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      logger.error('Failed to create user profile', userError, 'API', {
        userId: authData.user.id,
        errorCode: userError.code,
        errorMessage: userError.message,
        errorDetails: userError.details,
        errorHint: userError.hint,
      });
      
      // 如果创建用户资料失败，尝试清理已创建的auth用户
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        logger.api('Cleaned up auth user after profile creation failure', { userId: authData.user.id });
      } catch (cleanupError) {
        logger.error('Failed to cleanup auth user', cleanupError, 'API', { userId: authData.user.id });
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROFILE_CREATION_FAILED',
            message: userError.message || '创建用户资料失败',
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
    
    const { data: existingCredit, error: checkCreditError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();
    
    // 如果查询出错（不是"未找到"的错误），记录日志但继续
    if (checkCreditError && checkCreditError.code !== 'PGRST116') {
      logger.error('Error checking existing credit account', checkCreditError, 'API', {
        userId: authData.user.id,
      });
    }

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
    const identifierForLog = authType === 'email' ? identifier : identifier;
    await logAdminOperation(
      'create_member',
      session.username,
      `创建新会员: ${nickname} (${identifierForLog})`,
      authData.user.id,
      authType === 'email' ? identifier : undefined,
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
        phone: userData.phone || null,
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
      identifier: authType === 'email' ? identifier : identifier,
      authType,
      nickname,
    });

    return NextResponse.json(response);

  } catch (error) {
    // 记录详细的错误信息
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Unexpected error in create member', error, 'API', {
      errorMessage,
      errorStack,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });
    
    // 返回更详细的错误信息（开发环境）
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: isDevelopment ? errorMessage : '内部服务器错误',
          type: 'INTERNAL',
          severity: 'CRITICAL',
          ...(isDevelopment && { details: errorStack }),
        },
      },
      { status: 500 }
    );
  }
}
