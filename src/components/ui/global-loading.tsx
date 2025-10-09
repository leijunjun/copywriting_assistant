/**
 * 全局加载状态管理
 * 提供统一的加载状态和友好提示
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PageLoadingOverlay, LoadingIndicator } from './loading-skeleton';

interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
  showProgress?: boolean;
}

interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (loading: boolean, message?: string, options?: { progress?: number; showProgress?: boolean }) => void;
  showLoading: (message: string, options?: { progress?: number; showProgress?: boolean }) => void;
  hideLoading: () => void;
  updateProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0,
    showProgress: false,
  });

  const setLoading = useCallback((
    loading: boolean, 
    message: string = '加载中...', 
    options: { progress?: number; showProgress?: boolean } = {}
  ) => {
    setLoadingState({
      isLoading: loading,
      message,
      progress: options.progress || 0,
      showProgress: options.showProgress || false,
    });
  }, []);

  const showLoading = useCallback((
    message: string, 
    options: { progress?: number; showProgress?: boolean } = {}
  ) => {
    setLoading(true, message, options);
  }, [setLoading]);

  const hideLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  return (
    <LoadingContext.Provider value={{
      loadingState,
      setLoading,
      showLoading,
      hideLoading,
      updateProgress,
    }}>
      {children}
      {loadingState.isLoading && (
        <PageLoadingOverlay
          message={loadingState.message}
          showProgress={loadingState.showProgress}
          progress={loadingState.progress}
        />
      )}
    </LoadingContext.Provider>
  );
}

// 页面加载钩子
export function usePageLoading() {
  const { showLoading, hideLoading, updateProgress } = useLoading();

  const startPageLoad = useCallback((pageName: string) => {
    showLoading(`正在加载${pageName}...`, { showProgress: true, progress: 0 });
    
    // 模拟加载进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 90) {
        clearInterval(interval);
        progress = 90;
      }
      updateProgress(progress);
    }, 200);

    return () => {
      clearInterval(interval);
      updateProgress(100);
      setTimeout(() => hideLoading(), 300);
    };
  }, [showLoading, hideLoading, updateProgress]);

  return { startPageLoad, hideLoading, updateProgress };
}

// API请求加载钩子
export function useApiLoading() {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    message: string = '请求处理中...'
  ): Promise<T> => {
    try {
      showLoading(message);
      const result = await apiCall();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return { withLoading };
}

// 路由加载状态
export function useRouteLoading() {
  const { showLoading, hideLoading } = useLoading();

  const handleRouteStart = useCallback((route: string) => {
    const routeMessages: Record<string, string> = {
      '/': '正在加载首页...',
      '/profile': '正在加载个人中心...',
      '/credits': '正在加载积分管理...',
      '/auth/login': '正在加载登录页面...',
      '/auth/Secret-Manual-Registration': '正在加载注册页面...',
    };

    showLoading(routeMessages[route] || '正在加载页面...');
  }, [showLoading]);

  const handleRouteComplete = useCallback(() => {
    hideLoading();
  }, [hideLoading]);

  return { handleRouteStart, handleRouteComplete };
}
