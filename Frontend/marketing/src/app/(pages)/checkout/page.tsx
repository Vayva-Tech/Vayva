"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label } from "@vayva/ui";
import { PLANS, formatNGN, type PlanKey } from "@/config/pricing";

type InitResponse =
  | { success: true; data: { access_code: string; reference: string } }
  | { success: false; error: string };

type VerifyResponse =
  | { success: true; data: { email: string; storeId: string; storeName: string; planKey: PlanKey } }
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
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
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
        body: JSON.stringify({ planKey, email, phone, storeName }),
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
            { display_name: "Business", variable_name: "storeName", value: storeName },
            { display_name: "Phone", variable_name: "phone", value: phone },
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
    <div className="min-h-screen bg-white text-slate-900">
      <div className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-6 -top-8 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative max-w-[1200px] mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Checkout</h1>
          <p className="mt-2 text-slate-600">
            Pay for your Vayva subscription now. We’ll create your merchant account immediately after payment.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <section className="rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
            <div className="font-semibold">Your payment is safe with us</div>
            <div className="mt-1 text-emerald-800/80">
              Card details are handled securely by Paystack. Vayva never stores your card information.
            </div>
          </div>

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
                <Link className="underline" href="/legal/terms-of-service">
                  Terms
                </Link>
                {" "}and{" "}
                <Link className="underline" href="/legal/privacy-policy">
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

            <Button
              className="h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={loading}
              onClick={handleProceed}
            >
              {loading ? "Preparing payment..." : "Proceed"}
            </Button>

            <div className="text-xs text-slate-500">
              Already have an account?{" "}
              <a className="underline" href="https://merchant.vayva.ng/signin">
                Sign in
              </a>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center">1</span>
              Details
            </span>
            <span className="h-px flex-1 mx-3 bg-slate-200" />
            <span className="inline-flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center">2</span>
              Payment
            </span>
            <span className="h-px flex-1 mx-3 bg-slate-200" />
            <span className="inline-flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">3</span>
              Confirmation
            </span>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold text-slate-800">Order details</div>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{plan.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{plan.tagline}</div>
                </div>
                <div className="font-semibold">{formatNGN(plan.monthlyAmount)}</div>
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
                <div className="mt-1 text-xs text-slate-600">Billed monthly</div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                {plan.name}
              </span>
            </div>

            <div className="mt-6 text-sm">
              <div className="flex items-center justify-between text-slate-700">
                <span>Plan</span>
                <span>{formatNGN(plan.monthlyAmount)}</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatNGN(plan.monthlyAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            After payment, we’ll email you a 6-digit code to verify your account and access your dashboard.
          </div>
        </aside>
      </div>
    </div>
  );
}
