'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@vayva/ui';
import { AlertTriangle, CheckCircle, XCircle, Info, ArrowDownToLine, TrendDown } from 'lucide-react';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';
import { formatCurrency } from '@vayva/shared';

interface UsageData {
  products: number;
  orders: number;
  customers: number;
  staffSeats: number;
}

interface Violation {
  feature: string;
  current: number;
  limit: number;
  message: string;
}

interface Warning {
  feature: string;
  message: string;
}

interface DowngradeOption {
  plan: string;
  limits: {
    products: { maxItems?: number | 'unlimited'; enabled: boolean };
    orders: { maxItems?: number | 'unlimited'; enabled: boolean };
    customers: { maxItems?: number | 'unlimited'; enabled: boolean };
    teamMembers: { maxItems?: number | 'unlimited'; enabled: boolean };
    staffSeats: { maxItems?: number | 'unlimited'; enabled: boolean };
    [key: string]: any;
  };
}

interface DowngradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  currentUsage: UsageData;
  onSuccess: () => void;
}

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  PRO_PLUS: 'Pro Plus',
};

const PLAN_PRICES: Record<string, number> = {
  STARTER: 25000,
  PRO: 35000,
  PRO_PLUS: 50000,
};

export function DowngradeModal({
  open,
  onOpenChange,
  currentPlan,
  currentUsage,
  onSuccess,
}: DowngradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<'immediate' | 'next_billing_cycle'>('next_billing_cycle');
  const [validation, setValidation] = useState<{
    canDowngrade: boolean;
    violations: Violation[];
    warnings: Warning[];
  } | null>(null);
  const [prorationCredit, setProrationCredit] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch downgrade options and validate
  useEffect(() => {
    if (open && selectedPlan) {
      const fetchValidation = async () => {
        try {
          const result = await apiJson<{
            success: boolean;
            data?: {
              downgradeOptions: DowngradeOption[];
              currentUsage: UsageData;
            };
            error?: string;
          }>('/api/billing/downgrade');

          if (result.success && result.data) {
            const option = result.data.downgradeOptions.find(o => o.plan === selectedPlan);
            if (option) {
              // Perform client-side validation
              const violations: Violation[] = [];
              const warnings: Warning[] = [];

              // Check products
              if (option.limits.products.maxItems && typeof option.limits.products.maxItems === 'number') {
                if (currentUsage.products > option.limits.products.maxItems) {
                  violations.push({
                    feature: 'Products',
                    current: currentUsage.products,
                    limit: option.limits.products.maxItems,
                    message: `You have ${currentUsage.products} products but ${PLAN_LABELS[selectedPlan]} allows only ${option.limits.products.maxItems}`,
                  });
                } else if (currentUsage.products > option.limits.products.maxItems * 0.8) {
                  warnings.push({
                    feature: 'Products',
                    message: `You're using ${Math.round((currentUsage.products / option.limits.products.maxItems!) * 100)}% of your product allowance`,
                  });
                }
              }

              // Check orders
              if (option.limits.orders.maxItems && typeof option.limits.orders.maxItems === 'number') {
                if (currentUsage.orders > option.limits.orders.maxItems) {
                  violations.push({
                    feature: 'Monthly Orders',
                    current: currentUsage.orders,
                    limit: option.limits.orders.maxItems,
                    message: `You've processed ${currentUsage.orders} orders this month but ${PLAN_LABELS[selectedPlan]} allows only ${option.limits.orders.maxItems}`,
                  });
                }
              }

              // Check customers
              if (option.limits.customers.maxItems && typeof option.limits.customers.maxItems === 'number') {
                if (currentUsage.customers > option.limits.customers.maxItems) {
                  violations.push({
                    feature: 'Customers',
                    current: currentUsage.customers,
                    limit: option.limits.customers.maxItems,
                    message: `You have ${currentUsage.customers} customers but ${PLAN_LABELS[selectedPlan]} allows only ${option.limits.customers.maxItems}`,
                  });
                }
              }

              // Check staff seats
              if (option.limits.staffSeats.maxItems && typeof option.limits.staffSeats.maxItems === 'number') {
                if (currentUsage.staffSeats > option.limits.staffSeats.maxItems) {
                  violations.push({
                    feature: 'Staff Seats',
                    current: currentUsage.staffSeats,
                    limit: option.limits.staffSeats.maxItems,
                    message: `You have ${currentUsage.staffSeats} staff seats but ${PLAN_LABELS[selectedPlan]} allows only ${option.limits.staffSeats.maxItems}`,
                  });
                }
              }

              // Add feature loss warnings
              const currentTier = currentPlan.toUpperCase().replace(/\+/g, '_PLUS');
              if (currentTier === 'PRO' && selectedPlan === 'STARTER') {
                warnings.push({
                  feature: 'API Access',
                  message: 'You will lose API access. Any integrations using the API will stop working.',
                });
                warnings.push({
                  feature: 'Advanced Analytics',
                  message: 'Advanced analytics features will be disabled.',
                });
                warnings.push({
                  feature: 'Analytics History',
                  message: 'Your analytics history will be limited to 30 days instead of 90 days.',
                });
              }

              if (currentTier === 'PRO_PLUS' && selectedPlan !== 'PRO_PLUS') {
                warnings.push({
                  feature: 'Visual Workflow Builder',
                  message: 'You will lose access to the visual workflow builder.',
                });
                warnings.push({
                  feature: 'Merged Industry View',
                  message: 'Merged industry analytics view will be disabled.',
                });
                warnings.push({
                  feature: 'Priority Support',
                  message: 'You will lose priority support access.',
                });
              }

              setValidation({
                canDowngrade: violations.length === 0,
                violations,
                warnings,
              });
            }
          }
        } catch (error) {
          console.error('[DOWNGRADE_VALIDATION_ERROR]', error);
        }
      };

      void fetchValidation();
    }
  }, [open, selectedPlan, currentPlan, currentUsage]);

  const handleDowngrade = async () => {
    if (!selectedPlan || !validation?.canDowngrade) return;

    setLoading(true);
    try {
      const result = await apiJson<{
        success: boolean;
        data?: {
          effectiveDate: string;
          prorationCredit: number;
          nextBillingDate: string;
          newAmount: number;
        };
        error?: string;
      }>('/api/billing/downgrade', {
        method: 'POST',
        body: JSON.stringify({
          targetPlan: selectedPlan,
          effectiveDate,
        }),
      });

      if (result.success && result.data) {
        setProrationCredit(result.data.prorationCredit);
        setShowConfirmation(true);
        toast.success(result.message || 'Downgrade scheduled successfully');
      } else {
        toast.error(result.error || 'Failed to process downgrade');
      }
    } catch (error) {
      console.error('[DOWNGRADE_ERROR]', error);
      toast.error('Failed to process downgrade');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setValidation(null);
    setSelectedPlan('');
    setProrationCredit(0);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onSuccess();
    handleClose();
  };

  // Confirmation Screen
  if (showConfirmation && validation?.canDowngrade) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Downgrade Scheduled Successfully
            </DialogTitle>
            <DialogDescription>
              Your plan change has been scheduled. Here are the details:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Plan:</span>
                <span className="font-semibold">{PLAN_LABELS[currentPlan]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Plan:</span>
                <span className="font-semibold text-green-600">{PLAN_LABELS[selectedPlan]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Effective Date:</span>
                <span className="font-semibold">
                  {effectiveDate === 'immediate' ? 'Immediate' : 'Next Billing Cycle'}
                </span>
              </div>
              {prorationCredit > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Proration Credit:</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(prorationCredit)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-gray-600">New Monthly Amount:</span>
                <span className="font-bold text-lg">{formatCurrency(PLAN_PRICES[selectedPlan])}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>You'll retain access to all current features until the effective date</li>
                    <li>Your proration credit will be applied to your next invoice</li>
                    <li>You'll receive a confirmation email shortly</li>
                    <li>On the effective date, feature restrictions will be applied automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSuccess} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main Downgrade Modal
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <TrendDown className="w-6 h-6" />
            Downgrade Plan
          </DialogTitle>
          <DialogDescription>
            Reduce your subscription tier to lower costs. Your changes will take effect at the start of your next billing cycle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              Select New Plan
            </label>
            <div className="grid gap-3">
              {currentPlan.toUpperCase().includes('PRO_PLUS') && (
                <button
                  onClick={() => setSelectedPlan('PRO')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === 'PRO'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">Pro Plan</p>
                      <p className="text-sm text-gray-600">Perfect for growing businesses</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(PLAN_PRICES.PRO)}/mo</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save {formatCurrency(PLAN_PRICES.PRO_PLUS - PLAN_PRICES.PRO)}/month
                  </p>
                </button>
              )}

              {(currentPlan.toUpperCase().includes('PRO_PLUS') || currentPlan.toUpperCase().includes('PRO')) && (
                <button
                  onClick={() => setSelectedPlan('STARTER')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === 'STARTER'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">Starter Plan</p>
                      <p className="text-sm text-gray-600">Essential tools for small businesses</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(PLAN_PRICES.STARTER)}/mo</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save {formatCurrency(PLAN_PRICES[currentPlan.toUpperCase().replace(/\+/g, '_PLUS')] - PLAN_PRICES.STARTER)}/month
                  </p>
                </button>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {selectedPlan && validation && (
            <>
              {/* Violations - Block Downgrade */}
              {validation.violations.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-2">Cannot Downgrade Yet</p>
                      <ul className="space-y-2">
                        {validation.violations.map((violation, idx) => (
                          <li key={idx} className="text-sm text-red-700">
                            <span className="font-medium">{violation.feature}:</span> {violation.message}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-600 mt-3">
                        Please reduce your usage before downgrading, or wait until your next billing cycle when usage resets.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings - Feature Loss */}
              {validation.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 mb-2">Feature Changes</p>
                      <ul className="space-y-2">
                        {validation.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span><span className="font-medium">{warning.feature}:</span> {warning.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Effective Date Selection */}
              {validation.canDowngrade && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    When should the downgrade take effect?
                  </label>
                  <div className="grid gap-2">
                    <button
                      onClick={() => setEffectiveDate('next_billing_cycle')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        effectiveDate === 'next_billing_cycle'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Next Billing Cycle (Recommended)</p>
                      <p className="text-sm text-gray-600">Continue using current plan features until then</p>
                    </button>
                    <button
                      onClick={() => setEffectiveDate('immediate')}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        effectiveDate === 'immediate'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Immediate</p>
                      <p className="text-sm text-gray-600">Features restricted right away</p>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Summary */}
          {selectedPlan && validation?.canDowngrade && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Plan:</span>
                  <span className="font-medium">{PLAN_LABELS[currentPlan]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Plan:</span>
                  <span className="font-medium text-green-600">{PLAN_LABELS[selectedPlan]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Savings:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(PLAN_PRICES[currentPlan.toUpperCase().replace(/\+/g, '_PLUS')] - PLAN_PRICES[selectedPlan])}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDowngrade}
            disabled={!selectedPlan || !validation?.canDowngrade || loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Processing...' : `Downgrade to ${PLAN_LABELS[selectedPlan] || 'Selected Plan'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
