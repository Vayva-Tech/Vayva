"use client";

import { urls } from "@vayva/shared";
import { useOnboarding } from "../OnboardingContext";

import { Button } from "@vayva/ui";
import { INDUSTRY_CONFIG } from "@/config/industry";
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
  icon: React.ElementType;
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
  const stateAny = state;

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <CheckCircle size={24} className="text-text-tertiary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Review & Launch
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          Verify your store details before we go live. You can edit any section
          if needed.
        </p>
      </div>

      {/* Launch Banner */}
      <div className="bg-gradient-to-r from-vayva-green/10 to-blue-50 border border-vayva-green/20 rounded-3xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-vayva-green/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-14 h-14 bg-vayva-green rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-text-primary mb-1">
              Your store is ready! 🎉
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Once you launch, your storefront will be instantly available on
              your chosen URL and you'll be able to start processing payments.
            </p>
          </div>
        </div>
      </div>

      {/* Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identity */}
        <ReviewSection
          title="Identity"
          icon={User}
          onEdit={() => goToStep("identity")}
        >
          <ReviewItem label="Full Name" value={stateAny.identity?.fullName} />
          <ReviewItem label="Phone Number" value={stateAny.identity?.phone} />
        </ReviewSection>

        {/* Business */}
        <ReviewSection
          title="Business"
          icon={Store}
          onEdit={() => goToStep("business")}
        >
          <ReviewItem label="Store Name" value={stateAny.business?.storeName} />
          <ReviewItem label="Legal Name" value={stateAny.business?.legalName} />
          <ReviewItem
            label="Industry"
            value={
              stateAny.industrySlug
                ? INDUSTRY_CONFIG[
                    stateAny.industrySlug as keyof typeof INDUSTRY_CONFIG
                  ]?.displayName
                : "Retail"
            }
          />
        </ReviewSection>

        {/* Address Info */}
        <ReviewSection
          title="Locations"
          icon={MapPin}
          onEdit={() => goToStep("business")}
        >
          <ReviewItem
            label="Business"
            value={
              stateAny.business?.registeredAddress
                ? `${stateAny.business.registeredAddress.addressLine1 || ""}, ${stateAny.business.registeredAddress.city || ""}`
                : "Not provided"
            }
          />
          <ReviewItem
            label="Storefront"
            value={
              stateAny.logistics?.pickupAddressObj
                ? `${stateAny.logistics.pickupAddressObj.addressLine1 || ""}, ${stateAny.logistics.pickupAddressObj.city || ""}`
                : "Same as business"
            }
          />
        </ReviewSection>

        {/* Store URL */}
        <ReviewSection
          title="Storefront"
          icon={Globe}
          onEdit={() => goToStep("business")}
        >
          <ReviewItem
            label="URL"
            value={
              stateAny.business?.slug
                ? `${stateAny.business.slug}.${urls.storefrontRoot()}`
                : "Not set"
            }
          />
        </ReviewSection>

        {/* Socials */}
        <ReviewSection
          title="Socials"
          icon={MessageSquare}
          onEdit={() => goToStep("socials")}
        >
          <ReviewItem
            label="WhatsApp"
            value={
              stateAny.socials?.whatsapp ||
              stateAny.identity?.phone ||
              "Not connected"
            }
          />
          <ReviewItem
            label="Instagram"
            value={
              stateAny.socials?.instagram
                ? `@${stateAny.socials.instagram}`
                : "Not connected"
            }
          />
        </ReviewSection>

        {/* Payment */}
        <ReviewSection
          title="Payments"
          icon={CreditCard}
          onEdit={() => goToStep("finance")}
        >
          <ReviewItem
            label="Bank"
            value={stateAny.finance?.bankName || "Not setup"}
          />
          <ReviewItem
            label="Account"
            value={
              stateAny.finance?.accountNumber
                ? `****${stateAny.finance.accountNumber.slice(-4)}`
                : "Not setup"
            }
          />
        </ReviewSection>

        {/* KYC */}
        <ReviewSection
          title="Verification"
          icon={Shield}
          onEdit={() => goToStep("kyc")}
        >
          <div className="flex items-center justify-between">
            <ReviewItem
              label="Status"
              value={stateAny.kyc?.ninVerified ? "Verified" : "Pending"}
            />
            {stateAny.kyc?.ninVerified && (
              <CheckCircle2 className="w-4 h-4 text-vayva-green" />
            )}
          </div>
          <ReviewItem
            label="NIN"
            value={
              stateAny.kyc?.nin
                ? `*******${stateAny.kyc.nin.slice(-4)}`
                : "Not provided"
            }
          />
        </ReviewSection>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 flex gap-3 border-t border-border">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSaving}
          className="h-14 px-8 rounded-2xl border-2 font-bold hover:bg-white/40"
        >
          Back
        </Button>
        <Button
          className="flex-1 h-14 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-2xl font-black text-xl shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
          onClick={completeOnboarding}
          disabled={isSaving}
          isLoading={isSaving}
        >
          <Rocket className="mr-2 h-6 w-6" />
          Launch Store
        </Button>
      </div>
    </div>
  );
}
