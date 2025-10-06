/**
 * Transaction History Page
 * 
 * This page displays the user's complete credit transaction history with filtering and export options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionHistory } from '@/components/credits/TransactionHistory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger } from '@/lib/utils/logger';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'deduction' | 'bonus' | 'refund' | 'recharge';
  description: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function TransactionHistoryPage() {
  const t = useTranslations('Credits');
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTransactionHistory();
  }, [filter, currentPage]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/credits/history?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch transaction history');
      }

      if (currentPage === 1) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])]);
      }
      
      setPagination(data.pagination);

      logger.api('Transaction history fetched successfully', {
        transactionCount: data.transactions?.length || 0,
        filter,
        page: currentPage,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction history';
      setError(errorMessage);
      logger.error('Failed to fetch transaction history', err, 'API');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
    setTransactions([]);
  };

  const handleLoadMore = () => {
    if (pagination && pagination.has_next) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/credits/history/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credit-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      logger.credits('Transaction history exported', {
        transactionCount: transactions.length,
        filter,
      });
    } catch (err) {
      logger.error('Failed to export transaction history', err, 'API');
    }
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'all':
        return t('allTypes');
      case 'deduction':
        return t('deductions');
      case 'bonus':
        return t('bonuses');
      case 'refund':
        return t('refunds');
      case 'recharge':
        return t('recharges');
      default:
        return t('allTypes');
    }
  };

  if (loading && transactions.length === 0) {
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
          <Button onClick={fetchTransactionHistory} variant="outline" className="mt-4">
            {t('retry')}
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
            {t('transactionHistory')}
          </h1>
          <p className="text-gray-600">
            {t('transactionHistoryDescription')}
          </p>
        </div>

        {/* Filter and Export Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>{t('filters')}</span>
                <span className="text-sm text-muted-foreground">
                  ({getFilterLabel(filter)})
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button onClick={handleExport} variant="outline" size="sm">
                  {t('export')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="deduction">{t('deductions')}</SelectItem>
                  <SelectItem value="bonus">{t('bonuses')}</SelectItem>
                  <SelectItem value="refund">{t('refunds')}</SelectItem>
                  <SelectItem value="recharge">{t('recharges')}</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-muted-foreground">
                {pagination && (
                  <span>
                    {t('showing')} {transactions.length} {t('of')} {pagination.total} {t('transactions')}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <TransactionHistory
          transactions={transactions}
          pagination={pagination}
          onLoadMore={handleLoadMore}
          onFilter={handleFilterChange}
        />

        {/* Load More Button */}
        {pagination && pagination.has_next && (
          <div className="flex justify-center">
            <Button 
              onClick={handleLoadMore} 
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t('loading')}
                </>
              ) : (
                t('loadMore')
              )}
            </Button>
          </div>
        )}

        {/* No Transactions Message */}
        {transactions.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">
                {t('noTransactions')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('noTransactionsDescription')}
              </p>
              <Button onClick={() => router.push('/credits')}>
                {t('manageCredits')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
