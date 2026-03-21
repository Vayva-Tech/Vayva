"use client";

import { useAuth } from "@/context/AuthContext";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import { DynamicResourceForm } from "@/components/resources/DynamicResourceForm";
import { Button, EmptyState } from "@vayva/ui";
import Link from "next/link";

/**
 * UNIFIED RESOURCE FORM FACTORY
 * Replaces old static form switchers with dynamic config-driven forms.
 */
export function ProductFormFactory({ productId }: { productId?: string }) {
  const { merchant } = useAuth();
  const industrySlug =
    ((merchant as { industrySlug?: IndustrySlug })?.industrySlug) || "retail";
  const config = INDUSTRY_CONFIG[industrySlug];
  const mode = productId ? "edit" : "create";

  if (!config) {
    return (
      <EmptyState
        title="Unknown Industry Config"
        description={`No configuration found for ${industrySlug}.`}
        action={
          <Link href="/dashboard">
            <Button>Go Back</Button>
          </Link>
        }
      />
    );
  }

  // Default to the industry's primary object
  // If we want to support secondary objects (e.g. Retail creating a "Service" item),
  // we would need props to specify 'objectType'.
  // For now, adhering to strict industry primary object.
  return (
    <DynamicResourceForm
      primaryObject={config.primaryObject}
      mode={mode}
      initialData={productId ? { id: productId } : undefined}
    />
  );
}
