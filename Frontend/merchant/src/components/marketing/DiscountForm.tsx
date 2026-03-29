"use client";

import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";

import { apiJson } from "@/lib/api-client-shared";

interface DiscountResponse {
  id: string;
  name: string;
  code?: string;
  requiresCoupon: boolean;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  valuePercent?: number;
  valueAmount?: number;
  minOrderAmount?: number;
  startsAt: string;
  endsAt?: string;
  usageLimitTotal?: number;
}

export function DiscountForm({ id }: { id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  // State
  const [method, setMethod] = useState<"CODE" | "AUTOMATIC">("CODE");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    value: "",
    minOrder: "",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: "",
    usageLimit: "",
  });

  useEffect(() => {
    if (id) {
      const loadDiscount = async () => {
        try {
          setFetching(true);
          const data = await apiJson<DiscountResponse>(
            `/api/marketing/discounts/${id}`,
          );
          setFormData({
            title: data.name || "",
            code: data.code || "",
            value: (data.valuePercent ?? data.valueAmount ?? "").toString(),
            minOrder: (data.minOrderAmount || "").toString(),
            startsAt: data.startsAt
              ? new Date(data.startsAt).toISOString().slice(0, 16)
              : new Date().toISOString().slice(0, 16),
            endsAt: data.endsAt
              ? new Date(data.endsAt).toISOString().slice(0, 16)
              : "",
            usageLimit: (data.usageLimitTotal || "").toString(),
          });
          setMethod(data.requiresCoupon ? "CODE" : "AUTOMATIC");
          setType(data.type || "PERCENTAGE");
        } catch (error: unknown) {
          const _errMsg =
            error instanceof Error ? error.message : String(error);
          logger.error("[LOAD_DISCOUNT_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
          toast.error(_errMsg || "Failed to load discount");
        } finally {
          setFetching(false);
        }
      };
      void loadDiscount();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (method === "CODE" && !formData.code)
        throw new Error("Code is required");
      if (!formData.title) throw new Error("Title is required");
      if (!formData.value) throw new Error("Discount value is required");

      const payload = {
        name: formData.title.trim(),
        code:
          method === "CODE" ? formData.code.trim().toUpperCase() : undefined,
        requiresCoupon: method === "CODE",
        type,
        valuePercent:
          type === "PERCENTAGE"
            ? parseFloat(formData.value.toString()) || 0
            : undefined,
        valueAmount:
          type === "FIXED_AMOUNT"
            ? parseFloat(formData.value.toString()) || 0
            : undefined,
        minOrderAmount: formData.minOrder
          ? parseFloat(formData.minOrder.toString())
          : 0,
        startsAt: formData.startsAt,
        endsAt: formData.endsAt || undefined,
        usageLimitTotal: formData.usageLimit
          ? parseInt(formData.usageLimit.toString())
          : undefined,
      };

      await apiJson<{ success: boolean }>(
        id ? `/api/marketing/discounts/${id}` : "/marketing/discounts",
        {
          method: id ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      toast.success(`Discount ${id ? "updated" : "created"} successfully`);
      router.push("/dashboard/marketing/discounts");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SUBMIT_DISCOUNT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to save discount");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      {/* 1. Method & Code */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Button
              type="button"
              variant={method === "CODE" ? undefined : "outline"}
              onClick={() => setMethod("CODE")}
              disabled={loading}
            >
              Discount Code
            </Button>
            <Button
              type="button"
              variant={method === "AUTOMATIC" ? undefined : "outline"}
              onClick={() => setMethod("AUTOMATIC")}
              disabled={loading}
            >
              Automatic Discount
            </Button>
          </div>

          {method === "CODE" ? (
            <div>
              <Label>Discount Code</Label>
              <Input
                value={formData.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="SUMMER2024"
                className="font-mono uppercase text-lg"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers will enter this code at checkout.
              </p>
            </div>
          ) : (
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Summer Sale"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Customers will see this in their cart.
              </p>
            </div>
          )}

          {method === "CODE" && (
            <div>
              <Label>Internal Name (Optional)</Label>
              <Input
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Summer Sale Campaign"
                disabled={loading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Value */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v: string) =>
                  setType(v as "PERCENTAGE" | "FIXED_AMOUNT")
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={type === "PERCENTAGE" ? "20" : "1000"}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Requirements & Limits */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-medium text-sm text-gray-900 border-b pb-2">
            Requirements
          </h3>
          <div>
            <Label>Minimum Order Amount (Optional)</Label>
            <Input
              type="number"
              value={formData.minOrder}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, minOrder: e.target.value })
              }
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          <div>
            <Label>Usage Limit (Total)</Label>
            <Input
              type="number"
              value={formData.usageLimit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              placeholder="No limit"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Total number of times this discount can be used.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Schedule */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-medium text-sm text-gray-900 border-b pb-2">
            Active Dates
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, startsAt: e.target.value })
                }
                disabled={loading}
              />
            </div>
            <div>
              <Label>End Date (Optional)</Label>
              <Input
                type="datetime-local"
                value={formData.endsAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, endsAt: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Update Discount" : "Save Discount"}
        </Button>
      </div>
    </form>
  );
}
