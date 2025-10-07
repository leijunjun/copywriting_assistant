/**
 * Session Management Utilities
 * 
 * This file contains utilities for managing user sessions and authentication.
 */

import { supabase } from '@/lib/supabase/client';
import { UserModel } from '@/lib/database/models';
import type { User, Session, SessionData } from '@/types/auth';

/**
 * Get current user session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token || '',
      expires_at: session.expires_at || 0,
      user_id: session.user?.id || '',
    };
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    if (!user) {
      return null;
    }

    // Get user from database
    const dbUser = await UserModel.findById(user.id);
    return dbUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user with session data
 */
export async function getCurrentUserWithSession(): Promise<SessionData | null> {
  try {
    console.log('🔍 Checking authentication status...');
    
    // First try Supabase session
    const session = await getCurrentSession();
    if (session) {
      console.log('✅ Supabase session found');
      const user = await getCurrentUser();
      if (user) {
        console.log('✅ User found via Supabase session');
        return { user, session };
      }
    }

    console.log('⚠️  No Supabase session, checking for WeChat session...');
    
    // Try to get user from WeChat session (stored in localStorage or cookies)
    const wechatSession = await getWeChatSession();
    if (wechatSession) {
      console.log('✅ WeChat session found');
      const user = await UserModel.findById(wechatSession.user_id);
      if (user) {
        console.log('✅ User found via WeChat session');
        return { user, session: wechatSession };
      }
    }

    console.log('❌ No valid session found');
    return null;
  } catch (error) {
    console.error('Error getting current user with session:', error);
    return null;
  }
}

/**
 * Get WeChat session from client storage
 */
async function getWeChatSession(): Promise<Session | null> {
  try {
    console.log('🔍 Checking for WeChat session...');
    
    // This is server-side code, so we can't access localStorage directly
    // The WeChat session should be passed via request headers or cookies
    // For now, return null as this needs to be handled by the API route
    console.log('⚠️  WeChat session check is server-side, needs client-side implementation');
    return null;
  } catch (error) {
    console.error('Error getting WeChat session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    return session !== null && session.expires_at > Date.now();
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

/**
 * Refresh user session
 */
export async function refreshSession(): Promise<Session | null> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }

    if (!session) {
      return null;
    }

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token || '',
      expires_at: session.expires_at || 0,
      user_id: session.user?.id || '',
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<boolean> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

/**
 * Validate session token
 */
export async function validateSessionToken(token: string): Promise<boolean> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return false;
    }

    return data.user !== null;
  } catch (error) {
    console.error('Error validating session token:', error);
    return false;
  }
}

/**
 * Get user ID from session
 */
export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const session = await getCurrentSession();
    return session?.user_id || null;
  } catch (error) {
    console.error('Error getting user ID from session:', error);
    return null;
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(session: Session): boolean {
  return session.expires_at <= Date.now();
}

/**
 * Check if session needs refresh
 */
export function shouldRefreshSession(session: Session): boolean {
  const refreshThreshold = 5 * 60 * 1000; // 5 minutes
  return session.expires_at - Date.now() < refreshThreshold;
}

/**
 * Auto-refresh session if needed
 */
export async function autoRefreshSession(): Promise<Session | null> {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return null;
    }

    if (shouldRefreshSession(session)) {
      return await refreshSession();
    }

    return session;
  } catch (error) {
    console.error('Error auto-refreshing session:', error);
    return null;
  }
}

/**
 * Set session data
 */
export async function setSessionData(sessionData: SessionData): Promise<boolean> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { error } = await supabase.auth.setSession({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });

    if (error) {
      console.error('Error setting session data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting session data:', error);
    return false;
  }
}

/**
 * Clear session data
 */
export async function clearSessionData(): Promise<boolean> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    const { error } = await supabase.auth.setSession({
      access_token: '',
      refresh_token: '',
    });

    if (error) {
      console.error('Error clearing session data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing session data:', error);
    return false;
  }
}

/**
 * Get session expiration time
 */
export function getSessionExpirationTime(session: Session): Date {
  return new Date(session.expires_at);
}

/**
 * Get time until session expires
 */
export function getTimeUntilExpiration(session: Session): number {
  return session.expires_at - Date.now();
}

/**
 * Format session expiration time
 */
export function formatSessionExpiration(session: Session): string {
  const expirationTime = getSessionExpirationTime(session);
  return expirationTime.toLocaleString();
}

/**
 * Check if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    // Implement permission checking logic here
    // For now, return true for authenticated users
    return true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Require authentication
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require specific permission
 */
export async function requirePermission(permission: string): Promise<User> {
  const user = await requireAuth();
  const hasPermission = await hasPermission(permission);
  
  if (!hasPermission) {
    throw new Error(`Permission '${permission}' required`);
  }
  
  return user;
}

/**
 * Session event listeners
 */
export class SessionManager {
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
   * Start session monitoring
   */
  startMonitoring(): void {
    // Monitor session changes
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    supabase.auth.onAuthStateChange((event, session) => {
      this.emit('authStateChange', { event, session });
    });
  }

  /**
   * Stop session monitoring
   */
  stopMonitoring(): void {
    // Clean up listeners
    this.listeners.clear();
  }
}

// Create global session manager instance
export const sessionManager = new SessionManager();
