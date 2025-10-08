/**
 * 加载骨架屏组件
 * 提供友好的加载提示和骨架屏效果
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 首页加载骨架屏
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen relative housekeeping-theme pt-16 w-full overflow-x-hidden pb-20">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full opacity-15 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-primary-300 to-primary-200 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="relative z-10 min-h-screen">
        {/* 左侧导航栏骨架 */}
        <div className="hidden lg:flex w-80 bg-bg-100/80 backdrop-blur-sm border-r border-bg-300 flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-20">
          <div className="p-6 border-b border-bg-300">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        
        {/* 右侧内容区域 */}
        <div className="lg:ml-80 ml-0">
          {/* 顶部搜索区域骨架 */}
          <div className="relative p-4 sm:p-6 lg:p-8 border-b border-bg-300 bg-bg-100/60 backdrop-blur-sm w-full">
            <div className="mx-auto text-center max-w-3xl">
              <Skeleton className="h-12 w-64 mx-auto mb-6" />
              <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
            </div>
          </div>
          
          {/* 移动端分类选择器骨架 */}
          <div className="lg:hidden p-3 sm:p-4 border-b border-bg-300 bg-bg-100/60 backdrop-blur-sm w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16" />
              ))}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          
          {/* 内容区域骨架 */}
          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* 最近使用工具骨架 */}
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              </div>
              
              {/* 工具列表骨架 */}
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 个人中心加载骨架屏
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* 标题骨架 */}
        <div className="text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* 卡片骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 用户资料卡片骨架 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>

          {/* 积分余额卡片骨架 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <div className="text-center">
                <Skeleton className="h-12 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作骨架 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 通用加载提示组件
export function LoadingIndicator({ 
  message = "加载中...", 
  size = "default",
  className 
}: { 
  message?: string; 
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-primary-500", sizeClasses[size])}></div>
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

// 页面加载覆盖层
export function PageLoadingOverlay({ 
  message = "页面加载中...",
  showProgress = false,
  progress = 0 
}: {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
          <p className="text-sm text-gray-600">请稍候，我们正在为您准备内容...</p>
        </div>
      </div>
    </div>
  );
}

// 工具卡片加载骨架
export function ToolCardSkeleton() {
  return (
    <div className="group flex items-center cursor-pointer p-3 sm:p-4 h-24 sm:h-28 md:h-32 relative rounded-xl border bg-bg-100 border-bg-300 w-full">
      <Skeleton className="md:min-w-20 md:max-w-20 md:h-20 min-w-16 max-w-16 h-16 p-2 rounded-lg" />
      <div className="pl-4 flex-1 min-w-0">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
    </div>
  );
}
