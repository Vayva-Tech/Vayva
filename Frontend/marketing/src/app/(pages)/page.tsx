import React from "react";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { CleanLandingClient } from "@/components/marketing/CleanLandingClient";

export default async function LandingPage(_props: {
  searchParams: Promise<{ industry?: string }>;
}): Promise<React.JSX.Element> {
  return (
    <div className="relative overflow-hidden">
      <SchemaOrg type="SoftwareApplication" />
      <CleanLandingClient />
    </div>
  );
}
