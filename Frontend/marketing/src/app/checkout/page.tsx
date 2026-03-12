"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label } from "@vayva/ui";
import { PLANS, formatNGN, type PlanKey } from "@/config/pricing";
import { Check, ArrowLeft, Loader2, Shield } from "lucide-react";

type InitResponse =
  | { success: true; data: { access_code: string; reference: string } }
  | { success: false; error: string };

type VerifyResponse =
  | { success: true; data: { email: string; storeId: string; planKey: PlanKey } }
  | { success: false; error: string };

function isPlanKey(value: string | null): value is PlanKey {
  return value === "free" || value === "starter" || value === "pro";
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

export default function CheckoutPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const [planKey, setPlanKey] = useState<PlanKey>(
    isPlanKey(planParam) ? planParam : "starter",
  );
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(() => PLANS.find((p) => p.key === planKey)!, [planKey]);

  const handleProceed = async () => {
    setError(null);

    if (planKey === "free") {
      setError("Free plan does not require checkout. Please create your account.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError("Payment is temporarily unavailable (Paystack public key missing).");
      return;
    }

    setLoading(true);
    try {
      const initRes = await fetch("/api/public/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, email }),
      });
      const initJson = (await initRes.json()) as InitResponse;
      if (!initRes.ok || !initJson.success) {
        throw new Error(initJson.success ? "Failed to initialize payment" : initJson.error);
      }

      await loadPaystackScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (window as unknown as Record<string, unknown>).PaystackPop as undefined | {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setup: (args: unknown) => { openIframe: () => void };
      };

      if (!PaystackPop?.setup) {
        throw new Error("Paystack is unavailable");
      }

      const handler = PaystackPop.setup({
        key: publicKey,
        email: email.toLowerCase(),
        access_code: initJson.data.access_code,
        ref: initJson.data.reference,
        metadata: {
          custom_fields: [
            { display_name: "Plan", variable_name: "planKey", value: planKey },
          ],
        },
        callback: async (response: { reference: string }) => {
          try {
            const verifyRes = await fetch("/api/public/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            });
            const verifyJson = (await verifyRes.json()) as VerifyResponse;
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(
                verifyJson.success ? "Payment verification failed" : verifyJson.error,
              );
            }

            // Redirect to confirmation page with email for password setup
            const url = new URL("/checkout/confirm", window.location.origin);
            url.searchParams.set("email", verifyJson.data.email);
            url.searchParams.set("plan", verifyJson.data.planKey);
            url.searchParams.set("status", "success");
            window.location.href = url.toString();
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Verification failed";
            window.location.href = `/checkout/confirm?status=failed&reason=${encodeURIComponent(msg)}`;
          }
        },
        onClose: () => {
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      setLoading(false);
    }
  };

  const paidPlans = PLANS.filter(p => p.key !== "free");

  return (
    <div className="max-w-[600px] mx-auto px-4 sm:px-6">
      {/* Back Link */}
      <Link 
        href="/pricing" 
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to pricing
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-xl font-semibold text-slate-900">Complete your purchase</h1>
          <p className="text-sm text-slate-500 mt-1">Select a plan and enter your email</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Select plan</Label>
            <div className="space-y-3">
              {paidPlans.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPlanKey(p.key)}
                  disabled={loading}
                  className={`w-full relative p-4 rounded-xl border-2 text-left transition-all ${
                    planKey === p.key
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      <p className="text-sm text-slate-500 mt-0.5">{p.tagline}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{formatNGN(p.monthlyAmount)}</span>
                      <span className="text-sm text-slate-500">/mo</span>
                    </div>
                  </div>
                  {planKey === p.key && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              We&apos;ll send your receipt and account setup link to this email
            </p>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Secure payment powered by Paystack</span>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={loading}
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              I agree to the{" "}
              <Link className="text-emerald-600 hover:text-emerald-700 underline" href="/legal/terms" target="_blank">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link className="text-emerald-600 hover:text-emerald-700 underline" href="/legal/privacy" target="_blank">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            disabled={loading}
            onClick={handleProceed}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay {formatNGN(plan.monthlyAmount)}</>
            )}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a className="text-emerald-600 hover:text-emerald-700 font-medium" href="https://merchant.vayva.ng/signin">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
