import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session.server";
import { AdminShell } from "@/components/admin-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  return <AdminShell>{children}</AdminShell>;
}
