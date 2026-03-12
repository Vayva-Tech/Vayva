/**
 * Simplified Business Step Form
 * Streamlined onboarding with essential fields only
 */

import { useState, useEffect } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label } from "@vayva/ui";
import { EnhancedIndustrySelector } from "./EnhancedIndustrySelector";
import { Storefront as Store, ArrowRight, Info } from "@phosphor-icons/react/ssr";
import { IndustrySlug } from "@/lib/templates/types";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

interface SlugCheckResponse {
  available: boolean;
}

export default function SimplifiedBusinessStep() {
  const { nextStep, updateData, state, isSaving } = useOnboarding();
  
  // Essential fields only
  const [storeName, setStoreName] = useState(state.business?.storeName || "");
  const [industrySlug, setIndustrySlug] = useState<IndustrySlug>(
    (state.industrySlug as IndustrySlug) || "retail"
  );
  const [slug, setSlug] = useState(state.business?.slug || "");
  
  // Slug validation
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!state.business?.slug);

  // Auto-generate slug from store name
  useEffect(() => {
    if (!slugTouched && storeName) {
      const generatedSlug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
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
          `/api/onboarding/check-slug?slug=${encodeURIComponent(slug)}`
        );
        setSlugAvailable(data.available);
        if (!data.available) {
          setSlugError("This URL is already taken. Please choose another.");
        }
      } catch (err) {
        setSlugError("Failed to check availability. Please try again.");
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [slug]);

  const handleContinue = () => {
    const trimmedStoreName = storeName.trim();
    if (!trimmedStoreName) {
      toast.error("Please enter your store name");
      return;
    }
    
    if (!slug || slugAvailable !== true) {
      toast.error("Please enter a valid store URL");
      return;
    }

    const businessData = {
      industrySlug,
      business: {
        ...state.business,
        storeName: trimmedStoreName,
        name: trimmedStoreName,
        slug,
        country: "NG",
        // Default values for optional fields
        legalName: undefined,
        registeredAddress: undefined,
        state: "Lagos",
        city: "Lagos",
        email: state.business?.email || "",
        businessRegistrationType: "individual",
      },
      logistics: {
        ...state.logistics,
        pickupAddressObj: undefined,
        pickupAddress: undefined,
      },
    };

    updateData(businessData);
    nextStep(businessData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vayva-green/10 mb-2">
          <Store size={24} className="text-vayva-green" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-primary">
          Tell Us About Your Business
        </h2>
        <p className="text-text-secondary max-w-md mx-auto">
          Just 3 quick details to get you started
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-5">
        {/* Store Name */}
        <div className="space-y-2">
          <Label htmlFor="storeName" className="text-sm font-bold text-text-primary">
            Store Name *
          </Label>
          <Input
            id="storeName"
            placeholder="e.g. Adeola's Fashion Boutique"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="h-12 rounded-xl border-2 border-border focus:border-vayva-green focus:ring-vayva-green/20 font-medium"
            disabled={isSaving}
          />
          <p className="text-xs text-text-tertiary">
            This is what customers will see
          </p>
        </div>

        {/* Industry Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-text-primary">
            Industry *
          </Label>
          <EnhancedIndustrySelector
            value={industrySlug}
            onChange={setIndustrySlug}
            businessName={storeName}
            disabled={isSaving}
          />
          <p className="text-xs text-text-tertiary">
            Helps us customize your dashboard experience
          </p>
        </div>

        {/* Store URL */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-text-primary">
            Store URL *
          </Label>
          <div className="flex items-center gap-2">
            <div className="bg-gray-50 border-2 border-border rounded-xl px-4 py-3 text-sm font-bold text-text-secondary whitespace-nowrap">
              vayva.ng/
            </div>
            <div className="flex-1 relative">
              <Input
                type="text"
                inputMode="url"
                spellCheck={false}
                placeholder="your-store-name"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  );
                }}
                className="h-12 rounded-xl border-2 border-border focus:border-vayva-green focus:ring-vayva-green/20 font-bold"
                disabled={isSaving || slugChecking}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugChecking && (
                  <div className="w-5 h-5 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />
                )}
                {!slugChecking && slugAvailable === true && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!slugChecking && slugAvailable === false && (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {slugError && (
            <p className="text-xs font-bold text-red-600">
              {slugError}
            </p>
          )}
          {slugAvailable === true && (
            <p className="text-xs font-bold text-green-600">
              ✓ URL is available!
            </p>
          )}
          <p className="text-xs text-text-tertiary">
            Your store will be at vayva.ng/{slug || "your-store"}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-blue-900 text-sm mb-1">
              You can add more details later
            </h4>
            <p className="text-xs text-blue-700">
              Business address, pickup location, and legal name can be added after setup. 
              Focus on getting your store live first!
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <Button
          className="w-full h-14 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
          onClick={handleContinue}
          disabled={
            !storeName.trim() ||
            !slug ||
            slugAvailable !== true ||
            slugChecking ||
            isSaving
          }
        >
          Continue to Dashboard Setup
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}