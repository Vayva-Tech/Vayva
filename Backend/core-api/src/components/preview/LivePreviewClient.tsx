"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getDemoStore } from "@/lib/preview/demo-data";
import { DemoHome } from "@/components/preview/demo/DemoHome";
import { DemoCollection } from "@/components/preview/demo/DemoCollection";
import { DemoProductView } from "@/components/preview/demo/DemoProduct";
import Link from "next/link";
import { Button, cn } from "@vayva/ui";

type Mode = "live" | "images";
type Device = "desktop" | "mobile";
type View = "home" | "collection" | "product";

interface DemoStore {
  storeName: string;
  slug: string;
  plan: string;
  categories: string[];
  products: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
  }[];
}

type Props = {
  templateName: string;
  slug: string;

  LayoutComponent?: React.ComponentType<Record<string, unknown>> | null;

  fallbackDesktopImage: string;
  fallbackMobileImage: string;
  storeData?: DemoStore;
};

class PreviewErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function clamp<T extends string>(
  v: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(v ?? "") ? (v as T) : fallback;
}

export function LivePreviewClient({
  templateName,
  slug,
  LayoutComponent,
  fallbackDesktopImage,
  fallbackMobileImage,
  storeData,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const supportsLive = Boolean(LayoutComponent);

  // SAFETY: Only use demo data if no real store data is provided
  // This supports both Template Gallery (Demo) and Store Builder (Live)
  const demoStore = React.useMemo(() => getDemoStore(slug), [slug]);
  const demo = (storeData || demoStore) as DemoStore;

  const initialMode = clamp(
    params.get("mode"),
    ["live", "images"] as const,
    supportsLive ? "live" : "images",
  );
  const initialDevice = clamp(
    params.get("device"),
    ["desktop", "mobile"] as const,
    "desktop",
  );
  const initialView = clamp(
    params.get("view"),
    ["home", "collection", "product"] as const,
    "home",
  );

  const initialCategoryParam = params.get("category");
  const initialCategory = demo.categories.includes(initialCategoryParam ?? "")
    ? (initialCategoryParam as string)
    : demo.categories[0];

  const [mode, setMode] = React.useState<Mode>(
    supportsLive ? initialMode : "images",
  );
  const [device, setDevice] = React.useState<Device>(initialDevice);
  const [view, setView] = React.useState<View>(initialView);
  const [activeCategory, setActiveCategory] =
    React.useState<string>(initialCategory);

  // If a link forces mode=live but the component isn't mapped, force images.
  React.useEffect(() => {
    if (!supportsLive && mode === "live") setMode("images");
  }, [supportsLive, mode]);

  // Keep activeCategory valid if slug changes / demo categories change.
  React.useEffect(() => {
    if (!demo.categories.includes(activeCategory)) {
      setActiveCategory(demo.categories[0] ?? "New In");
    }
  }, [slug]);

  // Sync UI state to URL query params (shareable links)
  React.useEffect(() => {
    const qs = new URLSearchParams(params?.toString() ?? "");

    qs.set("mode", supportsLive ? mode : "images");
    qs.set("device", device);
    qs.set("view", view);

    if (view === "collection") qs.set("category", activeCategory);
    else qs.delete("category");

    router.replace(`?${qs.toString()}`, { scroll: false });
  }, [mode, device, view, activeCategory, supportsLive]);

  const imageSrc =
    device === "desktop" ? fallbackDesktopImage : fallbackMobileImage;

  const imageFallback = (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className={device === "mobile" ? "mx-auto max-w-sm" : ""}>
        <img
          src={imageSrc}
          alt={`${templateName} ${device} preview`}
          className="w-full rounded-xl border"
        />
      </div>
    </div>
  );

  const product = demo.products[0];

  const children =
    view === "home" ? (
      <DemoHome demo={demo} />
    ) : view === "collection" ? (
      <div>
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="flex flex-wrap gap-2">
            {demo.categories.map((c: string) => (
              <Button
                key={c}
                variant="ghost"
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm h-auto",
                  c === activeCategory
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "hover:bg-white/40",
                )}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
        <DemoCollection demo={demo} activeCategory={activeCategory} />
      </div>
    ) : (
      <DemoProductView product={product} />
    );

  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              Preview - {templateName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              /preview/{slug}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live / Images */}
            <div className="flex overflow-hidden rounded-lg border border-border bg-background">
              <Button
                variant="ghost"
                onClick={() => setMode("live")}
                disabled={!supportsLive}
                className={cn(
                  "px-3 py-2 text-sm h-auto rounded-none",
                  mode === "live"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "hover:bg-muted",
                  !supportsLive && "opacity-50",
                )}
              >
                Live
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMode("images")}
                className={cn(
                  "px-3 py-2 text-sm h-auto rounded-none",
                  mode === "images"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                Images
              </Button>
            </div>

            {/* Desktop / Mobile */}
            <div className="flex overflow-hidden rounded-lg border border-border bg-background">
              <Button
                variant="ghost"
                onClick={() => setDevice("desktop")}
                className={cn(
                  "px-3 py-2 text-sm h-auto rounded-none",
                  device === "desktop"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                Desktop
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDevice("mobile")}
                className={cn(
                  "px-3 py-2 text-sm h-auto rounded-none",
                  device === "mobile"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                Mobile
              </Button>
            </div>

            {/* Home / Collection / Product */}
            {mode === "live" && supportsLive && (
              <div className="flex overflow-hidden rounded-lg border border-border bg-background">
                <Button
                  variant="ghost"
                  onClick={() => setView("home")}
                  className={cn(
                    "px-3 py-2 text-sm h-auto rounded-none",
                    view === "home"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  Home
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setView("collection")}
                  className={cn(
                    "px-3 py-2 text-sm h-auto rounded-none",
                    view === "collection"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  Collection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setView("product")}
                  className={cn(
                    "px-3 py-2 text-sm h-auto rounded-none",
                    view === "product"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  Product
                </Button>
              </div>
            )}

            <Link
              href={`/dashboard/control-center/templates?intent=${slug}`}
              className="flex-1 bg-primary text-primary-foreground text-center py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Customize in Builder
            </Link>
          </div>
        </div>
      </div>

      {mode === "live" && supportsLive && LayoutComponent ? (
        <PreviewErrorBoundary fallback={imageFallback}>
          <div className={device === "mobile" ? "mx-auto max-w-sm" : ""}>
            <LayoutComponent
              storeName={demo.storeName}
              slug={demo.slug}
              plan={demo.plan}
            >
              {children}
            </LayoutComponent>
          </div>
        </PreviewErrorBoundary>
      ) : (
        imageFallback
      )}
    </div>
  );
}
