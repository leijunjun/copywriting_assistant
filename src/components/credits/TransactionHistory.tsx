/**
 * Transaction History Component
 * 
 * This component displays the user's credit transaction history.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HistoryIcon, FilterIcon, DownloadIcon } from '@/components/ui/icons';
import { logger } from '@/lib/utils/logger';

interface TransactionHistoryProps {
  transactions: Array<{
    id: string;
    amount: number;
    transaction_type: 'deduction' | 'bonus' | 'refund' | 'recharge';
    description: string;
    created_at: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  onLoadMore: () => void;
  onFilter: (type: string) => void;
  className?: string;
}

interface TransactionHistoryData {
  transactions: TransactionHistoryProps['transactions'];
  pagination: TransactionHistoryProps['pagination'];
}

export function TransactionHistory({ 
  transactions, 
  pagination, 
  onLoadMore, 
  onFilter, 
  className 
}: TransactionHistoryProps) {
  const t = useTranslations('Credits');
  const [historyData, setHistoryData] = useState<TransactionHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactionHistory();
  }, [filter]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }

      const response = await fetch(`/api/credits/history?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transaction history');
      }

      setHistoryData({
        transactions: data.transactions,
        pagination: data.pagination,
      });

      logger.api('Transaction history fetched successfully', {
        transactionCount: data.transactions.length,
        filter,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction history';
      setError(errorMessage);
      logger.error('Failed to fetch transaction history', err, 'API');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'deduction' ? '-' : '+';
    return `${sign}${Math.abs(amount).toLocaleString()}`;
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deduction':
        return 'destructive';
      case 'bonus':
        return 'success';
      case 'refund':
        return 'warning';
      case 'recharge':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deduction':
        return '💸';
      case 'bonus':
        return '🎁';
      case 'refund':
        return '↩️';
      case 'recharge':
        return '💰';
      default:
        return '💳';
    }
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    onFilter(value);
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
    } catch (err) {
      logger.error('Failed to export transaction history', err, 'API');
    }
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
          <Button onClick={fetchTransactionHistory} variant="outline" size="sm" className="mt-2">
            {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentTransactions = historyData?.transactions || transactions;
  const currentPagination = historyData?.pagination || pagination;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HistoryIcon className="h-5 w-5" />
          <span>{t('transactionHistory')}</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-32">
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
          <Button onClick={handleExport} variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {currentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noTransactions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getTransactionTypeIcon(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getTransactionTypeColor(transaction.transaction_type) as any}>
                    {transaction.transaction_type}
                  </Badge>
                  <span className={`font-mono ${
                    transaction.transaction_type === 'deduction' ? 'text-destructive' : 'text-success'
                  }`}>
                    {formatAmount(transaction.amount, transaction.transaction_type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentPagination && currentPagination.has_next && (
          <div className="flex justify-center pt-4">
            <Button onClick={onLoadMore} variant="outline">
              {t('loadMore')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionHistory;
