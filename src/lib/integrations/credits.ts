/**
 * Credit System Integration
 * 
 * This module provides comprehensive credit system integration with content generation tools.
 */

import { deductCredits, getBalance } from '@/lib/credits/balance';
import { getTransactionHistory } from '@/lib/credits/transactions';
import { logger } from '@/lib/utils/logger';
import { CustomError } from '@/lib/utils/error';

interface CreditSystemConfig {
  defaultCreditCost: number;
  premiumCreditCost: number;
  lowBalanceThreshold: number;
  warningThreshold: number;
}

interface ContentGenerationRequest {
  userId: string;
  toolId: string;
  toolName: string;
  input: any;
  options?: {
    premium?: boolean;
    customCost?: number;
  };
}

interface CreditDeductionResult {
  success: boolean;
  newBalance: number;
  transactionId: string;
  cost: number;
  error?: string;
}

class CreditSystemIntegration {
  private config: CreditSystemConfig;

  constructor(config: CreditSystemConfig) {
    this.config = config;
  }

  /**
   * Calculate credit cost for content generation
   */
  calculateCreditCost(toolId: string, options: { premium?: boolean; customCost?: number } = {}): number {
    if (options.customCost) {
      return options.customCost;
    }

    if (options.premium) {
      return this.config.premiumCreditCost;
    }

    // Tool-specific pricing
    const toolPricing: Record<string, number> = {
      'xiaohongshu-post': 5,
      'douyin-post': 5,
      'weibo-post': 3,
      'twitter-post': 3,
      'facebook-post': 3,
      'instagram-post': 4,
      'tiktok-post': 4,
      'blog-outline': 8,
      'article-title': 2,
      'seo-title': 2,
      'seo-description': 3,
      'email-generation': 4,
      'meeting-summary': 6,
      'content-summary': 4,
      'grammar-check': 1,
      'tone-analysis': 2,
      'sentence-rewriting': 2,
      'sentence-expansion': 3,
      'sentence-continuation': 3,
      'text-abbreviation': 1,
      'text-conversion-table': 2,
      'long-tail-keyword': 2,
      'video-title': 3,
      'video-description': 4,
      'video-script-outline': 6,
      'personal-introduction': 3,
      'social-media-bio': 2,
      'comment-generation': 1,
      'comment-reply': 1,
      'quick-response': 1,
      'expert-explanation': 5,
      'interview-qa': 4,
      'qa-generation': 3,
      'book-title': 2,
      'player-name': 1,
      'supper-plan': 3,
      'weekly-meal-plan': 4,
      'weekly-fitness-plan': 4,
      'career-development': 5,
      'task-decompose': 3,
      'daily-report': 2,
      'weekly-report': 3,
      'monthly-report': 4,
      'about-us': 3,
    };

    return toolPricing[toolId] || this.config.defaultCreditCost;
  }

  /**
   * Check if user has sufficient credits
   */
  async checkSufficientCredits(userId: string, requiredCredits: number): Promise<{
    sufficient: boolean;
    currentBalance: number;
    shortfall?: number;
  }> {
    try {
      const balance = await getBalance(userId);
      
      const sufficient = balance.balance >= requiredCredits;
      const shortfall = sufficient ? 0 : requiredCredits - balance.balance;

      logger.credits('Credit sufficiency check', {
        userId,
        currentBalance: balance.balance,
        requiredCredits,
        sufficient,
        shortfall,
      });

      return {
        sufficient,
        currentBalance: balance.balance,
        shortfall,
      };
    } catch (error) {
      logger.error('Failed to check credit sufficiency', error, 'CREDITS');
      throw error;
    }
  }

  /**
   * Deduct credits for content generation
   */
  async deductCreditsForGeneration(request: ContentGenerationRequest): Promise<CreditDeductionResult> {
    try {
      const cost = this.calculateCreditCost(request.toolId, request.options);
      
      // Check if user has sufficient credits
      const creditCheck = await this.checkSufficientCredits(request.userId, cost);
      
      if (!creditCheck.sufficient) {
        return {
          success: false,
          newBalance: creditCheck.currentBalance,
          transactionId: '',
          cost,
          error: `Insufficient credits. Required: ${cost}, Available: ${creditCheck.currentBalance}`,
        };
      }

      // Deduct credits
      const deductionResult = await deductCredits(request.userId, {
        amount: cost,
        description: `Content generation: ${request.toolName}`,
      });

      logger.credits('Credits deducted for content generation', {
        userId: request.userId,
        toolId: request.toolId,
        toolName: request.toolName,
        cost,
        newBalance: deductionResult.balance,
      });

      return {
        success: true,
        newBalance: deductionResult.balance,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cost,
      };
    } catch (error) {
      logger.error('Failed to deduct credits for generation', error, 'CREDITS');
      return {
        success: false,
        newBalance: 0,
        transactionId: '',
        cost: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refund credits for failed content generation
   */
  async refundCredits(userId: string, transactionId: string, reason: string): Promise<{
    success: boolean;
    newBalance: number;
    error?: string;
  }> {
    try {
      // Get transaction details
      const transactions = await getTransactionHistory(userId);
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        throw new CustomError('NotFoundError', 'Transaction not found');
      }

      // Refund the credits
      const refundResult = await deductCredits(userId, {
        amount: -transaction.amount, // Negative amount for refund
        description: `Refund: ${reason}`,
      });

      logger.credits('Credits refunded', {
        userId,
        transactionId,
        refundAmount: transaction.amount,
        newBalance: refundResult.balance,
        reason,
      });

      return {
        success: true,
        newBalance: refundResult.balance,
      };
    } catch (error) {
      logger.error('Failed to refund credits', error, 'CREDITS');
      return {
        success: false,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get credit usage statistics
   */
  async getCreditUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalUsed: number;
    totalRefunded: number;
    netUsed: number;
    toolUsage: Record<string, number>;
    dailyUsage: Array<{ date: string; used: number; refunded: number }>;
  }> {
    try {
      const transactions = await getTransactionHistory(userId);
      
      const now = new Date();
      const periodStart = new Date();
      
      switch (period) {
        case 'day':
          periodStart.setDate(now.getDate() - 1);
          break;
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
      }

      const filteredTransactions = transactions.filter(t => 
        new Date(t.created_at) >= periodStart
      );

      const totalUsed = filteredTransactions
        .filter(t => t.transaction_type === 'deduction')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalRefunded = filteredTransactions
        .filter(t => t.transaction_type === 'refund')
        .reduce((sum, t) => sum + t.amount, 0);

      const netUsed = totalUsed - totalRefunded;

      // Tool usage breakdown
      const toolUsage: Record<string, number> = {};
      filteredTransactions
        .filter(t => t.transaction_type === 'deduction')
        .forEach(t => {
          const toolName = t.description.split(': ')[1] || 'Unknown';
          toolUsage[toolName] = (toolUsage[toolName] || 0) + t.amount;
        });

      // Daily usage
      const dailyUsage: Array<{ date: string; used: number; refunded: number }> = [];
      const days = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(periodStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = filteredTransactions.filter(t => 
          t.created_at.startsWith(dateStr)
        );
        
        const used = dayTransactions
          .filter(t => t.transaction_type === 'deduction')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const refunded = dayTransactions
          .filter(t => t.transaction_type === 'refund')
          .reduce((sum, t) => sum + t.amount, 0);
        
        dailyUsage.push({ date: dateStr, used, refunded });
      }

      logger.credits('Credit usage stats generated', {
        userId,
        period,
        totalUsed,
        totalRefunded,
        netUsed,
      });

      return {
        totalUsed,
        totalRefunded,
        netUsed,
        toolUsage,
        dailyUsage,
      };
    } catch (error) {
      logger.error('Failed to get credit usage stats', error, 'CREDITS');
      throw error;
    }
  }

  /**
   * Check if user needs low balance warning
   */
  async checkLowBalanceWarning(userId: string): Promise<{
    needsWarning: boolean;
    currentBalance: number;
    threshold: number;
  }> {
    try {
      const balance = await getBalance(userId);
      const needsWarning = balance.balance < this.config.warningThreshold;

      return {
        needsWarning,
        currentBalance: balance.balance,
        threshold: this.config.warningThreshold,
      };
    } catch (error) {
      logger.error('Failed to check low balance warning', error, 'CREDITS');
      throw error;
    }
  }
}

// Create singleton instance
const creditSystemIntegration = new CreditSystemIntegration({
  defaultCreditCost: 3,
  premiumCreditCost: 8,
  lowBalanceThreshold: 20,
  warningThreshold: 50,
});

export default creditSystemIntegration;
export { CreditSystemIntegration };
