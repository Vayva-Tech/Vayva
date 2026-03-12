import React from "react";
import { IndustryPageClient } from "@/components/marketing/IndustryPageClient";
import { industriesContent } from "@/data/marketing-content";

export default function B2BPage(): React.JSX.Element {
  return <IndustryPageClient content={industriesContent.b2b} />;
}
