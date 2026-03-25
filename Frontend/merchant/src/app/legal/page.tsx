import React from "react";
import Link from "next/link";
import { LegalPageLayout } from "@vayva/ui";

const LEGAL_DOCS = [
  { slug: "terms", title: "Terms of Service", description: "Governing your use of Vayva's platform and services" },
  { slug: "privacy", title: "Privacy Policy", description: "How we collect, use, and protect your information" },
  { slug: "cookies", title: "Cookie Policy", description: "Our use of cookies and similar technologies" },
  { slug: "dpa", title: "Data Processing Agreement", description: "Terms for processing personal data under NDPR/NDPB" },
  { slug: "acceptable-use", title: "Acceptable Use Policy", description: "Guidelines for appropriate platform usage" },
  { slug: "prohibited-items", title: "Prohibited Items", description: "Items and services not allowed on Vayva" },
  { slug: "refund-policy", title: "Refund & Cancellation Policy", description: "Our policies on refunds and cancellations" },
  { slug: "kyc-safety", title: "KYC & Safety Guidelines", description: "Know Your Customer and safety requirements" },
  { slug: "eula", title: "End User License Agreement", description: "License terms for using Vayva software" },
  { slug: "security", title: "Security Policy", description: "Our security practices and vulnerability reporting" },
  { slug: "copyright", title: "Copyright Policy", description: "Copyright infringement notifications and takedowns" },
  { slug: "accessibility", title: "Accessibility Statement", description: "Our commitment to accessibility for all users" },
  { slug: "merchant-agreement", title: "Merchant Services Agreement", description: "Terms specific to merchant accounts and services" },
];

export default function MerchantLegalHub(): React.JSX.Element {
  return (
    <LegalPageLayout
      title="Legal Hub"
      description="Vayva legal documents and compliance resources"
      backLink={{ href: "/dashboard", label: "Back to Dashboard" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Documents</h1>
          <p className="text-gray-600">
            All legal documents, policies, and compliance resources for Vayva merchants.
          </p>
        </div>

        <div className="grid gap-4">
          {LEGAL_DOCS.map((doc) => (
            <Link
              key={doc.slug}
              href={`/legal/${doc.slug}`}
              className="block p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                </div>
                <div className="shrink-0">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-xl bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you have questions about any of these documents, please contact our support team at{" "}
            <Link href="/support" className="underline font-medium hover:text-blue-900">
              support@vayva.ng
            </Link>
          </p>
        </div>
      </div>
    </LegalPageLayout>
  );
}
