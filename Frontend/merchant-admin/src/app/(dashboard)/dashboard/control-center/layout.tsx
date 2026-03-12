"use client";

import { PropsWithChildren } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ControlCenterLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col h-full space-y-6">
      <DashboardHeader
        heading="Control Center"
        text="Manage your storefront appearance and configuration."
        action={<div />} // Action slot
      />

      <div className="px-6">
        <Tabs value="templates" className="w-full">
          <TabsList>
            <Link href="/dashboard/control-center">
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </Link>
            {/* Future Tabs: Pages, Assets */}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 px-6 pb-6">{children}</div>
    </div>
  );
}
