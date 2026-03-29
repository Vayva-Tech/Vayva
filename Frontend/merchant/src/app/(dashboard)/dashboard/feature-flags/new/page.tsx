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

export default function NewFeatureFlagPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
    type: "boolean",
    environment: "production",
    isEnabled: false,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/saas/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          key: form.key,
          description: form.description || null,
          type: form.type,
          environment: form.environment,
          isEnabled: form.isEnabled,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Feature flag created");
      router.push("/dashboard/feature-flags");
    } catch (error) {
      logger.error("[Feature Flags New] create failed", { error });
      toast.error("Failed to create feature flag");
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
                Use stable keys
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Prefer keys like `new_checkout_flow` so you can reuse them across environments.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/feature-flags" label="Back to Feature Flags" />
          <PageHeader
            title="Add Feature Flag"
            subtitle="Create a new feature toggle."
          />
        </div>

        <form onSubmit={onSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Flag details</CardTitle>
            <CardDescription>Name, key, type, and environment.</CardDescription>
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
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                required
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="e.g. new_checkout_flow"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="boolean">Boolean</option>
                  <option value="percentage">Percentage</option>
                  <option value="user_segment">User segment</option>
                  <option value="plan_based">Plan based</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Environment</Label>
                <select
                  value={form.environment}
                  onChange={(e) => setForm({ ...form, environment: e.target.value })}
                  className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Enabled</Label>
              <select
                value={form.isEnabled ? "yes" : "no"}
                onChange={(e) => setForm({ ...form, isEnabled: e.target.value === "yes" })}
                className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
              >
                <option value="no">Off</option>
                <option value="yes">On</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create flag"}
            </Button>
          </CardFooter>
        </Card>
        </form>
      </PageWithInsights>
    </div>
  );
}

