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
                onClick={() => router.push('/credits')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">💰</span>
                <span>{t('manageCredits')}</span>
              </Button>
              
              <Button
                onClick={() => router.push('/credits/history')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">📊</span>
                <span>{t('transactionHistory')}</span>
              </Button>
              
              <Button
                onClick={() => router.push('/settings')}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">⚙️</span>
                <span>{t('settings')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}