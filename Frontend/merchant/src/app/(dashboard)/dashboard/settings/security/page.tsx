// @ts-nocheck
"use client";

import React, { useState } from "react";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { Shield, ShieldCheck, Smartphone, LockKey, Key, DeviceMobile as MobileDevice } from "@phosphor-icons/react";
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
      logger.error("[PASSWORD_CHANGE_ERROR]", { error: _errMsg });
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleMFAEnabled = () => {
    setMfaEnabled(true);
    setShowMFAModal(false);
    toast.success("Two-factor authentication enabled");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <BackButton href="/dashboard/settings" />
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/dashboard/settings" },
            { label: "Security" },
          ]}
        />
        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Security Settings
          </h1>
          <p className="text-gray-500">
            Manage your password and authentication settings.
          </p>
        </div>
      </div>

      {/* Summary Widget */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Shield size={32} weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Account Security</h2>
            <p className="text-sm text-gray-500">Protect your account with strong security measures</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                mfaEnabled ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
              }`}>
                {mfaEnabled ? '2FA Enabled' : '2FA Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <LockKey size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Password</h3>
              <p className="text-sm text-gray-500 mb-4">
                Update your password regularly to keep your account secure.
              </p>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="border-green-200 text-green-600 hover:bg-green-50"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              {mfaEnabled ? (
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck size={20} />
                  <span className="font-medium">Two-factor authentication is enabled</span>
                </div>
              ) : (
                <Button
                  onClick={() => setShowMFAModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Enable Two-Factor Authentication
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Sessions Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MobileDevice size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Active Sessions</h3>
              <p className="text-sm text-gray-500 mb-4">
                Manage your active sessions and logged-in devices.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Current Device</div>
                      <div className="text-xs text-gray-500">Last active: Now</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                    Active
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
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: (e.target as HTMLInputElement).value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: (e.target as HTMLInputElement).value,
                    })
                  }
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: (e.target as HTMLInputElement).value,
                    })
                  }
                  required
                  minLength={8}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 bg-vayva-green text-white hover:bg-vayva-green/90"
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Change Password"
                  )}
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
