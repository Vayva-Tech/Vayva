"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import {
  Lock,
  LockOpen as Unlock,
  ArrowRight,
} from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { toast } from "sonner"; // Assuming sonner is available based on package.json
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface WalletGuardProps {
  children: React.ReactNode;
}

import { apiJson } from "@/lib/api-client-shared";

interface WalletPinVerifyResponse {
  success: boolean;
  status?: string;
  error?: string;
}

interface WalletPinResetResponse {
  message: string;
}

export default function WalletGuard({ children }: WalletGuardProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [noPinSet, setNoPinSet] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    const unlocked = sessionStorage.getItem("wallet_unlocked");
    if (unlocked === "true") {
      setIsLocked(false);
    }
  }, []);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pin.length < 4) return;
    setLoading(true);

    try {
      const data = await apiJson<WalletPinVerifyResponse>(
        "/api/wallet/pin/verify",
        {
          method: "POST",
          body: JSON.stringify({ pin }),
        },
      );

      if (data?.success) {
        if (data.status === "no_pin_set") {
          setNoPinSet(true);
          setIsLocked(false);
          toast.warning(
            "Your wallet is unsecured. Please set a PIN in Account Settings.",
          );
        } else {
          sessionStorage.setItem("wallet_unlocked", "true");
          setIsLocked(false);
          toast.success("Wallet Unlocked");
        }
      } else {
        toast.error(data?.error || "Incorrect PIN");
        setPin("");
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[WALLET_UNLOCK_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleResetRequest = async () => {
    setResetLoading(true);
    try {
      toast.info("Sending reset link...");
      const d = await apiJson<WalletPinResetResponse>(
        "/api/wallet/pin/reset-request",
        { method: "POST" },
      );
      toast.success(d?.message || "Reset link sent");
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[PIN_RESET_REQUEST_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          void handleResetRequest();
        }}
        title="Reset wallet PIN?"
        message="Send a PIN reset link to your email?"
        confirmText="Send link"
        cancelText="Cancel"
        variant="info"
        loading={resetLoading}
      />
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-white/30 rounded-2xl border border-border/40">
        <div className="bg-background p-8 rounded-2xl shadow-sm border border-border max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Wallet Locked
            </h2>
            <p className="text-sm text-text-tertiary mt-1">
              Enter your 4-6 digit PIN to access funds.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="flex justify-center">
              <Input
                type="password"
                className="text-center text-2xl tracking-[1em] h-14 font-mono w-full"
                value={pin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder="••••••"
                autoFocus
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={pin.length < 4 || loading}
              className="w-full h-12 text-base font-medium"
            >
              {loading ? "Verifying..." : "Unlock Wallet"}
              {!loading && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => setConfirmReset(true)}
              className="text-xs text-text-tertiary font-normal hover:text-text-secondary"
            >
              Forgot PIN? Reset via Email
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
