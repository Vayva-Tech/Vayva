import React from "react";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { MerchantFeaturesSection } from "@/components/marketing/MerchantFeaturesSection";

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

const featurePageSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vayva Platform Features",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    description: "7-day trial on Starter",
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

export default function AllFeaturesPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      <SchemaOrg type="SoftwareApplication" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featurePageSchema) }}
      />
      <MerchantFeaturesSection />
    </div>
  );
}
