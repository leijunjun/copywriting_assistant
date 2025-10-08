/**
 * Credit Transaction History Endpoint
 * 
 * This endpoint returns the user's credit transaction history.
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { getCurrentUser } from '@/lib/auth/session';
import { getCreditHistory } from '@/lib/credits/transactions';
import { validateCreditHistoryRequest } from '@/lib/validation/credits';
import { logger } from '@/lib/utils/logger';
import { createErrorResponse } from '@/lib/utils/error';

export async function GET(request: NextRequest) {
  try {
    logger.api('Credit transaction history request received');

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
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build request object
    const historyRequest = {
      user_id: user.id,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type: type && type !== 'all' ? type as 'deduction' | 'bonus' | 'refund' | 'recharge' : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    // Validate request
    try {
      validateCreditHistoryRequest(historyRequest);
    } catch (validationError) {
      logger.error('Invalid credit history request', undefined, 'API', {
        error: validationError,
        historyRequest,
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

    // Get credit history
    const result = await getCreditHistory(historyRequest);

    if (!result.success) {
      logger.error('Failed to get credit history', undefined, 'API', {
        error: result.error,
        userId: user.id,
        historyRequest,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'HISTORY_FAILED',
          message: result.error || 'Failed to get credit history',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('Credit history retrieved successfully', {
      userId: user.id,
      transactionCount: result.transactions?.length || 0,
      page: historyRequest.page,
      limit: historyRequest.limit,
    });

    return NextResponse.json({
      success: true,
      transactions: result.transactions,
      pagination: result.pagination,
    });

  } catch (error) {
    logger.error('Unexpected error in credit history request', error, 'API');
    
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

export async function POST(request: NextRequest) {
  try {
    logger.api('Credit transaction history POST request received');

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
    
    // Build request object
    const historyRequest = {
      user_id: user.id,
      page: body.page,
      limit: body.limit,
      type: body.type && body.type !== 'all' ? body.type : undefined,
      start_date: body.start_date,
      end_date: body.end_date,
    };

    // Validate request
    try {
      validateCreditHistoryRequest(historyRequest);
    } catch (validationError) {
      logger.error('Invalid credit history request', undefined, 'API', {
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

    // Get credit history
    const result = await getCreditHistory(historyRequest);

    if (!result.success) {
      logger.error('Failed to get credit history', undefined, 'API', {
        error: result.error,
        userId: user.id,
        historyRequest,
      });
      
      return NextResponse.json(
        createErrorResponse({
          code: 'HISTORY_FAILED',
          message: result.error || 'Failed to get credit history',
          type: 'DATABASE',
          severity: 'HIGH',
        }),
        { status: 500 }
      );
    }

    logger.api('Credit history retrieved successfully', {
      userId: user.id,
      transactionCount: result.transactions?.length || 0,
      page: historyRequest.page,
      limit: historyRequest.limit,
    });

    return NextResponse.json({
      success: true,
      transactions: result.transactions,
      pagination: result.pagination,
    });

  } catch (error) {
    logger.error('Unexpected error in credit history request', error, 'API');
    
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
