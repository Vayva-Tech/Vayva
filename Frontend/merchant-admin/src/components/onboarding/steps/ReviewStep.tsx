"use client";

import { urls } from "@vayva/shared";
import { useOnboarding } from "../OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@vayva/ui";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { OnboardingState } from "@/types/onboarding";
import { apiJson } from "@/lib/api-client-shared";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Storefront as Store,
  Globe,
  ChatCircle as MessageSquare,
  CreditCard,
  Shield,
  CheckCircle as CheckCircle2,
  Rocket,
  PencilSimple as Edit2,
  MapPin,
  CheckCircle,
} from "@phosphor-icons/react/ssr";

interface ReviewSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children: React.ReactNode;
  onEdit?: () => void;
}

function ReviewSection({
  title,
  icon: IconComponent,
  children,
  onEdit,
}: ReviewSectionProps) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-vayva-green/10 rounded-lg flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-vayva-green" />
          </div>
          <h3 className="font-bold text-base text-text-primary">{title}</h3>
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 rounded-lg"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-text-tertiary" />
          </Button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 text-sm">
      <span className="text-text-tertiary font-medium">{label}</span>
      <span className="text-text-primary font-semibold text-right flex-1 min-w-0 break-words">
        {value}
      </span>
    </div>
  );
}

export default function ReviewStep() {
  const { completeOnboarding, prevStep, goToStep, state, isSaving } =
    useOnboarding();
  const { merchant } = useAuth();

  const typedState = state as Partial<OnboardingState>;

  const [readiness, setReadiness] = useState<
    | {
        level: string;
        issues: Array<{ code: string; title: string; description?: string }>;
      }
    | null
  >(null);
  const [readinessLoading, setReadinessLoading] = useState(true);

  const readinessTitle = useMemo(() => {
    if (!readiness) return "Readiness summary";
    if (readiness.level === "ready") return "You’re ready to go live";
    if (readiness.level === "almost_ready") return "Almost ready";
    if (readiness.level === "blocked") return "Not ready yet";
    return "Readiness summary";
  }, [readiness]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setReadinessLoading(true);
        const res = await apiJson<{ readiness?: any; error?: string }>(
          "/api/merchant/readiness",
        );
        if (!mounted) return;
        setReadiness((res.readiness as any) ?? null);
      } catch {
        if (!mounted) return;
        setReadiness(null);
      } finally {
        if (mounted) setReadinessLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <CheckCircle size={24} className="text-text-tertiary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Review & Finish
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          Confirm your details, then continue to your dashboard. You can go live whenever you’re ready.
        </p>
      </div>

      <div className="bg-gradient-to-r from-vayva-green/10 to-blue-50 border border-vayva-green/20 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-vayva-green/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-14 h-14 bg-vayva-green rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-text-primary mb-1">
              {readinessTitle}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Finish onboarding to unlock your dashboard. You can go live when
              all requirements are complete.
            </p>

            {readinessLoading ? (
              <p className="text-xs text-text-tertiary mt-3">Checking readiness…</p>
            ) : readiness?.issues?.length ? (
              <div className="mt-3 space-y-2">
                {readiness.issues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.code}
                    className="bg-white/60 border border-border/60 rounded-xl p-3"
                  >
                    <p className="text-sm font-bold text-text-primary">
                      {issue.title}
                    </p>
                    {issue.description ? (
                      <p className="text-xs text-text-tertiary mt-1">
                        {issue.description}
                      </p>
                    ) : null}
                  </div>
                ))}
                {readiness.issues.length > 5 ? (
                  <p className="text-xs text-text-tertiary">
                    +{readiness.issues.length - 5} more
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewSection
          title="Identity"
          icon={User}
          onEdit={() => goToStep("identity")}
        >
          <ReviewItem label="Full Name" value={typedState.identity?.fullName} />
          <ReviewItem label="Phone Number" value={typedState.identity?.phone} />
        </ReviewSection>

        <ReviewSection
          title="Business"
          icon={Store}
          onEdit={() => goToStep("business")}
        >
          <ReviewItem label="Store Name" value={typedState.business?.storeName} />
          <ReviewItem label="Legal Name" value={typedState.business?.legalName} />
          <ReviewItem
            label="Industry"
            value={
              typedState.industrySlug
                ? INDUSTRY_CONFIG[
                    typedState.industrySlug as keyof typeof INDUSTRY_CONFIG
                  ]?.displayName
                : "Retail"
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Locations"
          icon={MapPin}
          onEdit={() => goToStep("business")}
        >
          <ReviewItem
            label="Business"
            value={
              typedState.business?.registeredAddress
                ? `${typedState?.business?.registeredAddress.addressLine1 || ""}, ${typedState?.business?.registeredAddress.city || ""}`
                : "Not provided"
            }
          />
          <ReviewItem
            label="Storefront"
            value={
              typedState.logistics?.pickupAddressObj
                ? `${typedState?.logistics?.pickupAddressObj.addressLine1 || ""}, ${typedState?.logistics?.pickupAddressObj.city || ""}`
                : "Same as business"
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Storefront"
          icon={Globe}
          onEdit={() => goToStep("business")}
        >
          <ReviewItem
            label="URL"
            value={
              typedState.business?.slug
                ? `${typedState?.business?.slug}.${urls.storefrontRoot()}`
                : "Not set"
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Socials"
          icon={MessageSquare}
          onEdit={() => goToStep("socials")}
        >
          <ReviewItem
            label="WhatsApp"
            value={
              (typedState as any).socials?.whatsapp ||
              typedState.identity?.phone ||
              "Not connected"
            }
          />
          <ReviewItem
            label="Instagram"
            value={
              (typedState as any).socials?.instagram
                ? `@${(typedState as any)?.socials?.instagram}`
                : "Not connected"
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Payments"
          icon={CreditCard}
          onEdit={() => goToStep("finance")}
        >
          <ReviewItem
            label="Bank"
            value={typedState.finance?.bankName || "Not setup"}
          />
          <ReviewItem
            label="Account"
            value={
              typedState.finance?.accountNumber
                ? `****${typedState?.finance?.accountNumber.slice(-4)}`
                : "Not setup"
            }
          />
        </ReviewSection>

        <ReviewSection
          title="Verification"
          icon={Shield}
          onEdit={() => goToStep("kyc")}
        >
          <div className="flex items-center justify-between">
            <ReviewItem
              label="Status"
              value={(typedState as any).kyc?.ninVerified ? "Verified" : "Pending"}
            />
            {(typedState as any).kyc?.ninVerified && (
              <CheckCircle2 className="w-4 h-4 text-vayva-green" />
            )}
          </div>
          <ReviewItem
            label="NIN"
            value={
              typedState.kyc?.nin
                ? `*******${typedState?.kyc?.nin.slice(-4)}`
                : "Not provided"
            }
          />
        </ReviewSection>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={() => completeOnboarding()}
          disabled={isSaving}
          className="w-full h-14 bg-text-primary hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
        >
          Finish onboarding
        </Button>

        <Button
          variant="outline"
          onClick={() => prevStep()}
          className="w-full h-12 rounded-2xl font-bold"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
