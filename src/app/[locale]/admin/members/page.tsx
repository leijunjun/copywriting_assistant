/**
 * 会员管理页面
 * 
 * 显示会员列表和管理功能
 */

import React from 'react';
import { MemberTable } from '@/components/admin/MemberTable';

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">会员管理</h1>
        <p className="text-gray-600">管理会员信息和积分</p>
      </div>
      
      <MemberTable />
    </div>
  );
}
