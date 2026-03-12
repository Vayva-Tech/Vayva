import React from "react";
import { IndustryPageClient } from "@/components/marketing/IndustryPageClient";
import { industriesContent } from "@/data/marketing-content";

export default function NonprofitPage(): React.JSX.Element {
  return <IndustryPageClient content={industriesContent.nonprofit} />;
}
