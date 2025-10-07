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

  // 监听认证状态变化
  useAuthListener((event) => {
    logger.auth(`Header received auth event: ${event}`);
    if (event === 'login' || event === 'register') {
      refreshAuthState();
    } else if (event === 'logout') {
      clearAuthState();
    }
  });

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
        
        // Clear global auth state
        clearAuthState();
        
        // Redirect to login page
        router.push('/auth/login');
        
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
      <header className={`bg-white border-b border-gray-200 ${className}`}>
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
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="AI Writing Assistant Logo"
                style={{ height: '40px', width: 'auto' }}
                className="object-contain"
              />
              <span
                className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700"
                style={{ lineHeight: '1.5' }}
              >
                AI 文秘
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => handleNavigation('/')}
                className={`text-sm font-medium transition-colors ${
                  isActivePath('/') 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('home')}
              </button>
              
              {isAuthenticated && user && (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className={`text-sm font-medium transition-colors ${
                      isActivePath('/profile') 
                        ? 'text-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('profile')}
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/credits')}
                    className={`text-sm font-medium transition-colors ${
                      isActivePath('/credits') 
                        ? 'text-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('credits')}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* User Menu and Credit Balance */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguagePopover />
            
            {isAuthenticated && user && credits ? (
              <>
                {/* Credit Balance */}
                <div className="flex items-center space-x-2">
                  <CreditIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {credits.balance.toLocaleString()}
                  </span>
                  <Badge variant={getCreditStatus(credits.balance).color as any}>
                    {getCreditStatus(credits.balance).icon}
                  </Badge>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} alt={user.nickname} />
                        <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.nickname}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {credits.balance.toLocaleString()} {t('credits')}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>{t('profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/credits')}>
                      <CreditIcon className="mr-2 h-4 w-4" />
                      <span>{t('manageCredits')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>{t('settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOutIcon className="mr-2 h-4 w-4" />
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