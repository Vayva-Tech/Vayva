"use client";
import { ResourceEditPage } from "@/components/resources/ResourceEditPage";

export default function Page() {
  return (
    <ResourceEditPage
      resourceBasePath="vehicles"
      primaryObject="listing"
      title="Edit Vehicle"
    />
  );
}
