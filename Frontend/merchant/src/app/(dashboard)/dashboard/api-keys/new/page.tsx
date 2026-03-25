"use client";

import { useEffect, useState } from "react";
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

type TenantOption = { id: string; name: string };

export default function NewApiKeyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [form, setForm] = useState({
    name: "",
    tenantId: "",
    scopes: "read:all\nwrite:all",
    rateLimitPerMinute: "60",
    rateLimitPerHour: "1000",
    expiresAt: "",
  });

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await fetch("/api/saas/tenants");
        const json = await res.json();
        setTenants((json.tenants || []).map((t: any) => ({ id: t.id, name: t.name })));
      } catch (error) {
        logger.error("[API Keys New] load tenants failed", { error });
      } finally {
        setLoadingTenants(false);
      }
    };
    void loadTenants();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenantId) {
      toast.error("Select a tenant");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/saas/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tenantId: form.tenantId,
          scopes: form.scopes.split("\n").map((s) => s.trim()).filter(Boolean),
          rateLimitPerMinute: Number(form.rateLimitPerMinute || 0),
          rateLimitPerHour: Number(form.rateLimitPerHour || 0),
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("API key created");
      router.push("/dashboard/api-keys");
    } catch (error) {
      logger.error("[API Keys New] create failed", { error });
      toast.error("Failed to create API key");
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
                Security
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Least privilege
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Only grant the scopes you need and set an expiry date when possible.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/api-keys" label="Back to API Keys" />
          <PageHeader
            title="Create API Key"
            subtitle="Create an access key scoped to a tenant."
          />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Key details</CardTitle>
            <CardDescription>Tenant, scopes, and rate limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Server integration"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tenant</Label>
              <select
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                disabled={loadingTenants}
              >
                <option value="">
                  {loadingTenants ? "Loading..." : "Select tenant"}
                </option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scopes">Scopes (one per line)</Label>
              <textarea
                id="scopes"
                value={form.scopes}
                onChange={(e) => setForm({ ...form, scopes: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rateLimitPerMinute">Rate / minute</Label>
                <Input
                  id="rateLimitPerMinute"
                  type="number"
                  value={form.rateLimitPerMinute}
                  onChange={(e) => setForm({ ...form, rateLimitPerMinute: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rateLimitPerHour">Rate / hour</Label>
                <Input
                  id="rateLimitPerHour"
                  type="number"
                  value={form.rateLimitPerHour}
                  onChange={(e) => setForm({ ...form, rateLimitPerHour: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expires at (optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting || loadingTenants}>
              {submitting ? "Creating..." : "Create key"}
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}

