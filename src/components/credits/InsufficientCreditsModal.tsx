/**
 * 积分不足弹框组件
 * 
 * 当用户积分低于5分时显示，引导用户充值
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CreditCard, Home } from 'lucide-react';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  requiredCredits?: number;
}

export function InsufficientCreditsModal({ 
  isOpen, 
  onClose, 
  currentBalance, 
  requiredCredits = 5 
}: InsufficientCreditsModalProps) {
  const t = useTranslations('Credits');
  const router = useRouter();

  const handleRecharge = () => {
    onClose();
    router.push('/credits');
  };

  const handleGoHome = () => {
    onClose();
    router.push('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {t('insufficientCreditsTitle')}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-600">
            {t('insufficientCreditsMessage', { 
              current: currentBalance, 
              required: requiredCredits 
            })}
          </DialogDescription>
        </DialogHeader>


        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('currentBalance')}:</span>
            <span className="font-semibold text-gray-900">{currentBalance} {t('credits')}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">{t('requiredCredits')}:</span>
            <span className="font-semibold text-red-600">{requiredCredits} {t('credits')}</span>
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-gray-900">{t('shortfall')}:</span>
              <span className="text-red-600">{Math.max(0, requiredCredits - currentBalance)} {t('credits')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('goHome')}
          </Button>
          <Button
            onClick={handleRecharge}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {t('rechargeNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
