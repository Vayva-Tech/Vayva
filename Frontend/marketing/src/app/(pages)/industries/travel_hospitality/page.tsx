import React from "react";
import { IndustryPageClient } from "@/components/marketing/IndustryPageClient";
import { industriesContent } from "@/data/marketing-content";

export default function TravelHospitalityPage(): React.JSX.Element {
  return <IndustryPageClient content={industriesContent.travel_hospitality} />;
}
