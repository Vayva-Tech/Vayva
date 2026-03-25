"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vayva/ui";
import { PLANS, formatNGN, type PlanKey } from "@/config/pricing";
import { toast } from "sonner";

interface InitResponse {
  success: boolean;
  data?: { access_code: string; reference: string };
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  data?: { email: string; storeId: string; planKey: PlanKey };
  error?: string;
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) return resolve();

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const planParam = searchParams.get("plan") as PlanKey | null;
  const emailParam = searchParams.get("email");
  const storeParam = searchParams.get("store");

  const [planKey, setPlanKey] = useState<PlanKey>(planParam || "pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.key === planKey) || PLANS[0];
  const amount = plan.monthlyAmount;

  useEffect(() => {
    if (!emailParam || !storeParam) {
      setError("Missing signup information. Please start from the beginning.");
    }
  }, [emailParam, storeParam]);

  const handlePayment = async () => {
    if (!emailParam || !storeParam) {
      setError("Invalid signup session. Please restart signup.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize Paystack payment
      const initRes = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey,
          email: emailParam,
          storeId: storeParam,
          amount: amount * 100, // Paystack expects kobo
        }),
      });

      const initJson = (await initRes.json()) as InitResponse;

      if (!initJson.success || !initJson.data) {
        throw new Error(initJson.error || "Failed to initialize payment");
      }

      await loadPaystackScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (window as any).PaystackPop;

      if (!PaystackPop?.setup) {
        throw new Error("Paystack is unavailable");
      }

      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: emailParam.toLowerCase(),
        access_code: initJson.data.access_code,
        ref: initJson.data.reference,
        metadata: {
          custom_fields: [
            { display_name: "Plan", variable_name: "planKey", value: planKey },
            { display_name: "Store ID", variable_name: "storeId", value: storeParam },
          ],
        },
        callback: async (response: { reference: string }) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/public/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            });

            const verifyJson = (await verifyRes.json()) as VerifyResponse;

            if (!verifyJson.success) {
              throw new Error(verifyJson.error || "Payment verification failed");
            }

            toast.success("Payment successful! Activating your plan...");
            
            // Redirect to success page
            setTimeout(() => {
              router.push(`/checkout/success?reference=${response.reference}`);
            }, 1000);
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Verification failed";
            router.push(`/checkout/success?status=failed&reason=${encodeURIComponent(msg)}`);
          }
        },
        onClose: () => {
          setLoading(false);
          toast.info("Payment cancelled");
        },
      });

      handler.openIframe();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed";
      setError(msg);
      setLoading(false);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex items-center justify-center p-4">
      <ErrorBoundary
        name="Plan Activation Checkout"
        fallback={
          <Card className="w-full max-w-lg">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold text-red-900 mb-2">Checkout unavailable</h3>
              <p className="text-red-700 mb-4">Please refresh and try again.</p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </CardContent>
          </Card>
        }
      >
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <CardTitle className="text-3xl font-black">
              Activate Your {plan.name} Plan
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Complete payment to unlock all {plan.name.toLowerCase()} features
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Plan Summary */}
            <div className="rounded-2xl border-2 border-slate-900/10 bg-gradient-to-r from-emerald-50 to-purple-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Selected Plan</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{plan.name}</p>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold">
                  {plan.name === "Pro" ? "Most Popular" : "Premium"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {plan.bullets.slice(0, 4).map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Amount due today</p>
                    <p className="text-3xl font-black text-slate-900">{formatNGN(amount)}</p>
                    <p className="text-xs text-slate-500 mt-1">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Next billing</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Display */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Account Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-900">{emailParam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Store ID:</span>
                  <span className="font-medium text-slate-900">{storeParam}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Payment Method</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-xl">💳</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Paystack Secure Payment</p>
                    <p className="text-xs text-slate-500">Visa, Mastercard, Verve, Bank Transfer, USSD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-700 hover:to-purple-700 shadow-lg"
                onClick={handlePayment}
                disabled={loading || !!error}
              >
                {loading ? "Processing..." : `Pay ${formatNGN(amount)} & Activate`}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/")}
                disabled={loading}
              >
                Cancel and Return Home
              </Button>
            </div>

            <p className="text-xs text-center text-slate-500">
              By completing this payment, you agree to our{" "}
              <a href="/legal/terms" className="underline hover:text-slate-900">Terms</a>
              {" "}and{" "}
              <a href="/legal/privacy" className="underline hover:text-slate-900">Privacy Policy</a>.
            </p>
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-purple-50">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
              <p className="text-slate-600">Loading checkout...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
