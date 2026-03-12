"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Icon, Input } from "@vayva/ui";

interface KYCVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

import { apiJson } from "@/lib/api-client-shared";

type KycStatus = "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";

interface KycStatusResponse {
  status: KycStatus | string;
  ninSubmitted: boolean;
  cacSubmitted: boolean;
  canWithdraw: boolean;
  submittedAt: string | null;
  rejectionReason?: string;
}

interface KycSubmitResponse {
  success?: boolean;
  status?: string;
  error?: string;
}

export function KYCVerification({ onSuccess, onCancel }: KYCVerificationProps) {
  const [kycStatus, setKycStatus] = useState<KycStatusResponse | null>(null);
  const [nin, setNin] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const data = await apiJson<KycStatusResponse>("/api/kyc/status");
      setKycStatus(data);
    } catch {
      setKycStatus({
        status: "NOT_STARTED",
        ninSubmitted: false,
        cacSubmitted: false,
        canWithdraw: false,
        submittedAt: null,
      });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Consent is required");
      return;
    }

    if (!/^\d{11}$/.test(nin.trim())) {
      setError("NIN must be exactly 11 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiJson<KycSubmitResponse>("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify({
          nin: nin.trim(),
          cacNumber: cacNumber.trim() || undefined,
          consent,
        }),
      });

      if (result.success === false) {
        setError(result.error || "Submission failed");
      } else {
        onSuccess?.();
        await fetchStatus();
      }
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      setError(_errMsg || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (kycStatus?.status?.toUpperCase() === "VERIFIED") {
    return (
      <div className="text-center py-12 px-6 space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Icon name={"CheckCircle"} size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Verification Complete
          </h2>
          <p className="text-text-secondary">
            Your identity has been verified. Payouts are now enabled.
          </p>
        </div>
        <Button onClick={onCancel} className="w-full">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (kycStatus?.status === "REJECTED") {
    return (
      <div className="py-10 px-6 space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="mt-1 text-red-400">
            <Icon name="XCircle" size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Verification Rejected</h3>
            <p className="text-sm text-text-secondary">
              Your identity submission was rejected. Please review the feedback below and resubmit with corrected information.
            </p>
            {kycStatus.rejectionReason && (
              <div className="mt-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                <p className="text-xs text-red-400 font-medium uppercase tracking-wider mb-1">Reason</p>
                <p className="text-sm text-white">{kycStatus.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-background/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-tertiary">Previous NIN</p>
            <p className="text-sm font-semibold text-white">
              {kycStatus.ninSubmitted ? "Submitted" : "Not provided"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-background/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-tertiary">Previous CAC</p>
            <p className="text-sm font-semibold text-white">
              {kycStatus.cacSubmitted ? "Submitted" : "Not provided"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
          <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-2">Common Issues</p>
          <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
            <li>NIN must be exactly 11 digits</li>
            <li>Name on NIN must match business registration</li>
            <li>CAC number format should be RCXXXXXX or BNXXXXXX</li>
            <li>Ensure documents are clear and legible</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => {
              // Reset status to allow resubmission
              setKycStatus((prev) => prev ? { ...prev, status: "NOT_STARTED" } : null);
            }}
            className="flex-1"
          >
            Resubmit KYC
          </Button>
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (kycStatus?.status?.toUpperCase() === "PENDING") {
    return (
      <div className="py-10 px-6 space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="mt-1 text-amber-400">
            <Icon name="Clock3" size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">KYC Under Review</h3>
            <p className="text-sm text-text-secondary">
              Your identity submission is pending manual approval by the
              operations team.
            </p>
            {kycStatus?.submittedAt && (
              <p className="text-xs text-text-tertiary">
                Submitted on {new Date(kycStatus.submittedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-background/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-tertiary">
              NIN
            </p>
            <p className="text-sm font-semibold text-white">
              {kycStatus?.ninSubmitted ? "Submitted" : "Not submitted"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-background/5 p-4">
            <p className="text-xs uppercase tracking-wider text-text-tertiary">
              CAC
            </p>
            <p className="text-sm font-semibold text-white">
              {kycStatus?.cacSubmitted ? "Submitted" : "Optional"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => void fetchStatus()}
            className="flex-1"
            disabled={statusLoading}
          >
            Refresh Status
          </Button>
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 w-48 bg-background/10 rounded animate-pulse" />
        <div className="h-20 bg-background/5 rounded-xl animate-pulse" />
        <div className="h-20 bg-background/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Identity Verification</h2>
        <p className="text-text-secondary font-medium">
          Submit your NIN (required) and CAC number (optional) for manual
          review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="National Identity Number (NIN)"
          placeholder="11-digit NIN"
          value={nin}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNin(e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          required
          disabled={loading}
        />

        <Input
          label="CAC Number (Optional)"
          placeholder="e.g. RC1234567"
          value={cacNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCacNumber(e.target.value)
          }
          disabled={loading}
        />

        <div className="flex items-start gap-3 p-4 bg-background/5 rounded-xl border border-white/10">
          <Input type="checkbox"
            checked={consent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConsent(e.target.checked)
            }
            className="mt-1 accent-primary"
            id="consent-id"
            disabled={loading}
          />
          <label
            htmlFor="consent-id"
            className="text-xs text-text-secondary leading-relaxed cursor-pointer select-none"
          >
            I confirm this information is accurate and consent to manual
            identity verification review.
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
            <Icon name={"AlertCircle"} size={16} />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1"
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} className="flex-[2]">
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
}
