'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Quote, QuoteStatus, QuoteItem } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Send, Check, X, FileText, Calendar, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-gray-500',
  sent: 'bg-blue-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  expired: 'bg-yellow-500',
  converted: 'bg-purple-500',
};

export function QuoteDetail() {
  const params = useParams();
  const rawId = params?.id;
  const quoteId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] ?? '' : '';
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/b2b/quotes/${quoteId}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data.quote);
      }
    } catch (error) {
      logger.error("[QuoteDetail] Failed to fetch quote:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: QuoteStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/b2b/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchQuote();
      }
    } catch (error) {
      logger.error("[QuoteDetail] Failed to update quote status:", { error });
    } finally {
      setIsUpdating(false);
    }
  };

  const sendQuote = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/b2b/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' }),
      });

      if (response.ok) {
        fetchQuote();
      }
    } catch (error) {
      logger.error("[QuoteDetail] Failed to send quote:", { error });
      toast.error('Failed to send quote');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading quote...</div>;
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Quote not found</p>
        <Link href="/dashboard/b2b/quotes" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/b2b/quotes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{quote.quoteNumber}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Created {formatDate(quote.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
          {quote.status === 'draft' && (
            <Button onClick={sendQuote} disabled={isUpdating} size="sm">
              <Send className="mr-2 h-4 w-4" />
              Send Quote
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Quote Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Product</th>
                  <th className="text-right py-2 font-medium">Qty</th>
                  <th className="text-right py-2 font-medium">Unit Price</th>
                  <th className="text-right py-2 font-medium">Discount</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item: QuoteItem) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.productId}</td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="text-right py-3">{item.discount}%</td>
                    <td className="text-right py-3 font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-{formatCurrency(quote.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{quote.customerId}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={quote.status}
                  onValueChange={(value: string) => updateStatus(value as QuoteStatus)}
                  disabled={isUpdating || quote.status === 'converted'}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Expiry Date</label>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(quote.expiryDate)}
                </p>
              </div>

              {quote.convertedToOrderId && (
                <div>
                  <label className="text-sm font-medium">Converted to Order</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {quote.convertedToOrderId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {quote.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{quote.terms}</p>
              </CardContent>
            </Card>
          )}

          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
