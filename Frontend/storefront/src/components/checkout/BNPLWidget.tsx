"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Calendar as _Calendar,
  Shield,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BNPLQuote {
  eligible: boolean;
  totalAmount: number;
  upfrontAmount: number;
  installmentAmount: number;
  numberOfInstallments: number;
  provider: string;
  reason?: string;
}

interface BNPLWidgetProps {
  orderId: string;
  totalAmount: number; // in kobo
  customerEmail: string;
  customerPhone: string;
  onApply: (provider: string) => void;
  onCancel: () => void;
  className?: string;
}

const PROVIDERS = [
  { id: "paystack", name: "Paystack BNPL", color: "bg-blue-500" },
  { id: "carbon", name: "Carbon", color: "bg-emerald-500" },
  { id: "credpal", name: "CredPal", color: "bg-purple-500" },
];

export function BNPLWidget({
  orderId,
  totalAmount,
  customerEmail: _customerEmail,
  customerPhone: _customerPhone,
  onApply,
  onCancel,
  className,
}: BNPLWidgetProps) {
  const [quotes, setQuotes] = useState<BNPLQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [_error, setError] = useState<string | null>(null);

  // Fetch BNPL quotes on mount
  useEffect(() => {
    fetchQuotes();
  }, [totalAmount]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      // Call BNPL eligibility API
      const response = await fetch(`/api/bnpl/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: totalAmount,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch quotes");
      
      const data = await response.json();
      setQuotes(data.quotes || []);
      
      // Auto-select first eligible provider
      const firstEligible = data.quotes?.find((q: BNPLQuote) => q.eligible);
      if (firstEligible) {
        setSelectedProvider(firstEligible.provider);
      }
    } catch (err) {
      setError("Could not check BNPL eligibility");
      console.error("[BNPL] Quote error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (kobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(kobo / 100);
  };

  const eligibleQuotes = quotes.filter((q) => q.eligible);
  const selectedQuote = quotes.find((q) => q.provider === selectedProvider);

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  // No eligible providers
  if (eligibleQuotes.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Pay in Installments</h3>
            <p className="text-muted-foreground mt-1">
              BNPL is not available for this order amount (minimum ₦10,000)
            </p>
            <Button variant="outline" className="mt-4" onClick={onCancel}>
              Back to Payment
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-full">
            <CreditCard className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Buy Now, Pay Later</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Split your payment into {selectedQuote?.numberOfInstallments || 3} easy installments
            </p>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            0% Interest
          </Badge>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Choose Provider</label>
          <div className="grid grid-cols-1 gap-2">
            {eligibleQuotes.map((quote) => {
              const provider = PROVIDERS.find((p) => p.id === quote.provider);
              const isSelected = selectedProvider === quote.provider;
              
              return (
                <Button
                  key={quote.provider}
                  onClick={() => setSelectedProvider(quote.provider)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", provider?.color)} />
                  <div className="flex-1">
                    <span className="font-medium">{provider?.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(quote.upfrontAmount)} upfront, then{" "}
                      {quote.numberOfInstallments} × {formatAmount(quote.installmentAmount)}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Payment Breakdown */}
        {selectedQuote && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-600">Payment Schedule</h4>
            
            {/* Upfront */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Today</p>
                  <p className="text-xs text-muted-foreground">Upfront payment</p>
                </div>
              </div>
              <span className="font-semibold">
                {formatAmount(selectedQuote.upfrontAmount)}
              </span>
            </div>

            {/* Installments */}
            {Array.from({ length: selectedQuote.numberOfInstallments }).map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() + i + 1);
              
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                      {i + 2}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Installment {i + 1}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatAmount(selectedQuote.installmentAmount)}
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold">{formatAmount(selectedQuote.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <Shield className="h-4 w-4 text-blue-500" />
          <span>Your application will be processed securely by the selected provider</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => selectedProvider && onApply(selectedProvider)}
            disabled={!selectedProvider}
          >
            Apply for {formatAmount(selectedQuote?.upfrontAmount || 0)} upfront
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default BNPLWidget;

