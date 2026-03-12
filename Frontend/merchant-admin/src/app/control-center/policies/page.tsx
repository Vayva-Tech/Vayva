"use client";

import React, { useEffect, useState, Suspense } from "react";
import { logger } from "@vayva/shared";
import { useSearchParams } from "next/navigation";
import { PolicyEditor } from "@/components/policies/PolicyEditor";

import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface PoliciesResponse {
  returnsMarkdown?: string;
  shippingMarkdown?: string;
  privacyMarkdown?: string;
  termsMarkdown?: string;
  slug?: string;
}

type PolicyType = "returns" | "shipping" | "privacy" | "terms";

// Test fetch
const fetchPolicies = async () => {
  try {
    return await apiJson<PoliciesResponse>("/api/store/policies");
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[FETCH_POLICIES_ERROR]", { error: _errMsg, app: "merchant" });
    throw error;
  }
};

const savePolicies = async (data: Record<string, unknown>) => {
  try {
    await apiJson<{ success: boolean }>("/api/store/policies", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    toast.success("Policies updated");
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[SAVE_POLICIES_ERROR]", { error: _errMsg, app: "merchant" });
    toast.error(_errMsg || "Failed to save policies");
    throw error;
  }
};

function PoliciesContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "returns"; // default to returns
  const [storeData, setStoreData] = useState<PoliciesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies()
      .then((data) => {
        setStoreData(data);
        setLoading(false);
      })
      .catch((error: any) => {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[FETCH_POLICIES_EFFECT_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (content: string) => {
    const field =
      tab === "returns"
        ? "returnsMarkdown"
        : tab === "shipping"
          ? "shippingMarkdown"
          : tab === "privacy"
            ? "privacyMarkdown"
            : "termsMarkdown";

    await savePolicies({ [field]: content });
    // Optimistic update
    if (storeData) {
      setStoreData({ ...storeData, [field]: content });
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-text-tertiary">
        Loading editor...
      </div>
    );

  if (!storeData) return <div>Failed to load policies.</div>;

  const content =
    tab === "returns"
      ? storeData.returnsMarkdown
      : tab === "shipping"
        ? storeData.shippingMarkdown
        : tab === "privacy"
          ? storeData.privacyMarkdown
          : storeData.termsMarkdown;

  return (
    <PolicyEditor
      key={tab} // Force re-mount on tab change to reset state
      type={tab as PolicyType}
      initialContent={content}
      onSave={handleSave}
      storeSlug={storeData.slug || "demo-store"}
    />
  );
}

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-text-tertiary">Loading...</div>
      }
    >
      <PoliciesContent />
    </Suspense>
  );
}
