// @ts-nocheck
"use client";

import React, { useState, Suspense } from "react";
import { logger } from "@vayva/shared";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Icon, Input, Label } from "@vayva/ui";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) },
    { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.resetPassword({ token, password });
      router.push("/signin?reset=success");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[RESET_PASSWORD_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(_errMsg || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SplitAuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired"
        showSignInLink
        leftVariant="support"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="AlertCircle" className="w-8 h-8 text-red-600" />
          </div>
          <Link href="/forgot-password">
            <Button variant="primary" className="w-full rounded-xl h-12">
              Request new link
            </Button>
          </Link>
        </div>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account"
      showSignInLink
      leftVariant="support"
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon name="Lock" className="w-8 h-8 text-gray-900" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {error && <p role="alert">{error}</p>}
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target?.value)
              }
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black h-8 w-8"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon
                name={showPassword ? "EyeOff" : "Eye"}
                className="w-5 h-5"
              />
            </Button>
          </div>
          {/* Visible password requirements */}
          <div className="mt-2 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Password must contain:</p>
            <ul className="space-y-1">
              {requirements.map((req) => {
                const isMet = password ? req.test(password) : false;
                return (
                  <li key={req.label} className="text-xs flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${isMet ? "bg-status-success text-white" : "bg-white/40 text-gray-400"}`}>
                      {isMet ? "✓" : "•"}
                    </span>
                    <span className={isMet ? "text-status-success" : "text-gray-400"}>
                      {req.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <PasswordStrengthIndicator password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target?.value)
              }
              required
              aria-describedby={confirmPassword && password !== confirmPassword ? "password-match-error" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black h-8 w-8"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              <Icon
                name={showConfirmPassword ? "EyeOff" : "Eye"}
                className="w-5 h-5"
              />
            </Button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p id="password-match-error" className="text-xs text-red-600 mt-1" role="alert">
              Passwords do not match
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-xl h-12"
          disabled={loading || password !== confirmPassword || !password}
        >
          {loading ? (
            <>
              <Icon name="Loader2" className="w-5 h-5 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="text-sm text-gray-900 hover:text-black font-medium transition-colors inline-flex items-center gap-1"
        >
          <Icon name="ArrowLeft" className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </SplitAuthLayout>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <SplitAuthLayout
          title="Reset Password"
          subtitle="Please wait"
          showSignInLink
          leftVariant="support"
        >
          <div className="flex justify-center py-12">
            <Icon
              name="Loader2"
              className="w-8 h-8 animate-spin text-gray-400"
            />
          </div>
        </SplitAuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
