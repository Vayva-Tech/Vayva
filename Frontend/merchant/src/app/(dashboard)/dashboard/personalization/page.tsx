"use client";

import PersonalizationDashboard from "@/components/personalization/PersonalizationEngine";

export default function PersonalizationPage() {
  return (
    <div className="min-h-screen bg-white">
      <PersonalizationDashboard industry="retail" />
    </div>
  );
}