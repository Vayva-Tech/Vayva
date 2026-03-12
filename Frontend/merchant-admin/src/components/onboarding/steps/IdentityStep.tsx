"use client";

import { useOnboarding } from "../OnboardingContext";
import { Button, Input, Label } from "@vayva/ui";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { User, ArrowRight } from "@phosphor-icons/react/ssr";

export default function IdentityStep() {
  const { nextStep, updateData, state, isSaving } = useOnboarding();
  const { user } = useAuth();
  const fallbackName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const [name] = useState(state.identity?.fullName || fallbackName);
  const [phone, setPhone] = useState(state.identity?.phone || "");

  const handleContinue = () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) return;

    const identityData = {
      identity: {
        ...state.identity,
        fullName: name.trim(),
        phone: trimmedPhone,
      },
    };

    updateData(identityData);
    nextStep(identityData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-border/40 mb-2">
          <User size={24} className="text-text-tertiary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-primary">
          Personal Identity
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          Verify your details to secure your account and prepare for payouts.
        </p>
      </div>

      <div className="bg-background border border-border rounded-2xl p-6 space-y-4">
        <div className="space-y-3">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Full Name</Label>
            <div className="h-10 rounded-lg border border-border bg-white/40 px-3 flex items-center text-sm text-text-secondary">
              {name || "—"}
            </div>
            <p className="text-xs text-text-tertiary">
              From your signup details
            </p>
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold">
              Phone Number *
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-border">
                <span className="text-sm font-medium text-text-secondary">
                  +234
                </span>
              </div>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="801 234 5678"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(
                    String(e.target.value || "")
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  )
                }
                className="h-10 pl-20 rounded-lg border-border focus:border-vayva-green focus:ring-vayva-green"
                disabled={isSaving}
              />
            </div>
            <p className="text-xs text-text-tertiary">
              Used for order notifications and account security
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 flex gap-3">
        <Button
          className="w-full h-12 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl font-bold"
          onClick={handleContinue}
          disabled={!phone || isSaving}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
