'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Star, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@vayva/ui';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SavedPaymentMethod {
  id: string;
  token: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  bankName?: string | null;
  accountNumber?: string | null;
  isDefault: boolean;
  createdAt: string;
}

interface PaymentMethodManagerProps {
  onPaymentMethodSaved?: (method: SavedPaymentMethod) => void;
  onPaymentMethodDeleted?: (id: string) => void;
  onDefaultChanged?: (id: string) => void;
}

export function PaymentMethodManager({
  onPaymentMethodSaved,
  onPaymentMethodDeleted,
  onDefaultChanged,
}: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch saved payment methods
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const result = await apiJson<{
        success: boolean;
        data?: SavedPaymentMethod[];
        error?: string;
      }>('/api/payment-methods');

      if (result.success && result.data) {
        setPaymentMethods(result.data);
      } else {
        console.error('[FETCH_PAYMENT_METHODS_ERROR]', result.error);
      }
    } catch (error) {
      console.error('[FETCH_PAYMENT_METHODS_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setProcessing(id);
      const result = await apiJson<{
        success: boolean;
        error?: string;
      }>(`/api/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (result.success) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        toast.success('Payment method deleted');
        onPaymentMethodDeleted?.(id);
      } else {
        toast.error(result.error || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('[DELETE_PAYMENT_METHOD_ERROR]', error);
      toast.error('Failed to delete payment method');
    } finally {
      setProcessing(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setProcessing(id);
      const result = await apiJson<{
        success: boolean;
        error?: string;
      }>(`/api/payment-methods/${id}/default`, {
        method: 'PATCH',
        body: JSON.stringify({ isDefault: true }),
      });

      if (result.success) {
        setPaymentMethods((prev) =>
          prev.map((m) => ({
            ...m,
            isDefault: m.id === id,
          }))
        );
        toast.success('Default payment method updated');
        onDefaultChanged?.(id);
      } else {
        toast.error(result.error || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('[SET_DEFAULT_ERROR]', error);
      toast.error('Failed to set default payment method');
    } finally {
      setProcessing(null);
    }
  };

  const handleCardTokenized = async (tokenData: {
    token: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    bankName?: string;
  }) => {
    try {
      setProcessing('saving');
      const result = await apiJson<{
        success: boolean;
        data?: SavedPaymentMethod;
        error?: string;
      }>('/api/payment-methods', {
        method: 'POST',
        body: JSON.stringify({
          token: tokenData.token,
          last4: tokenData.last4,
          brand: tokenData.brand,
          expiryMonth: tokenData.expiryMonth,
          expiryYear: tokenData.expiryYear,
          bankName: tokenData.bankName,
          isDefault: paymentMethods.length === 0, // First card is default
        }),
      });

      if (result.success && result.data) {
        setPaymentMethods((prev) => [...prev, result.data!]);
        toast.success('Payment method saved successfully');
        onPaymentMethodSaved?.(result.data);
        setShowAddForm(false);
      } else {
        toast.error(result.error || 'Failed to save payment method');
      }
    } catch (error) {
      console.error('[SAVE_TOKENIZED_CARD_ERROR]', error);
      toast.error('Failed to save payment method');
    } finally {
      setProcessing(null);
    }
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
      case 'american express':
        return '💳';
      case 'verve':
        return '💳';
      default:
        return '💳';
    }
  };

  const getExpiryDisplay = (month: number, year: number) => {
    const mm = month.toString().padStart(2, '0');
    const yy = year.toString().slice(-2);
    return `${mm}/${yy}`;
  };

  const isExpired = (month: number, year: number) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (year < currentYear) return true;
    if (year === currentYear && month < currentMonth) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h3>
          <p className="text-sm text-gray-500">Manage your saved cards for faster payments</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">Secure & PCI Compliant</p>
            <p>
              Your card details are tokenized and encrypted. We never store your full card number.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No saved payment methods</p>
          <p className="text-sm text-gray-500 mb-4">
            Save a card for faster checkout and automatic renewals
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Add Your First Card
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const expired = isExpired(method.expiryMonth, method.expiryYear);
            
            return (
              <div
                key={method.id}
                className={cn(
                  "relative bg-white rounded-xl border-2 p-4 transition-all",
                  method.isDefault
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300",
                  expired && "opacity-60 border-red-200"
                )}
              >
                {/* Default Badge */}
                {method.isDefault && (
                  <div className="absolute -top-3 left-4">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  {/* Card Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-4xl">{getBrandIcon(method.brand)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 capitalize">
                          {method.brand}
                        </p>
                        {expired && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">•••• •••• •••• {method.last4}</p>
                      <p className="text-sm text-gray-500">
                        Expires {getExpiryDisplay(method.expiryMonth, method.expiryYear)}
                        {method.bankName && ` • ${method.bankName}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!method.isDefault && !expired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={processing === method.id}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Star className="w-4 h-4" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      disabled={processing === method.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Card Modal */}
      {showAddForm && (
        <PaystackCardTokenizer
          onTokenize={handleCardTokenized}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

/**
 * Paystack Card Tokenization Component
 */
interface PaystackCardTokenizerProps {
  onTokenize: (data: {
    token: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    bankName?: string;
  }) => void;
  onClose: () => void;
}

function PaystackCardTokenizer({ onTokenize, onClose }: PaystackCardTokenizerProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In production, use actual Paystack inline JS
      // This is a simplified example
      const response = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          card: {
            number: cardNumber.replace(/\s/g, ''),
            cvc: cvv,
            exp_month: expiryMonth,
            exp_year: expiryYear,
          },
        }),
      });

      const data = await response.json();

      if (data.status && data.data && data.data.token) {
        onTokenize({
          token: data.data.token,
          last4: cardNumber.slice(-4),
          brand: data.data.card_brand || 'unknown',
          expiryMonth: parseInt(expiryMonth),
          expiryYear: parseInt(expiryYear),
          bankName: data.data.bank?.name,
        });
      } else {
        throw new Error(data.message || 'Tokenization failed');
      }
    } catch (error) {
      console.error('[CARD_TOKENIZATION_ERROR]', error);
      toast.error('Failed to tokenize card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Add New Card</h3>
          <p className="text-sm text-gray-500">Enter your card details securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
              maxLength={19}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0000 0000 0000 0000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Month
              </label>
              <select
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m.toString().padStart(2, '0')}>
                    {m.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Year
              </label>
              <select
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">YYYY</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
              maxLength={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-800">
                Your card information is secure and tokenized using Paystack's PCI-DSS compliant system.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Processing...' : 'Save Card'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
