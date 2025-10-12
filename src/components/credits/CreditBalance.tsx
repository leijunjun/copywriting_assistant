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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{t('currentBalance')}</span>
          <Badge variant={balanceStatus.color as any}>
            {balanceStatus.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {formatBalance(currentBalance)}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('credits')}
          </p>
        </div>

        {showWarning && currentBalance < 20 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-warning">
                {t('lowBalanceWarning')}
              </p>
            </div>
          </div>
        )}

        {creditData && (
          <div className="text-center text-xs text-muted-foreground">
            {t('lastUpdated')} {formatDate(creditData.updated_at)}
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={onRecharge} className="flex-1">
            <RechargeIcon className="h-4 w-4 mr-2" />
            {t('recharge')}
          </Button>
          <Button onClick={fetchCreditBalance} variant="outline" size="sm">
            {t('refresh')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreditBalance;
