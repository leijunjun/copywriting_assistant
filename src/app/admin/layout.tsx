/**
 * 管理后台根布局
 * 
 * 完全独立于前台布局，不包含Header和Footer
 * 提供管理后台专用的样式和结构
 */

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from '@/components/admin/Sidebar';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台 - AI文案助手",
  description: "AI文案助手管理后台",
};

export default function AdminRootLayout({
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