"use client";
import { ResourceEditPage } from "@/components/resources/ResourceEditPage";

export default function Page() {
  // Using 'listing' or 'service' as the underlying object for a lead.
  // Let's assume 'listing' as it's generic enough or 'service'.
  return (
    <ResourceEditPage
      resourceBasePath="leads"
      primaryObject="listing"
      title="Lead Details"
    />
  );
}
