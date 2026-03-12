"use client";

import { useEffect, useState } from "react";
import { logger, formatCurrency } from "@vayva/shared";
import { Button, cn } from "@vayva/ui";
import {
  Spinner as Loader2,
  CreditCard,
  SquaresFour as Blocks,
} from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface AddOnCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  priceKobo: number;
  currency: string;
  isBaseExtension: boolean;
  purchase: {
    status: string;
    autoRenew: boolean;
    currentPeriodEnd: string;
  } | null;
}

interface AddOnsResponse {
  addOns: AddOnCatalogItem[];
}

export default function ExtensionsPage() {
  const { merchant } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const [addOns, setAddOns] = useState<AddOnCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await apiJson<AddOnsResponse>("/api/merchant/addons");
        setAddOns(data?.addOns || []);
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[Extensions] Failed to load add-ons", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    };
    void fetchCatalog();
  }, []);

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto pb-20">
      {/* Green gradient blur background */}
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-40 right-20 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-text-secondary">Platform</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
            Extensions
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-lg">
            Add industry-specific modules to your dashboard. Each extension is
            ₦10,000/month and integrates directly into your workflow.
          </p>
        </div>
        <Link href="/dashboard/billing">
          <Button
            variant="outline"
            className="rounded-full px-5 h-10 font-bold gap-2"
          >
            <CreditCard size={16} />
            Manage Billing
          </Button>
        </Link>
      </div>

      {/* Catalog */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addOns.map((ext) => {
            const isActive = ext.purchase?.status === "ACTIVE";
            const isBase = ext.isBaseExtension;

            return (
              <div
                key={ext.id}
                className={cn(
                  "relative rounded-[24px] border p-6 overflow-hidden group transition-all duration-300",
                  isActive
                    ? "border-primary/20 bg-primary/[0.02] shadow-card"
                    : isBase
                      ? "border-border/40 bg-background/20 opacity-60"
                      : "border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated hover:border-primary/20",
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-background/30 text-text-tertiary",
                    )}
                  >
                    {/* Replace Icon component with a generic way or handle specific icons if possible */}
                    {/* For now, using a fallback or specific mapping if known */}
                    <Blocks size={20} />
                  </div>

                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success">
                      Active
                    </span>
                  )}
                  {isBase && !isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/30 text-text-tertiary">
                      Included
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-text-primary mb-1">{ext.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6 line-clamp-2">
                  {ext.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <div>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase">
                      {ext.category}
                    </span>
                    {!isBase && (
                      <div className="text-xs font-bold text-text-primary mt-0.5">
                        {formatCurrency(ext.priceKobo / 100)}
                        <span className="font-normal text-text-tertiary">
                          /mo
                        </span>
                      </div>
                    )}
                  </div>

                  {!isBase && !isActive && (
                    <Link href="/dashboard/billing">
                      <Button
                        size="sm"
                        className="h-8 text-xs font-bold rounded-xl"
                      >
                        Subscribe
                      </Button>
                    </Link>
                  )}

                  {isActive && (
                    <Link href="/dashboard/billing">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-bold rounded-xl"
                      >
                        Manage
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="absolute -bottom-3 -right-3 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                  <Blocks size={80} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && addOns.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-3xl">
          <Blocks size={40} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-text-tertiary font-medium">
            No extensions available yet.
          </p>
        </div>
      )}
    </div>
  );
}
