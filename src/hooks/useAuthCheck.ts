/**
 * 认证检查Hook
 * 
 * 提供认证状态检查和登录提醒功能
 */

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { LoginReminderModal } from '@/components/ui/login-reminder-modal';

export function useAuthCheck() {
  const { authState } = useAuth();
  const { isAuthenticated, isLoading } = authState;
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * 检查用户是否已登录，如果未登录则显示登录提醒
   * @param redirectUrl 登录成功后要跳转的URL
   * @returns 如果已登录返回true，否则返回false并显示登录提醒
   */
  const checkAuthAndShowModal = useCallback((redirectUrl?: string) => {
    console.log('=== Auth Check Start ===');
    console.log('Auth check - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    console.log('Auth check - authState:', authState);
    
    // 如果已登录，直接返回true
    if (isAuthenticated) {
      console.log('✅ User is authenticated, proceeding with action');
      return true;
    }

    // 如果正在加载认证状态，等待加载完成
    if (isLoading) {
      console.log('⏳ Auth state is loading, waiting...');
      return false;
    }

    console.log('❌ User not authenticated, showing login modal');
    
    // 存储重定向URL到localStorage
    if (redirectUrl) {
      localStorage.setItem('loginRedirectUrl', redirectUrl);
    }

    // 未登录，显示登录提醒弹窗
    setShowLoginModal(true);
    return false;
  }, [isAuthenticated, isLoading, authState]);

  /**
   * 包装函数，用于在需要认证的操作前检查
   * @param callback 需要认证的操作回调
   * @param redirectUrl 登录成功后要跳转的URL
   */
  const withAuthCheck = useCallback((
    callback: () => void, 
    redirectUrl?: string
  ) => {
    console.log('=== withAuthCheck called ===');
    console.log('Current auth state:', { isAuthenticated, isLoading });
    
    // 直接检查认证状态，不使用延迟
    if (isAuthenticated && !isLoading) {
      console.log('✅ User is authenticated, executing callback immediately');
      callback();
      return;
    }
    
    // 如果正在加载，等待一小段时间再检查
    if (isLoading) {
      console.log('⏳ Auth state is loading, waiting 100ms before retry...');
      setTimeout(() => {
        console.log('⏳ Retry after loading...');
        if (isAuthenticated) {
          console.log('✅ User is authenticated after retry, executing callback');
          callback();
        } else {
          console.log('❌ User still not authenticated after retry');
          checkAuthAndShowModal(redirectUrl);
        }
      }, 100);
      return;
    }
    
    // 未登录，显示登录提醒
    console.log('❌ User not authenticated, showing login modal');
    checkAuthAndShowModal(redirectUrl);
  }, [isAuthenticated, isLoading, checkAuthAndShowModal]);

  return {
    isAuthenticated,
    isLoading,
    checkAuthAndShowModal,
    withAuthCheck,
    showLoginModal,
    setShowLoginModal
  };
}
