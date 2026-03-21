"use client";

import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { Button, EmptyState } from "@vayva/ui";
import { Plus } from "@phosphor-icons/react/ssr";

export default function NavigationPage() {
  return (
    <DashboardPageShell
      title="Navigation"
      description="Manage your site menus and links."
    >
      <div className="flex justify-end mb-6">
        <Button className="bg-vayva-green text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Menu
        </Button>
      </div>

      <div className="bg-white  rounded-xl border border-gray-200 overflow-hidden p-12">
        <EmptyState
          icon="Menu"
          title="No menus created"
          description="Define the navigation structure for your online store."
        />
      </div>
    </DashboardPageShell>
  );
}
