/**
 * AI Credit Usage Widget
 * =======================
 * Displays merchant's AI credit balance, usage, and top-up options
 */

'use client';

import React from 'react';
import { useAICredits } from '@/hooks/use-ai-credits';

export function AICreditWidget() {
  const { credits, loading, error, purchaseCredits } = useAICredits();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !credits) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <p className="text-red-800">Failed to load credit information</p>
      </div>
    );
  }

  const handleTopUp = async () => {
    const confirmed = confirm(
      'Add 1,000 AI credits for ₦3,000?\n\nThis will be processed via Paystack.'
    );
    
    if (confirmed) {
      // In production, integrate with Paystack here
      const result = await purchaseCredits(1000);
      
      if (result.success) {
        alert('✅ Successfully added 1,000 credits!');
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">AI Credits</h2>
        {credits.isLowCredit && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium animate-pulse">
            Low Balance
          </span>
        )}
      </div>

      {/* Credit Balance Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-green-600">
            {credits.creditsRemaining.toLocaleString()}
          </span>
          <span className="text-gray-500">/ {credits.totalCreditsPurchased.toLocaleString()} credits</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              credits.percentageUsed > 90 ? 'bg-red-500' :
              credits.percentageUsed > 70 ? 'bg-orange-500' :
              'bg-green-500'
            }`}
            style={{ width: `${credits.percentageUsed}%` }}
          />
        </div>
        
        <div className="mt-2 flex justify-between text-sm text-gray-600">
          <span>Used: {credits.creditsUsed.toLocaleString()}</span>
          <span>{credits.percentageUsed}% used</span>
        </div>
      </div>

      {/* Low Credit Alert Banner */}
      {credits.showAlert && (
        <div className="mb-6 bg-orange-50 border-l-4 border-amber-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                <strong>Low Credit Alert:</strong> You have less than 200 credits remaining. 
                Top up now to avoid interruption of AI services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Est. Requests Left</p>
          <p className="text-2xl font-bold text-gray-900">
            {credits.estimatedRequestsRemaining.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Cost/Request</p>
          <p className="text-2xl font-bold text-gray-900">~5 credits</p>
        </div>
      </div>

      {/* Top-Up Button */}
      <button
        onClick={handleTopUp}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add 1,000 Credits - ₦3,000
      </button>

      {/* Info Text */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        Credits never expire • Instant activation • Secure payment via Paystack
      </p>
    </div>
  );
}
