"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type CompleteState =
  | { kind: "loading" }
  | { kind: "missing_ref" }
  | { kind: "success"; email: string; storeName: string; planKey: string }
  | { kind: "error"; message: string };

function SubscriptionPaymentCompleteInner(): React.JSX.Element {
  const searchParams = useSearchParams();
  const [state, setState] = useState<CompleteState>({ kind: "loading" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const ref =
      searchParams?.get("trxref")?.trim() ||
      searchParams?.get("reference")?.trim() ||
      "";
    if (!ref) {
      setState({ kind: "missing_ref" });
      return;
    }
    ran.current = true;

    void (async () => {
      try {
        const res = await fetch("/public/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ reference: ref }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          error?: string;
          data?: { email?: string; storeName?: string; planKey?: string };
        };

        if (!res.ok || !json.success || !json.data?.email) {
          setState({
            kind: "error",
            message:
              (typeof json.error === "string" && json.error) ||
              "We could not confirm your payment.",
          });
          return;
        }

        setState({
          kind: "success",
          email: json.data.email,
          storeName: json.data.storeName || "Your store",
          planKey: json.data.planKey || "",
        });
      } catch {
        setState({
          kind: "error",
          message: "Something went wrong. Try again or contact support.",
        });
      }
    })();
  }, [searchParams]);

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (state.kind === "missing_ref") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Missing payment reference</h1>
          <p className="text-gray-600 text-sm">
            Open this page from the link Paystack shows after a successful payment, or start checkout
            again.
          </p>
          <Button asChild>
            <Link href="/subscription/payment">Back to plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Payment confirmation failed</h1>
          <p className="text-gray-600 text-sm">{state.message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/subscription/payment">Try again</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { email, storeName, planKey } = state;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          We created your Vayva merchant account for <strong>{storeName}</strong>. Check your email
          for a verification code to finish signing in.
          {planKey ? (
            <>
              {" "}
              Plan: <strong className="capitalize">{planKey.replace(/_/g, " ")}</strong>.
            </>
          ) : null}
        </p>
        <div className="text-sm text-gray-500 break-all">{email}</div>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={`/verify?email=${encodeURIComponent(email)}`}>Verify email (OTP)</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/forgot-password?email=${encodeURIComponent(email)}`}>Set password</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPaymentCompletePage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      }
    >
      <SubscriptionPaymentCompleteInner />
    </Suspense>
  );
}
