/**
 * Protected Route Wrapper Component
 * 
 * This component provides route protection and authentication checks.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger } from '@/lib/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireCredits?: number;
  className?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: any | null;
  credits: any | null;
}

export function ProtectedRoute({ 
  children, 
  fallback, 
  redirectTo = '/auth/login',
  requireAuth = true,
  requireCredits,
  className 
}: ProtectedRouteProps) {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
    credits: null,
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            user: data.user,
            credits: data.credits,
          });

          // Check credit requirements
          if (requireCredits && data.credits.balance < requireCredits) {
            setAuthState(prev => ({
              ...prev,
              error: t('insufficientCredits', { required: requireCredits }),
            }));
          }

          logger.auth('User authentication verified', {
            userId: data.user.id,
            balance: data.credits.balance,
          });
        } else {
          throw new Error(data.error || 'Authentication failed');
        }
      } else if (response.status === 401) {
        // User not authenticated
        if (requireAuth) {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            error: t('authenticationRequired'),
          }));
          
          // Redirect to login page
          setTimeout(() => {
            router.push(redirectTo);
          }, 2000);
        } else {
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          }));
        }
      } else {
        throw new Error('Failed to check authentication');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication check failed';
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      }));

      logger.error('Authentication check failed', err, 'AUTH');
    }
  };

  const handleRetry = () => {
    checkAuthentication();
  };

  const handleLogin = () => {
    router.push(redirectTo);
  };

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">
            {t('checkingAuthentication')}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (authState.error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="max-w-md w-full space-y-4">
          <ErrorMessage 
            message={authState.error}
            onRetry={handleRetry}
          />
          
          {!authState.isAuthenticated && (
            <div className="text-center">
              <button
                onClick={handleLogin}
                className="text-blue-600 hover:underline"
              >
                {t('goToLogin')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show insufficient credits error
  if (requireCredits && authState.credits && authState.credits.balance < requireCredits) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="max-w-md w-full space-y-4">
          <ErrorMessage 
            message={t('insufficientCredits', { required: requireCredits })}
            onRetry={handleRetry}
          />
          
          <div className="text-center">
            <button
              onClick={() => router.push('/credits')}
              className="text-blue-600 hover:underline"
            >
              {t('manageCredits')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback for unauthenticated users when auth is not required
  if (!requireAuth && !authState.isAuthenticated) {
    return fallback || null;
  }

  // Show children for authenticated users
  if (authState.isAuthenticated) {
    return <>{children}</>;
  }

  // Default fallback
  return fallback || null;
}

export default ProtectedRoute;
