import React from "react";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { MerchantFeaturesSection } from "@/components/marketing/MerchantFeaturesSection";
import { readStarterFirstMonthFreeEnabled } from "@/lib/read-starter-first-month-free";
import { getSchemaOfferLine } from "@/config/pricing";

export const metadata = {
  title: "Platform Features | Vayva",
  description:
    "Discover powerful features to run your business. Order management, inventory tracking, payments, delivery, marketing tools, analytics, and more—all in one platform.",
  keywords: [
    "order management system",
    "inventory management",
    "payment processing",
    "delivery tracking",
    "customer management",
    "marketing automation",
    "business analytics",
    "WhatsApp commerce",
    "ecommerce platform",
    "Nigeria business tools",
  ],
  openGraph: {
    title: "Features to Run Your Business | Vayva",
    description: "From order capture to delivery tracking—everything you need in one platform.",
    type: "website",
  },
};

function buildFeaturePageSchema(offerDescription: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vayva Platform Features",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
      description: offerDescription,
    },
    featureList: [
      "AI Order Capture",
      "Unified Order Inbox",
      "Real-Time Inventory",
      "Paystack Integration",
      "Kwik Delivery",
      "Customer CRM",
      "Flash Sales",
      "Analytics Dashboard",
      "Templates",
      "Visual Editor",
    ],
  };
}

export default async function AllFeaturesPage(): Promise<React.JSX.Element> {
  const starterFirstMonthFree = await readStarterFirstMonthFreeEnabled();
  const featurePageSchema = buildFeaturePageSchema(getSchemaOfferLine(starterFirstMonthFree));

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden">
      <SchemaOrg type="SoftwareApplication" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featurePageSchema) }}
      />
      <MerchantFeaturesSection />
    </div>
  );
}
