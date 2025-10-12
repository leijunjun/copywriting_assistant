/**
 * Credit Balance Display Component
 * 
 * This component displays the user's current credit balance.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { CreditIcon, RechargeIcon } from '@/components/ui/icons';
import { logger } from '@/lib/utils/logger';

interface CreditBalanceProps {
  balance: number;
  onRecharge: () => void;
  showWarning?: boolean;
  className?: string;
}

interface CreditBalanceData {
  balance: number;
  updated_at: string;
}

export function CreditBalance({ balance, onRecharge, showWarning, className }: CreditBalanceProps) {
  const t = useTranslations('Credits');
  const [creditData, setCreditData] = useState<CreditBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditBalance();
  }, []);

  const fetchCreditBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch credit balance');
      }

      setCreditData({
        balance: data.credits.balance,
        updated_at: data.credits.updated_at,
      });

      logger.api('Credit balance fetched successfully', {
        balance: data.credits.balance,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch credit balance';
      setError(errorMessage);
      logger.error('Failed to fetch credit balance', err, 'API');
    } finally {
      setLoading(false);
    }
  };

  const getBalanceStatus = (balance: number) => {
    if (balance < 20) {
      return { status: 'low', color: 'destructive' };
    } else if (balance < 100) {
      return { status: 'medium', color: 'warning' };
    } else {
      return { status: 'high', color: 'success' };
    }
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <ErrorMessage message={error} />
          <Button onClick={fetchCreditBalance} variant="outline" size="sm" className="mt-2">
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = creditData?.balance || balance;
  const balanceStatus = getBalanceStatus(currentBalance);

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span>{t('currentBalance')}</span>
          <Badge variant={balanceStatus.color as any} className="text-xs font-bold px-3 py-1">
            {balanceStatus.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="relative">
            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {formatBalance(currentBalance)}
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600">
            {t('credits')}
          </p>
        </div>

        {showWarning && currentBalance < 20 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-orange-700">
                {t('lowBalanceWarning')}
              </p>
            </div>
          </div>
        )}

        {creditData && (
          <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-3">
            {t('lastUpdated')} {formatDate(creditData.updated_at)}
          </div>
        )}

        <div className="flex space-x-3">
          <Button 
            onClick={onRecharge} 
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RechargeIcon className="h-4 w-4 mr-2" />
            {t('recharge')}
          </Button>
          <Button 
            onClick={fetchCreditBalance} 
            variant="outline" 
            size="sm"
            className="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition-all duration-300"
          >
            {t('refresh')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreditBalance;
