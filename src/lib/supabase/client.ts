/**
 * Supabase Client Configuration
 * 
 * This file contains the client-side Supabase configuration
 * for the Email Authentication and Credit System feature.
 */

import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig, validateSupabaseConfig } from './config';

// Validate configuration on import
validateSupabaseConfig();

// Create Supabase client for client-side operations
export const supabase = supabaseConfig.url && supabaseConfig.anonKey 
  ? createBrowserClient(
      supabaseConfig.url,
      supabaseConfig.anonKey
    )
  : null;

// Create Supabase client for server-side operations
export const supabaseServer = supabaseConfig.url && supabaseConfig.serviceRoleKey
  ? createClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

// Create Supabase client for admin operations
export const supabaseAdmin = supabaseConfig.url && supabaseConfig.serviceRoleKey
  ? createClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          nickname: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string | null;
          nickname: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          nickname?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: 'recharge' | 'deduction' | 'bonus' | 'refund';
          description: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: 'recharge' | 'deduction' | 'bonus' | 'refund';
          description: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: 'recharge' | 'deduction' | 'bonus' | 'refund';
          description?: string;
          reference_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      process_credit_transaction: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_transaction_type: string;
          p_description: string;
        };
        Returns: {
          success: boolean;
          transaction_id?: string;
          new_balance?: number;
          error?: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
