"use client";

import { logger, formatCurrency } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import { Button, Icon, IconName, cn } from "@vayva/ui";
import { toast } from "sonner";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";

interface AddOnPurchase {
  status: "active" | "EXPIRED" | "CANCELED" | "PENDING_PAYMENT";
  autoRenew: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

interface AddOnItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  priceKobo: number;
  currency: string;
  isBaseExtension: boolean;
  purchase: AddOnPurchase | null;
}

interface AddOnsResponse {
  addOns: AddOnItem[];
}

export function AddOnsSection() {
  const [addOns, setAddOns] = useState<AddOnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    void fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    try {
      setLoading(true);
      const res = await apiJson<AddOnsResponse>("/merchant/addons");
      setAddOns(res.addOns || []);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[FETCH_ADDONS_ERROR]", { error: _errMsg, app: "merchant" });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (extensionId: string) => {
    setActionId(extensionId);
    try {
      await apiJson<{ success: boolean }>("/merchant/addons", {
        method: "POST",
        body: JSON.stringify({ extensionId }),
      });
      toast.success("Add-on activated! Refresh your dashboard to see changes.");
      await fetchAddOns();
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      toast.error(_errMsg || "Failed to purchase add-on");
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (extensionId: string) => {
    setActionId(extensionId);
    try {
      const data = await apiJson<{ message?: string }>(
        "/merchant/addons/cancel",
        {
          method: "POST",
          body: JSON.stringify({ extensionId }),
        },
      );
      toast.success(data?.message || "Add-on will not renew.");
      await fetchAddOns();
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      toast.error(_errMsg || "Failed to cancel add-on");
    } finally {
      setActionId(null);
    }
  };

  const handleRenew = async (extensionId: string) => {
    setActionId(extensionId);
    try {
      await apiJson<{ success: boolean }>("/merchant/addons/renew", {
        method: "POST",
        body: JSON.stringify({ extensionId }),
      });
      toast.success("Auto-renew re-enabled.");
      await fetchAddOns();
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      toast.error(_errMsg || "Failed to renew add-on");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
      </div>
    );
  }

  // Only show purchasable add-ons (not the merchant's base industry extension)
  const purchasable = addOns.filter((a) => !a.isBaseExtension);

  if (purchasable.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Add-ons</h2>
        <p className="text-sm text-gray-500 mt-1">
          Expand your dashboard with extra industry modules. Each add-on is{" "}
          <span className="font-bold text-gray-900">₦10,000/month</span> and
          renews with your subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {purchasable.map((addOn) => {
          const isActive = addOn.purchase?.status?.toUpperCase() === "ACTIVE";
          const isCancelled = isActive && !addOn.purchase?.autoRenew;
          const isExpired = addOn.purchase?.status === "EXPIRED";
          const isBusy = actionId === addOn.id;

          return (
            <div
              key={addOn.id}
              className={cn(
                "relative rounded-2xl border p-5 transition-all overflow-hidden group",
                isActive
                  ? "border-green-500/30 bg-green-500/[0.02]"
                  : "border-gray-100 bg-white hover:border-gray-100",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    "p-2.5 rounded-xl",
                    isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-white/40 text-gray-400",
                  )}
                >
                  <Icon name={addOn.icon as IconName} size={18} />
                </div>

                {isActive && (
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      isCancelled
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700",
                    )}
                  >
                    {isCancelled ? "Cancelling" : "Active"}
                  </span>
                )}

                {isExpired && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    Expired
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-gray-900 mb-1">
                {addOn.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                {addOn.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400">
                  {formatCurrency(addOn.priceKobo / 100)}
                  <span className="font-normal">/mo</span>
                </span>

                {!isActive && (
                  <Button
                    size="sm"
                    onClick={() => handlePurchase(addOn.id)}
                    disabled={isBusy}
                    className="h-8 text-xs font-bold"
                  >
                    {isBusy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isExpired ? (
                      "Reactivate"
                    ) : (
                      "Add"
                    )}
                  </Button>
                )}

                {isActive && !isCancelled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(addOn.id)}
                    disabled={isBusy}
                    className="h-8 text-xs font-bold"
                  >
                    {isBusy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Cancel"
                    )}
                  </Button>
                )}

                {isActive && isCancelled && (
                  <Button
                    size="sm"
                    onClick={() => handleRenew(addOn.id)}
                    disabled={isBusy}
                    className="h-8 text-xs font-bold"
                  >
                    {isBusy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Keep Active"
                    )}
                  </Button>
                )}
              </div>

              {isActive && addOn.purchase?.currentPeriodEnd && (
                <p className="text-[10px] text-gray-400 mt-2">
                  {isCancelled ? "Expires" : "Renews"}{" "}
                  {new Date(
                    addOn.purchase.currentPeriodEnd,
                  ).toLocaleDateString()}
                </p>
              )}

              <div className="absolute -bottom-3 -right-3 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                <Icon name={addOn.icon as IconName} size={72} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
