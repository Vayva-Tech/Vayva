"use client";
import { ResourceEditPage } from "@/components/resources/ResourceEditPage";

export default function Page() {
  return (
    <ResourceEditPage
      resourceBasePath="stays"
      primaryObject="stay"
      title="Edit Stay"
    />
  );
}
