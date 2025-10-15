/**
 * Register API Endpoint
 * 
 * Handles user registration with email and password.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCreditBalance } from '@/lib/credits/balance';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';
import { CREDIT_CONFIG } from '@/config/credit-config';

export async function POST(request: NextRequest) {
  try {
    logger.api('Registration request received');

    const body = await request.json();
    const { email, password, nickname, industry } = body;

    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse({
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_EMAIL',
          message: 'Invalid email format',
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
    const validIndustries = ['general', 'housekeeping', 'beauty', 'lifestyle-beauty'];
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

    // Register with Supabase
    const { data, error } = await supabaseServer.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.error('Registration failed', undefined, 'API', { error: error.message });
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          createErrorResponse({
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
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

    logger.api('Supabase user created', { userId: data.user.id });

    // Create user profile in database
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        nickname: nickname || data.user.email?.split('@')[0] || 'User',
        avatar_url: '', // Empty avatar for email users
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
      email: userData.email,
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
        balance: creditResult.success ? creditResult.balance : 100,
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