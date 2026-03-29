/**
 * Hook for template purchase functionality
 */

import { useState } from 'react';
import { toast } from 'sonner';

interface PurchaseTemplateResult {
  success: boolean;
  templateId?: string;
  remainingCredits?: number;
  totalOwned?: number;
  message?: string;
  error?: string;
}

export function useTemplatePurchase() {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchaseTemplate = async (templateId: string): Promise<PurchaseTemplateResult | null> => {
    setIsPurchasing(true);
    
    try {
      const res = await fetch('/templates/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to purchase template');
      }

      toast.success(data.message || 'Template purchased successfully!');
      
      return {
        success: true,
        templateId: data.templateId,
        remainingCredits: data.remainingCredits,
        totalOwned: data.totalOwned,
        message: data.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPurchasing(false);
    }
  };

  return {
    purchaseTemplate,
    isPurchasing,
  };
}
