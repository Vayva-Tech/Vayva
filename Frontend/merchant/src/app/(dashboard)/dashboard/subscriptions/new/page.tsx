"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

type Option = { id: string; name: string };

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Option[]>([]);
  const [plans, setPlans] = useState<Option[]>([]);
  const [form, setForm] = useState({
    tenantId: "",
    planId: "",
    billingCycle: "monthly",
    isTrial: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          fetch("/saas/tenants"),
          fetch("/saas/plans?status=active"),
        ]);
        const tenantsJson = await tRes.json();
        const plansJson = await pRes.json();
        setTenants((tenantsJson.tenants || []).map((t: any) => ({ id: t.id, name: t.name })));
        setPlans((plansJson.plans || []).map((p: any) => ({ id: p.id, name: p.name })));
      } catch (error) {
        logger.error("[Subscription New] load options failed", { error });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenantId || !form.planId) {
      toast.error("Select a tenant and a plan");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/saas/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Subscription created");
      router.push("/dashboard/subscriptions");
    } catch (error) {
      logger.error("[Subscription New] create failed", { error });
      toast.error("Failed to create subscription");
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
                Check trial status
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use trials for onboarding; disable trials for renewals/migrations.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/subscriptions" label="Back to Subscriptions" />
          <PageHeader title="Add Subscription" subtitle="Attach a plan to a tenant." />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Tenant, plan, and billing cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tenant</Label>
              <select
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                disabled={loading}
              >
                <option value="">{loading ? "Loading..." : "Select tenant"}</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Plan</Label>
              <select
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                disabled={loading}
              >
                <option value="">{loading ? "Loading..." : "Select plan"}</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Billing cycle</Label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Trial</Label>
                <select
                  value={form.isTrial ? "yes" : "no"}
                  onChange={(e) => setForm({ ...form, isTrial: e.target.value === "yes" })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Creating..." : "Create subscription"}
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}

