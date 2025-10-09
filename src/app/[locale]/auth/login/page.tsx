/**
 * Login Page
 * 
 * This page provides the login interface with email/password authentication.
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger, LogCategory } from '@/lib/utils/logger';
import { useAuth } from '@/lib/auth/auth-context';
import { WeChatModal } from '@/components/ui/wechat-modal';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { triggerAuthEvent } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        logger.auth('User logged in successfully', {
          userId: data.user.id,
        });
        
        // Store session data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('session', JSON.stringify(data.session));
        
        // Trigger auth event to update header state
        triggerAuthEvent('login');
        
        // Check if there's a redirect URL stored
        const redirectUrl = localStorage.getItem('loginRedirectUrl');
        if (redirectUrl) {
          // Clear the stored redirect URL
          localStorage.removeItem('loginRedirectUrl');
          // Redirect to the original page
          router.push(redirectUrl);
        } else {
          // Redirect to profile page as default
          router.push('/profile');
        }
      } else {
        // Handle error response structure
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Login failed';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      logger.error('Login failed', undefined, LogCategory.AUTH);
    } finally {
      setLoading(false);
    }
  };

  const [showWeChatModal, setShowWeChatModal] = useState(false);

  const handleContactSupport = () => {
    setShowWeChatModal(true);
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
          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <ErrorMessage message={error} />
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>{t('loggingIn')}</span>
                  </div>
                ) : (
                  t('login')
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          {t('needHelp')} <button onClick={handleContactSupport} className="text-blue-600 hover:underline">{t('contactSupport')}</button>
        </div>
      </div>
      
      <WeChatModal 
        isOpen={showWeChatModal} 
        onClose={() => setShowWeChatModal(false)} 
      />
    </div>
  );
}