/**
 * Register Page
 * 
 * This page provides the registration interface with email/password authentication.
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/lib/auth/auth-context';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { triggerAuthEvent } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [industry, setIndustry] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          nickname: nickname || email.split('@')[0],
          industry
        }),
      });

      const data = await response.json();

      if (data.success) {
        logger.auth('User registered successfully', {
          userId: data.user.id,
        });
        
        // Store session data
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('session', JSON.stringify(data.session));
        
        // Trigger auth event to update header state
        triggerAuthEvent('register');
        
        // Redirect to profile page
        router.push('/profile');
      } else {
        // Handle error response structure
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Registration failed';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      logger.error('Registration failed', err, 'AUTH');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome')}
          </h1>
          <p className="text-gray-600">
            {t('registerDescription')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t('register')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <ErrorMessage message={error} />
              )}

              <div className="space-y-2">
                <Label htmlFor="nickname">{t('nickname')}</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('nicknamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">{t('industry')}</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectIndustry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('general')}</SelectItem>
                    <SelectItem value="housekeeping">{t('housekeeping')}</SelectItem>
                    <SelectItem value="beauty">{t('beauty')}</SelectItem>
                    <SelectItem value="lifestyle-beauty">{t('lifestyle-beauty')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
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
                    <span>{t('registering')}</span>
                  </div>
                ) : (
                  t('register')
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {t('haveAccount')}{' '}
                <button
                  onClick={handleLogin}
                  className="text-blue-600 hover:underline"
                >
                  {t('login')}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          {t('needHelp')} <a href="/help" className="text-blue-600 hover:underline">{t('contactSupport')}</a>
        </div>
      </div>
    </div>
  );
}