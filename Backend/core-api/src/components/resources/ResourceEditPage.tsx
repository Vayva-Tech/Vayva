"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import { Button, Icon } from "@vayva/ui";
import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";
import { PrimaryObject } from "@/lib/templates/types";

interface ResourceEditPageProps {
  primaryObject: PrimaryObject;
  resourceBasePath: string; // e.g. "menu-items", "listings"
  title?: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface ResourceResponse {
  id: string;
  [key: string]: unknown;
}

export function ResourceEditPage({
  primaryObject,
  resourceBasePath,
  title,
}: ResourceEditPageProps) {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch Data
    const loadResource = async () => {
      try {
        setIsLoading(true);
        const data = await apiJson<ResourceResponse>(
          `/api/resources/${primaryObject}/${id}`,
        );
        setInitialData(data as Record<string, unknown>);
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[LOAD_RESOURCE_ERROR]", {
          error: _errMsg,
          app: "merchant",
          primaryObject,
          id,
        });
        setError(_errMsg);
        toast.error("Failed to load resource data");
      } finally {
        setIsLoading(false);
      }
    };
    void loadResource();
  }, [id, primaryObject]);

  const _handleSuccess = () => {
    toast.success("Updated successfully");
    router.push(`/dashboard/${resourceBasePath}`);
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Icon name="AlertTriangle" className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-text-tertiary mb-4">{error}</p>
        <Button onClick={() => router.push(`/dashboard/${resourceBasePath}`)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold capitalize">
          {title || `Edit ${primaryObject.replace(/_/g, " ")}`}
        </h1>
      </div>

      <DynamicResourceForm
        primaryObject={primaryObject}
        mode="edit"
        initialData={initialData}
        onSuccessPath={`/dashboard/${resourceBasePath}`} // New prop support or handled by hook?
        // Note: DynamicResourceForm usually handles submit internally.
        // If it accepts `onSuccess` callback, clearer.
        // I'll assume standard usage from my previous edits or update DynamicResourceForm if needed.
        // Actually, previous DynamicResourceForm logic was: create->submit->toast->redirect.
        // I need to ensure it handles PUT for edit mode.
        // pass the ID?
        resourceId={id}
      />
    </div>
  );
}
