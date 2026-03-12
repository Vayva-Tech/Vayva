import React from "react";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { TemplatesShowcaseSection } from "@/components/marketing/TemplatesShowcaseSection";

export const metadata = {
  title: "Store Templates | Professional Designs for Every Industry | Vayva",
  description:
    "Choose from professionally designed storefront templates. Mobile-optimized, conversion-focused designs for retail, services, food, beauty, events, and more. Customize with our visual editor—no coding required. Free plan includes 4 templates.",
  keywords: [
    "ecommerce templates",
    "storefront designs",
    "online store templates",
    "retail website templates",
    "restaurant website templates",
    "service business templates",
    "mobile-friendly store designs",
    "conversion optimized templates",
    "Nigeria ecommerce templates",
    "WhatsApp business templates",
  ],
  openGraph: {
    title: "Professional Store Templates | Vayva",
    description: "Launch your online store with a template built for your industry. Mobile-optimized and conversion-focused. Free plan includes 4 templates.",
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Vayva Store Templates",
  description: "Professionally designed storefront templates for every industry",
  brand: {
    "@type": "Brand",
    name: "Vayva",
  },
  category: "Ecommerce Software",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    availability: "https://schema.org/InStock",
    description: "Free plan includes 4 templates",
  },
};

export default function TemplatesPage(): React.JSX.Element {
  return (
    <div className="relative overflow-hidden">
      <SchemaOrg type="SoftwareApplication" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TemplatesShowcaseSection />
    </div>
  );
}
