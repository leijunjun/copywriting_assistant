/**
 * WeChat Customer Service Modal
 * 
 * This component displays a modal with WeChat QR code for customer service contact.
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function WeChatModal({ isOpen, onClose, className }: WeChatModalProps) {
  const t = useTranslations('auth');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('contactSupport')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="text-center text-sm text-gray-600 mb-2">
            {t('scanQRCode')}
          </div>
          
          <div className="relative">
            <Image
              src="/weixin.png"
              alt="WeChat QR Code"
              width={200}
              height={200}
              className="rounded-lg border-2 border-gray-200"
            />
          </div>
          
          <div className="text-center text-xs text-gray-500 max-w-xs">
            {t('wechatContactDescription')}
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full max-w-xs"
          >
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WeChatModal;
