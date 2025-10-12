/**
 * Low Credit Warning Component
 * 
 * This component displays a warning when the user's credit balance is low.
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditIcon, RechargeIcon, WarningIcon } from '@/components/ui/icons';

interface LowCreditWarningProps {
  balance: number;
  threshold?: number;
  onRecharge: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function LowCreditWarning({ 
  balance, 
  threshold = 20, 
  onRecharge, 
  onDismiss,
  className 
}: LowCreditWarningProps) {
  const t = useTranslations('Credits');

  if (balance >= threshold) {
    return null;
  }

  const getWarningLevel = (balance: number) => {
    if (balance < 5) {
      return { level: 'critical', color: 'destructive' };
    } else if (balance < 10) {
      return { level: 'high', color: 'destructive' };
    } else {
      return { level: 'medium', color: 'warning' };
    }
  };

  const getWarningMessage = (balance: number) => {
    if (balance < 5) {
      return t('criticalBalanceWarning');
    } else if (balance < 10) {
      return t('highBalanceWarning');
    } else {
      return t('lowBalanceWarning');
    }
  };

  const getRechargeUrgency = (balance: number) => {
    if (balance < 5) {
      return t('rechargeImmediately');
    } else if (balance < 10) {
      return t('rechargeSoon');
    } else {
      return t('rechargeRecommended');
    }
  };

  const warningLevel = getWarningLevel(balance);
  const warningMessage = getWarningMessage(balance);
  const rechargeUrgency = getRechargeUrgency(balance);

  return (
    <Alert className={`border-${warningLevel.color} bg-${warningLevel.color}/5 ${className}`}>
      <WarningIcon className="h-4 w-4" />
      <AlertTitle className="flex items-center space-x-2">
        <span>{t('lowBalanceAlert')}</span>
        <Badge variant={warningLevel.color as any}>
          {warningLevel.level.toUpperCase()}
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <div className="flex items-center space-x-2">
          <CreditIcon className="h-4 w-4" />
          <span className="font-medium">
            {t('currentBalance')}: {balance.toLocaleString()} {t('credits')}
          </span>
        </div>
        
        <p className="text-sm">
          {warningMessage}
        </p>
        
        <p className="text-sm font-medium text-muted-foreground">
          {rechargeUrgency}
        </p>

        <div className="flex space-x-2">
          <Button onClick={onRecharge} size="sm" className="flex items-center space-x-1">
            <RechargeIcon className="h-4 w-4" />
            <span>{t('rechargeNow')}</span>
          </Button>
          
          {onDismiss && (
            <Button onClick={onDismiss} variant="ghost" size="sm">
              {t('dismiss')}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default LowCreditWarning;
