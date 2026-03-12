import React from "react";
import { NewPricingClient } from "@/components/marketing/NewPricingClient";
import Script from "next/script";

const FAQ_DATA = [
  {
    q: "How does the 7-day trial work?",
    a: "You get full access to all features for 7 days. No credit card required. If you don't subscribe after the trial, your account will be paused.",
  },
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

function generateFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((faq) => ({
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

export default function PricingPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqSchema()) }}
      />
      <NewPricingClient />
    </div>
  );
}
