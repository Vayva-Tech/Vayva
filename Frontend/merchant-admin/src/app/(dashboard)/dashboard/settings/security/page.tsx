"use client";

import React, { useState } from "react";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  DeviceMobile as Smartphone,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { apiJson } from "@/lib/api-client-shared";
import { MFASetupModal } from "@/components/mfa/MFASetupModal";

export default function SecurityPage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword?.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await apiJson<{ success: boolean }>(
        "/api/account/security/change-password",
        {
          method: "POST",
          body: JSON.stringify(passwordForm),
        },
      );

      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CHANGE_PASSWORD_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleMFAEnabled = () => {
    setMfaEnabled(true);
    toast.success("Two-factor authentication enabled");
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <Breadcrumbs />
      <BackButton
        href="/dashboard/settings/overview"
        label="Back to Settings"
        className="mb-4"
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Security
        </h1>
        <p className="text-text-tertiary">
          Manage your password, two-factor authentication, and active sessions.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Password Change */}
        <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-text-primary mb-1">
                Password
              </h3>
              <p className="text-text-tertiary text-sm mb-4">
                Update your password to keep your account secure.
              </p>
              <Button
                variant="link"
                onClick={() => setShowPasswordModal(true)}
                className="text-sm font-medium text-primary hover:text-primary/80 hover:underline px-0 h-auto"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${mfaEnabled ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
              {mfaEnabled ? <ShieldCheck className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-medium text-text-primary">
                  Two-Factor Authentication
                </h3>
                {mfaEnabled && (
                  <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full font-medium">
                    Enabled
                  </span>
                )}
              </div>
              <p className="text-text-tertiary text-sm mb-4">
                {mfaEnabled
                  ? "Your account is protected with an extra layer of security."
                  : "Add an extra layer of security to protect your account."}
              </p>
              <Button
                variant="link"
                onClick={() => setShowMFAModal(true)}
                className={`text-sm font-medium px-0 h-auto ${mfaEnabled ? "text-success hover:text-success/80" : "text-primary hover:text-primary/80"} hover:underline`}
              >
                {mfaEnabled ? "Manage 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-text-primary mb-1">
                Active Sessions
              </h3>
              <p className="text-text-tertiary text-sm mb-4">
                Devices currently logged into your account.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/40 backdrop-blur-sm rounded-lg border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Current Session
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Just now •{" "}
                        {typeof navigator !== "undefined"
                          ? navigator.platform
                          : "Unknown Device"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary font-mono">
                    THIS DEVICE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordModal(false);
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowPasswordModal(false);
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
        >
          <div className="bg-background/70 backdrop-blur-xl rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 id="password-modal-title" className="text-lg font-bold mb-4">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Current Password
                </label>
                <Input id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target?.value,
                    })
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  New Password
                </label>
                <Input id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target?.value,
                    })
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  required
                  minLength={8}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  At least 8 characters
                </p>
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold text-text-tertiary mb-1"
                >
                  Confirm New Password
                </label>
                <Input id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target?.value,
                    })
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={changingPassword}
                  className="text-text-tertiary font-medium text-sm hover:text-text-primary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-primary text-text-inverse px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2"
                >
                  {changingPassword && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MFA Setup Modal */}
      <MFASetupModal
        isOpen={showMFAModal}
        onClose={() => setShowMFAModal(false)}
        onEnabled={handleMFAEnabled}
      />
    </div>
  );
}
