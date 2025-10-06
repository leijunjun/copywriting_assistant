/**
 * QR Code Component
 * 
 * This component displays a QR code for WeChat login.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current || !value) {
        console.log('QR Code: Missing canvas ref or value', { 
          hasCanvas: !!canvasRef.current, 
          hasValue: !!value,
          value: value 
        });
        return;
      }

      try {
        console.log('QR Code: Starting generation with value:', value);
        setLoading(true);
        setError(null);

        await QRCodeLib.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        console.log('QR Code: Generation completed successfully');
        setLoading(false);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
        setLoading(false);
      }
    };

    generateQRCode();
  }, [value, size]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center border-2 border-dashed border-red-500/25 rounded-lg bg-red-50/5',
          className
        )}
        style={{ width: size, height: size }}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl">❌</div>
          <div className="text-xs text-red-500 max-w-[80%] break-all">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="border rounded-lg"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <div className="text-xs text-muted-foreground">生成二维码中...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRCode;
