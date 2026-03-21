// @ts-nocheck
"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api";
import { urls } from "@/lib/urls";
import { Button } from "@/components/ui/button";
import { User, Building2, CreditCard, ShieldCheck, Globe, Plug, Key, Bell, ArrowRight, CheckCircle, AlertCircle, ClockCounterClockwise } from "@phosphor-icons/react";
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

  if (error) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load account</h3>
        <p className="text-sm text-gray-500 mb-4">Please try again later</p>
        <Button onClick={() => window.location.reload()} className="bg-green-500 hover:bg-green-600 text-white">
          Reload
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="block mt-4 text-sm text-gray-500">Loading account...</span>
      </div>
    );
  }

  // Calculate metrics
  const totalSections = 8;
  const completedSections = [
    data.profile.onboardingCompleted,
    data.kyc.status === 'approved',
    data.payouts.bankConnected,
    data.domains.customDomain || data.domains.subdomain,
    data.integrations.payments !== 'not_configured',
    data.security.mfaEnabled,
  ].filter(Boolean).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
        <Link href="/dashboard/account/edit">
          <Button className="bg-green-500 hover:bg-green-600 text-white px-4 h-10 rounded-xl font-semibold">
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Summary Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
              <User size={32} weight="fill" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data.profile.name}</h2>
              <p className="text-sm text-gray-500">{data.profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                  {data.profile.plan} Plan
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  data.profile.isLive ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                }`}>
                  {data.profile.isLive ? 'Live' : 'Sandbox'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{completionPercentage}%</div>
            <div className="text-xs text-gray-500">Setup Complete</div>
            <div className="mt-2 w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile */}
        <SectionCard
          icon={<User size={20} />}
          iconColor="p-2 rounded-xl bg-blue-100 text-blue-600"
          title="Profile"
          description="Personal information"
          delay={0.1}
        >
          <div className="space-y-3">
            <InfoRow label="Name">{data.profile.name}</InfoRow>
            <InfoRow label="Email">{data.profile.email}</InfoRow>
            <InfoRow label="Category">{data.profile.category}</InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/account/edit" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Edit Profile <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* Subscription */}
        <SectionCard
          icon={<CreditCard size={20} />}
          iconColor="p-2 rounded-xl bg-green-100 text-green-600"
          title="Subscription"
          description="Plan and billing"
          delay={0.15}
        >
          <div className="space-y-3">
            <InfoRow label="Plan">{data.subscription.plan}</InfoRow>
            <InfoRow label="Status">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                data.subscription.status === 'active' ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600"
              }`}>
                {data.subscription.status}
              </span>
            </InfoRow>
            <InfoRow label="Renewal">
              {data.subscription.renewalDate ? format(new Date(data.subscription.renewalDate), 'MMM dd, yyyy') : '—'}
            </InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/billing" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Manage Billing <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* KYC & Verification */}
        <SectionCard
          icon={<ShieldCheck size={20} />}
          iconColor="p-2 rounded-xl bg-purple-100 text-purple-600"
          title="Verification"
          description="KYC status"
          delay={0.2}
        >
          <div className="space-y-3">
            <InfoRow label="KYC Status">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                data.kyc.status === 'approved' ? "bg-green-50 text-green-600" : 
                data.kyc.status === 'pending' ? "bg-orange-50 text-orange-600" : 
                "bg-gray-50 text-gray-600"
              }`}>
                {data.kyc.status}
              </span>
            </InfoRow>
            <InfoRow label="Can Withdraw">
              {data.kyc.canWithdraw ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle size={12} /> Yes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium">
                  <AlertCircle size={12} /> No
                </span>
              )}
            </InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/settings/kyc" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Verify Identity <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* Payouts */}
        <SectionCard
          icon={<Building2 size={20} />}
          iconColor="p-2 rounded-xl bg-teal-100 text-teal-600"
          title="Payouts"
          description="Banking details"
          delay={0.25}
        >
          <div className="space-y-3">
            <InfoRow label="Bank Connected">
              {data.payouts.bankConnected ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle size={12} /> Yes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-600 text-xs font-medium">No</span>
              )}
            </InfoRow>
            <InfoRow label="Account">
              {data.payouts.maskedAccount || 'Not connected'}
            </InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/finance/payouts" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Payout Settings <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* Domain */}
        <SectionCard
          icon={<Globe size={20} />}
          iconColor="p-2 rounded-xl bg-green-100 text-green-600"
          title="Domain"
          description="Store URL"
          delay={0.3}
        >
          <div className="space-y-3">
            <InfoRow label="Custom Domain">
              {data.domains.customDomain || 'Not configured'}
            </InfoRow>
            <InfoRow label="Subdomain">{data.domains.subdomain}</InfoRow>
            <InfoRow label="SSL">
              {data.domains.sslEnabled ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle size={12} /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-gray-600 text-xs font-medium">Disabled</span>
              )}
            </InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/settings/domain" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Domain Settings <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* Integrations */}
        <SectionCard
          icon={<Plug size={20} />}
          iconColor="p-2 rounded-xl bg-orange-100 text-orange-600"
          title="Integrations"
          description="Connected services"
          delay={0.35}
        >
          <div className="space-y-3">
            <InfoRow label="Payments">{data.integrations.payments}</InfoRow>
            <InfoRow label="Delivery">{data.integrations.delivery}</InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/integrations" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Manage Integrations <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* Security */}
        <SectionCard
          icon={<Key size={20} />}
          iconColor="p-2 rounded-xl bg-red-100 text-red-600"
          title="Security"
          description="Login and API keys"
          delay={0.4}
        >
          <div className="space-y-3">
            <InfoRow label="2FA">
              {data.security.mfaEnabled ? (
                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle size={12} /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium">
                  <AlertCircle size={12} /> Disabled
                </span>
              )}
            </InfoRow>
            <InfoRow label="Recent Logins">{data.security.recentLogins}</InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/settings/security" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Security Settings <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={<Bell size={20} />}
          iconColor="p-2 rounded-xl bg-yellow-100 text-yellow-600"
          title="Notifications"
          description="Alerts and updates"
          delay={0.45}
        >
          <div className="space-y-3">
            <InfoRow label="Alerts">
              {data.alerts?.length || 0} unread
            </InfoRow>
          </div>
          <CardFooter>
            <Link href="/dashboard/notifications" className="text-sm font-medium text-green-600 hover:text-green-700 inline-flex items-center gap-1">
              Notification Settings <ArrowRight size={16} />
            </Link>
          </CardFooter>
        </SectionCard>
      </div>
    </div>
  );
}

// Helper Components
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
    <div className="rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={iconColor}>{icon}</div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        {children}
      </div>
      {footer && (
        <div className="px-6 pb-6 pt-0 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="text-xs text-gray-900 font-medium">{children}</div>
    </div>
  );
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 border-t border-gray-100">
      {children}
    </div>
  );
}
