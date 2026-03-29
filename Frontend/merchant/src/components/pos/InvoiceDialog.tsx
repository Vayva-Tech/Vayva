'use client';

import { useState } from 'react';
import { Button } from '@vayva/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vayva/ui/components/ui/dialog';
import { Input } from '@vayva/ui/components/ui/input';
import { Label } from '@vayva/ui/components/ui/label';
import { toast } from 'sonner';
import { Download, Mail, Printer, QrCode } from 'lucide-react';

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderTotal: number;
}

export function InvoiceDialog({ open, onOpenChange, orderId, orderTotal }: InvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [includeQRCode, setIncludeQRCode] = useState(true);

  const handleGenerateInvoice = async (format: 'PDF' | 'EMAIL') => {
    try {
      setLoading(true);

      const response = await fetch('/v1/pos/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          includeQRCode,
          format,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate invoice');
      }

      toast.success(`Invoice generated successfully!`);

      if (format === 'PDF') {
        // In production, this would trigger PDF download
        // For now, we'll show the invoice data
        console.log('Invoice data:', result.data);
        
        // Open print dialog
        window.print();
      } else if (format === 'EMAIL') {
        toast.success('Invoice sent to customer email!');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/v1/pos/invoices/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerEmail,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to email invoice');
      }

      toast.success('Invoice emailed successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Email invoice error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to email invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogDescription>
            Create and send invoice for this order (₦{orderTotal.toLocaleString()})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* QR Code Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="qr-code"
              checked={includeQRCode}
              onChange={(e) => setIncludeQRCode(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="qr-code" className="text-sm font-medium flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Include verification QR code
            </label>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Customer Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave blank for walk-in customers
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleGenerateInvoice('PDF')}
            disabled={loading}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          
          <Button
            variant="outline"
            onClick={handleEmailInvoice}
            disabled={loading || !customerEmail}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Invoice
          </Button>
          
          <Button
            onClick={() => handleGenerateInvoice('PDF')}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
