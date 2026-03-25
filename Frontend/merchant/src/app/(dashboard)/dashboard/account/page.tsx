"use client";
import { Button } from "@vayva/ui";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Store,
  Globe,
  Calendar,
  Monitor,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

// ── Mock Data ────────────────────────────────────────────────────────────────

const PROFILE = {
  name: "Aduke Oluwaseun",
  email: "aduke@adukefashion.ng",
  phone: "+234 812 345 6789",
  role: "Owner",
  initials: "AO",
};

const SUBSCRIPTION = {
  plan: "Starter",
  nextBillingDate: "April 15, 2026",
  creditsUsed: 340,
  creditsTotal: 500,
};

const STORE_INFO = {
  name: "Aduke Fashion House",
  url: "adukefashion.vayva.store",
  industry: "Fashion & Apparel",
  createdDate: "March 8, 2025",
};

const SECURITY = {
  lastLogin: "Today at 9:42 AM",
  twoFactorEnabled: false,
  activeSessions: 2,
};

// ── Page Component ───────────────────────────────────────────────────────────

export default function AccountPage() {
  const creditsPercent = Math.round(
    (SUBSCRIPTION.creditsUsed / SUBSCRIPTION.creditsTotal) * 100
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {PROFILE.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{PROFILE.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                {PROFILE.role}
              </span>
            </div>

            <div className="space-y-1.5 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {PROFILE.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {PROFILE.phone}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-green-100 text-green-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-gray-900">Subscription</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Current Plan</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                <Sparkles className="w-3 h-3" />
                {SUBSCRIPTION.plan}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Next Billing</span>
              <span className="text-sm font-medium text-gray-900">
                {SUBSCRIPTION.nextBillingDate}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-500">Credits Remaining</span>
                <span className="text-xs font-medium text-gray-700">
                  {SUBSCRIPTION.creditsTotal - SUBSCRIPTION.creditsUsed} /{" "}
                  {SUBSCRIPTION.creditsTotal}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${creditsPercent}%` }}
                />
              </div>
            </div>

            <Button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
              Upgrade Plan
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Store Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-gray-900">Store Info</h3>
          </div>

          <div className="space-y-3">
            <InfoRow label="Store Name" icon={Store}>
              {STORE_INFO.name}
            </InfoRow>
            <InfoRow label="Store URL" icon={Globe}>
              <span className="text-green-600">{STORE_INFO.url}</span>
            </InfoRow>
            <InfoRow label="Industry" icon={CreditCard}>
              {STORE_INFO.industry}
            </InfoRow>
            <InfoRow label="Created" icon={Calendar}>
              {STORE_INFO.createdDate}
            </InfoRow>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-gray-900">Security</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-1">Last Login</p>
            <p className="text-sm font-semibold text-gray-900">{SECURITY.lastLogin}</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Two-Factor Authentication
            </p>
            <div className="flex items-center gap-1.5">
              {SECURITY.twoFactorEnabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">Enabled</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">Disabled</span>
                </>
              )}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-1">Active Sessions</p>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-semibold text-gray-900">
                {SECURITY.activeSessions} devices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-red-700">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. All your data, products,
          and settings will be permanently removed.
        </p>
        <Button className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
          <AlertTriangle className="w-4 h-4" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────────────────────

function InfoRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900">{children}</span>
    </div>
  );
}

