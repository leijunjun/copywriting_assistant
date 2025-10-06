/**
 * Credit Balance Management Utilities
 * 
 * This file contains utilities for managing user credit balances.
 */

import { UserCreditsModel, DatabaseUtils } from '@/lib/database/models';
import type {
  CreditBalance,
  CreditBalanceResponse,
  CreditValidation,
  CreditValidationResponse,
} from '@/types/credits';

/**
 * Get user credit balance
 */
export async function getCreditBalance(userId: string): Promise<CreditBalanceResponse> {
  try {
    const balance = await UserCreditsModel.getBalance(userId);
    
    return {
      success: true,
      balance,
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credit balance',
    };
  }
}

/**
 * Check if user has sufficient credits
 */
export async function hasSufficientCredits(
  userId: string,
  amount: number
): Promise<CreditValidationResponse> {
  try {
    const hasCredits = await UserCreditsModel.hasSufficientCredits(userId, amount);
    const currentBalance = await UserCreditsModel.getBalance(userId);
    
    const validation: CreditValidation = {
      has_sufficient_credits: hasCredits,
      required_credits: amount,
      current_balance: currentBalance,
      deficit: hasCredits ? 0 : amount - currentBalance,
    };

    return {
      success: true,
      validation,
    };
  } catch (error) {
    console.error('Error checking sufficient credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check sufficient credits',
    };
  }
}

/**
 * Validate credit amount
 */
export function validateCreditAmount(amount: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(amount)) {
    return { isValid: false, error: 'Credit amount must be an integer' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Credit amount must be positive' };
  }

  if (amount > 10000) {
    return { isValid: false, error: 'Credit amount cannot exceed 10,000' };
  }

  return { isValid: true };
}

/**
 * Check if balance is low
 */
export function isLowBalance(balance: number, threshold: number = 20): boolean {
  return balance < threshold;
}

/**
 * Get low balance warning message
 */
export function getLowBalanceWarning(balance: number, threshold: number = 20): string | null {
  if (isLowBalance(balance, threshold)) {
    return `Your credit balance is low (${balance} credits). Please recharge soon.`;
  }
  return null;
}

/**
 * Format credit balance for display
 */
export function formatCreditBalance(balance: number): string {
  return `${balance.toLocaleString()} credits`;
}

/**
 * Calculate credit percentage
 */
export function calculateCreditPercentage(balance: number, maxBalance: number = 1000): number {
  return Math.min((balance / maxBalance) * 100, 100);
}

/**
 * Get credit status
 */
export function getCreditStatus(balance: number): 'low' | 'medium' | 'high' {
  if (balance < 20) {
    return 'low';
  } else if (balance < 100) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * Get credit status color
 */
export function getCreditStatusColor(status: 'low' | 'medium' | 'high'): string {
  switch (status) {
    case 'low':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'high':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get credit status icon
 */
export function getCreditStatusIcon(status: 'low' | 'medium' | 'high'): string {
  switch (status) {
    case 'low':
      return '⚠️';
    case 'medium':
      return '⚡';
    case 'high':
      return '✅';
    default:
      return '💳';
  }
}

/**
 * Calculate credit usage rate
 */
export async function calculateCreditUsageRate(
  userId: string,
  days: number = 30
): Promise<number> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'deduction')
      .gte('created_at', startDate.toISOString());

    if (error) {
      throw new Error(`Failed to calculate usage rate: ${error.message}`);
    }

    const totalUsed = data?.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0;
    return totalUsed / days;
  } catch (error) {
    console.error('Error calculating credit usage rate:', error);
    return 0;
  }
}

/**
 * Get credit balance history
 */
export async function getCreditBalanceHistory(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; balance: number }>> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('created_at, amount')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get balance history: ${error.message}`);
    }

    // Calculate running balance
    let currentBalance = await UserCreditsModel.getBalance(userId);
    const history: Array<{ date: string; balance: number }> = [];

    if (data) {
      for (let i = data.length - 1; i >= 0; i--) {
        const transaction = data[i];
        currentBalance -= transaction.amount;
        history.unshift({
          date: transaction.created_at,
          balance: currentBalance,
        });
      }
    }

    return history;
  } catch (error) {
    console.error('Error getting credit balance history:', error);
    return [];
  }
}

/**
 * Get credit balance summary
 */
export async function getCreditBalanceSummary(userId: string): Promise<{
  current_balance: number;
  total_earned: number;
  total_spent: number;
  usage_rate: number;
  status: 'low' | 'medium' | 'high';
}> {
  try {
    const currentBalance = await UserCreditsModel.getBalance(userId);
    const totalEarned = await CreditTransactionModel.getTotalEarned(userId);
    const totalSpent = await CreditTransactionModel.getTotalSpent(userId);
    const usageRate = await calculateCreditUsageRate(userId);
    const status = getCreditStatus(currentBalance);

    return {
      current_balance: currentBalance,
      total_earned: totalEarned,
      total_spent: totalSpent,
      usage_rate: usageRate,
      status,
    };
  } catch (error) {
    console.error('Error getting credit balance summary:', error);
    throw error;
  }
}

/**
 * Monitor credit balance changes
 */
export class CreditBalanceMonitor {
  private listeners: Map<string, Function[]> = new Map();
  private userId: string;
  private lastBalance: number = 0;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Add balance change listener
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Remove balance change listener
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
   * Emit balance change event
   */
  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  /**
   * Start monitoring balance changes
   */
  async startMonitoring(): Promise<void> {
    try {
      this.lastBalance = await UserCreditsModel.getBalance(this.userId);
      
      // Poll for balance changes every 30 seconds
      setInterval(async () => {
        const currentBalance = await UserCreditsModel.getBalance(this.userId);
        
        if (currentBalance !== this.lastBalance) {
          this.emit('balanceChanged', {
            oldBalance: this.lastBalance,
            newBalance: currentBalance,
            difference: currentBalance - this.lastBalance,
          });
          
          this.lastBalance = currentBalance;
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting balance monitoring:', error);
    }
  }

  /**
   * Stop monitoring balance changes
   */
  stopMonitoring(): void {
    this.listeners.clear();
  }
}

