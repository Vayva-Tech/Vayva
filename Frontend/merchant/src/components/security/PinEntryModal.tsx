"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Icon, Input, cn } from "@vayva/ui";
import { logger } from "@vayva/shared";

interface PinEntryModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onSuccess: () => void;
  onClose?: () => void;
  isSetupMode?: boolean; // If true, asks to Confirm (2-step)
}

import { apiJson } from "@/lib/api-client-shared";

interface VerificationResponse {
  success: boolean;
  error?: string;
}

export const PinEntryModal = ({
  isOpen,
  title = "Enter Security PIN",
  description = "Please verify your identity to continue.",
  onSuccess,
  onClose,
  isSetupMode = false,
}: PinEntryModalProps) => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"enter" | "confirm">("enter"); // for setup mode

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Slight delay to allow animation
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      setStep("enter");
      setError(null);
    }
  }, [isOpen]);

  const handleInput = (index: number, value: string, isConfirm = false) => {
    // Only numbers
    if (!/^\d*$/.test(value)) return;

    const currentPin = isConfirm ? confirmPin : pin;
    const setCurrent = isConfirm ? setConfirmPin : setPin;

    const newPin = [...currentPin];
    newPin[index] = value.slice(-1); // Take last char
    setCurrent(newPin);

    // Auto advance
    if (value && index < 3) {
      inputsRef.current[isConfirm ? index + 4 : index + 1]?.focus();
    }

    // Auto submit if full
    if (newPin.every((d) => d !== "") && index === 3) {
      void handleSubmit(newPin.join(""), isConfirm);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    isConfirm = false,
  ) => {
    const currentPin = isConfirm ? confirmPin : pin;
    const setCurrent = isConfirm ? setConfirmPin : setPin;

    if (e.key === "Backspace" && !currentPin[index] && index > 0) {
      inputsRef.current[isConfirm ? index - 1 + 4 : index - 1]?.focus();
    }
  };

  const handleSubmit = async (code: string, isConfirm: boolean) => {
    setError(null);

    if (isSetupMode) {
      if (step === "enter" && !isConfirm) {
        // Determine if we move to confirm step
        setStep("confirm");
        setTimeout(() => inputsRef.current[4]?.focus(), 100);
        return;
      }

      if (isConfirm) {
        if (code !== pin.join("")) {
          setError("PINs do not match. Try again.");
          setConfirmPin(["", "", "", ""]);
          setTimeout(() => inputsRef.current[4]?.focus(), 100);
          return;
        }
        // Determine action: Setup
        await performAction("setup", code);
      }
    } else {
      // Verify
      await performAction("verify", code);
    }
  };

  const performAction = async (action: "verify" | "setup", code: string) => {
    setIsLoading(true);
    try {
      const endpoint =
        action === "verify" ? "/auth/pin/verify" : "/auth/pin/setup";

      const res = await apiJson<VerificationResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({ pin: code }),
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Invalid PIN");
        if (action === "verify") {
          // Shake effect or reset
          setPin(["", "", "", ""]);
          setTimeout(() => inputsRef.current[0]?.focus(), 100);
        }
      }
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[PIN_ACTION_ERROR]", { error: _errMsg, app: "merchant" });
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 ">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative overflow-hidden"
        >
          {/* Lock Icon decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-50 pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm border border-green-100">
              <Icon name="LockKeyhole" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSetupMode
                ? step === "enter"
                  ? "Create a PIN"
                  : "Confirm PIN"
                : title}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {isSetupMode
                ? step === "enter"
                  ? "Set a 4-digit PIN for extra security."
                  : "Re-enter to confirm."
                : description}
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {/* PIN Inputs */}
            <div className="flex justify-center gap-3">
              {(step === "enter" ? pin : confirmPin).map((digit, i) => (
                <Input key={i}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  ref={(el) => {
                    inputsRef.current[step === "enter" ? i : i + 4] = el;
                  }}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInput(i, e.target.value, step === "confirm")
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(i, e, step === "confirm")}
                  className={cn(
                    "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all",
                    error
                      ? "border-red-200 bg-red-50 text-red-600 focus:border-red-500"
                      : "border-gray-100 bg-white/40 focus:border-black focus:bg-white focus:shadow-lg",
                  )}
                  disabled={isLoading}
                />
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              {/* Loading State or Actions */}
              {isLoading && (
                <div className="text-center text-xs text-gray-400 animate-pulse">
                  Verifying secure PIN...
                </div>
              )}

              {!isSetupMode && (
                <Button className="text-xs text-gray-400 hover:text-gray-900 transition-colors">
                  Forgot PIN?
                </Button>
              )}

              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  size="sm"
                  className="w-full text-gray-400 hover:text-gray-900"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
