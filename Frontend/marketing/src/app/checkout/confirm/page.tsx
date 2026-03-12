"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@vayva/ui";
import { PLANS, formatNGN, type PlanKey } from "@/config/pricing";
import { CheckCircle, XCircle, ArrowLeft, Mail, Lock, FileText, Sparkles } from "lucide-react";

function isPlanKey(value: string | null): value is PlanKey {
  return value === "free" || value === "starter" || value === "pro";
}

export default function CheckoutConfirmPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "success";
  const email = searchParams.get("email") || "";
  const planKey = isPlanKey(searchParams.get("plan")) ? searchParams.get("plan") : null;
  const reason = searchParams.get("reason") || "";

  const plan = useMemo(() => {
    if (!planKey) return null;
    return PLANS.find((p) => p.key === planKey) || null;
  }, [planKey]);

  const merchantOrigin = "https://merchant.vayva.ng";

  if (status !== "success") {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-12">
        <Link 
          href="/checkout" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to checkout
        </Link>
  
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Payment not completed</h1>
          <p className="mt-2 text-slate-600">
            If your bank charged you, it may take a moment to reflect.
          </p>
        </div>
  
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {reason && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
              {reason}
            </div>
          )}
  
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/checkout" className="flex-1">
              <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Try again
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200">
                Contact support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-[600px] mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Payment successful!</h1>
        <p className="mt-2 text-slate-600">
          Check your email for next steps to complete your account setup.
        </p>
      </div>
  
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Order Receipt</h2>
        </div>
          
        <div className="p-6 space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Email address</p>
              <p className="font-medium text-slate-900">{email || "N/A"}</p>
            </div>
          </div>
  
          {/* Plan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Plan</p>
              <p className="font-medium text-slate-900">{plan?.name || "Vayva"} Plan</p>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Amount paid</p>
              <p className="font-medium text-slate-900">
                {formatNGN(plan?.monthlyAmount || 0)}
              </p>
            </div>
          </div>
        </div>
  
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          {/* Next Steps Info */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Next steps</p>
              <p className="text-sm text-slate-600">
                We&apos;ve sent a link to <span className="font-medium text-slate-900">{email}</span>. 
                Click the link to create your password and access your dashboard.
              </p>
            </div>
          </div>

          <a
            href={`${merchantOrigin}/onboarding?email=${encodeURIComponent(email)}&plan=${planKey}`}
            className="block"
          >
            <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Continue to dashboard
            </Button>
          </a>
  
          <p className="text-center text-sm text-slate-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button 
              onClick={() => {
                // Trigger resend logic
                fetch("/api/public/checkout/resend-link", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
              }}
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              resend link
            </button>
          </p>
        </div>
      </div>
  
      <p className="text-center text-sm text-slate-500 mt-6">
        Need help?{" "}
        <Link href="/contact" className="text-emerald-600 hover:text-emerald-700">
          Contact our support team
        </Link>
      </p>
    </div>
  );
}
