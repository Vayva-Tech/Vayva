"use client";

import React, { useState } from "react";
import { Button } from "@vayva/ui";

interface ActivationProgressProps {
  firstOrder: boolean;
  firstPayment: boolean;
  firstCompletion: boolean;
  onDismiss?: () => void;
}

export function ActivationProgress({
  firstOrder,
  firstPayment,
  firstCompletion,
  onDismiss,
}: ActivationProgressProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if all steps complete or dismissed
  if (dismissed || (firstOrder && firstPayment && firstCompletion)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-black">Setup progress</h3>
        <Button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-900 text-sm"
          aria-label="Dismiss"
        >
          ×
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              firstOrder ? "bg-green-500" : "bg-border"
            }`}
          >
            {firstOrder && <span className="text-white text-xs">✓</span>}
          </div>
          <span
            className={`text-sm ${firstOrder ? "text-black" : "text-gray-500"}`}
          >
            Receive first order
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              firstPayment ? "bg-green-500" : "bg-border"
            }`}
          >
            {firstPayment && <span className="text-white text-xs">✓</span>}
          </div>
          <span
            className={`text-sm ${firstPayment ? "text-black" : "text-gray-500"}`}
          >
            Record a payment
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              firstCompletion ? "bg-green-500" : "bg-border"
            }`}
          >
            {firstCompletion && <span className="text-white text-xs">✓</span>}
          </div>
          <span
            className={`text-sm ${firstCompletion ? "text-black" : "text-gray-500"}`}
          >
            Complete an order
          </span>
        </div>
      </div>
    </div>
  );
}
