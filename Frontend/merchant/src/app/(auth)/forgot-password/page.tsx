"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";
import { logger } from "@vayva/shared";
import { Button, Input, Label } from "@vayva/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // RFC 5322 compliant email validation
  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value)) {
      return "Enter a valid email address";
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.forgotPassword({ email });
      setSuccess(true);
    } catch {
      // Account enumeration protection: Always show success message
      // regardless of whether the email exists in our system.
      // This prevents attackers from discovering valid email addresses.
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you instructions."
      showSignInLink
      leftVariant="support"
    >
      {success ? (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-1">
                  Check your email
                </h3>
                <p className="text-sm text-green-700">
                  We've sent password reset instructions to{" "}
                  <strong>{email}</strong>. Please check your inbox and follow
                  the link to reset your password.
                </p>
                <p className="text-xs text-green-600 mt-3">
                  Didn't receive it? Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Live region for screen readers */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {error && <p role="alert">{error}</p>}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target?.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={() => {
                const err = validateEmail(email);
                if (err) setEmailError(err);
              }}
              required
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className={emailError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}
            />
            {emailError && (
              <p id="email-error" className="text-xs text-red-600 mt-1" role="alert">
                {emailError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-12"
          >
            Send reset instructions
          </Button>

          {/* Back to Sign In */}
          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-gray-500 hover:text-black font-medium transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </form>
      )}
    </SplitAuthLayout>
  );
}
