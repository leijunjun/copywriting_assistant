/**
 * 登录提醒弹窗组件
 * 
 * 当未登录用户点击生成按钮时显示，提醒用户登录
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, X } from 'lucide-react';

interface LoginReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginReminderModal({ 
  open, 
  onOpenChange
}: LoginReminderModalProps) {
  const t = useTranslations('auth');
  const router = useRouter();

  const handleLogin = () => {
    // 跳转到登录页面
    router.push('/auth/login');
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {t('loginRequired')}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('loginRequiredDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">{t('loginBenefits')}</p>
              <p className="text-blue-600">{t('loginBenefit1')}</p>
              <p className="text-blue-600">{t('loginBenefit2')}</p>
              <p className="text-blue-600">{t('loginBenefit3')}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {t('loginLater')}
          </Button>
          <Button
            onClick={handleLogin}
            className="flex-1 bg-[#8e47f0] hover:bg-[#7f39ea] text-white"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {t('loginNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
