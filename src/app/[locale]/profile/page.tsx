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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserProfile } from '@/components/auth/UserProfile';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { TransactionHistory } from '@/components/credits/TransactionHistory';
import { ProfilePageSkeleton, LoadingIndicator, PageLoadingOverlay } from '@/components/ui/loading-skeleton';
import { logger } from '@/lib/utils/logger';
import { clearLocalStorageItems } from '@/lib/utils/localStorage';
import { useAuth } from '@/lib/auth/auth-context';
import Image from 'next/image';

interface UserData {
  id: string;
  email?: string | null;
  phone?: string | null;
  wechat_openid?: string;
  wechat_unionid?: string;
  nickname: string;
  avatar_url: string;
  industry?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

interface CreditData {
  balance: number;
  updated_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'deduction' | 'bonus' | 'refund' | 'recharge';
  description: string;
  created_at: string;
}

type ProfileTab = 'account' | 'credits' | 'services';

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
  const { clearAuthState, triggerAuthEvent } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [transactionPagination, setTransactionPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);

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
      // 先清除全局状态，确保UI立即更新
      clearAuthState();
      
      // 然后调用登出API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      });

      if (response.ok) {
        // Clear local storage using utility function that triggers events
        clearLocalStorageItems(['user', 'session', 'loginRedirectUrl']);
        
        // 再次确保状态清除（防止竞态条件）
        clearAuthState();
        
        // 触发logout事件，确保所有组件都能收到通知
        triggerAuthEvent('logout');
        
        // 使用router.push而不是强制刷新，让React处理状态更新
        router.push('/auth/login');
        
        logger.auth('User logged out successfully');
      } else {
        // 即使API失败，也清除本地状态
        clearLocalStorageItems(['user', 'session', 'loginRedirectUrl']);
        clearAuthState();
        triggerAuthEvent('logout');
        router.push('/auth/login');
      }
    } catch (err) {
      // 即使出错，也清除本地状态
      clearLocalStorageItems(['user', 'session', 'loginRedirectUrl']);
      clearAuthState();
      triggerAuthEvent('logout');
      router.push('/auth/login');
      logger.error('Failed to logout', err, 'API');
    }
  };

  const handleRecharge = () => {
    // 显示充值提示模态框
    setRechargeDialogOpen(true);
  };

  const fetchTransactionHistory = useCallback(async (page: number = 1) => {
    try {
      const params = new URLSearchParams();
      if (transactionFilter !== 'all') {
        params.append('type', transactionFilter);
      }
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/credits/history?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setTransactionPagination(data.pagination);
      }
    } catch (err) {
      logger.error('Failed to fetch transaction history', err, 'API');
    }
  }, [transactionFilter]);

  useEffect(() => {
    if (activeTab === 'credits' && credits) {
      fetchTransactionHistory();
    }
  }, [activeTab, credits, fetchTransactionHistory]);

  const handleTransactionFilter = (type: string) => {
    setTransactionFilter(type);
    fetchTransactionHistory(1);
  };

  const handleTransactionPageChange = (page: number) => {
    fetchTransactionHistory(page);
  };

  const handleTransactionLoadMore = () => {
    if (transactionPagination && transactionPagination.has_next) {
      fetchTransactionHistory(transactionPagination.page + 1);
    }
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
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧导航栏 */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === 'account'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{t('accountInfo')}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('credits')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === 'credits'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-medium">{t('creditManagement')}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === 'services'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">{t('productServiceSettings')}</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
        </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 min-w-0">
            {activeTab === 'account' && (
              <div className="space-y-6">
          <OptimizedUserProfile
            user={user}
            onLogout={handleLogout}
          />
              </div>
            )}

            {activeTab === 'credits' && (
              <div className="space-y-6">
          {/* Credit Balance Card */}
          <OptimizedCreditBalance
            balance={credits.balance}
            onRecharge={handleRecharge}
            showWarning={credits.balance < 20}
          />

                {/* Transaction History Card */}
                <TransactionHistory
                  transactions={transactions}
                  pagination={transactionPagination}
                  onLoadMore={handleTransactionLoadMore}
                  onFilter={handleTransactionFilter}
                  onPageChange={handleTransactionPageChange}
                />
              </div>
            )}

            {activeTab === 'services' && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-lg font-medium">{t('productServiceSettings')}</p>
                    <p className="text-sm mt-2">{t('productServiceSettingsDescription')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>

      {/* 充值提示模态框 */}
      <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t('recharge')}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t('rechargeInviteOnly')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <p className="text-sm font-medium text-gray-700">{t('adminWeChat')}</p>
              <div className="relative w-48 h-48 bg-white rounded-lg p-2 shadow-md">
                <Image
                  src="/weixin.png"
                  alt="管理员微信"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
              <Button
              onClick={() => setRechargeDialogOpen(false)}
              className="px-6"
              >
              {t('close')}
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}