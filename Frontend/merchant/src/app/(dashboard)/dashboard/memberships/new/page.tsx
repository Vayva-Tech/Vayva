"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { BackButton } from "@/components/ui/BackButton";
import { Button, Input, Label } from "@vayva/ui";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function NewMembershipPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly",
    tier: "basic",
    trialDays: "0",
    features: "",
    isActive: true,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiJson("/memberships", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price ? Number(form.price) : 0,
          billingCycle: form.billingCycle,
          tier: form.tier,
          trialDays: form.trialDays ? Number(form.trialDays) : 0,
          features: form.features
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean),
          isActive: form.isActive,
        }),
      });
      toast.success("Membership plan created");
      router.push("/dashboard/memberships");
    } catch (error: unknown) {
      logger.error("[CREATE_MEMBERSHIP_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        app: "merchant",
      });
      toast.error("Failed to create membership plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tip
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Start simple
              </div>
              <p className="text-sm text-gray-500 mt-1">
                2–3 tiers usually convert better than many options.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/memberships" label="Back to Memberships" />
          <PageHeader
            title="New Membership Plan"
            subtitle="Create a membership tier and benefits."
          />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Plan details</CardTitle>
              <CardDescription>Name, pricing, and benefits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="e.g. Gold"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Billing cycle</Label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tier</Label>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trialDays">Trial days</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={form.trialDays}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, trialDays: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <textarea
                id="features"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm min-h-[120px]"
                placeholder={"Priority support\nDiscounts\nEarly access"}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create plan"}
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}

