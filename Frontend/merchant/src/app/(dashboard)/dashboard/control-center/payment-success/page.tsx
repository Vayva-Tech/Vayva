"use client";
import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Spinner as Loader2,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

import { apiJson } from "@/lib/api-client-shared";

interface VerifyPaymentResponse {
  success: boolean;
}

export default function TemplateSwitchPaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying",
  );

  useEffect(() => {
    const reference = searchParams?.get("reference");

    if (!reference) {
      setTimeout(() => setStatus("failed"), 0);
      return;
    }

    const verifyPayment = async () => {
      try {
        const data = await apiJson<VerifyPaymentResponse>(
          `/api/billing/template-switch/verify?reference=${reference}`,
        );
        if (data?.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard/control-center");
          }, 3000);
        } else {
          setStatus("failed");
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[VERIFY_PAYMENT_ERROR]", {
          error: _errMsg,
          reference,
          app: "merchant",
        });
        setStatus("failed");
      }
    };

    void verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {status === "verifying" && (
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
          <h2 className="text-xl font-bold">Verifying Payment...</h2>
          <p className="text-gray-500 mt-2">
            Please wait while we confirm your payment.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Template Switched Successfully!</h2>
          <p className="text-gray-500 mt-2">
            Your new template is now active.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Redirecting to Control Center...
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Payment Verification Failed</h2>
          <p className="text-gray-500 mt-2">
            We couldn't verify your payment. Please try again.
          </p>
          <Button
            onClick={() => router.push("/dashboard/control-center")}
            className="mt-4"
          >
            Back to Control Center
          </Button>
        </div>
      )}
    </div>
  );
}
