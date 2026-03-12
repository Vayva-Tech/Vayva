"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label, cn } from "@vayva/ui";
import { useState } from "react";
import {
  Shield,
  CheckCircle,
  UploadSimple as ArrowRight,
  Spinner as Loader2,
  UserCheck,
  ShieldCheck,
  Info,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

import { apiJson } from "@/lib/api-client-shared";

interface KycStepState {
  kyc?: {
    nin?: string;
    ninVerified?: boolean;
    ninSubmitted?: boolean;
  };
  identity?: {
    fullName?: string;
  };
}

interface KycSubmitResponse {
  success?: boolean;
  status?: string;
  error?: string;
}

export default function KycStep() {
  const { nextStep, prevStep, updateData, state, isSaving } = useOnboarding();
  const currentState = state as unknown as KycStepState;

  // NIN Verification (Manual Review) - Only Required Field
  const [nin, setNin] = useState(currentState.kyc?.nin || "");
  const [ninVerifying, setNinVerifying] = useState(false);
  const [ninVerified, setNinVerified] = useState(
    currentState.kyc?.ninVerified || currentState.kyc?.ninSubmitted || false,
  );

  const verifyNin = async () => {
    const trimmedNin = nin.trim();
    if (trimmedNin.length !== 11) {
      toast.error("NIN must be 11 digits");
      return;
    }
    setNinVerifying(true);

    // Parse fullName from identity step into firstName/lastName
    const fullName = (currentState.identity?.fullName || "").trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!firstName || !lastName) {
      toast.error(
        "Please complete the Identity step first (full name required).",
      );
      setNinVerifying(false);
      return;
    }

    try {
      const data = await apiJson<KycSubmitResponse>("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify({
          nin: trimmedNin,
          firstName,
          lastName,
        }),
      });

      if (data.success !== false && data.status !== "REJECTED") {
        setNinVerified(true);
        toast.success("NIN submitted for review!");
      } else {
        toast.error(
          data.error ||
            "NIN submission failed. Please check your details and try again.",
        );
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      toast.error(_errMsg || "NIN verification failed");
    } finally {
      setNinVerifying(false);
    }
  };

  const handleSkip = () => {
    const skipData = { kyc: { skipped: true } };
    const typedSkipData = skipData as Parameters<typeof updateData>[0];
    updateData(typedSkipData);
    nextStep(typedSkipData);
  };

  const handleContinue = async () => {
    if (!ninVerified) {
      toast.error("Please submit your NIN to continue");
      return;
    }

    const kycData = {
      kyc: {
        nin,
        ninVerified,
        ninSubmitted: true,
      },
    };

    const typedKycData = kycData as Parameters<typeof updateData>[0];
    updateData(typedKycData);
    nextStep(typedKycData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <ShieldCheck size={24} className="text-text-tertiary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-primary">
          Identity Verification
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          Complete your KYC to unlock full payment processing and business
          features.
        </p>
      </div>

      <div className="space-y-4">
        {/* NIN Verification (Manual Review) - Only Required */}
        <div
          className={cn(
            "bg-background border-2 rounded-3xl p-6 transition-all duration-300",
            ninVerified
              ? "border-vayva-green bg-vayva-green/5 shadow-sm"
              : "border-border shadow-card",
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors",
                  ninVerified
                    ? "bg-vayva-green text-white"
                    : "bg-white/40 text-text-tertiary",
                )}
              >
                <UserCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-primary">
                  NIN Verification
                </h3>
                <p className="text-sm text-text-tertiary font-medium">
                  Your NIN will be reviewed by our team
                </p>
              </div>
            </div>
            {ninVerified && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-vayva-green rounded-full shadow-sm">
                <CheckCircle className="h-4 w-4 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  SUBMITTED
                </span>
              </div>
            )}
          </div>

          {!ninVerified ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nin"
                  className="text-sm font-bold text-text-secondary ml-1"
                >
                  National Identity Number (NIN)
                </Label>
                <Input
                  id="nin"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 11-digit NIN"
                  value={nin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNin(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  className="h-12 text-lg font-black tracking-[0.2em] text-center rounded-2xl border-2 focus:border-vayva-green focus:ring-vayva-green/20"
                  maxLength={11}
                  disabled={ninVerifying || isSaving}
                />
                <p className="text-xs text-text-tertiary mt-1 ml-1">
                  Your NIN is the 11-digit number on your National ID slip or
                  NIMC app
                </p>
              </div>
              <Button
                onClick={verifyNin}
                disabled={nin.length !== 11 || ninVerifying}
                className="w-full h-14 bg-text-primary hover:bg-zinc-800 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98]"
              >
                {ninVerifying ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span>Submit for Review</span>
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-vayva-green/20 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1">
                  NIN Number
                </p>
                <p className="text-lg font-black tracking-widest text-text-primary truncate">
                  *******{nin.slice(-4)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNinVerified(false);
                  setNin("");
                }}
                className="text-text-tertiary hover:text-status-danger transition-colors font-bold text-xs"
              >
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
            <Info size={20} className="text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-blue-900 mb-1">
              Why is this required?
            </p>
            <p className="text-blue-700/80 leading-relaxed">
              NIN verification is mandatory for regulatory compliance (CBN/NDPR)
              and to unlock your store's ability to receive payouts directly to
              your bank account.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3 border-t border-border">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isSaving}
            className="h-14 px-8 rounded-2xl border-2 font-bold hover:bg-white/40"
          >
            Back
          </Button>
          <Button
            className="flex-1 h-14 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
            onClick={handleContinue}
            disabled={!ninVerified || isSaving}
          >
            Save & Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isSaving}
          className="h-10 text-sm text-text-tertiary hover:text-text-secondary font-medium"
        >
          Skip for now — I&apos;ll complete this later in Settings
        </Button>
      </div>
    </div>
  );
}
