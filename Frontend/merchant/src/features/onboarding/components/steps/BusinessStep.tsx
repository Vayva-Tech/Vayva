"use client";

import { urls, logger } from "@vayva/shared";
import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label, Select } from "@vayva/ui";
import React, { useState, useEffect } from "react";
import { INDUSTRY_CONFIG } from "@/config/industry";
import {
  Storefront as Store,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Truck,
  Check,
  X,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { AddressInputNG } from "@/components/ui/AddressInputNG";
import { apiJson } from "@/lib/api-client-shared";
import { OnboardingState, Address } from "@/types/onboarding";
import { IndustrySlug } from "@/lib/templates/types";

interface SlugCheckResponse {
  available: boolean;
}

export default function BusinessStep() {
  const { nextStep, prevStep, updateData, state, isSaving } = useOnboarding();
  const currentState = state;
  const [storeName, setStoreName] = useState(
    currentState.business?.storeName || "",
  );
  const [legalName, setLegalName] = useState(
    currentState.business?.legalName || "",
  );
  const [industrySlug, setIndustrySlug] = useState(
    currentState.industrySlug || "retail",
  );
  const [registeredAddress, setRegisteredAddress] = useState<Address>(
    (currentState.business?.registeredAddress as Address) || {} as Address,
  );
  const [pickupAddressObj, setPickupAddressObj] = useState<Address>(
    (currentState.logistics?.pickupAddressObj as Address) || {} as Address,
  );
  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(false);
  const [slug, setSlug] = useState(currentState.business?.slug || "");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState("");

  // Auto-generate slug from store name if user hasn't manually edited it
  const [slugTouched, setSlugTouched] = useState(!!currentState.business?.slug);
  useEffect(() => {
    if (!slugTouched && storeName) {
      setSlug(
        storeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  }, [storeName, slugTouched]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      setSlugError("");
      return;
    }
    const timer = setTimeout(async () => {
      setSlugChecking(true);
      setSlugError("");
      try {
        const data = await apiJson<SlugCheckResponse>(
          `/api/onboarding/check-slug?slug=${encodeURIComponent(slug)}`,
        );
        setSlugAvailable(data.available);
        if (!data.available) {
          setSlugError("This URL is already taken. Please choose another.");
        }
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[CHECK_SLUG_ERROR]", { error: _errMsg, app: "merchant" });
        setSlugError("Failed to check availability. Please try again.");
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const formatPickupAddress = (addr: Address) => {
    if (!addr) return "";
    const parts = [addr.addressLine1, addr.city, addr.state].filter(Boolean);
    const base = parts.join(", ");
    return addr.landmark ? `${base} (${addr.landmark})` : base;
  };

  const handleContinue = () => {
    const trimmedStoreName = storeName.trim();
    if (!trimmedStoreName || !industrySlug) return;
    if (!slug || slugAvailable !== true) return;

    const pickupAddress = formatPickupAddress(pickupAddressObj);

    const businessData: Partial<OnboardingState> = {
      industrySlug: industrySlug as IndustrySlug,
      business: {
        ...state.business!,
        storeName: trimmedStoreName,
        legalName: (legalName || "").trim() || undefined,
        registeredAddress: registeredAddress || undefined,
        name: trimmedStoreName,
        slug,
        country: "NG",
        state: pickupAddressObj?.state || state.business?.state || "Lagos",
        city: pickupAddressObj?.city || state.business?.city || "Lagos",
        email: state.business?.email || "",
        businessRegistrationType: "individual",
      },
      logistics: {
        ...state.logistics,
        pickupAddressObj: pickupAddressObj || undefined,
        pickupAddress: pickupAddress || undefined,
      },
    };

    updateData(businessData);
    nextStep(businessData);
  };

  const selectedConfig =
    INDUSTRY_CONFIG[industrySlug as keyof typeof INDUSTRY_CONFIG];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <Store size={24} className="text-gray-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">
          Business Details
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Tell us about your brand. This helps us customize your dashboard and
          storefront.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6  space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="storeName"
              className="text-sm font-bold text-gray-500 ml-1"
            >
              Store Name *
            </Label>
            <Input
              id="storeName"
              placeholder="e.g. Adeola's Fashion"
              value={storeName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStoreName(e.target.value)
              }
              className="h-12 rounded-xl border-2 border-gray-100 focus:border-vayva-green focus:ring-vayva-green/20 font-medium"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="legalName"
              className="text-sm font-bold text-gray-500 ml-1"
            >
              Business Name (Legal)
            </Label>
            <Input
              id="legalName"
              placeholder="e.g. Adeola Ventures Ltd"
              value={legalName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLegalName(e.target.value)
              }
              className="h-12 rounded-xl border-2 border-gray-100 focus:border-vayva-green focus:ring-vayva-green/20 font-medium"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="industry"
            className="text-sm font-bold text-gray-500 ml-1"
          >
            Industry Vertical *
          </Label>
          <Select
            id="industry"
            value={industrySlug}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setIndustrySlug(e.target.value as IndustrySlug)
            }
            className="h-12 rounded-xl border-2 border-gray-100 focus:border-vayva-green font-semibold bg-white/30"
            disabled={isSaving}
          >
            {Object.entries(INDUSTRY_CONFIG).map(([slug, config]: any[]) => (
              <option key={slug} value={slug}>
                {config.displayName}
              </option>
            ))}
          </Select>
          <p className="text-[11px] text-gray-400 ml-1">
            Selecting the right industry unlocks specialized tools for your
            business.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="slug"
            className="text-sm font-bold text-gray-500 ml-1"
          >
            Store Link *
          </Label>
          <div className="flex items-center relative min-w-0">
            <span className="bg-white/40 border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-500 shrink-0 order-2 ml-2 h-12 flex items-center">
              .{urls.storefrontRoot()}
            </span>
            <Input
              id="slug"
              autoComplete="off"
              inputMode="url"
              spellCheck={false}
              aria-invalid={!!slugError}
              aria-describedby="slug-help slug-error"
              className="rounded-xl pr-10 flex-1 min-w-0 h-12 border-2 border-gray-100 focus:border-vayva-green focus:ring-vayva-green font-bold text-lg"
              placeholder="my-store"
              value={slug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSlugTouched(true);
                setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                );
              }}
              disabled={slugChecking || isSaving}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 order-1 mr-[100px]">
              {slugChecking && (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              )}
              {!slugChecking && slugAvailable === true && (
                <Check className="h-5 w-5 text-green-600" />
              )}
              {!slugChecking && slugAvailable === false && (
                <X className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          {slugError && (
            <p className="text-xs font-bold text-red-600 ml-1 mt-1">
              {slugError}
            </p>
          )}
          {slugAvailable === true && (
            <p className="text-xs font-bold text-green-600 ml-1 mt-1">
              ✓ URL is available!
            </p>
          )}
          {!slugError && !slugAvailable && slug.length >= 3 && (
            <p className="text-xs text-gray-400 ml-1 mt-1">
              Checking availability...
            </p>
          )}
          {!slugError && !slugAvailable && slug.length < 3 && (
            <p className="text-xs text-gray-400 ml-1 mt-1">
              You can connect a custom domain later.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <MapPin size={14} className="text-gray-400" />
              <Label className="text-sm font-bold text-gray-500">
                Business Address
              </Label>
            </div>
            <AddressInputNG
              value={registeredAddress}
              onChange={setRegisteredAddress}
            />
            <p className="text-[10px] text-gray-400 ml-1">
              Required for legal and tax compliance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-gray-400" />
                <Label className="text-sm font-bold text-gray-500">
                  Store/Pickup Location
                </Label>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <Input type="checkbox"
                  checked={sameAsBusinessAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSameAsBusinessAddress(e.target.checked);
                    if (e.target.checked) {
                      setPickupAddressObj(registeredAddress);
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-gray-100 text-vayva-green focus:ring-vayva-green"
                  disabled={isSaving}
                />
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-500 transition-colors">
                  Same as business
                </span>
              </label>
            </div>
            <AddressInputNG
              value={pickupAddressObj}
              onChange={(addr: Address) => {
                setPickupAddressObj(addr);
                if (sameAsBusinessAddress) {
                  setSameAsBusinessAddress(false);
                }
              }}
            />
            <p className="text-[10px] text-gray-400 ml-1">
              Where customers will pick up orders.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isSaving}
          className="h-14 px-8 rounded-2xl border-2 font-bold hover:bg-white/40 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          className="flex-1 h-14 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-green/20 transition-all active:scale-[0.98]"
          onClick={handleContinue}
          disabled={
            !storeName ||
            !slug ||
            slugAvailable !== true ||
            slugChecking ||
            isSaving
          }
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
