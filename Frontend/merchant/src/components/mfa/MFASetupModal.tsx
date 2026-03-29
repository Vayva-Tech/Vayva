"use client";

import { useState } from "react";
import { Button, Input, Icon } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnabled: () => void;
}

interface SetupResponse {
  secret: string;
  uri: string;
  message: string;
}

interface VerifyResponse {
  verified: boolean;
  message: string;
  error?: string;
}

export function MFASetupModal({ isOpen, onClose, onEnabled }: MFASetupModalProps) {
  const [step, setStep] = useState<"intro" | "setup" | "verify">("intro");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<SetupResponse>("/mfa/setup", {
        method: "POST",
      });

      setSecret(data.secret);

      // Generate QR code data URL
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(data.uri, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
      setStep("setup");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<VerifyResponse>("/mfa/verify", {
        method: "POST",
        body: JSON.stringify({
          secret,
          token: verificationCode,
        }),
      });

      if (data.verified) {
        setStep("verify");
        onEnabled();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step !== "intro" && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    resetState();
    onClose();
  };

  const resetState = () => {
    setStep("intro");
    setSecret("");
    setQrDataUrl("");
    setVerificationCode("");
    setError(null);
    setLoading(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === "intro" && "Enable Two-Factor Authentication"}
              {step === "setup" && "Scan QR Code"}
              {step === "verify" && "MFA Enabled!"}
            </h2>
            <Button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === "intro" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto">
                  <Icon name="ShieldCheck" size={32} />
                </div>
                <p className="text-gray-500 text-center">
                  Add an extra layer of security to your account. You'll need to enter a code from your authenticator app each time you sign in.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 bg-gray-50 p-4 rounded-xl">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Protects against password theft
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Required for payouts and sensitive actions
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-500" />
                    Works with Google Authenticator, Authy, etc.
                  </li>
                </ul>
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                    <Icon name="AlertCircle" size={16} />
                    {error}
                  </div>
                )}
                <Button
                  onClick={handleStartSetup}
                  isLoading={loading}
                  className="w-full"
                >
                  {loading ? "Setting up..." : "Enable MFA"}
                </Button>
              </div>
            )}

            {step === "setup" && (
              <div className="space-y-4">
                <p className="text-gray-500 text-center text-sm">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                {qrDataUrl && (
                  <div className="flex justify-center">
                    <img
                      src={qrDataUrl}
                      alt="MFA QR Code"
                      className="w-48 h-48 rounded-xl border border-gray-100"
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-text-green-500 text-background-light p-2 rounded-lg text-xs font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copySecret}
                      className="shrink-0"
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Enter the 6-digit code from your authenticator app:
                  </p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setVerificationCode(value);
                    }}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                    <Icon name="AlertCircle" size={16} />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  isLoading={loading}
                  disabled={verificationCode.length !== 6}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto">
                  <Icon name="Check" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  MFA Enabled Successfully!
                </h3>
                <p className="text-gray-500">
                  Your account is now protected. You'll need to enter a code from your authenticator app each time you sign in.
                </p>
                <div className="bg-orange-50 border border-amber-200 p-4 rounded-xl text-left">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Save your backup codes in a safe place. If you lose access to your authenticator app, you'll need them to recover your account.
                  </p>
                </div>
                <Button onClick={handleClose} className="w-full">
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={showConfirm}
        title="Cancel MFA Setup?"
        description="If you cancel now, you'll need to start the setup process again. Your account will remain unprotected by two-factor authentication."
        confirmLabel="Yes, Cancel"
        cancelLabel="Continue Setup"
        onConfirm={() => {
          setShowConfirm(false);
          resetState();
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
        variant="danger"
      />
    </>
  );
}
