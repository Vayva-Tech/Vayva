"use client";

import PersonalizationDashboard from "@/components/personalization/PersonalizationEngine";

export default function PersonalizationPage() {
  return (
    <div className="min-h-screen bg-background">
      <PersonalizationDashboard industry="retail" />
    </div>
  );
}