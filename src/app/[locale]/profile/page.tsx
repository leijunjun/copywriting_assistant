/**
 * User Profile Page
 * 
 * This page displays the user's profile information and credit balance.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/components/auth/UserProfile';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { LowCreditWarning } from '@/components/credits/LowCreditWarning';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
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

export default function ProfilePage() {
  const t = useTranslations('Common');
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      const data = await response.json();

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
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        
        // Redirect to login page
        router.push('/auth/login');
        
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorMessage message={error} />
          <Button onClick={fetchUserProfile} variant="outline" className="mt-4">
            {t('retry')}
          </Button>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('profile')}
          </h1>
          <p className="text-gray-600">
            {t('profileDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <UserProfile
            user={user}
            onLogout={handleLogout}
          />

          {/* Credit Balance Card */}
          <CreditBalance
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
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
              >
                <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-700">{t('aiCreation')}</span>
              </Button>
              
              <Button
                onClick={() => router.push('/credits')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-colors group"
              >
                <svg className="w-6 h-6 text-green-600 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-700">{t('manageCredits')}</span>
              </Button>
              
              <Button
                onClick={() => router.push('/credits/history')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300 transition-colors group"
              >
                <svg className="w-6 h-6 text-purple-600 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-700">{t('rechargeHistory')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}