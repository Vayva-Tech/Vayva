"use client";

import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { Button, EmptyState } from "@vayva/ui";
import { Plus } from "@phosphor-icons/react/ssr";

export default function PagesPage() {
  return (
    <DashboardPageShell
      title="Pages"
      description="Manage your site content pages."
    >
      <div className="flex justify-end mb-6">
        <Button className="bg-vayva-green text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Page
        </Button>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border border-border overflow-hidden p-12">
        <EmptyState
          icon="FileText"
          title="No pages yet"
          description="Create your first page such as About Us, FAQ, or Contact."
        />
      </div>
    </DashboardPageShell>
  );
}
