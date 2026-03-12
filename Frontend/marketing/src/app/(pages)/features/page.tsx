import React from "react";
import Script from "next/script";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { NewFeaturesClient } from "@/components/marketing/NewFeaturesClient";

const FAQ_DATA = [
  {
    q: "How does the 7-day trial work?",
    a: "You get full access to all features for 7 days. No credit card required. If you don't subscribe after the trial, your account will be paused.",
  },
  {
    q: "What payment methods can my customers use?",
    a: "Your customers can pay with Visa, Mastercard, Verve cards, bank transfers, USSD, and mobile money. International customers can pay with dollar cards. All powered by Paystack.",
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
  title: "Features | Vayva",
  description:
    "AI-powered order capture, payments, inventory, and fulfillment. Everything you need to run your business in one platform.",
};

export default function FeaturesPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqSchema()) }}
      />
      <SchemaOrg type="SoftwareApplication" />
      <NewFeaturesClient />
    </div>
  );
}
