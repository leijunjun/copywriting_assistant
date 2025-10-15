/**
 * 操作日志页面
 * 
 * 显示管理员操作日志
 */

import React from 'react';
import { OperationLogTable } from '@/components/admin/OperationLogTable';

export default function OperationLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">操作日志</h1>
        <p className="text-gray-600">查看所有管理员操作记录</p>
      </div>
      
      <OperationLogTable />
    </div>
  );
}
