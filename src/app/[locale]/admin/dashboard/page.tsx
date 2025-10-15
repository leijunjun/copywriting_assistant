/**
 * 管理后台仪表盘
 * 
 * 显示系统统计概览
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, FileText, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  total_members: number;
  active_members: number;
  total_credits: number;
  recent_operations: number;
  high_risk_operations: number;
  member_growth: {
    this_month: number;
    last_month: number;
    growth_rate: number;
  };
  credit_flow: {
    total_added: number;
    total_deducted: number;
    net_change: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        const result = await response.json();
        
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          console.error('Failed to fetch dashboard stats:', result.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600">系统概览和统计信息</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-600">系统概览和统计信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_members.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              活跃会员: {stats?.active_members.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总积分</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_credits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              本月净增: +{stats?.credit_flow.net_change.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月操作</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent_operations}</div>
            <p className="text-xs text-muted-foreground">
              高风险操作: {stats?.high_risk_operations}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会员增长</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.member_growth.this_month}</div>
            <p className="text-xs text-muted-foreground">
              增长率: +{stats?.member_growth.growth_rate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>积分流向</CardTitle>
            <CardDescription>本月积分变动情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">积分增加</span>
                <span className="text-sm font-medium text-green-600">
                  +{stats?.credit_flow.total_added.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">积分扣减</span>
                <span className="text-sm font-medium text-red-600">
                  -{stats?.credit_flow.total_deducted.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">净变化</span>
                  <span className={`text-sm font-medium ${
                    (stats?.credit_flow.net_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(stats?.credit_flow.net_change || 0) >= 0 ? '+' : ''}{stats?.credit_flow.net_change.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>会员增长</CardTitle>
            <CardDescription>会员数量变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本月新增</span>
                <span className="text-sm font-medium text-blue-600">
                  +{stats?.member_growth.this_month}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">上月新增</span>
                <span className="text-sm font-medium text-gray-600">
                  +{stats?.member_growth.last_month}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">增长率</span>
                  <span className="text-sm font-medium text-green-600">
                    +{stats?.member_growth.growth_rate}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用管理功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/members/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium">新增会员</div>
                <div className="text-sm text-gray-500">创建新会员账号</div>
              </div>
            </a>
            
            <a
              href="/admin/credits"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium">积分管理</div>
                <div className="text-sm text-gray-500">调整会员积分</div>
              </div>
            </a>
            
            <a
              href="/admin/audit/alerts"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <div className="font-medium">风险预警</div>
                <div className="text-sm text-gray-500">查看大额操作</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
