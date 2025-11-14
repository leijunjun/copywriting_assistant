/**
 * Login API Endpoint
 * 
 * Handles user login with email/phone and password.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCreditBalance } from '@/lib/credits/balance';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';
import { identifyAuthType, formatPhoneForSupabase } from '@/lib/utils/auth-identifier';

export async function POST(request: NextRequest) {
  try {
    logger.api('Login request received');

    const body = await request.json();
    // Support both 'email' (legacy) and 'identifier' (new) field names
    const identifier = body.email || body.identifier;
    const { password } = body;

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

    // Create server-side Supabase client
    const supabaseServer = createServerSupabaseClient();

    // Authenticate with Supabase based on identifier type
    let signInParams: { email?: string; phone?: string; password: string };
    let formattedPhone: string | undefined;
    
    if (authType === 'phone') {
      formattedPhone = formatPhoneForSupabase(identifier);
      signInParams = {
        phone: formattedPhone,
        password,
      };
      
      logger.api('Attempting phone login', { 
        originalInput: identifier,
        formattedPhone: formattedPhone 
      });
    } else {
      signInParams = {
        email: identifier,
        password,
      };
      
      logger.api('Attempting email login', { email: identifier });
    }

    let { data, error } = await supabaseServer.auth.signInWithPassword(signInParams);
    
    // If login fails with phone, try alternative formats
    if (error && authType === 'phone' && formattedPhone) {
      const normalizedPhone = identifier.replace(/\s+/g, ''); // Remove spaces
      const phoneFormats = [
        formattedPhone, // +8618903713036 (already tried)
        formattedPhone.replace(/^\+/, ''), // 8618903713036
        normalizedPhone, // 18903713036
        `86${normalizedPhone}`, // 8618903713036
      ];
      
      // Remove duplicates
      const uniqueFormats = Array.from(new Set(phoneFormats));
      
      logger.api('Phone login failed, trying alternative formats', { 
        originalFormat: formattedPhone,
        errorMessage: error.message,
        formatsToTry: uniqueFormats
      });
      
      // Try each format
      for (const phoneFormat of uniqueFormats) {
        if (phoneFormat === formattedPhone) continue; // Skip already tried format
        
        const retryParams = {
          phone: phoneFormat,
          password,
        };
        
        logger.api('Trying phone format', { format: phoneFormat });
        
        const retryResult = await supabaseServer.auth.signInWithPassword(retryParams);
        if (!retryResult.error) {
          // Success with alternative format
          logger.api('Login succeeded with alternative format', { format: phoneFormat });
          data = retryResult.data;
          error = null;
          break;
        } else {
          logger.api('Login failed with format', { 
            format: phoneFormat, 
            error: retryResult.error?.message 
          });
        }
      }
    }

    if (error) {
      logger.error('Login failed after all attempts', undefined, 'API', { 
        error: error.message,
        authType,
        identifier: authType === 'phone' ? 'phone number' : identifier,
        triedFormats: authType === 'phone' ? 'multiple formats' : 'single format'
      });
      
      // Return detailed error message for debugging
      const errorMessage = error.message || 'Login failed';
      
      // Check for specific error types
      if (errorMessage.includes('Phone logins are disabled') || 
          errorMessage.includes('phone logins are disabled')) {
        return NextResponse.json(
          createErrorResponse({
            code: 'PHONE_LOGIN_DISABLED',
            message: '手机号登录功能未启用，请联系管理员在 Supabase Dashboard 中启用手机号认证',
            type: 'AUTHENTICATION',
            severity: 'HIGH',
          }),
          { status: 401 }
        );
      }
      
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('Invalid login') ||
          errorMessage.includes('incorrect')) {
        return NextResponse.json(
          createErrorResponse({
            code: 'INVALID_CREDENTIALS',
            message: '账号或密码错误，请检查后重试',
            type: 'AUTHENTICATION',
            severity: 'HIGH',
          }),
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse({
          code: 'LOGIN_FAILED',
          message: `登录失败: ${errorMessage}`,
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

    // Update last login time
    const currentTime = new Date().toISOString();
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ last_login_at: currentTime })
      .eq('id', data.user.id);

    if (updateError) {
      logger.error('Failed to update last login time', undefined, 'API', {
        userId: data.user.id,
        error: updateError,
      });
      // Don't fail the login if this update fails, just log the error
    } else {
      // Update the userData with the new login time
      userData.last_login_at = currentTime;
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
        industry: userData.industry,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: userData.last_login_at,
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