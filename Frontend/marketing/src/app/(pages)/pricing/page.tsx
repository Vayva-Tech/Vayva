import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NewPricingClient } from "@/components/marketing/NewPricingClient";
import Script from "next/script";
import { readStarterFirstMonthFreeEnabled } from "@/lib/read-starter-first-month-free";
import { getPricingPrimaryFaq } from "@/config/pricing";

const PRICING_SEO_FAQ_REST: { q: string; a: string }[] = [
  {
    q: "What payment methods can my customers use?",
    a: "Your customers can pay with Visa, Mastercard, Verve cards, bank transfers, USSD, and mobile money. International customers can pay with dollar cards. All powered by Paystack.",
  },
  {
    q: "When is the withdrawal fee charged?",
    a: "The 3% fee is deducted only when you move money from your Vayva Wallet to your external bank account. No fees for incoming payments.",
  },
  {
    q: "Can I accept international payments?",
    a: "Yes! Through Paystack, you can accept payments from international customers using Visa and Mastercard (including dollar cards). Funds settle in Naira.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Vayva is month-to-month. You can cancel, upgrade, or downgrade your plan instantly from your dashboard.",
  },
  {
    q: "Are there transaction fees?",
    a: "Vayva doesn't charge per-transaction fees. You only pay your monthly subscription and the withdrawal fee when moving cash out. Standard Paystack fees apply to card payments.",
  },
];

function generateFaqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export const metadata = {
  title: "Pricing | Vayva",
  description: "Simple, transparent pricing. Start free, upgrade when you're ready. No hidden fees, no surprises.",
};

export default async function PricingPage(): Promise<React.JSX.Element> {
  const starterFirstMonthFree = await readStarterFirstMonthFreeEnabled();
  const primary = getPricingPrimaryFaq(starterFirstMonthFree);
  const faqData = [{ q: primary.question, a: primary.answer }, ...PRICING_SEO_FAQ_REST];

  return (
    <div className="relative overflow-hidden">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqSchema(faqData)) }}
      />
      <ErrorBoundary 
        name="Pricing Page" 
        fallback={
          <div className="flex min-h-[600px] items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-red-900 mb-2">Unable to load pricing</h3>
              <p className="text-red-700 mb-4">Please refresh the page or try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        }
      >
        <NewPricingClient />
      </ErrorBoundary>
    </div>
  );
}
