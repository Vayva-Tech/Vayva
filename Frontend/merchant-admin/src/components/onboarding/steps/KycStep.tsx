"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label, cn } from "@vayva/ui";
import { useState } from "react";
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Spinner as Loader2,
  UserCheck,
  ShieldCheck,
  Info,
  CreditCard,
  Car,
  IdentificationCard,
  AirplaneTilt,
  Building,
  Upload,
  Wallet,
  TrendUp,
  Crown,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

import { apiJson } from "@/lib/api-client-shared";

type IdType = "NIN" | "DRIVERS_LICENSE" | "VOTERS_CARD" | "PASSPORT" | "CAC";

interface KycStepState {
  kyc?: {
    idType?: IdType;
    idNumber?: string;
    submitted?: boolean;
    skipped?: boolean;
    nin?: string;
    cac?: string;
    status?: string;
  };
  identity?: {
    fullName?: string;
  };
}

interface KycSubmitResponse {
  success?: boolean;
  status?: string;
  error?: string;
  targetLevel?: number;
  message?: string;
}

const ID_OPTIONS: { type: IdType; label: string; icon: React.ElementType; placeholder: string; hint: string }[] = [
  { type: "NIN", label: "National Identity Number (NIN)", icon: CreditCard, placeholder: "11-digit NIN", hint: "Found on your National ID slip or NIMC app" },
  { type: "DRIVERS_LICENSE", label: "Driver's License", icon: Car, placeholder: "License number (e.g., ABC123456)", hint: "3 letters followed by 6-12 digits" },
  { type: "VOTERS_CARD", label: "Voter's Card (VIN)", icon: IdentificationCard, placeholder: "Voter ID Number", hint: "10-20 digit number on your voter's card" },
  { type: "PASSPORT", label: "International Passport", icon: AirplaneTilt, placeholder: "Passport number (e.g., A12345678)", hint: "Letter A followed by 8 digits" },
  { type: "CAC", label: "CAC Registration Number", icon: Building, placeholder: "RC or BN number", hint: "For registered businesses" },
];

const KYC_LEVELS = [
  { level: 0, name: "Basic", limit: "₦50,000", icon: Wallet, color: "text-zinc-500" },
  { level: 1, name: "Verified", limit: "₦200,000", icon: Shield, color: "text-blue-500" },
  { level: 2, name: "Trusted", limit: "₦1,000,000", icon: TrendUp, color: "text-violet-500" },
  { level: 3, name: "Business", limit: "₦5,000,000", icon: Crown, color: "text-amber-500" },
];

export default function KycStep() {
  const { nextStep, prevStep, updateData, state, isSaving } = useOnboarding();
  const currentState = state as Partial<KycStepState>;

  const [selectedIdType, setSelectedIdType] = useState<IdType>(currentState.kyc?.idType || "NIN");
  const [idNumber, setIdNumber] = useState(currentState.kyc?.idNumber || "");
  const [cacNumber, setCacNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(currentState.kyc?.submitted || false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const selectedOption = ID_OPTIONS.find(opt => opt.type === selectedIdType)!;

  const validateId = (type: IdType, value: string): boolean => {
    const trimmed = value.trim();
    switch (type) {
      case "NIN": return /^\d{11}$/.test(trimmed);
      case "DRIVERS_LICENSE": return /^[A-Z]{3}\d{6,12}$/i.test(trimmed);
      case "VOTERS_CARD": return /^\d{10,20}$/.test(trimmed);
      case "PASSPORT": return /^A\d{8}$/i.test(trimmed);
      case "CAC": return /^(RC|BN)?\d{5,8}$/i.test(trimmed);
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (selectedIdType !== "NIN") {
      toast.error("Only NIN is supported for KYC review right now.");
      return;
    }

    if (!validateId("NIN", idNumber)) {
      toast.error("NIN must be exactly 11 digits");
      return;
    }

    setSubmitting(true);
    try {
      const payload: { nin: string; cacNumber?: string; consent: boolean } = {
        nin: idNumber.trim(),
        consent: true,
      };

      if (cacNumber.trim() && /^(RC|BN)?\d{5,8}$/i.test(cacNumber.trim())) {
        payload.cacNumber = cacNumber.trim();
      }

      const data = await apiJson<KycSubmitResponse>("/api/kyc/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSubmitted(true);
        toast.success(data.message || "Submitted for review!");

        const kycData = {
          kyc: {
            idType: "NIN" as IdType,
            idNumber: idNumber.trim(),
            nin: idNumber.trim(),
            cac: payload.cacNumber,
            submitted: true,
            status: "PENDING",
          },
        };
        updateData(kycData as Parameters<typeof updateData>[0]);
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      const skipData = { kyc: { skipped: true, idType: selectedIdType, idNumber } };
      updateData(skipData as Parameters<typeof updateData>[0]);
      nextStep(skipData as Parameters<typeof updateData>[0]);
      toast.info("You can complete verification later in Settings");
    } catch (error: unknown) {
      toast.error("Failed to skip");
    }
  };

  const handleContinue = async () => {
    if (!submitted) { toast.error("Please submit your ID"); return; }
    const kycData = { kyc: { idType: selectedIdType, idNumber, submitted: true } };
    updateData(kycData as Parameters<typeof updateData>[0]);
    nextStep(kycData as Parameters<typeof updateData>[0]);
  };

  const expectedLevel = selectedIdType === "CAC" || cacNumber.trim() ? 3 : 1;

  return (
    <div className="space-y-5 relative">
      {/* Loading Overlay */}
      {submitting && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-vayva-green" />
            <p className="text-sm font-medium text-text-secondary">Submitting...</p>
          </div>
        </div>
      )}

      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-border/40">
          <ShieldCheck size={22} className="text-text-tertiary" />
        </div>
        <h2 className="text-xl font-black text-text-primary">Verify Your Identity</h2>
        <p className="text-sm text-text-secondary">Choose any ID type. Review takes ~24 hours.</p>
      </div>

      {/* Limits Preview */}
      <div className="bg-zinc-50 border border-border rounded-xl p-3">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2 text-center">Daily Limits by Level</p>
        <div className="grid grid-cols-4 gap-1.5">
          {KYC_LEVELS.map((level) => (
            <div key={level.level} className={cn("text-center p-1.5 rounded-lg border", expectedLevel === level.level ? "bg-white border-vayva-green" : "bg-white/50 border-border/50 opacity-60")}>
              <level.icon className={cn("w-4 h-4 mx-auto mb-0.5", level.color)} />
              <p className="text-[9px] font-bold text-text-tertiary uppercase">{level.name}</p>
              <p className={cn("text-xs font-black", expectedLevel === level.level ? "text-vayva-green" : "text-text-primary")}>{level.limit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ID Type Selection */}
      {!submitted && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ID_OPTIONS.map((option) => (
            <button key={option.type} onClick={() => { setSelectedIdType(option.type); setIdNumber(""); }} disabled={submitting}
              className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all", selectedIdType === option.type ? "border-vayva-green bg-vayva-green/5" : "border-border hover:border-vayva-green/30")}>
              <option.icon className={cn("w-5 h-5", selectedIdType === option.type ? "text-vayva-green" : "text-text-tertiary")} />
              <span className={cn("text-[10px] font-bold text-center leading-tight", selectedIdType === option.type ? "text-text-primary" : "text-text-tertiary")}>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ID Input */}
      <div className={cn("bg-background border-2 rounded-2xl p-5", submitted ? "border-vayva-green bg-vayva-green/5" : "border-border")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", submitted ? "bg-vayva-green text-white" : "bg-zinc-100 text-text-tertiary")}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">{selectedOption.label}</h3>
              <p className="text-xs text-text-tertiary">{submitted ? "Under review" : "Enter your ID"}</p>
            </div>
          </div>
          {submitted && <div className="flex items-center gap-1 px-2 py-1 bg-vayva-green rounded-full"><CheckCircle className="h-3 w-3 text-white" /><span className="text-[9px] font-bold text-white uppercase">Sent</span></div>}
        </div>

        {!submitted ? (
          <div className="space-y-3">
            <div>
              <Input type="text" placeholder={selectedOption.placeholder} value={idNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdNumber(e.target.value.toUpperCase())}
                className="h-11 text-center font-bold rounded-xl border-2 focus:border-vayva-green" disabled={submitting} />
              <p className="text-[10px] text-text-tertiary mt-1 text-center">{selectedOption.hint}</p>
            </div>

            {selectedIdType !== "CAC" && (
              <div className="pt-2 border-t border-border/50">
                <Input type="text" placeholder="CAC (optional, boosts limits)" value={cacNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCacNumber(e.target.value.toUpperCase())}
                  className="h-9 text-sm font-bold rounded-lg border-2 focus:border-vayva-green mb-1" disabled={submitting} />
                <p className="text-[10px] text-vayva-green">+CAC = Business tier (₦5M/day)</p>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!validateId(selectedIdType, idNumber) || submitting}
              className="w-full h-11 bg-text-primary hover:bg-zinc-800 text-white font-bold rounded-xl">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</> : <><Shield className="h-4 w-4 mr-2" />Submit for Review</>}
            </Button>
          </div>
        ) : (
          <div className="bg-white/50 rounded-xl p-3 border border-vayva-green/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-text-tertiary uppercase">{selectedOption.label}</p>
                <p className="text-base font-black tracking-widest">*******{idNumber.slice(-4)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSubmitted(false); setIdNumber(""); setCacNumber(""); }} className="text-xs font-bold text-text-tertiary">Edit</Button>
            </div>
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[10px] text-amber-800 flex items-center gap-1"><Info className="w-3 h-3" />Under review. You can use Level 1 (₦200k/day) now.</p>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700">ID verification required by CBN for payouts. Manual review ensures accuracy without needing BVN.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} disabled={isSaving} className="h-11 px-6 rounded-xl font-bold">Back</Button>
          <Button onClick={handleContinue} disabled={!submitted || isSaving} className="flex-1 h-11 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl font-bold">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" onClick={handleSkip} disabled={isSaving || submitting} className="h-9 text-xs text-text-tertiary">
          Skip — Start with ₦50k limit
        </Button>
      </div>
    </div>
  );
}
