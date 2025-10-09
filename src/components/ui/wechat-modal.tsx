/**
 * WeChat Contact Modal Component
 * 
 * This component displays a modal with WeChat QR code for customer service contact.
 */

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeChatModal({ isOpen, onClose }: WeChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            联系客服
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            扫描下方二维码添加客服微信
          </div>
          <div className="relative w-64 h-64 bg-white p-4 rounded-lg shadow-lg">
            <Image
              src="/weixin.png"
              alt="WeChat QR Code"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center text-xs text-gray-500">
            请使用微信扫描二维码
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WeChatModal;
