/**
 * AI Credits Hook
 * ================
 * React hook for managing AI credit state in merchant dashboard
 */

import { useState, useEffect, useCallback } from 'react';

export interface AICreditSummary {
  totalCreditsPurchased: number;
  creditsRemaining: number;
  creditsUsed: number;
  percentageUsed: number;
  isLowCredit: boolean;
  estimatedRequestsRemaining: number;
  showAlert: boolean;
}

export function useAICredits() {
  const [credits, setCredits] = useState<AICreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch credit summary
  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/credits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }

      const result = await response.json();
      setCredits(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Purchase additional credits
  const purchaseCredits = useCallback(async (amount: number, paymentReference?: string) => {
    try {
      const response = await fetch('/api/ai/credits/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditsAmount: amount,
          paymentReference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Top-up failed');
      }

      const result = await response.json();
      
      // Refresh credit balance after successful top-up
      await fetchCredits();

      return { success: true, data: result.data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Top-up failed' 
      };
    }
  }, [fetchCredits]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    refreshCredits: fetchCredits,
    purchaseCredits,
  };
}
