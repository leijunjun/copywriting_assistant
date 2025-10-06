/**
 * Credit Deduction Endpoint
 * 
 * This endpoint handles credit deduction for user actions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { deductCredits } from '@/lib/credits/transactions';
import { validateCreditDeductionRequest } from '@/lib/validation/credits';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function POST(request: NextRequest) {
  try {
    logger.api('Credit deduction request received');

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
    
    // Validate request
    try {
      validateCreditDeductionRequest({
        user_id: user.id,
        amount: body.amount,
        description: body.description,
        service_type: body.service_type,
      });
    } catch (validationError) {
      logger.error('Invalid credit deduction request', undefined, 'API', {
        error: validationError,
        body,
        userId: user.id,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_REQUEST',
          message: 'Invalid request parameters',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    const { amount, description, service_type } = body;

    // Deduct credits
    const result = await deductCredits({
      user_id: user.id,
      amount,
      description,
      service_type,
    });

    if (!result.success) {
      logger.error('Credit deduction failed', undefined, 'API', {
        error: result.error,
        userId: user.id,
        amount,
        description,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'DEDUCTION_FAILED',
          message: result.error || 'Failed to deduct credits',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 400 }
      );
    }

    logger.credits('Credits deducted successfully', {
      userId: user.id,
      amount,
      description,
      transactionId: result.transaction_id,
      newBalance: result.new_balance,
    });

    return NextResponse.json({
      success: true,
      transaction_id: result.transaction_id,
      new_balance: result.new_balance,
      message: 'Credits deducted successfully',
    });

  } catch (error) {
    logger.error('Unexpected error in credit deduction', error, 'API');
    
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

export async function GET(request: NextRequest) {
  try {
    logger.api('Credit deduction validation request received');

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount');

    if (!amount) {
      logger.error('Missing amount parameter', undefined, 'API', {
        userId: user.id,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'MISSING_AMOUNT',
          message: 'Amount parameter is required',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    const amountNumber = parseInt(amount, 10);
    
    if (isNaN(amountNumber) || amountNumber <= 0) {
      logger.error('Invalid amount parameter', undefined, 'API', {
        userId: user.id,
        amount,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'INVALID_AMOUNT',
          message: 'Amount must be a positive number',
          type: 'VALIDATION',
          severity: 'MEDIUM',
        }),
        { status: 400 }
      );
    }

    // Check if user has sufficient credits
    const { hasSufficientCredits } = await import('@/lib/credits/balance');
    const validationResult = await hasSufficientCredits(user.id, amountNumber);

    if (!validationResult.success) {
      logger.error('Failed to validate credits', undefined, 'API', {
        userId: user.id,
        amount: amountNumber,
        error: validationResult.error,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'VALIDATION_FAILED',
          message: validationResult.error || 'Failed to validate credits',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('Credit validation completed', {
      userId: user.id,
      amount: amountNumber,
      hasSufficientCredits: validationResult.validation?.has_sufficient_credits,
    });

    return NextResponse.json({
      success: true,
      can_deduct: validationResult.validation?.has_sufficient_credits || false,
      current_balance: validationResult.validation?.current_balance || 0,
      required_credits: validationResult.validation?.required_credits || 0,
      deficit: validationResult.validation?.deficit || 0,
    });

  } catch (error) {
    logger.error('Unexpected error in credit validation', error, 'API');
    
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
