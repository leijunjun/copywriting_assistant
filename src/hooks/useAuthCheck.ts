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
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * 检查用户是否已登录，如果未登录则显示登录提醒
   * @param redirectUrl 登录成功后要跳转的URL
   * @returns 如果已登录返回true，否则返回false并显示登录提醒
   */
  const checkAuthAndShowModal = useCallback((redirectUrl?: string) => {
    // 如果正在加载认证状态，等待加载完成
    if (isLoading) {
      return false;
    }

    // 如果已登录，直接返回true
    if (isAuthenticated) {
      return true;
    }

    // 存储重定向URL到localStorage
    if (redirectUrl) {
      localStorage.setItem('loginRedirectUrl', redirectUrl);
    }

    // 未登录，显示登录提醒弹窗
    setShowLoginModal(true);
    return false;
  }, [isAuthenticated, isLoading]);

  /**
   * 包装函数，用于在需要认证的操作前检查
   * @param callback 需要认证的操作回调
   * @param redirectUrl 登录成功后要跳转的URL
   */
  const withAuthCheck = useCallback((
    callback: () => void, 
    redirectUrl?: string
  ) => {
    if (checkAuthAndShowModal(redirectUrl)) {
      callback();
    }
  }, [checkAuthAndShowModal]);

  return {
    isAuthenticated,
    isLoading,
    checkAuthAndShowModal,
    withAuthCheck,
    showLoginModal,
    setShowLoginModal
  };
}
