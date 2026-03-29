'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { CreateQuoteInput, QuoteItem } from '@/types/phase4-industry';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface CreateQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateQuoteDialog({ open, onClose, onSuccess }: CreateQuoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0,
      } as any,
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = items.map((item: any, i: number) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      // Recalculate total
      if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
        const qty = field === 'quantity' ? value : item.quantity;
        const price = field === 'unitPrice' ? value : item.unitPrice;
        const disc = field === 'discount' ? value : item.discount;
        updated.total = qty * price * (1 - disc / 100);
      }
      return updated;
    });
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum: number, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = items.reduce((sum: number, item) => sum + (item.quantity * item.unitPrice * item.discount) / 100,
      0
    );
    const tax = 0; // Calculate based on your tax rules
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  };

  const handleSubmit = async () => {
    if (!customerId || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const { subtotal, discount, tax, total } = calculateTotals();
      
      const data: CreateQuoteInput = {
        storeId: '', // Will be set by API from session
        customerId,
        items: items.map((item: QuoteItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        })),
        subtotal,
        discount,
        tax,
        total,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        notes: notes || undefined,
        terms: terms || undefined,
      };

      const response = await fetch('/b2b/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        logger.error("[CreateQuote] Failed: Response not OK");
      }
    } catch (error) {
      logger.error("[CreateQuote] Failed:", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, discount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quote</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Quote Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No items added. Click "Add Item" to add products to this quote.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-5 gap-3 items-end">
                        <div className="col-span-2">
                          <Label className="text-xs">Product ID</Label>
                          <Input
                            value={item.productId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, 'productId', e.target.value)}
                            placeholder="Product ID"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Discount %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateItem(index, 'discount', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Line Total: ${item.total.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter payment terms, delivery terms, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes (not visible to customer)"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!customerId || items.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Quote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
