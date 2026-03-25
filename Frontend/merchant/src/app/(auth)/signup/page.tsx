"use client";
import React, { useState } from "react";
import { logger } from "@vayva/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";
import { SplitAuthLayout } from "@/components/auth/SplitAuthLayout";
import { Button, Input, Label } from "@vayva/ui";
import { Eye, EyeSlash as EyeOff } from "@phosphor-icons/react/ssr";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Generate store slug from business name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateSlug = (value: string) => {
    if (!value) return "Store URL is required";
    if (value.length < 3) return "Must be at least 3 characters";
    if (!/^[a-z0-9-]+$/.test(value)) return "Only lowercase letters, numbers, and hyphens allowed";
    return undefined;
  };

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
    if (!agreedToTerms) {
      setError("Please agree to the Terms, Privacy Policy, and EULA.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const slugError = validateSlug(storeSlug);
    if (slugError) {
      setSlugError(slugError);
      return;
    }
    setLoading(true);
    setError(null);
    setSlugError(null);
    try {
      await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        storeName: businessName,
        storeSlug,
      });
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SIGNUP_ERROR]", { error: _errMsg, app: "merchant" });
      setError(_errMsg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout
      title="Welcome to Vayva Merchant"
      subtitle="Create your account to start taking orders, tracking payments, and staying on top of your business."
      showSignInLink
      leftVariant="signup"
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target?.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target?.value)
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            placeholder="Your Business Name"
            value={businessName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBusinessName(e.target?.value);
              if (!storeSlug) {
                setStoreSlug(generateSlug(e.target?.value));
              }
            }}
            required
            data-testid="auth-signup-business-name"
          />
          <p className="text-xs text-gray-400">
            The official name of your business
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeSlug">
            Your storefront URL
            <span className="text-gray-400 font-normal ml-1">
              (yourstore.vayva.ng)
            </span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="storeSlug"
              type="text"
              placeholder="yourstore"
              value={storeSlug}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setStoreSlug(e.target?.value);
                if (slugError) setSlugError(null);
              }}
              onBlur={() => {
                const err = validateSlug(storeSlug);
                if (err) setSlugError(err);
              }}
              required
              data-testid="auth-signup-store-slug"
              aria-invalid={!!slugError}
              aria-describedby={slugError ? "slug-error" : undefined}
              className={slugError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">
              .vayva.ng
            </span>
          </div>
          {slugError && (
            <p id="slug-error" className="text-xs text-red-600 mt-1" role="alert">
              {slugError}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Your unique storefront address - customers will visit this URL
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Business email</Label>
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
            data-testid="auth-signup-email"
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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
              data-testid="auth-signup-password"
              aria-describedby="password-strength"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-8 w-8"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div id="password-strength">
            <PasswordStrengthIndicator password={password} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
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
              aria-describedby="password-match-error"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-8 w-8"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p
              id="password-match-error"
              className="text-xs text-red-600 mt-1"
              role="alert"
            >
              Passwords do not match
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Input
            id="terms-agreement"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAgreedToTerms(e.target?.checked)
            }
            className="w-5 h-5 mt-0.5 rounded border-gray-100 text-green-500 focus:ring-green-500 cursor-pointer"
          />
          <label htmlFor="terms-agreement" className="text-sm text-gray-500 cursor-pointer">
            By creating an account, you agree to our{" "}
            <Link
              href="/legal/terms"
              target="_blank"
              className="text-gray-900 font-medium underline"
            >
              Terms
            </Link>
            ,{" "}
            <Link
              href="/legal/privacy"
              target="_blank"
              className="text-gray-900 font-medium underline"
            >
              Privacy
            </Link>
            , and{" "}
            <Link
              href="/legal/eula"
              target="_blank"
              className="text-gray-900 font-medium underline"
            >
              EULA
            </Link>
            .
          </label>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-12"
          data-testid="auth-signup-submit"
        >
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-gray-900 font-semibold transition-colors"
        >
          Sign in
        </Link>
      </div>
    </SplitAuthLayout>
  );
}
