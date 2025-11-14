/**
 * Login Page
 * 
 * This page provides the login interface with email/password authentication.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger, LogCategory } from '@/lib/utils/logger';
import { useAuth } from '@/lib/auth/auth-context';
import { WeChatModal } from '@/components/ui/wechat-modal';
import { identifyAuthType } from '@/lib/utils/auth-identifier';
import { setLocalStorageItem } from '@/lib/utils/localStorage';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { triggerAuthEvent } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 记录来路页面
  useEffect(() => {
    // 检查是否已经有存储的跳转URL（由其他组件设置，如 useAuthCheck）
    const existingRedirectUrl = localStorage.getItem('loginRedirectUrl');
    if (existingRedirectUrl) {
      return; // 如果已有，不覆盖
    }

    // 优先使用 URL 参数中的 redirect
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      // 验证 redirect 参数是否为有效的相对路径
      try {
        const url = new URL(redirectParam, window.location.origin);
        // 只允许同源的相对路径
        if (url.origin === window.location.origin) {
          const redirectPath = url.pathname + url.search + url.hash;
          if (isValidRedirectPath(redirectPath)) {
            localStorage.setItem('loginRedirectUrl', redirectPath);
            return;
          }
        }
      } catch (e) {
        // 如果 redirect 参数是相对路径，直接使用
        if (isValidRedirectPath(redirectParam)) {
          localStorage.setItem('loginRedirectUrl', redirectParam);
          return;
        }
      }
    }

    // 如果没有 URL 参数，检查 referrer
    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        // 只处理同源的 referrer
        if (referrerUrl.origin === window.location.origin) {
          const referrerPath = referrerUrl.pathname + referrerUrl.search + referrerUrl.hash;
          if (isValidRedirectPath(referrerPath)) {
            localStorage.setItem('loginRedirectUrl', referrerPath);
          }
        }
      } catch (e) {
        // 忽略无效的 referrer URL
      }
    }
  }, [searchParams]);

  // 验证跳转路径是否有效（排除登录、注册等页面）
  const isValidRedirectPath = (path: string): boolean => {
    if (!path || path === '/') {
      return false;
    }
    
    // 排除认证相关页面（考虑国际化前缀，如 /zh/auth/login）
    const excludedPatterns = [
      /\/auth\/login/i,
      /\/auth\/register/i,
      /\/auth\/success/i,
      /\/auth\/callback/i,
      /\/admin\/login/i,
    ];
    
    // 检查是否匹配排除的模式
    for (const pattern of excludedPatterns) {
      if (pattern.test(path)) {
        return false;
      }
    }
    
    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate identifier (email or phone)
    const authType = identifyAuthType(identifier);
    if (!authType) {
      setError('Please enter a valid email address or phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: identifier, password }), // Keep 'email' field name for backward compatibility
      });

      const data = await response.json();

      if (data.success) {
        logger.auth('User logged in successfully', {
          userId: data.user.id,
        });
        
        // 先清除可能存在的旧数据，确保状态干净
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        
        // Store session data - 使用 setLocalStorageItem 触发事件
        setLocalStorageItem('user', JSON.stringify(data.user));
        setLocalStorageItem('session', JSON.stringify(data.session));
        
        // Trigger auth event to update header state
        triggerAuthEvent('login');
        
        // 等待一小段时间确保状态更新完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
                <Label htmlFor="identifier">邮箱 / 手机号</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('emailPlaceholder') || 'Email or phone number'}
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