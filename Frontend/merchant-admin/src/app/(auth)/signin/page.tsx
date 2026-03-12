"use client";

import React, { useState } from "react";
import { logger, urls } from "@vayva/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";
import { Button, Input, Label } from "@vayva/ui";
import { Eye, EyeSlash as EyeOff, Envelope, ChatCircle } from "@phosphor-icons/react/ssr";
import type { User, MerchantContext } from "@vayva/shared/types";

interface LoginResponse {
  token: string;
  user: User;
  merchant?: MerchantContext | null;
  requiresOTP?: boolean;
  otpMethod?: string;
  maskedPhone?: string;
}

type OTPMethod = "EMAIL" | "WHATSAPP";

export default function SigninPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [otpMethod, setOtpMethod] = useState<OTPMethod>("EMAIL");

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    // RFC 5322 compliant simplified regex - accepts subdomains and more valid formats
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
      const data = await AuthService.login({
        email,
        password,
        otpMethod,
      }) as unknown as LoginResponse;
      
      if (data.requiresOTP) {
        const queryParams = new URLSearchParams();
        queryParams.set("email", email);
        queryParams.set("method", data.otpMethod || otpMethod);
        if (data.maskedPhone) {
          queryParams.set("maskedPhone", data.maskedPhone);
        }
        router.push(`/verify?${queryParams.toString()}`);
        return;
      }
      
      login(data.token, data.user, data.merchant || null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Incorrect email or password";
      if (message === "EMAIL_NOT_VERIFIED" || message === "OTP_REQUIRED") {
        const queryParams = new URLSearchParams();
        queryParams.set("email", email);
        queryParams.set("method", otpMethod);
        router.push(`/verify?${queryParams.toString()}`);
        return;
      }
      // Handle rate limiting specifically
      if (message.includes("RATE_LIMIT") || message.includes("Too many")) {
        setError("Too many login attempts. Please wait a few minutes before trying again.");
      } else if (message.includes("NETWORK_ERROR") || message.includes("Failed to fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        logger.error("Login error", { error: message, app: "merchant" });
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      title="Welcome back"
      subtitle="Sign in to your Merchant Dashboard"
      showSignUpLink
      leftVariant="signin"
    >
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

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@business.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target?.value);
              if (fieldErrors.email)
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() => {
              const err = validateEmail(email);
              if (err) setFieldErrors((prev) => ({ ...prev, email: err }));
            }}
            className={
              fieldErrors.email
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : ""
            }
            required
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            data-testid="auth-signin-email"
          />
          {fieldErrors.email && (
            <p
              id="email-error"
              className="text-xs text-red-600 mt-1"
              role="alert"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Receive OTP via</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOtpMethod("EMAIL")}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                otpMethod === "EMAIL"
                  ? "border-black bg-black/5"
                  : "border-studio-border hover:border-black/30"
              }`}
            >
              <Envelope className={`w-5 h-5 ${otpMethod === "EMAIL" ? "text-black" : "text-text-tertiary"}`} />
              <span className={`text-sm font-medium ${otpMethod === "EMAIL" ? "text-black" : "text-text-secondary"}`}>
                Email
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOtpMethod("WHATSAPP")}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                otpMethod === "WHATSAPP"
                  ? "border-black bg-black/5"
                  : "border-studio-border hover:border-black/30"
              }`}
            >
              <ChatCircle className={`w-5 h-5 ${otpMethod === "WHATSAPP" ? "text-black" : "text-text-tertiary"}`} />
              <span className={`text-sm font-medium ${otpMethod === "WHATSAPP" ? "text-black" : "text-text-secondary"}`}>
                WhatsApp
              </span>
            </button>
          </div>
          <p className="text-xs text-text-tertiary">
            {otpMethod === "EMAIL"
              ? "We'll send the verification code to your email"
              : "We'll send the verification code to your registered WhatsApp number"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target?.value)
              }
              required
              data-testid="auth-signin-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors h-8 w-8 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <label
              htmlFor="remember-me"
              className="flex items-center gap-3 rounded-2xl border border-studio-border bg-white/80 px-3 py-2 cursor-pointer group"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRememberMe(e.target?.checked)
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-12"
          data-testid="auth-signin-submit"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        New here?{" "}
        <Link
          href="/signup"
          className="text-text-primary hover:text-black font-semibold transition-colors"
        >
          Create an account
        </Link>
        <div className="mt-2">
          <a
            href={`${urls.marketingBase()}/help`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Having trouble?
          </a>
        </div>
      </div>
    </SplitAuthLayout>
  );
}
