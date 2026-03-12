"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api";
import { urls } from "@/lib/urls";
import { Button } from "@/components/ui/button";
import { Icon } from "@vayva/ui";
import { ConfirmDialog } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";

const fetcher = (url: string) => apiJson<AccountOverviewData>(url);

interface AccountOverviewData {
  profile: {
    name: string;
    email: string;
    category: string;
    plan: string;
    isLive: boolean;
    onboardingCompleted: boolean;
  };
  subscription: {
    plan: string;
    status: string;
    renewalDate: string | null;
    canUpgrade: boolean;
  };
  kyc: {
    status: string;
    lastAttempt: string | null;
    rejectionReason: string | null;
    missingDocs: string[];
    canWithdraw: boolean;
  };
  payouts: {
    bankConnected: boolean;
    payoutsEnabled: boolean;
    maskedAccount: string | null;
    bankName: string | null;
  };
  domains: {
    customDomain: string | null;
    subdomain: string;
    status: string;
    sslEnabled: boolean;
  };
  integrations: {
    whatsapp: string;
    payments: string;
    delivery: string;
    lastWebhook: string;
  };
  security: {
    mfaEnabled: boolean;
    recentLogins: number;
    apiKeyStatus: string;
    lastLogin?: {
      time: string;
      location: string;
      device: string;
    };
  };
  alerts: any[];
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  );
}

function SectionCard({
  icon,
  iconColor,
  title,
  description,
  children,
  footer,
  delay = 0,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated transition-shadow duration-300 flex flex-col"
    >
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className={cn("p-2 rounded-xl", iconColor)}>{icon}</div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-tertiary">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 pb-2 flex-1">{children}</div>
      {footer && <div className="px-6 pb-6 pt-2">{footer}</div>}
    </motion.div>
  );
}

export default function AccountOverviewPage() {
  const { merchant } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
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
  const { data, error, isLoading, mutate } = useSWR<AccountOverviewData>(
    "/api/account/overview",
    fetcher,
  );
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const handleSignOutAll = async () => {
    setSigningOutAll(true);
    try {
      await apiJson<{ success: boolean }>("/api/auth/security/signout-all", {
        method: "POST",
      });
      toast.success("Signed out of all devices");
      void signOut({ callbackUrl: "/login" });
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SIGN_OUT_ALL_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to sign out other sessions");
    } finally {
      setSigningOutAll(false);
    }
  };

  if (isLoading) return <AccountSkeleton />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          Account
        </h1>
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl">
          <div className="font-bold text-red-900">Could not load account</div>
          <div className="text-sm text-red-700 mt-1">
            Please try again later.
          </div>
        </div>
        <Button
          onClick={() => mutate()}
          className="rounded-xl px-6 h-11 font-bold"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { profile, subscription, kyc, payouts, security } = data;

  if (!profile || !subscription || !kyc || !payouts || !security) {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          Account
        </h1>
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
          <div className="font-bold text-amber-900">Incomplete data</div>
          <div className="text-sm text-amber-700 mt-1">
            Some account information could not be loaded.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 max-w-5xl mx-auto pb-20">
      <ConfirmDialog
        open={confirmSignOutAll}
        onOpenChange={(open) => setConfirmSignOutAll(open)}
        onConfirm={() => {
          setConfirmSignOutAll(false);
          void handleSignOutAll();
        }}
        title="Sign out of all devices?"
        description="This will sign you out of all devices immediately."
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        variant="warning"
      />

      {/* Green gradient blur background */}
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-40 right-20 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm text-text-secondary">Platform</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
            Account
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your store identity, security, billing, and support.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/account/edit">
            <Button className="rounded-xl h-11 px-5 font-bold shadow-card">
              <Icon name="User" className="w-5 h-5 text-primary" />
              Edit Account
            </Button>
          </Link>
          <Link href="/dashboard/control-center">
            <Button
              variant="outline"
              className="rounded-xl h-11 px-5 font-bold border-border/60"
            >
              <Icon name="layout-template" className="w-5 h-5 text-primary" />
              Storefront
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Identity & Store */}
        <SectionCard
          icon={<Icon name="User" className="h-4 w-4" />}
          iconColor="bg-blue-500/10 text-blue-600"
          title="Identity & Store"
          description="Profile and verification status"
          delay={0}
          footer={
            <Link href="/dashboard/account/edit" className="block">
              <Button
                variant="outline"
                className="w-full rounded-xl h-10 font-bold border-border/60 hover:border-primary/30 transition-colors"
              >
                Edit Personal Info
              </Button>
            </Link>
          }
        >
          <InfoRow label="Store Name">
            <span className="font-medium">{profile.name}</span>
          </InfoRow>
          <InfoRow label="Category">
            <span className="capitalize">{profile.category}</span>
          </InfoRow>
          <InfoRow label="Email">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-text-secondary truncate max-w-[200px]">
                {profile.email}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profile.email);
                  toast.success("Email copied");
                }}
                className="p-1 rounded-md hover:bg-background/50 transition-colors"
                title="Copy email"
              >
                <Icon name="copy" className="w-3.5 h-3.5 text-text-tertiary" />
              </button>
            </div>
          </InfoRow>
          <InfoRow label="KYC">
            {kyc.status === "verified" ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                Verified
              </span>
            ) : (
              <Link
                href="/dashboard/settings/kyc"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                {kyc.status === "pending" ? "In Review" : "Complete Now"}
                <Icon name="chevron-right" className="w-4 h-4" />
              </Link>
            )}
          </InfoRow>
          <InfoRow label="Status">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                profile.isLive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              {profile.isLive ? "Live" : "Draft"}
            </span>
          </InfoRow>
        </SectionCard>

        {/* Security */}
        <SectionCard
          icon={<Icon name="Shield" className="h-4 w-4" />}
          iconColor="bg-amber-500/10 text-amber-600"
          title="Security"
          description="Protect your account and sessions"
          delay={0.05}
          footer={
            <Link href="/dashboard/settings/security" className="block">
              <Button
                variant="outline"
                className="w-full rounded-xl h-10 font-bold border-border/60 hover:border-primary/30 transition-colors"
              >
                <Icon name="settings" className="w-4 h-4 mr-2" />
                Manage Security
              </Button>
            </Link>
          }
        >
          <InfoRow label="Multi-Factor Auth">
            {security.mfaEnabled ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                Enabled
              </span>
            ) : (
              <Link
                href="/dashboard/settings/security"
                className="text-xs font-bold text-primary hover:underline"
              >
                Enable MFA
              </Link>
            )}
          </InfoRow>
          <InfoRow label="Password">
            <Link
              href="/dashboard/settings/security"
              className="text-xs font-bold text-primary hover:underline"
            >
              Change
            </Link>
          </InfoRow>
          <InfoRow label="Active Sessions">
            <span className="text-xs font-mono bg-background/30 px-2 py-1 rounded-lg">
              ~{security.recentLogins} devices
            </span>
          </InfoRow>
          {security.lastLogin && (
            <InfoRow label="Last Login">
              <span className="text-xs text-text-secondary">
                {security.lastLogin.location || "Unknown location"} ·{" "}
                {security.lastLogin.time
                  ? format(new Date(security.lastLogin.time), "MMM d, h:mm a")
                  : "N/A"}
              </span>
            </InfoRow>
          )}
        </SectionCard>

        {/* Billing & Payouts */}
        <SectionCard
          icon={<Icon name="CreditCard" className="w-5 h-5 text-primary" />}
          iconColor="bg-purple-500/10 text-purple-600"
          title="Billing & Payouts"
          description="Plan and bank account"
          delay={0.1}
          footer={
            <div className="flex gap-2">
              <Link href="/dashboard/billing" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-10 font-bold border-border/60 hover:border-primary/30 transition-colors"
                >
                  Manage Billing
                </Button>
              </Link>
              {(subscription.plan === "free" || subscription.plan === "starter") && (
                <Link href="/dashboard/billing/upgrade" className="flex-1">
                  <Button
                    className="w-full rounded-xl h-10 font-bold bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
                  >
                    <Icon name="sparkles" className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          }
        >
          <InfoRow label="Current Plan">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md",
                subscription.plan === "free" && "bg-slate-100 text-slate-700",
                subscription.plan === "starter" && "bg-blue-100 text-blue-700",
                subscription.plan === "pro" && "bg-purple-100 text-purple-700",
                subscription.plan === "enterprise" && "bg-amber-100 text-amber-700",
                !["free", "starter", "pro", "enterprise"].includes(subscription.plan) &&
                  "bg-primary/10 text-primary",
              )}
            >
              {subscription.plan}
            </span>
          </InfoRow>
          {subscription.renewalDate && (
            <InfoRow label="Renews On">
              {format(new Date(subscription.renewalDate), "MMM d, yyyy")}
            </InfoRow>
          )}
          <InfoRow label="Payout Account">
            {payouts.bankConnected ? (
              <span className="font-mono text-xs">{payouts.maskedAccount}</span>
            ) : (
              <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                <Icon name="alert-triangle" className="w-4 h-4 text-red-500" />
                Not connected
              </span>
            )}
          </InfoRow>
        </SectionCard>

        {/* Support & Help */}
        <SectionCard
          icon={<Icon name="help-circle" className="h-4 w-4" />}
          iconColor="bg-teal-500/10 text-teal-600"
          title="Support & Help"
          description="Get help when you need it"
          delay={0.15}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`${urls.marketingBase()}/help`}
                target="_blank"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border/40 hover:border-primary/20 hover:bg-background/30 transition-all text-sm font-medium"
              >
                <Icon name="book-open" className="w-4 h-4 text-primary" />
                Docs
              </Link>
              <Link
                href="/dashboard/support/new"
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border/40 hover:border-primary/20 hover:bg-background/30 transition-all text-sm font-medium"
              >
                <Icon name="mail" className="w-4 h-4 text-primary" />
                Support
              </Link>
            </div>
          }
        >
          <div className="py-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Response Time</span>
              <span className="font-medium">24-48 hours</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Priority</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                {subscription.plan === "free" ? "Standard" : "Priority"}
              </span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 pt-8 border-t border-red-200/50">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="alert-triangle" className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        </div>
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-medium text-text-primary">Sign Out All Devices</h3>
              <p className="text-sm text-text-secondary">
                This will immediately sign you out of all active sessions across all devices.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl h-10 font-bold border-red-300 text-red-600 hover:text-red-700 hover:bg-red-100 hover:border-red-400 transition-colors whitespace-nowrap"
              onClick={() => setConfirmSignOutAll(true)}
            >
              <Icon name="logout" className="w-4 h-4 mr-2" />
              Sign Out All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="space-y-2">
        <div className="h-4 w-16 bg-background/30 rounded-lg animate-pulse" />
        <div className="h-9 w-48 bg-background/30 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-background/30 rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-72 rounded-[24px] bg-background/30 border border-border/30 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
