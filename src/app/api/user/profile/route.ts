/**
 * User Profile and Credit Balance Endpoint
 * 
 * This endpoint returns the current user's profile and credit balance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserWithSession } from '@/lib/auth/session';
import { getCreditBalance } from '@/lib/credits/balance';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';
import { UserModel } from '@/lib/database/models';
import { supabaseServer } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    logger.api('User profile request received');

    // Get current user with session
    const userWithSession = await getCurrentUserWithSession();
    
    if (!userWithSession) {
      logger.error('User not authenticated', undefined, 'API');
      
      return NextResponse.json(
        createErrorResponse({
          code: 'UNAUTHENTICATED',
          message: 'User not authenticated',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 401 }
      );
    }

    const { user, session } = userWithSession;

    // Get user's credit balance
    const creditResult = await getCreditBalance(user.id);

    if (!creditResult.success) {
      logger.error('Failed to get credit balance', undefined, 'API', {
        userId: user.id,
        error: creditResult.error,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'CREDIT_BALANCE_FAILED',
          message: creditResult.error || 'Failed to get credit balance',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('User profile retrieved successfully', {
      userId: user.id,
      balance: creditResult.balance,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      credits: {
        balance: creditResult.balance,
        updated_at: creditResult.updated_at,
      },
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at,
      },
    });

  } catch (error) {
    logger.error('Unexpected error in user profile request', error, 'API');
    
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

export async function PUT(request: NextRequest) {
  try {
    logger.api('User profile update request received');

    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      logger.error('User not authenticated', undefined, 'API');
      
      return NextResponse.json(
        createErrorResponse({
          code: 'UNAUTHENTICATED',
          message: 'User not authenticated',
          type: 'AUTHENTICATION',
          severity: 'HIGH',
        }),
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request body
    if (!body.nickname && !body.avatar_url) {
      logger.error('Invalid profile update request', undefined, 'API', {
        body,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_REQUEST',
          message: 'At least one field (nickname or avatar_url) is required',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Update user profile
    const { UserModel } = await import('@/lib/database/models');
    
    const updatedUser = await UserModel.update(user.id, {
      nickname: body.nickname,
      avatar_url: body.avatar_url,
      updated_at: new Date().toISOString(),
    });

    logger.api('User profile updated successfully', {
      userId: user.id,
      updates: body,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        wechat_openid: updatedUser.wechat_openid,
        wechat_unionid: updatedUser.wechat_unionid,
        nickname: updatedUser.nickname,
        avatar_url: updatedUser.avatar_url,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    });

  } catch (error) {
    logger.error('Unexpected error in user profile update', error, 'API');
    
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

