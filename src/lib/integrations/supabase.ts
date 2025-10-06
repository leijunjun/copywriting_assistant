/**
 * Supabase Authentication Integration
 * 
 * This module provides comprehensive Supabase authentication integration with session management.
 */

import { createServerSupabaseClient, createServerSupabaseClientForActions } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { CustomError } from '@/lib/utils/error';

interface SupabaseAuthConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email?: string;
    user_metadata: any;
  };
}

class SupabaseAuthIntegration {
  private config: SupabaseAuthConfig;

  constructor(config: SupabaseAuthConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig() {
    if (!this.config.url || !this.config.anonKey || !this.config.serviceRoleKey) {
      throw new CustomError('ConfigurationError', 'Supabase configuration is incomplete');
    }
  }

  /**
   * Create a new user session
   */
  async createSession(userId: string, userMetadata: any): Promise<SessionData> {
    try {
      const supabase = createServerSupabaseClientForActions();

      // Create a custom JWT token for the user
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `user_${userId}@temp.com`, // Temporary email for WeChat users
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (error) {
        throw new CustomError('AuthError', `Failed to create session: ${error.message}`);
      }

      // For WeChat users, we'll use a different approach
      // Create a custom session token
      const sessionToken = await this.generateCustomSessionToken(userId, userMetadata);

      const sessionData: SessionData = {
        accessToken: sessionToken,
        refreshToken: sessionToken, // Simplified for WeChat users
        expiresIn: 3600, // 1 hour
        user: {
          id: userId,
          user_metadata: userMetadata,
        },
      };

      logger.auth('Session created successfully', {
        userId,
        sessionToken: sessionToken.substring(0, 20) + '...',
      });

      return sessionData;
    } catch (error) {
      logger.error('Failed to create session', error, 'SUPABASE');
      throw error;
    }
  }

  /**
   * Validate and refresh session
   */
  async validateSession(accessToken: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      const supabase = createServerSupabaseClient();
      
      // Set the session token
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (error) {
        return { valid: false, error: error.message };
      }

      if (!user) {
        return { valid: false, error: 'User not found' };
      }

      logger.auth('Session validated successfully', {
        userId: user.id,
      });

      return { valid: true, user };
    } catch (error) {
      logger.error('Session validation failed', error, 'SUPABASE');
      return { valid: false, error: 'Session validation failed' };
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const supabase = createServerSupabaseClient();
      
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new CustomError('AuthError', `Failed to refresh session: ${error.message}`);
      }

      logger.auth('Session refreshed successfully', {
        userId: data.user?.id,
      });

      return {
        accessToken: data.session?.access_token || '',
        expiresIn: data.session?.expires_in || 3600,
      };
    } catch (error) {
      logger.error('Session refresh failed', error, 'SUPABASE');
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut(accessToken: string): Promise<void> {
    try {
      const supabase = createServerSupabaseClient();
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new CustomError('AuthError', `Failed to sign out: ${error.message}`);
      }

      logger.auth('User signed out successfully');
    } catch (error) {
      logger.error('Sign out failed', error, 'SUPABASE');
      throw error;
    }
  }

  /**
   * Get user profile with credits
   */
  async getUserProfile(userId: string): Promise<{
    user: any;
    credits: any;
  }> {
    try {
      const supabase = createServerSupabaseClientForActions();

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new CustomError('DatabaseError', `Failed to fetch user: ${userError.message}`);
      }

      // Get user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (creditsError) {
        throw new CustomError('DatabaseError', `Failed to fetch user credits: ${creditsError.message}`);
      }

      logger.api('User profile fetched successfully', {
        userId,
        balance: creditsData.balance,
      });

      return {
        user: userData,
        credits: creditsData,
      };
    } catch (error) {
      logger.error('Failed to fetch user profile', error, 'SUPABASE');
      throw error;
    }
  }

  /**
   * Generate custom session token for WeChat users
   */
  private async generateCustomSessionToken(userId: string, userMetadata: any): Promise<string> {
    // In a real implementation, you would generate a proper JWT token
    // For now, we'll create a simple token
    const tokenData = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      user_metadata: userMetadata,
    };

    // Simple base64 encoding (in production, use proper JWT)
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  /**
   * Verify custom session token
   */
  async verifyCustomSessionToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (tokenData.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, userId: tokenData.sub };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  }
}

// Create singleton instance
const supabaseAuthIntegration = new SupabaseAuthIntegration({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
});

export default supabaseAuthIntegration;
export { SupabaseAuthIntegration };
