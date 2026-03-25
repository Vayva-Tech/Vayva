"use client";

import Link from "next/link";

export default function MerchantAdPlatformsDocPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8">
        <Link href="/dashboard/marketing/campaigns" className="text-sm font-semibold text-green-700 hover:text-green-800">
          ← Back to Campaigns
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Connect your ad platforms</h1>
        <p className="mt-1 text-sm text-gray-600">
          This guide is for merchants connecting <span className="font-semibold">their own</span> ad accounts to their store.
          You’ll be redirected to the platform to approve access. Vayva never asks for your platform password.
        </p>
      </div>

      <div className="space-y-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Before you start</h2>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Use a desktop browser if possible (mobile in-app browsers can block OAuth redirects).</li>
            <li>Disable ad blockers for this page and allow popups/redirects.</li>
            <li>Make sure you are logged into the correct account for the platform you’re connecting.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Meta Ads (Facebook / Instagram)</h2>
          <p className="mt-2 text-sm text-gray-700">
            You must have access to the Business Manager that owns the ad account.
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Confirm you have permission to manage ads on the ad account (Admin/Advertiser).</li>
            <li>In Vayva: go to <span className="font-semibold">Dashboard → Marketing → Campaigns</span>.</li>
            <li>Click <span className="font-semibold">Connect Account</span> under Meta and approve permissions.</li>
          </ul>
          <div className="mt-3 text-sm text-gray-700">
            <p className="font-semibold">Common issues</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Wrong Facebook profile selected at login.</li>
              <li>Business Manager access missing or ad account not assigned.</li>
              <li>Browser extensions blocking redirects.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <p className="mt-2 text-sm text-gray-700">
            Use the Google account that already has access to your Google Ads account.
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>In Vayva: Dashboard → Marketing → Campaigns.</li>
            <li>Click <span className="font-semibold">Connect Account</span> under Google and approve access.</li>
            <li>If you use a manager (MCC) account, ensure the correct client account is accessible.</li>
          </ul>
          <div className="mt-3 text-sm text-gray-700">
            <p className="font-semibold">Common issues</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Google account has login access but not campaign management permission.</li>
              <li>Account is suspended or not fully set up (billing not active).</li>
              <li>You approved access on the wrong Google profile.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">TikTok Ads</h2>
          <p className="mt-2 text-sm text-gray-700">
            You need a TikTok Business Center and an advertiser account.
          </p>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>In Vayva: Dashboard → Marketing → Campaigns.</li>
            <li>Click <span className="font-semibold">Connect Account</span> under TikTok and approve access.</li>
            <li>Ensure your advertiser account is active and you have permission to manage campaigns.</li>
          </ul>
          <div className="mt-3 text-sm text-gray-700">
            <p className="font-semibold">Common issues</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>No advertiser account exists in your Business Center.</li>
              <li>Insufficient permissions for the advertiser.</li>
              <li>OAuth blocked by in-app browser.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Privacy & security</h2>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Tokens are stored server-side and are not shown in the dashboard UI.</li>
            <li>You can disconnect and reconnect at any time.</li>
            <li>If you suspect compromise, revoke access from the platform and reconnect.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

