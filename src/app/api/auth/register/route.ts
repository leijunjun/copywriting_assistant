/**
 * Register API Endpoint
 * 
 * Handles user registration with email/phone and password.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCreditBalance } from '@/lib/credits/balance';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';
import { CREDIT_CONFIG } from '@/config/credit-config';
import { identifyAuthType, formatPhoneForSupabase, normalizePhone } from '@/lib/utils/auth-identifier';

export async function POST(request: NextRequest) {
  try {
    logger.api('Registration request received');

    const body = await request.json();
    // Support both 'email' (legacy) and 'identifier' (new) field names
    const identifier = body.email || body.identifier;
    const { password, nickname, industry } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        createErrorResponse({
          code: 'MISSING_CREDENTIALS',
          message: 'Email/phone and password are required',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Identify input type (email or phone)
    const authType = identifyAuthType(identifier);
    if (!authType) {
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_IDENTIFIER',
          message: 'Please enter a valid email address or phone number',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        createErrorResponse({
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters long',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Validate industry value
    const validIndustries = ['general', 'housekeeping', 'beauty', 'lifestyle-beauty', 'makeup', 'yituihuo'];
    const userIndustry = industry || 'general';
    if (!validIndustries.includes(userIndustry)) {
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_INDUSTRY',
          message: 'Invalid industry selection',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabaseServer = createServerSupabaseClient();

    // Register with Supabase based on identifier type
    let signUpParams: { email?: string; phone?: string; password: string };
    if (authType === 'phone') {
      const formattedPhone = formatPhoneForSupabase(identifier);
      signUpParams = {
        phone: formattedPhone,
        password,
      };
    } else {
      signUpParams = {
        email: identifier,
        password,
      };
    }

    const { data, error } = await supabaseServer.auth.signUp(signUpParams);

    if (error) {
      logger.error('Registration failed', undefined, 'API', { error: error.message, authType });
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        const identifierType = authType === 'phone' ? 'Phone number' : 'Email';
        return NextResponse.json(
          createErrorResponse({
            code: authType === 'phone' ? 'PHONE_EXISTS' : 'EMAIL_EXISTS',
            message: `${identifierType} already registered`,
            type: 'AUTHENTICATION',
            severity: 'MEDIUM',
          }),
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse({
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        createErrorResponse({
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 400 }
      );
    }

    logger.api('Supabase user created', { userId: data.user.id, authType });

    // Determine default nickname based on auth type
    let defaultNickname = 'User';
    if (authType === 'email' && data.user.email) {
      defaultNickname = data.user.email.split('@')[0];
    } else if (authType === 'phone') {
      const normalizedPhone = normalizePhone(identifier);
      defaultNickname = normalizedPhone.slice(-4); // Use last 4 digits as default
    }

    // Create user profile in database
    // 邮箱用户存储email，手机号用户存储phone
    const normalizedPhone = authType === 'phone' ? normalizePhone(identifier) : null;
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .insert({
        id: data.user.id,
        email: authType === 'email' ? identifier : null,
        phone: normalizedPhone, // 存储手机号（去除+86前缀和空格）
        nickname: nickname || defaultNickname,
        avatar_url: '', // Empty avatar
        industry: userIndustry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      logger.error('Failed to create user profile', undefined, 'API', { 
        userId: data.user.id,
        error: userError,
        errorCode: userError.code,
        errorMessage: userError.message,
        errorDetails: userError.details,
        errorHint: userError.hint
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'PROFILE_CREATION_FAILED',
          message: 'Failed to create user profile',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('User profile created', { userId: userData.id });

    // Initialize user credits
    const { data: creditData, error: creditError } = await supabaseServer
      .from('user_credits')
      .insert({
        user_id: data.user.id,
        balance: CREDIT_CONFIG.REGISTRATION_BONUS, // Give new users free credits
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (creditError) {
      logger.error('Failed to initialize user credits', undefined, 'API', {
        userId: data.user.id,
        error: creditError,
      });
      
      // 如果积分初始化失败，返回错误
      return NextResponse.json(
        createErrorResponse({
          code: 'CREDIT_INITIALIZATION_FAILED',
          message: 'Failed to initialize user credits',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    } else {
      logger.api('User credits initialized', { 
        userId: data.user.id,
        balance: creditData.balance 
      });
    }

    // Get user's credit balance
    const creditResult = await getCreditBalance(userData.id);
    
    if (!creditResult.success) {
      logger.error('Failed to get credit balance', undefined, 'API', {
        userId: userData.id,
        error: creditResult.error,
      });
    }

    logger.auth('User registered successfully', {
      userId: userData.id,
      authType,
      identifier: authType === 'email' ? userData.email : identifier,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        avatar_url: userData.avatar_url,
        industry: userData.industry,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
      credits: {
        balance: creditResult.success ? creditResult.balance : CREDIT_CONFIG.REGISTRATION_BONUS,
        updated_at: creditResult.success ? creditResult.updated_at : new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Unexpected error in registration', error, 'API');
    
    return NextResponse.json(
      createErrorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        type: 'INTERNAL',
        severity: 'CRITICAL',
      }),
      { status: 500 }
    );
  }
}