/**
 * Error Message Component
 * 
 * This component displays error messages with different variants and actions.
 */

'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { XIcon, AlertCircleIcon, RefreshIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  title?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message, 
  title, 
  variant = 'default', 
  onRetry, 
  onDismiss,
  className 
}: ErrorMessageProps) {
  const variantClasses = {
    default: 'border-destructive/20 bg-destructive/5 text-destructive',
    destructive: 'border-destructive/20 bg-destructive/5 text-destructive',
    warning: 'border-warning/20 bg-warning/5 text-warning',
  };

  return (
    <Alert className={cn(variantClasses[variant], className)}>
      <AlertCircleIcon className="h-4 w-4" />
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{message}</AlertDescription>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {onRetry && (
            <Button onClick={onRetry} variant="ghost" size="sm">
              <RefreshIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} variant="ghost" size="sm">
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

export default ErrorMessage;
