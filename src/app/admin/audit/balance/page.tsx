/**
 * 余额核对页面
 * 
 * 检查积分余额是否正确
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BalanceCheckResult, BalanceCheckResponse } from '@/types/admin';

export default function BalanceCheckPage() {
  const [results, setResults] = useState<BalanceCheckResult[]>([]);
  const [summary, setSummary] = useState<{
    total_users: number;
    balanced_users: number;
    imbalanced_users: number;
    total_difference: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const runBalanceCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/audit/balance-check');
      const data: BalanceCheckResponse = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to run balance check:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBalanceCheck();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '无';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusIcon = (isBalanced: boolean) => {
    return isBalanced ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (isBalanced: boolean) => {
    return isBalanced ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">余额核对</h1>
          <p className="text-gray-600">检查所有用户积分余额是否正确</p>
        </div>
        <Button onClick={runBalanceCheck} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '检查中...' : '重新检查'}
        </Button>
      </div>

      {/* 汇总信息 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">余额正确</p>
                  <p className="text-2xl font-bold text-green-600">{summary.balanced_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">余额异常</p>
                  <p className="text-2xl font-bold text-red-600">{summary.imbalanced_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总差异</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.total_difference}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细结果 */}
      <Card>
        <CardHeader>
          <CardTitle>核对结果</CardTitle>
          <CardDescription>
            按差异大小排序，异常用户显示在前
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    计算余额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    实际余额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    差异
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易次数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后交易
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusIcon(result.is_balanced)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.calculated_balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.actual_balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getStatusColor(result.is_balanced)}>
                        {result.difference > 0 ? '+' : ''}{result.difference.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.transaction_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(result.last_transaction_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
