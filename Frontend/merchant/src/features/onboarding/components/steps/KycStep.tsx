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
  const [bvnNumber, setBvnNumber] = useState(currentState.kyc?.bvn || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(currentState.kyc?.submitted || false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [bvnOnlyMode, setBvnOnlyMode] = useState(false);

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
    // BVN-only mode (grace period)
    if (bvnOnlyMode && bvnNumber) {
      if (!/^\d{11}$/.test(bvnNumber.trim())) {
        toast.error("BVN must be exactly 11 digits");
        return;
      }
      
      setSubmitting(true);
      try {
        // Submit BVN for Paystack verification
        const payload = {
          bvn: bvnNumber.trim(),
          consent: true,
          gracePeriod: true, // Flag for 7-day NIN submission window
        };
        
        const data = await apiJson<KycSubmitResponse>("/kyc/submit-bvn", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        
        if (data.success) {
          setSubmitted(true);
          toast.success(data.message || "BVN verified! You have 7 days to submit NIN.");
          
          const kycData = {
            kyc: {
              idType: "NIN" as IdType, // Still expect NIN later
              bvn: bvnNumber.trim(),
              submitted: true,
              status: "PENDING_NIN", // Special status for grace period
              ninDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            },
          };
          updateData(kycData as Parameters<typeof updateData>[0]);
        } else {
          toast.error(data.error || "BVN verification failed");
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "BVN verification failed");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    
    // NIN submission (standard flow)
    if (selectedIdType !== "NIN") {
      toast.error("Please use NIN or BVN for KYC verification.");
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

      const data = await apiJson<KycSubmitResponse>("/kyc/submit", {
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
            <p className="text-sm font-medium text-gray-500">Submitting...</p>
          </div>
        </div>
      )}

      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-border/40">
          <ShieldCheck size={22} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Verify Your Identity</h2>
        <p className="text-sm text-gray-500">Use BVN for instant verification (7 days to submit NIN) or NIN directly.</p>
      </div>

      {/* BVN Quick Verify Option */}
      {!submitted && !bvnOnlyMode && (
        <div className="bg-gradient-to-br from-vayva-green/10 to-emerald-50 border-2 border-vayva-green/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-vayva-green text-white flex items-center justify-center flex-shrink-0">
              <Wallet size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">⚡ Quick: Verify with BVN</h3>
              <p className="text-xs text-gray-600">Instant verification • 7 days to submit NIN</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Enter your 11-digit BVN"
              value={bvnNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBvnNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              maxLength={11}
              className="h-12 rounded-xl border-2 border-vayva-green/30 focus:border-vayva-green text-center font-bold tracking-wider"
              disabled={submitting}
            />
            <p className="text-[10px] text-gray-500 text-center">
              Paystack verifies your BVN instantly. You'll have 7 days to submit your NIN in settings.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!bvnNumber || bvnNumber.length !== 11 || submitting}
              className="flex-1 h-11 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...
                </>
              ) : (
                <>Verify BVN <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
          
          <div className="pt-2 border-t border-vayva-green/20">
            <button
              type="button"
              onClick={() => setBvnOnlyMode(false)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Or use traditional NIN verification instead
            </button>
          </div>
        </div>
      )}

      {/* Limits Preview */}
      <div className="bg-zinc-50 border border-gray-100 rounded-xl p-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Daily Limits by Level</p>
        <div className="grid grid-cols-4 gap-1.5">
          {KYC_LEVELS.map((level) => (
            <div key={level.level} className={cn("text-center p-1.5 rounded-lg border", expectedLevel === level.level ? "bg-white border-vayva-green" : "bg-white/50 border-gray-100 opacity-60")}>
              <level.icon className={cn("w-4 h-4 mx-auto mb-0.5", level.color)} />
              <p className="text-[9px] font-bold text-gray-400 uppercase">{level.name}</p>
              <p className={cn("text-xs font-black", expectedLevel === level.level ? "text-vayva-green" : "text-gray-900")}>{level.limit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ID Type Selection */}
      {!submitted && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ID_OPTIONS.map((option) => (
            <Button key={option.type} onClick={() => { setSelectedIdType(option.type); setIdNumber(""); }} disabled={submitting}
              className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all", selectedIdType === option.type ? "border-vayva-green bg-vayva-green/5" : "border-gray-100 hover:border-vayva-green/30")}>
              <option.icon className={cn("w-5 h-5", selectedIdType === option.type ? "text-vayva-green" : "text-gray-400")} />
              <span className={cn("text-[10px] font-bold text-center leading-tight", selectedIdType === option.type ? "text-gray-900" : "text-gray-400")}>{option.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* ID Input */}
      <div className={cn("bg-white border-2 rounded-2xl p-5", submitted ? "border-vayva-green bg-vayva-green/5" : "border-gray-100")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", submitted ? "bg-vayva-green text-white" : "bg-zinc-100 text-gray-400")}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{selectedOption.label}</h3>
              <p className="text-xs text-gray-400">{submitted ? "Under review" : "Enter your ID"}</p>
            </div>
          </div>
          {submitted && <div className="flex items-center gap-1 px-2 py-1 bg-vayva-green rounded-full"><CheckCircle className="h-3 w-3 text-white" /><span className="text-[9px] font-bold text-white uppercase">Sent</span></div>}
        </div>

        {!submitted ? (
          <div className="space-y-3">
            <div>
              <Input type="text" placeholder={selectedOption.placeholder} value={idNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdNumber(e.target.value.toUpperCase())}
                className="h-11 text-center font-bold rounded-xl border-2 focus:border-vayva-green" disabled={submitting} />
              <p className="text-[10px] text-gray-400 mt-1 text-center">{selectedOption.hint}</p>
            </div>

            {selectedIdType !== "CAC" && (
              <div className="pt-2 border-t border-gray-100">
                <Input type="text" placeholder="CAC (optional, boosts limits)" value={cacNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCacNumber(e.target.value.toUpperCase())}
                  className="h-9 text-sm font-bold rounded-lg border-2 focus:border-vayva-green mb-1" disabled={submitting} />
                <p className="text-[10px] text-vayva-green">+CAC = Business tier (₦5M/day)</p>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!validateId(selectedIdType, idNumber) || submitting}
              className="w-full h-11 bg-text-green-500 hover:bg-zinc-800 text-white font-bold rounded-xl">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</> : <><Shield className="h-4 w-4 mr-2" />Submit for Review</>}
            </Button>
          </div>
        ) : (
          <div className="bg-white/50 rounded-xl p-3 border border-vayva-green/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{selectedOption.label}</p>
                <p className="text-base font-black tracking-widest">*******{idNumber.slice(-4)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSubmitted(false); setIdNumber(""); setCacNumber(""); }} className="text-xs font-bold text-gray-400">Edit</Button>
            </div>
            <div className="mt-2 bg-orange-50 border border-amber-200 rounded-lg p-2">
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
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} disabled={isSaving} className="h-11 px-6 rounded-xl font-bold">Back</Button>
          <Button onClick={handleContinue} disabled={!submitted || isSaving} className="flex-1 h-11 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl font-bold">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" onClick={handleSkip} disabled={isSaving || submitting} className="h-9 text-xs text-gray-400">
          Skip — Start with ₦50k limit
        </Button>
      </div>
    </div>
  );
}
