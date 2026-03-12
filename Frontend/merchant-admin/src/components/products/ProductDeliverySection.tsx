"use client";

import { useEffect, useState } from "react";
import { Button, Input, Label, Select } from "@vayva/ui";
import { Truck, Info } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

type DeliveryType = "store_default" | "free" | "flat" | "calculated";

interface DeliveryConfig {
  type: DeliveryType;
  fee?: number;
  zones?: string[];
  requiresDelivery?: boolean;
  note?: string;
}

interface ProductDeliverySectionProps {
  productId: string;
}

export function ProductDeliverySection({ productId }: ProductDeliverySectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DeliveryConfig>({
    type: "store_default",
    requiresDelivery: true,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await apiJson<{ deliveryConfig: DeliveryConfig | null }>(
          `/api/products/${productId}/delivery`,
        );
        if (data.deliveryConfig) {
          setConfig(data.deliveryConfig);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_DELIVERY_CONFIG]", { error: msg, productId });
        // Don't show error toast - delivery config is optional
      } finally {
        setLoading(false);
      }
    };

    void fetchConfig();
  }, [productId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiJson(`/api/products/${productId}/delivery`, {
        method: "PATCH",
        body: JSON.stringify(config),
      });
      toast.success("Delivery settings saved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("[SAVE_DELIVERY_CONFIG]", { error: msg, productId });
      toast.error("Failed to save delivery settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await apiJson(`/api/products/${productId}/delivery`, {
        method: "DELETE",
      });
      setConfig({ type: "store_default", requiresDelivery: true });
      toast.success("Delivery settings reset to store default");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("[RESET_DELIVERY_CONFIG]", { error: msg, productId });
      toast.error("Failed to reset delivery settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background/70 backdrop-blur-xl p-6 rounded-xl border border-border/40 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-border/50 rounded w-1/2" />
          <div className="h-10 bg-border/50 rounded" />
          <div className="h-10 bg-border/50 rounded" />
        </div>
      </div>
    );
  }

  const showFeeInput = config.type === "flat";

  return (
    <div className="bg-background/70 backdrop-blur-xl p-6 rounded-xl border border-border/40 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-text-secondary" />
        <h2 className="font-semibold text-text-primary">Delivery Settings</h2>
      </div>

      <div className="space-y-3">
        <Label className="text-sm">Delivery Type</Label>
        <Select
          className="w-full p-2 border border-border rounded-lg text-sm"
          value={config.type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setConfig({
              ...config,
              type: e.target.value as DeliveryType,
              fee: e.target.value === "flat" ? config.fee : undefined,
            })
          }
        >
          <option value="store_default">Use Store Default</option>
          <option value="free">Free Delivery</option>
          <option value="flat">Flat Rate Delivery</option>
          <option value="calculated">Calculated (Kwik API)</option>
        </Select>
      </div>

      {showFeeInput && (
        <div className="space-y-2">
          <Label className="text-sm">Delivery Fee (NGN)</Label>
          <Input
            type="number"
            min={0}
            value={config.fee || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfig({
                ...config,
                fee: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
            className="text-sm"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input type="checkbox"
            id="requiresDelivery"
            checked={config.requiresDelivery !== false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfig({
                ...config,
                requiresDelivery: e.target.checked,
              })
            }
            className="rounded border-border"
          />
          <Label htmlFor="requiresDelivery" className="text-sm font-normal">
            Requires delivery
          </Label>
        </div>
        <p className="text-xs text-text-tertiary ml-6">
          Uncheck for digital products or services
        </p>
      </div>

      <div className="pt-2 border-t border-border/40">
        <p className="text-xs text-text-tertiary flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Product-level settings override store defaults. Set to &quot;Use Store
            Default&quot; to inherit global delivery settings.
          </span>
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="flex-1"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        {config.type !== "store_default" && (
          <Button
            onClick={handleReset}
            disabled={saving}
            variant="outline"
            size="sm"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
