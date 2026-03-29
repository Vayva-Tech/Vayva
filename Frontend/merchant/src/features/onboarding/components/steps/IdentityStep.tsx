"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label, Select } from "@vayva/ui";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { User, ArrowRight, WarningCircle } from "@phosphor-icons/react/ssr";

// Common country codes for Nigerian and international users
const COUNTRY_CODES = [
  { code: "+234", label: "Nigeria (🇳🇬)", placeholder: "801 234 5678", length: 10 },
  { code: "+1", label: "USA/Canada (🇺)", placeholder: "555 123 4567", length: 10 },
  { code: "+44", label: "UK (🇬🇧)", placeholder: "7911 123456", length: 10 },
  { code: "+91", label: "India (🇮🇳)", placeholder: "98765 43210", length: 10 },
  { code: "+254", label: "Kenya (🇰)", placeholder: "712 345678", length: 9 },
  { code: "+27", label: "South Africa (🇿🇦)", placeholder: "82 123 4567", length: 9 },
  { code: "+233", label: "Ghana (🇬)", placeholder: "24 123 4567", length: 9 },
];

export default function IdentityStep() {
  const { nextStep, updateData, state, isSaving } = useOnboarding();
  const { user } = useAuth();
  const fallbackName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const [name, setName] = useState(state.identity?.fullName || fallbackName);
  const [countryCode, setCountryCode] = useState("+234"); // Default to Nigeria
  const [phone, setPhone] = useState(state.identity?.phone || "");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  // Validate phone number based on country
  const validatePhone = (value: string, code: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Phone number is required";
    
    const expectedLength = COUNTRY_CODES.find(c => c.code === code)?.length || 10;
    
    // Check if it's all digits
    if (!/^\d+$/.test(trimmed)) {
      return "Phone number must contain only digits";
    }
    
    // Check length
    if (trimmed.length !== expectedLength) {
      return `Must be ${expectedLength} digits for this country`;
    }
    
    // Nigerian numbers must start with 07, 08, or 09
    if (code === "+234" && !/^(07|08|09)/.test(trimmed)) {
      return "Nigerian numbers start with 07, 08, or 09";
    }
    
    return undefined;
  };

  const handleContinue = () => {
    const error = validatePhone(phone, countryCode);
    if (error) {
      setPhoneError(error);
      return;
    }
    setPhoneError(null);

    const identityData = {
      identity: {
        ...state.identity,
        fullName: name.trim(),
        phone: `${countryCode}${phone}`,
      },
    };

    updateData(identityData);
    nextStep(identityData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <User size={24} className="text-gray-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">
          Personal Identity
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Verify your details to secure your account and prepare for payouts.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <div className="space-y-3">
          {/* Name Field - Now Editable */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="h-10 rounded-lg border-gray-100"
              disabled={isSaving}
            />
            <p className="text-xs text-gray-400">
              You can correct this if there's a typo
            </p>
          </div>

          {/* Country Code Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="country-code" className="text-sm font-semibold">
              Country
            </Label>
            <Select
              id="country-code"
              value={countryCode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setCountryCode(e.target.value);
                setPhone(""); // Reset phone when country changes
                setPhoneError(null);
              }}
              className="h-10 rounded-lg border-gray-100"
              disabled={isSaving}
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-400">
              Select your country for the correct phone format
            </p>
          </div>

          {/* Phone Field with Validation */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold">
              Phone Number *
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-100 z-10 bg-white">
                <span className="text-sm font-medium text-gray-500">
                  {countryCode}
                </span>
              </div>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder={selectedCountry.placeholder}
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const cleaned = String(e.target.value || "")
                    .replace(/\D/g, "")
                    .slice(0, selectedCountry.length);
                  setPhone(cleaned);
                  if (phoneError) setPhoneError(null);
                }}
                onBlur={() => {
                  const err = validatePhone(phone, countryCode);
                  if (err) setPhoneError(err);
                }}
                className={`h-10 pl-20 rounded-lg border-gray-100 focus:border-vayva-green focus:ring-vayva-green ${
                  phoneError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""
                }`}
                disabled={isSaving}
                aria-invalid={!!phoneError}
                aria-describedby={phoneError ? "phone-error" : undefined}
              />
            </div>
            {phoneError && (
              <div 
                id="phone-error" 
                className="flex items-center gap-2 text-xs text-red-600 mt-1"
                role="alert"
              >
                <WarningCircle className="w-4 h-4" />
                {phoneError}
              </div>
            )}
            <p className="text-xs text-gray-400">
              Used for order notifications via WhatsApp & SMS
            </p>
            {!phoneError && phone.length === selectedCountry.length && (
              <p className="flex items-center gap-2 text-xs text-green-600 mt-1">
                <User className="w-4 h-4" />
                Valid {selectedCountry.label.split(' ')[0]} number format
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 flex gap-3">
        <Button
          className="w-full h-12 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl font-bold"
          onClick={handleContinue}
          disabled={!phone || isSaving || !!phoneError}
        >
          {isSaving ? (
            <>
              <User className="w-5 h-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
