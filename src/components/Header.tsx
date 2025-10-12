/**
 * Navigation Header Component
 * 
 * This component provides the main navigation header with credit balance display.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreditIcon, UserIcon, LogOutIcon, SettingsIcon } from '@/components/ui/icons';
import { LanguagePopover } from '@/components/LanguagePopover';
import { logger, LogCategory } from '@/lib/utils/logger';
import { useAuth, useAuthListener } from '@/lib/auth/auth-context';

interface HeaderProps {
  className?: string;
}

interface UserData {
  id: string;
  nickname: string;
  avatar_url: string;
}

interface CreditData {
  balance: number;
  updated_at: string;
}

export function Header({ className }: HeaderProps) {
  const t = useTranslations('Common');
  const router = useRouter();
  const pathname = usePathname();
  const { authState, refreshAuthState, clearAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);

  // 监听认证状态变化
  useAuthListener((event) => {
    logger.auth(`Header received auth event: ${event}`);
    if (event === 'login' || event === 'register') {
      refreshAuthState();
    } else if (event === 'logout') {
      clearAuthState();
    } else if (event === 'refresh') {
      // 积分更新时显示动画
      setIsUpdatingCredits(true);
      setTimeout(() => setIsUpdatingCredits(false), 1000);
    }
  });

  // 监听页面滚动
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          setIsScrolled(scrollTop > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 使用全局认证状态
  const { user, credits, isAuthenticated, isLoading } = authState;

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        localStorage.removeItem('loginRedirectUrl'); // 清除重定向URL
        
        // Clear global auth state
        clearAuthState();
        
        // 强制刷新页面以确保所有状态都被清除
        window.location.href = '/auth/login';
        
        logger.auth('User logged out from header');
      }
    } catch (err) {
      logger.error('Failed to logout from header', undefined, LogCategory.API);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getCreditStatus = (balance: number) => {
    if (balance < 20) {
      return { status: 'low', color: 'destructive', icon: '⚠️' };
    } else if (balance < 100) {
      return { status: 'medium', color: 'warning', icon: '⚡' };
    } else {
      return { status: 'high', color: 'success', icon: '✅' };
    }
  };

  const isActivePath = (path: string) => {
    return pathname.startsWith(path);
  };

  if (isLoading) {
    return (
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-200/20 transition-all duration-300 ease-in-out ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded animate-pulse" style={{ height: '48px', width: '60px' }} />
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-200/20' 
        : 'bg-white border-b border-gray-200'
    } ${className}`}>
      <div className="w-full">
        <div className="flex items-center justify-between h-16">
          {/* Logo区域 - 完全左对齐，无左侧留白 */}
          <div className="flex items-center pl-2 sm:pl-4 lg:pl-8">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="AI Writing Assistant Logo"
                style={{ height: '40px', width: 'auto' }}
                className="object-contain"
              />
              <span
                className="ml-3 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-purple-700"
                style={{ 
                  lineHeight: '1.2',
                  letterSpacing: '0.025em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25), 0 2px 4px 0 rgba(0,0,0,0.1)'
                }}
              >
                AI 文秘
              </span>
            </div>
          </div>

          {/* 导航区域 - 居中 */}
          <nav className="hidden md:flex items-center space-x-8 px-4">
            <button
              onClick={() => handleNavigation('/')}
              className={`text-sm font-medium transition-colors ${
                isActivePath('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('aiWriting')}
            </button>
            
            <button
              onClick={() => handleNavigation('/ai-image-generation')}
              className={`text-sm font-medium transition-colors ${
                isActivePath('/ai-image-generation') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('aiImage')}
            </button>
            
            <button
              onClick={() => handleNavigation('/pricing')}
              className={`text-sm font-medium transition-colors ${
                isActivePath('/pricing') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('credits')}
            </button>
            
            <button
              onClick={() => handleNavigation('/about')}
              className={`text-sm font-medium transition-colors ${
                isActivePath('/about') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('about')}
            </button>
          </nav>

          {/* 个人信息区域 - 右对齐 */}
          <div className="flex items-center space-x-2 sm:space-x-4 pr-2 sm:pr-4 lg:pr-8">
            {/* 语种切换按钮 */}
            <LanguagePopover />
            
            {isAuthenticated && user && credits ? (
              <>
                {/* 积分显示 - 融合样式 - 手机端隐藏 */}
                <div className={`hidden sm:flex items-center space-x-2 rounded-lg px-3 py-1.5 transition-all duration-300 ${
                  getCreditStatus(credits.balance).color === 'default' 
                    ? 'bg-gray-100 text-gray-700' 
                    : getCreditStatus(credits.balance).color === 'destructive'
                    ? 'bg-red-100 text-red-700'
                    : getCreditStatus(credits.balance).color === 'secondary'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                } ${isUpdatingCredits ? 'animate-pulse bg-blue-100 text-blue-700' : ''}`}>
                  <CreditIcon className={`h-4 w-4 ${isUpdatingCredits ? 'animate-spin' : ''}`} />
                  <span className={`text-sm font-medium ${isUpdatingCredits ? 'animate-pulse' : ''}`}>
                    {credits.balance.toLocaleString()}
                  </span>
                  {isUpdatingCredits && (
                    <span className="text-xs text-blue-600 animate-pulse">{t('updating')}</span>
                  )}
                </div>

                {/* 个人信息菜单 - 优化版本 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-9 w-auto px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} alt={user.nickname} />
                          <AvatarFallback className="text-sm">{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1" 
                    align="end" 
                    forceMount
                    sideOffset={8}
                  >
                    {/* 用户信息头部 */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mb-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} alt={user.nickname} />
                        <AvatarFallback className="text-sm font-medium">{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-gray-900">{user.nickname}</p>
                        <p className="text-sm text-gray-600">
                          {credits.balance.toLocaleString()} {t('credits')}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    {/* 菜单项 */}
                    <DropdownMenuItem 
                      onClick={() => handleNavigation('/profile')}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>{t('profile')}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleNavigation('/credits')}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150"
                    >
                      <CreditIcon className="h-4 w-4" />
                      <span>{t('manageCredits')}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => handleNavigation('/settings')}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      <span>{t('settings')}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="my-2" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md cursor-pointer transition-colors duration-150"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleNavigation('/auth/login')}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  {t('login')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;