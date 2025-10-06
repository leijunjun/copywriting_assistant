/**
 * Credit Transaction Management Utilities
 * 
 * This file contains utilities for managing credit transactions.
 */

import { CreditTransactionModel, DatabaseUtils } from '@/lib/database/models';
import { supabase } from '@/lib/supabase/client';
import type {
  CreditTransaction,
  CreditTransactionResponse,
  CreditTransactionListResponse,
  CreditDeductionRequest,
  CreditDeductionResponse,
  CreditAdditionRequest,
  CreditAdditionResponse,
  CreditHistoryRequest,
  CreditHistoryResponse,
  PaginationInfo,
} from '@/types/credits';

/**
 * Create credit transaction
 */
export async function createCreditTransaction(
  userId: string,
  amount: number,
  transactionType: 'deduction' | 'bonus' | 'refund',
  description: string
): Promise<CreditTransactionResponse> {
  try {
    // Validate transaction amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Transaction amount must be positive',
      };
    }

    // For deduction transactions, check if user has sufficient credits
    if (transactionType === 'deduction') {
      const hasCredits = await UserCreditsModel.hasSufficientCredits(userId, amount);
      if (!hasCredits) {
        return {
          success: false,
          error: 'Insufficient credits',
        };
      }
    }

    // Process transaction using database function
    const result = await DatabaseUtils.processCreditTransaction(
      userId,
      transactionType === 'deduction' ? -amount : amount,
      transactionType,
      description
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to process transaction',
      };
    }

    // Get the created transaction
    const transaction = await CreditTransactionModel.findById(result.transaction_id!);

    return {
      success: true,
      transaction,
      new_balance: result.new_balance,
    };
  } catch (error) {
    console.error('Error creating credit transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transaction',
    };
  }
}

/**
 * Deduct credits from user
 */
export async function deductCredits(
  request: CreditDeductionRequest
): Promise<CreditDeductionResponse> {
  try {
    const result = await createCreditTransaction(
      request.user_id,
      request.amount,
      'deduction',
      request.description
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      transaction_id: result.transaction?.id,
      new_balance: result.new_balance,
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deduct credits',
    };
  }
}

/**
 * Add credits to user
 */
export async function addCredits(
  request: CreditAdditionRequest
): Promise<CreditAdditionResponse> {
  try {
    const result = await createCreditTransaction(
      request.user_id,
      request.amount,
      request.transaction_type,
      request.description
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      transaction_id: result.transaction?.id,
      new_balance: result.new_balance,
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add credits',
    };
  }
}

/**
 * Get credit transaction history
 */
export async function getCreditHistory(
  request: CreditHistoryRequest
): Promise<CreditHistoryResponse> {
  try {
    const transactions = await CreditTransactionModel.findByUserId(request.user_id, {
      limit: request.limit,
      offset: request.offset,
      type: request.type,
      startDate: request.start_date,
      endDate: request.end_date,
    });

    // Get total count for pagination
    const totalCount = await CreditTransactionModel.countByUserId(request.user_id);
    const totalPages = Math.ceil(totalCount / (request.limit || 10));

    const pagination: PaginationInfo = {
      page: request.page || 1,
      limit: request.limit || 10,
      total: totalCount,
      total_pages: totalPages,
      has_next: (request.page || 1) < totalPages,
      has_prev: (request.page || 1) > 1,
    };

    return {
      success: true,
      transactions,
      pagination,
    };
  } catch (error) {
    console.error('Error getting credit history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credit history',
    };
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<CreditTransaction | null> {
  try {
    return await CreditTransactionModel.findById(transactionId);
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    return null;
  }
}

/**
 * Get user's total credits earned
 */
export async function getTotalCreditsEarned(userId: string): Promise<number> {
  try {
    return await CreditTransactionModel.getTotalEarned(userId);
  } catch (error) {
    console.error('Error getting total credits earned:', error);
    return 0;
  }
}

/**
 * Get user's total credits spent
 */
export async function getTotalCreditsSpent(userId: string): Promise<number> {
  try {
    return await CreditTransactionModel.getTotalSpent(userId);
  } catch (error) {
    console.error('Error getting total credits spent:', error);
    return 0;
  }
}

/**
 * Get transaction statistics
 */
export async function getTransactionStatistics(userId: string): Promise<{
  total_transactions: number;
  total_earned: number;
  total_spent: number;
  net_balance: number;
  average_transaction: number;
}> {
  try {
    const totalEarned = await getTotalCreditsEarned(userId);
    const totalSpent = await getTotalCreditsSpent(userId);
    const totalTransactions = await CreditTransactionModel.countByUserId(userId);
    const netBalance = totalEarned - totalSpent;
    const averageTransaction = totalTransactions > 0 ? (totalEarned + totalSpent) / totalTransactions : 0;

    return {
      total_transactions: totalTransactions,
      total_earned: totalEarned,
      total_spent: totalSpent,
      net_balance: netBalance,
      average_transaction: averageTransaction,
    };
  } catch (error) {
    console.error('Error getting transaction statistics:', error);
    throw error;
  }
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(
  userId: string,
  limit: number = 10
): Promise<CreditTransaction[]> {
  try {
    return await CreditTransactionModel.findByUserId(userId, { limit });
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return [];
  }
}

/**
 * Get transactions by type
 */
export async function getTransactionsByType(
  userId: string,
  type: 'deduction' | 'bonus' | 'refund',
  limit: number = 10
): Promise<CreditTransaction[]> {
  try {
    return await CreditTransactionModel.findByUserId(userId, { limit, type });
  } catch (error) {
    console.error('Error getting transactions by type:', error);
    return [];
  }
}

/**
 * Get transactions by date range
 */
export async function getTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<CreditTransaction[]> {
  try {
    return await CreditTransactionModel.findByUserId(userId, {
      limit,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Error getting transactions by date range:', error);
    return [];
  }
}

/**
 * Search transactions
 */
export async function searchTransactions(
  userId: string,
  query: string,
  limit: number = 10
): Promise<CreditTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .ilike('description', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search transactions: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error searching transactions:', error);
    return [];
  }
}

/**
 * Export transaction history
 */
export async function exportTransactionHistory(
  userId: string,
  format: 'csv' | 'json' = 'csv'
): Promise<string> {
  try {
    const transactions = await CreditTransactionModel.findByUserId(userId, { limit: 1000 });

    if (format === 'csv') {
      const headers = ['Date', 'Type', 'Amount', 'Description'];
      const rows = transactions.map(transaction => [
        transaction.created_at,
        transaction.transaction_type,
        transaction.amount,
        transaction.description,
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      return JSON.stringify(transactions, null, 2);
    }
  } catch (error) {
    console.error('Error exporting transaction history:', error);
    throw error;
  }
}

/**
 * Transaction event listener
 */
export class TransactionEventListener {
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  /**
   * Start listening for transaction events
   */
  startListening(): void {
    // Listen for real-time transaction changes
    supabase
      .channel('credit_transactions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credit_transactions',
      }, (payload) => {
        this.emit('transactionCreated', payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'credit_transactions',
      }, (payload) => {
        this.emit('transactionUpdated', payload.new);
      })
      .subscribe();
  }

  /**
   * Stop listening for transaction events
   */
  stopListening(): void {
    this.listeners.clear();
  }
}

