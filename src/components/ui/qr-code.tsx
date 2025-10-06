/**
 * QR Code Component
 * 
 * This component displays a QR code for WeChat login.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className }: QRCodeProps) {
  // In a real implementation, you would use a QR code library like 'qrcode'
  // For now, we'll create a placeholder that shows the QR code URL
  return (
    <div
      className={cn(
        'flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/5',
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="text-center space-y-2">
        <div className="text-4xl">📱</div>
        <div className="text-xs text-muted-foreground max-w-[80%] break-all">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">
          QR Code Placeholder
        </div>
      </div>
    </div>
  );
}

export default QRCode;
