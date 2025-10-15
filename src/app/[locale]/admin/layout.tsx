/**
 * 管理后台布局
 * 
 * 提供侧边栏导航和主内容区域，完全独立于前台布局
 * 不包含前台Header和Footer，使用独立的管理后台样式
 */

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
