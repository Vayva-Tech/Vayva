'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { CreateCreditAccountInput } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateCreditAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCreditAccountDialog({
  open,
  onClose,
  onSuccess,
}: CreateCreditAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net30');
  const [interestRate, setInterestRate] = useState('0');

  const handleSubmit = async () => {
    if (!customerId || !creditLimit) return;

    setIsSubmitting(true);
    try {
      const data = {
        storeId: '', // Will be set by API from session
        customerId,
        creditLimit: parseFloat(creditLimit),
        paymentTerms,
        interestRate: parseFloat(interestRate),
        isActive: false,
      } as unknown as CreateCreditAccountInput;

      const response = await fetch('/api/b2b/credit-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        logger.error("[CreateCreditAccount] Failed: Response not OK");
      }
    } catch (error) {
      logger.error("[CreateCreditAccount] Failed:", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Credit Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer ID *</Label>
            <Input
              id="customer"
              value={customerId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerId(e.target.value)}
              placeholder="Enter customer ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Credit Limit *</Label>
            <Input
              id="limit"
              type="number"
              min="0"
              step="0.01"
              value={creditLimit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreditLimit(e.target.value)}
              placeholder="Enter credit limit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Payment Terms</Label>
            <Input
              id="terms"
              value={paymentTerms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentTerms(e.target.value)}
              placeholder="e.g., net30, net60, net90"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              min="0"
              step="0.01"
              value={interestRate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterestRate(e.target.value)}
              placeholder="Enter interest rate"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!customerId || !creditLimit || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
