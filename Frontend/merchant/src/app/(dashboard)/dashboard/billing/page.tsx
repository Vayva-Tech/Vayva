"use client";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  WarningCircle as AlertCircle,
  Info,
  Warning,
  Bank,
} from "@phosphor-icons/react";
import { Button } from "@vayva/ui";
import { PLANS, getPlanPrice, type BillingCycle, type PlanKey } from "@/lib/billing/plans";
import { toast } from "sonner";
import { AddOnsSection } from "@/components/billing/AddOnsSection";
import { apiJson } from "@/lib/api-client-shared";

interface BillingInvoice {
  id: string;
  issuedAt: string;
  amountNgn: number;
  status: string;
}

interface BillingStatus {
  planKey: string;
  status: string;
  periodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: string;
  invoices: BillingInvoice[];
}

interface SubscribeResponse {
  checkout_url?: string;
  reference?: string;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiJson<BillingStatus>("/api/merchant/billing/status");
      setStatus(data);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load billing status";
      logger.error("[FETCH_BILLING_STATUS_ERROR]", { error: msg, app: "merchant" });
      setStatus(null);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const handleSubscribe = async (slug: string) => {
    if (processing) return;
    setProcessing(slug);
    try {
      const data = await apiJson<SubscribeResponse>("/api/merchant/billing/subscribe", {
        method: "POST",
        body: JSON.stringify({
          plan_slug: slug,
          billing_cycle: billingCycle,
          payment_method: paymentMethod,
        }),
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      throw new Error("Checkout URL not returned");
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[SUBSCRIBE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to initiate subscription");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading billing information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Plans</h1>
        <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
          <div className="font-semibold text-red-600 mb-1">Could not load billing</div>
          <div className="text-sm text-red-500">{error}</div>
        </div>
        <Button
          onClick={() => fetchStatus()}
          className="bg-green-500 hover:bg-green-600 text-white px-6 h-10 font-semibold rounded-xl"
        >
          Retry
        </Button>
      </div>
    );
  }

  const currentPlan = status?.planKey || "none";
  const isPastDue = status?.status === "past_due";

  return (
    <div className="space-y-8 max-w-5xl pb-20">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500">Platform</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Billing & Plans
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your subscription, add-ons, and invoice history.
        </p>
      </div>

      {isPastDue && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4">
          <Warning className="text-red-500 shrink-0 w-5 h-5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-700">Payment Failed</h3>
            <p className="text-sm text-red-600">
              Your subscription is past due. Pro features are restricted.
            </p>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {status?.planKey && status.planKey !== "free" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Current Subscription</h3>
              <p className="text-sm text-gray-500">
                {status.planKey.charAt(0).toUpperCase() + status.planKey.slice(1)} Plan •{" "}
                {status.periodEnd && `Renews ${formatDate(status.periodEnd)}`}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              {status.status === "active" ? "Active" : status.status}
            </span>
          </div>
        </div>
      )}

      {/* Transaction Disclosure */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">Transaction Disclosure</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            A 3% transaction fee is applied to every withdrawal from your Vayva wallet to your bank
            account, regardless of your plan tier.
          </p>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-white border border-gray-100">
          <Button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              billingCycle === "monthly"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Monthly
          </Button>
          <Button
            onClick={() => setBillingCycle("quarterly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              billingCycle === "quarterly"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            3 Months
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
              Save 10%
            </span>
          </Button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {([PLANS.STARTER, PLANS.PRO] as const).map((plan) => {
          const isCurrent = currentPlan === plan.slug;
          const price = getPlanPrice(plan.slug.toUpperCase() as PlanKey, billingCycle);
          return (
            <div
              key={plan.slug}
              className={cn(
                "relative rounded-2xl border p-8 transition-all",
                isCurrent
                  ? "border-green-200 bg-green-50"
                  : "border-gray-100 bg-white hover:shadow-lg hover:border-green-200"
              )}
            >
              {isCurrent && (
                <span className="absolute top-4 right-4 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Current Plan
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 tracking-tight">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {billingCycle === "quarterly" ? "/3mo" : "/mo"}
                  </span>
                </div>
                {billingCycle === "quarterly" && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    You save ₦{formatCurrency((plan.priceNgn * 3) - plan.quarterlyPriceNgn)} with
                    quarterly billing
                  </div>
                )}
                <div className="text-[10px] text-gray-500 mt-1 font-medium">
                  No hidden fees • Cancel anytime
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2.5 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {plan?.limits?.teamSeats} Team Seat(s)
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  Campaign Limit: {plan?.limits?.monthlyCampaignSends}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  {plan?.features?.approvals ? "Approvals Included" : "Basic Tools"}
                </li>
              </ul>

              {/* Payment Method Selection */}
              {!isCurrent && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPaymentMethod("card")}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2",
                        paymentMethod === "card"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-100 text-gray-600 hover:border-green-200"
                      )}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card (Auto-debit)
                    </Button>
                    <Button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2",
                        paymentMethod === "bank_transfer"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-100 text-gray-600 hover:border-green-200"
                      )}
                    >
                      <Bank className="w-4 h-4" />
                      Bank Transfer
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleSubscribe(plan.slug)}
                disabled={isCurrent || !!processing}
                className={cn(
                  "w-full h-12 rounded-xl font-bold transition-all",
                  isCurrent
                    ? "bg-gray-100 text-gray-500 cursor-default"
                    : "bg-green-500 hover:bg-green-600 text-white"
                )}
              >
                {isCurrent
                  ? "Active"
                  : processing === plan.slug
                    ? "Processing..."
                    : `Subscribe to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add-Ons */}
      <div>
        <AddOnsSection />
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Invoice History</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {status?.invoices && status.invoices.length > 0 ? (
                status.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {formatDate(inv.issuedAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(inv.amountNgn)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          inv.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-orange-100 text-orange-700"
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-xs font-bold text-green-600 h-auto p-0"
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No invoices yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
