"use client";

import React from "react";
import Link from "next/link";

const LEGAL_DOCS: { title: string; href: string; description: string }[] = [
  {
    title: "Terms of Service",
    href: "/legal/terms",
    description: "The rules and terms for using Vayva as a merchant.",
  },
  {
    title: "Privacy Policy",
    href: "/legal/privacy",
    description: "How we collect, use, and protect personal data.",
  },
  {
    title: "Cookie Policy",
    href: "/legal/cookies",
    description: "Cookies we use and how to manage preferences.",
  },
  {
    title: "Data Processing Agreement (DPA)",
    href: "/legal/dpa",
    description: "Data processing terms for compliance and privacy requirements.",
  },
  {
    title: "Acceptable Use Policy",
    href: "/legal/acceptable-use",
    description: "What’s allowed (and not allowed) on the platform.",
  },
  {
    title: "Prohibited Items",
    href: "/legal/prohibited-items",
    description: "Restricted goods and services you cannot sell using Vayva.",
  },
  {
    title: "Refund Policy",
    href: "/legal/refund-policy",
    description: "How subscription billing and refunds work.",
  },
  {
    title: "KYC & Compliance",
    href: "/legal/kyc-safety",
    description: "Verification requirements and safety/compliance overview.",
  },
  {
    title: "EULA",
    href: "/legal/eula",
    description: "End User License Agreement for using the application.",
  },
  {
    title: "Security Policy",
    href: "/legal/security",
    description: "How we protect systems, data, and respond to incidents.",
  },
  {
    title: "Copyright & DMCA Policy",
    href: "/legal/copyright",
    description: "Copyright infringement reporting and takedown process.",
  },
  {
    title: "Accessibility Statement",
    href: "/legal/accessibility",
    description: "Our commitment to accessibility and support channels.",
  },
];

export default function MerchantLegalHubPage(): React.JSX.Element {
  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Legal Hub
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl">
            Policies and agreements for merchants using Vayva.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {LEGAL_DOCS.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:underline underline-offset-4">
                    {doc.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-700 transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

