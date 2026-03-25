"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";

type PolicyType =
  | "terms"
  | "privacy"
  | "returns"
  | "refunds"
  | "shipping_delivery";

interface Policy {
  id: string;
  type: PolicyType;
  title: string;
  contentMd: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string;
  lastUpdatedLabel?: string;
}

const POLICY_TYPES: { type: PolicyType; label: string }[] = [
  { type: "terms", label: "Store Terms" },
  { type: "privacy", label: "Privacy Notice" },
  { type: "returns", label: "Returns Policy" },
  { type: "refunds", label: "Refund Policy" },
  { type: "shipping_delivery", label: "Shipping & Delivery" },
];

import { apiJson } from "@/lib/api-client-shared";

interface PoliciesResponse {
  policies: Policy[];
}

interface PolicyResponse {
  policy: Policy | null;
}

export default function StorePoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedType, setSelectedType] = useState<PolicyType>("terms");
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: null | "generate" | "publish";
  }>({ open: false, action: null });

  useEffect(() => {
    void loadPolicies();
  }, []);

  useEffect(() => {
    if (selectedType) {
      void loadPolicy(selectedType);
    }
  }, [selectedType]);

  async function loadPolicies() {
    try {
      const data = await apiJson<PoliciesResponse>("/api/merchant/policies");
      setPolicies(data?.policies || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_POLICIES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    }
  }

  async function loadPolicy(type: PolicyType) {
    setLoading(true);
    try {
      const data = await apiJson<PolicyResponse>(
        `/api/merchant/policies/${type}`,
      );
      if (data?.policy) {
        setCurrentPolicy(data.policy);
        setTitle(data.policy?.title);
        setContent(data.policy?.contentMd);
      } else {
        setCurrentPolicy(null);
        setTitle("");
        setContent("");
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_POLICY_ERROR]", {
        error: _errMsg,
        type,
        app: "merchant",
      });
      setCurrentPolicy(null);
      setTitle("");
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      await apiJson<{ success: boolean }>("/api/merchant/policies/generate", {
        method: "POST",
      });
      await loadPolicies();
      await loadPolicy(selectedType);
      toast.success("Policies generated successfully!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[GENERATE_POLICIES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to generate policies");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>(
        `/api/merchant/policies/${selectedType}`,
        {
          method: "PUT",
          body: JSON.stringify({ title, contentMd: content }),
        },
      );

      await loadPolicies();
      await loadPolicy(selectedType);
      toast.success("Policy saved!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_POLICY_ERROR]", {
        error: _errMsg,
        type: selectedType,
        app: "merchant",
      });
      toast.error("Failed to save policy");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>(
        `/api/merchant/policies/${selectedType}/publish`,
        { method: "POST" },
      );
      await loadPolicies();
      await loadPolicy(selectedType);
      toast.success("Policy published!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[PUBLISH_POLICY_ERROR]", {
        error: _errMsg,
        type: selectedType,
        app: "merchant",
      });
      toast.error("Failed to publish policies");
    } finally {
      setSaving(false);
    }
  }

  const selectedPolicyData = policies.find((p) => p.type === selectedType);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ConfirmDialog
        isOpen={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, action: null })}
        onConfirm={() => {
          const action = confirmAction.action;
          setConfirmAction({ open: false, action: null });
          if (action === "generate") void handleGenerate();
          if (action === "publish") void handlePublish();
        }}
        title={
          confirmAction.action === "generate"
            ? "Generate default policies?"
            : "Publish this policy?"
        }
        message={
          confirmAction.action === "generate"
            ? "This will overwrite any existing drafts."
            : "It will be visible on your storefront."
        }
      />

      <div className="flex items-center gap-4 mb-6">
        <BackButton
          href="/dashboard/settings/overview"
          label="Back to Settings"
        />
        <PageHeader
          title="Store Policies"
          subtitle="Review, edit, and publish policies shown on your storefront."
        />
      </div>

      {/* Warning Card */}
      <Card className="bg-orange-50 border-amber-200 p-4 mb-6">
        <p className="text-sm text-amber-900">
          <strong>Note:</strong> These are templates. Review and customize them
          to match your business before publishing.
        </p>
      </Card>

      {/* Generate Button */}
      {policies.length === 0 && (
        <div className="mb-6">
          <Button
            onClick={() => setConfirmAction({ open: true, action: "generate" })}
            disabled={loading}
          >
            Generate Default Policies
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {POLICY_TYPES.map(({ type, label }) => {
            const policy = policies.find((p) => p.type === type);
            const isSelected = selectedType === type;

            return (
              <Button
                key={type}
                variant="ghost"
                onClick={() => setSelectedType(type)}
                className={`w-full justify-start h-auto px-4 py-3 rounded-lg transition-colors font-normal hover:bg-gray-100 text-gray-700 ${
                  isSelected
                    ? "bg-green-500/10 text-green-600 font-medium hover:bg-green-500/20 hover:text-green-600"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{label}</span>
                  {policy && (
                    <Badge
                      variant={policy.status === "PUBLISHED" ? "default" : "secondary"
                      }
                    >
                      {policy.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Editor */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : currentPolicy ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target?.value)
                  }
                  placeholder="Policy Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Markdown)
                </label>
                <Textarea
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target?.value)
                  }
                  placeholder="Policy content in markdown..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={() =>
                    setConfirmAction({ open: true, action: "publish" })
                  }
                  disabled={saving}
                  variant="primary"
                >
                  Publish
                </Button>
              </div>

              {selectedPolicyData?.lastUpdatedLabel && (
                <p className="text-sm text-gray-500">
                  Last published: {selectedPolicyData.lastUpdatedLabel}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No policy found</p>
              <Button
                onClick={() =>
                  setConfirmAction({ open: true, action: "generate" })
                }
              >
                Generate Policies
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
