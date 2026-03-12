"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { KYCVerification } from "@/components/kyc/KYCVerification";

export default function KYCSettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl space-y-6">
      <Breadcrumbs />
      <div className="flex items-center gap-4">
        <BackButton
          href="/dashboard/settings/overview"
          label="Back to Settings"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Identity Verification (KYC)
          </h1>
          <p className="text-text-tertiary">
            Verify your identity to enable payouts and increase limits.
          </p>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border">
        <KYCVerification
          onSuccess={() => router.refresh()}
          onCancel={() => router.push("/dashboard/account")}
        />
      </div>
    </div>
  );
}
