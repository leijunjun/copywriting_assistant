/**
 * Login Page
 * 
 * This page provides the login interface with WeChat OAuth integration.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeChatLoginModal } from '@/components/auth/WeChatLoginModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger } from '@/lib/utils/logger';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        // User is already authenticated, redirect to profile
        router.push('/profile');
      }
    } catch (err) {
      // User is not authenticated, stay on login page
      logger.debug('User not authenticated', { error: err });
    }
  };

  const handleWeChatLogin = () => {
    setShowWeChatModal(true);
  };

  const handleWeChatSuccess = (user: any, session: any) => {
    logger.auth('User logged in successfully', {
      userId: user.id,
      openid: user.wechat_openid,
    });
    
    // Store session data
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('session', JSON.stringify(session));
    
    // Redirect to profile page
    router.push('/profile');
  };

  const handleWeChatError = (error: string) => {
    setError(error);
    logger.error('WeChat login failed', new Error(error), 'AUTH');
  };

  const handleCloseModal = () => {
    setShowWeChatModal(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome')}
          </h1>
          <p className="text-gray-600">
            {t('loginDescription')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t('login')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <ErrorMessage message={error} />
            )}

            <div className="space-y-4">
              <Button
                onClick={handleWeChatLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📱</span>
                  <span>{t('wechatLogin')}</span>
                </div>
              </Button>

              <div className="text-center text-sm text-gray-500">
                {t('loginInstructions')}
              </div>
            </div>

            <div className="text-center text-xs text-gray-400">
              {t('privacyNotice')}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          {t('needHelp')} <a href="/help" className="text-blue-600 hover:underline">{t('contactSupport')}</a>
        </div>
      </div>

      <WeChatLoginModal
        isOpen={showWeChatModal}
        onClose={handleCloseModal}
        onSuccess={handleWeChatSuccess}
      />
    </div>
  );
}
