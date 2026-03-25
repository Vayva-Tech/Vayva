"use client";

import { PropsWithChildren } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ControlCenterLayout({ children }: PropsWithChildren) {
  const pathname = usePathname() ?? "";
  const tab =
    pathname === "/dashboard/control-center"
      ? "overview"
      : pathname.startsWith("/dashboard/control-center/templates")
        ? "templates"
        : pathname.startsWith("/dashboard/control-center/customize")
          ? "customize"
          : pathname.startsWith("/dashboard/control-center/pro")
            ? "pro"
            : "overview";

  return (
    <div className="flex flex-col h-full space-y-6">
      <DashboardHeader
        heading="Control Center"
        text="Manage your storefront appearance and configuration."
        action={<div />} // Action slot
      />

      <div className="px-6">
        <Tabs value={tab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview" asChild>
              <Link href="/dashboard/control-center">Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="templates" asChild>
              <Link href="/dashboard/control-center/templates">Templates</Link>
            </TabsTrigger>
            <TabsTrigger value="customize" asChild>
              <Link href="/dashboard/control-center/customize">Customize</Link>
            </TabsTrigger>
            <TabsTrigger value="pro" asChild>
              <Link href="/dashboard/control-center/pro">Pro</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 px-6 pb-6">{children}</div>
    </div>
  );
}
