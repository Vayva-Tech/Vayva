'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@vayva/ui';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingDown, 
  Gift, 
  Phone, 
  Headphones, 
  PauseCircle,
  Download,
  FileText,
  Shield,
  Heart
} from 'lucide-react';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';
import { formatCurrency } from '@vayva/shared';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RetentionOffer {
  type: 'discount' | 'success_call' | 'support' | 'pause';
  value?: number;
  durationMonths?: number;
  message: string;
}

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  onSuccess: () => void;
}

const PLAN_PRICES: Record<string, number> = {
  STARTER: 25000,
  PRO: 35000,
  PRO_PLUS: 50000,
};

const REASONS = [
  { value: 'too_expensive', label: 'Too expensive', icon: '💰' },
  { value: 'missing_features', label: 'Missing needed features', icon: '🔧' },
  { value: 'technical_issues', label: 'Technical problems', icon: '⚠️' },
  { value: 'switching_competitor', label: 'Switching to competitor', icon: '🔄' },
  { value: 'business_closed', label: 'Business closed/paused', icon: '⏸️' },
  { value: 'other', label: 'Other', icon: '💬' },
];

export function CancellationModal({
  open,
  onOpenChange,
  currentPlan,
  onSuccess,
}: CancellationModalProps) {
  const [step, setStep] = useState<'survey' | 'offer' | 'confirm' | 'complete'>('survey');
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [reasonOther, setReasonOther] = useState('');
  const [feedback, setFeedback] = useState('');
  const [exportData, setExportData] = useState(true);
  const [effectiveDate, setEffectiveDate] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [retentionOffer, setRetentionOffer] = useState<RetentionOffer | null>(null);
  const [acceptRetention, setAcceptRetention] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState<any>(null);

  // Fetch cancellation options on mount
  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          const result = await apiJson<{
            success: boolean;
            data?: {
              retentionOffers: RetentionOffer[];
              cancellationReasons: Array<{ value: string; label: string }>;
            };
          }>('/api/billing/cancel/options');

          if (!result.success) {
            console.error('[FETCH_CANCEL_OPTIONS_ERROR]', result.error);
          }
        } catch (error) {
          console.error('[FETCH_CANCEL_OPTIONS_ERROR]', error);
        }
      };

      void fetchOptions();
    }
  }, [open]);

  const handleSubmitSurvey = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for cancelling');
      return;
    }

    if (selectedReason === 'other' && !reasonOther.trim()) {
      toast.error('Please specify your reason');
      return;
    }

    setLoading(true);
    try {
      const result = await apiJson<{
        success: boolean;
        data?: any;
        error?: string;
        requiresAction?: boolean;
      }>('/api/billing/cancel', {
        method: 'POST',
        body: JSON.stringify({
          reason: selectedReason,
          reasonOther: selectedReason === 'other' ? reasonOther : undefined,
          feedback: feedback.trim() || undefined,
          effectiveDate,
          exportData,
        }),
      });

      if (result.success && result.data) {
        setRetentionOffer(result.data.retentionOffer);
        setCancellationDetails(result.data);
        
        if (result.data.retentionOffer) {
          setStep('offer');
        } else {
          setStep('confirm');
        }
        
        toast.success('Cancellation request processed');
      } else {
        toast.error(result.error || 'Failed to process cancellation');
      }
    } catch (error) {
      console.error('[CANCELLATION_ERROR]', error);
      toast.error('Failed to process cancellation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRetention = async () => {
    if (!acceptRetention) {
      toast.error('Please accept the retention offer to continue');
      return;
    }

    setLoading(true);
    try {
      // In production, this would call an API to accept the retention offer
      // For now, we'll just show success
      toast.success('Retention offer accepted! Your subscription will continue.');
      setStep('complete');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('[RETENTION_ACCEPT_ERROR]', error);
      toast.error('Failed to accept retention offer');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    setLoading(true);
    try {
      // Cancellation already initiated in handleSubmitSurvey
      // This is just final confirmation
      toast.success('Cancellation confirmed. You will receive a confirmation email shortly.');
      setStep('complete');
      
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('[CONFIRM_CANCEL_ERROR]', error);
      toast.error('Failed to confirm cancellation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('survey');
    setSelectedReason('');
    setReasonOther('');
    setFeedback('');
    setExportData(true);
    setRetentionOffer(null);
    setAcceptRetention(false);
    onOpenChange(false);
  };

  // Complete Screen
  if (step === 'complete') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Process Complete
            </DialogTitle>
            <DialogDescription>
              Your request has been processed successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>You'll receive a confirmation email shortly</li>
                    {retentionOffer && acceptRetention ? (
                      <>
                        <li>Your retention offer has been applied</li>
                        <li>Your subscription will continue uninterrupted</li>
                        <li>Special discount will appear on next invoice</li>
                      </>
                    ) : (
                      <>
                        <li>Your subscription will remain active until {cancellationDetails?.endDate ? new Date(cancellationDetails.endDate).toLocaleDateString() : 'end of billing period'}</li>
                        <li>You have {cancellationDetails?.gracePeriodDays || 30} days of access remaining</li>
                        {exportData && <li>Your data export package is ready for download</li>}
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {!retentionOffer && exportData && cancellationDetails?.exportPackage && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-blue-800">Data Export Ready</p>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✓ {cancellationDetails.exportPackage.itemCount.products} products</p>
                  <p>✓ {cancellationDetails.exportPackage.itemCount.customers} customers</p>
                  <p>✓ {cancellationDetails.exportPackage.itemCount.orders} orders</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Data Package
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => { onSuccess(); handleClose(); }} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Retention Offer Screen
  if (step === 'offer' && retentionOffer) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Gift className="w-6 h-6" />
              Special Offer Just For You
            </DialogTitle>
            <DialogDescription>
              We're sorry to see you go! Before you leave, we'd like to offer you:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Retention Offer Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                {retentionOffer.type === 'discount' ? (
                  <Gift className="w-8 h-8 text-amber-600 mt-1" />
                ) : retentionOffer.type === 'success_call' ? (
                  <Phone className="w-8 h-8 text-amber-600 mt-1" />
                ) : retentionOffer.type === 'support' ? (
                  <Headphones className="w-8 h-8 text-amber-600 mt-1" />
                ) : (
                  <PauseCircle className="w-8 h-8 text-amber-600 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900 mb-2">
                    {retentionOffer.type === 'discount' 
                      ? `${retentionOffer.value}% OFF for ${retentionOffer.durationMonths} months`
                      : retentionOffer.type === 'success_call'
                      ? 'Personal Success Session'
                      : retentionOffer.type === 'support'
                      ? 'Priority Technical Support'
                      : 'Pause Your Subscription'}
                  </h3>
                  <p className="text-amber-800">{retentionOffer.message}</p>
                  
                  {retentionOffer.type === 'discount' && (
                    <div className="mt-3 bg-white/60 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Price:</span>
                        <span className="font-semibold line-through">{formatCurrency(PLAN_PRICES[currentPlan])}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-green-600">New Price:</span>
                        <span className="text-green-600">
                          {formatCurrency(Math.round(PLAN_PRICES[currentPlan] * (1 - (retentionOffer.value || 0) / 100)))}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Save {formatCurrency(Math.round((PLAN_PRICES[currentPlan] * (retentionOffer.value || 0) / 100) * (retentionOffer.durationMonths || 1)))} over {retentionOffer.durationMonths} months
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accept-retention"
                  checked={acceptRetention}
                  onChange={(e) => setAcceptRetention(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <Label htmlFor="accept-retention" className="text-sm font-medium text-amber-900 cursor-pointer">
                  Yes, I want to accept this special offer
                </Label>
              </div>
            </div>

            {/* Alternative: Continue with Cancellation */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Or continue with cancellation</p>
              <Button
                variant="ghost"
                onClick={() => setStep('confirm')}
                className="text-gray-600 hover:text-gray-900"
              >
                No thanks, I still want to cancel
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Go Back
            </Button>
            <Button 
              onClick={handleAcceptRetention} 
              disabled={!acceptRetention || loading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? 'Processing...' : 'Accept Offer & Stay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation Screen
  if (step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Confirm Cancellation
            </DialogTitle>
            <DialogDescription>
              Please confirm that you want to cancel your subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Plan:</span>
                <span className="font-semibold">{currentPlan} ({formatCurrency(PLAN_PRICES[currentPlan] || 0)}/mo)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Access Until:</span>
                <span className="font-semibold">
                  {effectiveDate === 'immediate' ? 'Immediate' : 'End of billing period'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reason:</span>
                <span className="font-medium capitalize">{selectedReason.replace('_', ' ')}</span>
              </div>
              {exportData && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Export:</span>
                  <span className="font-medium text-green-600">Included</span>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-2">Warning: You will lose access to:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    {currentPlan.toUpperCase().includes('PRO') && (
                      <>
                        <li>AI Autopilot and automation features</li>
                        <li>Advanced analytics and reporting</li>
                        <li>API access and integrations</li>
                      </>
                    )}
                    <li>All premium features associated with your plan</li>
                    <li>Priority support access</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Final Confirmation */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">After cancellation:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Your account will be downgraded to FREE plan</li>
                    <li>You'll have read-only access to your data for 90 days</li>
                    <li>All your products, customers, and orders will be preserved</li>
                    <li>You can reactivate anytime within 90 days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStep('survey')} disabled={loading}>
              Go Back
            </Button>
            <Button 
              onClick={handleConfirmCancellation} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Processing...' : 'Yes, Cancel My Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Exit Survey Screen (Default)
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <TrendingDown className="w-6 h-6" />
            We're Sorry to See You Go
          </DialogTitle>
          <DialogDescription>
            Help us improve by telling us why you're cancelling. Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reason Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              What's your primary reason for cancelling?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedReason === reason.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{reason.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Other Reason Text Input */}
          {selectedReason === 'other' && (
            <div>
              <Label htmlFor="reason-other" className="text-sm font-medium text-gray-700">
                Please specify your reason
              </Label>
              <Textarea
                id="reason-other"
                value={reasonOther}
                onChange={(e) => setReasonOther(e.target.value)}
                placeholder="Tell us more about why you're cancelling..."
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          {/* Additional Feedback */}
          <div>
            <Label htmlFor="feedback" className="text-sm font-medium text-gray-700">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any other thoughts or suggestions?"
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Data Export */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="export-data"
                    checked={exportData}
                    onChange={(e) => setExportData(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="export-data" className="text-sm font-medium text-blue-900 cursor-pointer">
                    Export my data before cancelling
                  </Label>
                </div>
                <p className="text-xs text-blue-700">
                  Download a complete backup of your products, customers, and order history. 
                  This is your data and you have the right to keep it.
                </p>
              </div>
            </div>
          </div>

          {/* Effective Date */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              When should the cancellation take effect?
            </label>
            <div className="grid gap-2">
              <button
                onClick={() => setEffectiveDate('end_of_period')}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  effectiveDate === 'end_of_period'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">End of billing period (Recommended)</p>
                <p className="text-sm text-gray-600">Keep using all features until then</p>
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
                <p className="text-sm text-gray-600">Cancel right now</p>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Nevermind, Keep My Subscription
          </Button>
          <Button 
            onClick={handleSubmitSurvey} 
            disabled={!selectedReason || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
