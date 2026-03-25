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

export default function NewTenantPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tenantCode: "",
    billingEmail: "",
    customDomain: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/saas/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tenantCode: form.tenantCode,
          billingEmail: form.billingEmail,
          customDomain: form.customDomain || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Tenant created");
      router.push("/dashboard/tenants");
    } catch (error) {
      logger.error("[Tenant New] create failed", { error });
      toast.error("Failed to create tenant");
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
                Use a short tenant code
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Codes like `acme` are easier to type and work well in URLs/subdomains.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/tenants" label="Back to Tenants" />
          <PageHeader title="Add Tenant" subtitle="Create a new SaaS tenant." />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Tenant details</CardTitle>
            <CardDescription>Basic identification and billing contact.</CardDescription>
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
              <Label htmlFor="tenantCode">Tenant Code</Label>
              <Input
                id="tenantCode"
                required
                value={form.tenantCode}
                onChange={(e) => setForm({ ...form, tenantCode: e.target.value })}
                placeholder="e.g. acme"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="billingEmail">Billing Email</Label>
              <Input
                id="billingEmail"
                type="email"
                required
                value={form.billingEmail}
                onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customDomain">Custom Domain (optional)</Label>
              <Input
                id="customDomain"
                value={form.customDomain}
                onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                placeholder="e.g. app.example.com"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create tenant"}
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}

