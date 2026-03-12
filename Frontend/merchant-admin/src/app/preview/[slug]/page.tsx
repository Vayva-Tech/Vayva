"use client";

import { notFound } from "next/navigation";
import { getNormalizedTemplates } from "@/lib/templates/index";
import { LivePreviewClient } from "@/components/preview/LivePreviewClient";
import { resolveLayout } from "@/lib/templates/layout-resolver";

const DEFAULT_DESKTOP_PREVIEW =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop";
const DEFAULT_MOBILE_PREVIEW =
  "https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=2071&auto=format&fit=crop";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getNormalizedTemplates().find((t: any) => t.slug === slug);
  if (!template) return notFound();

  const layoutKey =
    (template as { layoutKey?: string; layoutComponent?: string }).layoutKey ||
    (template as { layoutKey?: string; layoutComponent?: string }).layoutComponent ||
    "default";
  const LayoutComponent = resolveLayout(layoutKey);

  return (
    <LivePreviewClient
      templateName={template.displayName}
      slug={template.slug}
      LayoutComponent={LayoutComponent || (() => <div>Layout not found</div>)}
      fallbackDesktopImage={
        template.preview?.desktopUrl || DEFAULT_DESKTOP_PREVIEW
      }
      fallbackMobileImage={
        template.preview?.mobileUrl || DEFAULT_MOBILE_PREVIEW
      }
    />
  );
}
