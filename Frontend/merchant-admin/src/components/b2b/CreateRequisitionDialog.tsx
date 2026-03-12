'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { CreateRequisitionInput, RequisitionItem, RequisitionUrgency } from '@/types/phase4-industry';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface DraftRequisitionItem {
  productId: string;
  quantity: number;
  notes: string;
}

interface CreateRequisitionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRequisitionDialog({
  open,
  onClose,
  onSuccess,
}: CreateRequisitionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [urgency, setUrgency] = useState<RequisitionUrgency>('normal');
  const [neededBy, setNeededBy] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftRequisitionItem[]>([]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        quantity: 1,
        notes: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DraftRequisitionItem, value: unknown) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    if (!customerId || !requesterName || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const data: CreateRequisitionInput = {
        storeId: '', // Will be set by API from session
        customerId,
        requesterName,
        requesterEmail: requesterEmail || undefined as string | undefined,
        urgency,
        neededBy: new Date(neededBy),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
        notes: notes || undefined,
      };

      const response = await fetch('/api/b2b/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        logger.error("[CreateRequisition] Failed: Response not OK");
      }
    } catch (error) {
      logger.error("[CreateRequisition] Failed:", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Requisition</DialogTitle>
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
              <Label htmlFor="urgency">Urgency *</Label>
              <Select value={urgency} onValueChange={(value: string) => setUrgency(value as RequisitionUrgency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requester">Requester Name *</Label>
              <Input
                id="requester"
                value={requesterName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequesterName(e.target.value)}
                placeholder="Enter requester name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Requester Email</Label>
              <Input
                id="email"
                type="email"
                value={requesterEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequesterEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neededBy">Needed By Date *</Label>
            <Input
              id="neededBy"
              type="date"
              value={neededBy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNeededBy(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No items added. Click "Add Item" to add products.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div className="col-span-2">
                          <Label className="text-xs">Product ID *</Label>
                          <Input
                            value={item.productId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, 'productId', e.target.value)}
                            placeholder="Product ID"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
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
                      <div className="mt-2">
                        <Label className="text-xs">Notes</Label>
                        <Input
                          value={item.notes || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(index, 'notes', e.target.value)}
                          placeholder="Item notes (optional)"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Additional notes for this requisition"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!customerId || !requesterName || items.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Requisition'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
