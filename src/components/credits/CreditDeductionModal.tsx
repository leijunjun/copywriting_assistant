/**
 * Credit Deduction Confirmation Modal
 * 
 * This component provides a confirmation modal for credit deduction operations.
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { CreditIcon, WarningIcon } from '@/components/ui/icons';
import { logger } from '@/lib/utils/logger';

interface CreditDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, description: string) => Promise<void>;
  currentBalance: number;
  className?: string;
}

export function CreditDeductionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentBalance,
  className 
}: CreditDeductionModalProps) {
  const t = useTranslations('Credits');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      setError(t('fillAllFields'));
      return;
    }

    const amountNumber = parseInt(amount, 10);
    
    if (amountNumber <= 0) {
      setError(t('amountMustBePositive'));
      return;
    }

    if (amountNumber > currentBalance) {
      setError(t('insufficientCredits'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await onConfirm(amountNumber, description);
      
      // Reset form
      setAmount('');
      setDescription('');
      onClose();
      
      logger.credits('Credit deduction confirmed', {
        amount: amountNumber,
        description,
        newBalance: currentBalance - amountNumber,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('deductionFailed');
      setError(errorMessage);
      logger.error('Credit deduction failed', err, 'CREDITS');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setError(null);
    onClose();
  };

  const amountNumber = parseInt(amount, 10) || 0;
  const newBalance = currentBalance - amountNumber;
  const isInsufficient = amountNumber > currentBalance;
  const isLowBalance = newBalance < 20;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditIcon className="h-5 w-5" />
            <span>{t('deductCredits')}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={t('enterAmount')}
              className="text-right"
            />
            {amount && (
              <div className="text-sm text-muted-foreground">
                {t('currentBalance')}: {currentBalance.toLocaleString()} → {newBalance.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('enterDescription')}
              rows={3}
            />
          </div>

          {error && (
            <ErrorMessage message={error} />
          )}

          {isInsufficient && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <WarningIcon className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">
                  {t('insufficientCredits')}
                </p>
              </div>
            </div>
          )}

          {!isInsufficient && isLowBalance && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <WarningIcon className="h-4 w-4 text-warning" />
                <p className="text-sm text-warning">
                  {t('lowBalanceWarning')}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !amount || !description || isInsufficient}
              className="flex items-center space-x-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>{t('confirmDeduction')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreditDeductionModal;
