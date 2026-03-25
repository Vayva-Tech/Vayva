"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { KYCVerification } from "@/components/kyc/KYCVerification";
import { PageHeader } from "@/components/layout/PageHeader";

export default function KYCSettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <BackButton
          href="/dashboard/settings/overview"
          label="Back to Settings"
        />
        <PageHeader
          title="Identity Verification (KYC)"
          subtitle="Verify your identity to enable payouts and increase limits."
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <KYCVerification
          onSuccess={() => router.refresh()}
          onCancel={() => router.push("/dashboard/account")}
        />
      </div>
    </div>
  );
}
