/**
 * Database Models and Types
 * 
 * This file defines database models and types for the WeChat Login and Credit System.
 */

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/client';
import type { User } from '@/types/auth';
import type { CreditBalance, CreditTransaction } from '@/types/credits';

// Database table types
export type UsersTable = Database['public']['Tables']['users'];
export type UserCreditsTable = Database['public']['Tables']['user_credits'];
export type CreditTransactionsTable = Database['public']['Tables']['credit_transactions'];

// Row types
export type UserRow = UsersTable['Row'];
export type UserCreditsRow = UserCreditsTable['Row'];
export type CreditTransactionRow = CreditTransactionsTable['Row'];

// Insert types
export type UserInsert = UsersTable['Insert'];
export type UserCreditsInsert = UserCreditsTable['Insert'];
export type CreditTransactionInsert = CreditTransactionsTable['Insert'];

// Update types
export type UserUpdate = UsersTable['Update'];
export type UserCreditsUpdate = UserCreditsTable['Update'];
export type CreditTransactionUpdate = CreditTransactionsTable['Update'];

// Database model classes
export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: UserInsert): Promise<UserRow> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  /**
   * Find user by WeChat OpenID
   */
  static async findByWeChatOpenId(openid: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wechat_openid', openid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to find user by WeChat OpenID: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user
   */
  static async update(id: string, updates: UserUpdate): Promise<UserRow> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }

  /**
   * Check if user exists
   */
  static async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  /**
   * Get user count
   */
  static async count(): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to get user count: ${error.message}`);
    }

    return count || 0;
  }
}

export class UserCreditsModel {
  /**
   * Create user credits record
   */
  static async create(creditsData: UserCreditsInsert): Promise<UserCreditsRow> {
    const { data, error } = await supabase
      .from('user_credits')
      .insert(creditsData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user credits: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user credits by user ID
   */
  static async findByUserId(userId: string): Promise<UserCreditsRow | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Credits not found
      }
      throw new Error(`Failed to find user credits: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user credits
   */
  static async update(userId: string, updates: UserCreditsUpdate): Promise<UserCreditsRow> {
    const { data, error } = await supabase
      .from('user_credits')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user credits: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user credit balance
   */
  static async getBalance(userId: string): Promise<number> {
    const credits = await this.findByUserId(userId);
    return credits?.balance || 0;
  }

  /**
   * Check if user has sufficient credits
   */
  static async hasSufficientCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }

  /**
   * Initialize user credits with default balance
   */
  static async initialize(userId: string, initialBalance: number = 100): Promise<UserCreditsRow> {
    return this.create({
      user_id: userId,
      balance: initialBalance,
    });
  }
}

export class CreditTransactionModel {
  /**
   * Create credit transaction
   */
  static async create(transactionData: CreditTransactionInsert): Promise<CreditTransactionRow> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create credit transaction: ${error.message}`);
    }

    return data;
  }

  /**
   * Get transactions by user ID
   */
  static async findByUserId(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<CreditTransactionRow[]> {
    let query = supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    if (options.type) {
      query = query.eq('transaction_type', options.type);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find credit transactions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get transaction by ID
   */
  static async findById(id: string): Promise<CreditTransactionRow | null> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Transaction not found
      }
      throw new Error(`Failed to find credit transaction: ${error.message}`);
    }

    return data;
  }

  /**
   * Get transaction count by user ID
   */
  static async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get transaction count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get total credits spent by user
   */
  static async getTotalSpent(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'deduction');

    if (error) {
      throw new Error(`Failed to get total spent: ${error.message}`);
    }

    return data?.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0;
  }

  /**
   * Get total credits earned by user
   */
  static async getTotalEarned(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', userId)
      .in('transaction_type', ['bonus', 'refund']);

    if (error) {
      throw new Error(`Failed to get total earned: ${error.message}`);
    }

    return data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
  }
}

// Database utility functions
export class DatabaseUtils {
  /**
   * Execute credit transaction using database function
   */
  static async processCreditTransaction(
    userId: string,
    amount: number,
    transactionType: string,
    description: string
  ): Promise<{
    success: boolean;
    transaction_id?: string;
    new_balance?: number;
    error?: string;
  }> {
    const { data, error } = await supabase.rpc('process_credit_transaction', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: transactionType,
      p_description: description,
    });

    if (error) {
      throw new Error(`Failed to process credit transaction: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user profile with credits
   */
  static async getUserProfile(userId: string): Promise<{
    user: UserRow;
    credits: UserCreditsRow;
  } | null> {
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }

    const credits = await UserCreditsModel.findByUserId(userId);
    if (!credits) {
      return null;
    }

    return { user, credits };
  }

  /**
   * Initialize user with credits
   */
  static async initializeUser(userData: UserInsert): Promise<{
    user: UserRow;
    credits: UserCreditsRow;
  }> {
    const user = await UserModel.create(userData);
    const credits = await UserCreditsModel.initialize(user.id);

    return { user, credits };
  }

  /**
   * Check database connection
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}


export type {
  UsersTable,
  UserCreditsTable,
  CreditTransactionsTable,
  UserRow,
  UserCreditsRow,
  CreditTransactionRow,
  UserInsert,
  UserCreditsInsert,
  CreditTransactionInsert,
  UserUpdate,
  UserCreditsUpdate,
  CreditTransactionUpdate,
};
