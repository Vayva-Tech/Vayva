"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@vayva/ui";
import { PLANS, type PlanKey } from "@/config/pricing";
import { APP_URL } from "@/lib/constants";

function isPlanKey(value: string | null): value is PlanKey {
  return value === "starter" || value === "pro" || value === "pro_plus";
}

export default function CheckoutConfirmPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "success";
  const email = searchParams.get("email") || "";
  const storeName = searchParams.get("store") || "";
  const planKey = isPlanKey(searchParams.get("plan")) ? searchParams.get("plan") : null;
  const reason = searchParams.get("reason") || "";

  const plan = useMemo(() => {
    if (!planKey) return null;
    return PLANS.find((p) => p.key === planKey) || null;
  }, [planKey]);

  const merchantOrigin = APP_URL;

  if (status !== "success") {
    return (
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white text-slate-900">
        <div className="relative overflow-x-hidden border-b border-slate-200/70">
          <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute right-6 -top-8 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="relative max-w-[900px] mx-auto px-6 py-16">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Payment not completed</h1>
            <p className="mt-3 text-slate-600">
              If your bank charged you, it may take a moment to reflect. You can retry the checkout.
            </p>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-6 py-10">
          {reason && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {reason}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/checkout">
              <Button className="h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800">Try again</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="h-12 rounded-xl">Contact support</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white text-slate-900">
      <div className="relative overflow-x-hidden border-b border-slate-200/70">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute right-6 -top-8 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative max-w-[900px] mx-auto px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Payment successful</h1>
          <p className="mt-3 text-slate-600">
            We created your Vayva Merchant account{storeName ? ` for ${storeName}` : ""}.
            Verify your email with the code we sent you—you&apos;ll be signed in after verification.
            You did not pick a password at checkout; use{" "}
            <strong>Reset password</strong> on the merchant app anytime to set one for future sign-ins.
          </p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        <div className="rounded-[28px] border-2 border-slate-900/10 bg-white/90 backdrop-blur p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
          <div className="text-sm text-slate-600">Your subscription</div>
          <div className="mt-1 text-xl font-semibold">
            {plan?.name || "Vayva"}{plan ? " plan" : ""}
          </div>
          {email && <div className="mt-2 text-sm text-slate-600">Email: {email}</div>}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`${merchantOrigin}/verify?email=${encodeURIComponent(email)}`}
              className="inline-flex"
            >
              <Button className="h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                Verify email (OTP)
              </Button>
            </a>

            <a
              href={`${merchantOrigin}/forgot-password?email=${encodeURIComponent(email)}`}
              className="inline-flex"
            >
              <Button variant="outline" className="h-12 rounded-xl">
                Set or reset password
              </Button>
            </a>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Didn’t receive the OTP? Use “Resend code” on the verification screen. Already verified? Open{" "}
            <a className="underline text-slate-700" href={`${merchantOrigin}/signin`}>
              Sign in
            </a>{" "}
            and use reset password if you need a password.
          </div>
        </div>
      </div>
    </div>
  );
}
