/**
 * Credit Management Page
 * 
 * This page provides credit management functionality including balance display and recharge options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { LowCreditWarning } from '@/components/credits/LowCreditWarning';
import { TransactionHistory } from '@/components/credits/TransactionHistory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger } from '@/lib/utils/logger';

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

export default function CreditsPage() {
  const t = useTranslations('Credits');
  const router = useRouter();
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchCreditData();
  }, []);

  useEffect(() => {
    if (credits) {
      fetchTransactionHistory();
    }
  }, [credits, filter]);

  const fetchCreditData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch credit data');
      }

      setCredits(data.credits);

      logger.api('Credit data fetched successfully', {
        balance: data.credits.balance,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch credit data';
      setError(errorMessage);
      logger.error('Failed to fetch credit data', err, 'API');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      params.append('limit', '10');

      const response = await fetch(`/api/credits/history?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      logger.error('Failed to fetch transaction history', err, 'API');
    }
  };

  const handleRecharge = () => {
    // In a real implementation, this would open a recharge modal or redirect to payment page
    logger.credits('Recharge requested', {
      currentBalance: credits?.balance || 0,
    });
    // For now, just show an alert
    alert(t('rechargeNotImplemented'));
  };

  const handleLoadMore = () => {
    fetchTransactionHistory();
  };

  const handleFilter = (type: string) => {
    setFilter(type);
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
          <Button onClick={fetchCreditData} variant="outline" className="mt-4">
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('creditsNotFound')}
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
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('creditManagement')}
          </h1>
          <p className="text-gray-600">
            {t('creditManagementDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credit Balance Card */}
          <div className="lg:col-span-1">
            <CreditBalance
              balance={credits.balance}
              onRecharge={handleRecharge}
              showWarning={credits.balance < 20}
            />
          </div>

          {/* Transaction History Card */}
          <div className="lg:col-span-2">
            <TransactionHistory
              transactions={transactions}
              onLoadMore={handleLoadMore}
              onFilter={handleFilter}
            />
          </div>
        </div>

        {/* Low Credit Warning */}
        {credits.balance < 20 && (
          <LowCreditWarning
            balance={credits.balance}
            onRecharge={handleRecharge}
          />
        )}

        {/* Credit Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('creditInformation')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">{t('howCreditsWork')}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t('creditUsage1')}</li>
                  <li>• {t('creditUsage2')}</li>
                  <li>• {t('creditUsage3')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('creditPricing')}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t('pricing1')}</li>
                  <li>• {t('pricing2')}</li>
                  <li>• {t('pricing3')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
