/**
 * Login API Endpoint
 * 
 * Handles user login with email and password.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCreditBalance } from '@/lib/credits/balance';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function POST(request: NextRequest) {
  try {
    logger.api('Login request received');

    const body = await request.json();
    const { email, password } = body;

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

    // Create server-side Supabase client
    const supabaseServer = createServerSupabaseClient();

    // Authenticate with Supabase
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Login failed', undefined, 'API', { error: error.message });
      
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          createErrorResponse({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            type: 'AUTHENTICATION',
            severity: 'HIGH',
          }),
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse({
          code: 'LOGIN_FAILED',
          message: 'Login failed',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        createErrorResponse({
          code: 'LOGIN_FAILED',
          message: 'Login failed',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      logger.error('User profile not found', undefined, 'API', { 
        userId: data.user.id,
        error: userError 
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 404 }
      );
    }

    // Get user's credit balance
    const creditResult = await getCreditBalance(userData.id);
    
    if (!creditResult.success) {
      logger.error('Failed to get credit balance', undefined, 'API', {
        userId: userData.id,
        error: creditResult.error,
      });
    }

    logger.auth('User logged in successfully', {
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
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
      credits: {
        balance: creditResult.success ? creditResult.balance : 0,
        updated_at: creditResult.success ? creditResult.updated_at : new Date().toISOString(),
      },
    });

  } catch (error) {
    logger.error('Unexpected error in login', error, 'API');
    
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