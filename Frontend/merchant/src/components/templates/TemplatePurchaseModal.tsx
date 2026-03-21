// @ts-nocheck
/**
 * Template Purchase Modal
 * Shows confirmation dialog for purchasing additional templates
 */

'use client';

import React from 'react';
import { Button, Dialog } from '@vayva/ui';
import { Zap, AlertTriangle, Info } from '@phosphor-icons/react';
import { useTemplatePurchase } from '@/hooks/useTemplatePurchase';

interface TemplatePurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  templatePreview?: string;
  userCredits: number;
  onSuccess?: () => void;
}

const TEMPLATE_COST = 5000;

export function TemplatePurchaseModal({
  open,
  onOpenChange,
  templateId,
  templateName,
  templatePreview,
  userCredits,
  onSuccess,
}: TemplatePurchaseModalProps) {
  const { purchaseTemplate, isPurchasing } = useTemplatePurchase();
  const canAfford = userCredits >= TEMPLATE_COST;

  const handlePurchase = async () => {
    const result = await purchaseTemplate(templateId);
    
    if (result?.success) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-50">
          <Dialog.Title className="text-lg font-bold text-gray-900 mb-2">
            Purchase Additional Template
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-6">
            Confirm your template purchase
          </Dialog.Description>

          {/* Template Preview */}
          <div className="mb-6">
            {templatePreview ? (
              <img 
                src={templatePreview} 
                alt={templateName}
                className="w-full h-40 object-cover rounded-xl border border-gray-200"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <Info size={48} className="text-gray-400" />
              </div>
            )}
            <h3 className="text-base font-semibold text-gray-900 mt-3">
              {templateName}
            </h3>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Template Cost</span>
              <span className="font-semibold text-gray-900">{TEMPLATE_COST.toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Your Balance</span>
              <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits.toLocaleString()} credits
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining After Purchase</span>
                <span className={`font-bold ${(userCredits - TEMPLATE_COST) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(userCredits - TEMPLATE_COST).toLocaleString()} credits
                </span>
              </div>
            </div>
          </div>

          {/* Warning if insufficient credits */}
          {!canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Insufficient Credits</p>
                  <p className="text-xs text-red-700 mt-1">
                    You need {TEMPLATE_COST - userCredits} more credits to purchase this template. 
                    Consider upgrading to Pro for 10,000 monthly credits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What You Get */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
            <p className="text-xs font-semibold text-blue-800 mb-2">✨ What's Included:</p>
            <ul className="space-y-1">
              <li className="text-xs text-blue-700 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full" />
                Permanent ownership of this template
              </li>
              <li className="text-xs text-blue-700 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full" />
                Switch between owned templates anytime
              </li>
              <li className="text-xs text-blue-700 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full" />
                Full customization access
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPurchasing}
              className="flex-1 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!canAfford || isPurchasing}
              className={cn(
                "flex-1 rounded-xl font-semibold px-4 py-2.5 transition-all",
                canAfford 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </span>
              ) : (
                `Purchase for ${TEMPLATE_COST.toLocaleString()} Credits`
              )}
            </Button>
          </div>

          {/* Upgrade Prompt */}
          {!canAfford && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/control-center/pro">
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 font-medium">
                  Upgrade to Pro →
                </Button>
              </Link>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Helper imports
import { Link } from '@vayva/ui';
import { Loader2 } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
