// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { logger } from "@vayva/shared";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Icon } from "@vayva/ui";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { apiJson } from "@/lib/api-client-shared";

export default function SubscriptionCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentStatus = searchParams.get("payment");
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (paymentStatus === "success" && reference && !verified && !verifying) {
      void handleVerifyPayment(reference);
    }
  }, [paymentStatus, reference, verified, verifying]);

  const handleVerifyPayment = async (ref: string) => {
    setVerifying(true);
    try {
      await apiJson<{ success: boolean }>("/api/billing/verify-payment", {
        method: "POST",
        body: JSON.stringify({ reference: ref }),
      });

      setVerified(true);
      toast.success("Subscription updated successfully!");

      setTimeout(() => {
        router.push("/dashboard/billing");
      }, 2000);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[VERIFY_SUBSCRIPTION_ERROR]", {
        error: _errMsg,
        reference: ref,
        app: "merchant",
      });
      setError(_errMsg || "Failed to verify payment");
      toast.error(_errMsg || "Payment verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (paymentStatus !== "success") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <Breadcrumbs />
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 mt-4">
          <div className="flex items-start gap-4">
            <Icon name="AlertTriangle" className="text-yellow-600" size={24} />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">
                Payment Status Unknown
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                We couldn't determine the status of your payment. Please check
                your billing page.
              </p>
              <Button onClick={() => router.push("/dashboard/billing")}>
                Go to Billing
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <Breadcrumbs />
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 mt-4">
          <div className="flex items-start gap-4">
            <Icon name="XCircle" className="text-red-600" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/dashboard/billing")}>
                  Go to Billing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reference && handleVerifyPayment(reference)}
                >
                  Retry Verification
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <Breadcrumbs />
        <div className="bg-green-50 border border-green-100 rounded-xl p-6 mt-4">
          <div className="flex items-start gap-4">
            <Icon name="CheckCircle" className="text-green-600" size={24} />
            <div>
              <h3 className="font-bold text-green-900 mb-2">
                Payment Verified!
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Your subscription has been updated successfully. Redirecting to
                billing...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <Breadcrumbs />
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-4">
        <div className="flex items-start gap-4">
          <div className="animate-spin">
            <Icon name="Loader" className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">
              Verifying Payment...
            </h3>
            <p className="text-sm text-blue-700">
              Please wait while we confirm your payment with Paystack.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
