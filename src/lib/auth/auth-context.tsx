/**
 * 认证状态管理上下文
 * 
 * 提供全局认证状态管理和事件监听功能
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

// 认证状态接口
interface AuthState {
  user: any | null;
  credits: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 认证事件类型
type AuthEvent = 'login' | 'logout' | 'register' | 'refresh';

// 认证上下文接口
interface AuthContextType {
  authState: AuthState;
  refreshAuthState: () => Promise<void>;
  clearAuthState: () => void;
  addAuthListener: (callback: (event: AuthEvent) => void) => () => void;
  triggerAuthEvent: (event: AuthEvent) => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    credits: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [listeners, setListeners] = useState<Set<(event: AuthEvent) => void>>(new Set());

  // 添加事件监听器
  const addAuthListener = useCallback((callback: (event: AuthEvent) => void) => {
    setListeners(prev => new Set(prev).add(callback));
    
    // 返回清理函数
    return () => {
      setListeners(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // 触发认证事件
  const triggerAuthEvent = useCallback((event: AuthEvent) => {
    logger.auth(`Auth event triggered: ${event}`);
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        logger.error(`Auth listener error for event ${event}`, error);
      }
    });
  }, [listeners]);

  // 刷新认证状态
  const refreshAuthState = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setAuthState({
            user: data.user,
            credits: data.credits,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // 触发积分更新事件
          triggerAuthEvent('refresh');
          
          logger.auth('Auth state refreshed', {
            userId: data.user.id,
            balance: data.credits.balance,
          });
        } else {
          setAuthState({
            user: null,
            credits: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else if (response.status === 401) {
        setAuthState({
          user: null,
          credits: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      logger.error('Failed to refresh auth state', error);
      setAuthState({
        user: null,
        credits: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [triggerAuthEvent]);

  // 清除认证状态
  const clearAuthState = useCallback(() => {
    setAuthState({
      user: null,
      credits: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  // 初始化时获取认证状态
  useEffect(() => {
    refreshAuthState();
  }, [refreshAuthState]);

  // 监听localStorage变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'session') {
        if (e.newValue === null) {
          // 用户登出
          clearAuthState();
          triggerAuthEvent('logout');
        } else {
          // 用户登录或注册
          refreshAuthState();
          triggerAuthEvent('login');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshAuthState, clearAuthState, triggerAuthEvent]);

  const contextValue: AuthContextType = {
    authState,
    refreshAuthState,
    clearAuthState,
    addAuthListener,
    triggerAuthEvent,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 认证状态监听Hook
export function useAuthListener(callback: (event: AuthEvent) => void, deps: any[] = []) {
  const { addAuthListener } = useAuth();

  useEffect(() => {
    const cleanup = addAuthListener(callback);
    return cleanup;
  }, [addAuthListener, ...deps]);
}
