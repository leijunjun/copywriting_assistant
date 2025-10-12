/**
 * User Profile Page
 * 
 * This page displays the user's profile information and credit balance.
 */

'use client';

import React, { useState, useEffect, memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/components/auth/UserProfile';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { LowCreditWarning } from '@/components/credits/LowCreditWarning';
import { ProfilePageSkeleton, LoadingIndicator, PageLoadingOverlay } from '@/components/ui/loading-skeleton';
import { logger } from '@/lib/utils/logger';

interface UserData {
  id: string;
  wechat_openid: string;
  wechat_unionid?: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface CreditData {
  balance: number;
  updated_at: string;
}

// 优化的用户资料组件
const OptimizedUserProfile = memo(({ user, onLogout }: { user: UserData; onLogout: () => void }) => {
  return <UserProfile user={user} onLogout={onLogout} />;
});

OptimizedUserProfile.displayName = 'OptimizedUserProfile';

// 优化的积分余额组件
const OptimizedCreditBalance = memo(({ 
  balance, 
  onRecharge, 
  showWarning 
}: { 
  balance: number; 
  onRecharge: () => void; 
  showWarning: boolean; 
}) => {
  return <CreditBalance balance={balance} onRecharge={onRecharge} showWarning={showWarning} />;
});

OptimizedCreditBalance.displayName = 'OptimizedCreditBalance';

export default function ProfilePage() {
  const t = useTranslations('Common');
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      // 模拟加载进度
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/user/profile');
      const data = await response.json();

      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (!data.success) {
        if (response.status === 401) {
          // User not authenticated, redirect to login
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      setUser(data.user);
      setCredits(data.credits);

      logger.api('User profile fetched successfully', {
        userId: data.user.id,
        balance: data.credits.balance,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user profile';
      setError(errorMessage);
      logger.error('Failed to fetch user profile', err, 'API');
    } finally {
      setLoading(false);
    }
  }, [router]);

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
        
        // 强制刷新页面以确保所有状态都被清除
        window.location.href = '/auth/login';
        
        logger.auth('User logged out successfully');
      }
    } catch (err) {
      logger.error('Failed to logout', err, 'API');
    }
  };

  const handleRecharge = () => {
    router.push('/credits');
  };

  if (loading) {
    return (
      <>
        <ProfilePageSkeleton />
        <PageLoadingOverlay 
          message="正在加载个人资料..." 
          showProgress={true}
          progress={loadingProgress}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-lg font-medium mb-2">
              加载失败
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={fetchUserProfile}
              className="w-full"
              variant="outline"
            >
              {t('retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !credits) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('profileNotFound')}
          </h1>
          <Button onClick={() => router.push('/auth/login')}>
            {t('login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {t('profile')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('profileDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <OptimizedUserProfile
            user={user}
            onLogout={handleLogout}
          />

          {/* Credit Balance Card */}
          <OptimizedCreditBalance
            balance={credits.balance}
            onRecharge={handleRecharge}
            showWarning={credits.balance < 20}
          />
        </div>

        {/* Low Credit Warning */}
        {credits.balance < 20 && (
          <LowCreditWarning
            balance={credits.balance}
            onRecharge={handleRecharge}
          />
        )}

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>{t('quickActions')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:border-blue-300 transition-all duration-300 group shadow-md hover:shadow-lg relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-600/40 group-hover:from-blue-400/40 group-hover:to-indigo-600/50 transition-all duration-300"></div>
                <span className="text-lg font-bold text-white drop-shadow-2xl relative z-10 text-center px-2">{t('aiCreation')}</span>
              </Button>
              
              <Button
                onClick={() => router.push('/ai-image-generation')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:border-pink-300 transition-all duration-300 group shadow-md hover:shadow-lg relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-600 to-red-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-red-600/40 group-hover:from-pink-400/40 group-hover:to-red-600/50 transition-all duration-300"></div>
                <span className="text-lg font-bold text-white drop-shadow-2xl relative z-10 text-center px-2">AI 出图</span>
              </Button>
              
              <Button
                onClick={() => router.push('/credits')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:border-green-300 transition-all duration-300 group shadow-md hover:shadow-lg relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-teal-600/40 group-hover:from-green-400/40 group-hover:to-teal-600/50 transition-all duration-300"></div>
                <span className="text-lg font-bold text-white drop-shadow-2xl relative z-10 text-center px-2">{t('manageCredits')}</span>
              </Button>
              
              <Button
                onClick={() => router.push('/credits/history')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-3 hover:border-purple-300 transition-all duration-300 group shadow-md hover:shadow-lg relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-indigo-600/40 group-hover:from-purple-400/40 group-hover:to-indigo-600/50 transition-all duration-300"></div>
                <span className="text-lg font-bold text-white drop-shadow-2xl relative z-10 text-center px-2">{t('rechargeHistory')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}