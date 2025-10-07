/**
 * WeChat Login Modal Component
 * 
 * This component provides a modal interface for WeChat OAuth login.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCode } from '@/components/ui/qr-code';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { logger } from '@/lib/utils/logger';

interface WeChatLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, session: any) => void;
  className?: string;
}

interface QRCodeData {
  qr_code_url: string;
  session_id: string;
  expires_at: number;
}

export function WeChatLoginModal({ isOpen, onClose, onSuccess, className }: WeChatLoginModalProps) {
  const t = useTranslations('auth');
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && !qrCodeData) {
      generateQRCode();
    }
  }, [isOpen, qrCodeData]);

  // Poll for login status
  useEffect(() => {
    if (qrCodeData && isOpen) {
      startPolling();
    }
  }, [qrCodeData, isOpen]);

  // Listen for messages from WeChat callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WECHAT_LOGIN_SUCCESS') {
        console.log('WeChat login success message received:', event.data);
        if (event.data.success && event.data.user && event.data.session) {
          onSuccess(event.data.user, event.data.session);
          onClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onClose]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/wechat/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate QR code');
      }

      setQrCodeData({
        qr_code_url: data.qr_code_url,
        session_id: data.session_id,
        expires_at: data.expires_at,
      });

      logger.auth('QR code generated successfully', {
        sessionId: data.session_id,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      logger.error('Failed to generate QR code', err, 'AUTH');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (!qrCodeData) return;

    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/wechat/status?session_id=${qrCodeData.session_id}`);
        const data = await response.json();

        if (data.success) {
          if (data.status === 'completed' && data.user) {
            clearInterval(interval);
            setPolling(false);
            onSuccess(data.user, data.session);
            onClose();
          } else if (data.status === 'expired' || data.status === 'failed') {
            clearInterval(interval);
            setPolling(false);
            setError(data.error || 'Login failed or expired');
          }
        }
      } catch (err) {
        logger.error('Failed to check login status', err, 'AUTH');
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
      if (isOpen) {
        setError('Login session expired. Please try again.');
      }
    }, 300000);
  };

  const handleRetry = () => {
    setQrCodeData(null);
    setError(null);
    generateQRCode();
  };

  const handleClose = () => {
    setQrCodeData(null);
    setError(null);
    setPolling(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('wechatLogin')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 p-6">
          {loading && (
            <div className="flex flex-col items-center space-y-2">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">
                {t('generatingQRCode')}
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center space-y-2">
              <ErrorMessage message={error} />
              <Button onClick={handleRetry} variant="outline" size="sm">
                {t('retry')}
              </Button>
            </div>
          )}

          {qrCodeData && !error && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <QRCode
                  value={qrCodeData.qr_code_url}
                  size={200}
                  className="border rounded-lg"
                />
                {/* 移除遮罩层，让二维码正常显示 */}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('scanQRCode')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('scanInstructions')}
                </p>
                {polling && (
                  <div className="flex items-center justify-center space-x-2 text-xs text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>等待扫码登录...</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  {t('refreshQR')}
                </Button>
                <Button onClick={handleClose} variant="ghost" size="sm">
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WeChatLoginModal;
