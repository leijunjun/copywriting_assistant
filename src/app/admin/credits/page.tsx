/**
 * 积分管理页面
 * 
 * 提供积分调整功能
 */

import React from 'react';
import { CreditAdjustmentForm } from '@/components/admin/CreditAdjustmentForm';

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">积分管理</h1>
        <p className="text-gray-600">调整会员积分余额</p>
      </div>
      
      <CreditAdjustmentForm />
    </div>
  );
}
