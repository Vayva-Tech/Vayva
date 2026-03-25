"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

export default function NewPlanPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    planCode: "",
    currency: "NGN",
    priceMonthly: "",
    priceYearly: "",
    trialDays: "0",
    description: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/saas/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          planCode: form.planCode,
          currency: form.currency,
          priceMonthly: Number(form.priceMonthly || 0),
          priceYearly: Number(form.priceYearly || 0),
          trialDays: Number(form.trialDays || 0),
          description: form.description || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Plan created");
      router.push("/dashboard/plans");
    } catch (error) {
      logger.error("[Plan New] create failed", { error });
      toast.error("Failed to create plan");
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
                Keep pricing consistent
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Make yearly pricing reflect a clear discount (e.g. 10–20%) to encourage upgrades.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/plans" label="Back to Plans" />
          <PageHeader title="Add Plan" subtitle="Create a subscription plan tier." />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Plan details</CardTitle>
            <CardDescription>Name, code, and pricing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planCode">Plan code</Label>
              <Input
                id="planCode"
                required
                value={form.planCode}
                onChange={(e) => setForm({ ...form, planCode: e.target.value })}
                placeholder="e.g. pro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priceMonthly">Monthly price</Label>
                <Input
                  id="priceMonthly"
                  type="number"
                  value={form.priceMonthly}
                  onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priceYearly">Yearly price</Label>
                <Input
                  id="priceYearly"
                  type="number"
                  value={form.priceYearly}
                  onChange={(e) => setForm({ ...form, priceYearly: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Currency</Label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trialDays">Trial days</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={form.trialDays}
                  onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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

