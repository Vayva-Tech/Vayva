import { urls } from "@vayva/shared";
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-text-tertiary italic">
        Effective Date: December 28, 2025
      </p>

      <h2>1. Introduction</h2>
      <p>
        Vayva ("we", "us", "our") is committed to protecting your privacy. This
        policy explains how we collect, use, and safeguard your data when using
        Vayva ("Service").
      </p>

      <h2>2. Data We Collect</h2>
      <ul>
        <li>
          <strong>Account Data</strong>: Name, Email, Phone Number, Password
          Hash (BCrypt).
        </li>
        <li>
          <strong>Merchant Data</strong>: Business Name, Address, Bank Account
          Details (for payouts).
        </li>
        <li>
          <strong>Customer Data</strong>: Names and Addresses of your
          end-customers for order fulfillment.
        </li>
        <li>
          <strong>Usage Data</strong>: Dashboard activity, login timestamps (IP
          Address, User Agent).
        </li>
      </ul>

      <h2>3. Infrastructure & Subprocessors</h2>
      <p>
        We use trusted third-party providers to operate our infrastructure. Your
        data may be processed by:
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2">Provider</th>
              <th className="py-2">Purpose</th>
              <th className="py-2">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <tr>
              <td className="py-2 font-medium">Vercel</td>
              <td className="py-2">Hosting & Edge Compute</td>
              <td className="py-2">USA / Global</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Neon / Supabase</td>
              <td className="py-2">Database Storage (PostgreSQL)</td>
              <td className="py-2">USA</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Resend</td>
              <td className="py-2">Transactional Email Delivery</td>
              <td className="py-2">USA</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Paystack</td>
              <td className="py-2">Payment Processing</td>
              <td className="py-2">Nigeria</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Upstash (Optional)</td>
              <td className="py-2">Redis / Caching</td>
              <td className="py-2">Global</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Data Security</h2>
      <ul>
        <li>
          <strong>Encryption</strong>: All data in transit is encrypted via TLS
          1.3. Sensitive data at rest is encrypted where applicable.
        </li>
        <li>
          <strong>Access Control</strong>: We enforce strict Role-Based Access
          Control (RBAC) and Multi-Factor Authentication (MFA) for internal
          administrative access.
        </li>
        <li>
          <strong>Audit Logs</strong>: Critical actions are logged to ensure
          accountability.
        </li>
      </ul>

      <h2>5. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your data via the "Account Settings" page.</li>
        <li>Request export of your data (CSV/JSON).</li>
        <li>
          Request deletion of your account (subject to financial record
          retention laws).
        </li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        For privacy concerns, contact:{" "}
        <a
          href={`mailto:privacy@${urls.storefrontRoot()}`}
        >{`privacy@${urls.storefrontRoot()}`}</a>
      </p>
    </div>
  );
}
