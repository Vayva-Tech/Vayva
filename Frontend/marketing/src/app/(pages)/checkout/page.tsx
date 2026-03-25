"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label } from "@vayva/ui";
import {
  PLANS,
  formatNGN,
  type PlanKey,
  type BillingCycle,
  getCheckoutDueNgn,
  QUARTERLY_DISCOUNT_PERCENT,
} from "@/config/pricing";
import { trackEvent } from "@/lib/analytics";
import { APP_URL } from "@/lib/constants";
import { useMarketingOffer } from "@/context/MarketingOfferContext";

type InitResponse =
  | { success: true; data: { access_code: string; reference: string } }
  | { success: false; error: string };

type VerifyResponse =
  | { success: true; data: { email: string; storeId: string; storeName: string; planKey: PlanKey } }
  | { success: false; error: string };

function isPlanKey(value: string | null): value is PlanKey {
  return value === "starter" || value === "pro" || value === "pro_plus";
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
  const { starterFirstMonthFree } = useMarketingOffer();
  const planParam = searchParams.get("plan");

  const [planKey, setPlanKey] = useState<PlanKey>(
    isPlanKey(planParam) ? planParam : "starter",
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cycle = searchParams.get("cycle");
    if (cycle === "quarterly") setBillingCycle("quarterly");
  }, [searchParams]);

  const plan = useMemo(() => PLANS.find((p) => p.key === planKey)!, [planKey]);

  const dueToday = useMemo(
    () => getCheckoutDueNgn(planKey, billingCycle, starterFirstMonthFree),
    [planKey, billingCycle, starterFirstMonthFree],
  );

  const isStarterMonthlyFree =
    starterFirstMonthFree && planKey === "starter" && billingCycle === "monthly";

  const quarterlySavingsVsMonthly = useMemo(() => {
    if (billingCycle !== "quarterly") return 0;
    return plan.monthlyAmount * 3 - dueToday;
  }, [plan.monthlyAmount, billingCycle, dueToday]);

  const handleProceed = async () => {
    setError(null);

    if (isStarterMonthlyFree) {
      setError("Starter monthly is free for your first month—use “Create merchant account” below (no Paystack charge).");
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

    if (!phone || phone.trim().length < 8) {
      setError("Enter a valid phone number.");
      return;
    }

    if (!storeName || storeName.trim().length < 2) {
      setError("Enter your business name.");
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
        body: JSON.stringify({
          planKey,
          billingCycle,
          email,
          phone,
          storeName,
        }),
      });
      const initJson = (await initRes.json()) as InitResponse;
      if (!initRes.ok || !initJson.success) {
        throw new Error(initJson.success ? "Failed to initialize payment" : initJson.error);
      }

      await loadPaystackScript();

      trackEvent("checkout_paystack_open", {
        plan_key: planKey,
        billing_cycle: billingCycle,
      });

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
          billingCycle,
          custom_fields: [
            { display_name: "Business", variable_name: "storeName", value: storeName },
            { display_name: "Phone", variable_name: "phone", value: phone },
            { display_name: "Plan", variable_name: "planKey", value: planKey },
            {
              display_name: "Billing",
              variable_name: "billingCycle",
              value: billingCycle,
            },
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

            const url = new URL("/checkout/confirm", window.location.origin);
            url.searchParams.set("email", verifyJson.data.email);
            url.searchParams.set("plan", verifyJson.data.planKey);
            url.searchParams.set("store", verifyJson.data.storeName);
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

  return (
    <ErrorBoundary
      name="Checkout"
      fallback={
        <div className="flex min-h-[600px] items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-900 mb-2">Checkout unavailable</h3>
            <p className="text-red-700 mb-4">Please refresh and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white text-slate-900">
        <div className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Checkout</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            <span className="md:hidden">
              {starterFirstMonthFree
                ? "Pay for paid plans here, or start Starter monthly free via merchant signup."
                : "Pay for Starter, Pro, or Pro+ here. Starter includes a 7-day trial via merchant signup."}
            </span>
            <span className="hidden md:inline">
              {starterFirstMonthFree ? (
                <>
                  Pay for quarterly Starter, Pro, or Pro+ here. Starter billed monthly is free for your first month—create
                  your account on the merchant app (no Paystack charge).
                </>
              ) : (
                <>
                  Pay for Starter, Pro, or Pro+ at checkout. Starter includes a 7-day trial—create your account on the
                  merchant app.
                </>
              )}
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 min-w-0">
        <section className="rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-5 sm:p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)] min-w-0">
          {isStarterMonthlyFree ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
              <div className="font-semibold">Starter: first month free</div>
              <div className="mt-1 text-emerald-800/80">
                We can&apos;t charge ₦0 through Paystack. Create your merchant account below to get about 30 days of
                Starter access with no card. After that, Starter bills monthly unless you cancel.
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
              <div className="font-semibold">Your payment is safe with us</div>
              <div className="mt-1 text-emerald-800/80">
                Card details are handled securely by Paystack. Vayva never stores your card information.
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-800">Payment method</div>
            <div className="mt-2 text-xs text-slate-600">
              Visa, Mastercard, Verve, bank transfer, and USSD.
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <select
                  id="plan"
                  value={planKey}
                  onChange={(e) => setPlanKey(e.target.value as PlanKey)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  disabled={loading}
                >
                  {PLANS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Billing</Label>
                <div
                  role="group"
                  aria-label="Billing cycle"
                  className="flex rounded-xl border border-slate-200 bg-slate-50 p-1"
                >
                  {(
                    [
                      { key: "monthly" as const, label: "Monthly" },
                      {
                        key: "quarterly" as const,
                        label: `Quarterly (−${QUARTERLY_DISCOUNT_PERCENT}%)`,
                      },
                    ] as const
                  ).map(({ key, label }) => (
                    <Button
                      key={key}
                      type="button"
                      variant="ghost"
                      disabled={loading}
                      aria-pressed={billingCycle === key}
                      onClick={() => setBillingCycle(key)}
                      className={`flex-1 min-h-[44px] h-auto rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${
                        billingCycle === key
                          ? "bg-white text-slate-900 shadow-sm hover:bg-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-transparent"
                      }`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {billingCycle === "quarterly" && quarterlySavingsVsMonthly > 0 && (
                  <p className="text-xs text-emerald-700">
                    Save {formatNGN(quarterlySavingsVsMonthly)} vs three separate monthly payments.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeName">Business name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Ada’s Kitchen"
                className="h-12 rounded-xl"
                disabled={loading}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="h-12 rounded-xl"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080..."
                  className="h-12 rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
                disabled={loading}
              />
              <span>
                I agree to the{" "}
                <Link className="underline" href="/legal/terms">
                  Terms
                </Link>
                {" "}and{" "}
                <Link className="underline" href="/legal/privacy">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {isStarterMonthlyFree ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  disabled={!agreed}
                  onClick={() => {
                    if (!agreed) {
                      setError("Please agree to the Terms and Privacy Policy.");
                      return;
                    }
                    window.location.href = `${APP_URL}/signup`;
                  }}
                >
                  Create merchant account — first month free
                </Button>
                <p className="text-xs text-slate-500">
                  Prefer to prepay and save? Switch billing to <strong>Quarterly</strong> above, then pay securely with
                  Paystack.
                </p>
              </div>
            ) : (
              <Button
                className="h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                disabled={loading}
                onClick={handleProceed}
              >
                {loading ? "Preparing payment..." : "Proceed to payment"}
              </Button>
            )}

            <div className="text-xs text-slate-500">
              Already have an account?{" "}
              <a className="underline" href={`${APP_URL}/signin`}>
                Sign in
              </a>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-5 sm:p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)] min-w-0">
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs font-semibold text-slate-500"
            aria-label="Checkout steps"
          >
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Details</span>
            </div>
            <div className="hidden sm:block h-px flex-1 min-w-[8px] bg-slate-200 mx-2" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Payment</span>
            </div>
            <div className="hidden sm:block h-px flex-1 min-w-[8px] bg-slate-200 mx-2" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 shrink-0 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Confirmation</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold text-slate-800">Order details</div>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{plan.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{plan.tagline}</div>
                </div>
                <div className="font-semibold">
                  {isStarterMonthlyFree ? "₦0 (use signup)" : formatNGN(dueToday)}
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                {plan.bullets.slice(0, 4).map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Order summary</div>
                <div className="mt-1 text-xs text-slate-600">
                  {billingCycle === "quarterly"
                    ? `Quarterly (3 months, ${QUARTERLY_DISCOUNT_PERCENT}% off vs monthly × 3)`
                    : "Billed monthly"}
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                {plan.name}
              </span>
            </div>

              <div className="mt-6 text-sm">
              {billingCycle === "quarterly" && (
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span>Monthly × 3 (list)</span>
                  <span className="line-through">{formatNGN(plan.monthlyAmount * 3)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-700">
                <span>{billingCycle === "quarterly" ? "Due today (quarter)" : "Plan"}</span>
                <span>{isStarterMonthlyFree ? "₦0" : formatNGN(dueToday)}</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 flex items-center justify-between font-semibold">
                <span>Total due at Paystack</span>
                <span>{isStarterMonthlyFree ? "₦0 (signup)" : formatNGN(dueToday)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            After payment, we'll email you a 6-digit code to verify your account and access your dashboard.
          </div>
        </aside>
        </div>
      </div>
    </ErrorBoundary>
    </div>
  );
}
