import React from "react";
import { OpsShell } from "@/components/OpsShell";
import { ImpersonationProvider } from "@/hooks/useImpersonation";
import { OpsAuthService } from "@/lib/ops-auth";
import { redirect } from "next/navigation";

export default async function OpsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Strict Server-Side Auth Check
  const session = await OpsAuthService.getSession();

  if (!session) {
    // Redirect to login with return URL
    redirect("/ops/login");
  }

  return (
    <ImpersonationProvider>
      <OpsShell>{children}</OpsShell>
    </ImpersonationProvider>
  );
}
