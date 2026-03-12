"use client";

import { logger, formatCurrency, formatDate } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import { Icon, Button, cn } from "@vayva/ui";
import { PLANS, getPlanPrice, type BillingCycle, type PlanKey } from "@/lib/billing/plans";
import { toast } from "sonner";
import { AddOnsSection } from "@/components/billing/AddOnsSection";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { motion } from "framer-motion";
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

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");
  const [showOptions, setShowOptions] = useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiJson<BillingStatus>("/api/merchant/billing/status");
      setStatus(data);
      setError(null);
    } catch (e: any) {
      const msg =
        e instanceof Error ? e.message : "Failed to load billing status";
      logger.error("[FETCH_BILLING_STATUS_ERROR]", {
        error: msg,
        app: "merchant",
      });
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
      const data = await apiJson<SubscribeResponse>(
        "/api/merchant/billing/subscribe",
        {
          method: "POST",
          body: JSON.stringify({ 
            plan_slug: slug,
            billing_cycle: billingCycle,
            payment_method: paymentMethod,
          }),
        },
      );

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      throw new Error("Checkout URL not returned");
    } catch (e: any) {
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
        <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
        <span className="sr-only">Loading billing information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-6">
        {/* Live region for error announcements */}
        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          <p>Error loading billing: {error}</p>
        </div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          Billing & Plans
        </h1>
        <div className="bg-destructive/10 border border-destructive/20 p-5 rounded-2xl">
          <div className="font-bold text-destructive">Could not load billing</div>
          <div className="text-sm text-destructive/80 mt-1">{error}</div>
        </div>
        <Button
          onClick={() => fetchStatus()}
          className="rounded-xl px-6 h-11 font-bold"
        >
          Retry
        </Button>
      </div>
    );
  }

  const currentPlan = status?.planKey || "none";
  const isPaidPlan = (() => {
    const v = String(currentPlan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const isPastDue = status?.status === "past_due";

  return (
    <div className="relative space-y-8 max-w-5xl mx-auto pb-20">
      {/* Green gradient blur background */}
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-40 right-20 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
      )}

      {/* Header */}
      <div>
        <div className="text-sm text-text-secondary">Platform</div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
          Billing & Plans
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your subscription, add-ons, and invoice history.
        </p>
      </div>

      {isPastDue && (
        <div className="bg-destructive/10 border border-destructive/20 p-5 rounded-2xl flex items-center gap-4">
          <Icon name="AlertOctagon" className="text-destructive shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-destructive">Payment Failed</h3>
            <p className="text-sm text-destructive/80">
              Your subscription is past due. Pro features are restricted.
            </p>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {status?.planKey && status.planKey !== "free" && (
        <div className="rounded-[20px] border border-primary/20 bg-primary/[0.02] backdrop-blur-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-primary">Current Subscription</h3>
              <p className="text-sm text-text-secondary">
                {status.planKey.charAt(0).toUpperCase() + status.planKey.slice(1)} Plan • {" "}
                {status.periodEnd && `Renews ${formatDate(status.periodEnd)}`}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {status.status === "active" ? "Active" : status.status}
            </span>
          </div>
        </div>
      )}

      {/* Transaction Disclosure */}
      <div className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-background/30 flex items-center justify-center text-text-tertiary shrink-0">
          <Icon name="Info" size={18} />
        </div>
        <div>
          <h4 className="font-bold text-text-primary text-sm">
            Transaction Disclosure
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            A 3% transaction fee is applied to every withdrawal from your Vayva
            wallet to your bank account, regardless of your plan tier.
          </p>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-background/70 border border-border/60">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              billingCycle === "monthly"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("quarterly")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              billingCycle === "quarterly"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            3 Months
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {([PLANS.STARTER, PLANS.PRO] as const).map((plan, idx: number) => {
          const isCurrent = currentPlan === plan.slug;
          const price = getPlanPrice(plan.slug.toUpperCase() as PlanKey, billingCycle);
          return (
            <motion.div
              key={plan.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative rounded-[24px] border p-8 transition-all",
                isCurrent
                  ? "border-primary/30 bg-primary/[0.02] shadow-card ring-1 ring-primary/10"
                  : "border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated hover:border-primary/20",
              )}
            >
              {isCurrent && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Current Plan
                </span>
              )}

              <h3 className="text-xl font-bold text-text-primary mb-1">
                {plan.name}
              </h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary tracking-tight">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-sm text-text-tertiary font-medium">
                    {billingCycle === "quarterly" ? "/3mo" : "/mo"}
                  </span>
                </div>
                {billingCycle === "quarterly" && (
                  <div className="text-xs text-emerald-600 mt-1 font-medium">
                    You save ₦{formatCurrency((plan.priceNgn * 3) - plan.quarterlyPriceNgn)} with quarterly billing
                  </div>
                )}
                <div className="text-[10px] text-text-tertiary mt-1 font-medium">
                  No hidden fees • Cancel anytime
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name="Check" size={12} className="text-primary" />
                  </div>
                  {plan?.limits?.teamSeats} Team Seat(s)
                </li>
                <li className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name="Check" size={12} className="text-primary" />
                  </div>
                  Campaign Limit: {plan?.limits?.monthlyCampaignSends}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name="Check" size={12} className="text-primary" />
                  </div>
                  {plan?.features?.approvals
                    ? "Approvals Included"
                    : "Basic Tools"}
                </li>
              </ul>

              {/* Payment Method Selection */}
              {!isCurrent && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Payment Method
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2",
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/60 text-text-secondary hover:border-primary/30"
                      )}
                    >
                      <Icon name="CreditCard" size={14} />
                      Card (Auto-debit)
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2",
                        paymentMethod === "bank_transfer"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/60 text-text-secondary hover:border-primary/30"
                      )}
                    >
                      <Icon name="BuildingBank" size={14} />
                      Bank Transfer
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleSubscribe(plan.slug)}
                disabled={isCurrent || !!processing}
                className={cn(
                  "w-full h-12 rounded-xl font-bold transition-all",
                  isCurrent
                    ? "bg-background/30 text-text-tertiary cursor-default"
                    : "shadow-card",
                )}
              >
                {isCurrent
                  ? "Active"
                  : processing === plan.slug
                    ? "Processing..."
                    : `Subscribe to ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Add-Ons */}
      <div>
        <AddOnsSection />
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Invoice History
        </h2>
        <div className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {status?.invoices && status.invoices?.length > 0 ? (
                status.invoices?.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-background/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-text-primary font-medium">
                      {formatDate(inv.issuedAt)}
                    </td>
                    <td className="px-6 py-4 text-text-primary">
                      {formatCurrency(inv.amountNgn)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : inv.status === "failed"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        className="text-xs font-bold text-primary h-auto p-0"
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-text-tertiary"
                  >
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
