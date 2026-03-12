"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@vayva/ui";
import { StoreShell } from "@/components/StoreShell";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicProduct } from "@/types/storefront";
import NextLink from "next/link";
const Link = NextLink;
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/ssr";
const ArrowRight = ArrowRightIcon;

// Template Imports
import dynamic from "next/dynamic";

// Template Imports - Dynamic to reduce initial bundle size
const AAFashionHome = dynamic(() =>
  import("@vayva/templates/templates/aa-fashion/AAFashionHome").then(
    (m) => m.AAFashionHome,
  ),
);
const GizmoTechHome = dynamic(() =>
  import("@vayva/templates/templates/gizmo-tech/GizmoTechHome").then(
    (m) => m.GizmoTechHome,
  ),
);
const BloomeHomeLayout = dynamic(() =>
  import("@vayva/templates/templates/bloome-home/BloomeHomeLayout").then(
    (m) => m.BloomeHomeLayout,
  ),
);
const BooklyLayout = dynamic(() =>
  import("@vayva/templates/templates/bookly-pro/BooklyLayout").then(
    (m) => m.BooklyLayout,
  ),
);
const ChopnowLayout = dynamic(() =>
  import("@vayva/templates/templates/chopnow/ChopnowLayout").then(
    (m) => m.ChopnowLayout,
  ),
);
const FileVaultLayout = dynamic(() =>
  import("@vayva/templates/templates/file-vault/FileVaultLayout").then(
    (m) => m.FileVaultLayout,
  ),
);
const TicketlyLayout = dynamic(() =>
  import("@vayva/templates/templates/ticketly/TicketlyLayout").then(
    (m) => m.TicketlyLayout,
  ),
);
const EduflowLayout = dynamic(() =>
  import("@vayva/templates/templates/eduflow/EduflowLayout").then(
    (m) => m.EduflowLayout,
  ),
);
const BulkTradeLayout = dynamic(() =>
  import("@vayva/templates/templates/bulktrade/BulkTradeLayout").then(
    (m) => m.BulkTradeLayout,
  ),
);
const MarketHubLayout = dynamic(() =>
  import("@vayva/templates/templates/markethub/MarketHubLayout").then(
    (m) => m.MarketHubLayout,
  ),
);
const GiveFlowLayout = dynamic(() =>
  import("@vayva/templates/templates/giveflow/GiveFlowLayout").then(
    (m) => m.GiveFlowLayout,
  ),
);
const HomeListLayout = dynamic(() =>
  import("@vayva/templates/templates/homelist/HomeListLayout").then(
    (m) => m.HomeListLayout,
  ),
);
const OneProductLayout = dynamic(() =>
  import("@vayva/templates/templates/one-product/OneProductLayout").then(
    (m) => m.OneProductLayout,
  ),
);
const AutoDealerHome = dynamic(() =>
  import("@vayva/templates/templates/automotive/AutoDealerHome").then(
    (m) => m.default,
  ),
);
const StaycationHome = dynamic(() =>
  import("@vayva/templates/templates/travel/StaycationHome").then(
    (m) => m.default,
  ),
);
// Blog Template (Editorial) - We register it but it's mainly for specific blog-only stores
const EditorialHome = dynamic(() =>
  import("@vayva/templates/templates/blog/EditorialHome").then(
    (m) => m.default,
  ),
);

import { TEMPLATE_REGISTRY } from "@/lib/templates-registry";

// Map registry layout keys to components
const LAYOUT_COMPONENTS: Record<string, React.ComponentType<any>> = {
  AAFashionHome: AAFashionHome,
  GizmoTechHome: GizmoTechHome,
  BloomeHomeLayout: BloomeHomeLayout,
  BooklyLayout: BooklyLayout,
  ChopnowLayout: ChopnowLayout,
  FileVaultLayout: FileVaultLayout,
  TicketlyLayout: TicketlyLayout,
  EduflowLayout: EduflowLayout,
  BulkTradeLayout: BulkTradeLayout,
  MarketHubLayout: MarketHubLayout,
  GiveFlowLayout: GiveFlowLayout,
  HomeListLayout: HomeListLayout,
  OneProductLayout: OneProductLayout,
  AutoDealerHome: AutoDealerHome,
  StaycationHome: StaycationHome,
  EditorialHome: EditorialHome,
  StoreShell: StoreShell, // Fallback/Standard
};

export default function StoreHome(): React.JSX.Element {
  const { store } = useStore();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (store) {
      const load = async () => {
        const data = await StorefrontService.getProducts(store.id);
        setProducts(data);
        setLoadingProducts(false);
      };
      load();
    }
  }, [store]);

  if (!store) return <></>;

  // Resolve Template ID from Store (Theme or Slug)
  // Priority: 1. store.theme?.templateId (if valid), 2. Look up by store slug in registry
  const themeTemplateId =
    typeof store.theme === "object" &&
    store.theme &&
    "templateId" in store.theme
      ? (store.theme as { templateId?: unknown }).templateId
      : undefined;
  let activeTemplateId =
    typeof themeTemplateId === "string" ? themeTemplateId : undefined;

  if (!activeTemplateId || !TEMPLATE_REGISTRY[activeTemplateId]) {
    // Fallback: check if the slug implies a demo template
    const demoTemplate = Object.values(TEMPLATE_REGISTRY).find(
      (t) => t.slug === store.slug,
    );
    if (demoTemplate) {
      activeTemplateId = demoTemplate.templateId;
    } else {
      activeTemplateId = "vayva-standard";
    }
  }

  const templateDef = TEMPLATE_REGISTRY[activeTemplateId];
  const componentKey = templateDef?.layoutComponent || "StoreShell";
  const ActiveLayout = LAYOUT_COMPONENTS[componentKey];

  // Specific Loading States based on theme (optional polish)
  if (loadingProducts) {
    const themeColor =
      templateDef && templateDef.defaultTheme === "dark"
        ? "bg-[#0B0F19] text-white"
        : "bg-background/70 backdrop-blur-xl text-gray-900";
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${themeColor}`}
      >
        Loading...
      </div>
    );
  }

  // If it's a specific layout (non-standard), render it securely
  if (componentKey !== "StoreShell" && ActiveLayout) {
    return <ActiveLayout store={store} products={products} />;
  }

  // Terminology Mapping
  const primaryObjectLabel =
    store.industry === "food"
      ? "Menu Items"
      : store.industry === "education"
        ? "Courses"
        : store.industry === "automotive"
          ? "Vehicles"
          : store.industry === "travel_hospitality"
            ? "Stays"
            : store.industry === "real_estate"
              ? "Properties"
              : store.industry === "blog_media"
                ? "Articles"
                : "Products";

  // DEFAULT STANDARD TEMPLATE (Fallback / StoreShell)
  // This is technically `vayva-standard`
  return (
    <StoreShell>
      {/* Hero Section */}
      <section className="relative px-4 py-20 bg-background/40 backdrop-blur-sm mb-16 rounded-[40px] border border-border/20 mx-4 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            {store.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
            {store.tagline ||
              `Explore our varied collection of premium ${primaryObjectLabel.toLowerCase()}.`}
          </p>
          <Link href={`/collections/all?store=${store.slug}`}>
            <Button className="bg-black text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-900 transition-colors">
              Shop All {primaryObjectLabel}
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured {primaryObjectLabel}</h2>
          <Link
            href={`/collections/all?store=${store.slug}`}
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {[1, 2, 3, 4].map((i: any) => (
              <div
                key={i}
                className="animate-pulse bg-background/30 rounded-2xl p-4"
              >
                <div className="bg-background/20 aspect-[4/5] rounded-xl mb-4"></div>
                <div className="h-4 bg-background/20 w-2/3 rounded mb-2"></div>
                <div className="h-4 bg-background/20 w-1/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.slice(0, 4).map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                storeSlug={store.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">No products available yet.</p>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
