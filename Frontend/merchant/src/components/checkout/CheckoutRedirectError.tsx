"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@vayva/ui";
import { WarningCircle, ArrowRight, Lifebuoy } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";

interface CheckoutRedirectErrorProps {
  expectedPlan?: string;
  email?: string;
}

export function CheckoutRedirectErrorHandler({ expectedPlan, email }: CheckoutRedirectErrorProps) {
  const router = useRouter();
  const [errorType, setErrorType] = useState<string | null>(null);
  const [attemptedFix, setAttemptedFix] = useState(false);

  useEffect(() => {
    // Check for common redirect failure scenarios
    const checkRedirectHealth = async () => {
      try {
        if (!expectedPlan || !["pro", "pro_plus"].includes(expectedPlan)) {
          setErrorType("INVALID_PLAN");
          logger.error("[CHECKOUT_REDIRECT_ERROR] Invalid or missing plan", {
            expectedPlan,
            email,
          });
          return;
        }

        if (!email || !email.includes("@")) {
          setErrorType("INVALID_EMAIL");
          logger.error("[CHECKOUT_REDIRECT_ERROR] Invalid email", {
            expectedPlan,
            email,
          });
          return;
        }

        // Try to fetch store status to verify plan
        try {
          const response = await fetch("/api/merchant/store/status", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          
          if (!response.ok) {
            setErrorType("API_ERROR");
            logger.error("[CHECKOUT_REDIRECT_ERROR] Store status API failed", {
              status: response.status,
            });
            return;
          }

          const data = await response.json();
          const storedPlan = data?.metadata?.intendedPlanKey;
          
          if (storedPlan && storedPlan !== expectedPlan) {
            setErrorType("PLAN_MISMATCH");
            logger.warn("[CHECKOUT_REDIRECT_ERROR] Plan mismatch", {
              expected: expectedPlan,
              stored: storedPlan,
            });
          }
        } catch (fetchError) {
          setErrorType("NETWORK_ERROR");
          logger.error("[CHECKOUT_REDIRECT_ERROR] Network error checking store", {
            error: fetchError,
          });
        }
      } catch (error) {
        setErrorType("UNKNOWN_ERROR");
        logger.error("[CHECKOUT_REDIRECT_ERROR] Unexpected error", { error });
      }
    };

    checkRedirectHealth();
  }, [expectedPlan, email]);

  const handleManualRedirect = () => {
    setAttemptedFix(true);
    try {
      const checkoutUrl = `/checkout?plan=${expectedPlan}&email=${encodeURIComponent(email || "")}`;
      router.push(checkoutUrl);
    } catch (redirectError) {
      logger.error("[CHECKOUT_REDIRECT_ERROR] Manual redirect failed", {
        error: redirectError,
      });
    }
  };

  const handleContactSupport = () => {
    // Log detailed error for support team
    logger.error("[CHECKOUT_REDIRECT_ERROR] User escalated to support", {
      expectedPlan,
      email,
      errorType,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
    
    router.push("/dashboard/support");
  };

  if (!errorType) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <WarningCircle size={40} weight="fill" />
            <h2 className="text-2xl font-bold">Checkout Redirect Issue</h2>
          </div>
          <p className="text-white/90 text-sm">
            We couldn't automatically redirect you to checkout. Don't worry - we can fix this manually.
          </p>
        </div>

        {/* Error Details */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-red-800 mb-2">
              Detected Issue:
            </p>
            <p className="text-sm text-red-700">
              {errorType === "INVALID_PLAN" && "The selected plan is invalid or expired."}
              {errorType === "INVALID_EMAIL" && "The email address provided is invalid."}
              {errorType === "API_ERROR" && "We couldn't verify your store information."}
              {errorType === "PLAN_MISMATCH" && "There's a mismatch in your plan selection."}
              {errorType === "NETWORK_ERROR" && "A network error prevented checkout access."}
              {errorType === "UNKNOWN_ERROR" && "An unexpected error occurred."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleManualRedirect}
              disabled={attemptedFix}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
            >
              {attemptedFix ? "Redirecting..." : "Continue to Checkout"}
              {!attemptedFix && <ArrowRight className="ml-2" />}
            </Button>

            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="w-full h-12 rounded-xl font-semibold"
            >
              <Lifebuoy className="mr-2" />
              Contact Support
            </Button>
          </div>

          {/* Debug Info (for support) */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              Technical Details (share with support if needed):
            </p>
            <code className="block bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono">
              Error Type: {errorType}<br/>
              Plan: {expectedPlan || "N/A"}<br/>
              Email: {email || "N/A"}<br/>
              Time: {new Date().toLocaleString()}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

// HOC wrapper for checkout pages to add automatic error handling
export function withCheckoutRedirect<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  planExtractor?: (props: P) => string | undefined,
  emailExtractor?: (props: P) => string | undefined
) {
  return function CheckoutRedirectWrapper(props: P) {
    const [showError, setShowError] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const expectedPlan = planExtractor ? planExtractor(props) : searchParams.get("plan");
    const email = emailExtractor ? emailExtractor(props) : searchParams.get("email");

    useEffect(() => {
      // Validate redirect parameters after component mounts
      if (expectedPlan && ["pro", "pro_plus"].includes(expectedPlan) && email) {
        // Give it 2 seconds to load, then check if redirect happened
        const timeout = setTimeout(() => {
          // If still on same page after 2s, show error handler
          setShowError(true);
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    }, [expectedPlan, email]);

    if (showError) {
      return (
        <>
          <WrappedComponent {...props} />
          <CheckoutRedirectErrorHandler expectedPlan={expectedPlan} email={email || undefined} />
        </>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
