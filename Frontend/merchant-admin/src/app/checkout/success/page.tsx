"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiJson } from "@/lib/api-client-shared";

type PaymentType = "order" | "subscription" | "template_purchase" | "unknown";

interface PaymentVerification {
  success: boolean;
  message: string;
  type: PaymentType;
  orderId?: string;
  subscriptionId?: string;
  planKey?: string;
  billingCycle?: "monthly" | "quarterly";
  amount?: number;
  nextBillingDate?: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [verification, setVerification] = useState<PaymentVerification | null>(null);

  const verifyPayment = async (ref: string) => {
    try {
      const response = await apiJson<PaymentVerification>("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify({ reference: ref }),
      });

      setVerification(response);
      setStatus(response.success ? "success" : "failed");
    } catch (error) {
      setStatus("failed");
      setVerification({
        success: false,
        message: error instanceof Error ? error.message : "Payment verification failed",
        type: "unknown",
      });
    }
  };

  useEffect(() => {
    if (!reference) {
      queueMicrotask(() => setStatus("failed"));
      queueMicrotask(() => setVerification({ success: false, message: "No payment reference found", type: "unknown" }));
      return;
    }

    verifyPayment(reference);
  }, [reference]);

  const getSuccessMessage = () => {
    switch (verification?.type) {
      case "subscription":
        return `Your ${verification.planKey?.toLowerCase()} plan subscription is now active!`;
      case "order":
        return "Your payment has been processed successfully.";
      case "template_purchase":
        return "Your template purchase is complete!";
      default:
        return "Your payment has been processed successfully.";
    }
  };

  const getPrimaryAction = () => {
    switch (verification?.type) {
      case "subscription":
        return {
          href: "/dashboard",
          label: "Go to Dashboard",
          icon: null,
        };
      case "order":
        return {
          href: verification?.orderId ? `/dashboard/orders/${verification.orderId}` : "/dashboard/orders",
          label: "View Your Order",
          icon: ArrowRight,
        };
      case "template_purchase":
        return {
          href: "/dashboard/store/themes",
          label: "View Your Themes",
          icon: null,
        };
      default:
        return {
          href: "/dashboard",
          label: "Go to Dashboard",
          icon: null,
        };
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <CardTitle className="text-xl mb-2">Payment Failed</CardTitle>
            <CardDescription className="text-center mb-6">
              {verification?.message || "We couldn't verify your payment. Please try again."}
            </CardDescription>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = "/dashboard"}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryAction = getPrimaryAction();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {verification?.type === "subscription" ? (
            <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          ) : (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">
            {verification?.type === "subscription" ? "Subscription Activated!" : "Payment Successful!"}
          </CardTitle>
          <CardDescription>
            {getSuccessMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verification?.amount && (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{verification.amount.toLocaleString()}
              </p>
            </div>
          )}
          {verification?.type === "subscription" && (
            <div className="space-y-2">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600">Plan</p>
                <p className="text-lg font-semibold text-blue-900">
                  {verification.planKey} ({verification.billingCycle === "quarterly" ? "Quarterly" : "Monthly"})
                </p>
              </div>
              {verification.nextBillingDate && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="font-medium">
                    {new Date(verification.nextBillingDate).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
          {verification?.orderId && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-medium">{verification.orderId}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => window.location.href = primaryAction.href}>
              {primaryAction.label}
              {primaryAction.icon && <primaryAction.icon className="ml-2 h-4 w-4" />}
            </Button>
            {verification?.type === "subscription" && (
              <Button variant="outline" onClick={() => window.location.href = "/dashboard/settings/billing"}>
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
